"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import AnimatedNumber from "./AnimatedNumber";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

export default function Vision() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "-15%"]);

  return (
    <section
      id="vision"
      ref={ref}
      className="relative min-h-[90vh] flex items-center px-6 md:px-16 py-32 overflow-hidden border-t border-white/5"
    >
      <motion.div
        style={{ y }}
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.08)_0%,transparent_70%)] pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
        <div className="lg:col-span-4">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            01 · The Vision
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-5xl lg:text-6xl font-black tracking-[-0.03em] leading-[0.95]"
            greenWords={["before"]}
            as="h2"
          >
            {"See the shot before the shot happens."}
          </KineticHeadline>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg md:text-xl text-text-dim leading-[1.7] max-w-2xl"
          >
            Twenty-five years behind the camera at the Super Bowl, the Olympics,
            and WrestleMania taught Howie one thing: the best operators are not
            the ones behind the lens. They are the ones who see the whole game.
          </motion.p>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-lg md:text-xl text-text-dim leading-[1.7] max-w-2xl"
          >
            He built <span className="text-white font-medium">HJZ Productions</span>{" "}
            in 2001 to bring the same instinct to broadcast crewing.
            He built <span className="text-white font-medium">Viridity Entertainment</span>{" "}
            in 2019 to bring it to livestream and hybrid events. Now he brings
            it to founders, operators, and the audiences who want to think
            like they do.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="pt-8 grid grid-cols-3 gap-6 md:gap-10 max-w-lg border-t border-white/5"
          >
            {[
              { v: 25, s: "+", l: "Years on set" },
              { v: 40, s: "+", l: "Podcast features" },
              { v: 3, s: "", l: "Businesses built" },
            ].map((stat) => (
              <div key={stat.l}>
                <div className="text-3xl md:text-4xl font-black text-green tracking-tight">
                  <AnimatedNumber value={stat.v} suffix={stat.s} />
                </div>
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-text-dim mt-2">
                  {stat.l}
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
