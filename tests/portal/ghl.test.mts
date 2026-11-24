import assert from "node:assert/strict";
import { after, before, describe, it } from "node:test";
import { and, eq, like } from "drizzle-orm";
import { createCoachActions } from "../../lib/portal/actions/coach-core";
import { forStaff, PortalForbiddenError } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import { type GhlResult, syncContact } from "../../lib/portal/ghl";
import { freshDb, testOnlyStaffPrincipal, uid } from "./helpers";

// CONTROL: no test in this file may reach the real network. Any call that goes through the
// global fetch (instead of an injected fake) is counted, refused, and fails the suite.
const realFetch = globalThis.fetch;
let globalFetchCalls = 0;
globalThis.fetch = (async () => {
  globalFetchCalls += 1;
  throw new Error("global fetch must not be used in tests");
}) as typeof fetch;
after(() => {
  globalThis.fetch = realFetch;
  assert.equal(globalFetchCalls, 0, "the real fetch was invoked by a test");
});

const TOKEN = "pit-SECRET-token-for-tests-only";
const LOCATION = "loc-test-123";
const ENV = { GHL_PIT_TOKEN: TOKEN, GHL_LOCATION_ID: LOCATION };

type Call = { url: string; method: string | undefined; headers: Record<string, string>; body: unknown };

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
}

function fakeFetch(handler: (c: Call, n: number) => Response | Promise<Response>) {
  const calls: Call[] = [];
  const fn = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const call: Call = {
      url: String(input),
      method: init?.method,
      headers: { ...(init?.headers as Record<string, string>) },
      body: typeof init?.body === "string" ? JSON.parse(init.body) : undefined,
    };
    calls.push(call);
    return handler(call, calls.length);
  }) as typeof fetch;
  return { fn, calls };
}

const happy = (c: Call) =>
  c.url.endsWith("/contacts/upsert") ? json(200, { contact: { id: "c-1" }, new: true }) : json(200, { tags: [] });

describe("syncContact (fake fetch)", () => {
  it("not_configured when either variable is missing, and fetch is never called", async () => {
    for (const env of [{}, { GHL_PIT_TOKEN: TOKEN }, { GHL_LOCATION_ID: LOCATION }, { GHL_PIT_TOKEN: "", GHL_LOCATION_ID: "" }]) {
      const f = fakeFetch(happy);
      const r = await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: f.fn, env });
      assert.equal(r.ok, false);
      assert.equal(r.ok === false && r.reason, "not_configured");
      assert.equal(f.calls.length, 0);
    }
  });

  it("upserts by email (no tags in the upsert), then adds tags in a separate additive call", async () => {
    const f = fakeFetch(happy);
    const r = await syncContact(
      { email: "  Mixed@Case.TEST ", name: "Ada Lovelace King", tags: ["coaching-client", "portal-invited"] },
      { fetch: f.fn, env: ENV },
    );
    assert.deepEqual(r, { ok: true, contactId: "c-1" });
    assert.equal(f.calls.length, 2);
    const [up, tag] = f.calls;
    assert.equal(up!.url, "https://services.leadconnectorhq.com/contacts/upsert");
    assert.equal(up!.method, "POST");
    assert.equal(up!.headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(up!.headers.Version, "2021-07-28");
    assert.equal(up!.headers["Content-Type"], "application/json");
    const body = up!.body as Record<string, unknown>;
    assert.equal(body.locationId, LOCATION);
    assert.equal(body.email, "mixed@case.test");
    assert.equal(body.firstName, "Ada");
    assert.equal(body.lastName, "Lovelace King");
    assert.equal("tags" in body, false, "upsert REPLACES tags on an existing contact, so it must not carry any");
    assert.equal(tag!.url, "https://services.leadconnectorhq.com/contacts/c-1/tags");
    assert.equal(tag!.method, "POST");
    assert.equal(tag!.headers.Authorization, `Bearer ${TOKEN}`);
    assert.equal(tag!.headers.Version, "2021-07-28");
    assert.deepEqual(tag!.body, { tags: ["coaching-client", "portal-invited"] });
  });

  it("401 and 500 on upsert map to http_error, tags are not attempted, token never echoed", async () => {
    for (const status of [401, 500]) {
      const f = fakeFetch(() => json(status, { message: `bad credentials ${TOKEN}` }));
      const r = await syncContact({ email: "a@b.test", name: null, tags: ["t"] }, { fetch: f.fn, env: ENV });
      assert.equal(r.ok, false);
      assert.equal(r.ok === false && r.reason, "http_error");
      assert.match(r.ok === false ? r.detail : "", new RegExp(`HTTP ${status}`));
      assert.equal(JSON.stringify(r).includes(TOKEN), false, "token must be scrubbed from the result");
      assert.equal(f.calls.length, 1);
    }
  });

  it("a failing tags call is an http_error too (contact exists, tagging did not happen)", async () => {
    const f = fakeFetch((c) => (c.url.endsWith("/upsert") ? json(200, { contact: { id: "c-9" } }) : json(500, {})));
    const r = await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: f.fn, env: ENV });
    assert.equal(r.ok === false && r.reason, "http_error");
    assert.match(r.ok === false ? r.detail : "", /tags: HTTP 500/);
  });

  it("an upsert answer without a contact id is an http_error, never a fake success", async () => {
    const f = fakeFetch(() => json(200, {}));
    const r = await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: f.fn, env: ENV });
    assert.equal(r.ok === false && r.reason, "http_error");
    assert.equal(f.calls.length, 1);
  });

  it("thrown network errors and timeouts map to network and never throw", async () => {
    const boom = fakeFetch(() => {
      throw new TypeError(`fetch failed for ${TOKEN}`);
    });
    const r1 = await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: boom.fn, env: ENV });
    assert.equal(r1.ok === false && r1.reason, "network");
    assert.equal(JSON.stringify(r1).includes(TOKEN), false);

    const hang = (async (_u: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_res, rej) => {
        init?.signal?.addEventListener("abort", () => rej(init.signal!.reason));
      })) as typeof fetch;
    const r2 = await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: hang, env: ENV, timeoutMs: 30 });
    assert.equal(r2.ok === false && r2.reason, "network");
    assert.match(r2.ok === false ? r2.detail : "", /timed out after 30 ms/);
  });

  it("the timeout is 8 s by default (the signal handed to fetch is armed)", async () => {
    let signal: AbortSignal | null | undefined;
    const f = (async (u: RequestInfo | URL, init?: RequestInit) => {
      signal = init?.signal;
      return happy({ url: String(u) } as Call);
    }) as typeof fetch;
    await syncContact({ email: "a@b.test", name: "A", tags: ["t"] }, { fetch: f, env: ENV });
    assert.ok(signal instanceof AbortSignal);
    assert.equal(signal.aborted, false);
  });
});

// ── Wiring: invite + publish against a real (PGlite) database ───────────────────────────

let db: PortalDb;
let adminId: string;
let programSlug: string;

const staff = () => forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);

type Org = { id: string; slug: string; sessionIds: string[] };

async function org(label: string): Promise<Org> {
  const slug = `${label}-${uid().slice(0, 8)}`;
  const o = await staff().createOrg({ slug, name: `Org ${slug}` });
  assert.ok(o.ok);
  const e = await staff().createEngagement({ orgId: o.orgId, programSlug, startsOn: "2026-12-01" });
  assert.ok(e !== null && e.ok);
  const rows = await db
    .select({ id: schema.coachingSessions.id })
    .from(schema.coachingSessions)
    .where(eq(schema.coachingSessions.orgId, o.orgId))
    .orderBy(schema.coachingSessions.number);
  return { id: o.orgId, slug, sessionIds: rows.map((r) => r.id) };
}

type Recorded = { email: string; name: string | null; tags: readonly string[] };

function actionsWith(ghl: (c: Recorded) => Promise<GhlResult>) {
  const seen: Recorded[] = [];
  const actions = createCoachActions({
    requireStaff: async () => testOnlyStaffPrincipal(adminId, "admin"),
    dal: (p) => forStaff(p, db),
    ghl: async (c) => {
      seen.push({ email: c.email, name: c.name, tags: c.tags });
      return ghl(c);
    },
  });
  return { actions, seen };
}

const ok: (c: Recorded) => Promise<GhlResult> = async () => ({ ok: true, contactId: "c" });
const fail =
  (reason: "not_configured" | "http_error" | "network", detail: string) =>
  async (): Promise<GhlResult> => ({ ok: false, reason, detail });

const ghlAudit = (orgId: string) =>
  db
    .select()
    .from(schema.auditLog)
    .where(and(eq(schema.auditLog.orgId, orgId), like(schema.auditLog.action, "ghl_sync%")));

async function addClient(orgId: string, email: string, name: string | null, disabled = false) {
  await db.insert(schema.users).values({ email, name, role: "client", orgId, disabledAt: disabled ? new Date() : null });
}

async function draftReady(o: Org, index: number) {
  const { actions } = actionsWith(ok);
  const r = await actions.saveDraft(o.sessionIds[index], {
    title: `Title ${index + 1}`,
    summaryMd: "Summary",
    tasks: ["one", "two", "three"],
    nextTime: ["bring A", "bring B"],
  });
  assert.equal(r.ok, true);
}

before(async () => {
  ({ db } = await freshDb());
  const [u] = await db.insert(schema.users).values({ email: "admin@ghl.test", role: "admin" }).returning({ id: schema.users.id });
  adminId = u!.id;
  programSlug = "prog-ghl";
  await db.insert(schema.programs).values({ slug: programSlug, name: "GHL Program", sessionCount: 3 });
});

describe("invite client -> GoHighLevel", () => {
  it("syncs with tags coaching-client + portal-invited AFTER the user row exists, audits ghl_sync_ok", async () => {
    const o = await org("inv-ok");
    const { actions, seen } = actionsWith(async (c) => {
      const [row] = await db.select().from(schema.users).where(eq(schema.users.email, c.email));
      assert.ok(row, "the invite is already committed when GHL is called");
      return { ok: true, contactId: "c" };
    });
    const r = await actions.inviteClient(o.id, { email: "New.Person@Example.test", name: " New Person " });
    assert.equal(r.ok, true);
    assert.equal(r.ok && "warning" in r, false, "no warning on a clean sync");
    assert.deepEqual(seen, [{ email: "new.person@example.test", name: "New Person", tags: ["coaching-client", "portal-invited"] }]);
    const rows = await ghlAudit(o.id);
    assert.deepEqual(rows.map((a) => a.action), ["ghl_sync_ok"]);
    assert.equal((rows[0]!.detail as { kind: string }).kind, "invite");
  });

  for (const [label, handler, expected] of [
    ["not_configured", fail("not_configured", "GHL_PIT_TOKEN not set"), /not configured/],
    ["401", fail("http_error", "upsert: HTTP 401"), /refused the request/],
    ["500", fail("http_error", "upsert: HTTP 500"), /refused the request/],
    ["network", fail("network", "TypeError: fetch failed"), /could not reach GoHighLevel/],
  ] as const) {
    it(`GHL ${label}: the invite stays committed, an audit row records the failure, the warning is returned`, async () => {
      const o = await org(`inv-${label.replace("_", "-")}`);
      const { actions } = actionsWith(handler);
      const email = `kept-${label}@example.test`;
      const r = await actions.inviteClient(o.id, { email, name: "Kept" });
      assert.equal(r.ok, true, "GHL failure must not fail the invite");
      assert.match(r.ok ? (r.warning ?? "") : "", /^GoHighLevel was not updated: /);
      assert.match(r.ok ? (r.warning ?? "") : "", expected);
      const [row] = await db.select().from(schema.users).where(eq(schema.users.email, email));
      assert.ok(row, "user row still committed");
      const rows = await ghlAudit(o.id);
      assert.deepEqual(rows.map((a) => a.action), ["ghl_sync_failed"]);
      assert.equal((rows[0]!.detail as { reason: string }).reason, label === "401" || label === "500" ? "http_error" : label);
    });
  }

  it("a sync function that THROWS still cannot fail the invite", async () => {
    const o = await org("inv-throw");
    const { actions } = actionsWith(async () => {
      throw new Error("boom");
    });
    const r = await actions.inviteClient(o.id, { email: "throw@example.test", name: "T" });
    assert.equal(r.ok, true);
    assert.match(r.ok ? (r.warning ?? "") : "", /could not reach GoHighLevel/);
    const [row] = await db.select().from(schema.users).where(eq(schema.users.email, "throw@example.test"));
    assert.ok(row);
    assert.equal((await ghlAudit(o.id))[0]?.action, "ghl_sync_failed");
  });

  it("refused invites (duplicate, bad email) never reach GHL", async () => {
    const o = await org("inv-refused");
    const { actions, seen } = actionsWith(ok);
    assert.equal((await actions.inviteClient(o.id, { email: "dup@example.test", name: "D" })).ok, true);
    assert.equal(seen.length, 1);
    assert.equal((await actions.inviteClient(o.id, { email: "DUP@example.test", name: "D" })).ok, false);
    assert.equal((await actions.inviteClient(o.id, { email: "nope", name: "D" })).ok, false);
    assert.equal(seen.length, 1, "control: refusals did not sync");
    assert.equal((await ghlAudit(o.id)).length, 1);
  });

  it("end to end with the real syncContact on a fake fetch: 401 leaves the invite, audit row has no token", async () => {
    const o = await org("inv-e2e");
    const f = fakeFetch(() => json(401, { message: `Invalid token ${TOKEN}` }));
    const actions = createCoachActions({
      requireStaff: async () => testOnlyStaffPrincipal(adminId, "admin"),
      dal: (p) => forStaff(p, db),
      ghl: (c) => syncContact(c, { fetch: f.fn, env: ENV }),
    });
    const r = await actions.inviteClient(o.id, { email: "e2e@example.test", name: "E2E" });
    assert.equal(r.ok, true);
    assert.match(r.ok ? (r.warning ?? "") : "", /refused the request/);
    const [row] = await db.select().from(schema.users).where(eq(schema.users.email, "e2e@example.test"));
    assert.ok(row);
    const rows = await ghlAudit(o.id);
    assert.equal(rows[0]?.action, "ghl_sync_failed");
    assert.equal(JSON.stringify(rows).includes(TOKEN), false, "audit rows carry no secret");
    assert.equal(JSON.stringify(r).includes(TOKEN), false);
  });
});

describe("publish session -> GoHighLevel", () => {
  async function scene() {
    const o = await org("pub");
    const other = await org("pub-other");
    const d = `${o.slug}.test`;
    await addClient(o.id, `one@${d}`, "One");
    await addClient(o.id, `two@${d}`, null);
    await addClient(o.id, `gone@${d}`, "Gone", true);
    await addClient(other.id, `foreign@${d}`, "Foreign");
    return { o, other };
  }

  it("tags every ENABLED client of that organisation only, with the two session tags", async () => {
    const { o, other } = await scene();
    await draftReady(o, 1);
    const { actions, seen } = actionsWith(ok);
    const r = await actions.publish(o.sessionIds[1]);
    assert.equal(r.ok, true);
    assert.equal(r.ok && "warning" in r, false);
    assert.deepEqual(
      seen.map((s) => s.email).sort(),
      [`one@${o.slug}.test`, `two@${o.slug}.test`],
      "disabled and foreign-organisation clients are excluded",
    );
    for (const s of seen) assert.deepEqual(s.tags, ["portal-session-published", "portal-session-02-published"]);
    assert.equal((await ghlAudit(o.id)).map((a) => a.action).join(), "ghl_sync_ok");
    assert.equal((await ghlAudit(other.id)).length, 0, "nothing recorded against the other organisation");
  });

  it("two-digit padding follows the session number", async () => {
    const { o } = await scene();
    await draftReady(o, 2);
    const { actions, seen } = actionsWith(ok);
    assert.equal((await actions.publish(o.sessionIds[2])).ok, true);
    assert.deepEqual(seen[0]?.tags, ["portal-session-published", "portal-session-03-published"]);
  });

  it("GHL down: the session is still published, an audit row records it, the warning is returned", async () => {
    const { o } = await scene();
    await draftReady(o, 0);
    const { actions } = actionsWith(fail("http_error", "upsert: HTTP 500"));
    const r = await actions.publish(o.sessionIds[0]);
    assert.equal(r.ok, true);
    assert.match(r.ok ? (r.warning ?? "") : "", /GoHighLevel was not updated: GoHighLevel refused the request \(2 of 2 contacts failed\)\./);
    const [row] = await db.select().from(schema.coachingSessions).where(eq(schema.coachingSessions.id, o.sessionIds[0]!));
    assert.equal(row?.status, "published", "publish not rolled back");
    const rows = await ghlAudit(o.id);
    assert.equal(rows[0]?.action, "ghl_sync_failed");
    assert.equal(rows[0]?.sessionId, o.sessionIds[0]);
    assert.equal((rows[0]!.detail as { failed: number }).failed, 2);
  });

  it("not_configured on publish is shown as a warning, not hidden", async () => {
    const { o } = await scene();
    await draftReady(o, 1);
    const actions = createCoachActions({
      requireStaff: async () => testOnlyStaffPrincipal(adminId, "admin"),
      dal: (p) => forStaff(p, db),
      ghl: (c) => syncContact(c, { fetch: fakeFetch(happy).fn, env: {} }),
    });
    const r = await actions.publish(o.sessionIds[1]);
    assert.equal(r.ok, true);
    assert.match(r.ok ? (r.warning ?? "") : "", /not configured/);
  });

  it("an organisation without enabled clients gets a warning and a failed audit row", async () => {
    const o = await org("pub-empty");
    await addClient(o.id, `off@${o.slug}.test`, "Off", true);
    await draftReady(o, 0);
    const { actions, seen } = actionsWith(ok);
    const r = await actions.publish(o.sessionIds[0]);
    assert.equal(r.ok, true);
    assert.match(r.ok ? (r.warning ?? "") : "", /no enabled client in this organisation/);
    assert.equal(seen.length, 0);
    assert.equal((await ghlAudit(o.id))[0]?.action, "ghl_sync_failed");
  });

  it("a refused publish (incomplete draft, already published) and unpublish never touch GHL", async () => {
    const { o } = await scene();
    const { actions, seen } = actionsWith(ok);
    assert.equal((await actions.publish(o.sessionIds[0])).ok, false, "incomplete draft refused");
    await draftReady(o, 1);
    assert.equal((await actions.publish(o.sessionIds[1])).ok, true);
    const synced = seen.length;
    assert.equal(synced, 2);
    assert.equal((await actions.publish(o.sessionIds[1])).ok, false, "already published");
    assert.equal((await actions.unpublish(o.sessionIds[1])).ok, true);
    assert.equal(seen.length, synced, "control: only the one successful publish synced");
  });
});

describe("publishedSessions (staff)", () => {
  it("lists published sessions with counts; a draft never appears; unpublish removes it", async () => {
    const o = await org("list");
    await draftReady(o, 0);
    await draftReady(o, 1);
    const { actions } = actionsWith(ok);
    const before = (await staff().publishedSessions()).filter((s) => s.orgSlug === o.slug);
    assert.deepEqual(before, [], "control: two ready drafts, nothing published, nothing listed");

    assert.equal((await actions.publish(o.sessionIds[1])).ok, true);
    // tick 2 of the 5 items
    const items = await db
      .select()
      .from(schema.sessionItems)
      .where(eq(schema.sessionItems.sessionId, o.sessionIds[1]!));
    assert.equal(items.length, 5);
    for (const i of items.slice(0, 2)) {
      await db.update(schema.sessionItems).set({ doneAt: new Date(), doneBy: adminId }).where(eq(schema.sessionItems.id, i.id));
    }

    const listed = (await staff().publishedSessions()).filter((s) => s.orgSlug === o.slug);
    assert.equal(listed.length, 1);
    const [entry] = listed;
    assert.equal(entry?.id, o.sessionIds[1]);
    assert.equal(entry?.number, 2);
    assert.equal(entry?.title, "Title 2");
    assert.equal(entry?.orgName, `Org ${o.slug}`);
    assert.equal(entry?.programSlug, programSlug);
    assert.ok(entry?.publishedAt instanceof Date);
    assert.equal(entry?.doneItems, 2);
    assert.equal(entry?.openItems, 3);
    assert.equal(
      (await staff().publishedSessions()).some((s) => s.id === o.sessionIds[0]),
      false,
      "the other draft is not listed",
    );

    assert.equal((await actions.unpublish(o.sessionIds[1])).ok, true);
    assert.equal((await staff().publishedSessions()).some((s) => s.id === o.sessionIds[1]), false);
  });

  it("a client role cannot reach it, nor the recipients or the audit writer", async () => {
    const clientLike = forStaff(testOnlyStaffPrincipal(uid(), "client" as never), db);
    await assert.rejects(clientLike.publishedSessions(), PortalForbiddenError);
    await assert.rejects(clientLike.publishRecipients(uid()), PortalForbiddenError);
    await assert.rejects(
      clientLike.recordGhlSync({ orgId: uid(), ok: true, detail: {} }),
      PortalForbiddenError,
    );
    // control: the same call with a staff role works
    assert.ok(Array.isArray(await staff().publishedSessions()));
  });
});
