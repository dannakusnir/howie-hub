import "server-only";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import NextAuth from "next-auth";
import { buildAuthConfig } from "./auth-config";
import { forAuth } from "./data/auth";
import { getDb } from "./db/client";
import { authAccounts, authSessions, authVerificationTokens, users } from "./db/schema";
import { portalFrom, resendMailer } from "./email";
import { authSecret } from "./env";

// Production wiring of Auth.js (next-auth v5, pinned). The config is built per request, so
// nothing here reads the environment or the database at import or build time. A missing
// variable surfaces as an error on the request that needs it, with the variable's name.
//
// Only `handlers`, `signIn` and `signOut` are used. Sessions are resolved by
// lib/portal/principal.ts straight from the database, so an outage is an error page and
// never a silent "signed out".

export const { handlers, signIn, signOut } = NextAuth(() => {
  const db = getDb();
  return buildAuthConfig({
    adapter: DrizzleAdapter(db, {
      usersTable: users,
      accountsTable: authAccounts,
      sessionsTable: authSessions,
      verificationTokensTable: authVerificationTokens,
    }),
    dal: forAuth(db),
    sendMail: resendMailer,
    from: portalFrom,
    secret: authSecret(),
  });
});
