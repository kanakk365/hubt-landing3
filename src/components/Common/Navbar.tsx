"use client";

import React, { useEffect, useState } from "react";
import { Logo } from "@/components/site/Logo";
import { BookCall } from "@/components/site/BookCall";
import { cn } from "@/lib/utils";

/**
 * Wordmark and the one action. Sections mark themselves with data-nav-tone;
 * the bar takes the tone of whichever section sits under its centre line.
 */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    let raf = 0;
    const probe = () => {
      raf = 0;
      setScrolled(window.scrollY > 12);
      let next: "light" | "dark" | null = null;
      for (const el of Array.from(document.querySelectorAll<HTMLElement>("[data-nav-tone]"))) {
        const r = el.getBoundingClientRect();
        if (r.top <= 36 && r.bottom > 36) next = el.dataset.navTone === "light" ? "light" : "dark";
      }
      setTone(next);
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(probe);
    };
    probe();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hubtech:navtone", schedule);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hubtech:navtone", schedule);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50",
        tone === "light" && "tokens-light",
        tone === "dark" && "tokens-dark"
      )}
    >
      {/* Once scrolled, a solid bar in the section's tone keeps the wordmark legible */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[72px] border-b border-line bg-bg transition-[opacity,background-color,border-color] duration-300",
          scrolled ? "opacity-100" : "opacity-0"
        )}
      />
      <nav
        aria-label="Main"
        className="relative mx-auto flex h-[72px] w-full max-w-[1320px] items-center justify-between gap-6 px-6 md:px-8"
      >
        <Logo />
        <BookCall size="sm" />
      </nav>
    </header>
  );
};

export default Navbar;
