"use client";

import { motion } from "framer-motion";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";

type Case = {
  code: string;
  client: string;
  project: string;
  detail: string;
  metrics: { value: string; label: string }[];
  brand: "hjz" | "viridity";
  tag: string;
};

const CASES: Case[] = [
  {
    code: "01",
    client: "Super Bowl · NFL Network",
    project: "Handheld camera operator for NFL Network Super Bowl coverage.",
    detail:
      "NFL Network handheld sideline, sideline reporter follow, and locker room celebration. The Super Bowl is the shot every crew practices for and Howie has been on the field for it.",
    metrics: [
      { value: "NFL Net", label: "Network" },
      { value: "Handheld", label: "Position" },
      { value: "Live", label: "Broadcast" },
    ],
    brand: "hjz",
    tag: "Live Sports",
  },
  {
    code: "02",
    client: "WWE · WrestleMania",
    project: "Backstage and ring camera positions across WrestleMania.",
    detail:
      "Recurring WWE credit including WrestleMania. Backstage camera operating, ring positions, and stadium hard cameras. WWE is a stadium show that changes on the fly. The camera has to change with it.",
    metrics: [
      { value: "WWE", label: "Client" },
      { value: "Backstage", label: "Specialty" },
      { value: "Multi-year", label: "Recurring" },
    ],
    brand: "hjz",
    tag: "Entertainment",
  },
  {
    code: "03",
    client: "Olympic Games · Summer + Winter",
    project: "Broadcast camera crew across Summer and Winter Olympics.",
    detail:
      "Gymnastics and swimming at Summer Games. Figure skating at Winter Games. Crewed for major networks broadcasting to global audiences. Every event is a different discipline. Each takes its own kind of operator.",
    metrics: [
      { value: "Gymnastics", label: "Summer" },
      { value: "Skating", label: "Winter" },
      { value: "Global", label: "Distribution" },
    ],
    brand: "hjz",
    tag: "International",
  },
  {
    code: "04",
    client: "Sunday Night Football · NBC Sports",
    project: "Handheld camera position for Sunday Night Football broadcasts.",
    detail:
      "The most-watched primetime show on American television. Handheld camera on the sideline, in the tunnel, and in the postgame. Twelve million viewers deciding the shot the operator caught.",
    metrics: [
      { value: "NBC", label: "Sports" },
      { value: "Primetime", label: "Slot" },
      { value: "12M+", label: "Viewers" },
    ],
    brand: "hjz",
    tag: "Primetime",
  },
  {
    code: "05",
    client: "NYC Marathon + Triple Crown",
    project: "Recurring credit on marathon and horse racing coverage.",
    detail:
      "New York City Marathon course cameras. Triple Crown horse races: Kentucky Derby, Preakness Stakes, Belmont Stakes. Two hundred camera positions across events that only happen once a year.",
    metrics: [
      { value: "NYC", label: "Marathon" },
      { value: "3", label: "Race series" },
      { value: "Annual", label: "Cadence" },
    ],
    brand: "hjz",
    tag: "Endurance",
  },
  {
    code: "06",
    client: "Notre Dame Football",
    project: "Multi-season college football broadcast credit.",
    detail:
      "Notre Dame home game broadcasts. Sideline handheld, endzone hard camera, tunnel entrance. The oldest broadcast tradition in college sports. Reverence and craft in equal parts.",
    metrics: [
      { value: "College", label: "Football" },
      { value: "Multi-season", label: "Recurring" },
      { value: "Sideline", label: "Position" },
    ],
    brand: "hjz",
    tag: "College Sports",
  },
  {
    code: "07",
    client: "T-Mobile · Un-carrier Keynote",
    project: "Multi-camera livestream for T-Mobile corporate keynote.",
    detail:
      "Viridity delivered broadcast-quality livestream for T-Mobile. Multi-cam switching, IMAG feed, corporate branding. The keynote that defines their year.",
    metrics: [
      { value: "T-Mobile", label: "Brand" },
      { value: "Multi-cam", label: "Setup" },
      { value: "Live", label: "Broadcast" },
    ],
    brand: "viridity",
    tag: "Corporate",
  },
  {
    code: "08",
    client: "Capital One + Food Network + GCI Health",
    project: "Recurring livestream and hybrid production for enterprise clients.",
    detail:
      "Capital One executive fireside chats. Food Network experiential broadcasts. GCI Health pharma launches. Different industries, one broadcast standard. Viridity's core service.",
    metrics: [
      { value: "3", label: "Verticals" },
      { value: "Recurring", label: "Cadence" },
      { value: "Broadcast", label: "Quality" },
    ],
    brand: "viridity",
    tag: "Enterprise",
  },
  {
    code: "09",
    client: "Salt N Pepa + 160over90 + Temple Beth Sholom",
    project: "Entertainment, agency, and event livestream production.",
    detail:
      "Salt N Pepa livestream (yes, that Salt N Pepa). 160over90 agency campaign shoots. Temple Beth Sholom high holiday services broadcast to homebound congregants. Viridity does the whole range.",
    metrics: [
      { value: "Music", label: "Entertainment" },
      { value: "Agency", label: "Brand work" },
      { value: "Community", label: "Broadcast" },
    ],
    brand: "viridity",
    tag: "Range",
  },
];

export default function CaseStudies() {
  return (
    <section
      id="case-studies"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5"
    >
      <div className="max-w-7xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            Case Studies · Selected
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
            greenWords={["work."]}
            as="h2"
          >
            {"What the tape shows. Selected work."}
          </KineticHeadline>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CASES.map((c, i) => (
            <motion.article
              key={c.code}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 2) * 0.08 }}
              className="group bg-[#080808] border border-white/8 hover:border-green/40 rounded-2xl p-8 md:p-10 flex flex-col transition-colors duration-500"
            >
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-green mb-2">
                    {c.code} · {c.brand === "hjz" ? "HJZ" : "Viridity"}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-text-dim">
                    {c.tag}
                  </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-white/20 group-hover:bg-green group-hover:shadow-[0_0_10px_#00FF88] transition-all" />
              </div>

              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight mb-3 leading-tight">
                {c.client}
              </h3>
              <p className="text-sm text-white/70 mb-4 leading-6 font-medium">
                {c.project}
              </p>
              <p className="text-sm text-text-dim leading-7 mb-8 flex-1">
                {c.detail}
              </p>

              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-white/5">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <div className="text-lg font-black text-green tracking-tight">
                      {m.value}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-text-dim mt-1">
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
