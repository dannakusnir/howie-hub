import Image from "next/image";

/** The viewfinder corner used across howiezales.com, drawn the same way as the site hero. */
function Corner({ className, flipX = false, flipY = false }: { className: string; flipX?: boolean; flipY?: boolean }) {
  return (
    <svg
      className={`absolute pointer-events-none ${className}`}
      width="44"
      height="44"
      viewBox="0 0 52 52"
      fill="none"
      aria-hidden="true"
      style={{ transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` }}
    >
      <path d="M2 24V2H24" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="square" />
      <circle cx="2" cy="2" r="2" fill="#00FF88" />
    </svg>
  );
}

/** Four corners on the nearest positioned ancestor. */
export function Brackets() {
  return (
    <>
      <Corner className="top-0 left-0" />
      <Corner className="top-0 right-0" flipX />
      <Corner className="bottom-0 left-0" flipY />
      <Corner className="bottom-0 right-0" flipX flipY />
    </>
  );
}

/** A pulsing tally light. Green = on the record for this client, amber = coming up, red = recording. */
export function Tally({ tone = "green" }: { tone?: "green" | "amber" | "red" }) {
  const color = tone === "green" ? "bg-green" : tone === "amber" ? "bg-amber" : "bg-red-live";
  return (
    <span className="relative flex h-2 w-2 shrink-0" aria-hidden="true">
      <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping motion-reduce:animate-none ${color}`} />
      <span className={`relative inline-flex h-2 w-2 rounded-full ${color}`} />
    </span>
  );
}

/** The strip across the top of a framed scene: what is live on the left, a readout on the right. */
export function HudStrip({ left, right, tone = "green" }: { left: string; right?: string; tone?: "green" | "amber" | "red" }) {
  return (
    <div className="flex items-center justify-between gap-6 font-mono text-[11px] tracking-[0.3em] uppercase">
      <span className="flex items-center gap-3 text-white/70">
        <Tally tone={tone} />
        {left}
      </span>
      {right && <span className="text-green tracking-[0.15em] whitespace-nowrap">{right}</span>}
    </div>
  );
}

/** Howie behind the scene, graded the way the site hero grades him. Decorative. */
export function HowieBackdrop({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`} aria-hidden="true">
      <div className="absolute inset-y-0 right-0 w-full md:w-2/3 opacity-[0.2] mix-blend-screen">
        <Image src="/howie-front.png" alt="" fill sizes="(max-width: 768px) 100vw, 60vw" className="object-cover object-top" />
      </div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_85%_30%,rgba(0,255,136,0.10)_0%,transparent_65%)]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#050505]" />
    </div>
  );
}

/** Mono green kicker, as the site sets them above its headlines. */
export function Kicker({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-5">{children}</p>;
}

/** Whole days from now until `when`, for the countdown readout. */
export function countdown(when: Date, now: Date): string {
  const days = Math.ceil((when.getTime() - now.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  return days === 1 ? "In 1 day" : `In ${days} days`;
}
