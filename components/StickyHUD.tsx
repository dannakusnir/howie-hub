"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "OPEN" },
  { id: "vision", label: "S01 · VISION" },
  { id: "ecosystem", label: "S02 · WORK" },
  { id: "podcast", label: "S03 · SHOW" },
  { id: "credentials", label: "S04 · CREDITS" },
  { id: "athena", label: "S05 · ATHENA" },
  { id: "cyber", label: "S06 · CYBER" },
  { id: "course", label: "S07 · COURSE" },
  { id: "featured", label: "S08 · PRESS" },
  { id: "podcast-guest", label: "S09 · PITCH" },
];

function useTimecode() {
  const [t, setT] = useState({ h: "00", m: "00", s: "00", f: "00" });
  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const totalFrames = Math.floor((elapsed / 1000) * 24);
      const f = totalFrames % 24;
      const s = Math.floor(totalFrames / 24) % 60;
      const m = Math.floor(totalFrames / (24 * 60)) % 60;
      const h = Math.floor(totalFrames / (24 * 60 * 60));
      setT({
        h: String(h).padStart(2, "0"),
        m: String(m).padStart(2, "0"),
        s: String(s).padStart(2, "0"),
        f: String(f).padStart(2, "0"),
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return t;
}

export default function StickyHUD() {
  const tc = useTimecode();
  const { scrollYProgress } = useScroll();
  const [currentSection, setCurrentSection] = useState(SECTIONS[0]);
  const [pct, setPct] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setPct(Math.round(v * 100));
    const idx = Math.min(SECTIONS.length - 1, Math.floor(v * SECTIONS.length));
    setCurrentSection(SECTIONS[idx]);
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.8, duration: 0.6 }}
      className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none"
    >
      <div className="bg-gradient-to-t from-black via-black/90 to-transparent pt-8 pb-3 px-6 md:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono text-[10px] md:text-[11px] tracking-[0.25em] uppercase">
          {/* Left: REC + section */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-red-500" />
              </span>
              <span className="text-red-500 font-bold">REC</span>
            </div>
            <span className="text-green">{currentSection.label}</span>
          </div>

          {/* Center: progress track */}
          <div className="hidden md:flex items-center gap-3 flex-1 max-w-md">
            <span className="text-text-dim/70">{String(pct).padStart(3, "0")}%</span>
            <div className="h-[2px] flex-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green to-green-electric"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Right: Timecode */}
          <div className="flex items-center gap-2 md:gap-4">
            <span className="text-text-dim/70 hidden md:inline">TC</span>
            <span className="text-white/90">
              {tc.h}:{tc.m}:{tc.s}
              <span className="text-green">:{tc.f}</span>
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
