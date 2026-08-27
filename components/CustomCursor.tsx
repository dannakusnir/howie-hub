"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useMotionValue } from "framer-motion";

type LockTarget = {
  x: number;
  y: number;
  width: number;
  height: number;
} | null;

export default function CustomCursor() {
  const [visible, setVisible] = useState(false);
  const [lockTarget, setLockTarget] = useState<LockTarget>(null);
  const [isClickable, setIsClickable] = useState(false);

  const cursorX = useSpring(0, { stiffness: 500, damping: 28 });
  const cursorY = useSpring(0, { stiffness: 500, damping: 28 });
  const trailX = useSpring(0, { stiffness: 200, damping: 28 });
  const trailY = useSpring(0, { stiffness: 200, damping: 28 });

  const lockX = useSpring(0, { stiffness: 300, damping: 30 });
  const lockY = useSpring(0, { stiffness: 300, damping: 30 });
  const lockW = useSpring(0, { stiffness: 300, damping: 30 });
  const lockH = useSpring(0, { stiffness: 300, damping: 30 });
  const lockOpacity = useMotionValue(0);

  useEffect(() => {
    const isTouchDevice = window.matchMedia("(hover: none)").matches;
    if (isTouchDevice) return;

    setVisible(true);

    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      trailX.set(e.clientX);
      trailY.set(e.clientY);

      const el = e.target as HTMLElement;
      if (!el) return;

      const lockable = el.closest<HTMLElement>(
        "[data-hud-lock], a, button, [role='button'], input, textarea, [tabindex]"
      );
      if (lockable) {
        const rect = lockable.getBoundingClientRect();
        setLockTarget({ x: rect.left, y: rect.top, width: rect.width, height: rect.height });
        lockX.set(rect.left);
        lockY.set(rect.top);
        lockW.set(rect.width);
        lockH.set(rect.height);
        lockOpacity.set(1);
        setIsClickable(true);
      } else {
        lockOpacity.set(0);
        setLockTarget(null);
        setIsClickable(false);
      }
    };

    const click = () => {
      playBlip();
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("click", click);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("click", click);
    };
  }, [cursorX, cursorY, trailX, trailY, lockX, lockY, lockW, lockH, lockOpacity]);

  if (!visible) return null;

  return (
    <>
      {/* HUD Lock reticle, follows hovered interactive element */}
      <motion.div
        className="fixed pointer-events-none z-[9997]"
        style={{
          x: lockX,
          y: lockY,
          width: lockW,
          height: lockH,
          opacity: lockOpacity,
        }}
      >
        <svg
          className="absolute inset-0 w-full h-full overflow-visible"
          preserveAspectRatio="none"
        >
          <path
            d="M0 12 L0 0 L12 0"
            stroke="#00FF88"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M100% -12 L100% 0 L calc(100% - 12) 0"
            stroke="#00FF88"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M0 calc(100% - 12) L0 100% L12 100%"
            stroke="#00FF88"
            strokeWidth="1.5"
            fill="none"
          />
          <path
            d="M100% calc(100% - 12) L100% 100% L calc(100% - 12) 100%"
            stroke="#00FF88"
            strokeWidth="1.5"
            fill="none"
          />
        </svg>
        {/* Corner brackets using pure divs (SVG had issues with % in paths) */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-green" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-green" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-green" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-green" />
      </motion.div>

      {/* Trail glow */}
      <motion.div
        className="fixed pointer-events-none z-[9998] rounded-full"
        style={{
          x: trailX,
          y: trailY,
          width: 30,
          height: 30,
          translateX: "-50%",
          translateY: "-50%",
          background: "radial-gradient(circle, rgba(0,255,136,0.15) 0%, transparent 70%)",
        }}
      />

      {/* Cursor dot, expands into reticle when hovering interactive */}
      <motion.div
        className="fixed pointer-events-none z-[9999]"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: "-50%",
          translateY: "-50%",
        }}
      >
        <motion.div
          animate={{
            scale: isClickable ? 1.6 : 1,
          }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
          className="relative"
        >
          <div
            className={`rounded-full transition-all ${
              isClickable ? "w-2.5 h-2.5" : "w-2 h-2"
            }`}
            style={{
              backgroundColor: "#00FF88",
              boxShadow: "0 0 10px #00FF88, 0 0 20px rgba(0,255,136,0.3)",
            }}
          />
          {isClickable && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-green"
            />
          )}
        </motion.div>
      </motion.div>
    </>
  );
}

// Simple Web Audio API blip on click
let audioCtx: AudioContext | null = null;
function playBlip() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.06);
    gain.gain.setValueAtTime(0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
    osc.connect(gain).connect(audioCtx.destination);
    osc.start(now);
    osc.stop(now + 0.09);
  } catch {
    // ignore
  }
}
