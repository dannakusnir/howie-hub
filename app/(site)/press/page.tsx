import type { Metadata } from "next";
import PageHero from "@/components/PageHero";
import PressLinks from "@/components/PressLinks";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata: Metadata = {
  title: "Press & Media Kit",
  description:
    "Press features, media kit, and quick-reference bio for Howie Zales. Emmy Award winning camera operator, founder of HJZ Productions and Viridity Entertainment, host of Operator Mindset podcast.",
};

const QUICK_FACTS = [
  { k: "Full name", v: "Howie Zales" },
  { k: "Location", v: "New York City" },
  { k: "Role", v: "Emmy Award-winning handheld camera operator · TV executive" },
  { k: "HJZ Productions", v: "Founder · 2001 · IATSE union crews" },
  { k: "Viridity Entertainment Services", v: "Co-founder · President · 2019" },
  { k: "Operator Mindset Podcast", v: "Host · Season 01 · 2026" },
  { k: "Key credits", v: "Super Bowl · Olympics · WrestleMania · Sunday Night Football · NYC Marathon" },
  { k: "Networks served", v: "NFL Network · NBC Sports · WWE · MLB · NBA · NHL · MLS · HBO · Showtime · Fox · Apple TV · CBC" },
  { k: "Business partners", v: "Athena (ACTi Beings)" },
  { k: "Speaking topics", v: "Broadcast operations · AI in business · Leadership · Operator mindset" },
  { k: "Phone", v: "917-453-2251" },
  { k: "Email", v: "info@hjzproductions.com" },
  { k: "Instagram", v: "@howiezales" },
  { k: "Instagram · Viridity", v: "@viridityentertainment" },
  { k: "LinkedIn · Howie Zales", v: "linkedin.com/in/howardzales" },
  { k: "LinkedIn · HJZ Productions", v: "linkedin.com/company/hjzproductions" },
  { k: "Facebook · HJZ", v: "facebook.com/hjzproductions" },
];

const BIO_SHORT =
  "Howie Zales is an Emmy Award-winning handheld camera operator and TV executive. He is founder of HJZ Productions (2001) and co-founder and president of Viridity Entertainment Services (2019). His crews cover the Super Bowl, Olympic Games, WrestleMania, Sunday Night Football, and the NYC Marathon for NFL Network, NBC Sports, WWE, MLB, NBA, NHL, HBO, Fox, CBC, and Apple TV. He hosts the Operator Mindset podcast. Based in New York.";

const BIO_LONG =
  "Howie Zales is an Emmy Award-winning handheld camera operator and television executive based in New York City. In 2001, he founded HJZ Productions to provide full-service IATSE union crews for the biggest live broadcasts in American television. HJZ has crewed for NFL Network, NBC Sports, WWE, MLB, NBA, NHL, MLS, HBO, Showtime, Fox, Apple TV, CBC, Sports Net, IMG, Dome Productions, and Gravity Media, with recurring credits on the Super Bowl, Sunday Night Football, WrestleMania, Notre Dame Football, NYC Marathon, Triple Crown horse races, and the Summer and Winter Olympic Games. In 2019, he co-founded Viridity Entertainment Services and serves as its President. Viridity delivers broadcast-quality livestream, hybrid, and corporate event production for clients including T-Mobile, Capital One, Food Network, GCI Health, Salt N Pepa, 160over90, and Temple Beth Sholom. In 2026 he launched Operator Mindset, a podcast where handheld camera operators, live sports producers, and founders talk about the work behind the work. He runs his day to day with the help of Athena, an AI operator built on ACTi Beings, who also co-hosts the show.";

const HEADSHOTS = [
  { name: "Portrait · Straight-on", file: "/howie-profile.png" },
  { name: "Editorial · Full", file: "/howie-front.png" },
  { name: "Location · On set", file: "/howie-new.png" },
];

export default function PressPage() {
  return (
    <>
      <ScrollProgress />
      <Header />
      <main className="relative">
        <PageHero
          scene="08"
          variant="press"
          kicker="08 · Press & Media"
          title={"Media kit. Quick reference."}
          greenWords={["reference."]}
          subtitle="Bios, quick facts, headshots, and links to featured interviews. Everything you need to write about Howie without emailing him first."
        />

        {/* Quick facts */}
        <section className="relative py-20 px-6 md:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-6">
              · Quick facts
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
              {QUICK_FACTS.map((f) => (
                <div
                  key={f.k}
                  className="flex items-baseline justify-between py-3 border-b border-white/5"
                >
                  <span className="font-mono text-[11px] tracking-[0.25em] uppercase text-text-dim">
                    {f.k}
                  </span>
                  <span className="text-sm text-white font-medium text-right">
                    {f.v}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bios */}
        <section className="relative py-20 px-6 md:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto space-y-14">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green">
                  · Bio · Short (75 words)
                </div>
                <button
                  className="font-mono text-[10px] tracking-[0.3em] uppercase text-white/50 hover:text-green transition-colors"
                  onClick={undefined}
                >
                  Select to copy →
                </button>
              </div>
              <div className="bg-[#080808] border border-white/8 rounded-2xl p-8 md:p-10">
                <p className="text-lg text-white/85 leading-8">{BIO_SHORT}</p>
              </div>
            </div>

            <div>
              <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-6">
                · Bio · Long (180 words)
              </div>
              <div className="bg-[#080808] border border-white/8 rounded-2xl p-8 md:p-10">
                <p className="text-lg text-white/85 leading-8">{BIO_LONG}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Headshots */}
        <section className="relative py-20 px-6 md:px-16 border-t border-white/5">
          <div className="max-w-5xl mx-auto">
            <div className="font-mono text-[10px] tracking-[0.4em] uppercase text-green mb-6">
              · Headshots · High resolution
            </div>
            <p className="text-sm text-text-dim mb-8 max-w-xl">
              Click to download. Approved for editorial use with credit
              &ldquo;Howie Zales / HJZ Productions.&rdquo;
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {HEADSHOTS.map((h) => (
                <a
                  key={h.name}
                  href={h.file}
                  download
                  className="group bg-[#080808] border border-white/8 hover:border-green/60 rounded-2xl overflow-hidden transition-colors"
                >
                  <div className="aspect-square bg-black relative overflow-hidden">
                    <img
                      src={h.file}
                      alt={h.name}
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between">
                      <span className="font-mono text-[10px] tracking-[0.25em] uppercase text-green">
                        Download →
                      </span>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim">
                      · Headshot
                    </div>
                    <div className="text-sm text-white font-medium mt-1">
                      {h.name}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Press links */}
        <PressLinks />
      </main>
      <Footer />
    </>
  );
}
