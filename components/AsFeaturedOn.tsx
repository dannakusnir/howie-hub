"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const FEATURED = [
  "Change Proof Podcast",
  "Bold Business Podcast",
  "Empire Podcast Show",
  "Mission Matters",
  "Leadership Purpose",
  "The Self Employed Life",
  "Business Innovators Radio",
  "Career Sessions",
  "Road To Growth",
  "The First",
  "Shark Bite Biz",
  "The Business Power Hour",
  "Behind The Mic",
  "Hooked On Startups",
  "Be Real Show",
  "Just Minding My Business",
];

export default function AsFeaturedOn() {
  return (
    <section id="featured" className="relative py-24 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
              08 · Featured On
            </KineticKicker>
            <KineticHeadline
              className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[0.95]"
              greenWords={["point", "of", "view."]}
              as="h2"
            >
              {"40+ shows. One point of view."}
            </KineticHeadline>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-md text-text-dim leading-7"
          >
            When founders, editors, and hosts want the operator perspective,
            Howie is the one they call.
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3"
        >
          {FEATURED.map((show, i) => (
            <motion.div
              key={show}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.03 }}
              className="group py-3 border-b border-white/5 hover:border-green/30 transition-colors"
            >
              <div className="font-mono text-[10px] tracking-[0.25em] text-green/60 uppercase mb-1">
                ↳ Guest
              </div>
              <div className="text-sm text-white/80 group-hover:text-white transition-colors font-medium">
                {show}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
