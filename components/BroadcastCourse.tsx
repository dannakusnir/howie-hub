"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const MODULES = [
  { n: "01", title: "The Room Read", desc: "Camera positions, angles, sightlines" },
  { n: "02", title: "The Playbook", desc: "Shot calling, follow, lead, hold" },
  { n: "03", title: "The Handshake", desc: "Coordinating with directors and TDs" },
  { n: "04", title: "The Recovery", desc: "When the shot breaks, what next" },
];

/**
 * `ctaHref` is required on purpose. This section renders on more than one page,
 * and the guest application form only exists on some of them. A bare
 * "#podcast-guest" anchor is a silent dead click on any page without the form,
 * so every caller has to say where its CTA actually goes.
 */
type BroadcastCourseProps = {
  ctaHref: string;
};

export default function BroadcastCourse({ ctaHref }: BroadcastCourseProps) {
  return (
    <section
      id="course"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 80px, rgba(0,255,136,0.4) 80px, rgba(0,255,136,0.4) 81px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-5">
            <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
              Course · New for 2026
            </KineticKicker>
            <KineticHeadline
              className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
              greenWords={["sports", "course."]}
              as="h2"
            >
              {"Broadcast Sports Course."}
            </KineticHeadline>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-lg text-text-dim leading-8 max-w-md mb-8 space-y-4"
            >
              <p className="text-white font-semibold">
                25 years. The Super Bowl. WrestleMania. NFL and College Football.
                The Olympic Games.
              </p>
              <p>
                Distilled into a course built for the next generation of broadcast
                operators. Not theory. Not textbook. The real thing from someone
                who was there.
              </p>
            </motion.div>
            <motion.a
              href={ctaHref}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 border border-green/40 hover:bg-green hover:text-black text-green font-mono text-xs tracking-[0.25em] uppercase font-bold rounded-full px-6 py-3 transition-all"
            >
              Join Waitlist
              <span aria-hidden="true">→</span>
            </motion.a>
          </div>

          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {MODULES.map((m, i) => (
                <motion.div
                  key={m.n}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="group bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-6 md:p-8 transition-colors"
                >
                  <div className="flex items-start justify-between mb-6">
                    <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70">
                      Module {m.n}
                    </span>
                    <span className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-green transition-colors" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-2">
                    {m.title}
                  </h3>
                  <p className="text-sm text-text-dim leading-6">{m.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
