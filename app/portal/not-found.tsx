import Link from "next/link";
import { Brackets, HudStrip, Kicker } from "@/components/portal/Hud";

export default function PortalNotFound() {
  return (
    <main className="relative min-h-dvh grid items-center p-5 md:p-10">
      <div className="relative px-6 py-24 md:px-12 max-w-3xl">
        <div className="absolute inset-0">
          <Brackets />
        </div>
        <div className="relative">
          <HudStrip tone="amber" left="Off the record" right="404" />
          <div className="mt-14">
            <Kicker>Not found</Kicker>
            <h1 className="text-5xl md:text-7xl font-black tracking-[-0.035em] leading-[0.95] text-balance">
              Nothing here <span className="text-amber">for you.</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--p-dim)] max-w-xl">
              That page does not exist, or it is not one you can open. Head back to your overview.
            </p>
            <Link
              href="/portal"
              className="mt-10 inline-flex items-center justify-center bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-7 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow duration-300"
            >
              Back to the portal
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
