"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type PressItem = {
  outlet: string;
  headline: string;
  quote?: string;
  /**
   * Omit when we cannot point at a real, verified appearance. A card with no
   * href renders as plain text instead of a link. Never fill this with a
   * plausible-looking show URL: every one of these was previously a fabricated
   * Apple ID that 404'd.
   */
  href?: string;
  date?: string;
  kind: "podcast" | "article" | "video";
};

// Every href below was resolved against Apple's lookup API and then opened on
// 2026-08-27. Episode-level deep links are used wherever the episode could be
// located in the show's feed; otherwise the verified show root.
//
// Bold Business Podcast and Empire Podcast Show were removed on 2026-08-27:
// no Howie Zales episode exists in either matching feed, and both previously
// pointed at fabricated Apple IDs that 404'd. Restore them only with a real
// episode URL. `href` stays optional so a confirmed-but-unlinkable appearance
// can render as a text card instead of tempting a made-up link.
const PRESS: PressItem[] = [
  {
    outlet: "Change Proof Podcast",
    headline: "Pivotal Learning, Resilience, and Marriage with Howie Zales",
    quote:
      "Twenty-five years of watching Emmy winners fail and rookies win taught me one thing.",
    href: "https://podcasts.apple.com/us/podcast/pivotal-learning-resilience-and-marriage-with-howie-zales/id1183137234?i=1000661915750",
    kind: "podcast",
  },
  {
    outlet: "Mission Matters",
    headline: "The Broadcast Behind the Broadcast",
    quote:
      "Best operators are the ones who see the whole game.",
    href: "https://podcasts.apple.com/us/podcast/mission-matters-business-podcast-with-adam-torres/id1498253396",
    kind: "podcast",
  },
  {
    outlet: "The Self Employed Life",
    headline: "Operating multiple businesses with the operator mindset",
    href: "https://podcasts.apple.com/us/podcast/the-self-employed-life/id891146236",
    kind: "podcast",
  },
  {
    outlet: "Business Innovators Radio",
    headline: "Broadcast crewing and the new economy",
    href: "https://businessinnovatorsradio.com/",
    kind: "podcast",
  },
  {
    outlet: "Career Sessions",
    headline: "From Sports Cameraman to Production Company CEO",
    href: "https://podcasts.apple.com/us/podcast/from-sports-cameraman-to-production-company-ceo-with/id1609669307?i=1000613918363",
    kind: "podcast",
  },
  {
    outlet: "Road To Growth",
    headline: "Howie Zales, Founder of HJZ Productions",
    href: "https://podcasts.apple.com/us/podcast/howie-zales-founder-of-hjz-productions/id1449086324?i=1000583958637",
    kind: "podcast",
  },
];

export default function PressLinks() {
  return (
    <section
      id="press"
      className="relative py-24 px-6 md:px-16 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-14">
          <div>
            <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
              Press · Featured
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
            Howie is the one they call. A curated set below with links.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESS.map((item, i) => {
            const linked = Boolean(item.href);
            const Card = linked ? motion.a : motion.div;
            const linkProps = linked
              ? {
                  href: item.href,
                  target: "_blank",
                  rel: "noopener noreferrer",
                }
              : {};

            return (
              <Card
                key={item.outlet}
                {...linkProps}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                className={`group bg-[#080808] border border-white/8 rounded-2xl p-6 md:p-8 transition-colors block ${
                  linked ? "hover:border-green/60" : ""
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70">
                    {item.kind === "podcast"
                      ? "· Podcast"
                      : item.kind === "video"
                      ? "· Video"
                      : "· Article"}
                  </div>
                  {linked && (
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-text-dim opacity-0 group-hover:opacity-100 transition-opacity">
                      Open →
                    </span>
                  )}
                </div>
                <div className="text-base font-black text-white mb-1 leading-snug">
                  {item.outlet}
                </div>
                <div className="text-sm text-text-dim leading-6 mb-4">
                  {item.headline}
                </div>
                {item.quote && (
                  <div className="pt-4 border-t border-white/5">
                    <div className="text-sm text-white/70 italic leading-6">
                      &ldquo;{item.quote}&rdquo;
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
