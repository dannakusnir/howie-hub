"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useRef } from "react";

/**
 * Parallax layer, depth via scroll-linked Y translation.
 * speed: -1.0 (deep background) to 1.0 (foreground). 0 = no parallax.
 * Depth also affects opacity fade at scroll edges.
 */
export default function ParallaxLayer({
  children,
  speed = 0.2,
  className = "",
  scale = 1,
  fadeOnScroll = false,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  scale?: number;
  fadeOnScroll?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const yPct = speed * 30;
  const y = useTransform(scrollYProgress, [0, 1], [`${yPct}%`, `${-yPct}%`]);
  const opacity = fadeOnScroll
    ? useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0])
    : undefined;

  return (
    <motion.div
      ref={ref}
      style={{
        y,
        scale,
        opacity,
        willChange: "transform",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * DepthBackdrop, 3-layer parallax backdrop for any section.
 * Renders far/mid/near layers with different speeds and opacity.
 */
export function DepthBackdrop({
  className = "",
}: {
  className?: string;
}) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}>
      {/* Far layer, slowest, most transparent */}
      <ParallaxLayer speed={-0.4} className="absolute inset-0">
        <div className="absolute top-[10%] left-[15%] w-[300px] h-[300px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.08)_0%,transparent_60%)]" />
        <div className="absolute bottom-[15%] right-[10%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.05)_0%,transparent_65%)]" />
      </ParallaxLayer>

      {/* Mid layer, medium speed */}
      <ParallaxLayer speed={-0.15} className="absolute inset-0">
        <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.06)_0%,transparent_55%)]" />
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 opacity-20">
          <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
            <circle cx="60" cy="60" r="50" stroke="#00FF88" strokeWidth="0.5" strokeDasharray="3 5" />
            <circle cx="60" cy="60" r="30" stroke="#00FF88" strokeWidth="0.5" />
            <circle cx="60" cy="60" r="2" fill="#00FF88" />
          </svg>
        </div>
      </ParallaxLayer>

      {/* Near layer, fastest, most visible */}
      <ParallaxLayer speed={0.1} className="absolute inset-0">
        <div className="absolute top-[5%] right-[5%] font-mono text-[9px] tracking-[0.3em] uppercase text-green/25">
          · SC · TAKE 01
        </div>
        <div className="absolute bottom-[5%] left-[5%] font-mono text-[9px] tracking-[0.3em] uppercase text-green/25">
          · CAM 01 · REC
        </div>
      </ParallaxLayer>
    </div>
  );
}
