import "server-only";
import { resolveAssetForRequest } from "@/lib/portal/asset-access";
import { getBlobStore, openBlob, parseRangeHeader } from "@/lib/portal/blob";
import type { AssetFileDto } from "@/lib/portal/data/dto";

// Authenticated streaming of one portal file. The browser never sees a blob URL: bytes
// come from the private store through this route, after the session is resolved to a
// principal that owns the asset. Unknown, malformed, other-org and unpublished ids all
// get the identical 404 body.

const SECURITY_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
} as const;

function json(status: number, body: Record<string, string>): Response {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

const unauthenticated = () => json(401, { error: "unauthenticated" });
const notFound = () => json(404, { error: "not_found" });

/** Header-safe download name: the last pathname segment reduced to [A-Za-z0-9._-]. */
function safeFilename(asset: Pick<AssetFileDto, "id" | "blobPathname">): string {
  const last = asset.blobPathname.split("/").pop() ?? "";
  const cleaned = last
    .replace(/[^A-Za-z0-9._-]+/g, "_")
    .replace(/^[._]+/, "")
    .slice(0, 100);
  return cleaned === "" ? `asset-${asset.id.slice(0, 8)}` : cleaned;
}

async function serve(
  request: Request,
  ctx: { params: Promise<{ assetId: string }> },
  headOnly: boolean,
): Promise<Response> {
  const { assetId } = await ctx.params;
  const asset = await resolveAssetForRequest(assetId);
  if (asset === "unauthenticated") return unauthenticated();
  if (asset === null) return notFound();

  const parsed = parseRangeHeader(request.headers.get("range"), asset.bytes);
  if (parsed.kind === "unsatisfiable") {
    return new Response(null, {
      status: 416,
      headers: { ...SECURITY_HEADERS, "Content-Range": `bytes */${asset.bytes}` },
    });
  }

  const headers = new Headers(SECURITY_HEADERS);
  headers.set("Content-Type", asset.contentType); // from the asset row, never from the request
  headers.set("Content-Disposition", `inline; filename="${safeFilename(asset)}"`);
  headers.set("Accept-Ranges", "bytes");

  const range = parsed.kind === "range" ? parsed.range : undefined;
  let status = 200;
  if (range !== undefined) {
    status = 206;
    headers.set("Content-Range", `bytes ${range.start}-${range.end}/${asset.bytes}`);
    headers.set("Content-Length", String(range.end - range.start + 1));
  } else {
    headers.set("Content-Length", String(asset.bytes));
  }

  if (headOnly) return new Response(null, { status, headers });

  const stream = await openBlob(getBlobStore(), asset.blobPathname, range);
  if (stream === null) {
    // The row exists but its blob does not: a storage inconsistency, not "not yours".
    console.error(`[portal] asset ${asset.id} has no blob in the store`);
    return json(502, { error: "storage_unavailable" });
  }
  return new Response(stream, { status, headers });
}

export function GET(request: Request, ctx: { params: Promise<{ assetId: string }> }) {
  return serve(request, ctx, false);
}

export function HEAD(request: Request, ctx: { params: Promise<{ assetId: string }> }) {
  return serve(request, ctx, true);
}
