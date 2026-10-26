"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { BookCall } from "@/components/site/BookCall";
import { NAV_LINKS } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Wordmark, the page links and the one action, on a solid white bar over every section. */
const Navbar = () => {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [seenPath, setSeenPath] = useState(path);

  // Close the sheet whenever the route changes.
  if (seenPath !== path) {
    setSeenPath(path);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const isActive = (href: string) => path === href || path.startsWith(`${href}/`);
  const lit = hover ?? NAV_LINKS.find((l) => isActive(l.href))?.href ?? null;

  return (
    <header className="tokens-light fixed inset-x-0 top-0 z-50 border-b border-line bg-bg">
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-8"
      >
        <Logo />

        <ul
          className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 md:flex"
          onPointerLeave={() => setHover(null)}
        >
          {NAV_LINKS.map((l) => {
            const active = isActive(l.href);
            return (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onPointerEnter={() => setHover(l.href)}
                  onFocus={() => setHover(l.href)}
                  onBlur={() => setHover(null)}
                  className={cn(
                    "relative z-10 block rounded-full px-4 py-2 text-[0.875rem] font-medium tracking-[-0.01em] transition-colors duration-300",
                    lit === l.href ? "text-fg" : "text-fg-subtle hover:text-fg"
                  )}
                >
                  {l.label}
                </Link>
                {lit === l.href && (
                  <motion.span
                    layoutId="nav-lit"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-0 rounded-full border border-line bg-fg/[0.06]"
                  />
                )}
                {active && (
                  <motion.span
                    layoutId="nav-dot"
                    aria-hidden
                    className="absolute -bottom-[7px] left-1/2 size-1 -translate-x-1/2 rounded-full bg-fg"
                  />
                )}
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <BookCall size="sm" className="max-[380px]:hidden" />
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-sheet"
            onClick={() => setOpen((o) => !o)}
            className="relative flex size-10 items-center justify-center rounded-full border border-line text-fg transition-colors hover:bg-fg/[0.06] md:hidden"
          >
            <span
              aria-hidden
              className={cn(
                "absolute h-px w-4 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                open ? "rotate-45" : "-translate-y-[3.5px]"
              )}
            />
            <span
              aria-hidden
              className={cn(
                "absolute h-px w-4 bg-current transition-transform duration-500 ease-[var(--ease-out-expo)]",
                open ? "-rotate-45" : "translate-y-[3.5px]"
              )}
            />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="nav-sheet"
            key="sheet"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-x-0 bottom-0 top-[72px] flex flex-col justify-between overflow-y-auto border-t border-line bg-bg px-6 pb-10 pt-8 md:hidden"
          >
            <ul className="flex flex-col">
              {[{ href: "/", label: "Home" }, ...NAV_LINKS].map((l, i) => {
                const active = l.href === "/" ? path === "/" : isActive(l.href);
                return (
                  <motion.li
                    key={l.href}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12, transition: { duration: 0.2 } }}
                    transition={{ duration: 0.6, ease: EASE, delay: 0.12 + i * 0.05 }}
                    className="border-b border-line"
                  >
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      onClick={() => setOpen(false)}
                      className="flex items-baseline justify-between py-5"
                    >
                      <span
                        className={cn(
                          "font-display text-[2.5rem] font-[440] leading-none tracking-[-0.04em] [font-stretch:106%]",
                          active ? "text-fg" : "text-fg-muted"
                        )}
                      >
                        {l.label}
                      </span>
                      <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle">
                        {String(i).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="pt-10"
            >
              <BookCall size="lg" />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;
