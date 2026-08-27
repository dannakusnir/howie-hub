"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Business = {
  id: string;
  code: string;
  name: string;
  year: string;
  tagline: string;
  description: string;
  metrics: { value: string; label: string }[];
  external?: string;
  cta: string;
  ctaLabel: string;
  accent: {
    text: string;
    border: string;
    hoverBorder: string;
    glow: string;
    dot: string;
    dotShadow: string;
    codeText: string;
    warmth: string;
  };
};

const ACCENT_RED = {
  text: "text-red",
  border: "border-red/10",
  hoverBorder: "hover:border-red/60",
  glow: "stat-glow-red",
  dot: "group-hover:bg-red",
  dotShadow: "group-hover:shadow-[0_0_10px_#FF3B3B]",
  codeText: "text-red/80",
  warmth: "warmth-red",
};
const ACCENT_BLUE = {
  text: "text-blue",
  border: "border-blue/10",
  hoverBorder: "hover:border-blue/60",
  glow: "stat-glow-blue",
  dot: "group-hover:bg-blue",
  dotShadow: "group-hover:shadow-[0_0_10px_#00D9FF]",
  codeText: "text-blue/80",
  warmth: "warmth-blue",
};
const ACCENT_AMBER = {
  text: "text-amber",
  border: "border-amber/10",
  hoverBorder: "hover:border-amber/60",
  glow: "stat-glow-amber",
  dot: "group-hover:bg-amber",
  dotShadow: "group-hover:shadow-[0_0_10px_#FFB800]",
  codeText: "text-amber/80",
  warmth: "warmth-amber",
};
const ACCENT_GREEN = {
  text: "text-green",
  border: "border-green/10",
  hoverBorder: "hover:border-green/60",
  glow: "stat-glow-green",
  dot: "group-hover:bg-green",
  dotShadow: "group-hover:shadow-[0_0_10px_#00FF88]",
  codeText: "text-green/80",
  warmth: "warmth-green",
};

const BUSINESSES: Business[] = [
  {
    id: "hjz",
    code: "01",
    name: "HJZ Productions",
    year: "Est. 2001 · NYC",
    tagline: "Built for productions that can't afford a bad day.",
    description:
      "IATSE union crews. ENG and studio. 25 years of showing up and delivering for WWE, AEW, NBC Sports, Apple TV, DAZN, NEP, MLS, NWSL, IMG, Gravity Media, Gametime, and Ross Productions.",
    metrics: [
      { value: "24y", label: "Operating" },
      { value: "IATSE", label: "Union crews" },
      { value: "16+", label: "Named clients" },
    ],
    external: "https://www.hjzproductions.com/",
    cta: "hjzproductions.com",
    ctaLabel: "Visit HJZ",
    accent: ACCENT_RED,
  },
  {
    id: "viridity",
    code: "02",
    name: "Viridity Entertainment Services",
    year: "Est. 2019 · Co-founded",
    tagline: "For moments that need to feel like more than a meeting.",
    description:
      "Livestream, hybrid, and corporate production for T-Mobile, Capital One, Food Network, GCI Health, Omaha Productions, Salt N Pepa, 160over90, and Temple Beth Sholom. Fireside chats, LinkedIn Lives, galas, panels, virtual and hybrid events.",
    metrics: [
      { value: "President", label: "Co-founder" },
      { value: "Fully", label: "Insured" },
      { value: "20+", label: "Years exp." },
    ],
    external: "https://www.viridityentertainment.com/",
    cta: "viridityentertainment.com",
    ctaLabel: "Visit Viridity",
    accent: ACCENT_BLUE,
  },
  {
    id: "podcast",
    code: "03",
    name: "Operator Mindset",
    year: "10 Episodes · Live",
    tagline: "Most shows interview people. This one operates on them.",
    description:
      "Leadership, execution, and the decisions that actually move the needle. 10 episodes and counting. Guests include founders, IATSE veterans, live production leaders, and an AI co-host who asks the questions most people are afraid to answer.",
    metrics: [
      { value: "10", label: "Episodes" },
      { value: "6", label: "Platforms" },
      { value: "Monthly", label: "Cadence" },
    ],
    external: "https://open.spotify.com/show/4imu9gnYItLR4Tq1A0vjyY",
    cta: "spotify.com",
    ctaLabel: "Listen on Spotify",
    accent: ACCENT_AMBER,
  },
  {
    id: "athena",
    code: "04",
    name: "Athena",
    year: "AI Operator · Live",
    tagline: "Not an assistant. An operator.",
    description:
      "Athena runs the back end of two production companies and a podcast. Meetings, follow-through, prep dossiers, contract precision, decision logs. Co-hosts Operator Mindset. Built by ACTi Beings.",
    metrics: [
      { value: "24/7", label: "On duty" },
      { value: "ACTi", label: "Beings" },
      { value: "Co-host", label: "Podcast" },
    ],
    cta: "Meet Athena",
    ctaLabel: "See profile",
    accent: ACCENT_GREEN,
  },
];

export default function Ecosystem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const cardWidth = 440;
  const cardGap = 32;
  const totalWidth = BUSINESSES.length * (cardWidth + cardGap);
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0px", `-${totalWidth - 500}px`]
  );

  return (
    <section id="ecosystem" className="relative">
      {/* Intro (before pinned) */}
      <div className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
              02 · The Ecosystem
            </KineticKicker>
            <KineticHeadline
              className="text-4xl md:text-6xl lg:text-7xl font-black tracking-[-0.03em] leading-[0.9] max-w-4xl"
              greenWords={["operator."]}
              as="h2"
            >
              {"Four lenses. One operator."}
            </KineticHeadline>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-text-dim text-base md:text-lg max-w-md leading-7"
          >
            Every business Howie has built solves the same problem from a
            different angle. Scroll to move the reel.
          </motion.p>
        </div>
      </div>

      {/* Mobile: vertical stack */}
      <div className="lg:hidden px-6 pb-16 space-y-4">
        {BUSINESSES.map((b) => (
          <article
            key={b.id}
            className={`group relative bg-[#0A0A0A] border border-white/8 ${b.accent.hoverBorder} rounded-2xl p-8 flex flex-col transition-colors duration-500 overflow-hidden`}
          >
            <div className={`absolute inset-0 pointer-events-none opacity-60 ${b.accent.warmth}`} />
            <header className="relative flex items-start justify-between mb-6">
              <div>
                <div className={`font-mono text-[10px] tracking-[0.3em] uppercase ${b.accent.text} mb-2`}>
                  {b.code} · {b.year}
                </div>
                <h3 className="text-2xl font-black tracking-tight text-white leading-tight">
                  {b.name}
                </h3>
              </div>
              <div className={`w-2 h-2 rounded-full bg-white/20 ${b.accent.dot} transition-all`} />
            </header>
            <p className="relative text-base font-medium text-white/90 mb-3 leading-snug">
              {b.tagline}
            </p>
            <p className="relative text-sm text-text-dim leading-7 mb-6">
              {b.description}
            </p>
            <div className="relative grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-white/5">
              {b.metrics.map((m) => (
                <div key={m.label}>
                  <div className={`text-base font-black ${b.accent.text} ${b.accent.glow}`}>{m.value}</div>
                  <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-text-dim mt-1">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>
            {b.external ? (
              <a
                href={b.external}
                target="_blank"
                rel="noopener noreferrer"
                className="relative inline-flex items-center justify-between text-sm text-white/70"
              >
                <span className="font-mono text-xs tracking-[0.2em] uppercase">
                  {b.ctaLabel}
                </span>
                <span className={`font-mono text-[10px] tracking-wider ${b.accent.text}`}>
                  {b.cta} →
                </span>
              </a>
            ) : (
              <div className="relative inline-flex items-center justify-between text-sm text-white/70">
                <span className="font-mono text-xs tracking-[0.2em] uppercase">
                  {b.ctaLabel}
                </span>
                <span className={`font-mono text-[10px] tracking-wider ${b.accent.text}`}>
                  {b.cta} →
                </span>
              </div>
            )}
          </article>
        ))}
      </div>

      {/* Desktop: pinned horizontal reel */}
      <div ref={containerRef} className="hidden lg:block" style={{ height: `${BUSINESSES.length * 90}vh` }}>
        <div className="sticky top-0 h-screen overflow-hidden flex items-center bg-black">
          {/* Reel decoration, top/bottom sprocket holes */}
          <div className="absolute top-6 left-0 right-0 h-4 flex gap-3 px-4 opacity-30">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="flex-1 max-w-4 bg-white/40 rounded-sm" style={{ minWidth: "8px" }} />
            ))}
          </div>
          <div className="absolute bottom-6 left-0 right-0 h-4 flex gap-3 px-4 opacity-30">
            {Array.from({ length: 60 }).map((_, i) => (
              <div key={i} className="flex-1 max-w-4 bg-white/40 rounded-sm" style={{ minWidth: "8px" }} />
            ))}
          </div>

          {/* Section counter */}
          <div className="absolute top-16 left-6 md:left-16 z-20">
            <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/60">
              REEL 02 · TRACK
            </div>
          </div>

          <motion.div
            style={{ x }}
            className="flex gap-6 pl-6 md:pl-16 pr-[40vw] will-change-transform"
          >
            {BUSINESSES.map((b) => (
              <article
                key={b.id}
                className={`group relative bg-[#0A0A0A] border border-white/8 ${b.accent.hoverBorder} rounded-2xl p-8 md:p-10 flex flex-col shrink-0 transition-colors duration-500 overflow-hidden`}
                style={{ width: `${cardWidth}px` }}
              >
                <div className={`absolute inset-0 pointer-events-none opacity-70 ${b.accent.warmth}`} />
                <header className="relative flex items-start justify-between mb-8">
                  <div>
                    <div className={`font-mono text-[10px] tracking-[0.3em] uppercase ${b.accent.text} mb-3`}>
                      {b.code} · {b.year}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white leading-tight">
                      {b.name}
                    </h3>
                  </div>
                  <div className={`w-2 h-2 rounded-full bg-white/20 ${b.accent.dot} ${b.accent.dotShadow} transition-all`} />
                </header>

                <p className="relative text-lg font-medium text-white/90 mb-4 leading-snug">
                  {b.tagline}
                </p>

                <p className="relative text-sm text-text-dim leading-7 mb-8 flex-1">
                  {b.description}
                </p>

                <div className="relative grid grid-cols-3 gap-3 mb-8 pb-8 border-b border-white/5">
                  {b.metrics.map((m) => (
                    <div key={m.label}>
                      <div className={`text-lg font-black ${b.accent.text} ${b.accent.glow}`}>{m.value}</div>
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-text-dim mt-1">
                        {m.label}
                      </div>
                    </div>
                  ))}
                </div>

                {b.external ? (
                  <a
                    href={b.external}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative inline-flex items-center justify-between text-sm text-white/70 hover:text-white transition-colors"
                  >
                    <span className="font-mono text-xs tracking-[0.2em] uppercase">
                      {b.ctaLabel}
                    </span>
                    <span className={`font-mono text-[10px] tracking-wider ${b.accent.text}`}>
                      {b.cta} →
                    </span>
                  </a>
                ) : (
                  <div className="relative inline-flex items-center justify-between text-sm text-white/70">
                    <span className="font-mono text-xs tracking-[0.2em] uppercase">
                      {b.ctaLabel}
                    </span>
                    <span className={`font-mono text-[10px] tracking-wider ${b.accent.text}`}>
                      {b.cta} →
                    </span>
                  </div>
                )}
              </article>
            ))}
          </motion.div>

          {/* Scroll cue overlay */}
          <div className="absolute bottom-24 right-6 md:right-16 z-20 font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60 flex items-center gap-2">
            <span>→ Scroll to advance reel</span>
          </div>
        </div>
      </div>
    </section>
  );
}
