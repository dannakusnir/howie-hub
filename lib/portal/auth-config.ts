import "server-only";
import type { Adapter } from "@auth/core/adapters";
import type { NextAuthConfig } from "next-auth";
import Resend from "next-auth/providers/resend";
import { LOGIN_LINK_LIFETIME_MS, type AuthDal } from "./data/auth";
import { buildSignInEmail, type Mailer, verifyPageUrl } from "./email";

// The Auth.js configuration, built from injected parts so tests can run the real flow
// against PGlite with a fake mailer. lib/portal/auth.ts wires the production parts.
//
// How sign-in works here:
//   1. The login server action asks Auth.js to send a link. The `signIn` callback below is
//      the gate: unknown, disabled or rate-limited addresses are refused before any token
//      row exists or any mail is sent.
//   2. The emailed link is NOT Auth.js's callback URL. It opens /portal/login/verify, a page
//      that only renders a button (GET never touches the token).
//   3. The button POSTs to /api/portal/auth/verify, which is the only thing that calls the
//      Auth.js callback, and so the only thing that consumes the token.

export const AUTH_BASE_PATH = "/api/portal/auth";
export const AUTH_PROVIDER_ID = "resend";
export const LOGIN_PATH = "/portal/login";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

export type AuthConfigDeps = {
  adapter: Adapter;
  dal: Pick<AuthDal, "loginVerdict" | "isActiveUser">;
  sendMail: Mailer;
  /** Read when a message is sent, never at import. */
  from: () => string;
  secret: string;
};

export function buildAuthConfig(deps: AuthConfigDeps): NextAuthConfig {
  return {
    adapter: deps.adapter,
    secret: deps.secret,
    basePath: AUTH_BASE_PATH,
    // The host comes from the request. Production sets AUTH_URL, which Auth.js then prefers.
    trustHost: true,
    session: { strategy: "database", maxAge: SESSION_MAX_AGE_SECONDS },
    // Auth.js's own pages are never shown: everything lands on the portal's login page.
    pages: { signIn: LOGIN_PATH, verifyRequest: LOGIN_PATH, error: LOGIN_PATH },
    providers: [
      Resend({
        id: AUTH_PROVIDER_ID,
        maxAge: LOGIN_LINK_LIFETIME_MS / 1000,
        async sendVerificationRequest({ identifier, url, token }) {
          const link = verifyPageUrl(new URL(url).origin, token, identifier);
          await deps.sendMail(
            buildSignInEmail({
              to: identifier,
              from: deps.from(),
              url: link,
              minutes: LOGIN_LINK_LIFETIME_MS / 60_000,
            }),
          );
        },
      }),
    ],
    callbacks: {
      // Invite-only. Runs twice: when a link is requested, and again when it is used.
      async signIn({ user, email }) {
        const address = user.email?.trim().toLowerCase();
        if (!address) return false;
        if (email?.verificationRequest) return (await deps.dal.loginVerdict(address)) === "ok";
        return deps.dal.isActiveUser(address);
      },
    },
  };
}

// ── HTTP edge of the Auth.js endpoints ─────────────────────────────────────

/** Where a bare GET of Auth.js's own callback URL is sent instead of consuming the token. */
export function verifyRedirectFor(url: URL): string | null {
  if (url.pathname !== `${AUTH_BASE_PATH}/callback/${AUTH_PROVIDER_ID}`) return null;
  const token = url.searchParams.get("token");
  const email = url.searchParams.get("email");
  if (!token || !email) return null;
  return verifyPageUrl(url.origin, token, email);
}

const MAX_FIELD = 512;

/**
 * The request that actually consumes a token: Auth.js's email callback, built from the
 * verify page's form. Returns null when the form is not a plausible token + email.
 */
export function buildConsumeRequest(form: FormData, requestUrl: string, headers: Headers): Request | null {
  const token = form.get("token");
  const email = form.get("email");
  if (typeof token !== "string" || typeof email !== "string") return null;
  if (token === "" || email === "" || token.length > MAX_FIELD || email.length > MAX_FIELD) return null;
  const target = new URL(`${AUTH_BASE_PATH}/callback/${AUTH_PROVIDER_ID}`, requestUrl);
  target.searchParams.set("token", token);
  target.searchParams.set("email", email);
  target.searchParams.set("callbackUrl", "/portal");
  const forwarded = new Headers(headers);
  forwarded.delete("content-length");
  forwarded.delete("content-type");
  return new Request(target, { method: "GET", headers: forwarded });
}

// ── Asking Auth.js to send a link ──────────────────────────────────────────

/** Runs Auth.js's sign-in for one address and returns the URL it redirects to (or throws). */
export type SignInRunner = (email: string) => Promise<string>;

/** Auth.js wraps a refusal (callback returned false) and a failure inside the callback in the same class. */
function isRefusal(e: unknown): boolean {
  if (!(e instanceof Error)) return false;
  const { type, cause } = e as { type?: unknown; cause?: { err?: unknown } };
  return type === "AccessDenied" && !(cause?.err instanceof Error);
}

/**
 * "refused": the address is unknown, disabled or over its hourly limit (a normal outcome the
 * caller must not reveal). "sent": the link was issued. Anything else (database down, mail
 * provider failing, bad configuration) throws, so it is an error page and never a silent no-op.
 */
export async function issueLink(run: SignInRunner, email: string): Promise<"sent" | "refused"> {
  let url: string;
  try {
    url = await run(email);
  } catch (e) {
    if (isRefusal(e)) return "refused";
    throw e;
  }
  const error = new URL(url, "http://portal.invalid").searchParams.get("error");
  if (error === null) return "sent";
  if (error === "AccessDenied") return "refused";
  throw new Error(`Sign-in link could not be issued (Auth.js error: ${error})`);
}
