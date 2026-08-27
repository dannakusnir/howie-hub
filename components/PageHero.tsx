"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import AudioWaveform from "./AudioWaveform";

type Variant = "vision" | "work" | "podcast" | "athena" | "press" | "blog" | "contact";

export default function PageHero({
  kicker,
  title,
  subtitle,
  greenWords = [],
  backHref = "/",
  backLabel = "← Back to hub",
  scene,
  variant = "vision",
  bigYear,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  greenWords?: string[];
  backHref?: string;
  backLabel?: string;
  scene: string;
  variant?: Variant;
  bigYear?: string;
}) {
  return (
    <section className="relative min-h-[70vh] pt-32 pb-16 md:pt-40 md:pb-24 px-6 md:px-16 overflow-hidden border-b border-white/5 flex items-end">
      {/* Variant-specific backdrop */}
      {variant === "vision" && (
        <>
          <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-green/40 to-transparent" />
          {bigYear && (
            <div
              className="absolute right-4 md:right-16 top-24 md:top-32 text-white/[0.03] font-black leading-none pointer-events-none select-none"
              style={{ fontSize: "clamp(200px, 32vw, 500px)" }}
            >
              {bigYear}
            </div>
          )}
        </>
      )}
      {variant === "work" && (
        <>
          <div className="absolute top-24 md:top-32 left-6 md:left-16 flex items-center gap-3 z-20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/70">
              LIVE · Sample reel
            </span>
          </div>
          <svg
            className="absolute top-1/2 right-6 md:right-24 -translate-y-1/2 opacity-15 pointer-events-none hidden md:block"
            width="260"
            height="260"
            viewBox="0 0 260 260"
            fill="none"
          >
            <circle cx="130" cy="130" r="110" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 6" />
            <circle cx="130" cy="130" r="70" stroke="#00FF88" strokeWidth="1" />
            <circle cx="130" cy="130" r="4" fill="#00FF88" />
            <path d="M130 30 V 90 M130 170 V 230 M30 130 H 90 M170 130 H 230" stroke="#00FF88" strokeWidth="1" />
          </svg>
        </>
      )}
      {variant === "podcast" && (
        <>
          <div className="absolute inset-x-0 bottom-8 flex justify-center opacity-30 pointer-events-none">
            <div className="w-full max-w-3xl">
              <AudioWaveform bars={64} height={80} />
            </div>
          </div>
          <div className="absolute top-24 md:top-32 right-6 md:right-16 flex items-center gap-3 z-20">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green shadow-[0_0_10px_#00FF88]" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green">
              ON AIR
            </span>
          </div>
        </>
      )}
      {variant === "athena" && (
        <>
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]">
            <div className="absolute inset-y-0 left-1/4 w-px bg-green" />
            <div className="absolute inset-y-0 left-2/4 w-px bg-green" />
            <div className="absolute inset-y-0 left-3/4 w-px bg-green" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-green" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-green" />
          </div>
          <div className="absolute top-24 md:top-32 right-6 md:right-16 font-mono text-[10px] tracking-[0.3em] uppercase text-green z-20 flex items-center gap-3">
            <span>SYS · ATHENA</span>
            <span className="text-text-dim">·</span>
            <span>ONLINE</span>
          </div>
        </>
      )}
      {variant === "press" && (
        <div className="absolute inset-x-0 top-1/4 flex flex-col gap-2 opacity-[0.04] pointer-events-none">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="h-px w-full bg-white" />
          ))}
        </div>
      )}
      {variant === "blog" && (
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage:
              "repeating-linear-gradient(90deg, transparent 0, transparent 24px, rgba(255,255,255,0.5) 24px, rgba(255,255,255,0.5) 25px)",
          }}
        />
      )}
      {variant === "contact" && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute w-1 h-1 rounded-full bg-green/30"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 11) % 100}%`,
                animation: `blink-dot ${2 + (i % 3)}s ease-in-out infinite ${i * 0.1}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* HUD frame corners (all variants) */}
      <svg className="absolute top-24 left-6 md:left-10 z-20" width="44" height="44" viewBox="0 0 44 44" fill="none">
        <path d="M2 22V2H22" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="square" />
        <circle cx="2" cy="2" r="2" fill="#00FF88" />
      </svg>
      <svg className="absolute top-24 right-6 md:right-10 z-20" width="44" height="44" viewBox="0 0 44 44" fill="none" style={{ transform: "scaleX(-1)" }}>
        <path d="M2 22V2H22" stroke="#00FF88" strokeWidth="1.5" strokeLinecap="square" />
        <circle cx="2" cy="2" r="2" fill="#00FF88" />
      </svg>

      {/* Ambient glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.06)_0%,transparent_60%)] pointer-events-none"
      />

      {/* Scene marker (centered for all) */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute top-24 left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.4em] uppercase text-green/60 flex items-center gap-3 z-20"
      >
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
        </span>
        <span>SC · {scene}</span>
        <span className="text-text-dim/60">·</span>
        <span>TAKE 01</span>
      </motion.div>

      <div className="relative max-w-7xl mx-auto w-full z-10">
        <Link
          href={backHref}
          className="inline-flex items-center gap-2 font-mono text-[11px] tracking-[0.3em] uppercase text-text-dim hover:text-green transition-colors mb-10 group"
        >
          <span className="w-6 h-px bg-text-dim group-hover:bg-green transition-colors" />
          {backLabel}
        </Link>

        <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
          {kicker}
        </KineticKicker>

        <KineticHeadline
          className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[-0.03em] leading-[0.9] mb-8 max-w-5xl"
          greenWords={greenWords}
          as="h1"
        >
          {title}
        </KineticHeadline>

        {subtitle && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className="text-lg md:text-xl text-text-dim leading-8 max-w-2xl"
          >
            {subtitle}
          </motion.p>
        )}
      </div>
    </section>
  );
}
