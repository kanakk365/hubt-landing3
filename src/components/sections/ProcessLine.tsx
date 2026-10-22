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
import React, { useLayoutEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/site/SectionHeading";
import { ENGAGEMENT } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = ENGAGEMENT.length;
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

type Pt = { x: number; y: number };
type Route = { w: number; h: number; d: string; nodes: Pt[]; at: number[]; len: number };

/**
 * How an engagement runs, as one route from Discover to Run. On wide screens
 * the section pins, the line draws itself across the stage with a light at
 * its head, and each step lifts in as the light reaches it. Narrow screens and
 * reduced motion get the rail below.
 */
export function ProcessLine() {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const pinned = wide && !reduce;

  return (
    <section
      id="process"
      data-nav-tone="dark"
      aria-labelledby="process-title"
      className="tone-dark relative scroll-mt-0"
      style={pinned ? { height: "420vh" } : undefined}
    >
      {pinned ? <RouteStage /> : <Rail reduce={reduce} />}
    </section>
  );
}

const TITLE = (
  <>
    How an engagement runs, <span className="text-fg-subtle">from the first call to a system that keeps working.</span>
  </>
);

function Heading() {
  return <SectionHeading id="process-title" title={TITLE} />;
}

function RouteStage() {
  const stage = useRef<HTMLDivElement>(null);
  const area = useRef<HTMLDivElement>(null);
  const path = useRef<SVGPathElement>(null);
  const head = useRef<HTMLDivElement>(null);
  const [route, setRoute] = useState<Route | null>(null);
  const routeRef = useRef<Route | null>(null);
  const [active, setActive] = useState(-1);

  // The section is the stage's parent; its scroll drives the drawing.
  const { scrollYProgress } = useScroll({ target: stage, offset: ["start start", "end end"] });
  const glide = useSpring(scrollYProgress, { stiffness: 110, damping: 28, mass: 0.45, restDelta: 0.0001 });
  const draw = useTransform(glide, [0.05, 0.9], [0, 1], { clamp: true });

  useLayoutEffect(() => {
    const el = area.current;
    if (!el) return;
    const measure = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      const top = h * 0.42;
      const low = h * 0.6;
      const nodes = ENGAGEMENT.map((_, i) => ({ x: w * ((i + 0.5) / N), y: i % 2 ? top : low }));
      // The line runs in from the left edge of the screen and out at the right.
      const left = el.getBoundingClientRect().left;
      const right = document.documentElement.clientWidth - left - w;
      const pts: Pt[] = [{ x: -left - 8, y: top + (low - top) * 0.15 }, ...nodes, { x: w + right + 8, y: low - (low - top) * 0.15 }];
      setRoute({ w, h, d: curve(pts), nodes, at: [], len: 0 });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Once the path is in the DOM, find how far along it each step sits.
  useLayoutEffect(() => {
    const p = path.current;
    if (!route || !p || route.len) return;
    const len = p.getTotalLength();
    const at = route.nodes.map((n) => {
      let lo = 0;
      let hi = len;
      for (let k = 0; k < 24; k++) {
        const mid = (lo + hi) / 2;
        if (p.getPointAtLength(mid).x < n.x) lo = mid;
        else hi = mid;
      }
      return lo / len;
    });
    const next = { ...route, at, len };
    routeRef.current = next;
    setRoute(next);
  }, [route]);

  const place = (v: number) => {
    const r = routeRef.current;
    const p = path.current;
    if (!r || !p || !head.current) return;
    const pt = p.getPointAtLength(v * r.len);
    head.current.style.transform = `translate3d(${pt.x}px, ${pt.y}px, 0)`;
    head.current.style.opacity = v > 0.001 && v < 0.999 ? "1" : "0";
    let a = -1;
    r.at.forEach((f, i) => {
      if (v >= f - 0.005) a = i;
    });
    setActive((cur) => (cur === a ? cur : a));
  };
  useMotionValueEvent(draw, "change", place);
  useLayoutEffect(() => place(draw.get()));

  return (
    <div ref={stage} className="absolute inset-0">
      <div className="sticky top-0 flex h-dvh flex-col overflow-hidden pt-[72px]">
        <div className="container-site relative flex min-h-0 flex-1 flex-col pb-10 pt-10 xl:pt-14 [@media(max-height:800px)]:pt-6">
          <div className="flex items-end justify-between gap-10">
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.9, ease: EASE }}
            >
              <h2
                id="process-title"
                className="font-display max-w-[32ch] text-[clamp(1.85rem,0.9rem+1.75vw,2.75rem)] font-[460] leading-[1.06] tracking-[-0.036em] text-fg [font-stretch:104%]"
              >
                {TITLE}
              </h2>
            </motion.div>
            <StepCount active={active} />
          </div>

          <div ref={area} className="relative mt-4 min-h-0 flex-1">
            {route && (
              <svg aria-hidden className="absolute inset-0 size-full overflow-visible" viewBox={`0 0 ${route.w} ${route.h}`} fill="none">
                <path d={route.d} stroke="oklch(1 0 0 / 0.14)" strokeWidth="1" strokeDasharray="2 6" />
                <motion.path ref={path} d={route.d} stroke="oklch(1 0 0 / 0.95)" strokeWidth="1.5" strokeLinecap="round" style={{ pathLength: draw }} />
              </svg>
            )}

            {/* the light at the head of the line */}
            <div ref={head} aria-hidden className="pointer-events-none absolute left-0 top-0 opacity-0">
              <span className="absolute -left-[22px] -top-[22px] size-[44px] rounded-full bg-white/10 blur-md" />
              <span className="absolute -left-[5px] -top-[5px] size-[10px] rounded-full bg-white shadow-[0_0_18px_4px_rgba(255,255,255,0.55)]" />
            </div>

            {route?.len
              ? ENGAGEMENT.map((step, i) => (
                  <Stop key={step.title} index={i} route={route} draw={draw} title={step.title} description={step.description} active={active} />
                ))
              : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** A smooth curve through points (Catmull-Rom as cubic Béziers). */
function curve(p: Pt[]) {
  let d = `M${p[0].x.toFixed(1)} ${p[0].y.toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * One step on the route: its node fills when the light arrives, and its words
 * lift out of the line, above it for raised nodes, below it for low ones.
 */
function Stop({
  index,
  route,
  draw,
  title,
  description,
  active,
}: {
  index: number;
  route: Route;
  draw: MotionValue<number>;
  title: string;
  description: string;
  active: number;
}) {
  const n = route.nodes[index];
  const f = route.at[index];
  const up = index % 2 === 1;
  const last = index === N - 1;
  const reach = useTransform(draw, [f - 0.05, f + 0.015], [0, 1], { clamp: true });
  const opacity = useTransform(reach, [0, 1], [0, 1]);
  const y = useTransform(reach, [0, 1], [up ? 26 : -26, 0]);
  const blur = useTransform(reach, (v) => `blur(${((1 - v) * 8).toFixed(2)}px)`);
  const lit = useTransform(draw, [f - 0.006, f + 0.004], [0, 1], { clamp: true });

  // Words sit centred on the node, kept inside the stage.
  const bw = Math.min(300, route.w * 0.26);
  const left = clamp(n.x - bw / 2, 0, route.w - bw);
  const on = active === index;

  return (
    <>
      <div aria-hidden className="absolute" style={{ left: n.x, top: n.y }}>
        <span className={cn("absolute inset-0 transition-opacity duration-500", on ? "opacity-100" : "opacity-35")}>
          <motion.span
            className="absolute -left-[26px] -top-[26px] size-[52px] rounded-full border border-white/30"
            style={{ scale: lit, opacity: lit }}
          />
        </span>
        <span className="absolute -left-[8px] -top-[8px] grid size-[16px] place-items-center rounded-full border border-line-strong bg-black">
          <motion.span className="size-[8px] rounded-full bg-white" style={{ scale: lit }} />
        </span>
        {last && (
          // Run never ends: a slow orbit around the last stop once it is reached.
          <motion.span className="absolute -left-[40px] -top-[40px] size-[80px]" style={{ opacity: lit }}>
            <span className="block size-full rounded-full border border-dashed border-white/25 motion-safe:animate-[spin_14s_linear_infinite]" />
          </motion.span>
        )}
      </div>

      <motion.div
        className={cn("absolute", up ? "-translate-y-full" : "")}
        style={{
          left,
          width: bw,
          top: up ? n.y - 48 : n.y + 48,
          opacity,
          y,
          filter: blur,
        }}
      >
        <div className={cn("transition-opacity duration-500", on || active > index ? "opacity-100" : "opacity-60")}>
          <span className="font-mono text-[0.6875rem] tabular-nums text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
          <h3 className="font-display mt-2 text-[clamp(1.5rem,1rem+1vw,2rem)] font-[480] leading-none tracking-[-0.035em] text-fg [font-stretch:104%]">
            {title}
          </h3>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted [@media(max-height:760px)]:line-clamp-3">{description}</p>
        </div>
      </motion.div>
    </>
  );
}

function StepCount({ active }: { active: number }) {
  const shown = Math.max(0, active);
  return (
    <div aria-hidden className="hidden shrink-0 items-baseline gap-2 pb-2 font-mono text-[0.8125rem] tabular-nums text-fg-subtle lg:flex">
      Step
      <span className="relative inline-flex h-[1.2em] overflow-hidden text-fg">
        <AnimatePresence initial={false} mode="popLayout">
          <motion.span
            key={shown}
            initial={{ y: "100%" }}
            animate={{ y: "0%" }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.5, ease: EASE }}
            className="block"
          >
            {String(shown + 1).padStart(2, "0")}
          </motion.span>
        </AnimatePresence>
      </span>
      / {String(N).padStart(2, "0")}
    </div>
  );
}

/** Narrow screens: one rail from Discover to Run, filled by the scroll. */
function Rail({ reduce }: { reduce: boolean }) {
  const list = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({ target: list, offset: ["start 0.8", "end 0.6"] });
  const fill = useTransform(scrollYProgress, [0, 0.92], [0, 1]);

  return (
    <div className="container-site py-24 md:py-36">
      <Heading />
      <div className="relative mt-16 md:mt-24">
        <div aria-hidden className="absolute left-[5px] top-2 h-[calc(100%-1rem)] w-px bg-line">
          <motion.div className="size-full origin-top bg-fg" style={reduce ? undefined : { scaleY: fill }} />
        </div>
        <ol ref={list} className="grid gap-12">
          {ENGAGEMENT.map((step, i) => (
            <RailStep key={step.title} index={i} title={step.title} description={step.description} progress={fill} still={reduce} />
          ))}
        </ol>
      </div>
    </div>
  );
}

function RailStep({
  index,
  title,
  description,
  progress,
  still,
}: {
  index: number;
  title: string;
  description: string;
  progress: MotionValue<number>;
  still: boolean;
}) {
  const at = index / (N - 1);
  const lit = useTransform(progress, [Math.max(0, at - 0.12), at], [0, 1]);
  const opacity = useTransform(lit, [0, 1], [0.32, 1]);
  const x = useTransform(lit, [0, 1], [12, 0]);

  return (
    <li className="relative pl-9">
      <span aria-hidden className="absolute left-0 top-1 grid size-[11px] place-items-center rounded-full border border-line-strong bg-bg">
        <motion.span className="size-[5px] rounded-full bg-fg" style={still ? undefined : { scale: lit, opacity: lit }} />
      </span>
      <motion.div style={still ? undefined : { opacity, x }}>
        <span className="font-mono text-[0.6875rem] tabular-nums text-fg-subtle">{String(index + 1).padStart(2, "0")}</span>
        <h3 className="font-display mt-3 text-[1.5rem] font-[480] tracking-[-0.03em] text-fg [font-stretch:104%]">{title}</h3>
        <p className="mt-3 max-w-[40ch] text-[0.9375rem] leading-relaxed text-fg-muted">{description}</p>
      </motion.div>
    </li>
  );
}
