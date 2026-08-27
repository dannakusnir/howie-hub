"use client";

import { motion } from "framer-motion";

const LINKS = {
  ventures: [
    { name: "HJZ Productions", href: "https://www.hjzproductions.com/" },
    { name: "Viridity Entertainment Services", href: "https://www.viridityentertainment.com/" },
    { name: "Operator Mindset Podcast", href: "/podcast" },
  ],
  social: [
    { name: "Instagram · @howiezales", href: "https://www.instagram.com/howiezales/" },
    { name: "Instagram · Viridity", href: "https://www.instagram.com/viridityentertainment/" },
    { name: "LinkedIn · Howie Zales", href: "https://www.linkedin.com/in/howardzales/" },
    { name: "LinkedIn · HJZ Productions", href: "https://www.linkedin.com/company/hjzproductions/" },
    { name: "Facebook · HJZ", href: "https://www.facebook.com/hjzproductions/" },
    { name: "Vimeo · Viridity Reel", href: "https://vimeo.com/573185122" },
  ],
  work: [
    { name: "Get on the Show", href: "/contact" },
    { name: "Book Howie · Speaking", href: "/contact" },
    { name: "Cyber Webinar", href: "https://cyber-webinar.vercel.app" },
    { name: "Meet Athena", href: "/athena" },
    { name: "Press Kit · Bios · Headshots", href: "/press" },
    { name: "Field Notes Blog", href: "/blog" },
  ],
};

export default function Footer() {
  return (
    <footer
      id="contact"
      className="relative border-t border-white/8 pt-20 pb-10 px-6 md:px-16 bg-black"
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-4"
            >
              HZ · Operator Mindset
            </motion.p>
            <h3 className="text-4xl md:text-5xl font-black tracking-[-0.02em] mb-4 leading-tight">
              Howie Zales.
            </h3>
            <p className="text-text-dim leading-7 max-w-md">
              Emmy Award-winning handheld camera operator. Founder of HJZ
              Productions. Co-founder of Viridity Entertainment Services. Host
              of Operator Mindset. NYC. Available for interviews, speaking,
              broadcast crewing, and the right kind of trouble.
            </p>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim mb-5">
              Ventures
            </p>
            <ul className="space-y-3">
              {LINKS.ventures.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("#") ? undefined : "_blank"}
                    rel={l.href.startsWith("#") ? undefined : "noopener noreferrer"}
                    className="text-sm text-white/70 hover:text-green transition-colors"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim mb-5">
              Work
            </p>
            <ul className="space-y-3">
              {LINKS.work.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    target={l.href.startsWith("#") ? undefined : "_blank"}
                    rel={l.href.startsWith("#") ? undefined : "noopener noreferrer"}
                    className="text-sm text-white/70 hover:text-green transition-colors"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim mb-5">
              Follow
            </p>
            <ul className="space-y-3 mb-8">
              {LINKS.social.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-white/70 hover:text-green transition-colors inline-flex items-center gap-2 group"
                  >
                    {l.name}
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                      →
                    </span>
                  </a>
                </li>
              ))}
            </ul>
            <div className="space-y-2">
              <a
                href="mailto:info@hjzproductions.com"
                className="block font-mono text-xs tracking-wider text-green hover:text-white transition-colors"
              >
                info@hjzproductions.com
              </a>
              <a
                href="tel:+19174532251"
                className="block font-mono text-xs tracking-wider text-white/60 hover:text-green transition-colors"
              >
                917-453-2251
              </a>
            </div>
            <a
              href="mailto:howie@hjzproductions.com"
              className="hidden font-mono text-xs tracking-wider text-green hover:text-white transition-colors"
            >
              howie@hjzproductions.com
            </a>
          </div>
        </div>

        <div className="pt-8 border-t border-white/8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60">
              © {new Date().getFullYear()} EZ Ventures LLC · All rights reserved
            </span>
            <a
              href="/privacy"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60 hover:text-green transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60 hover:text-green transition-colors"
            >
              Terms
            </a>
          </div>
          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60">
              NYC · EST 2001
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/60 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 live-dot" />
              REC
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
