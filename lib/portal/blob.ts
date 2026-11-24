import "server-only";
import { del, get, head, put } from "@vercel/blob";
import { portalBlobReadWriteToken } from "./env";

// Private Vercel Blob store for portal files, addressed by pathname only.
//
// RANGE ON PRIVATE BLOBS: what could and could not be confirmed.
//  - Confirmed by reading the installed @vercel/blob 2.9.0 source (dist/index.js `get`):
//    the SDK has NO ranged-read option. `get()` does one authenticated fetch of the blob
//    URL and returns the body stream plus the raw response headers. It does expose a
//    `headers` escape hatch ("applied last"), so a `Range` header can be sent through it.
//  - NOT confirmed (no network calls are allowed in this ticket): that the private store
//    honours Range and answers 206 + Content-Range. The SDK also reports `statusCode: 200`
//    for every successful body, so 206 cannot be detected from the status.
//  - Therefore this module never trusts the store to have honoured Range. It sends the
//    Range header, then looks at the `Content-Range` response header: present and equal to
//    what was asked -> use the body as is; absent -> the store ignored Range and returned
//    the whole blob, so the bytes are cut here; anything else -> throw (never serve wrong
//    bytes). The first real private upload must be probed once to learn which branch runs.
//
// The store is injectable (`setBlobStoreForTests`) so tests use an in-memory fake.

/** Inclusive byte range, like HTTP `bytes=start-end`. */
export type ByteRange = { readonly start: number; readonly end: number };

export type BlobReadResult = {
  readonly stream: ReadableStream<Uint8Array>;
  /** The inclusive range the stream covers when the store reports one; null = the whole blob. */
  readonly servedRange: ByteRange | null;
};

export interface BlobStore {
  put(
    pathname: string,
    body: Blob | Buffer | string,
    opts: { contentType: string },
  ): Promise<void>;
  del(pathname: string): Promise<void>;
  head(pathname: string): Promise<{ readonly size: number; readonly contentType: string } | null>;
  /** null when the blob does not exist. `range` is a request, the store may ignore it. */
  read(pathname: string, range?: ByteRange): Promise<BlobReadResult | null>;
}

export class BlobRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BlobRangeError";
  }
}

// ── Range header parsing ────────────────────────────────────────────────────

export type RangeParse =
  /** No usable Range header: serve the whole body (malformed or multi-range headers are ignored, RFC 9110). */
  | { readonly kind: "none" }
  | { readonly kind: "range"; readonly range: ByteRange }
  | { readonly kind: "unsatisfiable" };

export function parseRangeHeader(header: string | null, size: number): RangeParse {
  if (header === null) return { kind: "none" };
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (m === null) return { kind: "none" };
  const [, a = "", b = ""] = m;
  if (a === "" && b === "") return { kind: "none" };
  if (a === "") {
    // suffix range: the last n bytes
    const n = Number(b);
    if (!Number.isSafeInteger(n) || n === 0 || size === 0) return { kind: "unsatisfiable" };
    return { kind: "range", range: { start: Math.max(0, size - n), end: size - 1 } };
  }
  const start = Number(a);
  if (!Number.isSafeInteger(start)) return { kind: "none" };
  if (b !== "") {
    const end = Number(b);
    if (!Number.isSafeInteger(end) || end < start) return { kind: "none" };
    if (start >= size) return { kind: "unsatisfiable" };
    return { kind: "range", range: { start, end: Math.min(end, size - 1) } };
  }
  if (start >= size) return { kind: "unsatisfiable" };
  return { kind: "range", range: { start, end: size - 1 } };
}

export function parseContentRange(header: string | null): ByteRange | null {
  if (header === null) return null;
  const m = /^bytes (\d+)-(\d+)\/(\d+|\*)$/.exec(header.trim());
  if (m === null) return null;
  return { start: Number(m[1]), end: Number(m[2]) };
}

// ── Streaming helpers ───────────────────────────────────────────────────────

/** Bytes [start, end] (inclusive) of `source`; the source is cancelled once the range is complete. */
export function sliceStream(
  source: ReadableStream<Uint8Array>,
  range: ByteRange,
): ReadableStream<Uint8Array> {
  const reader = source.getReader();
  let offset = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) {
          controller.close();
          return;
        }
        const chunkStart = offset;
        const chunkEnd = offset + value.byteLength - 1;
        offset += value.byteLength;
        if (chunkEnd < range.start) continue;
        const from = Math.max(range.start, chunkStart) - chunkStart;
        const to = Math.min(range.end, chunkEnd) - chunkStart;
        controller.enqueue(value.subarray(from, to + 1));
        if (chunkEnd >= range.end) {
          await reader.cancel();
          controller.close();
        }
        return;
      }
    },
    async cancel(reason) {
      await reader.cancel(reason);
    },
  });
}

/**
 * Open a blob (or a byte range of it) from the store. When a range is requested the
 * returned stream covers EXACTLY that range, whatever the store did with the Range header.
 * Returns null when the blob does not exist.
 */
export async function openBlob(
  store: BlobStore,
  pathname: string,
  range?: ByteRange,
): Promise<ReadableStream<Uint8Array> | null> {
  const res = await store.read(pathname, range);
  if (res === null) return null;
  if (range === undefined) {
    if (res.servedRange !== null) {
      throw new BlobRangeError("store returned a partial body for a full read");
    }
    return res.stream;
  }
  if (res.servedRange === null) return sliceStream(res.stream, range);
  if (res.servedRange.start !== range.start || res.servedRange.end !== range.end) {
    await res.stream.cancel();
    throw new BlobRangeError("store served a different range than requested");
  }
  return res.stream;
}

// ── Vercel Blob adapter ─────────────────────────────────────────────────────

export function createVercelBlobStore(token: string): BlobStore {
  return {
    async put(pathname, body, opts) {
      await put(pathname, body, {
        access: "private",
        token,
        contentType: opts.contentType,
        addRandomSuffix: false,
        allowOverwrite: false,
      });
    },
    async del(pathname) {
      await del(pathname, { token });
    },
    async head(pathname) {
      try {
        const h = await head(pathname, { token });
        return { size: h.size, contentType: h.contentType };
      } catch (e) {
        if (e instanceof Error && e.name === "BlobNotFoundError") return null;
        throw e;
      }
    },
    async read(pathname, range) {
      const res = await get(pathname, {
        access: "private",
        token,
        useCache: false,
        headers: range === undefined ? undefined : { Range: `bytes=${range.start}-${range.end}` },
      });
      if (res === null || res.stream === null) return null;
      return { stream: res.stream, servedRange: parseContentRange(res.headers.get("content-range")) };
    },
  };
}

let cached: BlobStore | null = null;

/** The portal's private store; throws by name when PORTAL_BLOB_READ_WRITE_TOKEN is unset. */
export function getBlobStore(): BlobStore {
  if (cached === null) cached = createVercelBlobStore(portalBlobReadWriteToken());
  return cached;
}

/** Test seam: inject an in-memory store, or pass null to reset. */
export function setBlobStoreForTests(store: BlobStore | null): void {
  cached = store;
}
