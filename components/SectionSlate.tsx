"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

/**
 * Broadcast clapper-slate divider between sections.
 * Renders as a black bar with white/green stripes that "claps" when in view.
 */
export default function SectionSlate({
  scene,
  take = "01",
  cam = "01",
  label,
}: {
  scene: string;
  take?: string;
  cam?: string;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20%" });

  return (
    <div ref={ref} className="relative py-8 md:py-10 px-6 md:px-16 bg-black overflow-hidden">
      {/* Clapper diagonal stripes on top */}
      <div className="absolute top-0 left-0 right-0 h-3 flex">
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ scaleY: 0 }}
            animate={inView ? { scaleY: 1 } : { scaleY: 0 }}
            transition={{ delay: i * 0.015, duration: 0.3 }}
            className={`flex-1 ${i % 2 === 0 ? "bg-white/90" : "bg-black"}`}
            style={{ transformOrigin: "top" }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={inView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className="max-w-7xl mx-auto flex items-center justify-between gap-4 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase"
      >
        <div className="flex items-center gap-4 md:gap-8">
          <span className="text-green font-bold">SC · {scene}</span>
          <span className="text-white/40 hidden md:inline">TAKE · {take}</span>
          <span className="text-white/40 hidden md:inline">CAM · {cam}</span>
        </div>
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ opacity: [1, 0.3, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-1.5 h-1.5 rounded-full bg-red-500"
          />
          <span className="text-white/80 font-medium tracking-[0.25em]">{label}</span>
        </div>
      </motion.div>
    </div>
  );
}
