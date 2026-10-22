"use client";

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { useRef, useState } from "react";
import { LayerFigure } from "@/components/illustrations/Layers";
import { ANATOMY } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = ANATOMY.length;
const MODEL = 1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
/** How far card i has landed (0 to 1) when the deck reads `s`, from 0 (foundation only) to N - 1. */
const landed = (i: number, s: number) => (i === 0 ? 1 : inOut(clamp((s - (i - 1) - 0.12) / 0.76, 0, 1)));

/**
 * HubTech's AI stance as a stack: the model is one layer of six. On wide
 * screens the section pins and the page stops moving; each scroll step drops
 * the next layer onto the deck, from the foundation up, while the list on the
 * left follows along.
 */
export function AiLayers() {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const pinned = wide && !reduce;
  const section = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const glide = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0001 });
  const s = useTransform(glide, [0.07, 0.93], [0, N - 1], { clamp: true });

  useMotionValueEvent(s, "change", (v) => {
    const next = clamp(Math.round(v), 0, N - 1);
    setActive((a) => (a === next ? a : next));
  });

  return (
    <section
      ref={section}
      id="ai"
      data-nav-tone="dark"
      aria-labelledby="ai-title"
      className="tone-dark relative"
      style={pinned ? { height: "520vh" } : undefined}
    >
      <div className={cn(pinned ? "sticky top-0 h-dvh overflow-hidden pt-[72px]" : "py-24 md:py-36")}>
        <div
          className={cn(
            "container-site grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16 xl:gap-24",
            pinned && "h-full items-center"
          )}
        >
          <div className="flex flex-col">
            <motion.h2
              id="ai-title"
              initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="text-heading max-w-[16ch] text-fg"
            >
              A model is one layer. <span className="text-fg-subtle">We build all six.</span>
            </motion.h2>
            <p className="mt-5 max-w-[46ch] text-[1.0625rem] leading-relaxed text-fg-muted [@media(max-height:780px)]:lg:hidden">
              A demo needs a model. A system your business can rely on also needs the data it may see, the tools it can reach,
              the actions it is allowed to take, and proof that it was right and still is.
            </p>

            {pinned && <LayerList active={active} s={s} />}
          </div>

          {pinned ? (
            <div aria-hidden className="relative h-[min(70vh,620px)] w-full [perspective:1600px]">
              <div className="absolute inset-x-0 bottom-0 top-[76px]">
                {ANATOMY.map((layer, i) => (
                  <DeckCard key={layer.title} index={i} s={s} title={layer.title} description={layer.description} />
                ))}
              </div>
              <DeckCount active={active} />
            </div>
          ) : (
            <ol className="grid gap-4 sm:grid-cols-2" aria-label="The six layers of a production AI system">
              {ANATOMY.map((layer, i) => (
                <motion.li
                  key={layer.title}
                  initial={reduce ? false : { opacity: 0, y: 28 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                  transition={{ duration: 0.7, ease: EASE, delay: (i % 2) * 0.08 }}
                >
                  <LayerCard index={i} title={layer.title} description={layer.description} className="relative" />
                </motion.li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </section>
  );
}

/** The six layers as a reading list: the top card's layer is lit and opens its line. */
function LayerList({ active, s }: { active: number; s: MotionValue<number> }) {
  const fill = useTransform(s, [0, N - 1], [1 / N, 1]);
  return (
    <div className="relative mt-10 pl-6 [@media(max-height:780px)]:mt-7">
      <div aria-hidden className="absolute bottom-2 left-0 top-2 w-px bg-line">
        <motion.div className="h-full origin-top bg-fg" style={{ scaleY: fill }} />
      </div>
      <ol aria-label="The six layers of a production AI system" className="flex flex-col">
        {ANATOMY.map((layer, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={layer.title} className="grid grid-cols-[2.75rem_minmax(0,1fr)] items-baseline py-[0.4rem]">
              <span
                className={cn(
                  "font-display text-[1.125rem] tabular-nums tracking-[-0.02em] transition-colors duration-500 [font-stretch:104%]",
                  on ? "text-fg" : done ? "text-fg-subtle" : "text-fg-subtle/50"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <span
                  className={cn(
                    "font-display block text-[1.25rem] font-[480] leading-tight tracking-[-0.03em] transition-[color,transform] duration-500 ease-[var(--ease-out-expo)] [font-stretch:104%] xl:text-[1.375rem]",
                    on ? "translate-x-1 text-fg" : done ? "text-fg-muted" : "text-fg-subtle/60"
                  )}
                >
                  {layer.title}
                </span>
                <AnimatePresence initial={false}>
                  {on && (
                    <motion.p
                      key="d"
                      initial={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                      animate={{ height: "auto", opacity: 1, filter: "blur(0px)" }}
                      exit={{ height: 0, opacity: 0, filter: "blur(4px)" }}
                      transition={{ duration: 0.45, ease: EASE }}
                      className="overflow-hidden text-[0.9375rem] leading-relaxed text-fg-muted"
                    >
                      <span className="block pb-1 pt-1.5">
                        {layer.description}
                        {i === MODEL && <span className="text-fg"> The only layer a demo shows.</span>}
                      </span>
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

/**
 * One card of the deck. It drops in from above, tilting flat as it lands, and
 * every card that lands after it pushes it back: up, smaller and darker, so
 * the edges of the layers underneath stay in view.
 */
function DeckCard({ index, s, title, description }: { index: number; s: MotionValue<number>; title: string; description: string }) {
  const transform = useTransform(s, (v) => {
    const e = landed(index, v);
    let d = 0;
    for (let j = index + 1; j < N; j++) d += landed(j, v);
    const lift = 1 - e;
    const side = index % 2 ? 1 : -1;
    const y = `calc(${(-118 * lift).toFixed(3)}% - ${(d * 15).toFixed(2)}px)`;
    const rot = side * 8 * lift + side * -0.9 * Math.min(1, d);
    const scale = 1 + 0.05 * lift - 0.05 * d;
    return `translate3d(0, ${y}, 0) rotateX(${(16 * lift).toFixed(2)}deg) rotate(${rot.toFixed(3)}deg) scale(${scale.toFixed(4)})`;
  });
  const opacity = useTransform(s, (v) => {
    const e = landed(index, v);
    let d = 0;
    for (let j = index + 1; j < N; j++) d += landed(j, v);
    // Opaque while still mostly above the deck, so cards never read through each other.
    return Math.min(clamp(e * 5, 0, 1), clamp(4.6 - d, 0, 1));
  });
  const shade = useTransform(s, (v) => {
    let d = 0;
    for (let j = index + 1; j < N; j++) d += landed(j, v);
    return Math.min(0.72, d * 0.2);
  });

  return (
    <motion.div className="absolute inset-0 origin-top will-change-transform" style={{ transform, opacity, zIndex: index }}>
      <LayerCard index={index} title={title} description={description} className="absolute inset-0" />
      <motion.div className="pointer-events-none absolute inset-0 rounded-[24px] bg-black" style={{ opacity: shade }} />
    </motion.div>
  );
}

function LayerCard({
  index,
  title,
  description,
  className,
}: {
  index: number;
  title: string;
  description: string;
  className?: string;
}) {
  const model = index === MODEL;
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-[24px] border shadow-[0_40px_80px_-30px_rgba(0,0,0,0.95)]",
        model ? "border-transparent bg-[oklch(0.975_0_0)] text-[oklch(0.145_0_0)]" : "border-line-strong bg-[oklch(0.1_0_0)] text-fg",
        className
      )}
    >
      <div className={cn("relative min-h-0 flex-1 border-b", model ? "border-black/10" : "border-line")}>
        <div className={cn("flex size-full items-center justify-center p-5 md:p-7", model && "[&_svg]:invert", "max-lg:aspect-[3/2]")}>
          <LayerFigure index={index} />
        </div>
      </div>
      <div className="flex items-end justify-between gap-6 p-6 md:p-7">
        <div className="min-w-0">
          <span className={cn("font-mono text-[0.6875rem] uppercase tracking-[0.2em]", model ? "text-black/50" : "text-fg-subtle")}>
            Layer {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display mt-2 text-[clamp(1.5rem,1.1rem+1vw,2rem)] font-[480] leading-[1.02] tracking-[-0.035em] [font-stretch:104%]">
            {title}
          </h3>
          <p className={cn("mt-2 text-[0.9375rem] leading-relaxed", model ? "text-black/65" : "text-fg-muted")}>
            {description}
            {model && <span className="text-black"> The only layer a demo shows.</span>}
          </p>
        </div>
        <span
          aria-hidden
          className={cn(
            "font-display shrink-0 text-[clamp(3rem,2rem+2.4vw,4.75rem)] font-[300] leading-[0.8] tracking-[-0.05em] text-transparent [font-stretch:112%]",
            model ? "[-webkit-text-stroke:1px_oklch(0_0_0/0.4)]" : "[-webkit-text-stroke:1px_oklch(1_0_0/0.4)]"
          )}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}

/** Layers on the deck so far, under it. */
function DeckCount({ active }: { active: number }) {
  return (
    <div className="absolute -bottom-9 left-0 flex w-full items-center justify-between font-mono text-[0.75rem] text-fg-subtle">
      <span className="flex items-center gap-2">
        {ANATOMY.map((l, i) => (
          <span
            key={l.title}
            className={cn("h-1 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]", i <= active ? "w-6 bg-fg" : "w-3 bg-line-strong")}
          />
        ))}
      </span>
      <span className="tabular-nums">
        {active + 1 === N ? "All six layers" : `${String(active + 1).padStart(2, "0")} of ${String(N).padStart(2, "0")} layers`}
      </span>
    </div>
  );
}
