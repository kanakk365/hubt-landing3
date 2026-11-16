"use client";

import { motion } from "framer-motion";
import React from "react";
import { RECORD, TIMELINE } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { scrollToChapter } from "./TimelineChapters";

const EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * The record in six figures, before the line itself: downloads, chart positions, subscribers, patents, customers
 * and awards, each as its chapter gives it. Every figure jumps to the chapter it comes from. The figures settle in
 * once, side by side; nothing counts up.
 */
export function TimelineRecord() {
  const reduce = useReducedMotion();
  const view = { once: true, amount: 0.3 } as const;

  return (
    // No heading of its own: a strip of figures under the opening. The label is for screen readers.
    <section id="record" data-nav-tone="dark" aria-label="The record in figures" className="relative pt-16 md:pt-24">
      <div className="container-site">
        <ul className="grid grid-cols-1 border-t border-line sm:grid-cols-2 lg:grid-cols-3">
          {RECORD.map((r, i) => (
            <motion.li
              key={r.label}
              // Rules between the columns: every cell but the last in its row, two to a row and then three.
              className={cn(
                "border-b border-line",
                i % 2 === 0 ? "sm:border-r" : "sm:border-r-0",
                i % 3 === 2 ? "lg:border-r-0" : "lg:border-r"
              )}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={view}
              transition={{ duration: 0.7, ease: EXPO, delay: 0.05 + i * 0.06 }}
            >
              <a
                href={`#${r.chapter}`}
                onClick={(ev) => {
                  ev.preventDefault();
                  scrollToChapter(
                    TIMELINE.findIndex((c) => c.id === r.chapter),
                    reduce
                  );
                }}
                className="group flex h-full flex-col gap-3 px-1 py-7 outline-none transition-colors duration-300 hover:bg-white/[0.025] focus-visible:bg-white/[0.04] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal/60 sm:px-6 md:py-9"
              >
                <span className="font-display text-[clamp(2.6rem,1.9rem+2.4vw,4rem)] font-[420] leading-none tracking-[-0.045em] text-fg tabular-nums [font-stretch:108%] transition-colors duration-300 group-hover:text-signal">
                  {r.figure}
                </span>
                <span className="max-w-[30ch] text-[0.9375rem] leading-snug text-fg-muted">{r.label}</span>
              </a>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
