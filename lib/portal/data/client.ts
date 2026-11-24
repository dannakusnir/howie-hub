import "server-only";
import { and, asc, desc, eq, exists, sql } from "drizzle-orm";
import { getDb, type PortalDb } from "../db/client";
import {
  coachingSessions as cs,
  engagements,
  programs,
  sessionAssets,
  sessionItems,
  users,
} from "../db/schema";
import {
  type AssetFileDto,
  type ClientAssetDto,
  type ClientPrincipal,
  type ClientSessionDto,
  type ItemDto,
  type RoadmapEntry,
  type RoadmapProgram,
  isUuid,
} from "./dto";

// Client entry point. Contract: null = not found OR not yours (indistinguishable);
// an infrastructure failure throws. Every statement carries org_id = principal.orgId
// and status = 'published', with one deliberate exception: roadmap() also reads the
// organisation's drafts, but only number / scheduled_at / engagement (never title or
// summary), so a client can see how many sessions remain without seeing unreleased content.

export function forClient(p: ClientPrincipal, db: PortalDb = getDb()) {
  const orgId = p.orgId;

  // Who ticked an item: name, else the part of the email before the @. The join is pinned
  // to this organisation, so a name from another organisation can never come back.
  const doneByName = sql<string | null>`coalesce(${users.name}, split_part(${users.email}, '@', 1))`;
  const doneByJoin = and(eq(users.id, sessionItems.doneBy), eq(users.orgId, orgId));

  const sessionById = async (id: string): Promise<ClientSessionDto | null> => {
    if (!isUuid(id)) return null;
    const [row] = await db
      .select({
        id: cs.id,
        number: cs.number,
        title: cs.title,
        summaryMd: cs.summaryMd,
        heldOn: cs.heldOn,
        scheduledAt: cs.scheduledAt,
        publishedAt: cs.publishedAt,
        programName: programs.name,
      })
      .from(cs)
      .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
      .innerJoin(programs, eq(programs.id, engagements.programId))
      .where(and(eq(cs.id, id), eq(cs.orgId, orgId), eq(cs.status, "published")))
      .limit(1);
    if (row === undefined) return null;
    if (row.publishedAt === null) {
      throw new Error(`published session ${row.id} has no published_at (CHECK violated)`);
    }

    const items = await db
      .select({
        id: sessionItems.id,
        kind: sessionItems.kind,
        text: sessionItems.text,
        doneAt: sessionItems.doneAt,
        doneByName,
      })
      .from(sessionItems)
      .innerJoin(cs, and(eq(cs.id, sessionItems.sessionId), eq(cs.orgId, sessionItems.orgId)))
      .leftJoin(users, doneByJoin)
      .where(
        and(eq(sessionItems.sessionId, id), eq(sessionItems.orgId, orgId), eq(cs.status, "published")),
      )
      .orderBy(asc(sessionItems.kind), asc(sessionItems.position));

    const assets = await db
      .select({
        id: sessionAssets.id,
        kind: sessionAssets.kind,
        label: sessionAssets.label,
        contentType: sessionAssets.contentType,
        bytes: sessionAssets.bytes,
        position: sessionAssets.position,
      })
      .from(sessionAssets)
      .innerJoin(cs, and(eq(cs.id, sessionAssets.sessionId), eq(cs.orgId, sessionAssets.orgId)))
      .where(
        and(eq(sessionAssets.sessionId, id), eq(sessionAssets.orgId, orgId), eq(cs.status, "published")),
      )
      .orderBy(asc(sessionAssets.kind), asc(sessionAssets.position));

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
    const clientAssets: ClientAssetDto[] = assets;

    return {
      id: row.id,
      number: row.number,
      title: row.title,
      summaryMd: row.summaryMd,
      heldOn: row.heldOn,
      scheduledAt: row.scheduledAt,
      publishedAt: row.publishedAt,
      programName: row.programName,
      tasks: items.filter((i) => i.kind === "task").map(toItem),
      nextTime: items.filter((i) => i.kind === "next_time").map(toItem),
      assets: clientAssets,
    };
  };

  return {
    async roadmap(): Promise<RoadmapProgram[]> {
      const published = await db
        .select({
          id: cs.id,
          number: cs.number,
          scheduledAt: cs.scheduledAt,
          heldOn: cs.heldOn,
          title: cs.title,
          engagementId: cs.engagementId,
          programSlug: programs.slug,
          programName: programs.name,
        })
        .from(cs)
        .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
        .innerJoin(programs, eq(programs.id, engagements.programId))
        .where(and(eq(cs.orgId, orgId), eq(cs.status, "published")));

      // Drafts: three columns only. Title and summary never leave the database here.
      const unpublished = await db
        .select({
          number: cs.number,
          scheduledAt: cs.scheduledAt,
          engagementId: cs.engagementId,
          programSlug: programs.slug,
          programName: programs.name,
        })
        .from(cs)
        .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
        .innerJoin(programs, eq(programs.id, engagements.programId))
        .where(and(eq(cs.orgId, orgId), eq(cs.status, "draft")));

      type Group = {
        programSlug: string;
        programName: string;
        pub: RoadmapEntry[];
        drafts: { number: number; scheduledAt: Date | null }[];
      };
      const groups = new Map<string, Group>();
      const group = (engagementId: string, programSlug: string, programName: string): Group => {
        let g = groups.get(engagementId);
        if (g === undefined) {
          g = { programSlug, programName, pub: [], drafts: [] };
          groups.set(engagementId, g);
        }
        return g;
      };

      for (const r of published) {
        group(r.engagementId, r.programSlug, r.programName).pub.push({
          id: r.id,
          number: r.number,
          scheduledAt: r.scheduledAt,
          heldOn: r.heldOn,
          title: r.title,
          state: "done",
        });
      }
      for (const r of unpublished) {
        group(r.engagementId, r.programSlug, r.programName).drafts.push({
          number: r.number,
          scheduledAt: r.scheduledAt,
        });
      }

      return [...groups.values()]
        .sort((a, b) => a.programSlug.localeCompare(b.programSlug))
        .map((g) => {
          const drafts = [...g.drafts].sort((a, b) => a.number - b.number);
          const pending: RoadmapEntry[] = drafts.map((d, i) => ({
            number: d.number,
            scheduledAt: d.scheduledAt,
            state: i === 0 ? ("next" as const) : ("later" as const),
          }));
          const sessions = [...g.pub, ...pending].sort((a, b) => a.number - b.number);
          return { programSlug: g.programSlug, programName: g.programName, sessions };
        });
    },

    session: sessionById,

    /**
     * The most recently published session of this org: the highest session number among
     * the published ones (publish order can change when a session is unpublished and
     * published again; the number cannot). Optionally restricted to one program.
     */
    async latestPublished(programSlug?: string): Promise<ClientSessionDto | null> {
      const [row] = await db
        .select({ id: cs.id })
        .from(cs)
        .innerJoin(engagements, and(eq(engagements.id, cs.engagementId), eq(engagements.orgId, cs.orgId)))
        .innerJoin(programs, eq(programs.id, engagements.programId))
        .where(
          and(
            eq(cs.orgId, orgId),
            eq(cs.status, "published"),
            programSlug === undefined ? undefined : eq(programs.slug, programSlug),
          ),
        )
        .orderBy(desc(cs.number), desc(cs.publishedAt))
        .limit(1);
      return row === undefined ? null : sessionById(row.id);
    },

    /** Marks an item done / not done. null when the item is not in a published session of this org. */
    async setItemDone(itemId: string, done: boolean): Promise<ItemDto | null> {
      if (!isUuid(itemId)) return null;
      const [row] = await db
        .update(sessionItems)
        .set(
          done
            ? {
                doneAt: sql`coalesce(${sessionItems.doneAt}, now())`,
                doneBy: sql`coalesce(${sessionItems.doneBy}, ${p.userId}::uuid)`,
              }
            : { doneAt: null, doneBy: null },
        )
        .where(
          and(
            eq(sessionItems.id, itemId),
            eq(sessionItems.orgId, orgId),
            exists(
              db
                .select({ one: sql`1` })
                .from(cs)
                .where(
                  and(
                    eq(cs.id, sessionItems.sessionId),
                    eq(cs.orgId, sessionItems.orgId),
                    eq(cs.orgId, orgId),
                    eq(cs.status, "published"),
                  ),
                ),
            ),
          ),
        )
        .returning({
          id: sessionItems.id,
          text: sessionItems.text,
          doneAt: sessionItems.doneAt,
          doneBy: sessionItems.doneBy,
        });
      if (row === undefined) return null;
      let name: string | null = null;
      if (row.doneBy !== null) {
        const [who] = await db
          .select({ name: sql<string | null>`coalesce(${users.name}, split_part(${users.email}, '@', 1))` })
          .from(users)
          .where(and(eq(users.id, row.doneBy), eq(users.orgId, orgId)));
        name = who?.name ?? null;
      }
      return { id: row.id, text: row.text, done: row.doneAt !== null, doneAt: row.doneAt, doneByName: name };
    },

    /** A published asset of this org, for the authenticated streaming route. */
    async asset(assetId: string): Promise<AssetFileDto | null> {
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
        .innerJoin(cs, and(eq(cs.id, sessionAssets.sessionId), eq(cs.orgId, sessionAssets.orgId)))
        .where(
          and(eq(sessionAssets.id, assetId), eq(sessionAssets.orgId, orgId), eq(cs.status, "published")),
        )
        .limit(1);
      return row ?? null;
    },
  };
}
