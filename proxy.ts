import { NextResponse, type NextRequest } from "next/server";
import { readSessionToken } from "./lib/portal/session-cookie";

// Portal only. The matcher below keeps this file off every other route: the public site and
// /api/lead never run it and get none of these headers.
//
// What it does, and what it deliberately does not do:
//   - security headers on every portal response;
//   - an exact-host check on state-changing requests (a browser's Origin must equal Host);
//   - an OPTIMISTIC redirect to the login page when a /portal page has no session cookie.
// A cookie being present proves nothing. Whether the session is real, the user enabled and
// the role right is decided in lib/portal/principal.ts on every request.

export const config = { matcher: ["/portal/:path*", "/api/portal/:path*"] };

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const HEADERS: Record<string, string> = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "same-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",
  "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'",
};

function secured(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(HEADERS)) response.headers.set(name, value);
  return response;
}

/** Pages anyone may open without a session: the login flow, and the design preview. */
function isPublicPage(pathname: string): boolean {
  return (
    pathname === "/portal/login" ||
    pathname.startsWith("/portal/login/") ||
    pathname === "/portal/preview" ||
    pathname.startsWith("/portal/preview/")
  );
}

function originMatchesHost(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  // No Origin: not a browser form or fetch from another site (those always send one), so
  // there is no cookie to ride. Bearer-token API clients (ingest) land here.
  if (origin === null) return true;
  try {
    return new URL(origin).host === request.headers.get("host");
  } catch {
    return false; // "null" and other malformed origins
  }
}

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (!SAFE_METHODS.has(request.method) && !originMatchesHost(request)) {
    return secured(new NextResponse("Forbidden", { status: 403 }));
  }

  const isPage = !pathname.startsWith("/api/");
  if (isPage && !isPublicPage(pathname) && readSessionToken((name) => request.cookies.get(name)) === null) {
    return secured(NextResponse.redirect(new URL("/portal/login", request.url)));
  }

  return secured(NextResponse.next());
}
