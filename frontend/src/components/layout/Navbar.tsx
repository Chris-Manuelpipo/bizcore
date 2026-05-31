"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Documentation", href: "/docs" },
  { label: "Guides", href: "/guides" },
  { label: "Démos", href: "/demo" },
  { label: "BizCore AI", href: "/chat" },
  { label: "Admin", href: "/admin/dashboard" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 h-14 px-6 flex items-center justify-between transition-all duration-300",
          scrolled ? "bg-[#0A0A0F]/85 dark:bg-[#0A0A0F]/85 backdrop-blur-xl border-b border-white/[0.06] shadow-sm" : "bg-transparent"
        )}
      >
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
              <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.9"/>
              <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55"/>
              <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55"/>
              <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.25"/>
            </svg>
          </div>
          <span className="font-display font-bold text-[15px] tracking-tight text-white dark:text-white group-hover:opacity-80 transition-opacity">
            BizCore
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
            return (
              <Link key={l.href} href={l.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative text-[13px] transition-colors duration-200",
                  active ? "text-white font-medium" : "text-gray-400 hover:text-white"
                )}>
                {l.label}
                {active && (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute -bottom-1.5 left-0 right-0 h-0.5 rounded-full bg-gradient-brand"
                  />
                )}
              </Link>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {mounted && (
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white border border-white/10 bg-white/5 transition-all hover:scale-105"
              aria-label="Toggle theme"
            >
              <AnimatePresence mode="wait">
                <motion.div key={theme}
                  initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                  transition={{ duration: 0.2 }}>
                  {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                </motion.div>
              </AnimatePresence>
            </button>
          )}
          <Link href="/admin/login"
            className="hidden md:block text-[13px] px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-200 hover:bg-white/10 transition-all">
            Se connecter
          </Link>
          <Link href="/docs"
            className="hidden md:block text-[13px] px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-medium">
            Commencer →
          </Link>
          <button className="md:hidden w-8 h-8 rounded-lg flex items-center justify-center border border-white/10 bg-white/5 text-white"
            onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X size={14} /> : <Menu size={14} />}
          </button>
        </div>
      </motion.nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="fixed top-14 left-0 right-0 z-40 bg-[#111118]/95 backdrop-blur-xl border-b border-white/10 py-4 px-6 flex flex-col gap-3 md:hidden">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link key={l.href} href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "text-[14px] py-1 transition-colors",
                    active ? "text-white font-medium" : "text-gray-400 hover:text-white"
                  )}
                  onClick={() => setMobileOpen(false)}>
                  {l.label}
                </Link>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
