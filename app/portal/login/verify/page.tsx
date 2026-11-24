import type { Metadata } from "next";
import Link from "next/link";
import { Brackets, HowieBackdrop, HudStrip } from "@/components/portal/Hud";

// This page only DISPLAYS a button. It reads nothing from the database and spends no token:
// a mail scanner or link preview that fetches it (a GET) changes nothing. Pressing the
// button POSTs the token to /api/portal/auth/verify, which is what signs the person in.

export const metadata: Metadata = { title: "Confirm sign-in", referrer: "no-referrer" };

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[]; email?: string | string[] }>;
}) {
  const { token, email } = await searchParams;
  const valid = typeof token === "string" && token !== "" && typeof email === "string" && email !== "";

  return (
    <main className="relative min-h-dvh grid items-center p-5 md:p-10">
      <div className="absolute inset-5 md:inset-10">
        <HowieBackdrop />
        <Brackets />
        <div className="absolute top-6 left-12 right-12 md:top-8 md:left-16 md:right-16">
          <HudStrip left="Howie Zales · Client Portal" right="Invite only" />
        </div>
      </div>
      <div className="relative w-full max-w-md ml-0 md:ml-[8vw] px-6 md:px-0 py-24">
        <p className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-5">Yes Causing Course</p>
        {valid ? (
          <form method="POST" action="/api/portal/auth/verify">
            <input type="hidden" name="token" value={token} />
            <input type="hidden" name="email" value={email} />
            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">
              One more <span className="text-green">press.</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--p-dim)]">
              Press the button to sign in as <span className="text-white break-words">{email}</span>. The link works once.
            </p>
            <button
              type="submit"
              className="mt-10 w-full bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.35)] transition-shadow duration-300 cursor-pointer"
            >
              Sign in
            </button>
          </form>
        ) : (
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">
              That link is <span className="text-red">incomplete.</span>
            </h1>
            <p className="mt-5 text-lg leading-8 text-[var(--p-dim)]">
              Copy the whole address from the email, or request a fresh link.
            </p>
            <Link
              href="/portal/login"
              className="mt-8 inline-block font-mono text-[11px] tracking-[0.2em] uppercase text-green hover:text-white transition-colors duration-200"
            >
              Back to sign-in
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
