"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, ReactNode } from "react";

/**
 * Sticky-pinned horizontal scroll section.
 * Wraps children in a horizontally-scrolling reel that scrubs with page scroll.
 * Uses ~2-3x viewport height as the pinned "scroll runway".
 */
export default function HorizontalReel({
  children,
  className = "",
  runwayVh = 300,
}: {
  children: ReactNode;
  className?: string;
  runwayVh?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-66%"]);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ height: `${runwayVh}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        <motion.div style={{ x }} className="flex gap-6 pl-6 md:pl-16 pr-[50vw] will-change-transform">
          {children}
        </motion.div>
      </div>
    </div>
  );
}
