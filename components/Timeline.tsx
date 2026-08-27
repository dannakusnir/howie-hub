"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Milestone = {
  year: string;
  title: string;
  detail: string;
  tag: string;
};

const MILESTONES: Milestone[] = [
  {
    year: "2001",
    title: "HJZ Productions founded",
    detail:
      "Started crewing broadcast in New York. IATSE union crews from day one. Full-service TV production crewing, the one-stop shop.",
    tag: "Founder",
  },
  {
    year: "Early",
    title: "First NFL Network handheld credit",
    detail:
      "Handheld camera position on NFL Network. The first credit that made HJZ the crew of record for sports television. Sideline, tunnel, postgame.",
    tag: "Sports",
  },
  {
    year: "Multi-year",
    title: "WWE Backstage Camera Operator",
    detail:
      "Recurring WWE credit including backstage camera operating and stadium positions across WrestleMania. Ring shows are their own discipline.",
    tag: "Entertainment",
  },
  {
    year: "Recurring",
    title: "Sunday Night Football",
    detail:
      "Handheld camera on Sunday Night Football broadcasts. NBC Sports. The most-watched primetime show on American television.",
    tag: "Primetime",
  },
  {
    year: "Summer + Winter",
    title: "Olympic Games",
    detail:
      "Summer Games gymnastics and swimming coverage. Winter Games figure skating. Different disciplines, same operator behind the lens.",
    tag: "International",
  },
  {
    year: "Annual",
    title: "NYC Marathon + Triple Crown",
    detail:
      "New York City Marathon course cameras. Kentucky Derby, Preakness Stakes, Belmont Stakes. Recurring credits on events that only happen once a year.",
    tag: "Endurance",
  },
  {
    year: "Emmy",
    title: "Emmy Award",
    detail:
      "Emmy-winning handheld camera operator. The National Academy of Television Arts & Sciences said what the tape already showed.",
    tag: "Award",
  },
  {
    year: "2019",
    title: "Viridity Entertainment Services",
    detail:
      "Co-founded and serves as President. Livestream, hybrid, and corporate event production. T-Mobile, Capital One, Food Network on the client list from launch.",
    tag: "Co-Founder",
  },
  {
    year: "2021",
    title: "The hybrid pivot",
    detail:
      "Corporate keynotes, galas, fireside chats, all needed broadcast quality streams delivered anywhere. Viridity was ready. So was HJZ.",
    tag: "Business",
  },
  {
    year: "2024",
    title: "Athena · beta",
    detail:
      "AI operator ACTi Beings joined the workflow. Nine months later she was running most of it. Meetings, follow-through, prep, decision log.",
    tag: "AI",
  },
  {
    year: "2026",
    title: "Operator Mindset launches",
    detail:
      "The podcast. The hub. The Broadcast Sports Course. Twenty-five years, one point of view, ready to teach.",
    tag: "Now",
  },
];

export default function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-6xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            Timeline · 2001 → 2026
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
            greenWords={["one", "shot", "at", "a", "time."]}
            as="h2"
          >
            {"Twenty-five years, one shot at a time."}
          </KineticHeadline>
        </div>

        <div ref={ref} className="relative pl-8 md:pl-16">
          {/* Vertical rail */}
          <div className="absolute left-2 md:left-6 top-0 bottom-0 w-px bg-white/8" />
          <motion.div
            style={{ height: lineHeight }}
            className="absolute left-2 md:left-6 top-0 w-px bg-gradient-to-b from-green via-green to-green-electric"
          />

          <div className="space-y-14 md:space-y-20">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-10%" }}
                transition={{ duration: 0.6, delay: (i % 3) * 0.08 }}
                className="relative"
              >
                {/* Dot */}
                <div className="absolute left-[-32px] md:left-[-56px] top-1 flex items-center gap-3">
                  <span className="relative flex h-3.5 w-3.5">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-60 animate-ping" />
                    <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-green shadow-[0_0_15px_#00FF88]" />
                  </span>
                </div>

                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                  <div className="flex items-center gap-4">
                    <span className="font-black text-3xl md:text-5xl tracking-[-0.02em] text-green">
                      {m.year}
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-text-dim">
                      {m.tag}
                    </span>
                  </div>
                </div>

                <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3 leading-tight">
                  {m.title}
                </h3>
                <p className="text-text-dim leading-7 max-w-2xl">{m.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
