"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { LOCAL_SECTIONS } from "@/lib/localAi";
import { cn } from "@/lib/utils";
import { EASE } from "./kit";

/**
 * The page's own bar, built like the product bar: a rolling count on the
 * left, the sections on the right with the current one lit white, and a
 * hairline along the bottom that fills as the page goes by.
 */
export function LocalNav() {
  const [active, setActive] = useState<string | null>(null);
  const list = useRef<HTMLUListElement>(null);
  const index = Math.max(0, LOCAL_SECTIONS.findIndex((s) => s.id === active));

  useEffect(() => {
    const els = LOCAL_SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (hit) setActive(hit.target.id);
      },
      // A thin band just under the two bars decides which section is current.
      { rootMargin: "-130px 0px -60% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  // Keep the lit link in view on phones, where the bar scrolls sideways.
  useEffect(() => {
    const ul = list.current;
    const el = active ? ul?.querySelector<HTMLElement>(`[data-id="${active}"]`) : null;
    if (!ul || !el || ul.scrollWidth <= ul.clientWidth) return;
    ul.scrollTo({ left: el.offsetLeft - (ul.clientWidth - el.offsetWidth) / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label="On this page" className="tokens-dark sticky top-[72px] z-40 border-b border-line bg-black text-fg">
      <div className="container-site flex h-12 items-center gap-6">
        <span className="hidden shrink-0 items-baseline gap-2 font-mono text-[0.75rem] uppercase tracking-[0.16em] text-fg-subtle md:flex">
          <span className="relative inline-flex h-[1.2em] overflow-hidden tabular-nums text-fg">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={index}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.45, ease: EASE }}
                className="block"
              >
                {String(index + 1).padStart(2, "0")}
              </motion.span>
            </AnimatePresence>
          </span>
          / {String(LOCAL_SECTIONS.length).padStart(2, "0")}
        </span>
        <ul
          ref={list}
          className="relative -mx-2 flex min-w-0 flex-1 gap-1 overflow-x-auto px-2 [scrollbar-width:none] md:justify-end [&::-webkit-scrollbar]:hidden"
        >
          {LOCAL_SECTIONS.map((s) => {
            const on = active === s.id;
            return (
              <li key={s.id} className="relative shrink-0">
                <a
                  href={`#${s.id}`}
                  data-id={s.id}
                  aria-current={on ? "location" : undefined}
                  className={cn(
                    "relative z-10 flex h-8 items-center rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors duration-300",
                    on ? "text-black" : "text-fg-subtle hover:text-fg"
                  )}
                >
                  {s.label}
                </a>
                {on && (
                  <motion.span
                    layoutId="local-nav-lit"
                    aria-hidden
                    transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    className="absolute inset-0 rounded-full bg-fg"
                  />
                )}
              </li>
            );
          })}
        </ul>
      </div>
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-[-1px] h-px origin-left bg-fg"
        initial={false}
        animate={{ scaleX: active ? (index + 1) / LOCAL_SECTIONS.length : 0 }}
        transition={{ duration: 0.6, ease: EASE }}
      />
    </nav>
  );
}
