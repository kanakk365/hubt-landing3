"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import React, { useState } from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { Reveal } from "@/components/site/Reveal";
import { COMPARISON, GUARANTEES } from "@/lib/localAi";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { EASE, Segmented } from "./kit";

/** Four guarantees as ruled rows: a drawing that draws itself in, the promise, then the detail. */
export function Guarantees() {
  return (
    <section id="models" data-nav-tone="dark" aria-labelledby="models-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="models-title"
          title={["Four guarantees", "cloud AI cannot match."]}
          lede="Stop choosing between locking down your company data and giving your team the smartest AI tools on Earth."
          split
        />
        <ul className="mt-16 border-t border-line md:mt-24">
          {GUARANTEES.map((g) => (
            <Reveal
              as="li"
              key={g.key}
              className="grid gap-6 border-b border-line py-10 md:grid-cols-[10rem_minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-12 md:py-14"
            >
              <Glyph k={g.key} />
              <h3 className="font-display text-balance text-[clamp(1.6rem,1rem+1.2vw,2.25rem)] font-[440] leading-[1.04] tracking-[-0.035em] text-fg [font-stretch:106%]">
                {g.title}
              </h3>
              <div>
                <p className="max-w-[56ch] text-[1.0625rem] leading-relaxed text-fg-muted">{g.body}</p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2">
                  {g.foot.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-[0.875rem] text-fg">
                      <span className="size-1.5 rounded-full bg-signal" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}

type Mode = "cloud" | "hybrid";

/** The same four questions, answered by cloud-only AI and by the local-first hybrid, as ruled rows. */
export function HybridCompare() {
  const [mode, setMode] = useState<Mode>("hybrid");
  const rows = COMPARISON[mode];
  const bad = mode === "cloud";
  return (
    <section id="why-hybrid" data-nav-tone="dark" aria-labelledby="hybrid-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="hybrid-title"
          title={["Cloud-only AI", "against a local-first hybrid."]}
          lede="Switch between the two to see what happens to your company secrets, your accuracy and your budget under each."
          split
          action={
            <Segmented
              label="Architecture"
              value={mode}
              onChange={setMode}
              tone={bad ? "danger" : "signal"}
              className="-ml-4"
              options={[
                { key: "cloud", label: "Standard cloud AI" },
                { key: "hybrid", label: "Local-first hybrid" },
              ]}
            />
          }
        />
        <dl aria-label="Company data that leaves the building" className="mt-16 grid gap-6 md:mt-24">
          {(
            [
              ["cloud", "Standard cloud AI", "100%", 1],
              ["hybrid", "Local-first hybrid", "0.00%", 0.006],
            ] as const
          ).map(([k, label, value, to]) => {
            const on = k === mode;
            const risky = k === "cloud";
            return (
              <div
                key={k}
                className={cn(
                  "grid items-center gap-x-8 gap-y-3 transition-opacity duration-500 md:grid-cols-[12rem_minmax(0,1fr)_7rem]",
                  on ? "opacity-100" : "opacity-35"
                )}
              >
                <dt className="text-[1rem] text-fg">{label}</dt>
                <div aria-hidden className="relative h-2 overflow-hidden rounded-full bg-fg/[0.07]">
                  <motion.div
                    className={cn("absolute inset-y-0 left-0 rounded-full", risky ? "bg-rose" : "bg-signal")}
                    initial={{ width: "0%" }}
                    whileInView={{ width: `${to * 100}%` }}
                    viewport={{ once: true, amount: 0.8 }}
                    transition={{ duration: 1.2, ease: EASE, delay: risky ? 0 : 0.2 }}
                  />
                </div>
                <dd
                  className={cn(
                    "font-display text-[clamp(1.75rem,1.2rem+1.4vw,2.75rem)] font-[400] leading-none tracking-[-0.04em] tabular-nums md:text-right",
                    risky ? "text-rose" : "text-signal"
                  )}
                >
                  {value}
                </dd>
              </div>
            );
          })}
          <p className="text-[0.875rem] text-fg-subtle">Share of company data that leaves the building, under each architecture.</p>
        </dl>

        <ol className="mt-14 border-t border-line" aria-live="polite">
          {rows.map((r, i) => (
            <li key={r.label} className="grid gap-3 border-b border-line py-8 md:grid-cols-[2.5rem_minmax(0,0.8fr)_minmax(0,1.2fr)] md:items-baseline md:gap-8">
              <span className="font-mono text-[0.8125rem] tabular-nums text-fg-subtle">0{i + 1}</span>
              <span className="text-[1rem] text-fg-muted">{r.label}</span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={mode}
                  initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
                  transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
                  className="flex items-start gap-4"
                >
                  <span
                    className={cn(
                      "mt-2 grid size-5 shrink-0 place-items-center rounded-full",
                      bad ? "border border-rose/50 text-rose" : "bg-signal text-black"
                    )}
                  >
                    {bad ? <X className="size-3" strokeWidth={3} /> : <Check className="size-3" strokeWidth={3} />}
                  </span>
                  <span>
                    <span className="block font-display text-[clamp(1.375rem,1rem+0.8vw,1.875rem)] font-[440] leading-tight tracking-[-0.03em] text-fg [font-stretch:104%]">
                      {r.value}
                    </span>
                    <span className="mt-2 block text-[1rem] leading-relaxed text-fg-muted">{r.desc}</span>
                  </span>
                </motion.span>
              </AnimatePresence>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ── A drawing for each guarantee, drawn in as it scrolls into view ───── */

const STROKE = "oklch(1 0 0 / 0.55)";
const SIGNAL = "oklch(0.82 0.17 152)";

function Glyph({ k }: { k: (typeof GUARANTEES)[number]["key"] }) {
  const reduce = useReducedMotion();
  const draw = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, amount: 0.6 },
          transition: { duration: 1.1, ease: EASE, delay },
        };
  const pop = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { scale: 0, opacity: 0 },
          whileInView: { scale: 1, opacity: 1 },
          viewport: { once: true, amount: 0.6 },
          transition: { type: "spring" as const, stiffness: 420, damping: 22, delay },
        };
  return (
    <svg viewBox="0 0 160 88" className="h-[5.5rem] w-40 shrink-0 overflow-visible" fill="none" aria-hidden>
      {k === "brains" && (
        <>
          <motion.rect x="52" y="16" width="56" height="56" rx="10" stroke={STROKE} strokeWidth="1.25" {...draw()} />
          <motion.rect x="66" y="30" width="28" height="28" rx="5" stroke={SIGNAL} strokeWidth="1.5" {...draw(0.3)} />
          {[26, 38, 50, 62].map((y, i) => (
            <React.Fragment key={y}>
              <motion.path d={`M38 ${y}h14`} stroke={STROKE} strokeWidth="1.25" {...draw(0.5 + i * 0.06)} />
              <motion.path d={`M108 ${y}h14`} stroke={STROKE} strokeWidth="1.25" {...draw(0.5 + i * 0.06)} />
            </React.Fragment>
          ))}
          <motion.circle cx="80" cy="44" r="4" fill={SIGNAL} {...pop(0.9)} />
        </>
      )}
      {k === "workforce" && (
        <>
          {[20, 60, 100, 140].map((x, i) => (
            <React.Fragment key={x}>
              <motion.circle cx={x} cy="18" r="6" stroke={i === 0 ? SIGNAL : STROKE} strokeWidth="1.25" {...draw(i * 0.08)} />
              <motion.path d={`M${x} 26v26`} stroke={i === 0 ? SIGNAL : STROKE} strokeWidth="1.25" strokeDasharray="2 3" {...draw(0.3 + i * 0.08)} />
              <motion.path d={`M${x - 11} 56h8l3 4h11v18h-22z`} stroke={STROKE} strokeWidth="1.25" strokeLinejoin="round" {...draw(0.5 + i * 0.08)} />
            </React.Fragment>
          ))}
          <motion.path d="M26 30 L92 52" stroke="oklch(0.72 0.17 12)" strokeWidth="1.25" strokeDasharray="2 3" {...draw(1)} />
          <motion.path d="M54 34l8 8m0-8l-8 8" stroke="oklch(0.72 0.17 12)" strokeWidth="1.5" strokeLinecap="round" {...draw(1.3)} />
        </>
      )}
      {k === "verify" && (
        <>
          {[14, 44, 74].map((y, i) => (
            <React.Fragment key={y}>
              <motion.circle cx="18" cy={y} r="7" stroke={STROKE} strokeWidth="1.25" {...draw(i * 0.1)} />
              <motion.path d={`M26 ${y} C 70 ${y}, 80 44, 118 44`} stroke={SIGNAL} strokeOpacity="0.7" strokeWidth="1.25" {...draw(0.3 + i * 0.1)} />
            </React.Fragment>
          ))}
          <motion.circle cx="132" cy="44" r="14" stroke={SIGNAL} strokeWidth="1.5" {...draw(0.8)} />
          <motion.path d="M125 44l5 5 9-10" stroke={SIGNAL} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...draw(1.1)} />
        </>
      )}
      {k === "proof" && (
        <>
          {[0, 1, 2, 3].map((i) => (
            <React.Fragment key={i}>
              <motion.rect x={4 + i * 40} y="30" width="30" height="28" rx="5" stroke={i === 3 ? SIGNAL : STROKE} strokeWidth="1.25" {...draw(i * 0.18)} />
              <motion.path d={`M${10 + i * 40} 40h18M${10 + i * 40} 48h12`} stroke={i === 3 ? SIGNAL : STROKE} strokeWidth="1.25" {...draw(0.2 + i * 0.18)} />
              {i < 3 && <motion.path d={`M${34 + i * 40} 44h10`} stroke={SIGNAL} strokeWidth="1.5" {...draw(0.35 + i * 0.18)} />}
            </React.Fragment>
          ))}
          <motion.circle cx="149" cy="22" r="5" fill={SIGNAL} {...pop(1)} />
        </>
      )}
    </svg>
  );
}
