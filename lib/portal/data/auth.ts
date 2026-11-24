import "server-only";
import { and, eq, gt, sql } from "drizzle-orm";
import { getDb, type PortalDb } from "../db/client";
import { authSessions, authVerificationTokens, organisations, users } from "../db/schema";
import type { LoginVerdict, PrincipalUser } from "./dto";

// Auth entry point: the few questions the sign-in flow and the principal guards ask the
// database. Nothing here returns portal content. Contract as elsewhere: null = no such
// thing, an infrastructure failure throws (it is never turned into "signed out").

/** A sign-in link works for this long. Also the provider's maxAge. */
export const LOGIN_LINK_LIFETIME_MS = 15 * 60 * 1000;
/** At most this many sign-in links per address per rolling hour. */
export const LOGIN_LINKS_PER_HOUR = 5;
const HOUR_MS = 60 * 60 * 1000;

export function forAuth(db: PortalDb = getDb()) {
  const byEmail = (email: string) => eq(users.email, email.trim().toLowerCase());

  const loginUser = async (email: string) => {
    const [row] = await db
      .select({ id: users.id, role: users.role, disabledAt: users.disabledAt })
      .from(users)
      .where(byEmail(email))
      .limit(1);
    return row === undefined ? null : { id: row.id, role: row.role, disabled: row.disabledAt !== null };
  };

  /**
   * Links issued to this address in the last hour. A link's row expires LIFETIME after it
   * was issued, so "issued in the last hour" is "expires after (now - hour + lifetime)".
   * Rows are counted, not kept in memory: this holds across serverless instances.
   */
  const recentLinkCount = async (email: string, now: Date = new Date()) => {
    const since = new Date(now.getTime() - HOUR_MS + LOGIN_LINK_LIFETIME_MS);
    const [row] = await db
      .select({ n: sql<number>`count(*)::int` })
      .from(authVerificationTokens)
      .where(
        and(
          eq(authVerificationTokens.identifier, email.trim().toLowerCase()),
          gt(authVerificationTokens.expires, since),
        ),
      );
    return row?.n ?? 0;
  };

  return {
    loginUser,
    recentLinkCount,

    /** The one decision behind "may we send this address a sign-in link?". */
    async loginVerdict(email: string, now: Date = new Date()): Promise<LoginVerdict> {
      const user = await loginUser(email);
      if (user === null) return "unknown";
      if (user.disabled) return "disabled";
      if ((await recentLinkCount(email, now)) >= LOGIN_LINKS_PER_HOUR) return "rate_limited";
      return "ok";
    },

    /** An address that may complete a sign-in (invited and not disabled). */
    async isActiveUser(email: string): Promise<boolean> {
      const user = await loginUser(email);
      return user !== null && !user.disabled;
    },

    /** Session token (the cookie value) to its user, or null when unknown or expired. */
    async sessionUser(token: string, now: Date = new Date()): Promise<PrincipalUser | null> {
      if (token === "") return null;
      const [row] = await db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          role: users.role,
          orgId: users.orgId,
          orgName: organisations.name,
          disabledAt: users.disabledAt,
        })
        .from(authSessions)
        .innerJoin(users, eq(users.id, authSessions.userId))
        .leftJoin(organisations, eq(organisations.id, users.orgId))
        .where(and(eq(authSessions.sessionToken, token), gt(authSessions.expires, now)))
        .limit(1);
      return row ?? null;
    },
  };
}

export type AuthDal = ReturnType<typeof forAuth>;
