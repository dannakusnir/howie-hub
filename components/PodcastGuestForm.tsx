"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import ConsentCheckbox from "./ConsentCheckbox";

export default function PodcastGuestForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    role: "",
    pitch: "",
    links: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

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
          source: "howie-podcast-guest",
          consent,
        }),
      });
      if (!res.ok) {
        setError(
          "That did not go through. Email info@hjzproductions.com and we will pick it up.",
        );
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError(
        "That did not go through. Email info@hjzproductions.com and we will pick it up.",
      );
    }
    setSubmitting(false);
  };

  return (
    <section
      id="podcast-guest"
      className="relative py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-3xl mx-auto text-center">
        <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
          09 · Get on the Show
        </KineticKicker>

        <KineticHeadline
          className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
          greenWords={["across", "the", "desk."]}
          as="h2"
        >
          {"Come sit across the desk."}
        </KineticHeadline>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="text-lg text-text-dim leading-7 max-w-xl mx-auto mb-12"
        >
          Founders, operators, industry veterans. If you have a story about the
          work behind the work, we want to hear it.
        </motion.p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green/5 border border-green/30 rounded-2xl p-10 md:p-14"
          >
            <div className="text-4xl mb-5 text-green">✓</div>
            <h3 className="text-2xl font-black text-white mb-2">
              We&apos;ve got you.
            </h3>
            <p className="text-text-dim text-base leading-7">
              We&apos;ll review your pitch and reach out within a week if it&apos;s
              a fit for the show.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            onSubmit={handleSubmit}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left"
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
              placeholder="Company / brand"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <input
              type="text"
              placeholder="Your role"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <textarea
              placeholder="What's the story you want to tell?"
              value={form.pitch}
              onChange={(e) => setForm({ ...form, pitch: e.target.value })}
              rows={4}
              className="sm:col-span-2 bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors resize-none"
            />
            <input
              type="text"
              placeholder="Website / social links (optional)"
              value={form.links}
              onChange={(e) => setForm({ ...form, links: e.target.value })}
              className="sm:col-span-2 bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
            />
            <div className="sm:col-span-2 mt-2 text-left">
              <ConsentCheckbox
                id="podcast-guest-consent"
                checked={consent}
                onChange={setConsent}
                label="Optional: also add me to the Field Notes newsletter. We will review your pitch either way."
              />
            </div>
            <motion.button
              ref={btnRef}
              type="submit"
              disabled={submitting}
              whileHover={{ scale: submitting ? 1 : 1.01 }}
              whileTap={{ scale: submitting ? 1 : 0.98 }}
              className="sm:col-span-2 mt-3 bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Pitch the Show"}
            </motion.button>
            {error && (
              <p className="sm:col-span-2 text-[12px] leading-5 text-red-400">
                {error}
              </p>
            )}
          </motion.form>
        )}
      </div>
    </section>
  );
}
