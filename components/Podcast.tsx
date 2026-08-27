"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

const SHOW_ID = "4imu9gnYItLR4Tq1A0vjyY";

const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SHOW_ID}`;

// Every URL here was checked against the live platform on 2026-08-27.
// Do not add a platform without opening the link first: the previous Apple,
// Spreaker and Deezer entries were all 404s, which left the embedded player as
// the only working way to subscribe.
const PLATFORMS = [
  { name: "Spotify", href: SPOTIFY_SHOW_URL },
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/operator-mindset-with-howie-zales/id1590690438",
  },
  { name: "Deezer", href: "https://www.deezer.com/show/3271662" },
];

export default function Podcast() {
  return (
    <section
      id="podcast"
      className="relative py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0, transparent 40px, rgba(0,255,136,0.3) 40px, rgba(0,255,136,0.3) 41px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        <div className="lg:col-span-5">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            03 · The Podcast
          </KineticKicker>

          <KineticHeadline
            className="text-5xl md:text-7xl font-black tracking-[-0.03em] leading-[0.9] mb-8"
            greenWords={["mindset"]}
            as="h2"
          >
            {"Operator Mindset."}
          </KineticHeadline>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-lg text-text-dim leading-[1.7] mb-10 max-w-lg space-y-4"
          >
            <p className="text-white font-semibold text-xl leading-snug">
              Most shows interview people. This one operates on them.
            </p>
            <p>
              Where founders, leaders, and builders think out loud about the
              decisions that actually matter. Not the highlight reel. The real
              game. The plays behind the plays.
            </p>
            <p>
              Every guest leaves with something they did not walk in with. A
              sharper question. A clearer frame. A decision that suddenly has an
              answer.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <button
              onClick={() =>
                document
                  .getElementById("podcast-guest")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-full px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow"
            >
              Get on the Show
            </button>
            <a
              href={SPOTIFY_SHOW_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-white/20 hover:border-green text-white hover:text-green font-medium text-sm tracking-wide uppercase rounded-full px-8 py-4 transition-colors"
            >
              Listen Latest →
            </a>
          </motion.div>
        </div>

        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative bg-[#0A0A0A] border border-green/20 rounded-2xl overflow-hidden group p-3"
          >
            <div className="absolute top-6 left-6 flex items-center gap-2 z-20 pointer-events-none">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              <span className="font-mono text-[10px] tracking-[0.25em] text-white/70 uppercase">
                On Air
              </span>
            </div>

            <iframe
              src={`https://open.spotify.com/embed/show/${SHOW_ID}?utm_source=generator&theme=0`}
              width="100%"
              height="480"
              frameBorder="0"
              allowFullScreen
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              className="rounded-xl block"
              title="Operator Mindset on Spotify"
            />
          </motion.div>

          {/* Platform badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3"
          >
            <span className="font-mono text-[10px] tracking-[0.3em] text-text-dim uppercase">
              Available on
            </span>
            {PLATFORMS.map((p) => (
              <a
                key={p.name}
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-xs tracking-wider text-white/60 hover:text-green transition-colors"
              >
                {p.name}
              </a>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
