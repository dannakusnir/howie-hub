import "server-only";
import { issueLink, type SignInRunner } from "../auth-config";

export type LoginResult = { readonly ok: true } | { readonly ok: false; readonly message: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL = 254;

/**
 * The login request. The answer is ALWAYS { ok: true }: an unknown address, a disabled user,
 * a malformed address and an over-limit address look exactly like success, so the form cannot
 * be used to find out who is invited. Mail is sent only for an invited, enabled user under the
 * hourly limit; that decision lives in the Auth.js `signIn` callback (one place, so a direct
 * call cannot bypass it). Real failures throw.
 */
export async function requestLoginLink(raw: unknown, run: SignInRunner): Promise<LoginResult> {
  if (typeof raw !== "string") return { ok: true };
  const email = raw.trim().toLowerCase();
  if (email.length > MAX_EMAIL || !EMAIL_RE.test(email)) return { ok: true };
  await issueLink(run, email);
  return { ok: true };
}
