"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { useRef } from "react";
import { SectionIntro } from "@/components/site/SectionIntro";
import { PRINCIPLES } from "@/lib/site";

/**
 * How HubTech decides what to build, on white. Each principle is set large in
 * a pale grey and inks in as it rises to the middle of the screen, its reason
 * sliding in beside it.
 */
export function AiPrinciples() {
  return (
    <section id="principles" data-nav-tone="light" aria-labelledby="principles-title" className="tone-light scroll-mt-[72px]">
      <div className="container-site pb-10 pt-24 md:pb-16 md:pt-36">
        <SectionIntro
          id="principles-title"
          index="07"
          label="Principles"
          title={["How we decide", "what to build."]}
          lede="Six principles behind every AI engagement. They are why some of our recommendations are smaller than expected."
          split
        />
        <ol className="mt-14 border-b border-line md:mt-20">
          {PRINCIPLES.map((p, i) => (
            <Row key={p.title} index={i} title={p.title} description={p.description} />
          ))}
        </ol>
      </div>
    </section>
  );
}

function Row({ index, title, description }: { index: number; title: string; description: string }) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 0.92", "start 0.5"] });
  const p = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4, restDelta: 0.0001 });
  const ink = useTransform(p, [0, 1], [0.16, 1]);
  const x = useTransform(p, [0.3, 1], [48, 0]);
  const fade = useTransform(p, [0.4, 1], [0, 1]);
  const rule = useTransform(p, [0, 0.6], [0, 1]);

  return (
    <li ref={ref} className="relative grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-8 md:grid-cols-[4rem_minmax(0,1.9fr)_minmax(0,1fr)] md:items-baseline md:gap-x-10 md:py-9">
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-line">
        <motion.span className="absolute inset-0 origin-left bg-fg/50" style={{ scaleX: reduce ? 1 : rule }} />
      </span>
      <span className="font-mono text-[0.8125rem] tabular-nums text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
      {/* Sized to its column (cqi) so every principle sets on one line, level with its reason. */}
      <div className="@container">
        <motion.h3
          style={reduce ? undefined : { opacity: ink }}
          className="font-display text-[clamp(1.5rem,5.5cqi,3rem)] font-[440] leading-[1.08] tracking-[-0.036em] text-fg [font-stretch:106%]"
        >
          {title}
        </motion.h3>
      </div>
      <motion.p
        style={reduce ? undefined : { x, opacity: fade }}
        className="col-start-2 max-w-[34ch] text-[1rem] leading-relaxed text-fg-muted md:col-start-auto md:text-[1.0625rem]"
      >
        {description}
      </motion.p>
    </li>
  );
}
