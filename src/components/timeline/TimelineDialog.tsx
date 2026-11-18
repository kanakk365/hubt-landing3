"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, X } from "lucide-react";
import Image from "next/image";
import React, { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { FILM, type TimelineFilm, type TimelineStill } from "@/lib/timeline";
import { cn } from "@/lib/utils";

const EXPO = [0.16, 1, 0.3, 1] as const;

/** What the popup shows: one of a chapter's films (with the rest listed), or one picture at full size. */
export type DialogContent =
  | { kind: "film"; films: TimelineFilm[]; id: string }
  | { kind: "picture"; still: TimelineStill; title: string; caption?: string; href?: string };

export const runtime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const noop = () => () => {};

/**
 * The popup over the page. A film plays from YouTube with sound, and the chapter's other films sit beneath it; a
 * picture opens at full size. Escape, the close button or a click outside closes it, and focus returns to where it was.
 */
export function TimelineDialog({ content, onClose }: { content: DialogContent | null; onClose: () => void }) {
  const client = useSyncExternalStore(noop, () => true, () => false);
  if (!client) return null;
  return createPortal(
    <AnimatePresence>{content && <Panel key="dialog" content={content} onClose={onClose} />}</AnimatePresence>,
    document.body
  );
}

function Panel({ content, onClose }: { content: DialogContent; onClose: () => void }) {
  const close = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";
    close.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, [onClose]);

  const label = content.kind === "film" ? "Film" : content.title;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div aria-hidden className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-[72rem]"
        // A film keeps to the screen's height: 16:9 under the space its title and clip list take.
        style={content.kind === "film" ? { maxWidth: `min(72rem, calc((100svh - ${content.films.length > 1 ? 17 : 9}rem) * 16 / 9))` } : undefined}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ duration: 0.5, ease: EXPO }}
      >
        <button
          ref={close}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="fixed right-4 top-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full border border-white/25 bg-black/60 text-white outline-none transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/60"
        >
          <X className="size-4" />
        </button>
        {content.kind === "film" ? <FilmPanel films={content.films} start={content.id} /> : <PicturePanel {...content} />}
      </motion.div>
    </motion.div>
  );
}

function FilmPanel({ films, start }: { films: TimelineFilm[]; start: string }) {
  const [id, setId] = useState(start);
  const film = films.find((f) => f.id === id) ?? films[0];

  return (
    <div className="overflow-hidden rounded-[20px] border border-white/15 bg-black shadow-[0_40px_120px_-30px_black]">
      <div className="relative aspect-video bg-black">
        <iframe
          key={film.id}
          src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&rel=0&playsinline=1`}
          title={`${film.title}: ${film.note}`}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 size-full"
        />
      </div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-t border-white/10 px-5 py-4 md:px-6">
        <p className="font-display text-[1.25rem] font-[440] tracking-[-0.02em] text-white">{film.title}</p>
        <p className="text-[0.875rem] text-white/65">
          {film.note} <span className="ml-2 tabular-nums text-white/45">{runtime(film.seconds)}</span>
        </p>
      </div>
      {films.length > 1 && (
        <ol className="flex gap-3 overflow-x-auto border-t border-white/10 px-5 py-4 md:px-6">
          {films.map((f) => {
            const on = f.id === film.id;
            return (
              <li key={f.id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setId(f.id)}
                  aria-current={on ? "true" : undefined}
                  className="group flex w-40 cursor-pointer flex-col gap-2 rounded-[10px] text-left outline-none focus-visible:ring-2 focus-visible:ring-signal/60 md:w-44"
                >
                  <span
                    className={cn(
                      "relative block aspect-video overflow-hidden rounded-[10px] border transition-colors duration-300",
                      on ? "border-signal" : "border-white/15 group-hover:border-white/40"
                    )}
                  >
                    <Image src={`${FILM}/${f.id}.webp`} alt="" fill sizes="176px" className="object-cover" />
                  </span>
                  <span className={cn("truncate text-[0.8125rem]", on ? "text-white" : "text-white/60 group-hover:text-white/85")}>
                    {f.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function PicturePanel({ still, title, caption, href }: { still: TimelineStill; title: string; caption?: string; href?: string }) {
  const tall = still.height > still.width;
  return (
    <div className="mx-auto flex w-fit max-w-full flex-col overflow-hidden rounded-[20px] border border-white/15 bg-black shadow-[0_40px_120px_-30px_black]">
      <div className={cn("overflow-auto bg-white/[0.03]", tall ? "max-h-[78svh]" : "max-h-[74svh]")}>
        <Image
          src={still.src}
          width={still.width}
          height={still.height}
          alt={still.alt}
          sizes="(min-width: 1024px) 1100px, 100vw"
          className={cn("block h-auto", tall ? "w-[min(54rem,90vw)]" : "w-[min(72rem,90vw)]")}
        />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-t border-white/10 px-5 py-4 md:px-6">
        <div className="min-w-0">
          <p className="font-display text-[1.125rem] font-[440] tracking-[-0.02em] text-white">{title}</p>
          {caption && <p className="mt-0.5 text-[0.875rem] text-white/60">{caption}</p>}
        </div>
        {href && (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-[0.8125rem] text-white outline-none transition-colors hover:border-signal hover:text-signal focus-visible:ring-2 focus-visible:ring-signal/60"
          >
            Read the full patent <ArrowUpRight className="size-3.5" />
          </a>
        )}
      </div>
    </div>
  );
}
