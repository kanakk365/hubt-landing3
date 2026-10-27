"use client";

import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import Image from "next/image";
import React, { useRef, useState } from "react";
import { AthleteScene } from "@/components/scenes/AthleteScene";
import { ProductFrame } from "@/components/site/ProductFrame";
import { SectionIntro } from "./SectionIntro";
import { cn } from "@/lib/utils";

const IMG = "/static/landing-page/projects";

const STEPS = [
  { title: "Video in", description: "Training and match footage is captured and passed to the analysis pipeline." },
  {
    title: "Movement analysis",
    description: "Computer vision breaks down form and technique and compares it with elite benchmarks.",
  },
  {
    title: "Risk flags",
    description: "Inefficient movement patterns are flagged as potential injury risks before they become injuries.",
  },
  {
    title: "Shared with clinicians",
    description: "Reports go to on-site physical therapists and medical partners, who turn them into improvement plans.",
  },
];

/**
 * Connected Athlete as the whole shape in one product, on black. A spine
 * fills down the four steps as they scroll past and lights each in turn; the
 * recreated interface and the real screen drift at different speeds.
 */
export function AiInProduction() {
  const reduce = !!useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress: steps } = useScroll({ target: list, offset: ["start 0.7", "end 0.45"] });
  const fill = useSpring(steps, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0001 });
  const [lit, setLit] = useState(reduce ? STEPS.length : 0);
  useMotionValueEvent(fill, "change", (v) => {
    if (reduce) return;
    const n = Math.min(STEPS.length, Math.floor(v * STEPS.length + 0.35));
    setLit((l) => (l === n ? l : n));
  });

  const { scrollYProgress: pass } = useScroll({ target: section, offset: ["start end", "end start"] });
  const drift = useSpring(pass, { stiffness: 90, damping: 24, mass: 0.5 });
  const backY = useTransform(drift, [0, 1], [60, -60]);
  const frontY = useTransform(drift, [0, 1], [150, -150]);
  const frontRotate = useTransform(drift, [0, 1], [3, -2]);

  return (
    <section
      ref={section}
      id="in-production"
      data-nav-tone="dark"
      aria-labelledby="in-production-title"
      className="tone-dark scroll-mt-[72px] overflow-hidden"
    >
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="in-production-title"
          title={["In production:", "Connected Athlete."]}
          lede="An AI performance and health platform we built end to end. It shows the whole shape in one product: inputs, a vision model, evaluation and an interface people act on."
          split
        />

        <div className="mt-16 grid gap-16 md:mt-24 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20">
          <ol ref={list} className="relative flex flex-col gap-12 pl-12 lg:py-10">
            <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-px bg-line">
              <motion.span className="absolute inset-0 origin-top bg-signal" style={{ scaleY: reduce ? 1 : fill }} />
            </span>
            {STEPS.map((s, i) => {
              const on = i < lit;
              return (
                <li key={s.title} className="relative">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute -left-12 top-0 flex size-[31px] items-center justify-center rounded-full border font-mono text-[0.6875rem] tabular-nums transition-colors duration-500",
                      on ? "border-signal bg-signal text-black" : "border-line-strong bg-black text-fg-subtle"
                    )}
                  >
                    {i + 1}
                  </span>
                  <div className={cn("transition-[opacity,transform] duration-700 ease-[var(--ease-out-expo)]", on ? "translate-x-0 opacity-100" : "translate-x-2 opacity-40")}>
                    <h3 className="font-display text-[1.375rem] font-[460] leading-tight tracking-[-0.03em] text-fg [font-stretch:104%]">
                      {s.title}
                    </h3>
                    <p className="mt-2 max-w-[44ch] text-[0.9375rem] leading-relaxed text-fg-muted">{s.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="relative pb-24 sm:pb-36">
            <motion.div style={reduce ? undefined : { y: backY }}>
              <ProductFrame label="Connected Athlete" meta="interface recreation" screenClassName="aspect-[5/4]">
                <AthleteScene />
              </ProductFrame>
            </motion.div>
            <motion.div
              style={reduce ? undefined : { y: frontY, rotate: frontRotate }}
              className="absolute -bottom-2 right-[-4%] hidden w-[52%] sm:block"
            >
              <ProductFrame label="Real screen" meta="health dashboard" glow={false} demo={false} screenClassName="aspect-[767/580]">
                <Image
                  src={`${IMG}/connected-athlete-dashboard.png`}
                  alt="Connected Athlete health dashboard with activity gauges and a resting heart rate chart"
                  fill
                  sizes="(min-width: 1024px) 340px, 50vw"
                  className="object-cover object-top"
                />
              </ProductFrame>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
