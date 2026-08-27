"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

/**
 * Split-word kinetic reveal for headlines.
 * Each word slides up with a stagger + slight blur → sharp.
 */
export default function KineticHeadline({
  children,
  className = "",
  as = "h2",
  greenWords = [],
  delay = 0,
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3";
  greenWords?: string[];
  delay?: number;
}) {
  const ref = useRef<HTMLHeadingElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });

  const words = children.split(/(\s+|\n)/);

  const Tag = as as "h2";

  return (
    <Tag ref={ref} className={className} aria-label={children}>
      <span className="inline-block">
        {words.map((word, i) => {
          if (word === "\n") return <br key={`br-${i}`} />;
          if (/^\s+$/.test(word)) return <span key={`sp-${i}`}> </span>;
          const isGreen = greenWords.some((g) =>
            word.toLowerCase().replace(/[.,!?]/g, "").includes(g.toLowerCase())
          );
          return (
            <span
              key={`w-${i}`}
              className="inline-block overflow-hidden align-bottom"
              aria-hidden="true"
            >
              <motion.span
                className={`inline-block ${isGreen ? "text-green" : ""}`}
                initial={{ y: "100%", opacity: 0, filter: "blur(8px)" }}
                animate={
                  inView
                    ? { y: 0, opacity: 1, filter: "blur(0px)" }
                    : { y: "100%", opacity: 0, filter: "blur(8px)" }
                }
                transition={{
                  duration: 0.8,
                  delay: delay + i * 0.06,
                  ease: [0.16, 1, 0.3, 1],
                }}
              >
                {word}
              </motion.span>
            </span>
          );
        })}
      </span>
    </Tag>
  );
}

/**
 * Same idea but for a single-line kicker/label.
 */
export function KineticKicker({
  children,
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div
        initial={{ y: "100%" }}
        animate={inView ? { y: 0 } : { y: "100%" }}
        transition={{
          duration: 0.7,
          delay,
          ease: [0.16, 1, 0.3, 1],
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
