"use client";

import {
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import {
  AppWindow,
  BarChart3,
  Bot,
  BrainCircuit,
  Database,
  FileStack,
  FlaskConical,
  Radio,
  ScanEye,
  Search,
  Smartphone,
} from "lucide-react";
import React, { useRef, useState } from "react";
import { SectionIntro } from "./SectionIntro";
import { cn } from "@/lib/utils";

type Node = { title: string; sub: string; icon: React.ComponentType<{ className?: string }> };

const TIERS: { label: string; engine?: boolean; nodes: Node[] }[] = [
  {
    label: "Inputs",
    nodes: [
      { title: "Business data", sub: "Databases, CRMs, spreadsheets", icon: Database },
      { title: "Documents and media", sub: "PDFs, video, images, audio", icon: FileStack },
      { title: "Live signals", sub: "Events, sensors, streams", icon: Radio },
    ],
  },
  {
    label: "AI engine",
    engine: true,
    nodes: [
      { title: "Retrieval and context", sub: "What the model may see", icon: Search },
      { title: "Foundation models", sub: "Selected per task", icon: BrainCircuit },
      { title: "Custom ML and vision", sub: "Trained on your data", icon: ScanEye },
      { title: "Evaluation harness", sub: "Tests every change", icon: FlaskConical },
    ],
  },
  {
    label: "Interfaces",
    nodes: [
      { title: "Web apps", sub: "Portals and platforms", icon: AppWindow },
      { title: "Mobile apps", sub: "iOS and Android", icon: Smartphone },
      { title: "Agents and automations", sub: "Act inside permissions", icon: Bot },
      { title: "Dashboards and reports", sub: "For the people deciding", icon: BarChart3 },
    ],
  },
];

/** Index of each tier's first node in the overall lighting order. */
const STARTS = TIERS.map((_, t) => TIERS.slice(0, t).reduce((n, x) => n + x.nodes.length, 0));

/** Where along the scroll each tier lights and each connector draws. */
const LIT = [0.04, 0.42, 0.8];
const WIRE: [number, number][] = [
  [0.12, 0.38],
  [0.5, 0.76],
];

/**
 * The shape every system follows, on black. As the diagram scrolls through,
 * the inputs light, their wires draw down into the engine, the engine's parts
 * come on one by one, and the result wires out to the interfaces. Once a wire
 * is drawn, packets keep running along it.
 */
export function AiArchitecture() {
  const reduce = !!useReducedMotion();
  const diagram = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: diagram, offset: ["start 0.8", "end 0.65"] });
  const p = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0001 });
  const [lit, setLit] = useState(reduce ? 99 : -1);
  useMotionValueEvent(p, "change", (v) => {
    if (reduce) return;
    // Count of nodes lit, across all tiers in order.
    let n = 0;
    TIERS.forEach((t, ti) => {
      const span = ti === 2 ? 0.16 : 0.08;
      t.nodes.forEach((_, ni) => {
        if (v >= LIT[ti] + (ni / t.nodes.length) * span) n++;
      });
    });
    setLit((l) => (l === n ? l : n));
  });

  return (
    <section data-nav-tone="dark" aria-labelledby="architecture-title" className="tone-dark relative overflow-hidden">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="architecture-title"
          title={["From the data you have", "to the interfaces people use."]}
          lede="Every system we build follows the same shape. Your information is gathered and permissioned, an engine reasons over it and is tested on every change, and the result reaches people through software they already use."
          split
        />

        <div ref={diagram} className="mt-16 flex flex-col md:mt-24">
          {TIERS.map((tier, t) => (
            <React.Fragment key={tier.label}>
              <Tier tier={tier} litCount={Math.max(0, Math.min(tier.nodes.length, lit - STARTS[t]))} />
              {t < TIERS.length - 1 && <Wire sources={tier.nodes.length} p={p} range={WIRE[t]} still={reduce} />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tier({ tier, litCount }: { tier: (typeof TIERS)[number]; litCount: number }) {
  const on = litCount > 0;
  return (
    <div
      className={cn(
        "relative rounded-[24px] border p-2 pt-10 transition-[border-color,background-color,box-shadow] duration-700",
        tier.engine
          ? on
            ? "border-signal/40 bg-fg/[0.025] shadow-[inset_0_1px_0_oklch(1_0_0/0.08)]"
            : "border-line bg-transparent"
          : on
            ? "border-dashed border-fg/30 bg-fg/[0.015]"
            : "border-dashed border-line bg-transparent"
      )}
    >
      <span
        className={cn(
          "absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 rounded-full border px-4 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.18em] transition-colors duration-500",
          tier.engine && on ? "border-signal bg-signal text-black" : "border-line-strong bg-black text-fg-muted"
        )}
      >
        {tier.label}
      </span>
      <ul className={cn("grid grid-cols-1 sm:grid-cols-2", tier.nodes.length === 3 ? "md:grid-cols-3" : "md:grid-cols-4")}>
        {tier.nodes.map((n, i) => {
          const lit = i < litCount;
          return (
            <li key={n.title} className="p-1.5">
              <div
                className={cn(
                  "flex h-full items-center gap-3.5 rounded-[16px] border px-4 py-4 transition-[border-color,background-color,opacity,transform] duration-700 ease-[var(--ease-out-expo)]",
                  lit ? "translate-y-0 border-line-strong bg-fg/[0.04] opacity-100" : "translate-y-1 border-line bg-transparent opacity-45"
                )}
              >
                <span
                  className={cn(
                    "inline-flex size-10 shrink-0 items-center justify-center rounded-[11px] border transition-colors duration-500",
                    lit && tier.engine ? "border-signal bg-signal text-black" : lit ? "border-line-strong text-signal" : "border-line text-fg-subtle"
                  )}
                >
                  <n.icon className="size-[18px]" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[0.9375rem] font-semibold tracking-[-0.015em] text-fg">{n.title}</span>
                  <span className="block text-[0.8125rem] text-fg-subtle">{n.sub}</span>
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/**
 * A bus from n evenly spaced sources down into the next tier, drawn from the
 * sources inward: drops, then the bar closing on the centre, then the stem.
 */
function Wire({ sources, p, range, still }: { sources: number; p: MotionValue<number>; range: [number, number]; still: boolean }) {
  const [a, b] = range;
  const m1 = a + (b - a) * 0.4;
  const m2 = a + (b - a) * 0.75;
  const drop = useTransform(p, [a, m1], [0, 1], { clamp: true });
  const bar = useTransform(p, [m1, m2], [0, 1], { clamp: true });
  const stem = useTransform(p, [m2, b], [0, 1], { clamp: true });
  const live = useTransform(p, [b, b + 0.02], [0, 1], { clamp: true });
  const whole = useTransform(p, [a, b], [0, 1], { clamp: true });
  const xs = Array.from({ length: sources }, (_, i) => ((i + 0.5) / sources) * 100);
  const left = xs[0];
  const right = 100 - xs[xs.length - 1];
  const s = (mv: MotionValue<number>) => (still ? 1 : mv);

  return (
    <div aria-hidden className="relative mx-2 h-20 md:h-24">
      {/* desktop: the full bus */}
      <div className="absolute inset-0 hidden md:block">
        {xs.map((x) => (
          <div key={x} className="absolute top-0 h-1/2 w-px bg-line" style={{ left: `${x}%` }}>
            <motion.div className="absolute inset-0 origin-top bg-signal/70" style={{ scaleY: s(drop) }} />
            <motion.span style={{ opacity: s(live) }} className="absolute left-1/2 top-0 size-[5px] -translate-x-1/2 animate-[drip_1.6s_linear_infinite] rounded-full bg-signal" />
          </div>
        ))}
        <div className="absolute top-1/2 h-px bg-line" style={{ left: `${left}%`, right: `${right}%` }}>
          <motion.div className="absolute inset-y-0 left-0 w-1/2 origin-left bg-signal/70" style={{ scaleX: s(bar) }} />
          <motion.div className="absolute inset-y-0 right-0 w-1/2 origin-right bg-signal/70" style={{ scaleX: s(bar) }} />
        </div>
        <div className="absolute bottom-0 left-1/2 h-1/2 w-px bg-line">
          <motion.div className="absolute inset-0 origin-top bg-signal" style={{ scaleY: s(stem) }} />
          <motion.span style={{ opacity: s(live) }} className="absolute left-1/2 top-0 size-[5px] -translate-x-1/2 animate-[drip_1.2s_linear_infinite] rounded-full bg-signal" />
        </div>
      </div>
      {/* phones: one stem */}
      <div className="absolute inset-y-0 left-1/2 w-px bg-line md:hidden">
        <motion.div className="absolute inset-0 origin-top bg-signal" style={{ scaleY: s(whole) }} />
      </div>
    </div>
  );
}
