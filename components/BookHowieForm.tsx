"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import ConsentCheckbox from "./ConsentCheckbox";

type Intent = "podcast" | "speaking" | "interview";

const INTENTS: { id: Intent; label: string; kicker: string; desc: string }[] = [
  {
    id: "podcast",
    label: "Host Howie on your podcast",
    kicker: "As Guest",
    desc: "You run a show. You want Howie across the desk from you. Broadcast, business, AI, operations, twenty-five years of on set stories.",
  },
  {
    id: "speaking",
    label: "Book Howie to speak",
    kicker: "Speaking",
    desc: "Keynote, panel, fireside chat, industry event. Topics: operator mindset, AI in business, broadcast innovation, leadership. For founders, media companies, IATSE conferences, tech gatherings.",
  },
  {
    id: "interview",
    label: "Press or interview request",
    kicker: "Press",
    desc: "Article, quote, interview, documentary appearance. Reach out with the outlet, the angle, and the deadline.",
  },
];

export default function BookHowieForm() {
  const [intent, setIntent] = useState<Intent>("podcast");
  const [form, setForm] = useState({
    name: "",
    email: "",
    outlet: "",
    role: "",
    date: "",
    audience: "",
    pitch: "",
    links: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = INTENTS.find((i) => i.id === intent)!;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          source: `book-howie-${intent}`,
          consent,
          pitch: `[${current.label}] ${form.pitch}\n\nOutlet: ${form.outlet}\nRole: ${form.role}\nDate/Deadline: ${form.date}\nAudience/Reach: ${form.audience}`,
        }),
      });
      if (!res.ok) {
        setError(
          "That did not go through. Email info@hjzproductions.com or call 917-453-2251.",
        );
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(
        "That did not go through. Email info@hjzproductions.com or call 917-453-2251.",
      );
    }
    setSubmitting(false);
  };

  return (
    <section
      id="book-howie"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto">
        <div className="text-center mb-14">
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            Book Howie
          </KineticKicker>
          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
            greenWords={["howie."]}
            as="h2"
          >
            {"Put Howie on your show. Or your stage."}
          </KineticHeadline>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg text-text-dim leading-8 max-w-2xl mx-auto"
          >
            He does not read from a bio. He tells you what happened. Pick the
            channel that fits.
          </motion.p>
        </div>

        {/* Intent selector */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-10">
          {INTENTS.map((i) => (
            <button
              key={i.id}
              onClick={() => setIntent(i.id)}
              className={`text-left rounded-2xl p-6 border transition-all duration-300 ${
                intent === i.id
                  ? "border-green bg-green/5 shadow-[0_0_40px_rgba(0,255,136,0.1)]"
                  : "border-white/8 bg-[#080808] hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`font-mono text-[10px] tracking-[0.3em] uppercase ${
                    intent === i.id ? "text-green" : "text-text-dim"
                  }`}
                >
                  {i.kicker}
                </span>
                <span
                  className={`w-2 h-2 rounded-full transition-colors ${
                    intent === i.id ? "bg-green shadow-[0_0_10px_#00FF88]" : "bg-white/20"
                  }`}
                />
              </div>
              <div
                className={`text-base font-black tracking-tight leading-tight ${
                  intent === i.id ? "text-white" : "text-white/70"
                }`}
              >
                {i.label}
              </div>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={intent}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.3 }}
            className="text-center text-text-dim text-sm max-w-2xl mx-auto mb-10"
          >
            {current.desc}
          </motion.p>
        </AnimatePresence>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green/5 border border-green/30 rounded-2xl p-10 md:p-14 text-center"
          >
            <div className="text-4xl mb-5 text-green">✓</div>
            <h3 className="text-2xl font-black text-white mb-2">
              Request logged.
            </h3>
            <p className="text-text-dim text-base leading-7 max-w-md mx-auto">
              We&apos;ll review and get back to you within a week if it&apos;s a
              fit. If it&apos;s time-sensitive, email{" "}
              <a href="mailto:howie@hjzproductions.com" className="text-green">
                howie@hjzproductions.com
              </a>{" "}
              directly.
            </p>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            <input
              type="text"
              placeholder="Your name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder={
                intent === "podcast"
                  ? "Podcast name"
                  : intent === "speaking"
                  ? "Event or conference"
                  : "Publication or outlet"
              }
              value={form.outlet}
              onChange={(e) => setForm({ ...form, outlet: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Your role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder={
                intent === "podcast"
                  ? "Recording date range"
                  : intent === "speaking"
                  ? "Event date"
                  : "Publication deadline"
              }
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder={
                intent === "podcast"
                  ? "Audience size"
                  : intent === "speaking"
                  ? "Expected audience"
                  : "Circulation"
              }
              value={form.audience}
              onChange={(e) => setForm({ ...form, audience: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <textarea
              placeholder={
                intent === "podcast"
                  ? "What's the angle? What do you want him to talk about?"
                  : intent === "speaking"
                  ? "Session topic + why Howie fits your audience"
                  : "The angle + questions you'd send"
              }
              value={form.pitch}
              onChange={(e) => setForm({ ...form, pitch: e.target.value })}
              rows={4}
              className="sm:col-span-2 bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors resize-none"
            />
            <input
              type="text"
              placeholder="Website / social links"
              value={form.links}
              onChange={(e) => setForm({ ...form, links: e.target.value })}
              className="sm:col-span-2 bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <div className="sm:col-span-2 mt-2">
              <ConsentCheckbox
                id="book-howie-consent"
                checked={consent}
                onChange={setConsent}
                label="Optional: also add me to the Field Notes newsletter. We will reply to this request either way."
              />
            </div>
            <motion.button
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="sm:col-span-2 mt-3 bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow disabled:opacity-60"
            >
              {submitting ? "Sending..." : `Send ${current.kicker} Request`}
            </motion.button>
            {error && (
              <p className="sm:col-span-2 text-[12px] leading-5 text-red-400">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
}
