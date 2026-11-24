import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import { eq } from "drizzle-orm";
import { forAuth, LOGIN_LINK_LIFETIME_MS } from "../../lib/portal/data/auth";
import { forClient } from "../../lib/portal/data/client";
import { forStaff } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import { freshDb, testOnlyClientPrincipal, testOnlyStaffPrincipal, uid } from "./helpers";

// New queries of the auth ticket: doneByName, orgName, latestPublished, the token-count
// behind the rate limit, and session -> user. Each has a cross-organisation control.

let db: PortalDb;
let admin: ReturnType<typeof forStaff>;

type Tenant = {
  orgId: string;
  orgName: string;
  userA: string; // "Alex" (named)
  userB: string; // no name, email only
  sessionIds: string[];
  client: (userId: string) => ReturnType<typeof forClient>;
};

async function tenant(label: string, programSlug: string): Promise<Tenant> {
  const slug = `${label}-${uid().slice(0, 6)}`;
  const orgName = `Org ${label}`;
  const org = await admin.createOrg({ slug, name: orgName });
  assert.ok(org.ok);
  const eng = await admin.createEngagement({ orgId: org.orgId, programSlug, startsOn: null });
  assert.ok(eng !== null && eng.ok);
  const a = await admin.inviteClient({ orgId: org.orgId, email: `alex@${slug}.test`, name: "Alex" });
  const b = await admin.inviteClient({ orgId: org.orgId, email: `robin@${slug}.test`, name: null });
  assert.ok(a !== null && a.ok && b !== null && b.ok);
  const rows = await db
    .select({ id: schema.coachingSessions.id })
    .from(schema.coachingSessions)
    .where(eq(schema.coachingSessions.orgId, org.orgId))
    .orderBy(schema.coachingSessions.number);
  return {
    orgId: org.orgId,
    orgName,
    userA: a.userId,
    userB: b.userId,
    sessionIds: rows.map((r) => r.id),
    client: (userId) => forClient(testOnlyClientPrincipal(userId, org.orgId), db),
  };
}

async function publishWithItems(sessionId: string, title: string, tasks: string[]) {
  assert.ok(await admin.saveDraft(sessionId, { title, summaryMd: `Summary ${title}` }));
  assert.ok(await admin.replaceItems(sessionId, { tasks, nextTime: [] }));
  const r = await admin.publish(sessionId);
  assert.ok(r !== null && r.ok, `publish ${title}`);
}

before(async () => {
  ({ db } = await freshDb());
  const [a] = await db.insert(schema.users).values({ email: "admin@q.test", role: "admin" }).returning({ id: schema.users.id });
  admin = forStaff(testOnlyStaffPrincipal(a!.id, "admin"), db);
  await db.insert(schema.programs).values([
    { slug: "prog", name: "Program", sessionCount: 4 },
    { slug: "other-prog", name: "Other program", sessionCount: 2 },
  ]);
});

describe("doneByName", () => {
  it("shows the user who ticked: the right user, name else email local part, none while open", async () => {
    const t = await tenant("dn", "prog");
    await publishWithItems(t.sessionIds[0]!, "S1", ["one", "two"]);
    const session = await t.client(t.userA).session(t.sessionIds[0]!);
    assert.ok(session);
    assert.ok(session.tasks.every((i) => i.doneByName === null), "open items carry no name");
    const [one, two] = session.tasks;

    const tickedByAlex = await t.client(t.userA).setItemDone(one!.id, true);
    assert.equal(tickedByAlex?.doneByName, "Alex");
    const tickedByRobin = await t.client(t.userB).setItemDone(two!.id, true);
    assert.equal(tickedByRobin?.doneByName, "robin", "no name: the part before the @");

    const read = await t.client(t.userB).session(t.sessionIds[0]!);
    assert.deepEqual(
      read?.tasks.map((i) => [i.text, i.done, i.doneByName]),
      [["one", true, "Alex"], ["two", true, "robin"]],
    );
    // ticking an already-done item does not steal it
    const again = await t.client(t.userB).setItemDone(one!.id, true);
    assert.equal(again?.doneByName, "Alex");
    // unticking clears the name
    const cleared = await t.client(t.userB).setItemDone(one!.id, false);
    assert.equal(cleared?.done, false);
    assert.equal(cleared?.doneByName, null);

    // staff see the same name
    const staffView = await admin.session(t.sessionIds[0]!);
    assert.deepEqual(staffView?.tasks.map((i) => [i.text, i.doneByName]), [["one", null], ["two", "robin"]]);
  });

  it("cross-org control: a name from another organisation never comes back", async () => {
    const a = await tenant("dxa", "prog");
    const b = await tenant("dxb", "prog");
    await publishWithItems(a.sessionIds[0]!, "S1", ["only"]);
    const item = (await a.client(a.userA).session(a.sessionIds[0]!))!.tasks[0]!;
    // corrupt on purpose: item of org A "ticked" by a user of org B (the DAL can never do this)
    await db
      .update(schema.sessionItems)
      .set({ doneAt: new Date(), doneBy: b.userA })
      .where(eq(schema.sessionItems.id, item.id));
    const view = await a.client(a.userB).session(a.sessionIds[0]!);
    assert.equal(view?.tasks[0]?.done, true);
    assert.equal(view?.tasks[0]?.doneByName, null, "Alex of org B is not disclosed to org A");
    // control: the same row, same user, in the staff view (which sees every org) does show it
    assert.equal((await admin.session(a.sessionIds[0]!))?.tasks[0]?.doneByName, "Alex");
    // and org B cannot read or tick org A's item at all
    assert.equal(await b.client(b.userA).session(a.sessionIds[0]!), null);
    assert.equal(await b.client(b.userA).setItemDone(item.id, false), null);
  });
});

describe("orgName", () => {
  it("StaffSessionDto carries the organisation's name", async () => {
    const t = await tenant("on", "prog");
    const s = await admin.session(t.sessionIds[2]!);
    assert.equal(s?.orgName, t.orgName);
    assert.notEqual(s?.orgName, s?.orgSlug);
  });
});

describe("latestPublished", () => {
  it("is the highest published number, not the most recently published", async () => {
    const t = await tenant("lp", "prog");
    assert.equal(await t.client(t.userA).latestPublished(), null, "nothing published yet");
    await publishWithItems(t.sessionIds[0]!, "S1", ["a"]);
    await publishWithItems(t.sessionIds[2]!, "S3", ["c"]);
    assert.equal((await t.client(t.userA).latestPublished())?.number, 3);
    // session 1 unpublished and published again later: it is newer by time, not by number
    assert.ok((await admin.unpublish(t.sessionIds[0]!))?.ok);
    assert.ok((await admin.publish(t.sessionIds[0]!))?.ok);
    assert.equal((await t.client(t.userA).latestPublished())?.number, 3);
    // an unpublished (draft) session 4 is never "latest"
    assert.equal((await t.client(t.userA).latestPublished("prog"))?.number, 3);
    assert.equal(await t.client(t.userA).latestPublished("other-prog"), null, "scoped to a program");
  });

  it("cross-org control: another organisation's published session is never returned", async () => {
    const a = await tenant("lpa", "prog");
    const b = await tenant("lpb", "prog");
    await publishWithItems(a.sessionIds[3]!, "A4", ["x"]);
    assert.equal((await a.client(a.userA).latestPublished())?.number, 4);
    assert.equal(await b.client(b.userA).latestPublished(), null);
    await publishWithItems(b.sessionIds[0]!, "B1", ["y"]);
    const mine = await b.client(b.userA).latestPublished();
    assert.equal(mine?.number, 1);
    assert.equal(mine?.title, "B1");
    assert.equal((await a.client(a.userA).latestPublished())?.title, "A4");
  });
});

describe("login token count and session lookup", () => {
  it("counts only this address's recent tokens", async () => {
    const dal = forAuth(db);
    const now = new Date();
    const issuedAgo = (min: number) => new Date(now.getTime() - min * 60_000 + LOGIN_LINK_LIFETIME_MS);
    await db.insert(schema.authVerificationTokens).values([
      { identifier: "count@x.test", token: "t1", expires: issuedAgo(1) },
      { identifier: "count@x.test", token: "t2", expires: issuedAgo(59) },
      { identifier: "count@x.test", token: "t3", expires: issuedAgo(61) }, // older than an hour
      { identifier: "other@x.test", token: "t4", expires: issuedAgo(1) }, // someone else
    ]);
    assert.equal(await dal.recentLinkCount("count@x.test", now), 2);
    assert.equal(await dal.recentLinkCount("Count@X.test", now), 2, "case-insensitive");
    assert.equal(await dal.recentLinkCount("other@x.test", now), 1);
    assert.equal(await dal.recentLinkCount("none@x.test", now), 0);
  });

  it("session token resolves to its own user and organisation only", async () => {
    const a = await tenant("sa", "prog");
    const b = await tenant("sb", "prog");
    const ta = uid();
    const tb = uid();
    await db.insert(schema.authSessions).values([
      { sessionToken: ta, userId: a.userA, expires: new Date(Date.now() + 60_000) },
      { sessionToken: tb, userId: b.userA, expires: new Date(Date.now() + 60_000) },
    ]);
    const dal = forAuth(db);
    const ua = await dal.sessionUser(ta);
    const ub = await dal.sessionUser(tb);
    assert.equal(ua?.orgId, a.orgId);
    assert.equal(ua?.orgName, a.orgName);
    assert.equal(ub?.orgId, b.orgId);
    assert.notEqual(ua?.id, ub?.id);
    assert.equal(await dal.sessionUser(`${ta}x`), null, "a near-miss token is nobody");
    assert.equal(await dal.sessionUser(""), null);
    const staffToken = uid();
    await db.insert(schema.authSessions).values({
      sessionToken: staffToken,
      userId: (await db.select().from(schema.users).where(eq(schema.users.email, "admin@q.test")))[0]!.id,
      expires: new Date(Date.now() + 60_000),
    });
    const staff = await dal.sessionUser(staffToken);
    assert.equal(staff?.role, "admin");
    assert.equal(staff?.orgId, null);
    assert.equal(staff?.orgName, null);
  });
});
