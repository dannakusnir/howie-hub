import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq, sql } from "drizzle-orm";
import { forClient } from "../../lib/portal/data/client";
import { forIngest } from "../../lib/portal/data/ingest";
import { forStaff, PortalForbiddenError } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import { ingestPayloadSchema } from "../../lib/portal/ingest-schema";
import {
  freshDb,
  fullMessage,
  payload,
  testOnlyClientPrincipal,
  testOnlyStaffPrincipal,
  uid,
} from "./helpers";

let db: PortalDb;
let adminId: string;
let coachId: string;

const staff = () => forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);

async function insertStaff(email: string, role: "coach" | "admin"): Promise<string> {
  const [u] = await db.insert(schema.users).values({ email, role }).returning({ id: schema.users.id });
  assert.ok(u);
  return u.id;
}

type Tenant = {
  slug: string;
  orgId: string;
  clientId: string;
  client: ReturnType<typeof forClient>;
  sessionIds: string[]; // index 0 = session #1
};

let programSlug: string;

/** One org with an engagement (3 sessions), one invited client. */
async function tenant(label: string): Promise<Tenant> {
  const slug = `${label}-${uid().slice(0, 8)}`;
  const org = await staff().createOrg({ slug, name: `Org ${slug}` });
  assert.ok(org.ok);
  const eng = await staff().createEngagement({ orgId: org.orgId, programSlug, startsOn: "2026-12-01" });
  assert.ok(eng !== null && eng.ok);
  const inv = await staff().inviteClient({ orgId: org.orgId, email: `Client@${slug}.test`, name: "C" });
  assert.ok(inv !== null && inv.ok);
  const rows = await db
    .select({ id: schema.coachingSessions.id, number: schema.coachingSessions.number })
    .from(schema.coachingSessions)
    .where(eq(schema.coachingSessions.orgId, org.orgId))
    .orderBy(schema.coachingSessions.number);
  return {
    slug,
    orgId: org.orgId,
    clientId: inv.userId,
    client: forClient(testOnlyClientPrincipal(inv.userId, org.orgId), db),
    sessionIds: rows.map((r) => r.id),
  };
}

async function ingest(t: Tenant, number: number, over: Parameters<typeof payload>[4] = {}) {
  return forIngest(db).upsertDraft(payload(t.slug, programSlug, t.orgId, number, over));
}

async function ingestAndPublish(t: Tenant, number: number) {
  const r = await ingest(t, number);
  assert.ok(r.ok);
  const pub = await staff().publish(r.sessionId);
  assert.ok(pub !== null && pub.ok);
  return r.sessionId;
}

async function rejects(p: PromiseLike<unknown>, pattern: RegExp) {
  try {
    await p;
  } catch (e) {
    assert.match(fullMessage(e), pattern);
    return;
  }
  assert.fail(`expected rejection matching ${pattern}`);
}

before(async () => {
  ({ db } = await freshDb());
  adminId = await insertStaff("admin@example.test", "admin");
  coachId = await insertStaff("coach@example.test", "coach");
  programSlug = "prog-test";
  await db.insert(schema.programs).values({ slug: programSlug, name: "Test Program", sessionCount: 3 });
});

describe("tenant isolation (client)", () => {
  it("org A cannot read org B's session, asset or item; answers equal a random uuid", async () => {
    const a = await tenant("a");
    const b = await tenant("b");
    const bSession = await ingestAndPublish(b, 1);
    const aSession = await ingestAndPublish(a, 1);

    const bView = await b.client.session(bSession);
    assert.ok(bView, "control: B reads its own published session");
    const bAssetId = bView.assets[0]?.id;
    const bItemId = bView.tasks[0]?.id;
    assert.ok(bAssetId && bItemId);
    assert.ok(await b.client.asset(bAssetId), "control: B reads its own asset");

    const ghost = uid();
    assert.equal(await a.client.session(bSession), null);
    assert.equal(await a.client.session(ghost), null);
    assert.equal(await a.client.asset(bAssetId), null);
    assert.equal(await a.client.asset(ghost), null);
    assert.equal(await a.client.setItemDone(bItemId, true), null);
    assert.equal(await a.client.setItemDone(ghost, true), null);
    assert.equal(await a.client.session("not-a-uuid"), null);

    const [row] = await db.select().from(schema.sessionItems).where(eq(schema.sessionItems.id, bItemId));
    assert.equal(row?.doneAt, null, "B's item untouched by A");
    assert.equal(row?.doneBy, null);

    const own = (await a.client.session(aSession))?.tasks[0];
    assert.ok(own);
    const flipped = await a.client.setItemDone(own.id, true);
    assert.equal(flipped?.done, true, "control: A can tick its own item");
    assert.equal((await a.client.setItemDone(own.id, false))?.done, false);
  });

  it("roadmap of A never contains B's data", async () => {
    const a = await tenant("ra");
    const b = await tenant("rb");
    await ingestAndPublish(b, 1);
    const road = await a.client.roadmap();
    assert.equal(road.length, 1);
    assert.ok(!JSON.stringify(road).includes(b.slug));
    assert.ok(road[0]?.sessions.every((s) => s.state !== "done"));
  });
});

describe("draft gate", () => {
  it("a draft is invisible to its own org's client; roadmap exposes only number/scheduledAt/state", async () => {
    const t = await tenant("d");
    const r = await ingest(t, 2);
    assert.ok(r.ok);
    const asset = (await staff().session(r.sessionId))?.assets[0];
    assert.ok(asset);

    assert.equal(await t.client.session(r.sessionId), null);
    assert.equal(await t.client.asset(asset.id), null);
    const draftItem = (await staff().session(r.sessionId))?.tasks[0];
    assert.ok(draftItem);
    assert.equal(await t.client.setItemDone(draftItem.id, true), null);

    const road = await t.client.roadmap();
    const entry = road[0]?.sessions.find((s) => s.number === 2);
    assert.ok(entry);
    assert.deepEqual(Object.keys(entry).sort(), ["number", "scheduledAt", "state"]);
    const dump = JSON.stringify(road);
    assert.ok(!dump.includes("title for"), "draft title leaked");
    assert.ok(!dump.includes("Summary of"), "draft summary leaked");
    assert.deepEqual(
      road[0]?.sessions.map((s) => s.state),
      ["next", "later", "later"],
    );
  });

  it("direct SQL to status=published without published_by violates the CHECK (control: with it, passes)", async () => {
    const t = await tenant("chk");
    const id = t.sessionIds[0];
    assert.ok(id);
    await rejects(
      db.execute(sql`update coaching_sessions set status = 'published' where id = ${id}`),
      /coaching_sessions_published_gate/,
    );
    await rejects(
      db.execute(sql`update coaching_sessions set status = 'published', published_at = now() where id = ${id}`),
      /coaching_sessions_published_gate/,
    );
    await rejects(
      db.execute(sql`update coaching_sessions set published_at = now(), published_by = ${adminId}::uuid where id = ${id}`),
      /coaching_sessions_published_gate/,
    );
    await db.execute(
      sql`update coaching_sessions set status = 'published', published_at = now(), published_by = ${adminId}::uuid where id = ${id}`,
    );
  });

  it("client user without org_id violates the CHECK (controls: coach without org, client with org)", async () => {
    const t = await tenant("u");
    await rejects(
      db.insert(schema.users).values({ email: "orphan@example.test", role: "client" }),
      /users_client_has_org/,
    );
    await rejects(
      db.insert(schema.users).values({ email: "coach-org@example.test", role: "coach", orgId: t.orgId }),
      /users_client_has_org/,
    );
    await db.insert(schema.users).values({ email: "coach-ok@example.test", role: "coach" });
    await db.insert(schema.users).values({ email: "client-ok@example.test", role: "client", orgId: t.orgId });
  });

  it("emails are stored lowercase and unique on lower(email)", async () => {
    await rejects(db.insert(schema.users).values({ email: "Upper@example.test", role: "coach" }), /users_email_lowercase/);
    await db.insert(schema.users).values({ email: "dup@example.test", role: "coach" });
    await rejects(db.insert(schema.users).values({ email: "dup@example.test", role: "coach" }), /users_email_lower_key/);
    const t = await tenant("em");
    const again = await staff().inviteClient({ orgId: t.orgId, email: `CLIENT@${t.slug}.test`, name: null });
    assert.deepEqual(again, { ok: false, reason: "email_taken" });
  });
});

describe("ingest", () => {
  it("same payload twice gives one row and 'unchanged'", async () => {
    const t = await tenant("i1");
    const first = await ingest(t, 1);
    assert.ok(first.ok);
    assert.equal(first.result, "created");
    const second = await ingest(t, 1);
    assert.ok(second.ok);
    assert.equal(second.result, "unchanged");
    assert.equal(second.sessionId, first.sessionId);
    const rows = await db
      .select({ id: schema.coachingSessions.id })
      .from(schema.coachingSessions)
      .where(eq(schema.coachingSessions.orgId, t.orgId));
    assert.equal(rows.length, 3, "still the 3 pre-created rows");
    const items = await db.select().from(schema.sessionItems).where(eq(schema.sessionItems.sessionId, first.sessionId));
    assert.equal(items.length, 3);
    const changed = await ingest(t, 1, { title: "A different title" });
    assert.ok(changed.ok);
    assert.equal(changed.result, "updated");
  });

  it("onto a published session is refused, even with force", async () => {
    const t = await tenant("i2");
    await ingestAndPublish(t, 1);
    const r = await ingest(t, 1, { title: "new" });
    assert.deepEqual(r, { ok: false, refusal: { reason: "already_published" } });
    const forced = await ingest(t, 1, { title: "new", force: true });
    assert.deepEqual(forced, { ok: false, refusal: { reason: "already_published" } });
    const view = await t.client.session(t.sessionIds[0] as string);
    assert.notEqual(view?.title, "new");
  });

  it("onto a human-edited draft: refused without force, updated with force", async () => {
    const t = await tenant("i3");
    const first = await ingest(t, 1);
    assert.ok(first.ok);
    const saved = await staff().saveDraft(first.sessionId, { title: "Howie's edit" });
    assert.deepEqual(saved, { ok: true });
    const blocked = await ingest(t, 1);
    assert.deepEqual(blocked, { ok: false, refusal: { reason: "human_edited" } });
    assert.equal((await staff().session(first.sessionId))?.title, "Howie's edit");
    // Same payload plus force must still overwrite (and say 'updated', not 'unchanged').
    const forced = await ingest(t, 1, { force: true });
    assert.ok(forced.ok);
    assert.equal(forced.result, "updated");
    assert.notEqual((await staff().session(first.sessionId))?.title, "Howie's edit");
    const after = await ingest(t, 1);
    assert.ok(after.ok && after.result === "unchanged", "edit stamp cleared by forced overwrite");
  });

  it("refuses unknown org/program, out-of-range number, missing engagement", async () => {
    const t = await tenant("i4");
    assert.deepEqual(
      await forIngest(db).upsertDraft(payload("no-such-org", programSlug, t.orgId, 1)),
      { ok: false, refusal: { reason: "unknown_org" } },
    );
    assert.deepEqual(
      await forIngest(db).upsertDraft(payload(t.slug, "no-such-program", t.orgId, 1)),
      { ok: false, refusal: { reason: "unknown_program" } },
    );
    assert.deepEqual(await ingest(t, 4), { ok: false, refusal: { reason: "number_out_of_range", max: 3 } });
    assert.ok((await ingest(t, 3)).ok, "control: the last valid number is accepted");
    await db.insert(schema.programs).values({ slug: `lonely-${t.slug}`, name: "Lonely", sessionCount: 2 });
    assert.deepEqual(
      await forIngest(db).upsertDraft(payload(t.slug, `lonely-${t.slug}`, t.orgId, 1)),
      { ok: false, refusal: { reason: "no_engagement" } },
    );
  });

  it("refuses an asset pathname outside the session prefix, writing nothing", async () => {
    const t = await tenant("i5");
    const other = await tenant("i5b");
    const base = payload(t.slug, programSlug, t.orgId, 1);
    const evil = (pathname: string) =>
      ({ ...base, assets: [{ ...(base.assets[0] as (typeof base.assets)[number]), pathname }] });
    const bad = [
      `portal/${other.orgId}/session-1/slides.pdf`,
      `portal/${t.orgId}/session-2/slides.pdf`,
      `portal/${t.orgId}/session-1/../session-2/x.pdf`,
      `portal/${t.orgId}/session-1/`,
      "slides.pdf",
    ];
    for (const pathname of bad) {
      const r = await forIngest(db).upsertDraft(evil(pathname));
      assert.deepEqual(r, { ok: false, refusal: { reason: "asset_outside_prefix", pathnames: [pathname] } }, pathname);
    }
    const [row] = await db.select().from(schema.coachingSessions).where(eq(schema.coachingSessions.id, t.sessionIds[0] as string));
    assert.equal(row?.lastIngestedAt, null);
    assert.ok((await forIngest(db).upsertDraft(base)).ok, "control: the proper prefix works");
  });

  it("a pathname already owned by another session is refused", async () => {
    const t = await tenant("i6");
    const first = await ingest(t, 1);
    assert.ok(first.ok);
    const base = payload(t.slug, programSlug, t.orgId, 2);
    const stolen = {
      ...base,
      assets: [{ ...(base.assets[0] as (typeof base.assets)[number]), pathname: `portal/${t.orgId}/session-1/slides.pdf` }],
    };
    const r = await forIngest(db).upsertDraft(stolen);
    assert.deepEqual(r, { ok: false, refusal: { reason: "asset_outside_prefix", pathnames: [`portal/${t.orgId}/session-1/slides.pdf`] } });
  });

  it("forIngest has no publish path and never writes status", async () => {
    assert.deepEqual(Object.keys(forIngest(db)).sort(), ["assetPrefix", "upsertDraft"]);
    const t = await tenant("i7");
    const r = await ingest(t, 1);
    assert.ok(r.ok);
    const [row] = await db.select().from(schema.coachingSessions).where(eq(schema.coachingSessions.id, r.sessionId));
    assert.equal(row?.status, "draft");
    assert.equal(row?.publishedBy, null);
  });

  it("orphaned blob pathnames are reported when an update drops an asset", async () => {
    const t = await tenant("i8");
    const first = await ingest(t, 1);
    assert.ok(first.ok);
    const r = await ingest(t, 1, { assets: [] });
    assert.ok(r.ok);
    assert.deepEqual(r.orphanedPathnames, [`portal/${t.orgId}/session-1/slides.pdf`]);
  });
});

describe("ingest payload schema", () => {
  const good = () => payload("acme", "prog", uid(), 1);

  it("accepts a valid payload", () => {
    assert.ok(ingestPayloadSchema.safeParse(good()).success);
  });

  it("rejects an extra top-level key and names it (status, publishedAt)", () => {
    for (const key of ["status", "publishedAt"]) {
      const r = ingestPayloadSchema.safeParse({ ...good(), [key]: "published" });
      assert.equal(r.success, false);
      assert.ok(!r.success);
      const issue = r.error.issues.find((i) => i.code === "unrecognized_keys");
      assert.ok(issue && "keys" in issue);
      assert.deepEqual(issue.keys, [key]);
      assert.match(JSON.stringify(r.error.issues), new RegExp(key));
    }
  });

  it("is strict at nested levels too", () => {
    const g = good();
    for (const bad of [
      { ...g, source: { ...g.source, status: "published" } },
      { ...g, tasks: [{ text: "x", done: true }] },
      { ...g, assets: [{ ...(g.assets[0] as object), status: "published" }] },
    ]) {
      const r = ingestPayloadSchema.safeParse(bad);
      assert.ok(!r.success);
      assert.ok(r.error.issues.some((i) => i.code === "unrecognized_keys"));
    }
  });

  it("control: a wrong content type for the kind is rejected", () => {
    const g = good();
    const r = ingestPayloadSchema.safeParse({ ...g, assets: [{ ...(g.assets[0] as object), contentType: "text/html" }] });
    assert.equal(r.success, false);
  });
});

describe("staff", () => {
  it("publish makes the session visible to its client; unpublish hides it again", async () => {
    const t = await tenant("s1");
    const r = await ingest(t, 1);
    assert.ok(r.ok);
    assert.equal(await t.client.session(r.sessionId), null, "draft hidden");
    assert.deepEqual(await staff().publish(r.sessionId), { ok: true });
    const seen = await t.client.session(r.sessionId);
    assert.ok(seen);
    assert.equal(seen.title, `Session 1 title for ${t.slug}`);
    assert.equal(seen.tasks.length, 2);
    assert.equal(seen.nextTime.length, 1);
    const asset = seen.assets[0];
    assert.ok(asset);
    assert.ok(await t.client.asset(asset.id));
    const road = await t.client.roadmap();
    assert.equal(road[0]?.sessions[0]?.state, "done");

    const [pub] = await db.select().from(schema.coachingSessions).where(eq(schema.coachingSessions.id, r.sessionId));
    assert.equal(pub?.publishedBy, adminId);
    assert.ok(pub?.publishedAt);

    assert.deepEqual(await staff().publish(r.sessionId), { ok: false, reason: "already_published" });
    assert.deepEqual(await staff().unpublish(r.sessionId), { ok: true });
    assert.equal(await t.client.session(r.sessionId), null);
    assert.equal(await t.client.asset(asset.id), null);
    assert.deepEqual(await staff().unpublish(r.sessionId), { ok: false, reason: "not_published" });
    const actions = await db.select({ a: schema.auditLog.action }).from(schema.auditLog).where(eq(schema.auditLog.sessionId, r.sessionId));
    assert.ok(["session.publish", "session.unpublish", "ingest.created"].every((a) => actions.some((x) => x.a === a)));
  });

  it("publishing an empty draft is refused", async () => {
    const t = await tenant("s2");
    assert.deepEqual(await staff().publish(t.sessionIds[0] as string), { ok: false, reason: "incomplete" });
  });

  it("createEngagement pre-creates one draft per program session; a second call is refused", async () => {
    const t = await tenant("s3");
    const rows = await db.select().from(schema.coachingSessions).where(eq(schema.coachingSessions.orgId, t.orgId));
    assert.deepEqual(rows.map((r) => r.number).sort(), [1, 2, 3]);
    assert.ok(rows.every((r) => r.status === "draft"));
    assert.deepEqual(await staff().createEngagement({ orgId: t.orgId, programSlug, startsOn: null }), { ok: false, reason: "already_exists" });
    assert.equal(await staff().createEngagement({ orgId: uid(), programSlug, startsOn: null }), null);
  });

  it("saveDraft/replaceItems/addAsset/removeAsset stamp the human edit and refuse published sessions", async () => {
    const t = await tenant("s4");
    const first = await ingest(t, 1);
    assert.ok(first.ok);
    assert.deepEqual(await staff().replaceItems(first.sessionId, { tasks: ["only one"], nextTime: [] }), { ok: true });
    const s = await staff().session(first.sessionId);
    assert.deepEqual(s?.tasks.map((i) => i.text), ["only one"]);
    assert.equal(s?.editedBy, adminId);
    assert.ok(s?.editedAt);
    const prefix = forIngest(db).assetPrefix(t.orgId, 1);
    const asset = {
      kind: "slide_image" as const,
      blobPathname: `${prefix}s1.png`,
      contentType: "image/png",
      bytes: 10,
      sha256: "b".repeat(64),
      label: null,
    };
    const added = await staff().addAsset(first.sessionId, asset);
    assert.ok(added?.ok);
    assert.deepEqual(await staff().addAsset(first.sessionId, asset), { ok: false, reason: "pathname_in_use" });
    assert.deepEqual(await staff().addAsset(first.sessionId, { ...asset, blobPathname: "elsewhere/s1.png" }), { ok: false, reason: "outside_prefix" });
    assert.deepEqual(await staff().addAsset(first.sessionId, { ...asset, blobPathname: `${prefix}s2.png`, contentType: "text/html" }), { ok: false, reason: "content_type_not_allowed" });
    const removed = await staff().removeAsset(added.assetId);
    assert.deepEqual(removed, { ok: true, blobPathname: asset.blobPathname });
    assert.equal(await staff().removeAsset(added.assetId), null);
    assert.ok((await staff().publish(first.sessionId))?.ok);
    assert.deepEqual(await staff().saveDraft(first.sessionId, { title: "x" }), { ok: false, reason: "published" });
    assert.deepEqual(await staff().replaceItems(first.sessionId, { tasks: [], nextTime: [] }), { ok: false, reason: "published" });
    assert.equal(await staff().saveDraft(uid(), { title: "x" }), null);
  });

  it("disableUser ends the client's auth sessions and refuses self", async () => {
    const t = await tenant("s5");
    await db.insert(schema.authSessions).values({ sessionToken: `tok-${t.slug}`, userId: t.clientId, expires: new Date(Date.now() + 1e6) });
    assert.deepEqual(await staff().disableUser(adminId), { ok: false, reason: "self" });
    assert.equal(await staff().disableUser(uid()), null);
    assert.deepEqual(await staff().disableUser(t.clientId), { ok: true });
    const left = await db.select().from(schema.authSessions).where(eq(schema.authSessions.userId, t.clientId));
    assert.equal(left.length, 0);
    const [u] = await db.select().from(schema.users).where(eq(schema.users.id, t.clientId));
    assert.ok(u?.disabledAt);
  });

  it("capabilities are enforced: a coach cannot create orgs, can publish", async () => {
    const coach = forStaff(testOnlyStaffPrincipal(coachId, "coach"), db);
    await assert.rejects(coach.createOrg({ slug: "nope", name: "Nope" }), PortalForbiddenError);
    const t = await tenant("s6");
    const r = await ingest(t, 1);
    assert.ok(r.ok);
    assert.deepEqual(await coach.publish(r.sessionId), { ok: true });
  });

  it("draftQueue lists ingested drafts, not blank ones and not published ones", async () => {
    const t = await tenant("s7");
    const a = await ingest(t, 1);
    const b = await ingest(t, 2);
    assert.ok(a.ok && b.ok);
    await staff().publish(a.sessionId);
    const ids = (await staff().draftQueue()).map((d) => d.id);
    assert.ok(ids.includes(b.sessionId));
    assert.ok(!ids.includes(a.sessionId));
    assert.ok(!ids.includes(t.sessionIds[2] as string));
  });
});

describe("auth adapter shapes", () => {
  it("DrizzleAdapter works against the auth_* tables with the invited user", async () => {
    const t = await tenant("ad");
    const adapter = DrizzleAdapter(db, {
      usersTable: schema.users,
      accountsTable: schema.authAccounts,
      sessionsTable: schema.authSessions,
      verificationTokensTable: schema.authVerificationTokens,
    });
    const email = `client@${t.slug}.test`;
    const user = await adapter.getUserByEmail?.(email);
    assert.equal(user?.id, t.clientId);
    assert.equal(await adapter.getUserByEmail?.(`nobody@${t.slug}.test`), null);
    const expires = new Date(Date.now() + 60_000);
    await adapter.createVerificationToken?.({ identifier: email, token: "tok1", expires });
    const used = await adapter.useVerificationToken?.({ identifier: email, token: "tok1" });
    assert.equal(used?.identifier, email);
    assert.equal(await adapter.useVerificationToken?.({ identifier: email, token: "tok1" }), null, "single use");
    // No self-signup: the adapter cannot invent a user (role has no default, clients need an org).
    await assert.rejects(adapter.createUser?.({ id: uid(), email: "stranger@example.test", emailVerified: null }) as Promise<unknown>);
  });
});
