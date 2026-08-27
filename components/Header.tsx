"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navItems = [
  { label: "Vision", href: "/vision" },
  { label: "Work", href: "/work" },
  { label: "Podcast", href: "/podcast" },
  { label: "Athena", href: "/athena" },
  { label: "Press", href: "/press" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-black/70 border-b border-white/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="flex items-center gap-3 group" onClick={closeMenu}>
            <span className="font-mono text-xs tracking-[0.3em] text-green font-bold uppercase">
              HZ
            </span>
            <span className="hidden sm:inline text-white/60 font-mono text-[10px] tracking-[0.3em] uppercase group-hover:text-white/90 transition-colors">
              Howie Zales
            </span>
          </Link>
        </motion.div>

        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:flex items-center gap-8"
        >
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative text-xs font-mono tracking-[0.2em] uppercase transition-colors duration-300 ${
                  active ? "text-green" : "text-white/60 hover:text-green"
                }`}
              >
                {item.label}
                {active && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute -bottom-1.5 left-0 right-0 h-px bg-green"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
          <Link
            href="/contact"
            className="border border-green/50 text-green hover:bg-green hover:text-black px-4 py-2 rounded-full text-[11px] font-mono font-bold tracking-[0.2em] uppercase transition-all duration-300"
          >
            Get on the Show
          </Link>
        </motion.nav>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col gap-1.5 z-50"
          aria-label="Toggle menu"
        >
          <motion.span
            animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-[1.5px] bg-green"
          />
          <motion.span
            animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
            className="block w-6 h-[1.5px] bg-green"
          />
          <motion.span
            animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
            className="block w-6 h-[1.5px] bg-green"
          />
        </button>
      </div>

      <motion.div
        initial={false}
        animate={
          menuOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }
        }
        className="md:hidden overflow-hidden bg-black/95 backdrop-blur-lg border-t border-white/5"
      >
        <div className="flex flex-col items-end gap-5 px-6 py-8">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={closeMenu}
                className={`text-sm font-mono tracking-[0.2em] uppercase transition-colors ${
                  active ? "text-green" : "text-white/70 hover:text-green"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/contact"
            onClick={closeMenu}
            className="border border-green text-green px-5 py-2 rounded-full text-[11px] font-mono font-bold tracking-[0.2em] uppercase"
          >
            Get on the Show
          </Link>
        </div>
      </motion.div>
    </header>
  );
}
