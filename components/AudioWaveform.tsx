"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

export default function AudioWaveform({
  bars = 48,
  height = 60,
  className = "",
  playing = true,
}: {
  bars?: number;
  height?: number;
  className?: string;
  playing?: boolean;
}) {
  const seeds = useMemo(
    () => Array.from({ length: bars }, () => 0.25 + Math.random() * 0.75),
    [bars]
  );

  return (
    <div
      className={`flex items-center gap-[3px] ${className}`}
      style={{ height }}
      aria-hidden
    >
      {seeds.map((seed, i) => (
        <motion.span
          key={i}
          className="w-[3px] rounded-full bg-green"
          initial={{ scaleY: 0.15 }}
          animate={
            playing
              ? {
                  scaleY: [
                    seed * 0.25,
                    seed * 1,
                    seed * 0.5,
                    seed * 0.85,
                    seed * 0.3,
                  ],
                }
              : { scaleY: 0.15 }
          }
          transition={{
            duration: 1.2 + (i % 5) * 0.15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: (i % 12) * 0.05,
          }}
          style={{
            height: "100%",
            transformOrigin: "center",
            boxShadow: "0 0 6px rgba(0,255,136,0.4)",
          }}
        />
      ))}
    </div>
  );
}
