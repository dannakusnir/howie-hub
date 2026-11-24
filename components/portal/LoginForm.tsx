"use client";

import { useState, useTransition } from "react";
import { Brackets, HowieBackdrop, HudStrip } from "./Hud";
import HzMark from "./HzMark";

export type LoginResult = { readonly ok: true } | { readonly ok: false; readonly message: string };

/** Email sign-in. The same confirmation is shown whether or not the address is invited. */
export default function LoginForm({ request }: { request: (email: string) => Promise<LoginResult> }) {
  const [email, setEmail] = useState("");
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
        <HzMark className="h-12 w-auto mb-10" />
        <p className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-5">Yes Causing Course</p>
        {sentTo ? (
          <div>
            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">Check your <span className="text-green">email.</span></h1>
            <p className="mt-5 text-lg leading-8 text-[var(--p-dim)]">
              If <span className="text-white">{sentTo}</span> has been invited, a sign-in link is on its way. It works for 15 minutes.
            </p>
            <button
              type="button"
              onClick={() => setSentTo(null)}
              className="mt-8 font-mono text-[11px] tracking-[0.2em] uppercase text-green hover:text-white transition-colors duration-200 cursor-pointer"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setError(null);
              const address = email.trim().toLowerCase();
              startTransition(async () => {
                const result = await request(address);
                if (result.ok) setSentTo(address);
                else setError(result.message);
              });
            }}
          >
            <h1 className="text-5xl md:text-6xl font-black tracking-[-0.035em] leading-[0.95]">Your sessions, <span className="text-green">on the record.</span></h1>
            <p className="mt-5 text-lg leading-8 text-[var(--p-dim)]">
              Enter the email Howie invited. We will send you a link. No password.
            </p>
            <label htmlFor="login-email" className="block mt-10 mb-2 text-sm font-semibold">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@yourorganisation.org"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/10 focus:border-green/60 rounded-xl px-5 py-4 text-white text-base placeholder:text-white/30 outline-none transition-colors duration-200"
            />
            <button
              type="submit"
              disabled={pending}
              className="mt-4 w-full bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.35)] transition-shadow duration-300 disabled:opacity-60 cursor-pointer"
            >
              {pending ? "Sending" : "Email me a sign-in link"}
            </button>
            <p role="alert" className="mt-3 text-sm text-red min-h-5">
              {error}
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
