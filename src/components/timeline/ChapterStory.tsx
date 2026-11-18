"use client";

import { AnimatePresence, motion, useInView, useMotionValueEvent, useScroll, useSpring } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, Play } from "lucide-react";
import Image from "next/image";
import React, { useRef, useState } from "react";
import type { TimelineChapter, TimelineFilm, TimelinePatent, TimelineSlide, TimelineStill } from "@/lib/timeline";
import { cn } from "@/lib/utils";
import { ProductScene } from "@/components/scenes";
import { Footage } from "./Footage";
import { runtime, TimelineDialog, type DialogContent } from "./TimelineDialog";

const EXPO = [0.16, 1, 0.3, 1] as const;
/** Screens of scroll between one picture and the next. */
const STEP = 0.8;
const FRAME = "container-site lg:px-16";
const PLATE = "overflow-hidden rounded-[20px] border border-white/[0.12] bg-[oklch(0.085_0_0)]";
const BAR = "flex items-center justify-between gap-4 border-b border-white/[0.09] px-6 py-3.5 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-white/55";

const pad = (n: number) => String(n).padStart(2, "0");
/** Google Patents' page for a US patent number as printed ("5,910,988"). */
const patentHref = (number: string) => `https://patents.google.com/patent/US${number.replace(/,/g, "")}A`;

type Open = (content: DialogContent) => void;

/**
 * A company's products as two boxes with the timeline's line between them, after the hardware stack on the Xura site:
 * on the left an overview of the company that stays put; on the right a picture box that changes as the page scrolls,
 * its words beneath. The line fills as you go, a mark for each picture, and each mark jumps to its picture. A picture
 * with a film carries a play button that opens it in a popup; patents and photos open at full size.
 *
 * On narrow screens, and with reduced motion, the overview comes first and the pictures follow it, one after another.
 */
export function ChapterStory({ chapter, reduce }: { chapter: TimelineChapter; reduce: boolean }) {
  const slides = chapter.scene.slides ?? [];
  const films = chapter.scene.films ?? [];
  const [dialog, setDialog] = useState<DialogContent | null>(null);
  if (!slides.length) return null;

  return (
    <>
      {!reduce && <Pinned chapter={chapter} slides={slides} films={films} open={setDialog} />}
      <div className={cn(FRAME, "py-14 md:py-20", !reduce && "lg:hidden")}>
        <Overview chapter={chapter} />
        <ol className="mt-5 grid gap-5 md:mt-6 md:gap-6">
          {slides.map((slide, i) => (
            <li key={slide.name} className={cn(PLATE, "flex flex-col")}>
              <div className={BAR}>
                <span className="truncate">{slide.kind}</span>
                <span className="shrink-0 tabular-nums">
                  {pad(i + 1)} / {pad(slides.length)}
                </span>
              </div>
              <div className={cn("relative grid sm:aspect-[16/10]", slide.patents ? "aspect-[4/5]" : "aspect-[4/3]")}>
                <Stage slide={slide} films={films} live={false} open={setDialog} stacked />
              </div>
              <Caption slide={slide} />
            </li>
          ))}
        </ol>
      </div>
      <TimelineDialog content={dialog} onClose={() => setDialog(null)} />
    </>
  );
}

/** The two boxes pinned to the screen while the page scrolls through the pictures. Wide screens only. */
function Pinned({ chapter, slides, films, open }: { chapter: TimelineChapter; slides: TimelineSlide[]; films: TimelineFilm[]; open: Open }) {
  const count = slides.length;
  const track = useRef<HTMLDivElement>(null);
  const inView = useInView(track);
  const { scrollYProgress } = useScroll({ target: track, offset: ["start start", "end end"] });
  const fill = useSpring(scrollYProgress, { stiffness: 220, damping: 40, mass: 0.3, restDelta: 0.0005 });
  const [at, setAt] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const i = Math.min(count - 1, Math.max(0, Math.round(p * (count - 1))));
    setAt((prev) => (prev === i ? prev : i));
  });

  /** Scroll the page to where picture `i` is shown. */
  const go = (i: number) => {
    const el = track.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const run = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (run * i) / Math.max(1, count - 1), behavior: "smooth" });
  };

  const slide = slides[at];
  const { years } = chapter;

  return (
    <div ref={track} className="relative hidden lg:block" style={{ height: `${100 + (count - 1) * STEP * 100}svh` }}>
      <div className="sticky top-0 flex h-[100svh] items-center">
        <div className={cn(FRAME, "w-full pb-8 pt-24")}>
          <div className="grid h-[min(46rem,calc(100svh-8.5rem))] grid-cols-[minmax(0,0.82fr)_4rem_minmax(0,1.18fr)]">
            <Overview chapter={chapter} status={`${pad(at + 1)} / ${pad(count)} · ${slide.name}`} />

            {/* The line between the two boxes */}
            <nav aria-label={`${chapter.company}: pictures`} className="flex flex-col items-center py-3">
              <span className="text-[0.6875rem] font-medium tabular-nums tracking-[0.04em] text-white/70">{years ? years.from : chapter.marker}</span>
              <div className="relative my-4 w-px flex-1 bg-white/15">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 origin-top bg-signal shadow-[0_0_10px_oklch(0.82_0.17_152/0.6)]"
                  style={{ scaleY: fill }}
                />
                <ol>
                  {slides.map((s, i) => {
                    const on = i === at;
                    return (
                      <li key={s.name} className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2" style={{ top: `${count > 1 ? (i / (count - 1)) * 100 : 0}%` }}>
                        <button
                          type="button"
                          onClick={() => go(i)}
                          aria-label={s.name}
                          aria-current={on ? "true" : undefined}
                          className="group flex size-6 cursor-pointer items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
                        >
                          <span
                            className={cn(
                              "block size-[11px] rounded-full border bg-black transition-[border-color,background-color,box-shadow] duration-500",
                              on
                                ? "border-signal bg-signal shadow-[0_0_14px_3px_oklch(0.82_0.17_152/0.55)]"
                                : i < at
                                  ? "border-signal"
                                  : "border-white/35 group-hover:border-white/75"
                            )}
                          />
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
              <span className="text-[0.6875rem] font-medium tabular-nums tracking-[0.04em] text-white/70">{years ? years.to : ""}</span>
            </nav>

            {/* The picture box */}
            <div className={cn(PLATE, "flex min-h-0 flex-col")}>
              <div className={BAR}>
                <span className="truncate">
                  <b className="font-medium text-white">{chapter.company}</b>
                  <span className="mx-2 text-signal">/</span>
                  {slide.kind}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <StepButton label="Previous picture" onClick={() => go(at - 1)} disabled={at === 0}>
                    <ChevronLeft className="size-3.5" />
                  </StepButton>
                  <span className="w-14 text-center tabular-nums">
                    {pad(at + 1)} / {pad(count)}
                  </span>
                  <StepButton label="Next picture" onClick={() => go(at + 1)} disabled={at === count - 1}>
                    <ChevronRight className="size-3.5" />
                  </StepButton>
                </span>
              </div>
              <div className="relative min-h-0 flex-1 overflow-hidden" aria-live="polite">
                <AnimatePresence initial={false}>
                  <motion.div
                    key={at}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.035 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.7, ease: EXPO }}
                  >
                    <Stage slide={slide} films={films} live={inView} open={open} />
                  </motion.div>
                </AnimatePresence>
              </div>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={at}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3, ease: EXPO }}
                >
                  <Caption slide={slide} />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepButton({ label, onClick, disabled, children }: { label: string; onClick: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className="flex size-7 cursor-pointer items-center justify-center rounded-full border border-white/15 text-white outline-none transition-[color,border-color,opacity] duration-300 hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/60 disabled:cursor-default disabled:opacity-30 disabled:hover:border-white/15 disabled:hover:text-white"
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* The overview box                                                                                                     */
/* ------------------------------------------------------------------------------------------------------------------ */

function Overview({ chapter, status }: { chapter: TimelineChapter; status?: string }) {
  const { scene, years } = chapter;
  const title = scene.overview?.title ?? chapter.company;
  const text = scene.overview?.text ?? scene.summary;

  return (
    <div className={cn(PLATE, "flex min-h-0 flex-col")}>
      <div className={BAR}>
        <b className="font-medium text-white">Overview</b>
        <span className="tabular-nums text-signal">{years ? `${years.from}–${years.to}` : chapter.marker}</span>
      </div>
      <div
        className={cn(
          "min-h-0 flex-1 overflow-y-auto px-6 py-6 md:px-7 md:py-7",
          // Pinned, a long overview scrolls inside its box; the fade says there is more.
          status && "pb-10 [mask-image:linear-gradient(to_bottom,black_calc(100%-2.5rem),transparent)]"
        )}
      >
        <p className="text-[0.8125rem] text-white/55">{chapter.place}</p>
        <h3 className="mt-2 text-balance font-display text-[clamp(1.6rem,1.1rem+1.2vw,2.3rem)] font-[460] leading-[1.02] tracking-[-0.04em] text-white [font-stretch:104%]">
          {title}
        </h3>
        <p className="mt-4 text-pretty text-[1rem] leading-[1.6] text-white/78">{text}</p>
        {scene.figures.length > 0 && (
          <dl className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-white/[0.09] pt-5">
            {scene.figures.map((f) => (
              <div key={f.label} className="flex flex-col-reverse justify-end gap-1">
                <dt className="text-pretty text-[0.8125rem] leading-snug text-white/55">{f.label}</dt>
                <dd className="font-display text-[clamp(1.6rem,1.2rem+0.9vw,2.2rem)] font-[440] leading-none tracking-[-0.045em] text-white tabular-nums [font-stretch:106%]">
                  {f.figure}
                </dd>
              </div>
            ))}
          </dl>
        )}
        {scene.also && (
          <ul className="mt-6 grid gap-3 border-t border-white/[0.09] pt-5">
            {scene.also.map((line) => (
              <li key={line} className="flex gap-3 text-[0.9375rem] leading-[1.55] text-white/68">
                <span aria-hidden className="mt-[0.55em] size-1.5 shrink-0 bg-signal" />
                {line}
              </li>
            ))}
          </ul>
        )}
      </div>
      {status && (
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.09] px-6 py-3.5 text-[0.8125rem] md:px-7">
          <span className="text-white/45">Now showing</span>
          <span className="truncate tabular-nums text-white/85">{status}</span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------------------------------------------------------ */
/* The picture box                                                                                                      */
/* ------------------------------------------------------------------------------------------------------------------ */

/** A picture's words, beneath it: its name, what it was, and its number. */
function Caption({ slide }: { slide: TimelineSlide }) {
  return (
    <div className="flex min-h-[7.5rem] items-start justify-between gap-6 border-t border-white/[0.09] px-6 py-5 md:px-7">
      <div className="min-w-0">
        <p className="font-display text-[clamp(1.2rem,1rem+0.6vw,1.6rem)] font-[460] leading-tight tracking-[-0.03em] text-white">{slide.name}</p>
        <p className="mt-2 max-w-[58ch] text-pretty text-[0.9375rem] leading-[1.55] text-white/68">{slide.line}</p>
      </div>
      {slide.figure && (
        <p className="hidden shrink-0 flex-col items-end gap-1 text-right sm:flex">
          <span className="font-display text-[clamp(2rem,1.4rem+1.6vw,3rem)] font-[440] leading-none tracking-[-0.05em] text-signal tabular-nums [font-stretch:108%]">
            {slide.figure.figure}
          </span>
          <span className="max-w-[20ch] text-[0.8125rem] leading-snug text-white/60">{slide.figure.label}</span>
        </p>
      )}
    </div>
  );
}

/**
 * One picture, filling its box: the slide's backdrop (its footage playing while `live`), and over it whatever the
 * slide shows, from phone screens to a patent's front page. A slide with a film carries a play button. When `stacked`
 * (narrow screens), a slide made mostly of words (a patent, the cards) lets its box grow to fit them instead of
 * spilling over the box's edges.
 */
function Stage({
  slide,
  films,
  live,
  open,
  stacked,
}: {
  slide: TimelineSlide;
  films: TimelineFilm[];
  live: boolean;
  open: Open;
  stacked?: boolean;
}) {
  const film = slide.film ? films.find((f) => f.id === slide.film) : undefined;
  const front = slide.patent ? (
    <PatentSheet patent={slide.patent} open={open} />
  ) : slide.patents ? (
    <PatentShelf patents={slide.patents} open={open} />
  ) : slide.gallery ? (
    <Gallery stills={slide.gallery} title={slide.name} open={open} />
  ) : slide.phones ? (
    <Phones slide={slide} />
  ) : slide.product ? (
    <Product slug={slide.product} />
  ) : slide.picture ? (
    <Picture still={slide.picture} title={slide.name} open={open} />
  ) : slide.cards ? (
    <Cards slide={slide} />
  ) : null;

  const grow = stacked && !!(slide.patent || slide.cards);

  return (
    <div className={cn("isolate", grow ? "relative" : "absolute inset-0")}>
      <div aria-hidden className="absolute inset-0 -z-10 overflow-hidden">
        <Image
          src={slide.backdrop.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 60vw, 100vw"
          className={cn("object-cover", slide.backdrop.soft && "scale-110 blur-2xl saturate-[1.15]")}
        />
        {slide.backdrop.video && <Footage src={slide.backdrop.video} live={live} />}
      </div>
      <div
        aria-hidden
        className={cn(
          "absolute inset-0 -z-10",
          front ? "bg-black/62" : "bg-[linear-gradient(to_top,oklch(0_0_0/0.55),oklch(0_0_0/0.08)_55%,transparent)]"
        )}
      />
      {front && (
        <div className={cn("flex items-center justify-center p-5 md:p-7", grow ? "relative h-full py-7" : "absolute inset-0")}>{front}</div>
      )}
      {film && <PlayButton film={film} corner={!!front} onClick={() => open({ kind: "film", films, id: film.id })} />}
    </div>
  );
}

/** The play button over a picture with a film: in the middle when the picture stands alone, in a corner otherwise. */
function PlayButton({ film, corner, onClick }: { film: TimelineFilm; corner: boolean; onClick: () => void }) {
  if (corner) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={`Play the film: ${film.title}, ${runtime(film.seconds)}`}
        className="group absolute bottom-3 right-3 flex cursor-pointer items-center gap-2 rounded-full border border-white/25 bg-black/60 py-1.5 pl-1.5 pr-3 sm:bottom-4 sm:right-4 sm:gap-2.5 sm:pr-4 text-[0.8125rem] text-white backdrop-blur-md outline-none transition-colors duration-300 hover:border-signal focus-visible:ring-2 focus-visible:ring-signal/60"
      >
        <span className="flex size-7 items-center justify-center rounded-full bg-signal text-on-signal">
          <Play className="ml-0.5 size-3.5 fill-current" strokeWidth={1.5} />
        </span>
        <span className="hidden sm:inline">Watch the film</span> <span className="tabular-nums text-white/55">{runtime(film.seconds)}</span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Play the film: ${film.title}, ${runtime(film.seconds)}`}
      className="group absolute inset-0 flex cursor-pointer flex-col items-center justify-center gap-3 outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal/60"
    >
      <span className="flex size-16 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 group-hover:scale-105 group-hover:border-signal group-hover:bg-black/65 md:size-20">
        <Play className="ml-1 size-6 fill-current md:size-7" strokeWidth={1.5} />
      </span>
      <span className="rounded-full bg-black/45 px-3 py-1 text-[0.8125rem] text-white/90 backdrop-blur-sm">
        Watch the film <span className="ml-1 tabular-nums text-white/55">{runtime(film.seconds)}</span>
      </span>
    </button>
  );
}

const FRAMED = "overflow-hidden rounded-[12px] border border-white/15 bg-black shadow-[0_24px_60px_-20px_black]";

/** A picture shown whole, no bigger than it is; it opens at full size. */
function Picture({ still, title, open }: { still: TimelineStill; title: string; open: Open }) {
  return (
    <button
      type="button"
      onClick={() => open({ kind: "picture", still, title })}
      aria-label={`${still.alt}. Open it at full size`}
      className="group relative size-full cursor-zoom-in rounded-[12px] outline-none focus-visible:ring-2 focus-visible:ring-signal/60"
      style={{ maxWidth: still.width, maxHeight: still.height }}
    >
      <Image
        src={still.src}
        alt=""
        fill
        sizes="(min-width: 1024px) 640px, 90vw"
        className="object-contain drop-shadow-[0_24px_40px_black]"
      />
      <Zoom />
    </button>
  );
}

function Zoom() {
  return (
    <span
      aria-hidden
      className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-white opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
    >
      <Expand className="size-3.5" />
    </span>
  );
}

/** Phone screens side by side, with the slide's picture beneath when it has one. */
function Phones({ slide }: { slide: TimelineSlide }) {
  return (
    <div className="flex w-full max-w-[26rem] flex-col items-center gap-3">
      <ul className="grid w-full grid-cols-4 gap-2.5">
        {slide.phones!.map((s) => (
          <li key={s.src} className={cn(FRAMED, "rounded-[14px]")}>
            <Image src={s.src} width={s.width} height={s.height} alt={s.alt} sizes="110px" className="h-auto w-full" />
          </li>
        ))}
      </ul>
      {slide.picture && (
        <div className={cn(FRAMED, "w-full")}>
          <Image
            src={slide.picture.src}
            width={slide.picture.width}
            height={slide.picture.height}
            alt={slide.picture.alt}
            sizes="420px"
            className="h-auto w-full"
          />
        </div>
      )}
    </div>
  );
}

function Cards({ slide }: { slide: TimelineSlide }) {
  return (
    <ul className="grid w-full max-w-[28rem] gap-2.5">
      {slide.cards!.map((card) => (
        <li key={card.name} className="rounded-[14px] border border-white/15 bg-black/55 px-5 py-3.5 backdrop-blur-md">
          <p className="text-[1rem] font-medium text-white">{card.name}</p>
          <p className="mt-0.5 text-[0.875rem] leading-snug text-white/68">{card.line}</p>
        </li>
      ))}
    </ul>
  );
}

/** One of our own products as its coded interface recreation, in a frame the shape of a screen. */
function Product({ slug }: { slug: string }) {
  return (
    <div className={cn(FRAMED, "relative aspect-[5/4] h-full max-h-[30rem] max-w-full")}>
      <ProductScene slug={slug} />
    </div>
  );
}

/**
 * Several photos at once. Five: the first large, four beside it. Four: two by two, all the same size. Each opens at
 * full size.
 */
function Gallery({ stills, title, open }: { stills: TimelineStill[]; title: string; open: Open }) {
  const even = stills.length === 4;
  return (
    <ul className={cn("grid aspect-[16/9] max-h-full w-full max-w-[44rem] grid-rows-2 gap-2", even ? "grid-cols-2" : "grid-cols-4")}>
      {stills.map((s, i) => (
        <li key={s.src} className={cn(i === 0 && !even && "col-span-2 row-span-2")}>
          <button
            type="button"
            onClick={() => open({ kind: "picture", still: s, title, caption: s.alt })}
            aria-label={`${s.alt}. Open it at full size`}
            className={cn(FRAMED, "group relative block size-full cursor-zoom-in rounded-[10px] outline-none focus-visible:ring-2 focus-visible:ring-signal/60")}
          >
            <Image src={s.src} alt="" fill sizes={i === 0 || even ? "360px" : "180px"} className="object-cover transition-transform duration-700 group-hover:scale-105" />
          </button>
        </li>
      ))}
    </ul>
  );
}

/** One patent made large: its front page beside its number, its title and the words of its abstract. */
function PatentSheet({ patent, open }: { patent: TimelinePatent; open: Open }) {
  const openPage = () =>
    open({
      kind: "picture",
      still: patent.page,
      title: `U.S. Patent ${patent.number}`,
      caption: `${patent.title}. Granted ${patent.granted}.`,
      href: patentHref(patent.number),
    });
  return (
    <div className="flex size-full items-center gap-6 md:gap-8">
      <button
        type="button"
        onClick={openPage}
        aria-label={`${patent.page.alt}. Open it at full size`}
        className="group relative hidden max-h-full w-[40%] shrink-0 cursor-zoom-in overflow-hidden rounded-[6px] bg-white shadow-[0_30px_70px_-20px_black] outline-none focus-visible:ring-2 focus-visible:ring-signal/60 sm:block"
        style={{ aspectRatio: `${patent.page.width} / ${patent.page.height}` }}
      >
        <Image src={patent.page.src} alt="" fill sizes="280px" className="object-contain" />
        <Zoom />
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-[0.75rem] font-medium uppercase tracking-[0.16em] text-white/55">United States Patent</p>
        <p className="mt-1 font-display text-[clamp(1.9rem,1.1rem+1.9vw,3rem)] font-[460] leading-none tracking-[-0.045em] text-white tabular-nums [font-stretch:106%]">
          {patent.number}
        </p>
        <p className="mt-2 text-[0.8125rem] text-white/60">
          Granted {patent.granted} · {patent.inventor}
        </p>
        <blockquote className="mt-4 line-clamp-[8] border-l-2 border-signal pl-4 text-pretty text-[0.9375rem] leading-[1.6] text-white/85">
          {patent.abstract}
        </blockquote>
        <button
          type="button"
          onClick={openPage}
          className="mt-4 cursor-pointer rounded-sm text-[0.8125rem] text-signal underline-offset-4 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-signal/60 sm:hidden"
        >
          See the front page
        </button>
      </div>
    </div>
  );
}

/** Patents to page through: the front page in front, its neighbours either side; selecting the front one opens it. */
function PatentShelf({ patents, open }: { patents: TimelinePatent[]; open: Open }) {
  const [i, setI] = useState(0);
  const p = patents[i];
  const step = (d: number) => setI((v) => Math.min(patents.length - 1, Math.max(0, v + d)));

  return (
    <div className="relative size-full" role="group" aria-roledescription="carousel" aria-label="Data Treasury's patents">
      <div className="absolute inset-x-0 bottom-16 top-0">
        {patents.map((q, k) => {
          const off = k - i;
          const on = off === 0;
          return (
            <button
              key={q.number}
              type="button"
              tabIndex={Math.abs(off) > 1 ? -1 : 0}
              aria-hidden={Math.abs(off) > 1 ? true : undefined}
              aria-label={on ? `U.S. Patent ${q.number}: open the front page at full size` : `Show U.S. Patent ${q.number}`}
              onClick={() =>
                on
                  ? open({
                      kind: "picture",
                      still: q.page,
                      title: `U.S. Patent ${q.number}`,
                      caption: `${q.title}. Granted ${q.granted}.`,
                      href: patentHref(q.number),
                    })
                  : setI(k)
              }
              className={cn(
                "absolute left-1/2 top-0 h-full overflow-hidden rounded-[6px] bg-white shadow-[0_30px_70px_-20px_black] outline-none transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:ring-2 focus-visible:ring-signal/60",
                on ? "cursor-zoom-in" : "cursor-pointer",
                Math.abs(off) > 2 && "pointer-events-none"
              )}
              style={{
                aspectRatio: "1100 / 1520",
                transform: `translateX(calc(-50% + ${off} * 82%)) scale(${on ? 1 : 0.84})`,
                opacity: on ? 1 : Math.abs(off) === 1 ? 0.45 : 0,
                filter: on ? "none" : "grayscale(1) brightness(0.7)",
                zIndex: 10 - Math.abs(off),
              }}
            >
              <Image src={q.page.src} alt="" fill sizes="300px" className="object-contain" />
            </button>
          );
        })}
      </div>
      <div className="absolute inset-x-0 bottom-0 flex h-12 items-center justify-between gap-3">
        <StepButton label="Previous patent" onClick={() => step(-1)} disabled={i === 0}>
          <ChevronLeft className="size-3.5" />
        </StepButton>
        <p className="min-w-0 text-center" aria-live="polite">
          <span className="block font-display text-[1.0625rem] font-[460] tracking-[-0.02em] text-white tabular-nums">
            U.S. Patent {p.number}
          </span>
          <span className="block truncate text-[0.75rem] text-white/60">
            {p.granted} · {p.title}
          </span>
        </p>
        <StepButton label="Next patent" onClick={() => step(1)} disabled={i === patents.length - 1}>
          <ChevronRight className="size-3.5" />
        </StepButton>
      </div>
    </div>
  );
}
