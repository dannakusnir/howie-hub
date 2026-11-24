import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { NextRequest } from "next/server";
import { config, proxy } from "../../proxy";
import { SESSION_COOKIE, SESSION_COOKIE_SECURE } from "../../lib/portal/session-cookie";

const HOST = "portal.test";
const req = (path: string, init: { method?: string; headers?: Record<string, string> } = {}) =>
  new NextRequest(`http://${HOST}${path}`, { method: init.method ?? "GET", headers: { host: HOST, ...init.headers } });

const isRedirectToLogin = (res: Response) =>
  res.status === 307 && new URL(res.headers.get("location")!).pathname === "/portal/login";

describe("proxy", () => {
  it("matcher covers only /portal and /api/portal", () => {
    assert.deepEqual(config.matcher, ["/portal/:path*", "/api/portal/:path*"]);
  });

  it("security headers on portal responses", () => {
    const res = proxy(req("/portal/login"));
    assert.equal(res.headers.get("x-content-type-options"), "nosniff");
    assert.equal(res.headers.get("x-frame-options"), "DENY");
    assert.equal(res.headers.get("referrer-policy"), "same-origin");
    assert.match(res.headers.get("content-security-policy") ?? "", /frame-ancestors 'none'/);
    assert.ok(res.headers.get("permissions-policy"));
  });

  it("no cookie: portal pages redirect to login; login, verify and preview do not", () => {
    for (const path of ["/portal", "/portal/coach", "/portal/coach/clients", "/portal/sessions/abc"]) {
      assert.ok(isRedirectToLogin(proxy(req(path))), path);
    }
    for (const path of ["/portal/login", "/portal/login/verify", "/portal/preview", "/portal/preview/coach"]) {
      const res = proxy(req(path));
      assert.notEqual(res.status, 307, path);
    }
    // control: a lookalike is not public
    assert.ok(isRedirectToLogin(proxy(req("/portal/loginx"))));
    assert.ok(isRedirectToLogin(proxy(req("/portal/previewx"))));
  });

  it("a session cookie (either name) lets a page through; its presence proves nothing else", () => {
    assert.notEqual(proxy(req("/portal", { headers: { cookie: `${SESSION_COOKIE}=abc` } })).status, 307);
    assert.notEqual(proxy(req("/portal", { headers: { cookie: `${SESSION_COOKIE_SECURE}=abc` } })).status, 307);
    assert.ok(isRedirectToLogin(proxy(req("/portal", { headers: { cookie: "other=abc" } }))), "unrelated cookie");
  });

  it("api paths are never redirected (they answer 401 themselves)", () => {
    assert.notEqual(proxy(req("/api/portal/assets/x")).status, 307);
  });

  it("origin check on non-GET: same host passes, other host and 'null' are 403, no Origin passes", () => {
    const post = (origin?: string) =>
      proxy(req("/api/portal/ingest/session", { method: "POST", headers: origin === undefined ? {} : { origin } }));
    assert.notEqual(post(`http://${HOST}`).status, 403);
    assert.notEqual(post().status, 403, "bearer-token clients send no Origin");
    assert.equal(post("http://evil.test").status, 403);
    assert.equal(post(`http://${HOST}.evil.test`).status, 403, "exact host, not a prefix");
    assert.equal(post("null").status, 403);
    assert.equal(post("not a url").status, 403);
    // A real browser form POST: Chrome sends Origin "null" under Referrer-Policy same-origin
    // and marks the request with Sec-Fetch-Site. The browser's mark decides.
    const browserPost = (site: string, origin = "null") =>
      proxy(req("/api/portal/auth/verify", { method: "POST", headers: { origin, "sec-fetch-site": site } }));
    assert.notEqual(browserPost("same-origin").status, 403, "the sign-in button must work");
    assert.equal(browserPost("cross-site").status, 403);
    assert.equal(browserPost("same-site").status, 403, "a sibling subdomain is not us");
    assert.equal(browserPost("none").status, 403);
    assert.equal(browserPost("cross-site", "http://portal.test").status, 403, "a matching Origin does not override the browser's mark");
    // GET is never origin-checked
    assert.notEqual(proxy(req("/api/portal/assets/x", { headers: { origin: "http://evil.test" } })).status, 403);
  });
});
