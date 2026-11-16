"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { CHAPTERS } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { ChapterScene } from "./ChapterScene";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Scroll to chapter `i`. */
export function scrollToChapter(i: number, reduce: boolean) {
  document.getElementById(CHAPTERS[i].id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * The companies behind HubTech, each told full screen, one after another. While they are on screen, a year index
 * runs down the left edge: a mark for each company, the line filled down to the one you are in, and each mark jumps
 * to its chapter.
 */
export function TimelineChapters() {
  const reduce = !!useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const inside = useInView(section, { margin: "-48% 0px -48% 0px" });
  const [current, setCurrent] = useState(0);

  // The chapter that holds the middle of the screen is the current one.
  useEffect(() => {
    const chapters = CHAPTERS.map((c) => document.getElementById(c.id)).filter((el): el is HTMLElement => !!el);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(chapters.indexOf(entry.target as HTMLElement));
      },
      { rootMargin: "-50% 0px -50% 0px" }
    );
    chapters.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section ref={section} id="chapters" data-nav-tone="dark" aria-labelledby="chapters-title" className="relative pt-24 md:pt-36">
      <div className="container-site text-center">
        <motion.h2
          id="chapters-title"
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={{ once: true, amount: 0.6 }}
          className="font-display text-balance text-[clamp(2rem,1.15rem+2.3vw,3.3rem)] font-[460] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%]"
        >
          {["The companies behind HubTech.", "What each one built."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={cn("block", i === 1 && "text-fg-subtle")}
                variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>
      </div>

      <ol className="mt-10 md:mt-16">
        {CHAPTERS.map((c, i) => (
          <ChapterScene key={c.id} chapter={c} index={i} />
        ))}
      </ol>

      <YearIndex current={current} shown={inside} reduce={reduce} />
    </section>
  );
}

/** The line down the left edge: one mark per company, lit to the current one. Wide screens only. */
function YearIndex({ current, shown, reduce }: { current: number; shown: boolean; reduce: boolean }) {
  const last = CHAPTERS.length - 1;
  return (
    <AnimatePresence>
      {shown && (
        <motion.nav
          aria-label="Companies"
          className="fixed left-4 top-1/2 z-40 hidden -translate-y-1/2 lg:block xl:left-7"
          initial={reduce ? false : { opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.5, ease: EASE }}
        >
          <ol className="relative flex flex-col gap-6">
            <span aria-hidden className="absolute bottom-[7px] left-[5px] top-[7px] w-px bg-white/15" />
            <motion.span
              aria-hidden
              className="absolute left-[5px] top-[7px] w-px origin-top bg-signal shadow-[0_0_10px_oklch(0.82_0.17_152/0.6)]"
              style={{ height: `calc(100% - 14px)` }}
              initial={false}
              animate={{ scaleY: last ? current / last : 1 }}
              transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
            />
            {CHAPTERS.map((c, i) => {
              const on = i === current;
              const past = i <= current;
              return (
                <li key={c.id} className="relative">
                  <button
                    type="button"
                    onClick={() => scrollToChapter(i, reduce)}
                    aria-label={c.company}
                    aria-current={on ? "true" : undefined}
                    className="group flex cursor-pointer items-center gap-3 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                  >
                    <span
                      aria-hidden
                      className={cn(
                        "relative size-[11px] rounded-full border bg-black transition-[border-color,background-color,box-shadow] duration-500",
                        on
                          ? "border-signal bg-signal shadow-[0_0_14px_3px_oklch(0.82_0.17_152/0.55)]"
                          : past
                            ? "border-signal"
                            : "border-white/30 group-hover:border-white/70"
                      )}
                    />
                    <span
                      className={cn(
                        "text-[0.6875rem] font-medium tabular-nums tracking-[0.02em] transition-colors duration-500",
                        on ? "text-white" : "text-white/45 group-hover:text-white/80"
                      )}
                    >
                      {c.marker}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </motion.nav>
      )}
    </AnimatePresence>
  );
}
