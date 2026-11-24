import "server-only";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { z } from "zod";
import { authorizeStaffUpload, checkIngestBearer } from "@/lib/portal/asset-access";
import { ASSET_KIND_LIST, ASSET_KINDS } from "@/lib/portal/asset-kinds";
import { assetPrefix, isInsidePrefix } from "@/lib/portal/data/ingest";
import { portalBlobReadWriteToken } from "@/lib/portal/env";

// Token exchange for direct-to-Blob uploads: the file body goes from the caller straight
// to the private store (a function body is limited to ~4.5 MB), this route only decides
// whether to hand out a short-lived client token and for what exactly.
//
// Auth: the ingest bearer (PORTAL_INGEST_TOKEN) or, behind authorizeStaffUpload (a TODO
// seam until the principal code lands), a staff session. The blob "upload completed"
// callback is NOT accepted: no callbackUrl is ever put in a token, so no unauthenticated
// request can reach this handler.

const SECURITY_HEADERS = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

const clientPayloadSchema = z
  .object({
    orgId: z.uuid(),
    sessionNumber: z.number().int().min(1).max(999),
    kind: z.enum(ASSET_KIND_LIST),
    contentType: z.string().min(1).max(100),
    bytes: z.number().int().positive(),
  })
  .strict();

class UploadRefusal extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    detail?: string,
  ) {
    super(detail ?? code);
    this.name = "UploadRefusal";
  }
}

/** Everything a token is allowed to do, decided from server-side facts only. */
function tokenFor(pathname: string, clientPayload: string | null) {
  if (clientPayload === null) throw new UploadRefusal(400, "client_payload_required");
  let raw: unknown;
  try {
    raw = JSON.parse(clientPayload);
  } catch {
    throw new UploadRefusal(400, "client_payload_not_json");
  }
  const parsed = clientPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    throw new UploadRefusal(400, "client_payload_invalid", issue?.message);
  }
  const p = parsed.data;

  // The prefix comes from the server's own function; the caller's pathname must sit inside it.
  const prefix = assetPrefix(p.orgId, p.sessionNumber);
  if (!isInsidePrefix(pathname, prefix)) throw new UploadRefusal(400, "pathname_outside_prefix");

  const spec = ASSET_KINDS[p.kind];
  if (!spec.accept.includes(p.contentType)) {
    throw new UploadRefusal(415, "content_type_not_allowed", `${p.kind} accepts ${spec.accept.join(", ")}`);
  }
  if (p.bytes > spec.maxBytes) {
    throw new UploadRefusal(413, "too_large", `${p.kind} is limited to ${spec.maxBytes} bytes`);
  }

  return {
    allowedContentTypes: [p.contentType],
    maximumSizeInBytes: p.bytes,
    addRandomSuffix: false,
    allowOverwrite: false,
    validUntil: Date.now() + 15 * 60 * 1000,
    tokenPayload: null,
  };
}

export async function POST(request: Request): Promise<Response> {
  // 1. Auth, before the body is even read.
  if (request.headers.has("authorization")) {
    const bearer = checkIngestBearer(request);
    if (bearer === "not_configured") return json(503, { error: "ingest_not_configured" });
    if (bearer !== "ok") return json(401, { error: "unauthenticated" });
  } else {
    const staff = await authorizeStaffUpload(request);
    if (staff === "unauthenticated") return json(401, { error: "unauthenticated" });
    if (staff === "forbidden") return json(403, { error: "forbidden" });
  }

  // 2. Body: only the token-request event is served.
  let body: HandleUploadBody;
  try {
    body = (await request.json()) as HandleUploadBody;
  } catch {
    return json(400, { error: "invalid_json" });
  }
  if (typeof body !== "object" || body === null || body.type !== "blob.generate-client-token") {
    return json(400, { error: "unsupported_event" });
  }

  // 3. The token.
  let token: string;
  try {
    token = portalBlobReadWriteToken();
  } catch {
    return json(503, { error: "blob_not_configured" });
  }
  try {
    const result = await handleUpload({
      token,
      request,
      body,
      onBeforeGenerateToken: async (pathname, clientPayload) => tokenFor(pathname, clientPayload),
    });
    return Response.json(result, { headers: SECURITY_HEADERS });
  } catch (e) {
    if (e instanceof UploadRefusal) return json(e.status, { error: e.code, detail: e.message });
    throw e;
  }
}
