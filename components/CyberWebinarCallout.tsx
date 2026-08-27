"use client";

import { motion } from "framer-motion";
import AudioWaveform from "./AudioWaveform";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

export default function CyberWebinarCallout() {
  return (
    <section id="cyber" className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden">
      {/* Ambient orbital glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-[radial-gradient(ellipse,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto">
        <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-4">
          Feature · Presenting Live
        </KineticKicker>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <KineticHeadline
              className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
              greenWords={["voided."]}
              as="h2"
            >
              {"Covered, Not Voided."}
            </KineticHeadline>
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-lg text-text-dim leading-8 max-w-xl mb-8"
            >
              Howie co-hosts a live webinar with{" "}
              <span className="text-white">Michael Hornby, CEO of Techmentum</span>{" "}
              on the five mistakes that void your cyber insurance policy.
              Real cases. Local NY/NJ examples. Actionable checklist.
            </motion.p>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mb-8">
              {[
                { n: "41", l: "Slides" },
                { n: "10", l: "Real cases" },
                { n: "5", l: "V.O.I.D.S. rules" },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-3xl font-black text-green tracking-tight">
                    {s.n}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-text-dim mt-1">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <a
                href="https://cyber-webinar.vercel.app"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 bg-green text-black font-bold text-sm tracking-wide uppercase rounded-full px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow"
              >
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
                Watch the Webinar
              </a>
              <a
                href="https://outlook.office365.com/owa/calendar/FreeConsultationwithMichaelHornby@techmentumit.com/bookings/"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-white/20 hover:border-green text-white hover:text-green font-medium text-sm tracking-wide uppercase rounded-full px-8 py-4 transition-colors"
              >
                Book with Michael →
              </a>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative aspect-[4/5] bg-[#080808] border border-green/25 rounded-2xl overflow-hidden p-8 md:p-10 flex flex-col">
              {/* HUD corners */}
              <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-green rounded-tl-md" />
              <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-green rounded-tr-md" />
              <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-green rounded-bl-md" />
              <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-green rounded-br-md" />

              <div className="flex items-center justify-between mb-8">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/80">
                  · Broadcast
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                  EP · 001
                </span>
              </div>

              <div className="flex-1 flex flex-col justify-center">
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim mb-3">
                  Co-hosted with
                </div>
                <div className="text-2xl md:text-3xl font-black text-white mb-1">
                  Techmentum
                </div>
                <div className="text-sm text-text-dim mb-8">
                  IT & Cybersecurity · NY/NJ
                </div>

                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim mb-3">
                  V.O.I.D.S. framework
                </div>
                <ul className="space-y-2 text-sm text-white/80">
                  <li>· View insurance as a security plan</li>
                  <li>· Overlook patches and updates</li>
                  <li>· Ignore access control</li>
                  <li>· Delay incident reporting</li>
                  <li>· Skip the fine print</li>
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-white/8">
                <AudioWaveform bars={32} height={30} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
