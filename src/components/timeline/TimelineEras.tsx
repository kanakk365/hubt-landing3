"use client";

import { motion } from "framer-motion";
import React from "react";
import { SectionIntro } from "@/components/site/SectionIntro";
import { ERAS, FIRST_YEAR, TIMELINE } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { scrollToChapter } from "./TimelineChapters";

const EXPO = [0.16, 1, 0.3, 1] as const;
const ROW = "grid grid-cols-[8.5rem_minmax(0,1fr)] items-center md:grid-cols-[14rem_minmax(0,1fr)]";

/**
 * Every company on one axis from 2002 to now, where they ran side by side.
 * The bars draw in left to right when the chart arrives, and each row jumps to
 * its chapter.
 */
export function TimelineEras({ now }: { now: number }) {
  const reduce = useReducedMotion();
  const span = now - FIRST_YEAR;
  const pct = (y: number) => ((y - FIRST_YEAR) / span) * 100;
  const ticks = [2002, 2006, 2010, 2014, 2018, 2022].filter((y) => y < now - 1);
  const view = { once: true, amount: 0.4 } as const;

  return (
    <section id="eras" data-nav-tone="dark" aria-labelledby="eras-title" className="relative pb-14 pt-24 md:pb-16 md:pt-32">
      <div className="container-site">
        <SectionIntro
          id="eras-title"
          split
          title={["The whole line,", `${FIRST_YEAR} to now.`]}
          lede="Data Treasury and Zaah both started in 2002, and ICONIC Motors and VEEDIMS ran side by side from 2009. Pick a company to go straight to its chapter."
        />

        <figure aria-labelledby="eras-caption" className="mt-16 md:mt-20">
          <figcaption id="eras-caption" className="sr-only">
            The companies behind HubTech by year, from {FIRST_YEAR} to now. Each row links to its chapter.
          </figcaption>
          <div className="relative">
            {/* Year lines behind the rows, and the present in green */}
            <div aria-hidden className={cn(ROW, "pointer-events-none absolute inset-0")}>
              <span />
              <span className="relative h-full">
                {ticks.map((y) => (
                  <span key={y} className="absolute inset-y-0 w-px bg-line/70" style={{ left: `${pct(y)}%` }} />
                ))}
                <span className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-signal/0 via-signal/50 to-signal/0" />
              </span>
            </div>

            <ol className="relative border-t border-line">
              {ERAS.map((e, i) => (
                <motion.li
                  key={e.id}
                  className="border-b border-line"
                  initial={reduce ? false : { opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={view}
                  transition={{ duration: 0.7, ease: EXPO, delay: 0.05 + i * 0.07 }}
                >
                  <a
                    href={`#${e.id}`}
                    onClick={(ev) => {
                      ev.preventDefault();
                      scrollToChapter(
                        TIMELINE.findIndex((c) => c.id === e.id),
                        reduce
                      );
                    }}
                    className={cn(
                      ROW,
                      "group py-4 outline-none transition-colors duration-300 hover:bg-white/[0.025] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal/60 md:py-5"
                    )}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5 pr-4 md:flex-row md:items-baseline md:gap-3">
                      <span className="truncate text-[0.9375rem] font-medium text-fg-muted transition-colors duration-300 group-hover:text-fg md:text-base">
                        {e.company}
                      </span>
                      <span className="text-[0.75rem] tabular-nums text-fg-subtle md:text-[0.8125rem]">
                        {e.from}–{String(e.to).slice(2)}
                      </span>
                    </span>
                    <span className="relative h-6">
                      <motion.span
                        className="absolute top-[calc(50%-4px)] h-2 origin-left rounded-full bg-fg/85 transition-colors duration-300 group-hover:bg-signal group-focus-visible:bg-signal"
                        style={{ left: `${pct(e.from)}%`, width: `${pct(e.to) - pct(e.from)}%` }}
                        initial={reduce ? false : { scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={view}
                        transition={{ duration: 1.2, ease: EXPO, delay: 0.15 + i * 0.09 }}
                      />
                    </span>
                  </a>
                </motion.li>
              ))}
              <motion.li
                className="border-b border-line"
                initial={reduce ? false : { opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={view}
                transition={{ duration: 0.7, ease: EXPO, delay: 0.05 + ERAS.length * 0.07 }}
              >
                <a
                  href="#now"
                  onClick={(ev) => {
                    const el = document.getElementById("now");
                    if (!el) return;
                    ev.preventDefault();
                    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
                  }}
                  className={cn(
                    ROW,
                    "group py-4 outline-none transition-colors duration-300 hover:bg-white/[0.025] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal/60 md:py-5"
                  )}
                >
                  <span className="text-[0.9375rem] font-medium text-fg md:text-base">HubTech</span>
                  <span className="relative h-6">
                    <motion.span
                      className="absolute right-0 top-1/2 flex -translate-y-1/2 translate-x-[5px] items-center gap-2.5"
                      initial={reduce ? false : { opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={view}
                      transition={{ duration: 0.6, delay: 0.15 + ERAS.length * 0.09 + 0.4 }}
                    >
                      <span className="text-[0.8125rem] font-medium text-fg transition-colors group-hover:text-signal">Now</span>
                      <span className="relative flex size-[10px]">
                        <span className="absolute inset-0 animate-ping rounded-full bg-signal/60 motion-reduce:hidden" />
                        <span className="relative size-[10px] rounded-full bg-signal" />
                      </span>
                    </motion.span>
                  </span>
                </a>
              </motion.li>
            </ol>
          </div>

          {/* Axis */}
          <div aria-hidden className={cn(ROW, "mt-3")}>
            <span />
            <span className="relative h-4 text-[0.75rem] tabular-nums text-fg-subtle">
              {ticks.map((y, i) => (
                <span key={y} className={cn("absolute -translate-x-1/2", i % 2 === 1 && "max-sm:hidden")} style={{ left: `${pct(y)}%` }}>
                  {y}
                </span>
              ))}
            </span>
          </div>
        </figure>
      </div>
    </section>
  );
}
