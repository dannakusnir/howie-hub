"use client";

import Link from "next/link";
import { Brackets, HudStrip, Kicker } from "@/components/portal/Hud";

// Shown when something under /portal throws, for example when the database cannot be
// reached. It is deliberately loud: a broken page must never look like an empty roadmap.

export default function PortalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <main className="relative min-h-dvh grid items-center p-5 md:p-10">
      <div className="relative px-6 py-24 md:px-12 max-w-3xl">
        <div className="absolute inset-0 -z-0">
          <Brackets />
        </div>
        <div className="relative">
          <HudStrip tone="red" left="Portal fault" right="Not your fault" />
          <div className="mt-14">
            <Kicker>Something broke on our side</Kicker>
            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.035em] leading-[0.95] text-balance">
              This page <span className="text-red">did not load.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--p-dim)] max-w-xl">
              Nothing you did caused this, and nothing was lost. Try again in a moment. If it keeps happening, tell Howie and quote the
              reference below.
            </p>
            {error.digest && <p className="mt-5 font-mono text-[11px] tracking-[0.16em] uppercase text-[var(--p-dim)]">Reference: {error.digest}</p>}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <button
                type="button"
                onClick={() => unstable_retry()}
                className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-7 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow duration-300 cursor-pointer"
              >
                Try again
              </button>
              <Link href="/portal" className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/60 hover:text-green transition-colors duration-200">
                Back to the portal
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
