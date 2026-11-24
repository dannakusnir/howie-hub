import "server-only";
import { checkIngestBearer } from "@/lib/portal/asset-access";
import { getBlobStore } from "@/lib/portal/blob";
import { forIngest, type IngestRefusal } from "@/lib/portal/data/ingest";
import { ingestPayloadSchema } from "@/lib/portal/ingest-schema";

// POST /api/portal/ingest/session: the automation's only door into the portal. It creates
// or updates a DRAFT. There is no code path in this file (or in forIngest) that publishes;
// Howie publishes from the coach screen.

const SECURITY_HEADERS = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };

function json(status: number, body: Record<string, unknown>): Response {
  return Response.json(body, { status, headers: SECURITY_HEADERS });
}

function refusalResponse(r: IngestRefusal): Response {
  switch (r.reason) {
    case "unknown_org":
    case "unknown_program":
    case "no_engagement":
      return json(404, { error: r.reason });
    case "already_published":
    case "human_edited":
      return json(409, { error: r.reason });
    case "number_out_of_range":
      return json(422, { error: r.reason, max: r.max });
    case "asset_outside_prefix":
    case "asset_pathname_duplicate":
    case "asset_pathname_in_use":
      return json(422, { error: r.reason, pathnames: r.pathnames });
  }
}

export async function POST(request: Request): Promise<Response> {
  const bearer = checkIngestBearer(request);
  if (bearer === "not_configured") return json(503, { error: "ingest_not_configured" });
  if (bearer !== "ok") return json(401, { error: "unauthenticated" });

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return json(400, { error: "invalid_json" });
  }

  const parsed = ingestPayloadSchema.safeParse(raw);
  if (!parsed.success) {
    return json(400, {
      error: "invalid_body",
      issues: parsed.error.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        // For an unknown key zod lists the key names; surface them verbatim.
        ...("keys" in i && Array.isArray(i.keys) ? { keys: i.keys } : {}),
      })),
    });
  }

  const outcome = await forIngest().upsertDraft(parsed.data);
  if (!outcome.ok) return refusalResponse(outcome.refusal);

  // Blobs the draft no longer references. Best effort: the draft is already saved, so a
  // failed cleanup is logged (pathnames only) and never turns a success into an error.
  for (const pathname of outcome.orphanedPathnames) {
    try {
      await getBlobStore().del(pathname);
    } catch (e) {
      console.error(`[portal-ingest] orphan delete failed for ${pathname}: ${e instanceof Error ? e.name : "error"}`);
    }
  }

  const origin = new URL(request.url).origin;
  return json(200, {
    sessionId: outcome.sessionId,
    status: "draft",
    result: outcome.result,
    editUrl: `${origin}/portal/coach/sessions/${outcome.sessionId}`,
  });
}
