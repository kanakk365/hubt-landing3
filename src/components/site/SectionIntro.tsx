"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React from "react";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Section opener: an indexed eyebrow whose rule draws in, a heading that
 * rises line by line out of masks, and an optional lede beside or under it.
 */
export function SectionIntro({
  index,
  label,
  title,
  lede,
  id,
  action,
  split = false,
  className,
}: {
  index?: string;
  label?: string;
  /** One entry per line; the last line is set in the quieter tone when there are several. */
  title: React.ReactNode[];
  lede?: React.ReactNode;
  id?: string;
  action?: React.ReactNode;
  /** Put the lede in a column to the right on wide screens (from 1280px). */
  split?: boolean;
  className?: string;
}) {
  const reduce = !!useReducedMotion();
  const view = { once: true, amount: 0.6 } as const;
  return (
    <div className={className}>
      {/* The eyebrow runs above both columns, so the heading and the lede beside it carry equal weight. */}
      {(index || label) && (
        <div className="mb-7 flex items-center gap-4 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg-subtle">
          {index && <span className="tabular-nums text-fg">{index}</span>}
          <motion.span
            aria-hidden
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={view}
            transition={{ duration: 1, ease: EASE }}
            className="h-px w-12 origin-left bg-line-strong md:w-20"
          />
          {label && <span>{label}</span>}
        </div>
      )}
      <div
        className={cn("grid gap-8", split && "xl:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)] xl:items-end xl:gap-16")}
      >
        {/* Sized to its column (cqi), so each line of the title holds on one line beside the lede. */}
        <div className="@container">
          {/* The heading watches the viewport, not the lines: a line hidden under its mask never counts as in view. */}
          <motion.h2
            id={id}
            initial={reduce ? false : "hidden"}
            whileInView="shown"
            viewport={view}
            className="font-display text-[clamp(2rem,7.8cqi,3.4rem)] font-[440] leading-[1.02] tracking-[-0.04em] text-fg [font-stretch:106%]"
          >
            {title.map((line, i) => (
              <span key={i} className="block overflow-hidden pb-[0.06em]">
                <motion.span
                  className={cn("block", title.length > 1 && i === title.length - 1 && "text-fg-subtle")}
                  variants={{
                    hidden: { y: "105%" },
                    shown: { y: "0%", transition: { duration: 0.95, ease: EASE, delay: i * 0.08 } },
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </motion.h2>
        </div>
        {(lede || action) && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14, filter: "blur(6px)" }}
            whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            viewport={view}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
            className="flex flex-col items-start gap-6"
          >
            {lede && <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-fg-muted md:text-lg">{lede}</p>}
            {action}
          </motion.div>
        )}
      </div>
    </div>
  );
}
