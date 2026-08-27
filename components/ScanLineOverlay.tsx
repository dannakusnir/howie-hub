"use client";

import { motion } from "framer-motion";

/**
 * Broadcast scan line + film grain overlay for hero images/frames.
 * Absolutely positioned inside a relative container.
 */
export default function ScanLineOverlay({
  intensity = 0.4,
  className = "",
}: {
  intensity?: number;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 pointer-events-none overflow-hidden ${className}`}
      style={{ opacity: intensity }}
    >
      {/* Horizontal scan lines */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 3px, rgba(0,255,136,0.06) 3px, rgba(0,255,136,0.06) 4px)",
        }}
      />
      {/* Rolling scan bar */}
      <motion.div
        className="absolute inset-x-0 h-40 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, transparent 0%, rgba(0,255,136,0.08) 45%, rgba(0,255,136,0.15) 50%, rgba(0,255,136,0.08) 55%, transparent 100%)",
        }}
        animate={{ top: ["-20%", "120%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />
    </div>
  );
}
