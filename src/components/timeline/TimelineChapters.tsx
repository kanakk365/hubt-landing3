"use client";

import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import React, { useRef } from "react";
import { TIMELINE, type TimelineChapter } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
/** Sides slide in a touch before they are fully on screen, however tall the chapter. */
const VIEW = { once: true, margin: "0px 0px -12% 0px" } as const;

/** Scroll to chapter `i`. */
export function scrollToChapter(i: number, reduce: boolean) {
  document.getElementById(TIMELINE[i].id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
}

/**
 * The companies down one line, as on the History page: the line draws itself
 * as you scroll, with a light at its head, and each chapter comes in from
 * either side as it reaches the middle of the screen, its text from one side
 * and its collage from the other. The year on the line lights while its
 * chapter holds the middle, and the line ends at Now. On phones the line runs
 * down the left edge; with reduced motion it is drawn and everything is in place.
 */
export function TimelineChapters() {
  const reduce = !!useReducedMotion();
  const axis = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: axis, offset: ["start 55%", "end 55%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4, restDelta: 0.0001 });
  const head = useTransform(drawn, (v) => `${(v * 100).toFixed(3)}%`);
  const view = { once: true, amount: 0.6 } as const;

  return (
    <section id="chapters" data-nav-tone="dark" aria-labelledby="chapters-title" className="relative pt-16 md:pt-24">
      <div className="container-site">
        <motion.h2
          id="chapters-title"
          initial={reduce ? false : "hidden"}
          whileInView="shown"
          viewport={view}
          className="font-display text-balance text-[clamp(2rem,1.15rem+2.3vw,3.3rem)] font-[460] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%] md:text-center"
        >
          {["The companies behind HubTech.", "What each one built."].map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.06em]">
              <motion.span
                className={cn("block", i === 1 && "text-fg-subtle")}
                variants={{ hidden: { y: "105%" }, shown: { y: "0%" } }}
                transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </motion.h2>

        <div ref={axis} className="relative mt-12 md:mt-20">
          {/* The line: its track, the part drawn so far, and the light at its head */}
          <span aria-hidden className="absolute bottom-0 left-[19px] top-0 w-px -translate-x-1/2 bg-line md:left-1/2" />
          <motion.span
            aria-hidden
            className="absolute bottom-0 left-[19px] top-0 w-[2px] origin-top -translate-x-1/2 bg-gradient-to-b from-signal/40 via-signal to-signal shadow-[0_0_14px_oklch(0.82_0.17_152/0.5)] md:left-1/2"
            style={reduce ? { scaleY: 1 } : { scaleY: drawn }}
          />
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute left-[19px] z-20 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[oklch(0.96_0.06_152)] shadow-[0_0_14px_4px_oklch(0.82_0.17_152/0.65)] md:left-1/2"
              style={{ top: head }}
            />
          )}
          <ol className="relative">
            {TIMELINE.map((c, i) => (
              <Chapter key={c.id} chapter={c} index={i} reduce={reduce} />
            ))}
          </ol>
        </div>

        {/* The line ends at Now, which carries on into the next section. */}
        <div className="relative flex pb-4 pt-2 md:justify-center">
          <a
            href="#now"
            className="group relative z-10 -ml-[7px] flex items-center gap-2 rounded-full border border-signal bg-black px-3 py-1 text-[0.8125rem] font-medium text-fg shadow-[0_0_0_6px_black] outline-none transition-colors hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/60 md:ml-0"
          >
            <span aria-hidden className="relative flex size-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-signal/60 motion-reduce:hidden" />
              <span className="relative size-2 rounded-full bg-signal" />
            </span>
            Now
          </a>
        </div>
      </div>
    </section>
  );
}

function Chapter({ chapter, index, reduce }: { chapter: TimelineChapter; index: number; reduce: boolean }) {
  const year = useRef<HTMLSpanElement>(null);
  // The line is drawn to 55% of the screen, so the year lights the moment the line reaches it, and dims again if
  // you scroll back above it.
  const lit = useInView(year, { margin: "0px 0px -45% 0px" });
  const left = index % 2 === 0;
  const label = chapter.years ? String(chapter.years.from) : chapter.marker;

  return (
    <li
      id={chapter.id}
      className="relative isolate grid scroll-mt-[96px] grid-cols-1 items-center gap-10 py-14 md:grid-cols-2 md:gap-28 md:py-20"
    >
      {/* The year on the line */}
      <span
        ref={year}
        aria-hidden
        className={cn(
          "absolute left-[19px] top-[3.5rem] z-10 -translate-x-1/2 rounded-full border bg-black px-2.5 py-1 text-[0.75rem] font-medium tabular-nums transition-[color,border-color,box-shadow] duration-700 md:left-1/2 md:top-1/2 md:-translate-y-1/2",
          lit
            ? "border-signal text-fg shadow-[0_0_22px_oklch(0.82_0.17_152/0.45),0_0_0_6px_black]"
            : "border-line-strong text-fg-subtle shadow-[0_0_0_6px_black]"
        )}
      >
        {label}
      </span>

      {/* A faint green light on the collage's side while the chapter is lit */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-[120%] -translate-x-1/2 transition-opacity duration-1000"
        style={{
          opacity: lit ? 1 : 0,
          background: `radial-gradient(38% 50% at ${left ? "72%" : "28%"} 50%, oklch(0.82 0.17 152 / 0.07), transparent 70%)`,
        }}
      />

      <motion.div
        initial={reduce ? false : { opacity: 0, x: left ? -40 : 40 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={VIEW}
        transition={{ duration: 0.9, ease: EASE }}
        className={cn("min-w-0 pl-12 md:pl-0", left ? "md:text-right" : "md:order-2")}
      >
        <ChapterBody chapter={chapter} end={left} />
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0, x: left ? 60 : -60, scale: 0.97 }}
        whileInView={{ opacity: 1, x: 0, scale: 1 }}
        viewport={VIEW}
        transition={{ duration: 1, ease: EASE, delay: 0.1 }}
        className={cn("flex min-w-0 justify-center pl-12 md:pl-0", left ? "md:justify-start" : "md:order-1 md:justify-end")}
      >
        <Plate chapter={chapter} />
      </motion.div>
    </li>
  );
}

/** The chapter's words. `end` sets them against the line on the left-hand side. */
function ChapterBody({ chapter, end }: { chapter: TimelineChapter; end: boolean }) {
  // DestinationKP's figures sit on its plate, so its copy carries only the lede and the approvals.
  const listed = !!chapter.image;
  return (
    <div className="@container">
      <h3 className="font-display text-[clamp(2.2rem,1.4rem+2.4vw,3.6rem)] font-[420] leading-[0.98] tracking-[-0.04em] text-fg [font-stretch:108%]">
        {chapter.company}
      </h3>
      {/* Sized to the column, so the longest tagline still holds on one line. */}
      <p className="font-display mt-2 text-balance text-[clamp(1.05rem,4.8cqi,1.5rem)] font-[440] leading-[1.15] tracking-[-0.025em] text-fg-subtle">
        {chapter.tagline}
      </p>
      <p className="mt-4 text-[0.8125rem] tabular-nums text-fg-muted">
        {chapter.years ? `${chapter.years.from}–${chapter.years.to} · ${chapter.place}` : chapter.place}
      </p>
      <p className={cn("mt-5 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-muted", end && "md:ml-auto")}>{chapter.lede}</p>
      {listed && (
        <dl className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {chapter.items.map((item) => (
            <div key={item.name} className="border-t border-line pt-3">
              <dt className="text-[0.9375rem] font-medium tracking-[-0.01em] text-fg">{item.name}</dt>
              <dd className="mt-1 text-[0.875rem] leading-snug text-fg-muted">{item.line}</dd>
            </div>
          ))}
        </dl>
      )}
      {chapter.facts && (
        <div className="mt-5 flex flex-col gap-1.5 text-[0.8125rem] leading-snug text-fg-subtle">
          {chapter.facts.map((f) => (
            <p key={f} className={cn("max-w-[62ch]", end && "md:ml-auto")}>
              {f}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

/** The chapter's picture: its collage, cut along its own torn edge, or for DestinationKP the site in four figures. */
function Plate({ chapter }: { chapter: TimelineChapter }) {
  if (chapter.image) {
    const { image } = chapter;
    return (
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        sizes="(min-width: 768px) 45vw, 100vw"
        className="h-auto max-h-[min(600px,72svh)] w-auto max-w-full object-contain"
      />
    );
  }
  return (
    <div className="@container relative flex w-full max-w-[34rem] flex-col overflow-hidden rounded-[28px] border border-line bg-[oklch(0.07_0_0)]">
      <div
        aria-hidden
        className="absolute inset-0 opacity-60 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, oklch(1 0 0 / 0.07) 1px, transparent 1px), linear-gradient(to bottom, oklch(1 0 0 / 0.07) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          backgroundPosition: "center",
        }}
      />
      {/* Each figure is sized to its cell (cqi less the padding), so the longest, "Connected athletes", never breaks. */}
      <dl className="relative grid grid-cols-1 @[22rem]:grid-cols-2">
        {chapter.items.map((item, i) => (
          <div
            key={item.name}
            className={cn(
              "flex flex-col gap-1.5 border-line p-6",
              i < 3 && "border-b",
              i === 2 && "@[22rem]:border-b-0",
              i % 2 === 0 && "@[22rem]:border-r"
            )}
          >
            <dt className="whitespace-nowrap font-display text-[clamp(1.25rem,calc(11.3cqi-5.6px),1.9rem)] font-[440] leading-[1.05] tracking-[-0.03em] text-fg @[22rem]:text-[clamp(1rem,calc(5.6cqi-5.6px),1.9rem)]">
              {item.name}
            </dt>
            <dd className="text-[0.875rem] leading-snug text-fg-muted">{item.line}</dd>
          </div>
        ))}
      </dl>
      <div className="relative flex items-center gap-2 border-t border-line px-6 py-4 text-[0.8125rem] text-fg-muted">
        <span aria-hidden className="size-1.5 rounded-full bg-signal" />
        {chapter.place}
      </div>
    </div>
  );
}
