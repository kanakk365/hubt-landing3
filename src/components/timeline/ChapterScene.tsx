"use client";

import { animate, motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import type { TimelineChapter, TimelineNumber } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { ChapterStory } from "./ChapterStory";
import { Footage } from "./Footage";

const EXPO = [0.16, 1, 0.3, 1] as const;
/** How long a still behind an opening holds before the next. */
const BACKDROP_MS = 7000;
/** Every scene's words sit in the page's container with the same inset on both sides, clear of the year index. */
const FRAME = "container-site lg:px-16";

/**
 * A company told full screen. Its opening grows from a framed picture to the whole screen as it arrives, with the
 * company's own footage (or its pictures) behind; the name rises letter by letter, the line on what it was follows
 * word by word and the figures count up. Then its products, as two boxes with the timeline's line between them: the
 * company's overview, which stays, and a picture box that changes as the page scrolls (see ChapterStory). A company
 * with no products ends on the rest of its record. With reduced motion, nothing moves or plays.
 */
export function ChapterScene({ chapter, index }: { chapter: TimelineChapter; index: number }) {
  const reduce = !!useReducedMotion();
  const { scene } = chapter;

  return (
    <li id={chapter.id} aria-label={chapter.company} className="relative isolate bg-black">
      <Opening chapter={chapter} index={index} reduce={reduce} />
      {scene.slides ? <ChapterStory chapter={chapter} reduce={reduce} /> : scene.also && <Also lines={scene.also} reduce={reduce} />}
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
          className={cn(
            "mx-auto mt-5 text-balance font-display font-[480] leading-[0.86] tracking-[-0.055em] text-white [font-stretch:108%] md:mt-6",
            // A long name (two companies credited together) is set smaller, so it holds to two lines.
            chapter.company.length > 16
              ? "max-w-[16ch] text-[clamp(2.6rem,1rem+5.6vw,7rem)]"
              : "text-[clamp(3.4rem,1.2rem+9.5vw,11.5rem)]"
          )}
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
