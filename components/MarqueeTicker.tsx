"use client";

import { motion } from "framer-motion";

type Item = { label: string; kind?: "network" | "credit" | "brand" };

const DEFAULT_ITEMS: Item[] = [
  { label: "NFL Network", kind: "network" },
  { label: "NBC Sports", kind: "network" },
  { label: "Sunday Night Football", kind: "credit" },
  { label: "WWE", kind: "network" },
  { label: "MLB", kind: "network" },
  { label: "NBA", kind: "network" },
  { label: "NHL", kind: "network" },
  { label: "MLS", kind: "network" },
  { label: "HBO", kind: "network" },
  { label: "Showtime", kind: "network" },
  { label: "Fox", kind: "network" },
  { label: "CBC", kind: "network" },
  { label: "Apple TV", kind: "network" },
  { label: "IMG", kind: "brand" },
  { label: "Dome Productions", kind: "brand" },
  { label: "Gravity Media", kind: "brand" },
  { label: "Sports Net", kind: "network" },
  { label: "Notre Dame Football", kind: "credit" },
  { label: "NYC Marathon", kind: "credit" },
  { label: "Triple Crown Horse Races", kind: "credit" },
  { label: "T-Mobile", kind: "brand" },
  { label: "Capital One", kind: "brand" },
  { label: "Food Network", kind: "network" },
  { label: "GCI Health", kind: "brand" },
  { label: "160over90", kind: "brand" },
  { label: "Salt N Pepa", kind: "credit" },
];

export default function MarqueeTicker({
  items = DEFAULT_ITEMS,
  speed = 40,
  direction = "left",
}: {
  items?: Item[];
  speed?: number;
  direction?: "left" | "right";
}) {
  const loop = [...items, ...items, ...items];
  const duration = (items.length * 4000) / speed;

  return (
    <div className="relative overflow-hidden py-6 border-y border-white/8 bg-[#050505]">
      <div className="absolute inset-y-0 left-0 w-24 md:w-40 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-24 md:w-40 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

      <motion.div
        className="flex gap-12 md:gap-16 whitespace-nowrap"
        animate={{
          x: direction === "left" ? ["0%", "-33.333%"] : ["-33.333%", "0%"],
        }}
        transition={{
          duration,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {loop.map((item, i) => (
          <span
            key={`${item.label}-${i}`}
            className="inline-flex items-center gap-3 shrink-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green/60" />
            <span className="font-mono text-sm md:text-base tracking-[0.15em] uppercase text-white/70 hover:text-green transition-colors">
              {item.label}
            </span>
            {item.kind && (
              <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-text-dim/60">
                {item.kind === "network"
                  ? "· LIVE"
                  : item.kind === "credit"
                  ? "· CREDIT"
                  : "· BRAND"}
              </span>
            )}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
