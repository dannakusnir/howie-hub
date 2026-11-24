import "server-only";
import type { ClientPrincipal, PrincipalUser, StaffPrincipal } from "./data/dto";

// The ONLY place the branded principals are constructed. Everything that reaches the data
// layer holds one of these, and holding one means: a live session, an enabled user, the
// right role. `disabled_at` is read from the database on every call, never from the cookie.
// Next.js's redirect/notFound are injected so this file runs under plain node in tests.

export const LOGIN_URL = "/portal/login";

export type GuardDeps = {
  /** The user behind the current session cookie, read fresh from the database; null when none. */
  getUser: () => Promise<PrincipalUser | null>;
  redirect: (url: string) => never;
  notFound: () => never;
};

export function createPrincipalGuards(deps: GuardDeps) {
  /** An enabled, signed-in user, or a redirect to the login page. */
  const signedIn = async (): Promise<PrincipalUser> => {
    const user = await deps.getUser();
    if (user === null || user.disabledAt !== null) return deps.redirect(LOGIN_URL);
    return user;
  };

  return {
    signedIn,

    /**
     * For route handlers that answer with a status code instead of a redirect (assets,
     * uploads). null = no live session or a disabled user.
     */
    async optionalPrincipal(): Promise<
      | { readonly kind: "client"; readonly principal: ClientPrincipal }
      | { readonly kind: "staff"; readonly principal: StaffPrincipal }
      | null
    > {
      const user = await deps.getUser();
      if (user === null || user.disabledAt !== null) return null;
      if (user.role === "client") {
        if (user.orgId === null) {
          throw new Error(`client user ${user.id} has no organisation (users_client_has_org violated)`);
        }
        return { kind: "client", principal: { userId: user.id, orgId: user.orgId } as unknown as ClientPrincipal };
      }
      return { kind: "staff", principal: { userId: user.id, role: user.role } as unknown as StaffPrincipal };
    },

    async requireClient(): Promise<ClientPrincipal> {
      const user = await signedIn();
      if (user.role !== "client") return deps.notFound();
      if (user.orgId === null) {
        throw new Error(`client user ${user.id} has no organisation (users_client_has_org violated)`);
      }
      return { userId: user.id, orgId: user.orgId } as unknown as ClientPrincipal;
    },

    async requireStaff(): Promise<StaffPrincipal> {
      const user = await signedIn();
      if (user.role === "client") return deps.notFound();
      return { userId: user.id, role: user.role } as unknown as StaffPrincipal;
    },
  };
}
