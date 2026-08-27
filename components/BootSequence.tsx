"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const GLITCH_CHARS = "▓▒░█▄▀■◆◇◈▲△▼▽◄►▪▫";

function randomChar() {
  return GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
}

function GlitchText({ text, active }: { text: string; active: boolean }) {
  const [display, setDisplay] = useState(text.replace(/./g, () => randomChar()));

  useEffect(() => {
    if (!active) {
      setDisplay(text);
      return;
    }
    let frame = 0;
    const totalFrames = 20;
    const interval = setInterval(() => {
      frame++;
      const revealCount = Math.floor((frame / totalFrames) * text.length);
      setDisplay(
        text
          .split("")
          .map((ch, i) => (i < revealCount ? ch : randomChar()))
          .join("")
      );
      if (frame >= totalFrames) {
        setDisplay(text);
        clearInterval(interval);
      }
    }, 40);
    return () => clearInterval(interval);
  }, [text, active]);

  return <span>{display}</span>;
}

const COLOR_BARS = [
  "#C0C0C0", "#C0C000", "#00C0C0", "#00C000",
  "#C000C0", "#C00000", "#0000C0",
];

export default function BootSequence() {
  const [phase, setPhase] = useState(0);
  const [done, setDone] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const seen = sessionStorage.getItem("hz-boot-seen");
    if (seen) return;
    sessionStorage.setItem("hz-boot-seen", "1");
    setDone(false);

    const t1 = setTimeout(() => setPhase(1), 350);
    const t2 = setTimeout(() => setPhase(2), 700);
    const t3 = setTimeout(() => setPhase(3), 1150);
    const t4 = setTimeout(() => setPhase(4), 1600);
    const t5 = setTimeout(() => setPhase(5), 1800);
    const tEnd = setTimeout(() => setDone(true), 2400);
    return () => [t1, t2, t3, t4, t5, tEnd].forEach(clearTimeout);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[10000] bg-black overflow-hidden"
        >
          {/* Phase 0: SMPTE color bars */}
          <AnimatePresence>
            {phase === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0.9, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
                className="absolute inset-0 flex"
              >
                {COLOR_BARS.map((c, i) => (
                  <div key={i} className="flex-1" style={{ backgroundColor: c }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 1: Static/noise */}
          <AnimatePresence>
            {phase === 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0.3, 0.7, 0.2] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, times: [0, 0.2, 0.4, 0.7, 1] }}
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundImage:
                    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                }}
              />
            )}
          </AnimatePresence>

          {/* Phase 2+: Reticle crosshair */}
          <AnimatePresence>
            {phase >= 2 && phase < 4 && (
              <motion.svg
                initial={{ opacity: 0, scale: 2.5, rotate: -20 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                width="280" height="280" viewBox="0 0 280 280" fill="none"
              >
                <circle cx="140" cy="140" r="120" stroke="#00FF88" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx="140" cy="140" r="80" stroke="#00FF88" strokeWidth="1.5" />
                <circle cx="140" cy="140" r="4" fill="#00FF88" />
                <path d="M140 20 V 100 M140 180 V 260 M20 140 H 100 M180 140 H 260" stroke="#00FF88" strokeWidth="1.5" />
                <path d="M40 40 L60 40 L60 60 M240 40 L220 40 L220 60 M40 240 L60 240 L60 220 M240 240 L220 240 L220 220" stroke="#00FF88" strokeWidth="2" fill="none" />
              </motion.svg>
            )}
          </AnimatePresence>

          {/* Signal lock text */}
          <AnimatePresence>
            {phase === 3 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute bottom-1/3 left-1/2 -translate-x-1/2 text-center"
              >
                <div className="font-mono text-green text-xs tracking-[0.5em] mb-2">
                  <GlitchText text="SIGNAL LOCKED" active />
                </div>
                <div className="font-mono text-white/50 text-[10px] tracking-[0.4em]">
                  CAM 01 · 24.000 FPS · REC
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 4: White clapper slap flash */}
          <AnimatePresence>
            {phase === 4 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0.9] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-white"
              />
            )}
          </AnimatePresence>

          {/* Top/bottom clapper stripes on phase 4-5 */}
          <AnimatePresence>
            {phase >= 4 && (
              <>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-0 left-0 right-0 h-4 flex origin-top"
                >
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 ${i % 2 === 0 ? "bg-white" : "bg-black"}`}
                    />
                  ))}
                </motion.div>
                <motion.div
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  exit={{ scaleY: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute bottom-0 left-0 right-0 h-4 flex origin-bottom"
                >
                  {Array.from({ length: 40 }).map((_, i) => (
                    <div
                      key={i}
                      className={`flex-1 ${i % 2 === 0 ? "bg-white" : "bg-black"}`}
                    />
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Slate info overlay */}
          <AnimatePresence>
            {phase === 5 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <div className="font-mono text-green text-xs tracking-[0.5em] mb-3">
                  SCENE · 01
                </div>
                <div className="font-black text-white text-4xl md:text-6xl tracking-[-0.02em] mb-3">
                  HOWIE ZALES
                </div>
                <div className="font-mono text-white/60 text-[10px] tracking-[0.4em]">
                  ROLL · 2026 · TAKE ONE
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
