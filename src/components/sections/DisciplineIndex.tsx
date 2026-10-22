"use client";

import {
  AnimatePresence,
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { DisciplineFigure } from "@/components/illustrations/Disciplines";
import { BookCall } from "@/components/site/BookCall";
import { CAPABILITIES, HOME } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Share of the pinned scroll held still before the track starts and after it stops. */
const HOLD = 0.05;

/**
 * The four disciplines on one horizontal track. The section pins under the
 * nav and the vertical scroll drives the track sideways, smoothed by a spring
 * so wheel steps glide instead of jumping.
 */
export function DisciplineIndex() {
  const reduce = !!useReducedMotion();
  const pinned = !reduce;
  const section = useRef<HTMLElement>(null);
  const port = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const [dist, setDist] = useState(0);
  const [starts, setStarts] = useState<number[]>([]);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const p = port.current;
    const t = track.current;
    if (!p || !t) return;
    const measure = () => {
      setDist(Math.max(0, t.scrollWidth - p.clientWidth));
      const cards = Array.from(t.querySelectorAll<HTMLElement>("[data-card]"));
      const pad = cards[0]?.offsetLeft ?? 0;
      setStarts(cards.map((c) => c.offsetLeft - pad));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(p);
    ro.observe(t);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const glide = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.45, restDelta: 0.0001 });
  const run = useTransform(glide, [HOLD, 1 - HOLD], [0, 1], { clamp: true });
  const x = useTransform(run, (v) => (pinned ? -v * dist : 0));

  useMotionValueEvent(x, "change", (v) => {
    if (!starts.length) return;
    // The card whose left edge is nearest the track's start, or the last one at the end.
    let best = 0;
    starts.forEach((s, i) => {
      if (Math.abs(s + v) < Math.abs(starts[best] + v)) best = i;
    });
    if (-v >= dist - 2) best = starts.length - 1;
    setActive((a) => (a === best ? a : best));
  });

  const count = CAPABILITIES.length;
  const shown = Math.min(active, count - 1);

  return (
    <section
      ref={section}
      id="what-we-do"
      data-nav-tone="light"
      aria-labelledby="disciplines-title"
      className="tone-light relative"
      style={pinned ? { height: `calc(100dvh + ${Math.round(dist / (1 - 2 * HOLD))}px)` } : undefined}
    >
      <div className={cn("flex flex-col overflow-hidden", pinned ? "sticky top-0 h-dvh pt-[72px]" : "py-24")}>
        <div className="container-site shrink-0 pt-8 md:pt-12 [@media(max-height:760px)]:md:pt-6">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between md:gap-12">
            <motion.h2
              id="disciplines-title"
              initial={reduce ? false : { opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: EASE }}
              className="font-display text-[clamp(2rem,0.9rem+3.2vw,4.1rem)] font-[420] leading-[1] tracking-[-0.04em] text-fg [font-stretch:106%]"
            >
              <span className="block">We build software for real</span>
              <span className="sr-only">{HOME.worlds.join(", ")}.</span>
              <WorldBox words={HOME.worlds} />
            </motion.h2>

            <div className="flex shrink-0 flex-col gap-4 md:max-w-[22rem] md:items-end md:text-right">
              <p className="hidden text-[1rem] leading-relaxed text-fg-muted md:block">
                Four disciplines under one roof, so the people who design it are the people who build, test and run it.
              </p>
              {pinned && <Counter value={shown + 1} total={count} />}
            </div>
          </div>

          {pinned && (
            <div aria-hidden className="mt-6 h-px w-full bg-line md:mt-8">
              <motion.div className="h-full origin-left bg-fg" style={{ scaleX: run }} />
            </div>
          )}
        </div>

        <div ref={port} className={cn("relative", pinned && "min-h-0 flex-1")}>
          <motion.div
            ref={track}
            style={{ x }}
            className={cn(
              "flex gap-4 md:gap-6",
              pinned
                ? "h-full w-max py-6 pl-[var(--edge)] pr-[var(--edge)] will-change-transform md:py-8 [@media(max-height:760px)]:md:py-5"
                : "container-site mt-12 flex-col"
            )}
          >
            {CAPABILITIES.map((c, i) => (
              <DisciplineCard
                key={c.id}
                index={i}
                capability={c}
                x={x}
                start={starts[i] ?? 0}
                pinned={pinned}
              />
            ))}
            <CloseCard pinned={pinned} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

type Capability = (typeof CAPABILITIES)[number];

function DisciplineCard({
  index,
  capability,
  x,
  start,
  pinned,
}: {
  index: number;
  capability: Capability;
  x: MotionValue<number>;
  start: number;
  pinned: boolean;
}) {
  const card = useRef<HTMLElement>(null);
  const seen = useInView(card, { amount: 0.55, once: true });
  // Drawings drift against the track, so each plate seems to sit a little deeper than its card.
  const drift = useTransform(x, (v) => Math.max(-90, Math.min(90, (start + v) * -0.09)));
  const tilt = useTransform(x, (v) => Math.max(-3, Math.min(3, (start + v) * -0.0035)));

  return (
    <article
      ref={card}
      data-card
      className={cn(
        "tokens-dark relative grid shrink-0 overflow-hidden rounded-[24px] bg-black text-fg md:rounded-[28px]",
        "grid-rows-[minmax(0,0.95fr)_auto] md:grid-cols-[minmax(0,1.08fr)_minmax(0,1fr)] md:grid-rows-1",
        pinned ? "h-full w-[calc(100vw-3rem)] md:w-[min(1000px,calc(100vw-9rem))]" : "min-h-[34rem] w-full"
      )}
    >
      {/* the plate */}
      <div className="relative min-h-0 overflow-hidden border-b border-line md:border-b-0 md:border-r">
        <motion.div
          className="absolute inset-[-8%] flex items-center justify-center p-[10%]"
          style={pinned ? { x: drift, rotate: tilt } : undefined}
        >
          <DisciplineFigure id={capability.id} />
        </motion.div>
      </div>

      {/* the words */}
      <div className="flex min-h-0 flex-col justify-between gap-6 p-6 md:p-10 [@media(max-height:760px)]:md:p-8">
        <span
          aria-hidden
          className="font-display hidden text-[clamp(4rem,2rem+5vw,6.5rem)] font-[300] leading-[0.8] tracking-[-0.05em] text-transparent [-webkit-text-stroke:1px_oklch(1_0_0/0.38)] [font-stretch:112%] md:block [@media(max-height:760px)]:md:hidden"
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        <div>
          <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-subtle md:hidden">
            {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="font-display mt-2 text-[clamp(1.75rem,1.1rem+1.9vw,2.9rem)] font-[460] leading-[1] tracking-[-0.035em] [font-stretch:104%] md:mt-0">
            {capability.title}
          </h3>
          <p className="mt-3 max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-muted md:mt-4 md:text-base">
            {capability.description}
          </p>
          <ul className="mt-6 hidden border-t border-line md:block [@media(max-height:820px)]:md:hidden">
            {capability.items.map((item, k) => (
              <motion.li
                key={item}
                initial={false}
                animate={seen ? { opacity: 1, x: 0 } : { opacity: 0, x: 18 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.1 + k * 0.06 }}
                className="flex items-center gap-3 border-b border-line py-2.5 text-[0.875rem] text-fg-muted"
              >
                <span aria-hidden className="size-1 rounded-full bg-fg/60" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>
    </article>
  );
}

/** The track ends on the one action, set on white like the ground around it. */
function CloseCard({ pinned }: { pinned: boolean }) {
  return (
    <div
      data-card
      className={cn(
        "flex shrink-0 flex-col justify-between gap-8 rounded-[24px] border border-line-strong p-7 md:rounded-[28px] md:p-10",
        pinned ? "h-full w-[calc(100vw-3rem)] md:w-[24rem]" : "w-full"
      )}
    >
      <span className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-subtle">One team</span>
      <div className="flex flex-col items-start gap-6">
        <p className="font-display text-[clamp(1.75rem,1.2rem+1.5vw,2.5rem)] font-[440] leading-[1.04] tracking-[-0.035em] text-fg [font-stretch:104%]">
          Not sure which you need? Most projects use all four.
        </p>
        <BookCall />
      </div>
    </div>
  );
}

/** Two-digit counter whose digits roll as the active card changes. */
function Counter({ value, total }: { value: number; total: number }) {
  return (
    <span aria-hidden className="flex items-baseline gap-2 font-mono text-[0.8125rem] tabular-nums text-fg-subtle">
      <span className="relative inline-flex h-[1.2em] overflow-hidden text-fg">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={value}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="block"
          >
            {String(value).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      <span>/ {String(total).padStart(2, "0")}</span>
    </span>
  );
}

/** An inverted box holding one word at a time; it resizes to each word. */
function WorldBox({ words }: { words: readonly string[] }) {
  const reduce = useReducedMotion();
  const root = useRef<HTMLSpanElement>(null);
  const measure = useRef<HTMLSpanElement>(null);
  const inView = useInView(root, { margin: "-10% 0px" });
  const [i, setI] = useState(0);
  const [widths, setWidths] = useState<number[]>([]);

  useLayoutEffect(() => {
    const el = measure.current;
    if (!el) return;
    const read = () => setWidths(Array.from(el.children).map((c) => (c as HTMLElement).offsetWidth));
    read();
    document.fonts?.ready.then(read);
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    if (reduce || !inView) return;
    const id = window.setInterval(() => setI((n) => (n + 1) % words.length), 2200);
    return () => window.clearInterval(id);
  }, [reduce, inView, words.length]);

  return (
    <span ref={root} aria-hidden className="relative mt-[0.12em] block">
      {/* Off-screen copies measure each word at the heading's size */}
      <span ref={measure} className="pointer-events-none invisible absolute left-0 top-0 flex whitespace-nowrap">
        {words.map((w) => (
          <span key={w} className="px-[0.22em]">
            {w}.
          </span>
        ))}
      </span>
      <motion.span
        className="relative inline-flex h-[1.18em] items-center overflow-hidden whitespace-nowrap rounded-[0.18em] bg-fg align-top text-bg"
        initial={false}
        animate={{ width: widths[i] ?? "auto" }}
        transition={{ duration: reduce ? 0 : 0.7, ease: EASE }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={words[i]}
            className="block px-[0.22em] pb-[0.04em]"
            initial={reduce ? false : { y: "105%", filter: "blur(6px)" }}
            animate={{ y: "0%", filter: "blur(0px)" }}
            exit={{ y: "-105%", filter: "blur(6px)" }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            {words[i]}.
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  );
}
