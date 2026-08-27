"use client";

import { motion, useMotionValue, useScroll, useSpring, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import ParticleField from "./ParticleField";
import MagneticButton from "./MagneticButton";

function Timecode() {
  const [t, setT] = useState({ h: "00", m: "00", s: "00", f: "00" });

  useEffect(() => {
    const start = Date.now();
    let raf: number;
    const tick = () => {
      const elapsed = Date.now() - start;
      const totalFrames = Math.floor((elapsed / 1000) * 24);
      const frames = totalFrames % 24;
      const secs = Math.floor(totalFrames / 24) % 60;
      const mins = Math.floor(totalFrames / (24 * 60)) % 60;
      const hrs = Math.floor(totalFrames / (24 * 60 * 60));
      setT({
        h: String(hrs).padStart(2, "0"),
        m: String(mins).padStart(2, "0"),
        s: String(secs).padStart(2, "0"),
        f: String(frames).padStart(2, "0"),
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <span className="font-mono text-[11px] tracking-[0.15em] text-green">
      {t.h}:{t.m}:{t.s}:{t.f}
    </span>
  );
}

function CornerBracket({
  className,
  flip = false,
}: {
  className: string;
  flip?: boolean;
}) {
  return (
    <svg
      className={className}
      width="52"
      height="52"
      viewBox="0 0 52 52"
      fill="none"
      style={{ transform: flip ? "scaleX(-1)" : undefined }}
    >
      <path
        d="M2 24V2H24"
        stroke="#00FF88"
        strokeWidth="1.5"
        strokeLinecap="square"
      />
      <circle cx="2" cy="2" r="2" fill="#00FF88" />
    </svg>
  );
}

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 100, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 100, damping: 20 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5], [0.04, 0]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" ref={sectionRef} className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-16 overflow-hidden">
      {/* Howie portrait, cinematic backdrop with color grade */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 opacity-[0.22] mix-blend-screen">
          <Image
            src="/howie-front.png"
            alt="Howie Zales, Emmy Award-winning broadcast camera operator and founder of HJZ Productions"
            fill
            priority
            className="object-cover object-center scale-105"
            sizes="100vw"
          />
        </div>
        {/* Warm-cold color grade overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_50%,rgba(255,138,0,0.10)_0%,transparent_60%),radial-gradient(ellipse_80%_60%_at_100%_100%,rgba(0,217,255,0.08)_0%,transparent_60%),radial-gradient(ellipse_80%_60%_at_0%_0%,rgba(255,23,68,0.06)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/30 to-black" />
      </div>
      {/* Particle field, subtle broadcast atmosphere */}
      <div className="absolute inset-0 z-[1] opacity-40">
        <ParticleField />
      </div>
      {/* HUD frame corners */}
      <CornerBracket className="absolute top-6 left-6 md:top-10 md:left-10 z-20" />
      <CornerBracket className="absolute top-6 right-6 md:top-10 md:right-10 z-20" flip />
      <CornerBracket
        className="absolute bottom-16 left-6 md:bottom-16 md:left-10 z-20"
        flip={false}
      />
      <CornerBracket
        className="absolute bottom-16 right-6 md:bottom-16 md:right-10 z-20"
        flip
      />

      {/* Top HUD strip */}
      <div className="absolute top-6 md:top-10 left-0 right-0 flex items-center justify-between px-16 md:px-24 z-20 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
          </span>
          <span className="font-mono text-[11px] tracking-[0.3em] text-white/70 uppercase">
            REC · NYC · IATSE
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.3em] text-white/40 uppercase">
            TC
          </span>
          <Timecode />
        </div>
      </div>

      {/* Bottom HUD strip */}
      <div className="absolute bottom-16 left-0 right-0 flex items-center justify-between px-16 md:px-24 z-20 pointer-events-none">
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
          CAM 01 · HOWIE ZALES
        </span>
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
          NYC · EST 2001
        </span>
      </div>

      {/* Ambient radial glow */}
      <motion.div
        style={{ x: springX, y: springY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-[radial-gradient(circle,rgba(0,255,136,0.07)_0%,transparent_65%)] pointer-events-none"
      />

      {/* Rule of thirds grid overlay (subtle) */}
      <motion.div
        style={{ opacity: gridOpacity }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute inset-y-0 left-1/3 w-px bg-green" />
        <div className="absolute inset-y-0 left-2/3 w-px bg-green" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-green" />
        <div className="absolute inset-x-0 top-2/3 h-px bg-green" />
      </motion.div>

      {/* Main content, scroll-scrubbed parallax + fade */}
      <motion.div
        style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 max-w-6xl mx-auto text-center"
      >
        {/* Kicker, color-coded credentials */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-mono text-[11px] md:text-xs tracking-[0.4em] uppercase mb-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
        >
          <span className="text-amber stat-glow-amber">Emmy</span>
          <span className="text-white/20">·</span>
          <span className="text-red">IATSE</span>
          <span className="text-white/20">·</span>
          <span className="text-green">Handheld Sports Camera</span>
          <span className="text-white/20">·</span>
          <span className="text-blue">TV Executive</span>
        </motion.p>

        {/* Massive OPERATOR MINDSET typography */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="relative"
        >
          <h1 className="leading-[0.85]">
            <motion.span
              initial={{ opacity: 0, y: 30, letterSpacing: "0.3em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "-0.02em" }}
              transition={{ delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="block font-black text-6xl md:text-8xl lg:text-[9rem] text-white/85 tracking-[-0.02em]"
              style={{ fontVariationSettings: "'wght' 900" }}
            >
              OPERATOR
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="block font-black text-6xl md:text-8xl lg:text-[9rem] tracking-[-0.02em]"
            >
              <span className="text-green glitch-text">MINDSET</span>
              <span className="text-green">.</span>
            </motion.span>
          </h1>
        </motion.div>

        {/* Name signature */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.6 }}
          className="mt-8 flex items-center justify-center gap-4"
        >
          <span className="h-px w-8 md:w-12 bg-white/20" />
          <span className="font-mono text-[13px] md:text-sm tracking-[0.4em] uppercase text-white/90">
            Howie Zales
          </span>
          <span className="h-px w-8 md:w-12 bg-white/20" />
        </motion.div>

        {/* Subhead */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.35, duration: 0.6 }}
          className="mt-10 text-base md:text-lg lg:text-xl text-text-dim max-w-2xl mx-auto leading-8"
        >
          Behind the camera at the{" "}
          <span className="text-amber font-semibold">Super Bowl</span>, the{" "}
          <span className="text-amber font-semibold">Olympics</span>,{" "}
          <span className="text-amber font-semibold">WrestleMania</span>, and{" "}
          <span className="text-amber font-semibold">Sunday Night Football</span>.
          Founder of{" "}
          <span className="text-red font-semibold">HJZ Productions</span> and co-founder of{" "}
          <span className="text-blue font-semibold">Viridity Entertainment Services</span>.
          Host of <span className="text-green font-semibold">Operator Mindset</span>.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.6, duration: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <MagneticButton
            onClick={() => scrollTo("podcast")}
            className="group relative overflow-hidden bg-green text-black font-bold text-sm tracking-wide uppercase rounded-full px-8 py-4 hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] transition-shadow duration-300 flex items-center gap-2"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Listen to the Podcast
          </MagneticButton>
          <MagneticButton
            onClick={() => scrollTo("podcast-guest")}
            className="group border border-white/20 hover:border-green text-white hover:text-green font-medium text-sm tracking-wide uppercase rounded-full px-8 py-4 transition-colors duration-300"
          >
            Get on the Show →
          </MagneticButton>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-20"
        style={{ animation: "bounce-chevron 2s ease-in-out infinite" }}
      >
        <span className="font-mono text-[10px] tracking-[0.3em] text-white/40 uppercase">
          Scroll
        </span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00FF88" strokeWidth="2">
          <path d="M6 9l6 6 6-6" />
        </svg>
      </motion.div>
    </section>
  );
}
