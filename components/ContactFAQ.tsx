"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const FAQ = [
  {
    q: "How fast will Howie get back to me?",
    a: "General inquiries get a reply within one business week. Time-sensitive press or booking requests are answered inside 48 hours if you flag them as such in the pitch. For crewing-urgent needs, call HJZ directly at 917-453-2251.",
  },
  {
    q: "Can I book Howie for a keynote outside of New York?",
    a: "Yes. He speaks nationally on operator mindset, AI in business, broadcast innovation, and leadership. For the right event, internationally. Travel is factored into the booking. Keynotes, fireside chats, and panels all available.",
  },
  {
    q: "What is the process to get on Operator Mindset as a guest?",
    a: "Submit the guest form with your pitch. The team reviews weekly. If it is a fit, you get a scheduling email within two weeks. If it is not a fit, you get an honest note back, not silence.",
  },
  {
    q: "Do you handle broadcast crewing for one-off events?",
    a: (
      <>
        Yes. HJZ Productions handles both recurring and one-off broadcast
        crewing, IATSE union crews for TV production, ENG shoots, and studio
        work. Reach{" "}
        <a href="https://www.hjzproductions.com/" target="_blank" rel="noopener noreferrer" className="text-green hover:underline">
          hjzproductions.com
        </a>{" "}
        or call 917-453-2251 for HJZ. For livestream and hybrid,{" "}
        <a href="https://www.viridityentertainment.com/" target="_blank" rel="noopener noreferrer" className="text-green hover:underline">
          viridityentertainment.com
        </a>
        .
      </>
    ),
  },
  {
    q: "Does Athena reply to emails on Howie's behalf?",
    a: "Yes, sometimes. If a reply comes signed by Howie, it is either from Howie directly or from Howie after Athena drafted it and he approved the send. She never sends unapproved.",
  },
  {
    q: "Is there a media kit I can download?",
    a: (
      <>
        Yes. The full press kit, bio, quick facts, and headshots, is at{" "}
        <a href="/press" className="text-green hover:underline">
          /press
        </a>
        . Download what you need.
      </>
    ),
  },
];

export default function ContactFAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5"
    >
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            · Questions we get
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95]"
            greenWords={["answered."]}
            as="h2"
          >
            {"The most asked. Answered."}
          </KineticHeadline>
        </div>

        <div className="space-y-3">
          {FAQ.map((item, i) => {
            const isOpen = open === i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.04 }}
                className="bg-[#080808] border border-white/8 hover:border-green/30 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="w-full flex items-start justify-between gap-6 text-left px-6 md:px-8 py-6"
                >
                  <div>
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70 mb-2">
                      Q · {String(i + 1).padStart(2, "0")}
                    </div>
                    <div className="text-lg font-black text-white tracking-tight leading-snug">
                      {item.q}
                    </div>
                  </div>
                  <span
                    className={`text-2xl text-green shrink-0 transition-transform ${
                      isOpen ? "rotate-45" : "rotate-0"
                    }`}
                  >
                    +
                  </span>
                </button>
                <motion.div
                  initial={false}
                  animate={
                    isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
                  }
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 md:px-8 pb-6 pt-2 text-text-dim leading-7 border-t border-white/5">
                    {item.a}
                  </div>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
