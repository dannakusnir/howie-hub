"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { MouseEvent, useRef, ReactNode } from "react";

export default function MagneticButton({
  children,
  className = "",
  onClick,
  strength = 0.35,
  as = "button",
  href,
  target,
  rel,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  strength?: number;
  as?: "button" | "a";
  href?: string;
  target?: string;
  rel?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.5 });

  const handleMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    x.set((e.clientX - cx) * strength);
    y.set((e.clientY - cy) * strength);
  };

  const handleLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="inline-block"
    >
      {as === "a" ? (
        <a href={href} target={target} rel={rel} className={className}>
          {children}
        </a>
      ) : (
        <button onClick={onClick} className={className}>
          {children}
        </button>
      )}
    </motion.div>
  );
}
