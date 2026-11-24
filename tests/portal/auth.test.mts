import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { before, beforeEach, describe, it } from "node:test";
import { Auth, raw, skipCSRFCheck } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import { AccessDenied } from "@auth/core/errors";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { and, eq, sql } from "drizzle-orm";
import {
  AUTH_BASE_PATH,
  buildAuthConfig,
  buildConsumeRequest,
  issueLink,
  type SignInRunner,
  verifyRedirectFor,
} from "../../lib/portal/auth-config";
import { requestLoginLink } from "../../lib/portal/actions/login-core";
import { forAuth, LOGIN_LINKS_PER_HOUR } from "../../lib/portal/data/auth";
import type { PrincipalUser } from "../../lib/portal/data/dto";
import { forStaff } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import type { MailMessage } from "../../lib/portal/email";
import { createPrincipalGuards } from "../../lib/portal/principal-core";
import {
  SESSION_COOKIE,
  SESSION_COOKIE_SECURE,
  readSessionToken,
} from "../../lib/portal/session-cookie";
import { createCoachActions } from "../../lib/portal/actions/coach-core";
import { createClientActions } from "../../lib/portal/actions/client-core";
import { freshDb, testOnlyStaffPrincipal, uid } from "./helpers";
import { forClient } from "../../lib/portal/data/client";

const ORIGIN = "http://portal.test";
const SECRET = "test-secret-test-secret-test-secret-1234";

let db: PortalDb;
let mails: MailMessage[] = [];
let adminId: string;
let orgId: string;
let sessionIds: string[];

const adapter = () =>
  DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.authAccounts,
    sessionsTable: schema.authSessions,
    verificationTokensTable: schema.authVerificationTokens,
  });

const config = (): AuthConfig =>
  ({
    ...buildAuthConfig({
      adapter: adapter(),
      dal: forAuth(db),
      sendMail: async (m) => {
        mails.push(m);
      },
      from: () => "Portal <portal@example.test>",
      secret: SECRET,
    }),
    logger: { error() {}, warn() {}, debug() {} },
  }) as unknown as AuthConfig;

/** Same call next-auth's server-side signIn() makes (raw, no CSRF), so the same outcomes. */
const run: SignInRunner = async (email) => {
  const req = new Request(`${ORIGIN}${AUTH_BASE_PATH}/signin/resend?`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded", host: "portal.test" },
    body: new URLSearchParams({ email, callbackUrl: "/portal" }),
  });
  const res = (await Auth(req, { ...config(), raw, skipCSRFCheck } as unknown as AuthConfig)) as
    | Response
    | { redirect: string };
  return res instanceof Response ? (res.headers.get("Location") ?? req.url) : res.redirect;
};

const request = (email: string) => requestLoginLink(email, run);

const tokenRows = async (email: string) =>
  db.select().from(schema.authVerificationTokens).where(eq(schema.authVerificationTokens.identifier, email));
const allTokenRows = () => db.select().from(schema.authVerificationTokens);
const userCount = async () => (await db.select({ n: sql<number>`count(*)::int` }).from(schema.users))[0]!.n;
const sessionCount = async () =>
  (await db.select({ n: sql<number>`count(*)::int` }).from(schema.authSessions))[0]!.n;

/** The link in the most recent email. */
function lastLink(): URL {
  const m = mails.at(-1);
  assert.ok(m, "an email was sent");
  const found = /https?:\/\/\S+/.exec(m.text);
  assert.ok(found, "email contains a link");
  return new URL(found[0]);
}

/** What the verify page's button does: POST the token and email, which builds the consuming call. */
async function press(link: URL, origin = ORIGIN): Promise<Response> {
  const form = new FormData();
  form.set("token", link.searchParams.get("token") ?? "");
  form.set("email", link.searchParams.get("email") ?? "");
  const consume = buildConsumeRequest(form, `${origin}/api/portal/auth/verify`, new Headers({ host: new URL(origin).host }));
  assert.ok(consume);
  return (await Auth(consume, config())) as Response;
}

function cookieFrom(res: Response, name: string): string | null {
  for (const c of res.headers.getSetCookie()) {
    const [pair] = c.split(";");
    const eq = pair!.indexOf("=");
    if (pair!.slice(0, eq) === name) return decodeURIComponent(pair!.slice(eq + 1));
  }
  return null;
}

async function addUser(email: string, role: "client" | "coach" | "admin", name: string | null = null) {
  const [u] = await db
    .insert(schema.users)
    .values({ email, name, role, orgId: role === "client" ? orgId : null })
    .returning({ id: schema.users.id });
  assert.ok(u);
  return u.id;
}

before(async () => {
  ({ db } = await freshDb());
  adminId = await (async () => {
    const [u] = await db
      .insert(schema.users)
      .values({ email: "admin@portal.test", role: "admin" })
      .returning({ id: schema.users.id });
    return u!.id;
  })();
  const staff = forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);
  await db.insert(schema.programs).values({ slug: "prog", name: "Program", sessionCount: 3 });
  const org = await staff.createOrg({ slug: "acme", name: "Acme Arts" });
  assert.ok(org.ok);
  orgId = org.orgId;
  const eng = await staff.createEngagement({ orgId, programSlug: "prog", startsOn: "2026-12-01" });
  assert.ok(eng !== null && eng.ok);
  sessionIds = (
    await db
      .select({ id: schema.coachingSessions.id })
      .from(schema.coachingSessions)
      .where(eq(schema.coachingSessions.orgId, orgId))
      .orderBy(schema.coachingSessions.number)
  ).map((r) => r.id);
});

beforeEach(async () => {
  mails = [];
  await db.delete(schema.authVerificationTokens);
  await db.delete(schema.authSessions);
});

describe("login request: invite-only, no enumeration", () => {
  it("unknown email: same ok answer, no token row, no user row, mailer not called", async () => {
    const usersBefore = await userCount();
    const r = await request("stranger@nowhere.test");
    assert.deepEqual(r, { ok: true });
    assert.equal((await allTokenRows()).length, 0);
    assert.equal(await userCount(), usersBefore, "Auth.js did not create a user");
    assert.equal(mails.length, 0);
  });

  it("control: an invited user gets a token row and exactly one email", async () => {
    await addUser("avery@acme.test", "client", "Avery");
    const r = await request("Avery@Acme.test ");
    assert.deepEqual(r, { ok: true });
    assert.equal((await tokenRows("avery@acme.test")).length, 1);
    assert.equal(mails.length, 1);
    assert.equal(mails[0]!.to, "avery@acme.test");
  });

  it("the answer is identical for unknown, invited, disabled, malformed and non-string input", async () => {
    await addUser("a@acme.test", "client");
    const gone = await addUser("gone@acme.test", "client");
    await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.id, gone));
    const answers = await Promise.all(
      ["a@acme.test", "nobody@x.test", "gone@acme.test", "not-an-email", "", "a@b.c\"d@x.test"].map(request),
    );
    for (const a of answers) assert.deepEqual(a, { ok: true });
    assert.deepEqual(await requestLoginLink(42, run), { ok: true });
    assert.deepEqual(await requestLoginLink(undefined, run), { ok: true });
    assert.equal(mails.length, 1, "only the invited, enabled address was mailed");
  });

  it("disabled user: refused, no token row, no mail", async () => {
    const id = await addUser("off@acme.test", "client");
    await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.id, id));
    assert.deepEqual(await request("off@acme.test"), { ok: true });
    assert.equal((await allTokenRows()).length, 0);
    assert.equal(mails.length, 0);
  });

  it("staff can sign in the same way (coach)", async () => {
    await addUser("coach@portal.test", "coach");
    await request("coach@portal.test");
    assert.equal(mails.length, 1);
  });

  it(`the ${LOGIN_LINKS_PER_HOUR + 1}th request in an hour sends nothing`, async () => {
    await addUser("busy@acme.test", "client");
    for (let i = 0; i < LOGIN_LINKS_PER_HOUR; i++) await request("busy@acme.test");
    assert.equal(mails.length, LOGIN_LINKS_PER_HOUR);
    assert.equal((await tokenRows("busy@acme.test")).length, LOGIN_LINKS_PER_HOUR);
    assert.deepEqual(await request("busy@acme.test"), { ok: true }, "still the same answer");
    assert.equal(mails.length, LOGIN_LINKS_PER_HOUR, "6th sent nothing");
    assert.equal((await tokenRows("busy@acme.test")).length, LOGIN_LINKS_PER_HOUR, "6th created no token");
  });

  it("control: the limit is per address, and ages out after an hour", async () => {
    await addUser("busy2@acme.test", "client");
    await addUser("calm@acme.test", "client");
    for (let i = 0; i < LOGIN_LINKS_PER_HOUR; i++) await request("busy2@acme.test");
    const before = mails.length;
    await request("calm@acme.test");
    assert.equal(mails.length, before + 1, "another address is unaffected");
    const dal = forAuth(db);
    assert.equal(await dal.loginVerdict("busy2@acme.test"), "rate_limited");
    const inTwoHours = new Date(Date.now() + 2 * 60 * 60 * 1000);
    assert.equal(await dal.loginVerdict("busy2@acme.test", inTwoHours), "ok");
    assert.equal(await dal.loginVerdict("nobody@acme.test"), "unknown");
  });

  it("failures are loud, refusals are quiet: issueLink classification", async () => {
    const denied: SignInRunner = async () => {
      throw new AccessDenied("AccessDenied");
    };
    assert.equal(await issueLink(denied, "a@b.test"), "refused");
    const failedInsideCallback: SignInRunner = async () => {
      // Auth.js wraps a callback failure exactly like this (send-token.js); the typings only allow a string.
      throw new AccessDenied(new Error("database unreachable") as unknown as string);
    };
    await assert.rejects(issueLink(failedInsideCallback, "a@b.test"), /./);
    const misconfigured: SignInRunner = async () => `${ORIGIN}/portal/login?error=Configuration`;
    await assert.rejects(issueLink(misconfigured, "a@b.test"), /Configuration/);
    const deniedByRedirect: SignInRunner = async () => `${ORIGIN}/portal/login?error=AccessDenied`;
    assert.equal(await issueLink(deniedByRedirect, "a@b.test"), "refused");
    const sent: SignInRunner = async () => `${ORIGIN}/portal/login?provider=resend&type=email`;
    assert.equal(await issueLink(sent, "a@b.test"), "sent");
  });

  it("the real flow with the database failing inside the signIn callback throws, it is not read as a refusal", async () => {
    const broken = buildAuthConfig({
      adapter: adapter(),
      dal: {
        loginVerdict: async () => {
          throw new Error("database unreachable");
        },
        isActiveUser: async () => true,
      },
      sendMail: async () => {},
      from: () => "x@example.test",
      secret: SECRET,
    });
    const runBroken: SignInRunner = async (email) => {
      const req = new Request(`${ORIGIN}${AUTH_BASE_PATH}/signin/resend?`, {
        method: "POST",
        headers: { "content-type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, callbackUrl: "/portal" }),
      });
      const cfg = { ...broken, logger: { error() {}, warn() {}, debug() {} }, raw, skipCSRFCheck } as unknown as AuthConfig;
      const res = (await Auth(req, cfg)) as Response | { redirect: string };
      return res instanceof Response ? (res.headers.get("Location") ?? req.url) : res.redirect;
    };
    await assert.rejects(requestLoginLink("anyone@acme.test", runBroken), /./);
  });
});

describe("the emailed link: GET never consumes, only the button does", () => {
  it("the email links to the button page, not to Auth.js's callback", async () => {
    await addUser("scan@acme.test", "client");
    await request("scan@acme.test");
    const link = lastLink();
    assert.equal(link.pathname, "/portal/login/verify");
    assert.ok(link.searchParams.get("token"));
    assert.equal(link.searchParams.get("email"), "scan@acme.test");
    const body = mails[0]!.text + mails[0]!.html;
    assert.ok(!body.includes("/api/portal/auth/callback"));
    assert.ok(!body.includes("—"), "no em dash in the email");
  });

  it("a bare GET of the verify URL leaves the token row (the page is not wired to the database)", async () => {
    await addUser("scan2@acme.test", "client");
    await request("scan2@acme.test");
    const before = await tokenRows("scan2@acme.test");
    assert.equal(before.length, 1);
    // The page is a server component with no data or auth imports: rendering it cannot touch a token.
    const page = readFileSync(new URL("../../app/portal/login/verify/page.tsx", import.meta.url), "utf8");
    assert.ok(!/from "@\/lib\/portal\/(data|auth|db|principal)/.test(page), "verify page imports no data/auth code");
    assert.ok(page.includes('method="POST"'), "it renders a POST form");
    assert.deepEqual(await tokenRows("scan2@acme.test"), before);
  });

  it("a bare GET of Auth.js's own callback URL is forwarded to the button page and leaves the token", async () => {
    await addUser("scan3@acme.test", "client");
    await request("scan3@acme.test");
    const link = lastLink();
    const callback = new URL(`${ORIGIN}${AUTH_BASE_PATH}/callback/resend`);
    callback.searchParams.set("token", link.searchParams.get("token")!);
    callback.searchParams.set("email", "scan3@acme.test");
    const forward = verifyRedirectFor(callback);
    assert.ok(forward?.startsWith(`${ORIGIN}/portal/login/verify?`));
    assert.equal(verifyRedirectFor(new URL(`${ORIGIN}${AUTH_BASE_PATH}/signin/resend`)), null);
    assert.equal(verifyRedirectFor(new URL(`${ORIGIN}${AUTH_BASE_PATH}/session`)), null);
    assert.equal((await tokenRows("scan3@acme.test")).length, 1, "token row still there");
    assert.equal(await sessionCount(), 0);
  });

  it("control: Auth.js's callback itself WOULD consume on GET (so the guard above is what protects it)", async () => {
    await addUser("scan4@acme.test", "client");
    await request("scan4@acme.test");
    const link = lastLink();
    const raw = new Request(`${ORIGIN}${AUTH_BASE_PATH}/callback/resend?token=${link.searchParams.get("token")}&email=scan4@acme.test&callbackUrl=%2Fportal`);
    await Auth(raw, config());
    assert.equal((await tokenRows("scan4@acme.test")).length, 0);
  });

  it("pressing the button consumes the token, creates a session and sets the cookie; a second press fails", async () => {
    const userId = await addUser("press@acme.test", "client", "Press");
    await request("press@acme.test");
    const link = lastLink();
    const res = await press(link);
    assert.equal(res.status, 302);
    assert.equal(new URL(res.headers.get("location")!).pathname, "/portal");
    assert.equal((await tokenRows("press@acme.test")).length, 0, "token consumed");
    const token = cookieFrom(res, SESSION_COOKIE);
    assert.ok(token, "session cookie set under the pinned name");
    const dal = forAuth(db);
    const who = await dal.sessionUser(token);
    assert.equal(who?.id, userId);
    assert.equal(who?.orgName, "Acme Arts");
    assert.equal(who?.role, "client");

    const again = await press(link);
    assert.equal(new URL(again.headers.get("location")!).searchParams.get("error"), "Verification");
    assert.equal(cookieFrom(again, SESSION_COOKIE), null, "no cookie on a replayed link");
  });

  it("over https the cookie carries the __Secure- prefix the proxy also accepts", async () => {
    await addUser("sec@acme.test", "client");
    await request("sec@acme.test");
    const res = await press(lastLink(), "https://portal.test");
    assert.ok(cookieFrom(res, SESSION_COOKIE_SECURE));
    assert.equal(cookieFrom(res, SESSION_COOKIE), null);
    assert.equal(readSessionToken((n) => (n === SESSION_COOKIE_SECURE ? { value: "t" } : undefined)), "t");
    assert.equal(readSessionToken(() => undefined), null);
  });

  it("disabled between request and click: token is spent, no session, back to login", async () => {
    const id = await addUser("late@acme.test", "client");
    await request("late@acme.test");
    await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.id, id));
    const res = await press(lastLink());
    assert.equal(new URL(res.headers.get("location")!).searchParams.get("error"), "AccessDenied");
    assert.equal(await sessionCount(), 0);
    assert.equal(cookieFrom(res, SESSION_COOKIE), null);
  });

  it("a forged or empty form builds no consuming request", () => {
    const form = new FormData();
    assert.equal(buildConsumeRequest(form, `${ORIGIN}/x`, new Headers()), null);
    form.set("token", "x".repeat(600));
    form.set("email", "a@b.test");
    assert.equal(buildConsumeRequest(form, `${ORIGIN}/x`, new Headers()), null);
  });
});

describe("principals", () => {
  const SENTINEL_REDIRECT = "REDIRECT:";
  const SENTINEL_404 = "NOT_FOUND";
  const guardsFor = (getUser: () => Promise<PrincipalUser | null>) =>
    createPrincipalGuards({
      getUser,
      redirect: (url) => {
        throw new Error(SENTINEL_REDIRECT + url);
      },
      notFound: () => {
        throw new Error(SENTINEL_404);
      },
    });

  /** A real session row for a user, read back through the real query. */
  async function sessionFor(userId: string): Promise<string> {
    const token = uid();
    await db.insert(schema.authSessions).values({ sessionToken: token, userId, expires: new Date(Date.now() + 60_000) });
    return token;
  }
  const loader = (token: string) => () => forAuth(db).sessionUser(token);

  it("no session: redirect to /portal/login for both guards", async () => {
    const g = guardsFor(async () => null);
    await assert.rejects(g.requireClient(), new RegExp(`${SENTINEL_REDIRECT}/portal/login`));
    await assert.rejects(g.requireStaff(), new RegExp(`${SENTINEL_REDIRECT}/portal/login`));
    // control: an unknown or expired token resolves to no user at all
    assert.equal(await forAuth(db).sessionUser("no-such-token"), null);
    const expired = uid();
    const clientId = await addUser("exp@acme.test", "client");
    await db.insert(schema.authSessions).values({ sessionToken: expired, userId: clientId, expires: new Date(Date.now() - 1000) });
    assert.equal(await forAuth(db).sessionUser(expired), null);
  });

  it("right role passes; wrong role is a 404 both ways", async () => {
    const clientId = await addUser("c1@acme.test", "client");
    const coachId = await addUser("coach1@portal.test", "coach");
    const cg = guardsFor(loader(await sessionFor(clientId)));
    const sg = guardsFor(loader(await sessionFor(coachId)));
    const cp = await cg.requireClient();
    assert.deepEqual({ ...cp }, { userId: clientId, orgId });
    const sp = await sg.requireStaff();
    assert.deepEqual({ ...sp }, { userId: coachId, role: "coach" });
    await assert.rejects(cg.requireStaff(), new RegExp(SENTINEL_404));
    await assert.rejects(sg.requireClient(), new RegExp(SENTINEL_404));
  });

  it("disabled_at is re-checked on every call: same session, disabled afterwards, refused", async () => {
    const id = await addUser("flip@acme.test", "client");
    const g = guardsFor(loader(await sessionFor(id)));
    await g.requireClient();
    await db.update(schema.users).set({ disabledAt: new Date() }).where(eq(schema.users.id, id));
    await assert.rejects(g.requireClient(), new RegExp(`${SENTINEL_REDIRECT}/portal/login`));
  });

  it("client principal cannot call any coach action: refused, rows unchanged", async () => {
    const clientId = await addUser("sneaky@acme.test", "client");
    const victimId = await addUser("victim@acme.test", "client");
    const g = guardsFor(loader(await sessionFor(clientId)));
    const actions = createCoachActions({ requireStaff: g.requireStaff, dal: (p) => forStaff(p, db) });
    const sid = sessionIds[0]!;
    const snapshot = async () =>
      JSON.stringify({
        s: await db.select().from(schema.coachingSessions).orderBy(schema.coachingSessions.id),
        i: await db.select().from(schema.sessionItems),
        u: await db.select().from(schema.users).orderBy(schema.users.email),
        a: await db.select().from(schema.auditLog),
      });
    const before = await snapshot();
    const input = { title: "Hijack", summaryMd: "x", tasks: ["t"], nextTime: [] };
    const attempts: Array<() => Promise<unknown>> = [
      () => actions.saveDraft(sid, input),
      () => actions.publish(sid),
      () => actions.unpublish(sid),
      () => actions.inviteClient(orgId, { email: "plant@evil.test", name: "Plant" }),
      () => actions.disableUser(victimId),
    ];
    for (const attempt of attempts) await assert.rejects(attempt(), new RegExp(SENTINEL_404));
    assert.equal(await snapshot(), before, "nothing changed");
  });

  it("control: a coach principal can call them (so the refusals above come from the role, not a broken harness)", async () => {
    const coachId = await addUser("coach2@portal.test", "coach");
    const g = guardsFor(loader(await sessionFor(coachId)));
    const actions = createCoachActions({ requireStaff: g.requireStaff, dal: (p) => forStaff(p, db) });
    const sid = sessionIds[1]!;
    const draft = { title: "Real title", summaryMd: "Real summary", tasks: ["do it"], nextTime: ["bring it"] };
    assert.deepEqual(await actions.saveDraft(sid, draft), { ok: true, message: "Saved." });
    assert.equal((await actions.publish(sid)).ok, true);
    assert.equal((await actions.saveDraft(sid, draft)).ok, false, "published session refuses edits");
    assert.equal((await actions.unpublish(sid)).ok, true);
    assert.equal((await actions.saveDraft("not-a-uuid", draft)).ok, false);
    assert.equal((await actions.saveDraft(sid, { title: 1 })).ok, false, "malformed input is refused");
    const invited = await actions.inviteClient(orgId, { email: "New@Acme.test", name: "New Person" });
    assert.equal(invited.ok, true);
    assert.equal((await actions.inviteClient(orgId, { email: "new@acme.test", name: "Again" })).ok, false);
    assert.equal((await actions.inviteClient(orgId, { email: "bad", name: "Bad" })).ok, false);
    assert.equal((await actions.inviteClient(orgId, { email: "x@acme.test", name: "  " })).ok, false);
    const [created] = await db.select().from(schema.users).where(eq(schema.users.email, "new@acme.test"));
    assert.equal(created?.name, "New Person");
    assert.equal((await actions.disableUser(created!.id)).ok, true);
    assert.equal((await actions.disableUser(coachId)).ok, false, "cannot disable self (and coaches are not clients)");
  });

  it("a staff user cannot call client actions either, and a client toggles only their own org", async () => {
    const coachId = await addUser("coach3@portal.test", "coach");
    const sg = guardsFor(loader(await sessionFor(coachId)));
    const clientActions = (g: ReturnType<typeof guardsFor>) =>
      createClientActions({ requireClient: g.requireClient, dal: (p) => forClient(p, db) });
    await assert.rejects(clientActions(sg).toggleItem(uid(), true), new RegExp(SENTINEL_404));

    // publish a session with an item, then tick it as the org's client
    const staff = forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);
    const sid = sessionIds[2]!;
    await staff.saveDraft(sid, { title: "T3", summaryMd: "S3" });
    await staff.replaceItems(sid, { tasks: ["tick me"], nextTime: [] });
    assert.ok((await staff.publish(sid))?.ok);
    const [item] = await db.select().from(schema.sessionItems).where(eq(schema.sessionItems.sessionId, sid));
    const clientId = await addUser("ticker@acme.test", "client", "Ticker");
    const cg = guardsFor(loader(await sessionFor(clientId)));
    assert.deepEqual(await clientActions(cg).toggleItem(item!.id, true), { ok: true });
    const [after] = await db.select().from(schema.sessionItems).where(eq(schema.sessionItems.id, item!.id));
    assert.equal(after?.doneBy, clientId);
    // another organisation's client: same refusal as for a random uuid
    const [other] = await db.insert(schema.organisations).values({ slug: "other", name: "Other Org" }).returning();
    const [otherUser] = await db
      .insert(schema.users)
      .values({ email: "o@other.test", role: "client", orgId: other!.id })
      .returning();
    const og = guardsFor(loader(await sessionFor(otherUser!.id)));
    const foreign = await clientActions(og).toggleItem(item!.id, false);
    const random = await clientActions(og).toggleItem(uid(), false);
    assert.equal(foreign.ok, false);
    assert.deepEqual(foreign, random, "indistinguishable from a random id");
    const [still] = await db
      .select()
      .from(schema.sessionItems)
      .where(and(eq(schema.sessionItems.id, item!.id)));
    assert.ok(still?.doneAt, "other org's untick changed nothing");
  });
});
