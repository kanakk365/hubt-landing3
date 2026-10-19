"use client";

import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "framer-motion";
import React, { useRef } from "react";
import { SectionHeading, TextLink } from "@/components/site/SectionHeading";
import { ENGAGEMENT } from "@/lib/site";

/** How an engagement runs: one line from Discover to Run, filled by the scroll. */
export function ProcessLine() {
  const reduce = !!useReducedMotion();
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.8", "end 0.6"] });
  const fill = useTransform(scrollYProgress, [0, 0.92], [0, 1]);

  return (
    <section id="process" data-nav-tone="dark" aria-labelledby="process-title" className="tone-dark scroll-mt-0">
      <div className="container-site py-24 md:py-36">
        <SectionHeading
          id="process-title"
          title={
            <>
              How an engagement runs, <span className="text-fg-subtle">from the first call to a system that keeps working.</span>
            </>
          }
          action={<TextLink href="/capabilities#engagement">Our process</TextLink>}
        />

        <div className="relative mt-16 md:mt-24">
          {/* The line: horizontal across six columns at lg, a left rail below */}
          <div aria-hidden className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-line lg:hidden">
            <motion.div className="size-full origin-top bg-fg" style={reduce ? undefined : { scaleY: fill }} />
          </div>
          <div aria-hidden className="absolute left-0 top-[5px] hidden h-px w-full bg-line lg:block">
            <motion.div className="size-full origin-left bg-fg" style={reduce ? undefined : { scaleX: fill }} />
          </div>

          <ol ref={list} className="grid gap-12 lg:grid-cols-6 lg:gap-8">
            {ENGAGEMENT.map((step, i) => (
              <Step
                key={step.title}
                index={i}
                total={ENGAGEMENT.length}
                title={step.title}
                description={step.description}
                progress={fill}
                still={reduce}
              />
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

function Step({
  index,
  total,
  title,
  description,
  progress,
  still,
}: {
  index: number;
  total: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const at = index / (total - 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.12), at], [0, 1]);
  const opacity = useTransform(lit, [0, 1], [0.32, 1]);

  return (
    <li className="relative pl-9 lg:pl-0 lg:pt-12">
      <span
        aria-hidden
        className="absolute left-0 top-1 grid size-[11px] place-items-center rounded-full border border-line-strong bg-bg lg:top-0"
      >
        <motion.span className="size-[5px] rounded-full bg-fg" style={still ? undefined : { scale: lit, opacity: lit }} />
      </span>
      <motion.div style={still ? undefined : { opacity }}>
        <span className="font-mono text-[0.6875rem] tabular-nums text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display mt-3 text-[1.5rem] font-[480] tracking-[-0.03em] text-fg [font-stretch:104%] lg:mt-5">
          {title}
        </h3>
        <p className="mt-3 max-w-[40ch] text-[0.9375rem] leading-relaxed text-fg-muted lg:text-[0.875rem]">{description}</p>
      </motion.div>
    </li>
  );
}
