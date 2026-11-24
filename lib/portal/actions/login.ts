"use server";

import { signIn } from "../auth";
import { AUTH_PROVIDER_ID } from "../auth-config";
import { type LoginResult, requestLoginLink } from "./login-core";

/** Sign-in form action. Same answer for every address; see requestLoginLink. */
export async function requestLogin(email: string): Promise<LoginResult> {
  return requestLoginLink(email, (address) =>
    signIn(AUTH_PROVIDER_ID, { email: address, redirect: false, redirectTo: "/portal" }) as Promise<string>,
  );
}
