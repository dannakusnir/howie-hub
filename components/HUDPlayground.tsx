"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/**
 * HUDPlayground, persistent broadcast-HUD overlay that reacts to the viewport + cursor.
 * - Live crosshair position readout
 * - Aperture/focus rings that expand toward the pointer
 * - Section identifier that reads what the cursor is on
 */
export default function HUDPlayground() {
  const [visible, setVisible] = useState(false);
  const [readout, setReadout] = useState<{ x: number; y: number; target: string }>({
    x: 0,
    y: 0,
    target: "IDLE",
  });

  const focusX = useMotionValue(0);
  const focusY = useMotionValue(0);
  const springX = useSpring(focusX, { stiffness: 60, damping: 20, mass: 0.8 });
  const springY = useSpring(focusY, { stiffness: 60, damping: 20, mass: 0.8 });

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;
    setVisible(true);

    const move = (e: MouseEvent) => {
      focusX.set(e.clientX);
      focusY.set(e.clientY);

      const el = e.target as HTMLElement;
      const section = el?.closest("section, header, footer, article, nav");
      const id = section?.id?.toUpperCase() || section?.tagName || "IDLE";

      setReadout({
        x: Math.round((e.clientX / window.innerWidth) * 100),
        y: Math.round((e.clientY / window.innerHeight) * 100),
        target: id.slice(0, 24),
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [focusX, focusY]);

  if (!visible) return null;

  return (
    <>
      {/* Trailing focus ring, expands toward cursor */}
      <motion.div
        className="fixed pointer-events-none z-[9995] w-24 h-24 rounded-full border border-green/20"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />
      <motion.div
        className="fixed pointer-events-none z-[9995] w-64 h-64 rounded-full border border-green/8"
        style={{
          x: springX,
          y: springY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      />

      {/* Live crosshair readout, top-right corner */}
      <div className="fixed top-24 right-4 z-[45] pointer-events-none hidden md:block">
        <div className="bg-black/60 backdrop-blur-md border border-green/25 rounded-md px-3 py-2 font-mono text-[9px] tracking-[0.25em] uppercase min-w-[140px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1 h-1 rounded-full bg-green animate-pulse" />
            <span className="text-green/80">Cursor Track</span>
          </div>
          <div className="text-white/80 space-y-0.5">
            <div>
              <span className="text-text-dim">X ·</span>{" "}
              <span className="text-green">{String(readout.x).padStart(3, "0")}%</span>
            </div>
            <div>
              <span className="text-text-dim">Y ·</span>{" "}
              <span className="text-green">{String(readout.y).padStart(3, "0")}%</span>
            </div>
            <div className="pt-1 border-t border-white/8 mt-1 truncate">
              <span className="text-text-dim">TGT ·</span>{" "}
              <span className="text-green">{readout.target}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
