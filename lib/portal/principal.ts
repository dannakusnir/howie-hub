import "server-only";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { forAuth } from "./data/auth";
import type { PrincipalUser } from "./data/dto";
import { createPrincipalGuards } from "./principal-core";
import { readSessionToken } from "./session-cookie";

// requireClient() and requireStaff() are what every portal page and server action calls
// first. No session: redirect to /portal/login. Wrong role: notFound(). A disabled user:
// back to login. The session is read from the database (not through Auth.js's session
// endpoint, which would swallow a database failure as "signed out"): an outage is an error.

/** The signed-in user, fetched once per request. null when there is no valid session cookie. */
export const currentUser = cache(async (): Promise<PrincipalUser | null> => {
  const jar = await cookies();
  const token = readSessionToken((name) => jar.get(name));
  return token === null ? null : forAuth().sessionUser(token);
});

export const { requireClient, requireStaff, signedIn, optionalPrincipal } = createPrincipalGuards({
  getUser: currentUser,
  redirect,
  notFound,
});
