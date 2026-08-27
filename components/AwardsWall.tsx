"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Award = {
  code: string;
  title: string;
  detail: string;
  year: string;
  meta: string;
};

const AWARDS: Award[] = [
  {
    code: "01",
    title: "Emmy Award",
    detail:
      "Emmy Award-winning handheld camera operator. The one everyone asks about first.",
    year: "Recipient",
    meta: "National Academy of Television Arts & Sciences",
  },
  {
    code: "02",
    title: "Super Bowl · NFL Network",
    detail:
      "Handheld sideline camera on NFL Network Super Bowl coverage. Field-level for the biggest live broadcast on American television.",
    year: "NFL Network",
    meta: "Handheld sideline · sideline reporter · locker room",
  },
  {
    code: "03",
    title: "Olympic Games",
    detail:
      "Summer Games: gymnastics and swimming coverage. Winter Games: figure skating. Two disciplines, two continents, one operator.",
    year: "Summer + Winter",
    meta: "Global broadcast · multi-network distribution",
  },
  {
    code: "04",
    title: "WrestleMania · WWE",
    detail:
      "Backstage camera operating and ring positions across recurring WrestleMania credits. Stadium show. Ring show. Different disciplines, same operator.",
    year: "Recurring",
    meta: "WWE · Backstage + Ring cameras",
  },
];

export default function AwardsWall() {
  return (
    <section
      id="awards"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      {/* Diagonal light rays */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(115deg, transparent 0, transparent 40px, rgba(0,255,136,0.5) 40px, rgba(0,255,136,0.5) 41px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-14 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            · The Receipts
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95]"
            greenWords={["tape."]}
            as="h2"
          >
            {"Four credits on the tape."}
          </KineticHeadline>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AWARDS.map((a, i) => (
            <motion.article
              key={a.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="group relative bg-[#080808] border border-white/8 hover:border-green/60 rounded-2xl p-8 md:p-10 transition-colors overflow-hidden"
            >
              {/* Trophy glyph */}
              <svg
                className="absolute top-6 right-6 text-green/15 group-hover:text-green/30 transition-colors"
                width="72"
                height="72"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M7 21h10v-2H7v2zM12 17c-4.42 0-8-3.58-8-8V5h16v4c0 4.42-3.58 8-8 8zm-6-9V6h12v2c0 3.31-2.69 6-6 6s-6-2.69-6-6z" />
              </svg>

              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green">
                    {a.code}
                  </span>
                  <span className="h-px w-8 bg-green/40" />
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                    {a.year}
                  </span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white tracking-[-0.02em] mb-4 leading-tight">
                  {a.title}
                </h3>
                <p className="text-text-dim leading-7 mb-6 max-w-md">
                  {a.detail}
                </p>
                <div className="pt-4 border-t border-white/8 font-mono text-[10px] tracking-[0.25em] uppercase text-text-dim">
                  {a.meta}
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
