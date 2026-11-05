"use client";

import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { useRef } from "react";
import { PRODUCTS, XURA_PAGE } from "@/lib/site";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";
import { ProductFrame } from "@/components/site/ProductFrame";
import { PageHero } from "@/components/site/PageHero";
import { BookCall } from "@/components/site/BookCall";
import { LinkButton } from "@/components/site/LinkButton";

const EASE = [0.22, 1, 0.36, 1] as const;
const XURA = PRODUCTS.find((p) => p.slug === "xura")!;
const NEXT = PRODUCTS[(PRODUCTS.indexOf(XURA) + 1) % PRODUCTS.length];

type Shot = { src: string; alt: string; label: string };

/** A real Xura screen in the site's window chrome, captioned on phones where the frame hides its label. */
function Screen({ shot, sizes, priority }: { shot: Shot; sizes: string; priority?: boolean }) {
  return (
    <figure>
      <ProductFrame label="Xura" meta={shot.label} demo={false} glow={false} screenClassName="aspect-[4/3] sm:aspect-[16/10]">
        <Image src={shot.src} alt={shot.alt} fill sizes={sizes} priority={priority} className="object-cover object-left-top sm:object-top" />
      </ProductFrame>
      <figcaption className="mt-3 text-[0.8125rem] text-fg-subtle sm:hidden">{shot.label}</figcaption>
    </figure>
  );
}

/* ── Hero ───────────────────────────────────────────────────────────────── */

export function XuraHero() {
  return (
    <PageHero
      title={XURA_PAGE.title}
      lede={XURA_PAGE.lede}
      actions={
        <>
          <BookCall size="lg">Build yours with us</BookCall>
          <LinkButton href="/products">All products</LinkButton>
        </>
      }
      className="pb-0 md:pb-0"
    >
      <HeroScreen />
      <SurfaceIndex />
    </PageHero>
  );
}

/** The platform screen: it rises in tilted back, then lies flat as the page scrolls. */
function HeroScreen() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center 0.45"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.45, restDelta: 0.0001 });
  const rotateX = useTransform(p, [0.35, 1], [16, 0]);
  const scale = useTransform(p, [0.35, 1], [0.93, 1]);

  return (
    <div ref={ref} className="container-site mt-16 [perspective:1800px] md:mt-24">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 90 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: EASE, delay: 0.55 }}
      >
        <motion.div style={reduce ? undefined : { rotateX, scale }} className="origin-top will-change-transform">
          <Screen shot={XURA_PAGE.hero} sizes="(min-width: 1280px) 1150px, 100vw" priority />
        </motion.div>
      </motion.div>
    </div>
  );
}

/** What we build, as jump links under the hero screen: two columns, then three. */
function SurfaceIndex() {
  return (
    <nav aria-label="What we build" className="container-site pb-16 pt-16 md:pb-24 md:pt-20">
      <ol className="grid border-t border-line sm:grid-cols-2 lg:grid-cols-3">
        {XURA_PAGE.work.map((w, i) => (
          <li
            key={w.id}
            className={cn(
              "border-b border-line",
              i % 2 === 0 ? "sm:border-r" : "sm:border-r-0",
              i % 3 === 2 ? "lg:border-r-0" : "lg:border-r"
            )}
          >
            <a
              href={`#${w.id}`}
              className={cn("group flex h-full flex-col gap-2 py-6 sm:px-6 sm:py-8", i % 2 === 0 && "sm:pl-0", i % 3 === 0 ? "lg:pl-0" : "lg:pl-6")}
            >
              <span className="flex items-center justify-between gap-4 text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">
                {w.title}
                <ArrowRight
                  aria-hidden
                  className="size-4 shrink-0 rotate-90 text-fg-subtle transition-[transform,color] duration-500 ease-[var(--ease-out-expo)] group-hover:translate-y-0.5 group-hover:text-signal group-focus-visible:text-signal"
                />
              </span>
              <span className="text-[0.9375rem] leading-relaxed text-fg-muted">{w.short}</span>
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* ── The four workstreams ───────────────────────────────────────────────── */

export function XuraWork() {
  return (
    <>
      {XURA_PAGE.work.map((w, i) => (
        <Surface key={w.id} surface={w} index={i} />
      ))}
    </>
  );
}

function Surface({ surface, index }: { surface: (typeof XURA_PAGE.work)[number]; index: number }) {
  const reduce = useReducedMotion();
  // On phones the second screen is hidden, so the main one stays put rather than drifting into empty space.
  const roomy = useMedia("(min-width: 640px)");
  const section = useRef<HTMLElement>(null);
  const light = index % 2 === 0;
  const flip = index % 2 === 1;
  const second = surface.second;

  // The two screens drift at different speeds as the section passes.
  const { scrollYProgress } = useScroll({ target: section, offset: ["start end", "end start"] });
  const drift = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.5 });
  const backY = useTransform(drift, [0, 1], [50, -50]);
  const frontY = useTransform(drift, [0, 1], [50, -50]);
  const frontRotate = useTransform(drift, [0, 1], [flip ? -1 : 1, flip ? 0.5 : -0.5]);

  return (
    <section
      ref={section}
      id={surface.id}
      data-nav-tone={light ? "light" : "dark"}
      aria-labelledby={`${surface.id}-title`}
      className={cn(light ? "tone-light" : "tone-dark", "relative scroll-mt-[72px] overflow-hidden border-t border-line")}
    >
      <div
        className={cn(
          "container-site grid grid-cols-1 items-center gap-12 py-20 md:py-28 lg:gap-20",
          flip ? "lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]" : "lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)]"
        )}
      >
        <div className={cn("min-w-0", flip && "lg:order-2")}>
          <motion.h2
            id={`${surface.id}-title`}
            initial={reduce ? false : "hidden"}
            whileInView="shown"
            viewport={{ once: true, amount: 0.6 }}
            className="font-display text-[clamp(2.25rem,1rem+3.4vw,4.25rem)] font-[440] tracking-[-0.045em] text-fg [font-stretch:108%] leading-[0.98]"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <motion.span className="block" variants={{ hidden: { y: "108%" }, shown: { y: "0%" } }} transition={{ duration: 1, ease: EASE }}>
                {surface.title}
              </motion.span>
            </span>
          </motion.h2>
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
            className="mt-6 max-w-[48ch] text-[1.0625rem] leading-relaxed text-fg-muted"
          >
            {surface.line}
          </motion.p>
          <ul className="mt-9 flex flex-col">
            {surface.points.map((pt, i) => (
              <motion.li
                key={pt}
                initial={reduce ? false : "hidden"}
                whileInView="shown"
                viewport={{ once: true, margin: "0px 0px -10% 0px" }}
                className="relative flex items-baseline gap-3 py-3.5 text-[0.9375rem] font-medium tracking-[-0.01em] text-fg"
              >
                <motion.span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px origin-left bg-line-strong"
                  variants={{ hidden: { scaleX: 0 }, shown: { scaleX: 1 } }}
                  transition={{ duration: 0.9, ease: EASE, delay: i * 0.08 }}
                />
                <span aria-hidden className="size-[7px] shrink-0 translate-y-[-1px] rounded-full bg-signal" />
                <motion.span
                  variants={{ hidden: { opacity: 0, x: -10 }, shown: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.7, ease: EASE, delay: 0.1 + i * 0.08 }}
                >
                  {pt}
                </motion.span>
              </motion.li>
            ))}
            <li aria-hidden className="h-px bg-line-strong" />
          </ul>
        </div>

        <div className={cn("relative min-w-0", second && "sm:pb-24", flip && "lg:order-1")}>
          <motion.div
            style={reduce || !roomy ? undefined : { y: backY }}
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 1, ease: EASE }}
          >
            <Screen shot={surface.main} sizes="(min-width: 1280px) 700px, (min-width: 1024px) 58vw, 100vw" />
          </motion.div>
          {second && (
            <motion.div
              style={reduce ? undefined : { y: frontY, rotate: frontRotate }}
              className={cn("absolute -bottom-10 hidden w-[44%] sm:block", flip ? "left-0" : "right-0")}
            >
              <Screen shot={second} sizes="(min-width: 1024px) 380px, 50vw" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ── So far: the timeline, what it added, the next product ──────────────── */

export function XuraSoFar() {
  const reduce = useReducedMotion();
  const steps = XURA_PAGE.timeline;
  return (
    <section data-nav-tone="light" aria-labelledby="so-far-title" className="tone-light relative overflow-hidden border-t border-line">
      <div className="container-site py-20 md:py-28">
        <h2
          id="so-far-title"
          className="font-display max-w-[20ch] text-[clamp(2rem,1.15rem+2.3vw,3.3rem)] font-[460] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%]"
        >
          The website, <span className="text-fg-subtle">month by month.</span>
        </h2>

        <ol className="relative mt-14 grid md:mt-20 md:grid-cols-4">
          <motion.li
            aria-hidden
            className="absolute inset-x-0 top-0 hidden h-px origin-left bg-line-strong md:block"
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: 1.4, ease: EASE }}
          />
          {steps.map((step, i) => (
            <motion.li
              key={step.when}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.9, ease: EASE, delay: 0.25 + i * 0.12 }}
              className="relative border-t border-line-strong py-8 md:border-t-0 md:pr-8 md:pt-10"
            >
              <span aria-hidden className="absolute left-0 top-0 hidden size-[9px] -translate-y-1/2 rounded-full bg-signal md:block" />
              <p className="font-mono text-[0.8125rem] uppercase tracking-[0.1em] text-fg-subtle">
                <time dateTime={step.date}>{step.when}</time>
              </p>
              <h3 className="mt-4 text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">{step.title}</h3>
              <p className="mt-2 max-w-[34ch] text-[0.9375rem] leading-relaxed text-fg-muted">{step.line}</p>
            </motion.li>
          ))}
        </ol>

        <div className="mt-16 grid gap-4 border-t border-line pt-10 md:mt-24 md:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] md:gap-20">
          <h3 className="text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">What it proves we can build</h3>
          <div>
            <p className="max-w-[52ch] text-[1.125rem] leading-relaxed text-fg-muted">{XURA.added}</p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {XURA.addedTags.map((t) => (
                <li key={t} className="rounded-full border border-line px-3 py-1 text-[0.8125rem] font-medium text-fg-muted">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link
          href={`/products#${NEXT.slug}`}
          className="group mt-16 flex items-center justify-between gap-6 border-y border-line py-8 md:mt-24 md:py-10"
        >
          <span className="flex flex-col gap-1.5">
            <span className="text-[0.875rem] text-fg-subtle">Next product</span>
            <span className="font-display text-[clamp(1.875rem,1rem+2.6vw,3.6rem)] font-[440] leading-[1] tracking-[-0.04em] text-fg transition-transform duration-500 ease-[var(--ease-out-expo)] [font-stretch:106%] group-hover:translate-x-2">
              {NEXT.name}
            </span>
          </span>
          <span className="grid size-12 shrink-0 place-items-center rounded-full border border-line-strong text-fg transition-[background-color,color,border-color] duration-300 group-hover:border-signal group-hover:bg-signal group-hover:text-black group-focus-visible:border-signal group-focus-visible:bg-signal group-focus-visible:text-black md:size-14">
            <ArrowUpRight className="size-5 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-45 group-focus-visible:rotate-45" />
          </span>
        </Link>
      </div>
    </section>
  );
}
