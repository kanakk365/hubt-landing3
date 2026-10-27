"use client";

import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { useRef } from "react";
import { PillarFigure } from "@/components/illustrations/AiPlates";
import { SectionIntro } from "./SectionIntro";
import { AI_PILLARS } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";

/**
 * The three ways AI gets built into a business, on white. The three black
 * cards arrive as a cascade: each one travels further than the last and
 * tips upright as it lands, so they settle into line together.
 */
export function AiPillars() {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 768px)");
  const list = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start end", "start 0.25"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4, restDelta: 0.0001 });
  const animate = wide && !reduce;

  return (
    <section id="pillars" data-nav-tone="light" aria-labelledby="pillars-title" className="tone-light">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="pillars-title"
          title={["Three ways AI gets", "built into a business."]}
          lede="AI systems are how a product understands. Agents and automation are how it acts. Evaluation and observability are how you know it works. In practice they overlap, and most programmes need two of them."
          split
        />
        <ul ref={list} className="mt-16 grid gap-4 md:mt-24 md:grid-cols-3 md:gap-5 [perspective:1400px]">
          {AI_PILLARS.map((pillar, i) => (
            <PillarCard key={pillar.id} index={i} pillar={pillar} p={animate ? p : null} />
          ))}
        </ul>
      </div>
    </section>
  );
}

function PillarCard({
  index,
  pillar,
  p,
}: {
  index: number;
  pillar: (typeof AI_PILLARS)[number];
  p: MotionValue<number> | null;
}) {
  const reduce = !!useReducedMotion();
  const fallback = useSpring(1);
  const src = p ?? fallback;
  const y = useTransform(src, [0, 1], [180 + index * 120, 0]);
  const rotateX = useTransform(src, [0, 0.85], [14 + index * 4, 0]);
  const opacity = useTransform(src, [0, 0.5], [0, 1]);

  return (
    <motion.li
      style={p ? { y, rotateX, opacity, transformOrigin: "50% 100%" } : undefined}
      initial={!p && !reduce ? { opacity: 0, y: 30 } : undefined}
      whileInView={!p && !reduce ? { opacity: 1, y: 0 } : undefined}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: index * 0.06 }}
      className="group"
    >
      <article
        className={cn(
          "tokens-dark panel flex h-full flex-col overflow-hidden rounded-[26px] text-fg",
          "transition-[transform,border-color] duration-500 ease-[var(--ease-out-expo)] md:group-hover:-translate-y-1.5 md:group-hover:border-signal/35"
        )}
      >
        <div className="relative aspect-[5/3] border-b border-line">
          <PillarFigure id={pillar.id} />
          <span className="absolute left-5 top-4 font-mono text-[0.6875rem] tabular-nums tracking-[0.2em] text-fg-subtle">
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="@container flex flex-1 flex-col p-7 md:p-8">
          <h3 className="font-display text-[clamp(1.25rem,7.6cqi,1.5rem)] font-[460] leading-tight tracking-[-0.03em] [font-stretch:104%]">{pillar.title}</h3>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">{pillar.description}</p>
          <ul className="mt-auto flex flex-wrap gap-2 pt-7">
            {pillar.tags.map((t) => (
              <li key={t} className="rounded-full border border-line px-3 py-1 text-[0.8125rem] text-fg-muted">
                {t}
              </li>
            ))}
          </ul>
        </div>
      </article>
    </motion.li>
  );
}
