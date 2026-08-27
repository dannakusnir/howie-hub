"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import KineticHeadline, { KineticKicker } from "./KineticHeadline";
import ScanLineOverlay from "./ScanLineOverlay";
import AudioWaveform from "./AudioWaveform";

function DataReadout({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`bg-black/80 backdrop-blur-md border border-green/40 rounded-md px-3 py-2 font-mono ${className}`}
    >
      <div className="text-[8px] tracking-[0.3em] text-green/60 uppercase mb-1">
        {label}
      </div>
      <div className="text-[11px] tracking-wider text-green font-bold">
        {value}
      </div>
    </div>
  );
}

function TelemetryCounter() {
  const [uptime, setUptime] = useState({ h: 0, m: 0, s: 0 });
  const [pulse, setPulse] = useState(72);
  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      setUptime({
        h: Math.floor(elapsed / 3600),
        m: Math.floor(elapsed / 60) % 60,
        s: elapsed % 60,
      });
      setPulse(68 + Math.floor(Math.random() * 12));
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <>
      <DataReadout
        label="Uptime"
        value={`${String(uptime.h).padStart(2, "0")}:${String(uptime.m).padStart(2, "0")}:${String(uptime.s).padStart(2, "0")}`}
        className="absolute top-4 left-4"
      />
      <DataReadout
        label="Pulse"
        value={`${pulse} BPM`}
        className="absolute top-4 right-4"
      />
    </>
  );
}

export default function Athena() {
  const frameRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMove = (e: React.MouseEvent) => {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width - 0.5);
    mouseY.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <section
      id="athena"
      className="relative py-32 px-6 md:px-16 border-t border-white/5 overflow-hidden"
    >
      {/* Ambient orbital glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/3 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.08)_0%,transparent_60%)] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        {/* Athena visual, broadcast monitor treatment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
          style={{ perspective: "1200px" }}
        >
          {/* Outer HUD frame with parallax cards */}
          <motion.div
            ref={frameRef}
            onMouseMove={handleMove}
            onMouseLeave={handleLeave}
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative aspect-square max-w-lg mx-auto lg:mx-0"
          >
            {/* Depth shadow behind */}
            <div className="absolute -inset-4 rounded-3xl bg-green/5 blur-2xl" />

            {/* Main monitor */}
            <div className="relative w-full h-full rounded-3xl overflow-hidden border border-green/40 bg-black">
              {/* Duotone Athena image (green tint) */}
              <div className="absolute inset-0">
                <Image
                  src="/athena-close.webp"
                  alt="Athena, Howie's AI Operator"
                  fill
                  className="object-cover"
                  style={{
                    filter:
                      "grayscale(0.6) contrast(1.15) brightness(0.75) sepia(0.25) hue-rotate(80deg) saturate(1.8)",
                  }}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Green color overlay for duotone */}
                <div
                  className="absolute inset-0 mix-blend-color"
                  style={{ backgroundColor: "rgba(0,255,136,0.35)" }}
                />
              </div>

              <ScanLineOverlay intensity={0.7} />

              {/* Chromatic aberration slice */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                animate={{ opacity: [0, 0.4, 0, 0.2, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                style={{
                  background:
                    "linear-gradient(180deg, transparent 40%, rgba(255,0,80,0.15) 45%, rgba(0,255,255,0.15) 55%, transparent 60%)",
                }}
              />

              {/* Rule of thirds grid */}
              <div className="absolute inset-0 pointer-events-none opacity-15">
                <div className="absolute inset-y-0 left-1/3 w-px bg-green" />
                <div className="absolute inset-y-0 left-2/3 w-px bg-green" />
                <div className="absolute inset-x-0 top-1/3 h-px bg-green" />
                <div className="absolute inset-x-0 top-2/3 h-px bg-green" />
              </div>

              {/* HUD corners */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-green rounded-tl-lg" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-green rounded-tr-lg" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-green rounded-bl-lg" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-green rounded-br-lg" />

              {/* Center reticle */}
              <motion.svg
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40"
                width="60" height="60" viewBox="0 0 60 60"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              >
                <circle cx="30" cy="30" r="24" stroke="#00FF88" strokeWidth="0.5" strokeDasharray="2 2" fill="none" />
                <circle cx="30" cy="30" r="14" stroke="#00FF88" strokeWidth="0.5" fill="none" />
                <path d="M30 6 V 16 M30 44 V 54 M6 30 H 16 M44 30 H 54" stroke="#00FF88" strokeWidth="1" />
              </motion.svg>

              {/* Bottom telemetry bar */}
              <div className="absolute bottom-14 left-4 right-4 z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-mono text-[8px] tracking-[0.3em] text-green/60 uppercase">
                    Voice Waveform
                  </div>
                  <div className="flex-1 h-px bg-green/20" />
                </div>
                <AudioWaveform bars={32} height={22} />
              </div>

              {/* Identity label */}
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-end justify-between">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-green/70 mb-1">
                    ID · Beings.ACTi.v3
                  </div>
                  <div className="text-white text-2xl md:text-3xl font-black tracking-tight">
                    ATHENA<span className="text-green">.</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-75 animate-ping" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green" />
                    </span>
                    <span className="font-mono text-[9px] tracking-[0.3em] uppercase text-green">
                      Online
                    </span>
                  </span>
                </div>
              </div>

              {/* Telemetry counters, top corners */}
              <TelemetryCounter />
            </div>

            {/* Floating data cards outside monitor */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="absolute -left-6 top-1/3 z-20"
            >
              <DataReadout label="Meetings" value="42 today" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55 }}
              className="absolute -right-6 top-1/2 z-20"
            >
              <DataReadout label="Follow-ups" value="18 sent" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              className="absolute -left-4 bottom-1/4 z-20"
            >
              <DataReadout label="Latency" value="112ms" />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Copy */}
        <div>
          <KineticKicker className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-6">
            05 · Meet Athena
          </KineticKicker>

          <KineticHeadline
            className="text-4xl md:text-6xl font-black tracking-[-0.03em] leading-[0.95] mb-8"
            greenWords={["behind", "the", "operator."]}
            as="h2"
          >
            {"The AI operator behind the operator."}
          </KineticHeadline>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="space-y-5 text-lg text-text-dim leading-[1.7]"
          >
            <p className="text-white font-semibold text-xl">
              She is not a chatbot. She is an operator.
            </p>
            <p>
              Athena runs the back end of two production companies and a podcast.
              Meetings. Follow-through. Prep dossiers. Decision logs. The work
              that makes everything else possible.
            </p>
            <p>
              And now she is on the mic. Athena co-hosts full episodes of
              Operator Mindset, interviewing Howie about the businesses, the
              plays, and the decisions most people never think to ask about.
            </p>
            <p>
              What Howie built with Athena is not a tool. It is a partnership.
              And it is changing how operators run their world.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          >
            <a
              href="https://go.acti.ai/go/athena_subscription/p_yd7qrjz"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green/10 hover:bg-green/20 border border-green/40 text-green font-mono text-xs tracking-[0.25em] uppercase font-bold rounded-full px-6 py-3 transition-colors"
            >
              Meet Athena
              <span aria-hidden="true">→</span>
            </a>
            <span className="font-mono text-[10px] tracking-[0.3em] text-text-dim uppercase">
              Powered by ACTi Beings
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
