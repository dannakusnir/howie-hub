"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const CAPABILITIES = [
  {
    n: "01",
    title: "Meeting triage",
    detail: "Accepts, declines, or reschedules based on strategic fit, not politeness. You are only ever in rooms that cause yes.",
  },
  {
    n: "02",
    title: "Unwavering follow-through",
    detail: "Flags a dropped ball before you sense the shift. Drafts the follow-up in your voice. Momentum recovered and compounded.",
  },
  {
    n: "03",
    title: "Contract precision",
    detail: "Pre-reads every agreement. Surfaces the three lines that actually matter. The ones that shift the leverage, define the risk, or unlock the opportunity.",
  },
  {
    n: "04",
    title: "Strategic dossiers",
    detail: "Every attendee, every company, every recent move distilled into a pre-meeting brief. Your unfair advantage.",
  },
  {
    n: "05",
    title: "Podcast co-host",
    detail: "Brings diagnostic insight and energetic precision to every Operator Mindset episode. Every word lands. Every listener moves from knowing to doing.",
  },
  {
    n: "06",
    title: "Decision log",
    detail: "Every decision, commitment, and why logged. Institutional memory that guarantees clarity and accountability. Always.",
  },
];

const LOG_ENTRIES = [
  { time: "07:12", event: "Reviewed 34 overnight emails · flagged 3 for morning" },
  { time: "07:58", event: "Declined Tuesday sync · agenda misaligned with quarterly focus" },
  { time: "08:44", event: "Drafted follow-up to Capital One re: Q3 fireside · sent for approval" },
  { time: "09:30", event: "Pre-read HJZ crew agreement v3.2 · 2 clauses need attention" },
  { time: "10:15", event: "Booked Wednesday recording block · Operator Mindset Ep 004" },
  { time: "11:02", event: "Prep dossier ready · Meeting with T-Mobile at 14:00" },
];

function LiveLog() {
  const [visible, setVisible] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setVisible((v) => (v + 1) % (LOG_ENTRIES.length + 1));
    }, 2400);
    return () => clearInterval(interval);
  }, []);
  return (
    <div className="bg-black border border-green/25 rounded-2xl p-6 md:p-8 font-mono">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
          </span>
          <span className="text-[10px] tracking-[0.3em] uppercase text-green">
            Live · Activity Log
          </span>
        </div>
        <span className="text-[10px] tracking-[0.3em] uppercase text-text-dim">
          Today
        </span>
      </div>
      <div className="space-y-2">
        {LOG_ENTRIES.map((entry, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              opacity: i < visible ? 1 : 0.15,
              x: 0,
            }}
            transition={{ duration: 0.4 }}
            className="flex items-start gap-4 text-xs"
          >
            <span className="text-green/70 shrink-0 w-12">{entry.time}</span>
            <span className="text-white/80 leading-6">{entry.event}</span>
          </motion.div>
        ))}
      </div>
      <div className="mt-6 pt-4 border-t border-white/8 flex items-center justify-between text-[9px] tracking-[0.3em] uppercase text-text-dim">
        <span>End of log</span>
        <span>{LOG_ENTRIES.length} entries · today</span>
      </div>
    </div>
  );
}

export default function AthenaCapabilities() {
  return (
    <section
      id="athena-capabilities"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            · What Athena Does
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
            greenWords={["operates."]}
            as="h2"
          >
            {"She does not assist. She operates."}
          </KineticHeadline>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Capabilities grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CAPABILITIES.map((c, i) => (
                <motion.div
                  key={c.n}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
                  className="group bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-6 transition-colors"
                >
                  <div className="flex items-start justify-between mb-4">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70">
                      {c.n}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-green transition-colors" />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mb-2 leading-tight">
                    {c.title}
                  </h3>
                  <p className="text-sm text-text-dim leading-6">{c.detail}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Live activity log */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <LiveLog />
              <p className="mt-4 text-xs text-text-dim leading-6">
                Sample activity feed. Real production data stays private ,
                obviously.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
