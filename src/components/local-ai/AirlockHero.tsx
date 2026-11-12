"use client";

import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform } from "framer-motion";
import React, { useRef, useState } from "react";
import { BookCall } from "@/components/site/BookCall";
import { TextLink } from "@/components/site/SectionHeading";
import { HERO_STEPS } from "@/lib/localAi";
import { useMedia } from "@/lib/useMedia";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Airlock, Label, Mono, type Geo } from "./Airlock";
import { EASE, Marked } from "./kit";

const TITLE = ["Use world-class AI,", "without risking company secrets."] as const;
const LEDE =
  "Run sovereign American AI agents right inside your office. Tap into giant outside frontier models when you need extra brainpower, with a mathematical guarantee that 0.00% of your intellectual property ever leaves the building.";

/** Where each stage of the story starts on the pinned scroll. */
const STEP_AT = [0.13, 0.39, 0.63, 0.86] as const;
const stepAt = (v: number) => (v < STEP_AT[0] ? -1 : v < STEP_AT[1] ? 0 : v < STEP_AT[2] ? 1 : v < STEP_AT[3] ? 2 : 3);

const FINAL = {
  title: ["Zero bytes of company IP", "crossed the firewall."],
  body: "Most of the work stayed on the local model. What went out was tags, checked by three frontier models and turned back into real names inside the office.",
} as const;

/**
 * /local-ai opens on the office drawn as a field of data inside a wall, the
 * local model glowing at its heart and the frontier models dim beyond the
 * firewall. The page pins while one request plays out: answered inside,
 * scrubbed at the airlock, checked by three outside models, restored inside.
 */
export function AirlockHero() {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  if (reduce) return <StillHero wide={wide} />;
  return <PinnedHero wide={wide} />;
}

function PinnedHero({ wide }: { wide: boolean }) {
  const section = useRef<HTMLElement>(null);
  const kept = useRef<HTMLSpanElement>(null);
  const sent = useRef<HTMLSpanElement>(null);
  const [step, setStep] = useState(-1);

  const { scrollYProgress } = useScroll({
    target: section,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 110,
    damping: 26,
    mass: 0.4,
    restDelta: 0.0001,
  });

  const out = useTransform(p, [0.03, 0.12], [0, 1], { clamp: true });
  const heroOpacity = useTransform(out, (v) => 1 - v);
  const heroY = useTransform(out, [0, 1], [0, -70]);
  const heroBlur = useTransform(out, (v) => `blur(${(v * 10).toFixed(2)}px)`);
  const bandIn = useTransform(p, [0.12, 0.17], [0, 1], { clamp: true });
  const bandY = useTransform(bandIn, [0, 1], [30, 0]);
  const cue = useTransform(p, [0, 0.04], [1, 0], { clamp: true });

  useMotionValueEvent(p, "change", (v) => {
    const s = stepAt(v);
    setStep((prev) => (prev === s ? prev : s));
  });

  return (
    <section
      ref={section}
      data-nav-tone="dark"
      aria-labelledby="local-hero-title"
      className="tone-dark relative"
      style={{ height: wide ? "520vh" : "440vh" }}
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-black pt-[72px]">
        <div className="relative h-full">
          <Airlock
            progress={p}
            wide={wide}
            onStats={(k, n) => {
              if (kept.current) kept.current.textContent = String(k);
              if (sent.current) sent.current.textContent = String(n);
            }}
            className="absolute inset-0"
          >
            {(geo) => <StoryLabels geo={geo} step={step} />}
          </Airlock>
          <Frame />

          {/* Opening copy */}
          <motion.div style={{ opacity: heroOpacity, y: heroY, filter: heroBlur }} className="pointer-events-none absolute inset-0">
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-t from-black from-[46%] via-black/90 to-transparent lg:h-[52%] lg:from-[8%] lg:via-black/75"
            />
            <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-between px-6 pb-10 pt-8 md:px-8 md:pb-14 md:pt-10">
              <div className="flex items-start justify-end">
                <motion.div
                  aria-hidden
                  style={{ opacity: cue }}
                  className="hidden flex-col items-end gap-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-fg-subtle lg:flex"
                >
                  Scroll to send a request
                  <span className="relative h-8 w-px overflow-hidden bg-line">
                    <span className="absolute inset-x-0 top-0 h-3 animate-[cue-drop_1.8s_var(--ease-out-expo)_infinite] bg-signal" />
                  </span>
                </motion.div>
              </div>
              <OpeningCopy />
            </div>
          </motion.div>

          {/* The story, told under the drawing */}
          <motion.div style={{ opacity: bandIn, y: bandY }} className="pointer-events-none absolute inset-x-0 bottom-0">
            <StoryBand step={step} wide={wide} kept={kept} sent={sent} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function OpeningCopy({ still }: { still?: boolean }) {
  return (
    <div className="pointer-events-auto grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] xl:gap-16">
      <div className="@container">
        <h1
          id="local-hero-title"
          className="font-display text-[clamp(2.4rem,8.6cqi,5.5rem)] font-[400] leading-[0.96] tracking-[-0.04em] text-fg [font-stretch:110%]"
        >
          {TITLE.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.08em]">
              <motion.span
                className={cn("block", i === 1 && "text-fg-subtle")}
                initial={still ? false : { y: "108%", rotate: 2 }}
                animate={{ y: "0%", rotate: 0 }}
                transition={{ duration: 1.1, ease: EASE, delay: 0.5 + i * 0.1 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h1>
      </div>
      <motion.div
        initial={still ? false : { opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
        className="flex flex-col items-start gap-7"
      >
        <p className="max-w-[44ch] text-[1.0625rem] leading-relaxed text-fg-muted [@media(max-height:700px)]:hidden">{LEDE}</p>
        <div className="flex flex-wrap items-center gap-3">
          <BookCall size="lg">Book an architecture demo</BookCall>
          <TextLink href="#scrubber" className="px-3">
            Try the live secret scrubber
          </TextLink>
        </div>
      </motion.div>
    </div>
  );
}

/** The words for the stage on screen: the step on the left, the request as it looks right now on the right. */
function StoryBand({
  step,
  wide,
  kept,
  sent,
}: {
  step: number;
  wide: boolean;
  kept: React.RefObject<HTMLSpanElement | null>;
  sent: React.RefObject<HTMLSpanElement | null>;
}) {
  const s = step >= 0 && step < 3 ? HERO_STEPS[step] : null;
  const shown = Math.max(0, step);
  const key = s ? s.key : "final";
  return (
    <div className="mx-auto w-full max-w-[1400px] px-6 pb-8 md:px-8 lg:pb-12">
      <div className="border-t border-line pt-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:pt-7">
        <div>
          <div className="flex items-center gap-4">
            <span className="font-mono text-[0.75rem] tabular-nums text-fg">
              {String(Math.min(shown + 1, 3)).padStart(2, "0")}
              <span className="text-fg-subtle"> / 03</span>
            </span>
            <div aria-hidden className="flex w-28 gap-1">
              {[0, 1, 2].map((i) => (
                <span key={i} className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-fg/15">
                  <motion.span
                    className="absolute inset-0 origin-left rounded-full bg-signal"
                    initial={false}
                    animate={{
                      scaleX: step > i || step === 3 ? 1 : step === i ? 0.5 : 0,
                    }}
                    transition={{ duration: 0.6, ease: EASE }}
                  />
                </span>
              ))}
            </div>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: EASE }}
            >
              <h2 className="font-display mt-4 text-balance text-[clamp(1.5rem,1rem+1.5vw,2.5rem)] font-[440] leading-[1.04] tracking-[-0.038em] text-fg [font-stretch:106%]">
                {s ? (
                  s.title
                ) : (
                  <>
                    <span className="block">{FINAL.title[0]}</span>
                    <span className="block text-fg-subtle">{FINAL.title[1]}</span>
                  </>
                )}
              </h2>
              <p className="mt-3 max-w-[50ch] text-[0.9375rem] leading-relaxed text-fg-muted max-lg:hidden [@media(max-height:760px)]:hidden">
                {s ? s.body : FINAL.body}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-5 lg:mt-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -10, filter: "blur(4px)" }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.06 }}
            >
              <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-fg-subtle">{s ? s.sampleLabel : "The receipt"}</p>
              <p className="font-display mt-3 text-pretty text-[clamp(1.125rem,0.9rem+0.75vw,1.625rem)] font-[420] leading-[1.3] tracking-[-0.02em] text-fg">
                {s ? (
                  <>
                    “<Marked text={s.sample} />”
                  </>
                ) : (
                  <>
                    S ∩ P = ∅. <span className="text-fg-subtle">The secrets and the outbound packets never touched.</span>
                  </>
                )}
              </p>
            </motion.div>
          </AnimatePresence>
          <dl
            className={cn(
              "mt-5 flex flex-wrap gap-x-8 gap-y-2 font-mono text-[0.75rem] transition-opacity duration-500",
              step >= 1 ? "opacity-100" : "opacity-0",
              !wide && "text-[0.6875rem]",
            )}
          >
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-subtle">Secrets kept inside</dt>
              <dd className="tabular-nums text-fg">
                <span ref={kept}>0</span>
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-subtle">Tags sent out</dt>
              <dd className="tabular-nums text-signal">
                <span ref={sent}>0</span>
              </dd>
            </div>
            <div className="flex items-baseline gap-2">
              <dt className="text-fg-subtle">IP crossed</dt>
              <dd className="tabular-nums text-fg">0 bytes</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

/** Reduced motion: the office drawn once, the copy, and the three steps listed under it. */
function StillHero({ wide }: { wide: boolean }) {
  const still = useMotionValue(0.95);
  return (
    <section data-nav-tone="dark" aria-labelledby="local-hero-title" className="tone-dark relative">
      <div className="relative h-dvh min-h-[640px] overflow-hidden bg-black pt-[72px]">
        <div className="relative h-full">
          <Airlock progress={still} wide={wide} still className="absolute inset-0">
            {(geo) => <StoryLabels geo={geo} step={3} />}
          </Airlock>
          <Frame />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/75 to-transparent" />
          <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col justify-end px-6 pb-14 md:px-8">
            <OpeningCopy still />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-[1400px] px-6 py-20 md:px-8">
        <ol className="grid gap-x-8 gap-y-10 md:grid-cols-3">
          {HERO_STEPS.map((s, i) => (
            <li key={s.key} className="border-t border-line pt-4">
              <p className="font-mono text-[0.8125rem] tabular-nums text-fg-subtle">0{i + 1}</p>
              <h2 className="mt-2 text-[1.0625rem] font-medium tracking-[-0.015em] text-fg">{s.title}</h2>
              <p className="mt-2 max-w-[38ch] text-[0.9375rem] leading-relaxed text-fg-muted">{s.body}</p>
              <p className="mt-4 text-[0.875rem] leading-relaxed text-fg-subtle">
                “<Marked text={s.sample} />”
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Corner marks around the stage, like a drafting frame. */
function Frame() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-4 md:inset-6">
      <span className="absolute left-0 top-0 size-5 border-l border-t border-line-strong" />
      <span className="absolute right-0 top-0 size-5 border-r border-t border-line-strong" />
      <span className="absolute bottom-0 left-0 size-5 border-b border-l border-line-strong" />
      <span className="absolute bottom-0 right-0 size-5 border-b border-r border-line-strong" />
    </div>
  );
}

/** The story's labels: each part of the drawing named, the ones the step is about lit. */
function StoryLabels({ geo, step }: { geo: Geo; step: number }) {
  // On phones the opening title sits over the lower half of the drawing, so its labels wait for the story.
  const under = !geo.wide && step < 0;
  const on = (who: "office" | "core" | "gate" | "vault" | "models") => {
    if (step < 0 || step === 3) return true;
    if (step === 0) return who === "office" || who === "core";
    if (step === 1) return who === "core" || who === "gate" || who === "vault";
    return who === "models" || who === "gate" || who === "core";
  };
  return (
    <div aria-hidden className="contents">
      <Label at={{ x: geo.office.x + 18, y: geo.office.y + 16 }} on={on("office")} anchor="tl">
        <Mono>Your office</Mono>
      </Label>
      <Label at={{ x: geo.employee.x, y: geo.employee.y + 18 }} on={on("office")}>
        Employee
      </Label>
      <Label at={{ x: geo.core.x, y: geo.core.y + 30 }} on={on("core")}>
        Local model
        <Mono className="mt-1 block">Nemotron · Trinity</Mono>
      </Label>
      <Label at={{ x: geo.vault.x, y: geo.vault.y + 22 }} on={on("vault")}>
        Vault
        <Mono className="mt-1 block">Secrets stay here</Mono>
      </Label>
      <div className={cn("transition-opacity duration-500", under && "opacity-0")}>
        {geo.wide ? (
          <Label at={{ x: geo.wallA.x, y: geo.wallA.y - 6 }} on={on("gate")} anchor="b">
            <Mono className="text-signal">Firewall · airlock</Mono>
          </Label>
        ) : (
          <Label at={{ x: geo.gate.x + 26, y: geo.gate.y - 7 }} on={on("gate")} anchor="l">
            <Mono className="text-signal">Firewall · airlock</Mono>
          </Label>
        )}
        <Label at={geo.outside} on={on("models")} anchor="tl">
          <Mono>Outside the building</Mono>
        </Label>
        {[
          ["GPT", "OpenAI"],
          ["Claude", "Anthropic"],
          ["Gemini", "Google"],
        ].map(([name, who], k) => (
          <Label
            key={name}
            at={geo.wide ? { x: geo.models[k].x + 22, y: geo.models[k].y - 9 } : { x: geo.models[k].x, y: geo.models[k].y + 18 }}
            on={on("models")}
            anchor={geo.wide ? "l" : "t"}
          >
            {name}
            <Mono className="mt-1 block">{who}</Mono>
          </Label>
        ))}
      </div>
    </div>
  );
}
