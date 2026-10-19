"use client";

import Link from "next/link";
import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { TextLink } from "@/components/site/SectionHeading";
import { Reveal } from "@/components/site/Reveal";
import { CAPABILITIES, HOME } from "@/lib/site";

const EASE = [0.22, 1, 0.36, 1] as const;

/** The four disciplines, introduced by the worlds HubTech has shipped into. */
export function DisciplineIndex() {
  return (
    <section id="what-we-do" data-nav-tone="light" aria-labelledby="disciplines-title" className="tone-light">
      <div className="container-site py-24 md:py-36">
        <Reveal>
          <h2
            id="disciplines-title"
            className="font-display text-[clamp(2.3rem,0.9rem+4.2vw,5rem)] font-[420] leading-[1] tracking-[-0.04em] text-fg [font-stretch:106%]"
          >
            <span className="block">We build software for real</span>
            <span className="sr-only">{HOME.worlds.join(", ")}.</span>
            <WorldBox words={HOME.worlds} />
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col gap-6 md:mt-12 md:flex-row md:items-end md:justify-between">
          <Reveal delay={0.06}>
            <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-fg-muted md:text-lg">
              Four disciplines under one roof, so the people who design it are the people who build,
              test and run it.
            </p>
          </Reveal>
          <Reveal delay={0.1} className="shrink-0">
            <TextLink href="/capabilities">All capabilities</TextLink>
          </Reveal>
        </div>

        <ul className="mt-14 border-t border-line md:mt-20">
          {CAPABILITIES.map((c, i) => (
            <Reveal as="li" key={c.id} delay={i * 0.06}>
              <Link
                href={`/capabilities#${c.id}`}
                className="group relative grid grid-cols-1 gap-x-10 gap-y-4 border-b border-line py-8 outline-offset-[-2px] md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)_minmax(0,0.95fr)_auto] md:items-start md:py-11"
              >
                {/* The black box rises behind the row on hover */}
                <span
                  aria-hidden
                  className="absolute -inset-x-4 inset-y-[-1px] origin-bottom scale-y-[0.35] rounded-[20px] bg-fg opacity-0 transition-[transform,opacity] duration-500 ease-[var(--ease-out-expo)] group-hover:scale-y-100 group-hover:opacity-100 group-focus-visible:scale-y-100 group-focus-visible:opacity-100 md:-inset-x-8"
                />
                <h3 className="font-display relative text-[clamp(1.75rem,1.2rem+1.6vw,2.75rem)] font-[460] leading-[1.02] tracking-[-0.035em] text-fg transition-colors duration-300 [font-stretch:104%] group-hover:text-bg group-focus-visible:text-bg">
                  {c.title}
                </h3>
                <p className="relative max-w-[40ch] text-[0.9375rem] leading-relaxed text-fg-muted transition-colors duration-300 group-hover:text-bg/75 group-focus-visible:text-bg/75 md:pt-2 md:text-base">
                  {c.description}
                </p>
                <ul className="relative flex flex-wrap gap-x-4 gap-y-1.5 text-[0.875rem] text-fg-subtle transition-colors duration-300 group-hover:text-bg/60 group-focus-visible:text-bg/60 md:flex-col md:pt-2.5">
                  {c.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <span
                  aria-hidden
                  className="absolute right-0 top-8 grid size-10 place-items-center rounded-full border border-line-strong text-fg transition-[transform,color,border-color,background-color] duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45 group-hover:border-transparent group-hover:bg-bg group-hover:text-fg group-focus-visible:border-transparent group-focus-visible:bg-bg md:relative md:top-auto md:mt-1"
                >
                  <ArrowUpRight className="size-4" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
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
