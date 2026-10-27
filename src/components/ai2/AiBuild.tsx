"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Check } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { BuildFigure } from "@/components/illustrations/AiPlates";
import { SectionIntro } from "./SectionIntro";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const ROWS = [
  {
    title: "Assistants that understand context",
    short: "Assistants",
    body: "Customer-facing AI that anticipates needs, answers in the user's language and makes each interaction feel personal, with answers grounded in your own information.",
    points: [
      "Assistants and chat that understand context and cite where answers came from",
      "Multilingual support from modern language models",
      "Experiences that adjust to each user in real time",
    ],
  },
  {
    title: "Insight from the data you already hold",
    short: "Insight",
    body: "Language models and analytics that read large, messy datasets and turn them into decisions your team can act on.",
    points: [
      "Analysis that finds patterns across documents, tables and logs",
      "Models fitted to your business so results are relevant and dependable",
      "Plugged into the systems you already run",
    ],
  },
  {
    title: "Agents and workflow automation",
    short: "Automation",
    body: "Automation for the repetitive work, and agents for the work that needs judgement, with people kept at the control points that matter.",
    points: [
      "Workflows that remove manual steps without removing oversight",
      "Document processing that reads, sorts and routes what arrives",
      "Agents that act only through approved tools and permissions",
    ],
  },
  {
    title: "Custom models and computer vision",
    short: "Vision",
    body: "When a general model isn't enough: models adapted to your domain, and vision systems that turn video into measurements.",
    points: [
      "Transfer learning and fine-tuning for industry-specific tasks",
      "Computer vision for movement, objects and scenes, as in Connected Athlete",
      "Continuous evaluation so accuracy holds after launch",
    ],
  },
];

/**
 * The four kinds of work, on white. On wide screens a black plate holds still
 * beside the reading column and turns to the next drawing as each kind of
 * work reaches the middle of the screen; the others fade back.
 */
export function AiBuild() {
  const [active, setActive] = useState(0);

  return (
    <section data-nav-tone="light" aria-labelledby="ai-build-title" className="tone-light">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="ai-build-title"
          title={["What we build", "with AI."]}
          lede="Four kinds of work make up most AI programmes. Each one is built on the same architecture and the same evaluation discipline."
          split
        />
        <div className="mt-14 grid gap-16 md:mt-20 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:gap-20">
          <ol className="flex flex-col gap-20 lg:gap-0">
            {ROWS.map((row, i) => (
              <Step key={row.title} index={i} row={row} active={active === i} onActive={() => setActive(i)} />
            ))}
          </ol>
          <div className="hidden lg:block">
            <div className="sticky top-[calc(72px+max(5vh,(100dvh-72px-min(72vh,640px))/2))]">
              <Plate active={active} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Step({
  index,
  row,
  active,
  onActive,
}: {
  index: number;
  row: (typeof ROWS)[number];
  active: boolean;
  onActive: () => void;
}) {
  const reduce = !!useReducedMotion();
  const ref = useRef<HTMLLIElement>(null);
  const centred = useInView(ref, { margin: "-45% 0px -45% 0px" });
  useEffect(() => {
    if (centred) onActive();
  }, [centred, onActive]);

  return (
    <li ref={ref} className="lg:flex lg:min-h-[78vh] lg:items-center">
      <div
        className={cn(
          "transition-opacity duration-700 ease-[var(--ease-out-expo)]",
          active ? "lg:opacity-100" : "lg:opacity-30"
        )}
      >
        <div className="tokens-dark panel mb-10 aspect-[5/4] overflow-hidden rounded-[24px] lg:hidden">
          <BuildFigure index={index} />
        </div>
        <span className="font-mono text-[0.75rem] tabular-nums tracking-[0.2em] text-fg-subtle">
          {String(index + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")}
        </span>
        <h3 className="font-display mt-4 max-w-[18ch] text-[clamp(1.75rem,1.2rem+1.4vw,2.5rem)] font-[460] leading-[1.06] tracking-[-0.035em] text-fg [font-stretch:104%]">
          {row.title}
        </h3>
        <p className="mt-5 max-w-[50ch] text-[1.0625rem] leading-relaxed text-fg-muted">{row.body}</p>
        <ul className="mt-8 flex flex-col border-t border-line">
          {row.points.map((p, k) => (
            <motion.li
              key={p}
              initial={reduce ? false : { opacity: 0, x: -14 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.8 }}
              transition={{ duration: 0.6, ease: EASE, delay: k * 0.08 }}
              className="flex gap-3.5 border-b border-line py-4 text-[0.9375rem] leading-relaxed text-fg"
            >
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-signal text-black">
                <Check aria-hidden className="size-3" strokeWidth={3} />
              </span>
              {p}
            </motion.li>
          ))}
        </ul>
      </div>
    </li>
  );
}

/** The held plate: the drawing for the active row, a counter and the four tabs. */
function Plate({ active }: { active: number }) {
  const reduce = !!useReducedMotion();
  return (
    <div className="tokens-dark panel flex h-[min(72vh,640px)] flex-col overflow-hidden rounded-[28px] text-fg">
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <span className="relative h-5 overflow-hidden font-mono text-[0.75rem] uppercase tracking-[0.18em] text-fg-muted">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={active}
              initial={reduce ? false : { y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.5, ease: EASE }}
              className="block"
            >
              {ROWS[active].short}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle">
          {String(active + 1).padStart(2, "0")} / {String(ROWS.length).padStart(2, "0")}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">
        <AnimatePresence initial={false}>
          <motion.div
            key={active}
            initial={reduce ? false : { opacity: 0, scale: 0.96, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.03, filter: "blur(8px)" }}
            transition={{ duration: 0.7, ease: EASE }}
            className="absolute inset-0 flex items-center justify-center p-4"
          >
            <BuildFigure index={active} />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="grid grid-cols-4 gap-2 px-6 pb-5">
        {ROWS.map((r, i) => (
          <span key={r.title} className="relative h-[3px] overflow-hidden rounded-full bg-line">
            <span
              className={cn(
                "absolute inset-0 origin-left rounded-full bg-signal transition-transform duration-700 ease-[var(--ease-out-expo)]",
                i <= active ? "scale-x-100" : "scale-x-0"
              )}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
