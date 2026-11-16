"use client";

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { TimelineChapter, TimelineNumber, TimelineSlide } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const EXPO = [0.16, 1, 0.3, 1] as const;
/** How long a still behind an opening holds before the next. */
const BACKDROP_MS = 7000;
/** The share of each slide's screen of scroll it holds still before the strip moves on. */
const HOLD = 0.4;
/** Every scene's words sit in the page's container with the same inset on both sides, clear of the year index. */
const FRAME = "container-site lg:px-16";

/**
 * A company told full screen. Its opening grows from a framed picture to the whole screen as it arrives, with the
 * company's own footage (or its pictures) behind; the name rises letter by letter, the line on what it was follows
 * word by word and the figures count up. Then its products, one screen each, on a strip that the page's scroll carries
 * sideways, each slide's backdrop, words and picture moving at their own pace so the strip has depth. Everything is
 * centred and symmetrical. With reduced motion, nothing moves or plays and the slides stack.
 */
export function ChapterScene({ chapter, index }: { chapter: TimelineChapter; index: number }) {
  const reduce = !!useReducedMotion();
  const { scene } = chapter;

  return (
    <li id={chapter.id} aria-label={chapter.company} className="relative isolate bg-black">
      <Opening chapter={chapter} index={index} reduce={reduce} />
      {scene.slides && <Slides slides={scene.slides} reduce={reduce} />}
      {scene.also && <Also lines={scene.also} reduce={reduce} />}
    </li>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Opening                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

function Opening({ chapter, index, reduce }: { chapter: TimelineChapter; index: number; reduce: boolean }) {
  const { scene } = chapter;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.2 });

  // As the opening arrives, its picture grows from a framed card to the full screen, and eases out of a zoom.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start start"] });
  const open = useSpring(scrollYProgress, { stiffness: 150, damping: 32, mass: 0.4, restDelta: 0.0005 });
  const frameScale = useTransform(open, [0, 1], [0.82, 1]);
  const radius = useTransform(open, [0, 1], [44, 0]);
  const zoom = useTransform(open, [0, 1], [1.28, 1]);

  const stills = scene.backdrop ?? [];
  const [shot, setShot] = useState(0);
  const cycling = !reduce && inView && !scene.montage && stills.length > 1;
  useEffect(() => {
    if (!cycling) return;
    const t = setInterval(() => setShot((s) => (s + 1) % stills.length), BACKDROP_MS);
    return () => clearInterval(t);
  }, [cycling, stills.length]);

  const years = chapter.years ? `${chapter.years.from}–${chapter.years.to}` : null;

  return (
    <div ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden">
      <motion.div
        aria-hidden
        className="absolute inset-0 overflow-hidden"
        style={reduce ? undefined : { scale: frameScale, borderRadius: radius }}
      >
        <motion.div className="absolute inset-0" style={reduce ? undefined : { scale: zoom }}>
          {stills.length === 0 && <Field />}
          {stills.map((b, i) => {
            const on = i === shot;
            return (
              <motion.div
                key={b.src}
                className="absolute inset-0"
                initial={false}
                animate={{ opacity: on ? 1 : 0, scale: on && cycling ? 1.08 : 1 }}
                transition={{ opacity: { duration: 1.6, ease: "easeOut" }, scale: { duration: BACKDROP_MS / 1000 + 1.6, ease: "linear" } }}
              >
                <Image
                  src={b.src}
                  alt=""
                  fill
                  sizes="100vw"
                  className={cn("object-cover", b.soft && "scale-110 blur-2xl saturate-[1.15]")}
                />
              </motion.div>
            );
          })}
          {scene.montage && !reduce && <Footage src={scene.montage} live={inView} />}
        </motion.div>
        {/* An even veil, a vignette and a fade into black at the foot, so the words hold at the centre. */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_50%,transparent,oklch(0_0_0/0.55))]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,oklch(0_0_0/0.55),transparent_22%,transparent_62%,black)]" />
      </motion.div>

      <div className={cn(FRAME, "relative w-full py-32 text-center md:py-36")}>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.8 }}
          transition={{ duration: 0.9, ease: EXPO }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.8125rem] font-medium tracking-[0.02em] text-white/75 md:text-[0.875rem]"
        >
          <span className="tabular-nums text-signal">{String(index + 1).padStart(2, "0")}</span>
          <span aria-hidden className="h-px w-6 bg-white/30" />
          {years && <span className="tabular-nums">{years}</span>}
          {years && <span aria-hidden className="text-white/35">·</span>}
          <span>{chapter.place}</span>
        </motion.p>

        <Rise
          text={chapter.company}
          reduce={reduce}
          className="mt-5 font-display text-[clamp(3.4rem,1.2rem+9.5vw,11.5rem)] font-[480] leading-[0.86] tracking-[-0.055em] text-white [font-stretch:108%] md:mt-6"
        />

        <Words
          text={scene.summary}
          reduce={reduce}
          className="mx-auto mt-6 max-w-[40ch] text-balance text-[clamp(1.08rem,0.92rem+0.7vw,1.6rem)] leading-[1.32] tracking-[-0.012em] text-white/88 md:mt-8"
        />

        <Figures figures={scene.figures} reduce={reduce} />
      </div>
    </div>
  );
}

/** The company's name, each letter rising out of its own mask. */
function Rise({ text, reduce, className }: { text: string; reduce: boolean; className: string }) {
  const words = text.split(" ");
  const starts = words.map((_, w) => words.slice(0, w).reduce((sum, word) => sum + word.length, 0));
  return (
    <motion.h3
      aria-label={text}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
    >
      {words.map((word, w) => (
        <React.Fragment key={w}>
          {w > 0 && " "}
          <span aria-hidden className="-mb-[0.1em] inline-block overflow-hidden whitespace-nowrap pb-[0.1em] align-bottom">
            {Array.from(word).map((ch, c) => (
              <motion.span
                key={c}
                className="inline-block will-change-transform"
                variants={{
                  hidden: { y: "105%", rotate: 6, opacity: 0 },
                  shown: {
                    y: "0%",
                    rotate: 0,
                    opacity: 1,
                    transition: { duration: 1.15, ease: EXPO, delay: 0.08 + (starts[w] + c) * 0.04 },
                  },
                }}
              >
                {ch}
              </motion.span>
            ))}
          </span>
        </React.Fragment>
      ))}
    </motion.h3>
  );
}

/** A line that comes in word by word, out of a soft blur. */
function Words({ text, reduce, className }: { text: string; reduce: boolean; className: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      aria-label={text}
      className={className}
      initial={reduce ? false : "hidden"}
      whileInView="shown"
      viewport={{ once: true, amount: 0.6 }}
      transition={{ staggerChildren: 0.025, delayChildren: 0.35 }}
    >
      {words.map((word, i) => (
        <React.Fragment key={i}>
          {i > 0 && " "}
          <motion.span
            aria-hidden
            className="inline-block"
            variants={{
              hidden: { opacity: 0, y: "0.45em", filter: "blur(8px)" },
              shown: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.9, ease: EXPO } },
            }}
          >
            {word}
          </motion.span>
        </React.Fragment>
      ))}
    </motion.p>
  );
}

const FIGURE_GRID: Record<number, string> = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-3",
  4: "grid-cols-2 lg:grid-cols-4",
};

/** The chapter's figures, side by side and centred, each under a short rule that draws in as its number counts up. */
function Figures({ figures, reduce }: { figures: TimelineNumber[]; reduce: boolean }) {
  return (
    <dl className={cn("mx-auto mt-12 grid max-w-[64rem] gap-x-6 gap-y-9 md:mt-16", FIGURE_GRID[figures.length] ?? "grid-cols-2")}>
      {figures.map((f, i) => (
        <motion.div
          key={f.label}
          className="flex flex-col-reverse items-center justify-end gap-2.5 text-center"
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={{ once: true, amount: 0.8 }}
          transition={{ delayChildren: 0.5 + i * 0.1 }}
        >
          <dt className="mx-auto max-w-[24ch] text-pretty text-[0.8125rem] leading-snug text-white/70 md:text-[0.9375rem]">{f.label}</dt>
          <dd className="flex flex-col items-center gap-4">
            <motion.span
              aria-hidden
              className="block h-px w-10 origin-center bg-signal"
              variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1, transition: { duration: 0.9, ease: EXPO } } }}
            />
            <motion.span
              className="block font-display text-[clamp(2.3rem,1.4rem+3.2vw,4.75rem)] font-[440] leading-none tracking-[-0.05em] text-white tabular-nums [font-stretch:108%]"
              variants={{ hidden: { opacity: 0, y: 18 }, shown: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EXPO } } }}
            >
              <Count figure={f.figure} reduce={reduce} />
            </motion.span>
          </dd>
        </motion.div>
      ))}
    </dl>
  );
}

/** Splits a figure into what comes before its number, the number, and what follows. */
const FIGURE = /^(\D*)([\d,]+(?:\.\d+)?)(.*)$/;

/** A figure that counts up to itself the first time it is seen; words and single digits simply appear. */
function Count({ figure, reduce }: { figure: string; reduce: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.8 });
  const parts = figure.match(FIGURE);
  const target = parts ? parseFloat(parts[2].replace(/,/g, "")) : 0;
  const counts = target >= 10 && !reduce;

  useEffect(() => {
    const el = ref.current;
    const split = figure.match(FIGURE);
    if (!counts || !seen || !el || !split) return;
    const [, pre, digits, post] = split;
    const places = digits.includes(".") ? digits.split(".")[1].length : 0;
    const grouped = digits.includes(",");
    const write = (v: number) => {
      el.textContent = pre + (grouped ? Math.round(v).toLocaleString("en-US") : v.toFixed(places)) + post;
    };
    write(0);
    const run = animate(0, target, { duration: 1.9, ease: EXPO, delay: 0.25, onUpdate: write });
    return () => run.stop();
  }, [counts, seen, target, figure]);

  return (
    <>
      <span ref={ref} aria-hidden>
        {figure}
      </span>
      <span className="sr-only">{figure}</span>
    </>
  );
}

/** A field for a company with no pictures: a soft green light over a fine grid. */
function Field() {
  return (
    <div className="absolute inset-0 bg-black">
      <div
        className="absolute inset-0 opacity-70 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.07) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          backgroundPosition: "center",
        }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,oklch(0.82_0.17_152/0.16),transparent_70%)]" />
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Slides                                                                                                               */
/* ------------------------------------------------------------------------------------------------------------------ */

/** Where the strip stands at each point of the scroll, in slides: still on each for a while, moving between them. */
function stops(count: number) {
  const n = Math.max(1, count - 1);
  const half = HOLD / n / 2;
  const input: number[] = [];
  const output: number[] = [];
  for (let i = 0; i < count; i++) {
    const at = i / n;
    input.push(Math.max(0, at - half), Math.min(1, at + half));
    output.push(i, i);
  }
  return { input, output };
}

/**
 * The products, one full screen each, side by side. The strip pins to the screen and the page's scroll carries it
 * sideways, one slide per screen of scroll, holding on each before the next comes in. The controls show where you
 * are and jump to a slide; a slide's footage plays while it is the one in front.
 */
function Slides({ slides, reduce }: { slides: TimelineSlide[]; reduce: boolean }) {
  const count = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const eased = useSpring(scrollYProgress, { stiffness: 200, damping: 38, mass: 0.35, restDelta: 0.0001 });
  const { input, output } = useMemo(() => stops(count), [count]);
  const pos = useTransform(eased, input, output);
  const x = useTransform(pos, (p) => `${(-p * 100) / count}%`);
  const [at, setAt] = useState(0);

  useMotionValueEvent(pos, "change", (p) => {
    const i = Math.min(count - 1, Math.max(0, Math.round(p)));
    setAt((prev) => (prev === i ? prev : i));
  });

  /** Scroll the page to the point where slide `i` holds. */
  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const n = Math.min(count - 1, Math.max(0, i));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (run * n) / Math.max(1, count - 1), behavior: "smooth" });
  };

  if (reduce) {
    return (
      <div role="region" aria-label="Products">
        {slides.map((slide, i) => (
          <div key={slide.name} className="relative h-[100svh] overflow-hidden">
            <Slide slide={slide} index={i} count={count} on live={false} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div
      ref={track}
      role="region"
      aria-roledescription="carousel"
      aria-label="Products"
      className="relative"
      style={{ height: `${count * 100}svh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <motion.div className="flex h-full" style={{ width: `${count * 100}%`, x }}>
          {slides.map((slide, i) => (
            <div key={slide.name} className="relative h-full shrink-0 overflow-hidden" style={{ width: `${100 / count}%` }}>
              <Slide slide={slide} index={i} count={count} pos={pos} on={i === at} live={i === at && inView} />
            </div>
          ))}
        </motion.div>

        {/* Where you are on the strip, centred between the two arrows */}
        <div className="absolute inset-x-0 bottom-0 z-10">
          <div className={cn(FRAME, "pb-6 md:pb-8")}>
            <div className="flex items-center gap-4 md:gap-6">
              <SlideButton label="Previous" onClick={() => go(at - 1)} disabled={at === 0}>
                <ChevronLeft className="size-4" />
              </SlideButton>
              <div className="min-w-0 flex-1">
                <span className="relative block h-[2px] overflow-hidden rounded-full bg-white/20">
                  <motion.span className="absolute inset-0 origin-left bg-signal" style={{ scaleX: eased }} />
                </span>
                <ol className="mt-3 hidden gap-3 sm:grid" style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}>
                  {slides.map((slide, i) => {
                    const on = i === at;
                    return (
                      <li key={slide.name} className="min-w-0 text-center">
                        <button
                          type="button"
                          onClick={() => go(i)}
                          aria-current={on ? "true" : undefined}
                          className={cn(
                            "inline-block max-w-full cursor-pointer truncate rounded-sm text-[0.8125rem] outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-signal/60",
                            on ? "text-white" : "text-white/50 hover:text-white/85"
                          )}
                        >
                          <span className="mr-1.5 tabular-nums text-white/40">{String(i + 1).padStart(2, "0")}</span>
                          {slide.name}
                        </button>
                      </li>
                    );
                  })}
                </ol>
                <p className="mt-3 truncate text-center text-[0.8125rem] tabular-nums text-white/75 sm:hidden">
                  {String(at + 1).padStart(2, "0")} / {String(count).padStart(2, "0")} · {slides[at].name}
                </p>
              </div>
              <SlideButton label="Next" onClick={() => go(at + 1)} disabled={at === count - 1}>
                <ChevronRight className="size-4" />
              </SlideButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SlideButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm outline-none transition-[color,border-color,opacity] duration-300 hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/60 disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/20 disabled:hover:text-white md:size-11"
    >
      {children}
    </button>
  );
}

/**
 * One product, full screen. On the strip, its layers move at their own pace: the backdrop drifts slower than the
 * strip and eases out of a zoom, the words and the picture travel a little further and fade, so a slide arriving
 * settles into place rather than sliding in flat.
 */
function Slide({
  slide,
  index,
  count,
  pos,
  on,
  live,
}: {
  slide: TimelineSlide;
  index: number;
  count: number;
  pos?: MotionValue<number>;
  on: boolean;
  live: boolean;
}) {
  const still = useMotionValue(index);
  const o = useTransform(pos ?? still, (p) => index - p);
  const bgX = useTransform(o, (v) => `${-v * 16}%`);
  const bgScale = useTransform(o, (v) => 1 + Math.min(1, Math.abs(v)) * 0.32);
  const wordsX = useTransform(o, (v) => `${v * 26}%`);
  const wordsOpacity = useTransform(o, (v) => 1 - Math.min(1, Math.abs(v) * 1.6));
  const visualX = useTransform(o, (v) => `${v * 48}%`);
  const visualOpacity = useTransform(o, (v) => 1 - Math.min(1, Math.abs(v) * 1.3));
  const visualScale = useTransform(o, (v) => 1 - Math.min(1, Math.abs(v)) * 0.1);
  const moving = !!pos;

  const visual = slide.phones || slide.picture || slide.cards;
  const tall = !!slide.picture && slide.picture.height > slide.picture.width;

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}: ${slide.name}`}
      aria-hidden={!on}
      inert={!on}
      className="relative isolate size-full"
    >
      <motion.div aria-hidden className="absolute inset-0 -z-10" style={moving ? { x: bgX, scale: bgScale } : undefined}>
        <Image
          src={slide.backdrop.src}
          alt=""
          fill
          sizes="100vw"
          className={cn("object-cover", slide.backdrop.soft && "scale-110 blur-2xl saturate-[1.15]")}
        />
        {slide.backdrop.video && <Footage src={slide.backdrop.video} live={live} />}
      </motion.div>
      <div aria-hidden className="absolute inset-0 -z-10 bg-black/58" />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,oklch(0_0_0/0.6),transparent_24%,transparent_62%,oklch(0_0_0/0.9))]"
      />

      <div className={cn(FRAME, "flex h-full items-center pb-32 pt-24 md:pb-36")}>
        <div
          className={cn(
            "grid w-full items-center gap-8 md:gap-10",
            // Centred when the words stand alone or above the picture; beside it, they keep to their column.
            visual ? "justify-items-center text-center lg:grid-cols-2 lg:justify-items-stretch lg:gap-16 lg:text-left" : "justify-items-center text-center"
          )}
        >
          <motion.div
            className={cn("min-w-0", !visual && "max-w-[46rem]")}
            style={moving ? { x: wordsX, opacity: wordsOpacity } : undefined}
          >
            <p className="text-[0.8125rem] font-medium tracking-[0.02em] text-white/70 md:text-[0.875rem]">{slide.kind}</p>
            <h4 className="mt-3 text-balance font-display text-[clamp(2.1rem,1.2rem+3.4vw,5rem)] font-[460] leading-[0.95] tracking-[-0.045em] text-white [font-stretch:106%]">
              {slide.name}
            </h4>
            <p
              className={cn(
                "mx-auto mt-4 max-w-[40ch] text-pretty text-[clamp(1rem,0.92rem+0.35vw,1.25rem)] leading-[1.45] text-white/80 md:mt-5",
                visual && "lg:mx-0"
              )}
            >
              {slide.line}
            </p>
            {slide.figure && (
              <p className={cn("mt-6 flex flex-col items-center gap-2 md:mt-9", visual && "lg:items-start")}>
                <span className="font-display text-[clamp(3.2rem,2rem+5vw,8rem)] font-[440] leading-[0.85] tracking-[-0.055em] text-signal tabular-nums [font-stretch:108%]">
                  {slide.figure.figure}
                </span>
                <span className="text-[0.875rem] text-white/75 md:text-[0.9375rem]">{slide.figure.label}</span>
              </p>
            )}
          </motion.div>

          {visual && (
            <motion.div
              className="flex min-w-0 flex-col items-center gap-4"
              style={moving ? { x: visualX, opacity: visualOpacity, scale: visualScale } : undefined}
            >
              {slide.phones && (
                <ul className="grid w-full max-w-[34rem] grid-cols-4 gap-2.5 sm:gap-3.5">
                  {slide.phones.map((s) => (
                    <li
                      key={s.src}
                      className="overflow-hidden rounded-[14px] border border-white/15 bg-black shadow-[0_24px_60px_-20px_black] sm:rounded-[18px]"
                    >
                      <Image src={s.src} width={s.width} height={s.height} alt={s.alt} sizes="(min-width: 1024px) 130px, 22vw" className="h-auto w-full" />
                    </li>
                  ))}
                </ul>
              )}
              {slide.picture && (
                <div
                  className={cn(
                    "overflow-hidden rounded-[16px] border border-white/15 bg-black shadow-[0_30px_80px_-24px_black]",
                    slide.phones ? "hidden w-full max-w-[34rem] sm:block" : tall ? "w-auto" : "w-full"
                  )}
                  style={!slide.phones && !tall ? { maxWidth: `${slide.picture.width}px` } : undefined}
                >
                  <Image
                    src={slide.picture.src}
                    width={slide.picture.width}
                    height={slide.picture.height}
                    alt={slide.picture.alt}
                    sizes="(min-width: 1024px) 560px, 90vw"
                    className={cn("h-auto", tall ? "max-h-[30svh] w-auto lg:max-h-[60svh]" : "w-full")}
                  />
                </div>
              )}
              {slide.cards && (
                <ul className="grid w-full max-w-[30rem] gap-2.5 md:gap-3">
                  {slide.cards.map((card) => (
                    <li key={card.name} className="rounded-[16px] border border-white/15 bg-black/45 px-5 py-4 backdrop-blur-md md:px-6 md:py-5">
                      <p className="text-[1rem] font-medium text-white md:text-[1.0625rem]">{card.name}</p>
                      <p className="mt-1 hidden text-[0.875rem] leading-snug text-white/70 sm:block">{card.line}</p>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* The rest of the record                                                                                               */
/* ------------------------------------------------------------------------------------------------------------------ */

function Also({ lines, reduce }: { lines: string[]; reduce: boolean }) {
  return (
    <div className={cn(FRAME, "py-16 md:py-24")}>
      <ul className={cn("mx-auto grid max-w-[60rem] gap-8 md:gap-12", lines.length > 1 && "sm:grid-cols-2")}>
        {lines.map((line, i) => (
          <motion.li
            key={line}
            className="flex flex-col items-center gap-4 text-center"
            initial={reduce ? false : { opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 0.9, ease: EXPO, delay: i * 0.1 }}
          >
            <span aria-hidden className="h-px w-10 bg-signal" />
            <span className="max-w-[40ch] text-pretty text-[0.9375rem] leading-relaxed text-white/72 md:text-[1rem]">{line}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* Footage                                                                                                              */
/* ------------------------------------------------------------------------------------------------------------------ */

/**
 * Silent footage over its first frame: nothing loads until it is first `live`; it plays while `live` and holds its
 * frame otherwise, and fades in over the still once it is actually playing.
 */
function Footage({ src, live }: { src: string; live: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (live) video.play().catch(() => {});
    else video.pause();
  }, [live]);

  return (
    <video
      ref={ref}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      disablePictureInPicture
      disableRemotePlayback
      tabIndex={-1}
      onPlaying={() => setShown(true)}
      className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", shown ? "opacity-100" : "opacity-0")}
    />
  );
}
