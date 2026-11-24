// Names of the Auth.js session cookie. Plain constants (no server-only, no imports) so the
// proxy can use them. Auth.js adds the __Secure- prefix when the site is served over https.
// A test pins these to what Auth.js really sets, so a version bump cannot drift silently.

export const SESSION_COOKIE = "authjs.session-token";
export const SESSION_COOKIE_SECURE = `__Secure-${SESSION_COOKIE}`;
export const SESSION_COOKIE_NAMES = [SESSION_COOKIE_SECURE, SESSION_COOKIE] as const;

/** Reads the session token out of a cookie lookup function (cookies().get or request.cookies.get). */
export function readSessionToken(get: (name: string) => { value: string } | undefined): string | null {
  for (const name of SESSION_COOKIE_NAMES) {
    const value = get(name)?.value;
    if (value) return value;
  }
  return null;
}
