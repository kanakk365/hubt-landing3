"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Play } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState } from "react";
import { FILM, type TimelineMedia } from "@/lib/timeline";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

const runtime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

/**
 * A chapter's footage: the company's own films, one screen and its clip list. Nothing loads from YouTube until a
 * film is played; until then the screen shows the film's poster, stored with the site. Choosing a clip plays it.
 * Beneath, when the chapter has them, sit phone screenshots and one dated capture. Everything is shown flat; the
 * poster crossfades when the clip changes, and a film with a `loop` plays that short silent cut over its poster
 * while the screen is in view (never with reduced motion). Pressing play opens the full film, with sound.
 */
export function ChapterFootage({ media }: { media: TimelineMedia }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();
  const film = media.films[active];
  const many = media.films.length > 1;

  const choose = (i: number) => {
    setActive(i);
    setPlaying(true);
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] border border-line bg-[oklch(0.075_0_0)]">
      <div className={cn("grid grid-cols-1", many && "lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]")}>
        {/* The screen */}
        <div className="relative aspect-video bg-black">
          {playing ? (
            <iframe
              key={film.id}
              src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&rel=0&playsinline=1`}
              title={`${film.title}: ${film.note}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 size-full"
            />
          ) : (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label={`Play ${film.title}, ${runtime(film.seconds)}`}
              className="group absolute inset-0 size-full cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-signal/70"
            >
              <AnimatePresence initial={false}>
                <motion.span
                  key={film.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <Image src={`${FILM}/${film.id}.webp`} alt="" fill sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
                  {film.loop && !reduce && <Loop key={film.loop} src={film.loop} />}
                </motion.span>
              </AnimatePresence>
              <span
                aria-hidden
                className="absolute inset-0 bg-[linear-gradient(to_top,oklch(0_0_0/0.78),oklch(0_0_0/0.1)_45%,transparent)]"
              />
              <span
                aria-hidden
                className="absolute left-1/2 top-1/2 flex size-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/45 text-white backdrop-blur-md transition-[background-color,border-color,transform] duration-300 group-hover:scale-105 group-hover:border-signal group-hover:bg-black/65 sm:size-16 md:size-20"
              >
                <Play className="ml-1 size-5 fill-current sm:size-6 md:size-7" strokeWidth={1.5} />
              </span>
              <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-left sm:p-5 md:p-7">
                {/* On phones the clip list beneath names the film, so the screen keeps to its runtime. */}
                <span className="hidden min-w-0 sm:block">
                  <span className="block font-display text-[clamp(1.1rem,0.9rem+0.8vw,1.6rem)] font-[440] leading-tight tracking-[-0.025em] text-white">
                    {film.title}
                  </span>
                  <span className="mt-1 block text-[0.875rem] text-white/70">{film.note}</span>
                </span>
                <span className="ml-auto shrink-0 rounded-full border border-white/20 bg-black/40 px-2.5 py-1 text-[0.75rem] tabular-nums text-white/85 backdrop-blur-sm">
                  {runtime(film.seconds)}
                </span>
              </span>
            </button>
          )}
        </div>

        {/* The clips. Side by side, the screen sets the height and the list fits it. */}
        {many && (
          <div className="relative border-t border-line lg:border-l lg:border-t-0">
            <ol className="flex flex-col lg:absolute lg:inset-0 lg:overflow-y-auto">
              {media.films.map((f, i) => {
                const on = i === active;
                return (
                  <li key={f.id} className="border-b border-line last:border-b-0 lg:flex-1">
                    <button
                      type="button"
                      onClick={() => choose(i)}
                      aria-current={on ? "true" : undefined}
                      className={cn(
                        "group relative flex size-full items-center gap-4 px-5 py-3 text-left lg:py-2.5 outline-none transition-colors duration-300 focus-visible:bg-white/[0.05] md:px-6",
                        on ? "bg-white/[0.045]" : "hover:bg-white/[0.025]"
                      )}
                    >
                      <span
                        aria-hidden
                        className={cn(
                          "absolute inset-y-0 left-0 w-[2px] bg-signal transition-opacity duration-300",
                          on ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="relative aspect-video w-24 shrink-0 overflow-hidden rounded-[8px] border border-line bg-black md:w-28 lg:w-24">
                        <Image
                          src={`${FILM}/${f.id}.webp`}
                          alt=""
                          fill
                          sizes="112px"
                          className={cn("object-cover transition-opacity duration-300", on ? "opacity-100" : "opacity-70 group-hover:opacity-90")}
                        />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={cn(
                            "block truncate text-[0.9375rem] font-medium tracking-[-0.01em] transition-colors",
                            on ? "text-fg" : "text-fg-muted group-hover:text-fg"
                          )}
                        >
                          {f.title}
                        </span>
                        <span className="mt-0.5 block truncate text-[0.8125rem] text-fg-subtle">{f.note}</span>
                      </span>
                      <span className="shrink-0 text-[0.75rem] tabular-nums text-fg-subtle">{runtime(f.seconds)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3 text-[0.8125rem] text-fg-subtle md:px-7">
        <span>{film.channel ? `From the ${film.channel} channel on YouTube` : "On YouTube"}</span>
        <a
          href={`https://www.youtube.com/watch?v=${film.id}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 rounded-sm text-fg-muted outline-none transition-colors hover:text-fg focus-visible:ring-2 focus-visible:ring-signal/60"
        >
          Watch on YouTube
          <ArrowUpRight aria-hidden className="size-3.5" />
        </a>
      </footer>

      {(media.screens || media.proof) && (
        <div className="flex flex-col gap-6 border-t border-line p-5 md:p-7 xl:flex-row xl:items-end xl:gap-10">
          {media.screens && (
            <ul className="grid shrink-0 grid-cols-4 gap-3 xl:w-[30rem]">
              {media.screens.map((s) => (
                <li key={s.src} className="overflow-hidden rounded-[12px] border border-line-strong bg-black">
                  <Image src={s.src} width={s.width} height={s.height} alt={s.alt} sizes="(min-width: 1280px) 120px, 24vw" className="h-auto w-full" />
                </li>
              ))}
            </ul>
          )}
          {media.proof && (
            <figure className="min-w-0 flex-1">
              <div className="overflow-hidden rounded-[12px] border border-line-strong bg-black">
                <Image
                  src={media.proof.src}
                  width={media.proof.width}
                  height={media.proof.height}
                  alt={media.proof.alt}
                  sizes="(min-width: 1280px) 40vw, 100vw"
                  className="h-auto w-full"
                />
              </div>
              {media.proof.caption && (
                <figcaption className="mt-2.5 flex items-center gap-2 text-[0.8125rem] text-fg-subtle">
                  <span aria-hidden className="size-1.5 rounded-full bg-signal" />
                  {media.proof.caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      )}

      {media.stills && (
        <ul className="grid gap-5 border-t border-line p-5 sm:grid-cols-2 md:gap-6 md:p-7">
          {media.stills.map((still) => (
            <li key={still.src}>
              <figure>
                <div className="overflow-hidden rounded-[12px] border border-line-strong bg-black">
                  <Image src={still.src} width={still.width} height={still.height} alt={still.alt} sizes="(min-width: 640px) 34vw, 100vw" className="h-auto w-full" />
                </div>
                {still.caption && (
                  <figcaption className="mt-2.5 flex items-start gap-2 text-[0.8125rem] leading-snug text-fg-subtle">
                    <span aria-hidden className="mt-[0.4em] size-1.5 shrink-0 rounded-full bg-signal" />
                    {still.caption}
                  </figcaption>
                )}
              </figure>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * A short silent cut of the film, over its poster. It loads only once the screen comes into view, plays while it is
 * in view and pauses when it leaves; until its first frame plays, the poster shows through.
 */
function Loop({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) video.play().catch(() => {});
        else video.pause();
      },
      { threshold: 0.25 }
    );
    io.observe(video);
    return () => io.disconnect();
  }, []);

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
      aria-hidden
      tabIndex={-1}
      onPlaying={() => setShown(true)}
      className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", shown ? "opacity-100" : "opacity-0")}
    />
  );
}
