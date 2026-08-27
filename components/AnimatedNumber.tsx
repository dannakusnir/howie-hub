"use client";

import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useRef } from "react";

export default function AnimatedNumber({
  value,
  suffix = "",
  prefix = "",
  duration = 1.6,
  className = "",
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const count = useMotionValue(0);
  const display = useTransform(count, (v) => `${prefix}${Math.round(v)}${suffix}`);

  useEffect(() => {
    if (inView) {
      const controls = animate(count, value, {
        duration,
        ease: [0.16, 1, 0.3, 1],
      });
      return controls.stop;
    }
  }, [inView, count, value, duration]);

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  );
}
