import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "@/components/portal/LoginForm";
import { requestLogin } from "@/lib/portal/actions/login";
import { currentUser } from "@/lib/portal/principal";
import { ROLE_HOME } from "@/lib/portal/roles";
import { readSessionToken } from "@/lib/portal/session-cookie";

export const metadata: Metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  Verification: "That sign-in link has expired or was already used. Request a new one below.",
  AccessDenied: "That address cannot sign in. If you were invited, ask Howie to check the invitation.",
};
const GENERIC_ERROR = "Sign-in did not work. Request a new link below.";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string | string[] }> }) {
  const { error } = await searchParams;

  // Only look the session up when a session cookie exists: the login page itself needs no database.
  const jar = await cookies();
  if (readSessionToken((name) => jar.get(name)) !== null) {
    const user = await currentUser();
    if (user !== null && user.disabledAt === null) redirect(ROLE_HOME[user.role]);
  }

  const code = typeof error === "string" ? error : undefined;
  return (
    <>
      {code !== undefined && (
        <p
          role="alert"
          className="fixed top-0 inset-x-0 z-50 bg-red text-black text-center font-mono text-[11px] font-bold tracking-[0.14em] uppercase px-4 py-3"
        >
          {ERRORS[code] ?? GENERIC_ERROR}
        </p>
      )}
      <LoginForm request={requestLogin} />
    </>
  );
}
