import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { after, afterEach, before, beforeEach, describe, it } from "node:test";
import { getPayloadFromClientToken } from "@vercel/blob/client";
import { and, eq } from "drizzle-orm";
import { GET, HEAD } from "../../app/api/portal/assets/[assetId]/route";
import { POST as ingestPost } from "../../app/api/portal/ingest/session/route";
import { POST as uploadPost } from "../../app/api/portal/upload/route";
import type { AssetResolution } from "../../lib/portal/asset-access";
import { forClient } from "../../lib/portal/data/client";
import { forStaff } from "../../lib/portal/data/staff";
import type { PortalDb } from "../../lib/portal/db/client";
import * as schema from "../../lib/portal/db/schema";
import { run as runCli } from "../../scripts/portal-ingest.mjs";
import { freshDb, payload, testOnlyClientPrincipal, testOnlyStaffPrincipal } from "../portal/helpers";
import {
  assetPrefix,
  createTenant,
  fakeBlobStore,
  pattern,
  readAll,
  type FakeStore,
  type Tenant,
} from "./helpers";

// The route files are CommonJS-format .ts, so the modules they import (and their
// singletons: db, blob store, access seams) live in the CJS cache. Importing the same
// files with ESM `import` here would create SECOND instances the routes never see, so
// the injection seams are taken through require().
const cjs = createRequire(import.meta.url);
const { setDbForTests } = cjs("../../lib/portal/db/client") as typeof import("../../lib/portal/db/client");
const { setBlobStoreForTests } = cjs("../../lib/portal/blob") as typeof import("../../lib/portal/blob");
const { setAccessForTests } = cjs("../../lib/portal/asset-access") as typeof import("../../lib/portal/asset-access");

const INGEST_TOKEN = `test-ingest-${randomUUID()}`;
const RW_TOKEN = `vercel_blob_rw_teststore_${randomUUID().replace(/-/g, "")}`;

let db: PortalDb;
let adminId: string;
let programSlug: string;
let store: FakeStore;
let a: Tenant;
let b: Tenant;

// The fake "session": which principal (if any) the asset resolver sees.
let current: { orgId: string } | "staff" | null = null;

const staff = () => forStaff(testOnlyStaffPrincipal(adminId, "admin"), db);

async function resolve(assetId: string): Promise<AssetResolution> {
  if (current === null) return "unauthenticated";
  if (current === "staff") return staff().asset(assetId);
  return forClient(testOnlyClientPrincipal(randomUUID(), current.orgId), db).asset(assetId);
}

const ctx = (assetId: string) => ({ params: Promise.resolve({ assetId }) });
const assetReq = (id: string, headers: Record<string, string> = {}, method = "GET") =>
  new Request(`http://portal.test/api/portal/assets/${id}`, { method, headers });
const bearer = (t = INGEST_TOKEN) => ({ authorization: `Bearer ${t}` });

describe("portal http layer", () => {
before(async () => {
  ({ db } = await freshDb());
  setDbForTests(db);
  const [admin] = await db
    .insert(schema.users)
    .values({ email: "admin-http@example.test", role: "admin" })
    .returning({ id: schema.users.id });
  assert.ok(admin);
  adminId = admin.id;
  programSlug = "prog-http";
  await db.insert(schema.programs).values({ slug: programSlug, name: "HTTP Program", sessionCount: 5 });
  a = await createTenant(db, adminId, programSlug, "ha");
  b = await createTenant(db, adminId, programSlug, "hb");
});

beforeEach(() => {
  store = fakeBlobStore();
  setBlobStoreForTests(store);
  setAccessForTests({ assetResolver: resolve, staffUploadAuth: async () => "unauthenticated" });
  current = null;
  process.env.PORTAL_INGEST_TOKEN = INGEST_TOKEN;
  process.env.PORTAL_BLOB_READ_WRITE_TOKEN = RW_TOKEN;
});

afterEach(() => {
  setAccessForTests();
  setBlobStoreForTests(null);
});

after(() => {
  setDbForTests(null);
});

// ── helpers that publish a session with one real asset ──────────────────────

const CONTENT = pattern(1000);

async function publishedAsset(t: Tenant, number: number, content = CONTENT, name = "slides.pdf") {
  const pathname = `${assetPrefix(t.orgId, number)}${name}`;
  store.files.set(pathname, { body: content, contentType: "application/pdf" });
  const p = payload(t.slug, programSlug, t.orgId, number, {
    assets: [
      {
        kind: "slides_pdf",
        pathname,
        contentType: "application/pdf",
        bytes: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
        label: "Slides",
      },
    ],
  });
  const res = await ingestPost(
    new Request("http://portal.test/api/portal/ingest/session", {
      method: "POST",
      headers: bearer(),
      body: JSON.stringify(p),
    }),
  );
  assert.equal(res.status, 200);
  const { sessionId } = (await res.json()) as { sessionId: string };
  const pub = await staff().publish(sessionId);
  assert.ok(pub !== null && pub.ok);
  const [row] = await db
    .select({ id: schema.sessionAssets.id })
    .from(schema.sessionAssets)
    .where(eq(schema.sessionAssets.sessionId, sessionId));
  assert.ok(row);
  return { assetId: row.id, pathname, sessionId };
}

// ── assets ──────────────────────────────────────────────────────────────────

describe("GET /api/portal/assets/[assetId]", () => {
  let assetId: string;
  before(async () => {
    store = fakeBlobStore();
    setBlobStoreForTests(store);
    setAccessForTests({ assetResolver: resolve, staffUploadAuth: async () => "unauthenticated" });
    process.env.PORTAL_INGEST_TOKEN = INGEST_TOKEN;
    ({ assetId } = await publishedAsset(a, 1));
    await publishedAsset(b, 1, pattern(500), "b-slides.pdf");
  });

  // The suite-level beforeEach recreates the store; re-seed the blob for each test.
  beforeEach(() => {
    store.files.set(`${assetPrefix(a.orgId, 1)}slides.pdf`, { body: CONTENT, contentType: "application/pdf" });
    current = { orgId: a.orgId };
  });

  it("200 full body, correct bytes and headers; content type from the row, not the request", async () => {
    const res = await GET(assetReq(assetId, { accept: "text/html", "content-type": "text/html" }), ctx(assetId));
    assert.equal(res.status, 200);
    assert.deepEqual(await readAll(res), CONTENT);
    assert.equal(res.headers.get("content-type"), "application/pdf");
    assert.equal(res.headers.get("content-length"), "1000");
    assert.equal(res.headers.get("cache-control"), "private, no-store");
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("content-disposition"), 'inline; filename="slides.pdf"');
    assert.equal(res.headers.get("accept-ranges"), "bytes");
  });

  it("206 with Content-Range and exactly the requested bytes (store honours Range)", async () => {
    const res = await GET(assetReq(assetId, { range: "bytes=100-199" }), ctx(assetId));
    assert.equal(res.status, 206);
    assert.equal(res.headers.get("content-range"), "bytes 100-199/1000");
    assert.equal(res.headers.get("content-length"), "100");
    assert.deepEqual(await readAll(res), CONTENT.subarray(100, 200));
    assert.deepEqual(store.reads.at(-1)?.range, { start: 100, end: 199 }, "range was forwarded to the store");
  });

  it("206 still exact when the store IGNORES Range (fallback slices)", async () => {
    store.mode = "ignore";
    const res = await GET(assetReq(assetId, { range: "bytes=100-199" }), ctx(assetId));
    assert.equal(res.status, 206);
    assert.deepEqual(await readAll(res), CONTENT.subarray(100, 200));
  });

  it("refuses to serve when the store answers a DIFFERENT range than asked", async () => {
    store.mode = "wrong-range";
    await assert.rejects(GET(assetReq(assetId, { range: "bytes=100-199" }), ctx(assetId)), /different range/);
  });

  it("open-ended, suffix and clamped ranges", async () => {
    const open = await GET(assetReq(assetId, { range: "bytes=900-" }), ctx(assetId));
    assert.equal(open.headers.get("content-range"), "bytes 900-999/1000");
    assert.deepEqual(await readAll(open), CONTENT.subarray(900));
    const suffix = await GET(assetReq(assetId, { range: "bytes=-10" }), ctx(assetId));
    assert.equal(suffix.headers.get("content-range"), "bytes 990-999/1000");
    assert.deepEqual(await readAll(suffix), CONTENT.subarray(990));
    const clamped = await GET(assetReq(assetId, { range: "bytes=999-5000" }), ctx(assetId));
    assert.equal(clamped.status, 206, "control: last byte is satisfiable");
    assert.equal(clamped.headers.get("content-range"), "bytes 999-999/1000");
    await readAll(clamped);
  });

  it("416 when the range starts past the end, with Content-Range */size", async () => {
    const res = await GET(assetReq(assetId, { range: "bytes=1000-2000" }), ctx(assetId));
    assert.equal(res.status, 416);
    assert.equal(res.headers.get("content-range"), "bytes */1000");
    assert.equal(res.headers.get("cache-control"), "private, no-store");
  });

  it("HEAD: same headers, no body, store untouched", async () => {
    const before = store.reads.length;
    const res = await HEAD(assetReq(assetId, { range: "bytes=0-9" }, "HEAD"), ctx(assetId));
    assert.equal(res.status, 206);
    assert.equal(res.headers.get("content-range"), "bytes 0-9/1000");
    assert.equal((await readAll(res)).length, 0);
    assert.equal(store.reads.length, before);
  });

  it("401 without a session; control: with a session the same id is 200", async () => {
    current = null;
    const res = await GET(assetReq(assetId), ctx(assetId));
    assert.equal(res.status, 401);
    assert.deepEqual(await res.json(), { error: "unauthenticated" });
    current = { orgId: a.orgId };
    assert.equal((await GET(assetReq(assetId), ctx(assetId))).status, 200);
  });

  it("another org's asset, a random uuid and a malformed id: identical 404", async () => {
    const own = await GET(assetReq(assetId), ctx(assetId));
    assert.equal(own.status, 200, "control: A reads its own asset");
    await readAll(own);

    const [bRow] = await db
      .select({ id: schema.sessionAssets.id })
      .from(schema.sessionAssets)
      .where(eq(schema.sessionAssets.orgId, b.orgId));
    assert.ok(bRow);
    const others = [bRow.id, randomUUID(), "not-a-uuid"];
    const bodies: string[] = [];
    for (const id of others) {
      const res = await GET(assetReq(id), ctx(id));
      assert.equal(res.status, 404, id);
      assert.equal(res.headers.get("cache-control"), "private, no-store");
      bodies.push(await res.text());
    }
    assert.equal(new Set(bodies).size, 1, "all three bodies are byte-identical");
    assert.equal(bodies[0], '{"error":"not_found"}');
  });

  it("an unpublished draft's asset is 404 for a client but readable by staff", async () => {
    const draft = await ingestPost(
      new Request("http://portal.test/api/portal/ingest/session", {
        method: "POST",
        headers: bearer(),
        body: JSON.stringify(payload(a.slug, programSlug, a.orgId, 2)),
      }),
    );
    assert.equal(draft.status, 200);
    const [row] = await db
      .select({ id: schema.sessionAssets.id })
      .from(schema.sessionAssets)
      .where(and(eq(schema.sessionAssets.orgId, a.orgId), eq(schema.sessionAssets.blobPathname, `${assetPrefix(a.orgId, 2)}slides.pdf`)));
    assert.ok(row);
    store.files.set(`${assetPrefix(a.orgId, 2)}slides.pdf`, { body: pattern(1234), contentType: "application/pdf" });
    assert.equal((await GET(assetReq(row.id), ctx(row.id))).status, 404);
    current = "staff";
    const asStaff = await GET(assetReq(row.id), ctx(row.id));
    assert.equal(asStaff.status, 200, "control: staff can read the draft's asset");
    await readAll(asStaff);
  });

  it("outside a request the default resolver THROWS instead of answering", async () => {
    setAccessForTests();
    await assert.rejects(GET(assetReq(assetId), ctx(assetId)), Error);
  });
});

// ── ingest ──────────────────────────────────────────────────────────────────

const ingestReq = (body: unknown, headers: Record<string, string> = bearer()) =>
  new Request("http://portal.test/api/portal/ingest/session", {
    method: "POST",
    headers,
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

const sessionRows = (t: Tenant, number: number) =>
  db
    .select()
    .from(schema.coachingSessions)
    .where(and(eq(schema.coachingSessions.orgId, t.orgId), eq(schema.coachingSessions.number, number)));

describe("POST /api/portal/ingest/session", () => {
  it("correct token creates a draft and returns {sessionId, status, result, editUrl}", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing1");
    const res = await ingestPost(ingestReq(payload(t.slug, programSlug, t.orgId, 1)));
    assert.equal(res.status, 200);
    const body = (await res.json()) as Record<string, string>;
    assert.deepEqual(Object.keys(body).sort(), ["editUrl", "result", "sessionId", "status"]);
    assert.equal(body.status, "draft");
    assert.equal(body.result, "created");
    assert.equal(body.editUrl, `http://portal.test/portal/coach/sessions/${body.sessionId}`);
    const [row] = await sessionRows(t, 1);
    assert.equal(row?.status, "draft");
    assert.equal(row?.id, body.sessionId);
  });

  it("wrong or missing token is 401 and writes nothing; control: right token writes", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing2");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    for (const headers of [bearer("wrong-token"), {}, { authorization: "Basic abc" }, { authorization: "Bearer" }]) {
      const res = await ingestPost(ingestReq(p, headers));
      assert.equal(res.status, 401, JSON.stringify(headers));
    }
    const [untouched] = await sessionRows(t, 1);
    assert.equal(untouched?.title, null, "no draft content was written");
    assert.equal((await ingestPost(ingestReq(p))).status, 200);
    const [written] = await sessionRows(t, 1);
    assert.equal(written?.title, p.title);
  });

  it("PORTAL_INGEST_TOKEN unset is 503, even when the caller sends an empty bearer", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing3");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    delete process.env.PORTAL_INGEST_TOKEN;
    for (const headers of [bearer("anything"), {}]) {
      assert.equal((await ingestPost(ingestReq(p, headers))).status, 503);
    }
    process.env.PORTAL_INGEST_TOKEN = "";
    assert.equal((await ingestPost(ingestReq(p, bearer("")))).status, 503, "empty env is also not configured");
    process.env.PORTAL_INGEST_TOKEN = INGEST_TOKEN;
    assert.equal((await ingestPost(ingestReq(p))).status, 200, "control: configured -> 200");
  });

  it('a body with "status":"published" is 400 naming the key; the row stays draft', async () => {
    const t = await createTenant(db, adminId, programSlug, "ing4");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    const res = await ingestPost(ingestReq({ ...p, status: "published" }));
    assert.equal(res.status, 400);
    const body = (await res.json()) as { error: string; issues: { keys?: string[]; message: string }[] };
    assert.equal(body.error, "invalid_body");
    assert.ok(body.issues.some((i) => i.keys?.includes("status")), JSON.stringify(body));
    const [row] = await sessionRows(t, 1);
    assert.equal(row?.status, "draft");
    assert.equal(row?.title, null, "nothing was written");
    // nested unknown key too
    const nested = await ingestPost(ingestReq({ ...p, tasks: [{ text: "x", done: true }] }));
    assert.equal(nested.status, 400);
    assert.equal((await ingestPost(ingestReq(p))).status, 200, "control: same body without the key is accepted");
  });

  it("invalid JSON is 400", async () => {
    assert.equal((await ingestPost(ingestReq("{not json"))).status, 400);
  });

  it("the same payload twice gives one row; the second answer is 'unchanged'", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing5");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    const first = (await (await ingestPost(ingestReq(p))).json()) as { result: string; sessionId: string };
    const second = (await (await ingestPost(ingestReq(p))).json()) as { result: string; sessionId: string };
    assert.equal(first.result, "created");
    assert.equal(second.result, "unchanged");
    assert.equal(second.sessionId, first.sessionId);
    assert.equal((await sessionRows(t, 1)).length, 1);
    const changed = (await (await ingestPost(ingestReq({ ...p, title: "A different title" }))).json()) as {
      result: string;
    };
    assert.equal(changed.result, "updated", "control: a changed payload is not 'unchanged'");
  });

  it("ingest onto a published session is 409 already_published and changes nothing", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing6");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    const { sessionId } = (await (await ingestPost(ingestReq(p))).json()) as { sessionId: string };
    const pub = await staff().publish(sessionId);
    assert.ok(pub !== null && pub.ok);
    const res = await ingestPost(ingestReq({ ...p, title: "Overwrite attempt" }));
    assert.equal(res.status, 409);
    assert.deepEqual(await res.json(), { error: "already_published" });
    const [row] = await sessionRows(t, 1);
    assert.equal(row?.title, p.title);
    assert.equal(row?.status, "published");
  });

  it("maps other refusals: unknown org 404, asset outside prefix 422, number out of range 422", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing7");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    assert.equal((await ingestPost(ingestReq({ ...p, org: "no-such-org" }))).status, 404);
    const outside = {
      ...p,
      assets: [{ ...p.assets[0]!, pathname: `${assetPrefix(randomUUID(), 1)}slides.pdf` }],
    };
    const res = await ingestPost(ingestReq(outside));
    assert.equal(res.status, 422);
    assert.equal(((await res.json()) as { error: string }).error, "asset_outside_prefix");
    assert.equal((await ingestPost(ingestReq({ ...p, sessionNumber: 99 }))).status, 422);
  });

  it("re-ingest that drops an asset deletes the orphaned blob from the store (best effort)", async () => {
    const t = await createTenant(db, adminId, programSlug, "ing8");
    const p = payload(t.slug, programSlug, t.orgId, 1);
    const pathname = p.assets[0]!.pathname;
    store.files.set(pathname, { body: pattern(1234), contentType: "application/pdf" });
    assert.equal((await ingestPost(ingestReq(p))).status, 200);
    assert.equal((await ingestPost(ingestReq({ ...p, assets: [] }))).status, 200);
    assert.equal(store.files.has(pathname), false);
  });
});

// ── upload token exchange ───────────────────────────────────────────────────

function uploadReq(
  pathname: string,
  clientPayload: Record<string, unknown> | null,
  headers: Record<string, string> = bearer(),
  type = "blob.generate-client-token",
) {
  return new Request("http://portal.test/api/portal/upload", {
    method: "POST",
    headers,
    body: JSON.stringify({
      type,
      payload: {
        pathname,
        multipart: false,
        clientPayload: clientPayload === null ? null : JSON.stringify(clientPayload),
      },
    }),
  });
}

describe("POST /api/portal/upload", () => {
  const orgId = randomUUID();
  const ok = (over: Record<string, unknown> = {}) => ({
    orgId,
    sessionNumber: 3,
    kind: "slide_image",
    contentType: "image/png",
    bytes: 1_000_000,
    ...over,
  });
  const inside = `${assetPrefix(orgId, 3)}abc-pic.png`;

  it("issues a token constrained to the path, type and size; no overwrite, no random suffix", async () => {
    const res = await uploadPost(uploadReq(inside, ok()));
    assert.equal(res.status, 200);
    const { clientToken } = (await res.json()) as { clientToken: string };
    const decoded = getPayloadFromClientToken(clientToken) as unknown as Record<string, unknown>;
    assert.equal(decoded.pathname, inside);
    assert.deepEqual(decoded.allowedContentTypes, ["image/png"]);
    assert.equal(decoded.maximumSizeInBytes, 1_000_000);
    assert.equal(decoded.allowOverwrite, false);
    assert.equal(decoded.addRandomSuffix, false);
    assert.equal(decoded.onUploadCompleted, undefined, "no completion callback is ever requested");
  });

  it("refuses a pathname outside the server-computed prefix", async () => {
    const bad = [
      `${assetPrefix(randomUUID(), 3)}pic.png`, // another org
      `${assetPrefix(orgId, 4)}pic.png`, // another session
      `${assetPrefix(orgId, 3)}../session-4/pic.png`,
      `${assetPrefix(orgId, 3)}`, // the prefix itself
      "pic.png",
      `/${inside}`,
    ];
    for (const pathname of bad) {
      const res = await uploadPost(uploadReq(pathname, ok()));
      assert.equal(res.status, 400, pathname);
      assert.equal(((await res.json()) as { error: string }).error, "pathname_outside_prefix", pathname);
    }
    assert.equal((await uploadPost(uploadReq(inside, ok()))).status, 200, "control: inside the prefix is fine");
  });

  it("refuses oversize and wrong content type (per ASSET_KINDS)", async () => {
    const big = await uploadPost(uploadReq(inside, ok({ bytes: 10 * 1024 * 1024 + 1 })));
    assert.equal(big.status, 413);
    const wrongType = await uploadPost(uploadReq(inside, ok({ contentType: "application/pdf" })));
    assert.equal(wrongType.status, 415);
    const exe = await uploadPost(uploadReq(inside, ok({ contentType: "application/x-msdownload" })));
    assert.equal(exe.status, 415);
    assert.equal((await uploadPost(uploadReq(inside, ok({ bytes: 10 * 1024 * 1024 })))).status, 200, "control: at the limit");
  });

  it("rejects malformed clientPayload (missing, not json, unknown key, bad uuid)", async () => {
    assert.equal((await uploadPost(uploadReq(inside, null))).status, 400);
    assert.equal((await uploadPost(uploadReq(inside, ok({ extra: 1 })))).status, 400);
    assert.equal((await uploadPost(uploadReq(inside, ok({ orgId: "nope" })))).status, 400);
    const notJson = new Request("http://portal.test/api/portal/upload", {
      method: "POST",
      headers: bearer(),
      body: JSON.stringify({
        type: "blob.generate-client-token",
        payload: { pathname: inside, multipart: false, clientPayload: "{" },
      }),
    });
    assert.equal((await uploadPost(notJson)).status, 400);
  });

  it("auth: wrong bearer 401, env unset 503, no bearer goes to the staff seam (401 here), default seam throws", async () => {
    assert.equal((await uploadPost(uploadReq(inside, ok(), bearer("wrong")))).status, 401);
    assert.equal((await uploadPost(uploadReq(inside, ok(), {}))).status, 401);
    delete process.env.PORTAL_INGEST_TOKEN;
    assert.equal((await uploadPost(uploadReq(inside, ok()))).status, 503);
    process.env.PORTAL_INGEST_TOKEN = INGEST_TOKEN;
    setAccessForTests({ staffUploadAuth: async () => "forbidden" });
    assert.equal((await uploadPost(uploadReq(inside, ok(), {}))).status, 403);
    setAccessForTests({ staffUploadAuth: async () => "authorized" });
    assert.equal((await uploadPost(uploadReq(inside, ok(), {}))).status, 200, "control: an authorised staff session gets a token");
    setAccessForTests();
    await assert.rejects(uploadPost(uploadReq(inside, ok(), {})), Error);
  });

  it("the blob 'upload completed' callback event is not served", async () => {
    const res = await uploadPost(uploadReq(inside, ok(), bearer(), "blob.upload-completed"));
    assert.equal(res.status, 400);
    assert.equal(((await res.json()) as { error: string }).error, "unsupported_event");
  });
});

// ── operator CLI ────────────────────────────────────────────────────────────

describe("scripts/portal-ingest.mts", () => {
  let dir: string;
  before(() => {
    dir = mkdtempSync(join(tmpdir(), "portal-ingest-test-"));
  });
  after(() => {
    rmSync(dir, { recursive: true, force: true });
  });

  function sessionFile(t: Tenant, number: number, over: Record<string, unknown> = {}) {
    const slides = join(dir, `slides-${number}.pdf`);
    writeFileSync(slides, pattern(2048));
    const { assets: _a, ...rest } = payload(t.slug, programSlug, t.orgId, number);
    void _a;
    const file = join(dir, `session-${t.slug}-${number}.json`);
    writeFileSync(
      file,
      JSON.stringify({
        ...rest,
        orgId: t.orgId,
        assets: [{ kind: "slides_pdf", file: slides, label: "Slides" }],
        ...over,
      }),
    );
    return file;
  }

  const sink = () => {
    const lines: string[] = [];
    const errors: string[] = [];
    return { lines, errors, io: { log: (l: string) => lines.push(l), error: (l: string) => errors.push(l) } };
  };
  const env = { PORTAL_BASE_URL: "http://portal.test", PORTAL_INGEST_TOKEN: INGEST_TOKEN };

  it("--dry-run validates and prints the plan with no network call and no write", async () => {
    const t = await createTenant(db, adminId, programSlug, "cli1");
    const s = sink();
    let calls = 0;
    const code = await runCli([sessionFile(t, 1), "--dry-run"], env, {
      ...s.io,
      fetch: (async () => {
        calls++;
        throw new Error("network");
      }) as typeof fetch,
      upload: (async () => {
        calls++;
        throw new Error("network");
      }) as never,
    });
    assert.equal(code, 0);
    assert.equal(calls, 0);
    assert.ok(s.lines.some((l) => l.includes("slides_pdf") && l.includes("2048 bytes") && l.includes(assetPrefix(t.orgId, 1))));
    assert.ok(s.lines.some((l) => l.startsWith("dry run")));
    assert.equal((await sessionRows(t, 1))[0]?.title, null, "nothing written");
  });

  it("refuses to run without the env variables, naming them and never echoing values", async () => {
    const t = await createTenant(db, adminId, programSlug, "cli2");
    const s = sink();
    const code = await runCli([sessionFile(t, 1), "--dry-run"], { PORTAL_BASE_URL: "http://portal.test" }, s.io);
    assert.equal(code, 2);
    assert.match(s.errors.join("\n"), /PORTAL_INGEST_TOKEN/);
    assert.ok(!s.errors.join("\n").includes("http://portal.test"));
    const named = sink();
    assert.equal(
      await runCli([sessionFile(t, 1), "--dry-run", "--token-env", "MY_TOKEN"], env, named.io),
      2,
      "a custom token variable name that is unset is refused too",
    );
  });

  it('refuses a session file with "status":"published" before any network call', async () => {
    const t = await createTenant(db, adminId, programSlug, "cli3");
    const s = sink();
    const code = await runCli([sessionFile(t, 1, { status: "published" })], env, {
      ...s.io,
      fetch: (async () => assert.fail("no network")) as typeof fetch,
    });
    assert.equal(code, 1);
    assert.match(s.errors.join("\n"), /status/);
  });

  it("full run: uploads through the real token route, posts the draft, prints the edit URL; a second run is 'unchanged'", async () => {
    const t = await createTenant(db, adminId, programSlug, "cli4");
    const file = sessionFile(t, 1);
    const uploadFn = (async (pathname: string, body: Buffer, opts: { headers?: Record<string, string>; clientPayload?: string; contentType?: string }) => {
      const res = await uploadPost(
        new Request("http://portal.test/api/portal/upload", {
          method: "POST",
          headers: opts.headers,
          body: JSON.stringify({
            type: "blob.generate-client-token",
            payload: { pathname, multipart: false, clientPayload: opts.clientPayload },
          }),
        }),
      );
      if (res.status !== 200) throw new Error(`token refused ${res.status}`);
      await store.put(pathname, body, { contentType: opts.contentType ?? "" });
      return { pathname };
    }) as never;
    const fetchFn = (async (url: string, init: RequestInit) => {
      assert.equal(url, "http://portal.test/api/portal/ingest/session");
      return ingestPost(new Request(url, init));
    }) as typeof fetch;

    const first = sink();
    assert.equal(await runCli([file], env, { ...first.io, fetch: fetchFn, upload: uploadFn }), 0, first.errors.join("|"));
    assert.equal(store.files.size, 1);
    assert.ok(first.lines.some((l) => l.startsWith("result: created (draft)")));
    assert.ok(first.lines.some((l) => l.startsWith("edit and publish: http://portal.test/portal/coach/")));
    const [row] = await sessionRows(t, 1);
    assert.equal(row?.status, "draft");

    // Second run: the blob already exists (same content-addressed pathname) and the payload is identical.
    const second = sink();
    assert.equal(await runCli([file], env, { ...second.io, fetch: fetchFn, upload: uploadFn }), 0, second.errors.join("|"));
    assert.ok(second.lines.some((l) => l.startsWith("already uploaded")));
    assert.ok(second.lines.some((l) => l.startsWith("result: unchanged")));
    assert.equal((await sessionRows(t, 1)).length, 1);
  });

  it("a wrong token is reported as a failure (exit 1), not swallowed", async () => {
    const t = await createTenant(db, adminId, programSlug, "cli5");
    const s = sink();
    const code = await runCli([sessionFile(t, 1, { assets: [] })], { ...env, PORTAL_INGEST_TOKEN: "wrong" }, {
      ...s.io,
      fetch: ((url: string, init: RequestInit) => ingestPost(new Request(url, init))) as typeof fetch,
    });
    assert.equal(code, 1);
    assert.match(s.errors.join("\n"), /HTTP 401/);
  });
});
});
