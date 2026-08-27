"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import AudioWaveform from "./AudioWaveform";

type Episode = {
  n: string;
  title: string;
  guest: string;
  role: string;
  date: string;
  tag: string;
};

const EPISODES: Episode[] = [
  {
    n: "10",
    title: "Faith, Family & Starting Again",
    guest: "Michael Holden · Jason Elliott",
    role: "Founders & fathers",
    date: "Jul 1, 2026",
    tag: "Life",
  },
  {
    n: "09",
    title: "AI, Cybersecurity & Why Business Owners Can't Afford to Wait",
    guest: "Michael Hornby",
    role: "CEO, Techmentum",
    date: "Jun 2, 2026",
    tag: "AI · Cybersecurity",
  },
  {
    n: "08",
    title: "The Founder Trap: Building Instead of Leading",
    guest: "Johanna",
    role: "Founder",
    date: "May 18, 2026",
    tag: "Leadership",
  },
  {
    n: "07",
    title: "Stop Waiting. Start Learning.",
    guest: "Wendy Van Besien",
    role: "Founder · Educator",
    date: "May 4, 2026",
    tag: "Growth",
  },
  {
    n: "06",
    title: "His Career Made No Sense… Until It Did",
    guest: "Chris Colton",
    role: "Operator · Founder",
    date: "Apr 20, 2026",
    tag: "Career",
  },
  {
    n: "05",
    title: "Standards, Selection & What It Really Costs to Say Yes",
    guest: "Daniel Ross",
    role: "Operator",
    date: "Apr 6, 2026",
    tag: "Discipline",
  },
  {
    n: "04",
    title: "Reinvention, Strength & Starting Again",
    guest: "Lori",
    role: "Founder",
    date: "Mar 23, 2026",
    tag: "Reinvention",
  },
  {
    n: "03",
    title: "The Founder Bottleneck Problem",
    guest: "Athena",
    role: "ACTi Agent · AI co-host",
    date: "Mar 9, 2026",
    tag: "AI · Athena",
  },
  {
    n: "02",
    title: "Where AI Meets Integrity in Live Production",
    guest: "Callie",
    role: "Live production leader",
    date: "Jan 13, 2026",
    tag: "AI · Broadcast",
  },
  {
    n: "01",
    title: "Unions & The Future of Live Sports Broadcasting",
    guest: "Charlie Cushing",
    role: "IATSE · Live sports",
    date: "Nov 10, 2025",
    tag: "Industry",
  },
];

export default function EpisodesPreview() {
  return (
    <section
      id="episodes"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
              · 10 episodes · Loaded
            </KineticKicker>
            <KineticHeadline
              className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] max-w-3xl"
              greenWords={["behind", "the", "work."]}
              as="h2"
            >
              {"The work behind the work."}
            </KineticHeadline>
          </div>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="max-w-md text-text-dim leading-7"
          >
            Real founders. Real operators. AI co-hosts. Ten episodes and
            counting, streaming across every major platform.
          </motion.p>
        </div>

        <div className="space-y-3">
          {EPISODES.map((ep, i) => (
            <motion.article
              key={ep.n}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 5) * 0.05 }}
              className="group bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6 transition-colors"
            >
              <div className="flex items-center gap-4 md:w-40 shrink-0">
                <div className="w-14 h-14 rounded-full bg-black border border-green/40 flex items-center justify-center group-hover:bg-green group-hover:border-green transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" className="text-green group-hover:text-black transition-colors ml-1">
                    <path d="M8 5v14l11-7z" fill="currentColor" />
                  </svg>
                </div>
                <div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-green">
                    EP · {ep.n}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-text-dim mt-1">
                    {ep.date}
                  </div>
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-lg md:text-xl font-black text-white leading-tight mb-1 group-hover:text-green transition-colors">
                  {ep.title}
                </div>
                <div className="text-sm text-text-dim">
                  <span className="text-white/70">{ep.guest}</span>
                  <span className="text-text-dim/60"> · {ep.role}</span>
                </div>
              </div>

              <div className="hidden md:block w-24 shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
                <AudioWaveform bars={20} height={20} />
              </div>

              <div className="text-right shrink-0">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-green">
                  {ep.tag}
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-8 text-center">
          <a
            href="https://open.spotify.com/show/4imu9gnYItLR4Tq1A0vjyY"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 font-mono text-[11px] tracking-[0.3em] uppercase text-white/70 hover:text-green transition-colors"
          >
            <span className="w-8 h-px bg-white/20" />
            See all episodes on Spotify
            <span>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
