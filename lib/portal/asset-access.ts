import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { AssetFileDto } from "./data/dto";
import { portalIngestToken } from "./env";

// Who may touch portal files and the ingest API. The two seams below default to the real
// session principal; tests replace them with fakes. Outside a request (no cookie store)
// the defaults throw, which is a loud 500, never a silent "authenticated".

// ── Seam 1: which asset may this request read ───────────────────────────────

export type AssetResolution = AssetFileDto | null | "unauthenticated";

/**
 * Resolve an asset id for the CURRENT request (session cookie -> principal -> DAL).
 *   "unauthenticated"  no valid session            -> route answers 401
 *   null               unknown, malformed, or not this principal's (incl. other org,
 *                      unpublished) -> route answers 404 with the same body for all
 *   AssetFileDto       readable by the caller
 *
 * Connected to the session principal. The imports are lazy so this module still loads
 * under the plain-node test runner, where tests inject fakes with setAccessForTests.
 */
async function sessionAssetResolver(assetId: string): Promise<AssetResolution> {
  const { optionalPrincipal } = await import("./principal");
  const who = await optionalPrincipal();
  if (who === null) return "unauthenticated";
  if (who.kind === "client") {
    const { forClient } = await import("./data/client");
    return forClient(who.principal).asset(assetId);
  }
  const { forStaff } = await import("./data/staff");
  return forStaff(who.principal).asset(assetId);
}

let assetResolver: (assetId: string) => Promise<AssetResolution> = sessionAssetResolver;

export function resolveAssetForRequest(assetId: string): Promise<AssetResolution> {
  return assetResolver(assetId);
}

// ── Seam 2: may this request (no ingest bearer) request an upload token ─────

export type StaffUploadAuth = "authorized" | "unauthenticated" | "forbidden";

/**
 * Staff-session path for the upload route (coach or admin in the editor).
 *
 * A client session is "forbidden"; coach or admin is "authorized".
 */
async function sessionStaffUploadAuth(request: Request): Promise<StaffUploadAuth> {
  void request;
  const { optionalPrincipal } = await import("./principal");
  const who = await optionalPrincipal();
  if (who === null) return "unauthenticated";
  return who.kind === "staff" ? "authorized" : "forbidden";
}

let staffUploadAuth: (request: Request) => Promise<StaffUploadAuth> = sessionStaffUploadAuth;

export function authorizeStaffUpload(request: Request): Promise<StaffUploadAuth> {
  return staffUploadAuth(request);
}

/** Test seams: inject fakes, or call with no argument to restore the throwing defaults. */
export function setAccessForTests(fakes?: {
  assetResolver?: (assetId: string) => Promise<AssetResolution>;
  staffUploadAuth?: (request: Request) => Promise<StaffUploadAuth>;
}): void {
  assetResolver = fakes?.assetResolver ?? sessionAssetResolver;
  staffUploadAuth = fakes?.staffUploadAuth ?? sessionStaffUploadAuth;
}

// ── Ingest bearer ───────────────────────────────────────────────────────────

export type BearerCheck = "ok" | "unauthenticated" | "not_configured";

const sha256 = (s: string) => createHash("sha256").update(s).digest();

/**
 * Compare the request's `Authorization: Bearer <token>` with PORTAL_INGEST_TOKEN.
 * Both sides are hashed first so the comparison is constant-time over fixed-length
 * digests whatever the input length. A missing env var is "not_configured" (503), never
 * "ok": an unset token must not turn into "any token works".
 */
export function checkIngestBearer(request: Request): BearerCheck {
  let expected: string;
  try {
    expected = portalIngestToken();
  } catch {
    return "not_configured";
  }
  const header = request.headers.get("authorization");
  if (header === null) return "unauthenticated";
  const m = /^Bearer\s+(\S+)$/i.exec(header.trim());
  if (m === null || m[1] === undefined) return "unauthenticated";
  return timingSafeEqual(sha256(m[1]), sha256(expected)) ? "ok" : "unauthenticated";
}
