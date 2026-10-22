"use client";

import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { ArrowDown } from "lucide-react";
import React, { useCallback, useLayoutEffect, useRef, useState } from "react";
import PatternWaves from "@/components/bits/PatternWaves";
import Threads from "@/components/bits/Threads";
import { BookCall } from "@/components/site/BookCall";
import { LinkButton } from "@/components/site/LinkButton";
import { HOME } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Insets of the black box from the stage edges, and its corner radius. */
type Box = { t: number; r: number; b: number; l: number; rad: number };
type Geo = { W: number; H: number; wide: boolean; A: Box; B: Box; C: Box };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

/**
 * Three states of the box: A fills the stage inside a white margin under the
 * white nav, B is a centred card (a band at the top on narrow screens), C is
 * full bleed, the black ground of the statement that follows.
 */
function geometry(W: number, H: number): Geo {
  const wide = W >= 900;
  const C: Box = { t: 0, r: 0, b: 0, l: 0, rad: 0 };

  if (wide) {
    const cw = clamp(W * 0.3, 320, 500);
    const ch = Math.min(H * 0.66, 640);
    const cy = (72 + H) / 2;
    return {
      W,
      H,
      wide,
      A: { t: 96, r: 24, b: 24, l: 24, rad: 24 },
      B: { t: cy - ch / 2, r: (W - cw) / 2, b: H - cy - ch / 2, l: (W - cw) / 2, rad: 28 },
      C,
    };
  }

  const bh = Math.min(H * 0.42, 380);
  return {
    W,
    H,
    wide,
    A: { t: 84, r: 12, b: 12, l: 12, rad: 20 },
    B: { t: 84, r: 16, b: H - 84 - bh, l: 16, rad: 22 },
    C,
  };
}

/**
 * The home hero. A white stage holds one black box of drifting threads
 * (React Bits). Scrolling shrinks the box to a card while the threads give way
 * to a halftone dot surface and two statements pull apart around it, then
 * opens it to full bleed, empty, so the studio statement reads straight on.
 */
export function ScrollHero() {
  const reduce = !!useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const threads = useRef<HTMLDivElement>(null);
  const dots = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const build = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);

  const [geo, setGeo] = useState<Geo | null>(null);
  const geoRef = useRef<Geo | null>(null);
  // Whichever surface is fully faded out stops animating.
  const [scene, setScene] = useState<"threads" | "dots" | "both" | "none">("threads");
  const sceneRef = useRef(scene);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const render = useCallback(
    (p: number) => {
      const g = geoRef.current;
      if (!g || !layer.current) return;

      const shrink = inOut(span(p, 0.1, 0.36));
      // Full bleed by 0.84; the statement section overlaps the black stage after that.
      const open = inOut(span(p, 0.6, 0.84));
      const box = (k: keyof Box) => mix(mix(g.A[k], g.B[k], shrink), g.C[k], open);

      const t = box("t");
      layer.current.style.clipPath = `inset(${t}px ${box("r")}px ${box("b")}px ${box("l")}px round ${box("rad")}px)`;

      // Threads give way to the dots once; the dots fade to plain black as the box opens.
      const showThreads = 1 - span(p, 0.17, 0.29);
      const showDots = (1 - showThreads) * (1 - span(p, 0.62, 0.84));
      if (threads.current) threads.current.style.opacity = String(showThreads);
      if (dots.current) dots.current.style.opacity = String(showDots);
      const next =
        showThreads > 0.99 ? "threads" : showThreads > 0.01 ? "both" : showDots > 0.01 ? "dots" : "none";
      if (sceneRef.current !== next) {
        sceneRef.current = next;
        setScene(next);
      }

      const out = span(p, 0.03, 0.14);
      if (copy.current) {
        copy.current.style.opacity = String(1 - out);
        copy.current.style.transform = `translate3d(0, ${-40 * out}px, 0)`;
        copy.current.style.filter = reduce || out === 0 ? "" : `blur(${8 * out}px)`;
        copy.current.style.visibility = out > 0.98 ? "hidden" : "visible";
      }
      if (scrim.current) scrim.current.style.opacity = String(1 - out);
      if (cue.current) cue.current.style.opacity = String(1 - span(p, 0, 0.05));

      const pull = inOut(span(p, 0.25, 0.37));
      const leave = span(p, 0.6, 0.7);
      const flank = (el: HTMLDivElement | null, dir: 1 | -1) => {
        if (!el) return;
        el.style.opacity = String(pull * (1 - leave));
        el.style.transform = g.wide
          ? `translate3d(${dir * 64 * (1 - pull)}px, 0, 0)`
          : `translate3d(0, ${28 * (1 - pull)}px, 0)`;
        el.style.filter = reduce || pull === 1 ? "" : `blur(${6 * (1 - pull)}px)`;
      };
      flank(build.current, 1);
      flank(run.current, -1);
    },
    [reduce]
  );

  useMotionValueEvent(scrollYProgress, "change", render);

  useLayoutEffect(() => {
    const st = stage.current;
    if (!st) return;
    const measure = () => {
      const next = geometry(st.clientWidth, st.clientHeight);
      geoRef.current = next;
      setGeo(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    return () => ro.disconnect();
  }, []);

  // Re-apply after every geometry change, before paint.
  useLayoutEffect(() => {
    render(scrollYProgress.get());
  }, [geo, render, scrollYProgress]);

  const rise = (i: number) => ({
    initial: { opacity: 0, y: 24, filter: "blur(10px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)" },
    transition: { duration: 1, ease: EASE, delay: 0.2 + i * 0.1 },
  });

  const A = geo?.A;
  const B = geo?.B;
  const flankW = geo && B ? Math.min(400, B.l - 64 - 40) : 0;

  return (
    <section
      ref={section}
      aria-labelledby="hero-title"
      className="tone-light relative h-[300vh] min-[900px]:h-[360vh]"
    >
      <div ref={stage} className="sticky top-0 h-dvh overflow-hidden">
        {/* Statements on the white ground, revealed as the box shrinks between them */}
        {geo?.wide && B ? (
          <>
            <Flank
              ref={build}
              {...HOME.hero.build}
              className="text-right"
              style={{ right: geo.W - B.l + 64, top: B.t + 20, width: flankW }}
            />
            <Flank
              ref={run}
              {...HOME.hero.run}
              style={{ left: geo.W - B.r + 64, bottom: B.b + 20, width: flankW }}
            />
          </>
        ) : (
          <div
            className="absolute inset-x-5 flex flex-col gap-6"
            style={{ top: geo && B ? geo.H - B.b + 28 : "60%" }}
          >
            <Flank ref={build} {...HOME.hero.build} className="relative" />
            <Flank ref={run} {...HOME.hero.run} className="relative" />
          </div>
        )}

        {/* The black box: one full-stage layer, clipped to the box's current shape */}
        <div
          ref={layer}
          className="tokens-dark absolute inset-0 z-10 bg-black text-fg [clip-path:inset(84px_12px_12px_12px_round_20px)] min-[900px]:[clip-path:inset(96px_24px_24px_24px_round_24px)]"
        >
          <div
            ref={threads}
            aria-hidden
            className={cn("absolute inset-0 transition-opacity duration-1000", geo ? "opacity-100" : "opacity-0")}
          >
            <Threads
              color="#ffffff"
              lineCount={110}
              amplitude={1.5}
              distance={0.35}
              angle={22}
              enableMouseInteraction
              parting={0.35}
              paused={scene === "dots" || scene === "none"}
            />
          </div>

          {/* The card's surface, sized to the card so its edge fade lands on the card's edge */}
          <div
            ref={dots}
            aria-hidden
            className="absolute opacity-0"
            style={B ? { left: B.l, top: B.t, right: B.r, bottom: B.b } : { inset: 0 }}
          >
            <PatternWaves
              preset="silk"
              color="#ffffff"
              backgroundColor="#000000"
              spacing={geo?.wide ? 9 : 8}
              fade="edges"
              fadeSize={0.35}
              intro={false}
              paused={scene === "threads" || scene === "none"}
            />
          </div>

          <div
            ref={scrim}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[52%] bg-gradient-to-t from-black via-black/75 to-transparent"
          />

          <div
            ref={copy}
            className="absolute inset-x-8 bottom-8 flex flex-wrap items-end justify-between gap-x-12 gap-y-7"
            style={A ? { left: A.l + (geo!.wide ? 48 : 20), right: A.r + (geo!.wide ? 48 : 20), bottom: A.b + (geo!.wide ? 44 : 22) } : undefined}
          >
            <motion.h1
              {...rise(0)}
              id="hero-title"
              className="font-display text-[clamp(2.6rem,0.4rem+5.2vw,5.75rem)] font-[420] leading-[0.95] tracking-[-0.04em] text-fg [font-stretch:108%]"
            >
              <span className="block">{HOME.hero.title[0]}</span>
              <span className="block">{HOME.hero.title[1]}</span>
            </motion.h1>
            <div className="flex max-w-[25rem] flex-col gap-6 min-[900px]:pb-2">
              <motion.p {...rise(1)} className="text-[1rem] leading-relaxed text-fg-muted min-[900px]:text-[1.0625rem]">
                {HOME.hero.lede}
              </motion.p>
              <motion.div {...rise(2)} className="flex flex-wrap items-center gap-3">
                <BookCall size="lg" />
                <LinkButton
                  href="#process"
                  trailing={
                    <ArrowDown
                      aria-hidden
                      className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5"
                    />
                  }
                >
                  How we work
                </LinkButton>
              </motion.div>
            </div>
          </div>

          <div
            ref={cue}
            aria-hidden
            className="absolute hidden min-[900px]:block"
            style={A ? { top: A.t + 28, right: A.r + 32 } : { top: 124, right: 56 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.9 }}
              className="flex items-center gap-3 text-[0.8125rem] font-medium text-fg-muted"
            >
              Scroll to explore
              <span className="grid size-8 place-items-center rounded-[8px] border border-line-strong">
                <ArrowDown className="size-3.5 motion-safe:animate-[cue_2.4s_var(--ease-out-expo)_infinite]" />
              </span>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

const Flank = React.forwardRef<
  HTMLDivElement,
  { title: string; line: string; className?: string; style?: React.CSSProperties }
>(function Flank({ title, line, className, style }, ref) {
  return (
    <div ref={ref} className={cn("absolute opacity-0", className)} style={style}>
      <h2 className="font-display text-[clamp(1.5rem,0.9rem+1.5vw,2.35rem)] font-[460] leading-[1.06] tracking-[-0.035em] text-fg [font-stretch:104%]">
        {title}
      </h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted min-[900px]:mt-4 min-[900px]:text-base">{line}</p>
    </div>
  );
});
