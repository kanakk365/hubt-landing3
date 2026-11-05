"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Opening block for the inner pages, on black: the title rising line by line
 * out of a mask, then the lede and actions. A faint drafting grid and corner marks sit behind it.
 */
export function PageHero({
  title,
  lede,
  actions,
  aside,
  align = "left",
  className,
  children,
}: {
  /** e.g. ["02", "Products"] */
  /** One entry per line; each line rises out of its own mask. */
  title: React.ReactNode[];
  lede?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  children?: React.ReactNode;
}) {
  const reduce = !!useReducedMotion();
  const center = align === "center" && !aside;
  const lines = title.length;

  return (
    <section data-nav-tone="dark" className={cn("tone-dark relative isolate overflow-hidden pb-20 pt-[9.5rem] md:pb-28 md:pt-[11.5rem]", className)}>
      <DraftingGrid />

      <div className={cn("container-site grid grid-cols-1 gap-14", aside && "lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-end")}>
        {/* Sized to its column (cqi) so each title line holds on one line. */}
        <div className={cn("@container flex min-w-0 flex-col", center && "items-center text-center")}>

          <h1 className="font-display text-[clamp(2.5rem,7cqi,6rem)] font-[400] leading-[0.98] tracking-[-0.045em] text-fg [font-stretch:110%]">
            {title.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.08em]">
                <motion.span
                  className={cn("block", i === lines - 1 && lines > 1 && "text-fg-subtle")}
                  initial={reduce ? false : { y: "108%", rotate: 2 }}
                  animate={{ y: "0%", rotate: 0 }}
                  transition={{ duration: 1.05, ease: EASE, delay: 0.15 + i * 0.09 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {lede && (
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.35 + lines * 0.09 }}
              className="mt-8 max-w-[56ch] text-lg leading-relaxed text-fg-muted md:text-xl md:leading-relaxed"
            >
              {lede}
            </motion.p>
          )}
          {actions && (
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 + lines * 0.09 }}
              className={cn("mt-10 flex flex-wrap items-center gap-3", center && "justify-center")}
            >
              {actions}
            </motion.div>
          )}
        </div>
        {aside && (
          <motion.div
            className="min-w-0"
            initial={reduce ? false : { opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: EASE, delay: 0.4 }}
          >
            {aside}
          </motion.div>
        )}
      </div>
      {children}
    </section>
  );
}

/** A faint drafting grid with corner marks, fading out toward the edges. */
export function DraftingGrid({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", className)}>
      <div
        className="absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,black,transparent)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.06) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.06) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
          backgroundPosition: "center top",
        }}
      />
      <div className="container-site relative h-full">
        <span className="absolute left-6 top-[104px] size-4 border-l border-t border-line-strong md:left-8" />
        <span className="absolute right-6 top-[104px] size-4 border-r border-t border-line-strong md:right-8" />
      </div>
    </div>
  );
}
