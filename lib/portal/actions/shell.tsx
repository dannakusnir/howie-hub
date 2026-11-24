import type { ComponentProps } from "react";
import type Shell from "../../../components/portal/Shell";
import type { PrincipalUser } from "../data/dto";
import { type NavKey, ROLE_HOME, ROLE_NAV } from "../roles";
import { signOutAction } from "./session";

type ShellProps = Omit<ComponentProps<typeof Shell>, "children">;

/** Top-bar props for a signed-in user: their home, their role's nav, who they are, sign out. */
export function shellProps(user: PrincipalUser, active: NavKey): ShellProps {
  const who =
    user.role === "client"
      ? [user.name ?? user.email, user.orgName].filter((part) => part !== null).join(" · ")
      : (user.name ?? user.email);
  return {
    homeHref: ROLE_HOME[user.role],
    nav: ROLE_NAV[user.role].map((entry) => ({
      label: entry.label,
      href: entry.href,
      current: entry.key === active,
    })),
    who,
    signOut: (
      <form action={signOutAction}>
        <button
          type="submit"
          className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/60 hover:text-green transition-colors duration-200 cursor-pointer py-2"
        >
          Sign out
        </button>
      </form>
    ),
  };
}
