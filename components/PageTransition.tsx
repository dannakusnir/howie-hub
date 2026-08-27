"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

/**
 * Broadcast-style camera-cut transition between routes.
 * On route change: quick flash + slate wipe.
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Enter flash: quick clapper slap */}
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          style={{ originY: 0 }}
          className="fixed top-0 left-0 right-0 h-16 z-[9990] bg-black flex pointer-events-none"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 2 === 0 ? "bg-white" : "bg-black"}`}
            />
          ))}
        </motion.div>
        <motion.div
          initial={{ scaleY: 1 }}
          animate={{ scaleY: 0 }}
          exit={{ scaleY: 1 }}
          transition={{ duration: 0.4, ease: [0.65, 0, 0.35, 1] }}
          style={{ originY: 1 }}
          className="fixed bottom-0 left-0 right-0 h-16 z-[9990] bg-black flex pointer-events-none"
        >
          {Array.from({ length: 40 }).map((_, i) => (
            <div
              key={i}
              className={`flex-1 ${i % 2 === 0 ? "bg-white" : "bg-black"}`}
            />
          ))}
        </motion.div>

        {children}
      </motion.div>
    </AnimatePresence>
  );
}
