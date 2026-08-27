"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const STEPS = [
  {
    n: "01",
    label: "Room Read",
    title: "We show up before the call.",
    detail:
      "Walk-through, sightlines, cable runs, PA feedback, coordination with the AD. Half the missed shots in this industry are missed before the first take.",
  },
  {
    n: "02",
    label: "Rehearsal",
    title: "We rehearse the play, not the shot.",
    detail:
      "The best operators do not memorize positions. They memorize the play. When the play changes on the fly, the operator who understands the choreography catches the shot the operator who memorized position misses.",
  },
  {
    n: "03",
    label: "Roll",
    title: "We stay ready between takes.",
    detail:
      "The camera is never off. The shot is never assumed. The operator is watching for the shot that was not on the schedule, that is the shot that ends up on the highlight reel.",
  },
  {
    n: "04",
    label: "Recovery",
    title: "When it breaks, we already know why.",
    detail:
      "Cable pull, comms drop, RF interference, blocked frame, every crew has seen every failure mode. Recovery is a system, not a scramble.",
  },
];

export default function HowWeWork() {
  return (
    <section
      id="how-we-work"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            · Methodology
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
            greenWords={["not", "the", "shot."]}
            as="h2"
          >
            {"We rehearse the play, not the shot."}
          </KineticHeadline>
        </div>

        <div className="relative">
          {/* Connecting rail */}
          <div className="hidden md:block absolute top-8 left-8 right-8 h-px bg-gradient-to-r from-green/40 via-green/20 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative group"
              >
                {/* Dot on rail */}
                <div className="hidden md:flex absolute top-6 left-4 items-center">
                  <span className="relative flex h-4 w-4">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-40 group-hover:opacity-70 animate-ping" />
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-black border-2 border-green" />
                  </span>
                </div>

                <div className="md:mt-16 bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-6 md:p-8 h-full transition-colors">
                  <div className="flex items-baseline gap-3 mb-4">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green">
                      {s.n}
                    </span>
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                      · {s.label}
                    </span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-white tracking-tight mb-4 leading-tight">
                    {s.title}
                  </h3>
                  <p className="text-sm text-text-dim leading-7">{s.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
