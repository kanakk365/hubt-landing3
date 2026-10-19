"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { ArrowDown } from "lucide-react";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { BookCall } from "@/components/site/BookCall";
import { LinkButton } from "@/components/site/LinkButton";
import { HOME } from "@/lib/site";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

/** Insets of the black box from the stage edges, and its corner radius. */
type Box = { t: number; r: number; b: number; l: number; rad: number };
/** Footage centre offset from the stage centre, and its scale over a W × 9W/16 frame. */
type Shot = { x: number; y: number; s: number };
type Geo = { W: number; H: number; wide: boolean; A: Box; B: Box; C: Box; vA: Shot; vB: Shot; vC: Shot };

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const inOut = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const span = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);

// Measured off the footage: the cube's bounding box spans 76% of the frame's
// height and 41% of its width; the particle shapes span 38% of the width.
const CUBE_H = 0.76;
const CUBE_W = 0.41;
const PARTICLES_W = 0.38;

/**
 * Three states of the box: A fills the stage under the nav, B is a centred
 * card (a band at the top on narrow screens), C is full bleed. `copyH` is the
 * height of the headline block, which the cube must clear.
 */
function geometry(W: number, H: number, copyH: number): Geo {
  const wide = W >= 900;
  const frameH = W * 0.5625;
  const C: Box = { t: 0, r: 0, b: 0, l: 0, rad: 0 };

  if (wide) {
    const A: Box = { t: 88, r: 24, b: 24, l: 24, rad: 24 };
    const aW = W - A.l - A.r;
    const aH = H - A.t - A.b;
    // Room above the copy, less a margin under the box's top edge.
    const head = 28;
    const upper = Math.max(aH * 0.42, aH - copyH - 28) - head;
    const cubeH = Math.min((upper / CUBE_H) * 0.94, (aW * 0.6) / (CUBE_W / 0.5625));
    const cw = clamp(W * 0.3, 320, 500);
    const ch = Math.min(H * 0.66, 640);
    const cy = (72 + H) / 2;
    return {
      W,
      H,
      wide,
      A,
      B: { t: cy - ch / 2, r: (W - cw) / 2, b: H - cy - ch / 2, l: (W - cw) / 2, rad: 28 },
      C,
      vA: { x: 0, y: A.t + head + upper / 2 - H / 2, s: cubeH / frameH },
      vB: { x: 0, y: cy - H / 2, s: (cw * 0.8) / PARTICLES_W / W },
      vC: { x: 0, y: 0, s: Math.max(1, H / frameH) },
    };
  }

  const A: Box = { t: 72, r: 12, b: 12, l: 12, rad: 20 };
  const aW = W - A.l - A.r;
  const aH = H - A.t - A.b;
  const head = 20;
  const upper = Math.max(aH * 0.36, aH - copyH - 20) - head;
  const cubeH = Math.min((upper / CUBE_H) * 0.92, (aW * 0.86) / (CUBE_W / 0.5625));
  const bh = Math.min(H * 0.42, 380);
  return {
    W,
    H,
    wide,
    A,
    B: { t: 80, r: 16, b: H - 80 - bh, l: 16, rad: 22 },
    C,
    vA: { x: 0, y: A.t + head + upper / 2 - H / 2, s: cubeH / frameH },
    vB: { x: 0, y: 80 + bh / 2 - H / 2, s: ((W - 32) * 0.76) / PARTICLES_W / W },
    vC: { x: 0, y: 0, s: (W * 0.84) / (CUBE_W / 0.5625) / frameH },
  };
}

/**
 * The home hero. A white stage holds one black box playing HubTech's footage.
 * Scrolling shrinks the box to a card while the footage changes and two
 * statements pull apart around it, then opens it to full bleed so the page
 * turns black for the section that follows.
 */
export function ScrollHero() {
  const reduce = !!useReducedMotion();
  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const frame = useRef<HTMLDivElement>(null);
  const cube = useRef<HTMLVideoElement>(null);
  const particles = useRef<HTMLVideoElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);
  const cue = useRef<HTMLDivElement>(null);
  const dim = useRef<HTMLDivElement>(null);
  const build = useRef<HTMLDivElement>(null);
  const run = useRef<HTMLDivElement>(null);

  const [geo, setGeo] = useState<Geo | null>(null);
  const geoRef = useRef<Geo | null>(null);
  const inView = useRef(true);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });

  const footage = useCallback(
    (el: HTMLVideoElement | null, visible: boolean) => {
      if (!el) return;
      if (visible && inView.current && !reduce) {
        if (el.paused) el.play().catch(() => {});
      } else if (!el.paused) {
        el.pause();
      }
    },
    [reduce]
  );

  const render = useCallback(
    (p: number) => {
      const g = geoRef.current;
      if (!g || !layer.current || !frame.current) return;

      const shrink = inOut(span(p, 0.1, 0.36));
      const open = inOut(span(p, 0.6, 0.84));
      const box = (k: keyof Box) => mix(mix(g.A[k], g.B[k], shrink), g.C[k], open);
      const shot = (k: keyof Shot) => mix(mix(g.vA[k], g.vB[k], shrink), g.vC[k], open);

      const t = box("t");
      layer.current.style.clipPath = `inset(${t}px ${box("r")}px ${box("b")}px ${box("l")}px round ${box("rad")}px)`;
      frame.current.style.transform = `translate3d(${shot("x")}px, ${shot("y")}px, 0) scale(${shot("s")})`;

      const showCube = clamp(1 - span(p, 0.17, 0.29) + span(p, 0.6, 0.72), 0, 1);
      if (cube.current) cube.current.style.opacity = String(showCube);
      if (particles.current) particles.current.style.opacity = String(1 - showCube);
      footage(cube.current, showCube > 0.01);
      footage(particles.current, showCube < 0.99);

      const out = span(p, 0.03, 0.14);
      if (copy.current) {
        copy.current.style.opacity = String(1 - out);
        copy.current.style.transform = `translate3d(0, ${-40 * out}px, 0)`;
        copy.current.style.filter = reduce || out === 0 ? "" : `blur(${8 * out}px)`;
        copy.current.style.visibility = out > 0.98 ? "hidden" : "visible";
      }
      if (scrim.current) scrim.current.style.opacity = String(1 - out);
      if (cue.current) cue.current.style.opacity = String(1 - span(p, 0, 0.05));
      if (dim.current) dim.current.style.opacity = String(span(p, 0.9, 1) * 0.6);

      const pull = inOut(span(p, 0.25, 0.37));
      const leave = span(p, 0.6, 0.68);
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

      // The navbar inverts once the box has opened past it.
      const tone = t < 40 ? "dark" : "light";
      if (section.current && section.current.dataset.navTone !== tone) {
        section.current.dataset.navTone = tone;
        window.dispatchEvent(new Event("hubtech:navtone"));
      }
    },
    [footage, reduce]
  );

  useMotionValueEvent(scrollYProgress, "change", render);

  useLayoutEffect(() => {
    const st = stage.current;
    if (!st) return;
    const measure = () => {
      const next = geometry(st.clientWidth, st.clientHeight, copy.current?.offsetHeight ?? 0);
      geoRef.current = next;
      setGeo(next);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(st);
    if (copy.current) ro.observe(copy.current);
    return () => ro.disconnect();
  }, []);

  // Re-apply after every geometry change, before paint.
  useLayoutEffect(() => {
    render(scrollYProgress.get());
  }, [geo, render, scrollYProgress]);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => {
      inView.current = entry.isIntersecting;
      render(scrollYProgress.get());
    });
    io.observe(el);
    return () => io.disconnect();
  }, [render, scrollYProgress]);

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
      data-nav-tone="light"
      className="tone-light relative h-[320vh] min-[900px]:h-[400vh]"
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
          className="tokens-dark absolute inset-0 z-10 bg-black text-fg [clip-path:inset(72px_12px_12px_12px_round_20px)] min-[900px]:[clip-path:inset(88px_24px_24px_24px_round_24px)]"
        >
          <div
            ref={frame}
            aria-hidden
            className={cn(
              "absolute left-1/2 top-1/2 origin-center transition-opacity duration-700 will-change-transform",
              geo ? "opacity-100" : "opacity-0"
            )}
            style={{
              width: geo?.W ?? 0,
              height: (geo?.W ?? 0) * 0.5625,
              marginLeft: -(geo?.W ?? 0) / 2,
              marginTop: -((geo?.W ?? 0) * 0.5625) / 2,
            }}
          >
            <video
              ref={cube}
              className="absolute inset-0 size-full object-cover"
              src={HOME.video.cube.src}
              poster={HOME.video.cube.poster}
              muted
              loop
              playsInline
              preload="auto"
              autoPlay={!reduce}
            />
            <video
              ref={particles}
              // Its ground is #030303; a touch of contrast takes it to the box's black
              className="absolute inset-0 size-full object-cover opacity-0 [filter:contrast(1.05)]"
              src={HOME.video.particles.src}
              poster={HOME.video.particles.poster}
              muted
              loop
              playsInline
              preload="auto"
            />
          </div>

          <div
            ref={scrim}
            aria-hidden
            className="pointer-events-none absolute inset-x-0 bottom-0 h-[46%] bg-gradient-to-t from-black via-black/70 to-transparent"
          />
          <div ref={dim} aria-hidden className="pointer-events-none absolute inset-0 bg-black opacity-0" />

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
            style={A ? { top: A.t + 28, right: A.r + 32 } : { top: 116, right: 56 }}
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
