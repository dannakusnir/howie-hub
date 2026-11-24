import "server-only";
import { createHash } from "node:crypto";
import { and, eq, sql } from "drizzle-orm";
import { getDb, type PortalDb } from "../db/client";
import {
  auditLog,
  coachingSessions as cs,
  engagements,
  organisations,
  programs,
  sessionAssets,
  sessionItems,
} from "../db/schema";
import type { IngestPayload } from "../ingest-schema";

// Automation entry point. It can create and update DRAFTS only. There is deliberately no
// publish function here, and no statement in this file writes `status`, `published_at`
// or `published_by` (the database CHECK would reject it anyway).

/** Every blob of a session lives under this prefix; the asset route and the ingest check rely on it. */
export function assetPrefix(orgId: string, sessionNumber: number): string {
  return `portal/${orgId}/session-${sessionNumber}/`;
}

/** True when `pathname` is a non-empty, traversal-free path strictly inside the session's prefix. */
export function isInsidePrefix(pathname: string, prefix: string): boolean {
  return (
    pathname.startsWith(prefix) &&
    pathname.length > prefix.length &&
    !pathname.includes("..") &&
    !pathname.includes("//")
  );
}

export type IngestRefusal =
  | { readonly reason: "unknown_org" }
  | { readonly reason: "unknown_program" }
  | { readonly reason: "no_engagement" }
  | { readonly reason: "number_out_of_range"; readonly max: number }
  | { readonly reason: "already_published" }
  | { readonly reason: "human_edited" }
  | { readonly reason: "asset_outside_prefix"; readonly pathnames: readonly string[] }
  | { readonly reason: "asset_pathname_duplicate"; readonly pathnames: readonly string[] }
  | { readonly reason: "asset_pathname_in_use"; readonly pathnames: readonly string[] };

export type IngestOutcome =
  | {
      readonly ok: true;
      readonly sessionId: string;
      readonly result: "created" | "updated" | "unchanged";
      /** Blobs no longer referenced; the caller may delete them from the store. */
      readonly orphanedPathnames: readonly string[];
    }
  | { readonly ok: false; readonly refusal: IngestRefusal };

function canonical(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(canonical).join(",")}]`;
  if (v !== null && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return `{${Object.keys(o)
      .filter((k) => o[k] !== undefined)
      .sort()
      .map((k) => `${JSON.stringify(k)}:${canonical(o[k])}`)
      .join(",")}}`;
  }
  return JSON.stringify(v);
}

/** Hash of everything that lands in the draft. `force` is an instruction, not content. */
export function payloadHash(payload: IngestPayload): string {
  const { force: _force, ...content } = payload;
  void _force;
  return createHash("sha256").update(canonical(content)).digest("hex");
}

export function forIngest(db: PortalDb = getDb()) {
  return {
    assetPrefix,

    async upsertDraft(payload: IngestPayload): Promise<IngestOutcome> {
      const hash = payloadHash(payload);
      return db.transaction(async (tx): Promise<IngestOutcome> => {
        const [org] = await tx
          .select({ id: organisations.id })
          .from(organisations)
          .where(eq(organisations.slug, payload.org))
          .limit(1);
        if (org === undefined) return { ok: false, refusal: { reason: "unknown_org" } };

        const [program] = await tx
          .select({ id: programs.id, sessionCount: programs.sessionCount })
          .from(programs)
          .where(eq(programs.slug, payload.program))
          .limit(1);
        if (program === undefined) return { ok: false, refusal: { reason: "unknown_program" } };

        if (payload.sessionNumber < 1 || payload.sessionNumber > program.sessionCount) {
          return {
            ok: false,
            refusal: { reason: "number_out_of_range", max: program.sessionCount },
          };
        }

        const [engagement] = await tx
          .select({ id: engagements.id })
          .from(engagements)
          .where(and(eq(engagements.orgId, org.id), eq(engagements.programId, program.id)))
          .limit(1);
        if (engagement === undefined) return { ok: false, refusal: { reason: "no_engagement" } };

        const prefix = assetPrefix(org.id, payload.sessionNumber);
        const outside = payload.assets
          .map((a) => a.pathname)
          .filter((pathname) => !isInsidePrefix(pathname, prefix));
        if (outside.length > 0) {
          return { ok: false, refusal: { reason: "asset_outside_prefix", pathnames: outside } };
        }
        const seen = new Set<string>();
        const dupes = payload.assets
          .map((a) => a.pathname)
          .filter((pathname) => (seen.has(pathname) ? true : (seen.add(pathname), false)));
        if (dupes.length > 0) {
          return { ok: false, refusal: { reason: "asset_pathname_duplicate", pathnames: dupes } };
        }

        // The row is normally pre-created by createEngagement; make sure it exists, then lock it.
        await tx
          .insert(cs)
          .values({ orgId: org.id, engagementId: engagement.id, number: payload.sessionNumber })
          .onConflictDoNothing();
        const [row] = await tx
          .select({
            id: cs.id,
            status: cs.status,
            ingestHash: cs.ingestHash,
            lastIngestedAt: cs.lastIngestedAt,
            editedAt: cs.editedAt,
            humanEdited: sql<boolean>`(${cs.editedAt} IS NOT NULL AND (${cs.lastIngestedAt} IS NULL OR ${cs.editedAt} > ${cs.lastIngestedAt}))`,
          })
          .from(cs)
          .where(and(eq(cs.engagementId, engagement.id), eq(cs.number, payload.sessionNumber)))
          .for("update");
        if (row === undefined) {
          throw new Error("coaching_sessions row missing right after insert");
        }

        if (row.status === "published") {
          return { ok: false, refusal: { reason: "already_published" } };
        }
        const force = payload.force === true;
        if (row.humanEdited && !force) {
          return { ok: false, refusal: { reason: "human_edited" } };
        }

        const existingAssets = await tx
          .select({
            id: sessionAssets.id,
            sessionId: sessionAssets.sessionId,
            blobPathname: sessionAssets.blobPathname,
          })
          .from(sessionAssets)
          .where(and(eq(sessionAssets.sessionId, row.id), eq(sessionAssets.orgId, org.id)));

        // A pathname already held by a different session can never be taken over.
        if (payload.assets.length > 0) {
          const held = await tx
            .select({ pathname: sessionAssets.blobPathname, sessionId: sessionAssets.sessionId })
            .from(sessionAssets)
            .where(
              sql`${sessionAssets.blobPathname} IN (${sql.join(
                payload.assets.map((a) => sql`${a.pathname}`),
                sql`, `,
              )})`,
            );
          const taken = held.filter((h) => h.sessionId !== row.id).map((h) => h.pathname);
          if (taken.length > 0) {
            return { ok: false, refusal: { reason: "asset_pathname_in_use", pathnames: taken } };
          }
        }

        const wasIngested = row.lastIngestedAt !== null;
        if (wasIngested && row.ingestHash === hash && !row.humanEdited) {
          return { ok: true, sessionId: row.id, result: "unchanged", orphanedPathnames: [] };
        }

        await tx
          .update(cs)
          .set({
            title: payload.title,
            summaryMd: payload.summaryMd,
            heldOn: payload.heldOn,
            ingestHash: hash,
            lastIngestedAt: sql`now()`,
            updatedAt: sql`now()`,
            // Ingest content now replaces whatever a human changed (only reachable with force).
            editedAt: null,
            editedBy: null,
          })
          .where(and(eq(cs.id, row.id), eq(cs.orgId, org.id)));

        await tx
          .delete(sessionItems)
          .where(and(eq(sessionItems.sessionId, row.id), eq(sessionItems.orgId, org.id)));
        const items = [
          ...payload.tasks.map((t, position) => ({ kind: "task" as const, position, text: t.text })),
          ...payload.nextTime.map((t, position) => ({
            kind: "next_time" as const,
            position,
            text: t.text,
          })),
        ];
        if (items.length > 0) {
          await tx
            .insert(sessionItems)
            .values(items.map((i) => ({ ...i, orgId: org.id, sessionId: row.id })));
        }

        const wanted = new Set(payload.assets.map((a) => a.pathname));
        const orphaned = existingAssets.map((a) => a.blobPathname).filter((p) => !wanted.has(p));
        await tx
          .delete(sessionAssets)
          .where(and(eq(sessionAssets.sessionId, row.id), eq(sessionAssets.orgId, org.id)));
        if (payload.assets.length > 0) {
          const perKind = new Map<string, number>();
          await tx.insert(sessionAssets).values(
            payload.assets.map((a) => {
              const position = perKind.get(a.kind) ?? 0;
              perKind.set(a.kind, position + 1);
              return {
                orgId: org.id,
                sessionId: row.id,
                kind: a.kind,
                position,
                blobPathname: a.pathname,
                contentType: a.contentType,
                bytes: a.bytes,
                sha256: a.sha256,
                label: a.label,
              };
            }),
          );
        }

        const result = wasIngested ? "updated" : "created";
        await tx.insert(auditLog).values({
          actorKind: "ingest",
          action: `ingest.${result}`,
          orgId: org.id,
          sessionId: row.id,
          detail: {
            forced: force && row.humanEdited,
            sessionNumber: payload.sessionNumber,
            source: payload.source,
            hash,
          },
        });
        return { ok: true, sessionId: row.id, result, orphanedPathnames: orphaned };
      });
    },
  };
}
