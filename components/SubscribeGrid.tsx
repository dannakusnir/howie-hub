"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Platform = {
  name: string;
  href: string;
  icon: React.ReactNode;
  color: string;
  handle: string;
};

// Checked live on 2026-08-27. /rss.xml was a 404 on production; this is the
// feed Apple actually lists for the show. Open any URL before adding it here.
const PLATFORMS: Platform[] = [
  {
    name: "Apple Podcasts",
    href: "https://podcasts.apple.com/us/podcast/operator-mindset-with-howie-zales/id1590690438",
    handle: "Full feed \u00b7 47 episodes",
    color: "#A855F7",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm2.85 15.53c-.11.34-.3.66-.55.94-.4.44-.87.7-1.4.79-.28.05-.53.05-.79.05-.52-.01-1.02-.15-1.47-.42-.42-.26-.75-.61-.97-1.06-.14-.28-.22-.58-.24-.9-.02-.32.02-.63.13-.93.11-.3.28-.56.5-.78.22-.22.48-.4.78-.51.3-.11.62-.16.94-.13.28.02.55.09.8.21.4.19.72.48.94.84.15.24.24.5.28.78.03.28.02.56-.05.83z" />
      </svg>
    ),
  },
  {
    name: "Spotify",
    href: "https://open.spotify.com/show/4imu9gnYItLR4Tq1A0vjyY",
    handle: "Full feed · new episodes",
    color: "#1DB954",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.5 14.4c-.19.31-.59.41-.9.22-2.46-1.5-5.55-1.84-9.19-1-.36.08-.71-.14-.79-.5-.08-.36.14-.71.5-.79 4-.91 7.43-.52 10.19 1.17.31.19.4.6.19.9zm1.19-2.65c-.24.38-.74.5-1.12.26-2.81-1.72-7.09-2.22-10.42-1.21-.42.13-.86-.11-.99-.53-.13-.42.11-.86.53-.99 3.79-1.15 8.51-.6 11.75 1.35.38.24.5.74.26 1.12zm.1-2.76c-3.37-2-8.94-2.19-12.16-1.21-.5.15-1.03-.13-1.19-.63-.15-.5.13-1.03.63-1.19 3.71-1.13 9.86-.91 13.74 1.39.45.27.6.86.32 1.31-.27.45-.85.6-1.31.32z" />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@OperatorMindset",
    handle: "@OperatorMindset",
    color: "#FF0000",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.5 6.19c-.28-1.02-1.08-1.82-2.1-2.1C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.4.59c-1.02.28-1.82 1.08-2.1 2.1C0 8.06 0 12 0 12s0 3.94.5 5.81c.28 1.02 1.08 1.82 2.1 2.1C4.47 20.5 12 20.5 12 20.5s7.53 0 9.4-.59c1.02-.28 1.82-1.08 2.1-2.1.5-1.87.5-5.81.5-5.81s0-3.94-.5-5.81zM9.5 15.5V8.5l6 3.5-6 3.5z" />
      </svg>
    ),
  },
  {
    name: "RSS Feed",
    href: "https://anchor.fm/s/10dcf5554/podcast/rss",
    handle: "Direct feed",
    color: "#F97316",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <path d="M6.18 15.64a2.18 2.18 0 012.18 2.18C8.36 19 7.38 20 6.18 20A2.18 2.18 0 014 17.82a2.18 2.18 0 012.18-2.18M4 4.44A15.56 15.56 0 0119.56 20h-2.83A12.73 12.73 0 004 7.27V4.44m0 5.66a9.9 9.9 0 019.9 9.9h-2.83A7.07 7.07 0 004 12.93V10.1z" />
      </svg>
    ),
  },
  {
    name: "Podcast Addict",
    href: "https://podcastaddict.com/podcast/operator-mindset-with-howie-zales/6693646",
    handle: "Full feed",
    color: "#FF7500",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 6l3 6-3 6-3-6z" />
      </svg>
    ),
  },
  {
    name: "Podchaser",
    href: "https://www.podchaser.com/podcasts/operator-mindset-with-howie-za-3558921",
    handle: "Full show page",
    color: "#F43F5E",
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 4" strokeLinecap="round" />
      </svg>
    ),
  },
];

export default function SubscribeGrid() {
  return (
    <section
      id="subscribe"
      className="relative py-24 px-6 md:px-16 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-14 max-w-3xl mx-auto">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            · Subscribe · Six channels
          </KineticKicker>
          <KineticHeadline
            className="text-3xl md:text-5xl font-black tracking-[-0.03em] leading-[0.95]"
            greenWords={["want."]}
            as="h2"
          >
            {"Pick the app you already use. We are already there."}
          </KineticHeadline>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {PLATFORMS.map((p, i) => (
            <motion.a
              key={p.name}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group relative bg-[#080808] border border-white/8 hover:border-white/30 rounded-2xl p-6 md:p-8 transition-colors overflow-hidden"
            >
              {/* Brand color sweep on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                style={{ backgroundColor: p.color }}
              />
              <div className="relative flex items-center gap-4">
                <div
                  className="text-white/60 group-hover:text-white transition-colors"
                  style={{ color: undefined }}
                >
                  <span
                    className="block"
                    style={{
                      color: "currentColor",
                    }}
                  >
                    <span
                      className="group-hover:text-[var(--brand)]"
                      style={{
                        ["--brand" as string]: p.color,
                      }}
                    >
                      {p.icon}
                    </span>
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-base font-black text-white group-hover:text-white transition-colors">
                    {p.name}
                  </div>
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-text-dim mt-1 truncate">
                    {p.handle}
                  </div>
                </div>
                <div className="text-green opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
