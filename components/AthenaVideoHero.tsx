"use client";

import { motion } from "framer-motion";
import { useRef, useState } from "react";

export default function AthenaVideoHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.muted = false;
      v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  };

  return (
    <section className="relative py-16 md:py-24 px-6 md:px-16 border-t border-white/5">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-8 text-center"
        >
          <p className="font-mono text-xs tracking-[0.4em] uppercase text-green mb-4">
            · Watch Athena
          </p>
          <h2 className="text-3xl md:text-5xl font-black tracking-[-0.02em] leading-tight text-white">
            Hear it from her.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mx-auto rounded-2xl overflow-hidden border border-green/25 bg-black shadow-[0_20px_80px_-20px_rgba(0,255,136,0.3)]"
          style={{ maxWidth: "min(420px, 100%)", aspectRatio: "9/16" }}
        >
          <video
            ref={videoRef}
            src="/athena-podcast.mp4"
            poster="/athena-podcast-poster.jpg"
            playsInline
            preload="metadata"
            onEnded={() => setPlaying(false)}
            onPause={() => setPlaying(false)}
            onPlay={() => setPlaying(true)}
            className="w-full h-full object-cover"
          />

          {!playing && (
            <button
              onClick={togglePlay}
              aria-label="Play Athena video"
              className="absolute inset-0 flex items-center justify-center bg-black/25 hover:bg-black/10 transition-colors group"
            >
              <span className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-green flex items-center justify-center group-hover:scale-110 group-hover:shadow-[0_0_60px_rgba(0,255,136,0.6)] transition-all">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="black">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </button>
          )}

          {playing && (
            <button
              onClick={togglePlay}
              aria-label="Pause"
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/20 flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
                <path d="M6 4h4v16H6zM14 4h4v16h-4z" />
              </svg>
            </button>
          )}

          <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-green opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green" />
            </span>
            <span className="font-mono text-[10px] tracking-[0.3em] text-white/80 uppercase">
              Live · Athena
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
