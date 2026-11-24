import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import BookHowieForm from "@/components/BookHowieForm";
import PodcastGuestForm from "@/components/PodcastGuestForm";
import ContactFAQ from "@/components/ContactFAQ";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Interviews, speaking, collaborations, and the right kind of trouble. Reach Howie Zales for HJZ Productions, Viridity Entertainment, or Operator Mindset.",
};

const CHANNELS = [
  {
    label: "General & Press",
    detail: "info@hjzproductions.com",
    href: "mailto:info@hjzproductions.com",
    kicker: "Email",
  },
  {
    label: "Call HJZ",
    detail: "917-453-2251",
    href: "tel:+19174532251",
    kicker: "Phone",
  },
  {
    label: "Podcast Guest",
    detail: "Pitch your story · form below",
    href: "#podcast-guest",
    kicker: "Get on the show",
  },
  {
    label: "Broadcast Crewing",
    detail: "hjzproductions.com",
    href: "https://www.hjzproductions.com/",
    kicker: "HJZ",
  },
  {
    label: "Livestream & Hybrid",
    detail: "viridityentertainment.com",
    href: "https://www.viridityentertainment.com/",
    kicker: "Viridity",
  },
  {
    label: "Instagram",
    detail: "@howiezales",
    href: "https://www.instagram.com/howiezales/",
    kicker: "Social",
  },
  {
    label: "LinkedIn · Howie",
    detail: "linkedin.com/in/howardzales",
    href: "https://www.linkedin.com/in/howardzales/",
    kicker: "Social",
  },
  {
    label: "LinkedIn · HJZ",
    detail: "linkedin.com/company/hjzproductions",
    href: "https://www.linkedin.com/company/hjzproductions/",
    kicker: "Business",
  },
  {
    label: "Instagram · Viridity",
    detail: "@viridityentertainment",
    href: "https://www.instagram.com/viridityentertainment/",
    kicker: "Ventures",
  },
];

export default function ContactPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="07"
          variant="contact"
          kicker="07 · Contact"
          title={"Come sit across the desk."}
          greenWords={["across", "the", "desk."]}
          subtitle="Interviews, speaking, collaborations, and the right kind of trouble. Pick a channel."
        />

        <section className="relative py-24 px-6 md:px-16">
          <div className="max-w-5xl mx-auto">
            {/* Response time strip */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/8">
              <div className="flex items-center gap-3">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-75 animate-ping" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
                </span>
                <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/80">
                  Response window · 48h press · 1 wk general
                </span>
              </div>
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                Channels · 06
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CHANNELS.map((c) => (
                <a
                  key={c.label}
                  href={c.href}
                  target={c.href.startsWith("#") || c.href.startsWith("mailto") ? undefined : "_blank"}
                  rel={c.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group bg-[#080808] border border-white/8 hover:border-green/60 rounded-2xl p-8 md:p-10 transition-colors duration-500"
                >
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green/70 mb-3">
                    {c.kicker}
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
                    {c.label}
                  </div>
                  <div className="text-sm text-text-dim">{c.detail}</div>
                  <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                    <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-white/70 group-hover:text-green transition-colors">
                      Open channel
                    </span>
                    <span className="font-mono text-sm text-green group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        <BookHowieForm />
        <ContactFAQ />
        <PodcastGuestForm />
      </main>
      <Footer />
    </>
  );
}
