"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import ConsentCheckbox from "./ConsentCheckbox";

export default function Newsletter({
  compact = false,
}: {
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || submitting) return;
    if (!consent) {
      setError("Please tick the box so we know you want the newsletter.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          name: "",
          source: "howie-newsletter",
          pitch: "Newsletter signup",
          consent: true,
        }),
      });
      if (!res.ok) {
        setError("That did not go through. Email info@hjzproductions.com and we will add you.");
        setSubmitting(false);
        return;
      }
      setSubmitted(true);
    } catch {
      setError("That did not go through. Email info@hjzproductions.com and we will add you.");
    }
    setSubmitting(false);
  };

  if (compact) {
    return (
      <div className="w-full">
        {submitted ? (
          <div className="text-sm text-green">✓ You&apos;re on the list.</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex gap-2">
              <input
                type="email"
                required
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/10 focus:border-green/50 rounded-md px-4 py-3 text-white text-sm placeholder:text-white/25 outline-none transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="bg-green text-black font-bold text-xs tracking-wide uppercase rounded-md px-5 py-3 hover:shadow-[0_0_30px_rgba(0,255,136,0.4)] transition-shadow disabled:opacity-60"
              >
                {submitting ? "..." : "Subscribe"}
              </button>
            </div>
            <ConsentCheckbox
              id="newsletter-consent-compact"
              checked={consent}
              onChange={setConsent}
            />
            {error && (
              <p className="text-[12px] leading-5 text-red-400">{error}</p>
            )}
          </form>
        )}
      </div>
    );
  }

  return (
    <section
      id="newsletter"
      className="relative py-24 md:py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-[radial-gradient(ellipse,rgba(0,255,136,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto text-center">
        <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
          Field Notes · Newsletter
        </KineticKicker>
        <KineticHeadline
          className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-6"
          greenWords={["inbox."]}
          as="h2"
        >
          {"One send a month. Straight to your inbox."}
        </KineticHeadline>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-lg text-text-dim leading-8 max-w-xl mx-auto mb-12"
        >
          Field notes from behind the camera. A new blog post, the newest
          Operator Mindset episode, and one thing worth watching. No filler.
        </motion.p>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green/5 border border-green/30 rounded-2xl p-10 max-w-md mx-auto"
          >
            <div className="text-4xl mb-4 text-green">✓</div>
            <div className="text-xl font-black text-white mb-2">
              You&apos;re on the list.
            </div>
            <p className="text-text-dim text-sm">
              Next Field Notes drops the first Monday of the month.
            </p>
          </motion.div>
        ) : (
          <motion.form
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto space-y-5"
          >
            <div className="flex flex-col sm:flex-row items-stretch gap-3">
              <input
                type="email"
                required
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/[0.03] border border-white/8 focus:border-green/50 rounded-xl px-5 py-4 text-white text-sm placeholder:text-white/30 outline-none transition-colors"
              />
              <motion.button
                type="submit"
                disabled={submitting}
                whileHover={{ scale: submitting ? 1 : 1.02 }}
                whileTap={{ scale: submitting ? 1 : 0.98 }}
                className="bg-green text-black font-bold text-sm tracking-wide uppercase rounded-xl px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow disabled:opacity-60 whitespace-nowrap"
              >
                {submitting ? "Sending..." : "Subscribe"}
              </motion.button>
            </div>
            <div className="text-left">
              <ConsentCheckbox
                id="newsletter-consent"
                checked={consent}
                onChange={setConsent}
              />
              {error && (
                <p className="mt-3 text-[12px] leading-5 text-red-400">{error}</p>
              )}
            </div>
          </motion.form>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="mt-8 flex items-center justify-center gap-6 font-mono text-[10px] tracking-[0.3em] uppercase text-text-dim/60"
        >
          <span>Monthly</span>
          <span className="w-1 h-1 rounded-full bg-text-dim/40" />
          <span>No spam</span>
          <span className="w-1 h-1 rounded-full bg-text-dim/40" />
          <span>Unsubscribe anytime</span>
        </motion.div>
      </div>
    </section>
  );
}
