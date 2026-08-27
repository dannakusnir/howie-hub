"use client";

import { motion } from "framer-motion";
import AnimatedNumber from "./AnimatedNumber";
import MarqueeTicker from "./MarqueeTicker";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const HEADLINE_CREDITS = [
  { label: "Emmy", suffix: "", detail: "Award recipient" },
  { label: "Super Bowl", suffix: "", detail: "NFL Network handheld" },
  { label: "Olympics", suffix: "", detail: "Summer + Winter Games" },
  { label: "WrestleMania", suffix: "", detail: "WWE ring camera" },
];

const COUNTERS = [
  { value: 25, suffix: "+", label: "Years on set" },
  { value: 16, suffix: "+", label: "Networks served" },
  { value: 40, suffix: "+", label: "Podcast features" },
  { value: 3, suffix: "", label: "Businesses built" },
];

export default function CredentialsWall() {
  return (
    <section id="credentials" className="relative py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
          04 · The Receipts
        </KineticKicker>
        <KineticHeadline
          className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-16 max-w-4xl"
          greenWords={["cameras", "roll."]}
          as="h2"
        >
          {"Where the cameras roll."}
        </KineticHeadline>

        {/* Headline credits */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-14">
          {HEADLINE_CREDITS.map((c, i) => (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="group bg-[#080808] border border-white/8 hover:border-green/60 rounded-2xl p-6 md:p-8 transition-colors duration-300 relative overflow-hidden"
            >
              {/* Sweep line on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-green to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70 mb-3">
                {c.detail}
              </div>
              <div className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {c.label}
              </div>
              <div className="mt-6 h-px w-full bg-white/8 group-hover:bg-green/40 transition-colors" />
            </motion.div>
          ))}
        </div>

        {/* Animated counters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 pt-12 mb-16 border-t border-white/8"
        >
          {COUNTERS.map((c) => (
            <div key={c.label}>
              <div className="text-4xl md:text-6xl font-black text-green tracking-tight leading-none">
                <AnimatedNumber value={c.value} suffix={c.suffix} />
              </div>
              <div className="font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase text-text-dim mt-3">
                {c.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Full-width marquee, bleed to edges */}
      <div className="mt-8">
        <div className="max-w-7xl mx-auto px-0 mb-4">
          <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60">
            · Networks & brands · rolling
          </p>
        </div>
        <MarqueeTicker />
      </div>
    </section>
  );
}
