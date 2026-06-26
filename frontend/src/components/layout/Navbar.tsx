"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Sun, Moon, Menu, X, LayoutDashboard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";

const NAV_LINKS = [
  { label: "Documentation", href: "/docs" },
  { label: "Guides", href: "/guides" },
  { label: "Démos", href: "/demo" },
  { label: "BizCore AI", href: "/chat" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { _hasHydrated, isSessionValid } = useAuthStore();
  const isAuthenticated = mounted && _hasHydrated && isSessionValid();

  useEffect(() => {
    setMounted(true);
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const isPortalRoute = pathname.startsWith("/dashboard");
  const isAuthenticatedDocs = isAuthenticated && pathname.startsWith("/docs");

  if (isPortalRoute || isAuthenticatedDocs) {
    return null;
  }

  return (
    <>
      {/* Wrapper fixe centré — l'île occupe ~56px de haut (top-2 + h-12) */}
      <motion.nav
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as const }}
        className="fixed top-3 inset-x-0 z-50 px-4"
      >
        <div
          className={cn(
            "mx-auto flex h-12 max-w-5xl items-center justify-between gap-3 rounded-2xl pl-4 pr-2",
            "border border-[var(--glass-border)] backdrop-blur-xl backdrop-saturate-150 transition-all duration-300",
            scrolled
              ? "bg-white/80 dark:bg-[#111118]/80 shadow-lg shadow-black/10"
              : "bg-white/60 dark:bg-[#111118]/55 shadow-md shadow-black/5",
          )}
        >
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-brand flex items-center justify-center flex-shrink-0">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.9" />
                <rect x="8.5" y="1" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55" />
                <rect x="1" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.55" />
                <rect x="8.5" y="8.5" width="5.5" height="5.5" rx="1.2" fill="white" opacity="0.25" />
              </svg>
            </div>
            <span className="font-display font-bold text-[15px] tracking-tight text-[var(--text)] group-hover:opacity-80 transition-opacity">
              BizCore
            </span>
          </Link>

          {/* Liens desktop — pastille active animée */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative rounded-lg px-3 py-1.5 text-[13px] transition-colors duration-200",
                    active
                      ? "text-[var(--text)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/60",
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 -z-10 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-2)]"
                      transition={
                        reduceMotion
                          ? { duration: 0 }
                          : { type: "spring", stiffness: 380, damping: 30 }
                      }
                    />
                  )}
                  {l.label}
                </Link>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {mounted && (
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text)] border border-[var(--glass-border)] bg-[var(--surface-2)] transition-all hover:scale-105"
                aria-label="Changer de thème"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ opacity: 0, rotate: -90, scale: 0.8 }}
                    animate={{ opacity: 1, rotate: 0, scale: 1 }}
                    exit={{ opacity: 0, rotate: 90, scale: 0.8 }}
                    transition={{ duration: reduceMotion ? 0 : 0.2 }}
                  >
                    {theme === "dark" ? <Moon size={14} /> : <Sun size={14} />}
                  </motion.div>
                </AnimatePresence>
              </button>
            )}

            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="hidden md:inline-flex items-center gap-1.5 text-[13px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-medium shadow-sm shadow-indigo-500/30"
              >
                <LayoutDashboard size={14} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden md:block text-[13px] px-3 py-1.5 rounded-xl border border-[var(--glass-border)] bg-[var(--surface-2)] text-[var(--text)] hover:border-indigo-500/40 hover:text-indigo-400 transition-all font-medium"
              >
                Se connecter
              </Link>
            )}
            <Link
              href="/docs"
              className="hidden md:block text-[13px] px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-medium shadow-sm shadow-indigo-500/30"
            >
              Commencer →
            </Link>
            <button
              className="md:hidden w-8 h-8 rounded-xl flex items-center justify-center border border-[var(--glass-border)] bg-[var(--surface-2)] text-[var(--text)]"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              {mobileOpen ? <X size={14} /> : <Menu size={14} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Menu mobile — panneau glass flottant sous l'île */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="fixed inset-x-4 top-[64px] z-40 flex flex-col gap-1 rounded-2xl border border-[var(--glass-border)] bg-white/80 dark:bg-[#111118]/85 backdrop-blur-xl p-3 shadow-xl shadow-black/10 md:hidden"
          >
            {NAV_LINKS.map((l) => {
              const active = isActive(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[14px] transition-colors",
                    active
                      ? "bg-[var(--surface-2)] text-[var(--text)] font-medium"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {l.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg bg-indigo-600 px-3 py-2.5 text-[14px] font-medium text-white"
              >
                <LayoutDashboard size={15} />
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mt-1 rounded-lg border border-[var(--glass-border)] bg-[var(--surface-2)] px-3 py-2.5 text-[14px] font-medium text-[var(--text)]"
              >
                Se connecter
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
