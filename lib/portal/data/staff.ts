import "server-only";
import { and, asc, desc, eq, isNotNull, or, sql } from "drizzle-orm";
import { ASSET_KINDS, type AssetKind } from "../asset-kinds";
import { getDb, type PortalDb } from "../db/client";
import {
  auditLog,
  authSessions,
  coachingSessions as cs,
  engagements,
  organisations,
  programs,
  sessionAssets,
  sessionItems,
  users,
} from "../db/schema";
import { type Capabilities, can } from "../roles";
import {
  type AssetFileDto,
  type DraftQueueEntry,
  type ItemDto,
  type Ok,
  type OrgSummary,
  type Refusal,
  type StaffAssetDto,
  type StaffPrincipal,
  type StaffSessionDto,
  isUuid,
} from "./dto";
import { assetPrefix, isInsidePrefix } from "./ingest";

// Staff entry point (coach, admin). Same contract as the others: null = not found,
// refusals are typed values, infrastructure failure throws. Every write appends audit_log
// inside the same transaction. A missing capability throws PortalForbiddenError: the
// caller reached a function its role must never have been offered.

export class PortalForbiddenError extends Error {
  constructor(role: string, capability: keyof Capabilities) {
    super(`role ${role} lacks capability ${capability}`);
    this.name = "PortalForbiddenError";
  }
}

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,62}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Tx = Parameters<Parameters<PortalDb["transaction"]>[0]>[0];

export function forStaff(p: StaffPrincipal, db: PortalDb = getDb()) {
  const need = (capability: keyof Capabilities) => {
    if (!can(p.role, capability)) throw new PortalForbiddenError(p.role, capability);
  };

  const audit = (
    tx: Tx,
    action: string,
    ref: { orgId?: string; sessionId?: string; detail?: Record<string, unknown> },
  ) =>
    tx.insert(auditLog).values({
      actorKind: "user",
      actorUserId: p.userId,
      action,
      orgId: ref.orgId ?? null,
      sessionId: ref.sessionId ?? null,
      detail: ref.detail ?? null,
    });

  /** Locks and returns a session row, or null. */
  const lockSession = async (tx: Tx, id: string) => {
    if (!isUuid(id)) return null;
    const [row] = await tx
      .select({ id: cs.id, orgId: cs.orgId, number: cs.number, status: cs.status, title: cs.title, summaryMd: cs.summaryMd })
      .from(cs)
      .where(eq(cs.id, id))
      .for("update");
    return row ?? null;
  };

  const markEdited = (tx: Tx, sessionId: string) =>
    tx
      .update(cs)
      .set({ editedAt: sql`now()`, editedBy: p.userId, updatedAt: sql`now()` })
      .where(eq(cs.id, sessionId));

  const toItem = (i: {
    id: string;
    text: string;
    doneAt: Date | null;
    doneByName: string | null;
  }): ItemDto => ({
    id: i.id,
    text: i.text,
    done: i.doneAt !== null,
    doneAt: i.doneAt,
    doneByName: i.doneAt === null ? null : i.doneByName,
  });

  return {
    async listOrgs(): Promise<OrgSummary[]> {
      need("viewAllOrgs");
      const orgs = await db.select().from(organisations).orderBy(asc(organisations.name));
      const engs = await db
        .select({ id: engagements.id, orgId: engagements.orgId, programSlug: programs.slug })
        .from(engagements)
        .innerJoin(programs, eq(programs.id, engagements.programId));
      const members = await db
        .select({
          id: users.id,
          orgId: users.orgId,
          email: users.email,
          name: users.name,
          disabledAt: users.disabledAt,
        })
        .from(users)
        .where(isNotNull(users.orgId))
        .orderBy(asc(users.email));
      return orgs.map((o) => ({
        id: o.id,
        slug: o.slug,
        name: o.name,
        engagements: engs
          .filter((e) => e.orgId === o.id)
          .map((e) => ({ id: e.id, programSlug: e.programSlug })),
        users: members
          .filter((m) => m.orgId === o.id)
          .map((m) => ({ id: m.id, email: m.email, name: m.name, disabled: m.disabledAt !== null })),
      }));
    },

    async createOrg(input: { slug: string; name: string }): Promise<
      Ok<{ orgId: string }> | Refusal<"invalid_slug" | "slug_taken">
    > {
      need("manageOrgs");
      if (!SLUG_RE.test(input.slug)) return { ok: false, reason: "invalid_slug" };
      return db.transaction(async (tx) => {
        const [row] = await tx
          .insert(organisations)
          .values({ slug: input.slug, name: input.name })
          .onConflictDoNothing()
          .returning({ id: organisations.id });
        if (row === undefined) return { ok: false as const, reason: "slug_taken" as const };
        await audit(tx, "org.create", { orgId: row.id, detail: { slug: input.slug } });
        return { ok: true as const, orgId: row.id };
      });
    },

    /** Creates the engagement and pre-creates every session 1..session_count as a draft. */
    async createEngagement(input: {
      orgId: string;
      programSlug: string;
      startsOn: string | null;
    }): Promise<
      Ok<{ engagementId: string; sessionCount: number }> | Refusal<"already_exists"> | null
    > {
      need("manageOrgs");
      if (!isUuid(input.orgId)) return null;
      return db.transaction(async (tx) => {
        const [org] = await tx
          .select({ id: organisations.id })
          .from(organisations)
          .where(eq(organisations.id, input.orgId));
        if (org === undefined) return null;
        const [program] = await tx
          .select({ id: programs.id, sessionCount: programs.sessionCount })
          .from(programs)
          .where(eq(programs.slug, input.programSlug));
        if (program === undefined) return null;
        const [eng] = await tx
          .insert(engagements)
          .values({ orgId: org.id, programId: program.id, startsOn: input.startsOn })
          .onConflictDoNothing()
          .returning({ id: engagements.id });
        if (eng === undefined) return { ok: false as const, reason: "already_exists" as const };
        await tx.insert(cs).values(
          Array.from({ length: program.sessionCount }, (_, i) => ({
            orgId: org.id,
            engagementId: eng.id,
            number: i + 1,
          })),
        );
        await audit(tx, "engagement.create", {
          orgId: org.id,
          detail: { program: input.programSlug, sessions: program.sessionCount },
        });
        return { ok: true as const, engagementId: eng.id, sessionCount: program.sessionCount };
      });
    },

    /** Creates the invited client row (no email is sent here). */
    async inviteClient(input: {
      orgId: string;
      email: string;
      name: string | null;
    }): Promise<Ok<{ userId: string }> | Refusal<"invalid_email" | "email_taken"> | null> {
      need("manageClients");
      const email = input.email.trim().toLowerCase();
      if (!EMAIL_RE.test(email)) return { ok: false, reason: "invalid_email" };
      if (!isUuid(input.orgId)) return null;
      return db.transaction(async (tx) => {
        const [org] = await tx
          .select({ id: organisations.id })
          .from(organisations)
          .where(eq(organisations.id, input.orgId));
        if (org === undefined) return null;
        const [row] = await tx
          .insert(users)
          .values({
            email,
            name: input.name,
            role: "client",
            orgId: org.id,
            invitedBy: p.userId,
            invitedAt: sql`now()`,
          })
          .onConflictDoNothing()
          .returning({ id: users.id });
        if (row === undefined) return { ok: false as const, reason: "email_taken" as const };
        await audit(tx, "user.invite", { orgId: org.id, detail: { userId: row.id } });
        return { ok: true as const, userId: row.id };
      });
    },

    /** Disables a client and ends their sessions. null when no such client. */
    async disableUser(userId: string): Promise<Ok<object> | Refusal<"self"> | null> {
      need("manageClients");
      if (!isUuid(userId)) return null;
      if (userId === p.userId) return { ok: false, reason: "self" };
      return db.transaction(async (tx) => {
        const [row] = await tx
          .update(users)
          .set({ disabledAt: sql`coalesce(${users.disabledAt}, now())` })
          .where(and(eq(users.id, userId), eq(users.role, "client")))
          .returning({ id: users.id, orgId: users.orgId });
        if (row === undefined) return null;
        await tx.delete(authSessions).where(eq(authSessions.userId, userId));
        await audit(tx, "user.disable", {
          ...(row.orgId === null ? {} : { orgId: row.orgId }),
          detail: { userId },
        });
        return { ok: true as const };
      });
    },

    /** Drafts that carry ingested or hand-edited content, newest activity first. */
    async draftQueue(): Promise<DraftQueueEntry[]> {
      need("viewAllOrgs");
      return db
        .select({
          id: cs.id,
          orgSlug: organisations.slug,
          orgName: organisations.name,
          programSlug: programs.slug,
          number: cs.number,
          title: cs.title,
          lastIngestedAt: cs.lastIngestedAt,
          editedAt: cs.editedAt,
        })
        .from(cs)
        .innerJoin(organisations, eq(organisations.id, cs.orgId))
        .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
        .innerJoin(programs, eq(programs.id, engagements.programId))
        .where(
          and(eq(cs.status, "draft"), or(isNotNull(cs.lastIngestedAt), isNotNull(cs.editedAt))),
        )
        .orderBy(desc(sql`greatest(${cs.lastIngestedAt}, ${cs.editedAt})`), asc(cs.number));
    },

    async session(id: string): Promise<StaffSessionDto | null> {
      need("viewAllOrgs");
      if (!isUuid(id)) return null;
      const [row] = await db
        .select({
          id: cs.id,
          orgId: cs.orgId,
          orgSlug: organisations.slug,
          orgName: organisations.name,
          programSlug: programs.slug,
          number: cs.number,
          status: cs.status,
          title: cs.title,
          summaryMd: cs.summaryMd,
          heldOn: cs.heldOn,
          scheduledAt: cs.scheduledAt,
          publishedAt: cs.publishedAt,
          publishedBy: cs.publishedBy,
          lastIngestedAt: cs.lastIngestedAt,
          editedAt: cs.editedAt,
          editedBy: cs.editedBy,
        })
        .from(cs)
        .innerJoin(organisations, eq(organisations.id, cs.orgId))
        .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
        .innerJoin(programs, eq(programs.id, engagements.programId))
        .where(eq(cs.id, id))
        .limit(1);
      if (row === undefined) return null;
      const items = await db
        .select({
          id: sessionItems.id,
          kind: sessionItems.kind,
          text: sessionItems.text,
          doneAt: sessionItems.doneAt,
          doneByName: sql<string | null>`coalesce(${users.name}, split_part(${users.email}, '@', 1))`,
        })
        .from(sessionItems)
        .leftJoin(users, eq(users.id, sessionItems.doneBy))
        .where(and(eq(sessionItems.sessionId, id), eq(sessionItems.orgId, row.orgId)))
        .orderBy(asc(sessionItems.kind), asc(sessionItems.position));
      const assets = await db
        .select()
        .from(sessionAssets)
        .where(and(eq(sessionAssets.sessionId, id), eq(sessionAssets.orgId, row.orgId)))
        .orderBy(asc(sessionAssets.kind), asc(sessionAssets.position));
      const staffAssets: StaffAssetDto[] = assets.map((a) => ({
        id: a.id,
        sessionId: a.sessionId,
        orgId: a.orgId,
        kind: a.kind,
        blobPathname: a.blobPathname,
        contentType: a.contentType,
        bytes: a.bytes,
        label: a.label,
        position: a.position,
        sha256: a.sha256,
      }));
      return {
        ...row,
        tasks: items.filter((i) => i.kind === "task").map(toItem),
        nextTime: items.filter((i) => i.kind === "next_time").map(toItem),
        assets: staffAssets,
      };
    },

    /** Edits a draft by hand. Stamps edited_at/edited_by so a later ingest will not overwrite it. */
    async saveDraft(
      id: string,
      fields: {
        title?: string | null;
        summaryMd?: string | null;
        heldOn?: string | null;
        scheduledAt?: Date | null;
      },
    ): Promise<Ok<object> | Refusal<"published"> | null> {
      need("editDrafts");
      return db.transaction(async (tx) => {
        const row = await lockSession(tx, id);
        if (row === null) return null;
        if (row.status === "published") return { ok: false as const, reason: "published" as const };
        await tx
          .update(cs)
          .set({
            ...(fields.title !== undefined ? { title: fields.title } : {}),
            ...(fields.summaryMd !== undefined ? { summaryMd: fields.summaryMd } : {}),
            ...(fields.heldOn !== undefined ? { heldOn: fields.heldOn } : {}),
            ...(fields.scheduledAt !== undefined ? { scheduledAt: fields.scheduledAt } : {}),
            editedAt: sql`now()`,
            editedBy: p.userId,
            updatedAt: sql`now()`,
          })
          .where(eq(cs.id, row.id));
        await audit(tx, "session.save_draft", {
          orgId: row.orgId,
          sessionId: row.id,
          detail: { fields: Object.keys(fields) },
        });
        return { ok: true as const };
      });
    },

    /** Replaces all tasks and next-time items of a draft. */
    async replaceItems(
      id: string,
      input: { tasks: readonly string[]; nextTime: readonly string[] },
    ): Promise<Ok<object> | Refusal<"published"> | null> {
      need("editDrafts");
      return db.transaction(async (tx) => {
        const row = await lockSession(tx, id);
        if (row === null) return null;
        if (row.status === "published") return { ok: false as const, reason: "published" as const };
        await tx
          .delete(sessionItems)
          .where(and(eq(sessionItems.sessionId, row.id), eq(sessionItems.orgId, row.orgId)));
        const values = [
          ...input.tasks.map((text, position) => ({ kind: "task" as const, position, text })),
          ...input.nextTime.map((text, position) => ({ kind: "next_time" as const, position, text })),
        ].map((i) => ({ ...i, orgId: row.orgId, sessionId: row.id }));
        if (values.length > 0) await tx.insert(sessionItems).values(values);
        await markEdited(tx, row.id);
        await audit(tx, "session.replace_items", {
          orgId: row.orgId,
          sessionId: row.id,
          detail: { tasks: input.tasks.length, nextTime: input.nextTime.length },
        });
        return { ok: true as const };
      });
    },

    async addAsset(
      id: string,
      input: {
        kind: AssetKind;
        blobPathname: string;
        contentType: string;
        bytes: number;
        sha256: string;
        label: string | null;
      },
    ): Promise<
      | Ok<{ assetId: string }>
      | Refusal<"published" | "outside_prefix" | "content_type_not_allowed" | "too_large" | "pathname_in_use">
      | null
    > {
      need("editDrafts");
      return db.transaction(async (tx) => {
        const row = await lockSession(tx, id);
        if (row === null) return null;
        if (row.status === "published") return { ok: false as const, reason: "published" as const };
        if (!isInsidePrefix(input.blobPathname, assetPrefix(row.orgId, row.number))) {
          return { ok: false as const, reason: "outside_prefix" as const };
        }
        const spec = ASSET_KINDS[input.kind];
        if (!spec.accept.includes(input.contentType)) {
          return { ok: false as const, reason: "content_type_not_allowed" as const };
        }
        if (input.bytes > spec.maxBytes) return { ok: false as const, reason: "too_large" as const };
        const [taken] = await tx
          .select({ id: sessionAssets.id })
          .from(sessionAssets)
          .where(eq(sessionAssets.blobPathname, input.blobPathname));
        if (taken !== undefined) return { ok: false as const, reason: "pathname_in_use" as const };
        const [last] = await tx
          .select({ max: sql<number | null>`max(${sessionAssets.position})` })
          .from(sessionAssets)
          .where(
            and(
              eq(sessionAssets.sessionId, row.id),
              eq(sessionAssets.orgId, row.orgId),
              eq(sessionAssets.kind, input.kind),
            ),
          );
        const position = last?.max === null || last === undefined ? 0 : last.max + 1;
        const [created] = await tx
          .insert(sessionAssets)
          .values({
            orgId: row.orgId,
            sessionId: row.id,
            kind: input.kind,
            position,
            blobPathname: input.blobPathname,
            contentType: input.contentType,
            bytes: input.bytes,
            sha256: input.sha256,
            label: input.label,
          })
          .returning({ id: sessionAssets.id });
        if (created === undefined) throw new Error("asset insert returned no row");
        await markEdited(tx, row.id);
        await audit(tx, "asset.add", {
          orgId: row.orgId,
          sessionId: row.id,
          detail: { assetId: created.id, kind: input.kind },
        });
        return { ok: true as const, assetId: created.id };
      });
    },

    /** Removes an asset row from a draft. Returns its pathname so the caller can delete the blob. */
    async removeAsset(
      assetId: string,
    ): Promise<Ok<{ blobPathname: string }> | Refusal<"published"> | null> {
      need("editDrafts");
      if (!isUuid(assetId)) return null;
      return db.transaction(async (tx) => {
        const [found] = await tx
          .select({ id: sessionAssets.id, sessionId: sessionAssets.sessionId })
          .from(sessionAssets)
          .where(eq(sessionAssets.id, assetId));
        if (found === undefined) return null;
        const row = await lockSession(tx, found.sessionId);
        if (row === null) return null;
        if (row.status === "published") return { ok: false as const, reason: "published" as const };
        const [removed] = await tx
          .delete(sessionAssets)
          .where(and(eq(sessionAssets.id, assetId), eq(sessionAssets.orgId, row.orgId)))
          .returning({ blobPathname: sessionAssets.blobPathname, kind: sessionAssets.kind });
        if (removed === undefined) return null;
        await markEdited(tx, row.id);
        await audit(tx, "asset.remove", {
          orgId: row.orgId,
          sessionId: row.id,
          detail: { assetId, kind: removed.kind },
        });
        return { ok: true as const, blobPathname: removed.blobPathname };
      });
    },

    /** The only path that sets status = 'published'. */
    async publish(
      id: string,
    ): Promise<Ok<object> | Refusal<"already_published" | "incomplete"> | null> {
      need("publish");
      return db.transaction(async (tx) => {
        const row = await lockSession(tx, id);
        if (row === null) return null;
        if (row.status === "published") {
          return { ok: false as const, reason: "already_published" as const };
        }
        if (!row.title?.trim() || !row.summaryMd?.trim()) {
          return { ok: false as const, reason: "incomplete" as const };
        }
        await tx
          .update(cs)
          .set({ status: "published", publishedAt: sql`now()`, publishedBy: p.userId, updatedAt: sql`now()` })
          .where(eq(cs.id, row.id));
        await audit(tx, "session.publish", { orgId: row.orgId, sessionId: row.id });
        return { ok: true as const };
      });
    },

    async unpublish(id: string): Promise<Ok<object> | Refusal<"not_published"> | null> {
      need("publish");
      return db.transaction(async (tx) => {
        const row = await lockSession(tx, id);
        if (row === null) return null;
        if (row.status !== "published") {
          return { ok: false as const, reason: "not_published" as const };
        }
        await tx
          .update(cs)
          .set({ status: "draft", publishedAt: null, publishedBy: null, updatedAt: sql`now()` })
          .where(eq(cs.id, row.id));
        await audit(tx, "session.unpublish", { orgId: row.orgId, sessionId: row.id });
        return { ok: true as const };
      });
    },

    /** Any asset, draft or published, for the authenticated streaming route. */
    async asset(assetId: string): Promise<AssetFileDto | null> {
      need("viewAllOrgs");
      if (!isUuid(assetId)) return null;
      const [row] = await db
        .select({
          id: sessionAssets.id,
          sessionId: sessionAssets.sessionId,
          orgId: sessionAssets.orgId,
          kind: sessionAssets.kind,
          blobPathname: sessionAssets.blobPathname,
          contentType: sessionAssets.contentType,
          bytes: sessionAssets.bytes,
          label: sessionAssets.label,
        })
        .from(sessionAssets)
        .where(eq(sessionAssets.id, assetId))
        .limit(1);
      return row ?? null;
    },
  };
}

export type StaffDal = ReturnType<typeof forStaff>;
