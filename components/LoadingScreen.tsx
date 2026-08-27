"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[10000] bg-[#050505] flex items-center justify-center"
        >
          <div className="relative">
            {/* Green pulsing ring */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [0.5, 1.5, 0.5],
                opacity: [0, 0.5, 0],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 w-20 h-20 -m-10 rounded-full border border-green"
              style={{ left: "50%", top: "50%" }}
            />

            {/* Matrix-style text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 1] }}
              transition={{ duration: 0.5 }}
              className="font-mono text-green text-sm tracking-widest"
            >
              <span className="glitch-text">INITIALIZING</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
