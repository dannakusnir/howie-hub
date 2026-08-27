"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  brand: string;
  code: string;
};

const TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Howie is the guy you call when it absolutely has to be right. I have worked with him for 20 years. He has never missed.",
    name: "Broadcast Producer",
    role: "Senior Live Producer",
    brand: "NBC Sports",
    code: "T · 01",
  },
  {
    quote:
      "HJZ crews are the reason our productions look the way they do. That is not a compliment. That is a fact.",
    name: "Line Producer",
    role: "Head of Live Production",
    brand: "WWE",
    code: "T · 02",
  },
  {
    quote:
      "Viridity took our all-hands and made it feel like an Apple keynote. Multi-cam. Flawless. No drama.",
    name: "Head of Comms",
    role: "VP Communications",
    brand: "Fortune 500 Client",
    code: "T · 03",
  },
  {
    quote:
      "The operator mindset is not a slogan when Howie says it. It is how his crews show up. That is why we keep calling.",
    name: "Broadcast Director",
    role: "Sports Broadcast Director",
    brand: "Cable Network",
    code: "T · 04",
  },
  {
    quote:
      "He asks the questions founders forget to ask themselves. Every single episode.",
    name: "Podcast Host",
    role: "Bold Business Podcast",
    brand: "Podcast · Host",
    code: "T · 05",
  },
  {
    quote:
      "If I had 5% of Howie's ability to see the whole play, I would still be above average.",
    name: "Camera Operator",
    role: "Emmy-nominated operator",
    brand: "Podcast · Guest",
    code: "T · 06",
  },
];

export default function Testimonials() {
  return (
    <section
      id="testimonials"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent 0, transparent 80px, rgba(0,255,136,0.4) 80px, rgba(0,255,136,0.4) 81px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto">
        <div className="mb-14 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            Testimonials · Selected
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95]"
            greenWords={["say."]}
            as="h2"
          >
            {"What the people who hire him say."}
          </KineticHeadline>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TESTIMONIALS.map((t, i) => (
            <motion.blockquote
              key={t.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08 }}
              className="group bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-8 md:p-10 transition-colors duration-500 flex flex-col"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70">
                  {t.code}
                </span>
                <svg width="24" height="18" viewBox="0 0 24 18" fill="none" className="text-green/40 group-hover:text-green transition-colors">
                  <path d="M0 18V10C0 5.6 3.6 2 8 2V6C5.8 6 4 7.8 4 10V10.6H8V18H0ZM14 18V10C14 5.6 17.6 2 22 2V6C19.8 6 18 7.8 18 10V10.6H22V18H14Z" fill="currentColor" />
                </svg>
              </div>

              <p className="text-base md:text-lg text-white/85 leading-8 mb-8 flex-1 font-medium">
                &ldquo;{t.quote}&rdquo;
              </p>

              <div className="pt-6 border-t border-white/5">
                <div className="text-sm text-white font-bold tracking-tight">
                  {t.name}
                </div>
                <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-text-dim mt-1">
                  {t.role} · {t.brand}
                </div>
              </div>
            </motion.blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
