// Test-only helpers for the HTTP layer: an in-memory blob store and tenant setup.
import { randomUUID } from "node:crypto";
import { assetPrefix } from "../../lib/portal/data/ingest";
import { forStaff } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import {
  parseContentRange,
  type BlobReadResult,
  type BlobStore,
  type ByteRange,
} from "../../lib/portal/blob";
import { testOnlyStaffPrincipal } from "../portal/helpers";

export type FakeStore = BlobStore & {
  readonly files: Map<string, { body: Uint8Array; contentType: string }>;
  reads: { pathname: string; range: ByteRange | undefined }[];
  /** Behaviour of read() when a range is requested. */
  mode: "honour" | "ignore" | "wrong-range";
};

function streamOf(bytes: Uint8Array, chunk = 64): ReadableStream<Uint8Array> {
  let i = 0;
  return new ReadableStream<Uint8Array>({
    pull(c) {
      if (i >= bytes.length) return c.close();
      c.enqueue(bytes.subarray(i, i + chunk));
      i += chunk;
    },
  });
}

export function fakeBlobStore(): FakeStore {
  const files = new Map<string, { body: Uint8Array; contentType: string }>();
  const store: FakeStore = {
    files,
    reads: [],
    mode: "honour",
    async put(pathname, body, opts) {
      if (files.has(pathname)) throw new Error("blob already exists");
      const bytes =
        typeof body === "string" ? new TextEncoder().encode(body) : new Uint8Array(await new Response(body as BodyInit).arrayBuffer());
      files.set(pathname, { body: bytes, contentType: opts.contentType });
    },
    async del(pathname) {
      files.delete(pathname);
    },
    async head(pathname) {
      const f = files.get(pathname);
      return f === undefined ? null : { size: f.body.length, contentType: f.contentType };
    },
    async read(pathname, range): Promise<BlobReadResult | null> {
      store.reads.push({ pathname, range });
      const f = files.get(pathname);
      if (f === undefined) return null;
      if (range === undefined || store.mode === "ignore") {
        return { stream: streamOf(f.body), servedRange: null };
      }
      if (store.mode === "wrong-range") {
        const other = { start: range.start + 1, end: range.end };
        return { stream: streamOf(f.body.subarray(other.start, other.end + 1)), servedRange: other };
      }
      return {
        stream: streamOf(f.body.subarray(range.start, range.end + 1)),
        servedRange: parseContentRange(`bytes ${range.start}-${range.end}/${f.body.length}`),
      };
    },
  };
  return store;
}

export async function readAll(res: Response): Promise<Uint8Array> {
  return new Uint8Array(await res.arrayBuffer());
}

/** Deterministic non-repeating-ish content so a wrong slice is detected. */
export function pattern(n: number): Uint8Array {
  const b = new Uint8Array(n);
  for (let i = 0; i < n; i++) b[i] = (i * 7 + (i >> 8)) % 251;
  return b;
}

export type Tenant = { slug: string; orgId: string };

export async function createTenant(
  db: PortalDb,
  adminId: string,
  programSlug: string,
  label: string,
): Promise<Tenant> {
  const staff = forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);
  const slug = `${label}-${randomUUID().slice(0, 8)}`;
  const org = await staff.createOrg({ slug, name: `Org ${slug}` });
  if (!org.ok) throw new Error("createOrg failed");
  const eng = await staff.createEngagement({ orgId: org.orgId, programSlug, startsOn: "2026-12-01" });
  if (eng === null || !eng.ok) throw new Error("createEngagement failed");
  return { slug, orgId: org.orgId };
}

export { assetPrefix };
