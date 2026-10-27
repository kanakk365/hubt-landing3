"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Check, Loader, UserRound } from "lucide-react";
import React, { useRef, useState } from "react";
import { NeuralWeb } from "@/components/bits/NeuralWeb";
import { BookCall } from "@/components/site/BookCall";
import { TextLink } from "@/components/site/SectionHeading";
import { ANATOMY } from "@/lib/site";
import { useMedia } from "@/lib/useMedia";
import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;
const N = ANATOMY.length;
const ACTION = 3;

/** One request traced through the six layers. Illustration, not live data. */
const TRACE = [
  "3 sources, filtered by permission",
  "Answer drafted with citations",
  "Order record retrieved",
  "Update order · a person approves",
  "Checks run after approval",
  "Every step logged for review",
];

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

/**
 * The AI page opens on the neural web. The page pins while it plays out:
 * the title clears, the fibres draw back in, and the sphere comes apart into
 * the six layers of a production system. Each layer is then lit in turn, with
 * one request traced through it, until the whole stack runs at once.
 */
export function AiHero() {
  const reduce = !!useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  if (reduce) return <StillHero />;
  return <PinnedHero wide={wide} />;
}

function PinnedHero({ wide }: { wide: boolean }) {
  const section = useRef<HTMLElement>(null);
  const hub = useRef<HTMLDivElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const anchors = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(-1);
  const [done, setDone] = useState(false);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 26, mass: 0.4, restDelta: 0.0001 });

  const out = useTransform(p, [0.03, 0.13], [0, 1], { clamp: true });
  const heroOpacity = useTransform(out, (v) => 1 - v);
  const heroY = useTransform(out, [0, 1], [0, -70]);
  const heroBlur = useTransform(out, (v) => `blur(${(v * 10).toFixed(2)}px)`);
  const corona = useTransform(p, [0.05, 0.19], [1, 0], { clamp: true });
  const layer = useTransform(p, [0.09, 0.3], [0, 1], { clamp: true });
  const headIn = useTransform(p, [0.24, 0.31], [0, 1], { clamp: true });
  const headY = useTransform(headIn, [0, 1], [36, 0]);
  const focusAmt = useTransform(p, [0.27, 0.33, 0.85, 0.9], [0, 1, 1, 0], { clamp: true });
  const flow = useTransform(p, [0.85, 0.92], [0, 1], { clamp: true });
  const finalIn = useTransform(p, [0.875, 0.935], [0, 1], { clamp: true });
  const finalY = useTransform(finalIn, [0, 1], [28, 0]);
  const traceOut = useTransform(p, [0.835, 0.87], [1, 0], { clamp: true });
  // Each layer holds for most of its stretch, then hands over to the next.
  const focus = useTransform(p, (v) => {
    const raw = clamp((v - 0.32) / 0.53, 0, 1) * N;
    const s = Math.min(N - 1, Math.floor(raw));
    const local = raw - s;
    return s === N - 1 ? s : s + easeIO(clamp((local - 0.72) / 0.28, 0, 1));
  });
  const stepIn = useTransform(p, [0.3, 0.33], [0, 1], { clamp: true });
  const cue = useTransform(p, [0, 0.04], [1, 0], { clamp: true });

  useMotionValueEvent(focus, "change", (v) => {
    const next = stepIn.get() > 0.5 ? clamp(Math.round(v), 0, N - 1) : -1;
    setActive((a) => (a === next ? a : next));
  });
  useMotionValueEvent(finalIn, "change", (v) => setDone((d) => (d === v > 0.5 ? d : v > 0.5)));

  return (
    <section
      ref={section}
      data-nav-tone="dark"
      aria-labelledby="ai-hero-title"
      className="tone-dark relative"
      style={{ height: wide ? "560vh" : "480vh" }}
    >
      <div className="sticky top-0 h-dvh overflow-hidden bg-black pt-[72px]">
        <div className="relative h-full">
          <NeuralWeb
            className="absolute inset-0"
            layer={layer}
            focus={focus}
            focusAmt={focusAmt}
            corona={corona}
            flow={flow}
            hubAnchor={hub}
            coreAnchor={core}
            layerAnchors={anchors}
            wide={wide}
          />

          {/* Core glow, kept on the core by the canvas. */}
          <div ref={core} aria-hidden className="pointer-events-none absolute left-0 top-0 opacity-0 mix-blend-screen will-change-transform">
            <div className="absolute size-[340px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(1_0_0/0.34)_0%,oklch(1_0_0/0.1)_22%,transparent_62%)]" />
            <div className="absolute size-[46px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,oklch(1_0_0/0.95)_0%,oklch(1_0_0/0.5)_35%,transparent_72%)]" />
          </div>

          <Frame />

          {/* Opening copy */}
          <motion.div
            style={{ opacity: heroOpacity, y: heroY, filter: heroBlur }}
            className="pointer-events-none absolute inset-0"
          >
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-[64%] bg-gradient-to-t from-black from-[30%] via-black/80 to-transparent lg:h-[55%] lg:from-0% lg:via-black/70" />
            <div className="relative mx-auto flex w-full max-w-[1400px] px-6 md:px-8 h-full flex-col justify-between pb-10 pt-8 md:pb-14 md:pt-10">
              {/* The scroll cue sits opposite the eyebrow, clear of the title. */}
              <div className="flex items-start justify-between gap-6">
                <Eyebrow index="01" label="AI" />
                <motion.div
                  aria-hidden
                  style={{ opacity: cue }}
                  className="hidden flex-col items-end gap-2 font-mono text-[0.625rem] uppercase tracking-[0.22em] text-fg-subtle lg:flex"
                >
                  Scroll to take it apart
                  <span className="relative h-8 w-px overflow-hidden bg-line">
                    <span className="absolute inset-x-0 top-0 h-3 animate-[cue-drop_1.8s_var(--ease-out-expo)_infinite] bg-fg" />
                  </span>
                </motion.div>
              </div>
              <div className="pointer-events-auto grid items-end gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] xl:gap-16">
                {/* Sized to its column (cqi) so the title always sets in its two lines. */}
                <div className="@container">
                  <h1
                    id="ai-hero-title"
                    className="font-display text-[clamp(2.4rem,9.4cqi,5.75rem)] font-[400] leading-[0.96] tracking-[-0.045em] text-fg [font-stretch:110%]"
                  >
                    {["Production AI,", "engineered end to end."].map((line, i) => (
                      <span key={line} className="block overflow-hidden pb-[0.08em]">
                        <motion.span
                          className={cn("block", i === 1 && "text-fg-subtle")}
                          initial={{ y: "108%", rotate: 2 }}
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
                  initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
                  className="flex flex-col items-start gap-7"
                >
                  <p className="max-w-[42ch] text-[1.0625rem] leading-relaxed text-fg-muted [@media(max-height:700px)]:hidden">
                    Systems that reach the right information, act inside their permissions and stay right long after launch. We
                    build the model and everything around it that makes it safe to rely on.
                  </p>
                  <div className="flex flex-wrap items-center gap-3">
                    <BookCall size="lg" />
                    <TextLink href="#in-production" className="px-3">
                      See it in a real product
                    </TextLink>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Callout riding on the model sector's hub */}
          <div ref={hub} aria-hidden className="pointer-events-none absolute left-0 top-0 hidden opacity-0 will-change-transform lg:block">
            <motion.div style={{ opacity: heroOpacity }}>
              <span className="absolute -left-[5px] -top-[5px] size-[10px] border border-fg bg-black" />
              <span className="absolute left-[5px] top-0 h-px w-[104px] origin-left bg-gradient-to-r from-fg/80 to-fg/30" />
              <div className="absolute left-[110px] top-0 -translate-y-1/2 whitespace-nowrap border border-line-strong bg-black/85 px-3 py-2 font-mono text-[0.625rem] uppercase leading-[1.5] tracking-[0.16em] backdrop-blur-sm">
                <div className="text-fg">Layer 02 · Model</div>
                <div className="text-fg-subtle">The only layer a demo shows</div>
              </div>
            </motion.div>
          </div>

          {/* Layers */}
          <motion.div style={{ opacity: headIn }} className="pointer-events-none absolute inset-0">
            <div className="relative mx-auto flex w-full max-w-[1400px] px-6 md:px-8 h-full flex-col pb-8 pt-8 md:pt-10 lg:pb-12">
              <motion.div style={{ y: headY }} className="@container max-w-[min(34rem,40vw)]">
                <Eyebrow index="02" label="How production AI works" />
                <h2 className="font-display mt-6 text-[clamp(1.6rem,6.3cqi,2.6rem)] font-[440] leading-[1.06] tracking-[-0.038em] text-fg [font-stretch:106%]">
                  <span className="block">A model answers questions.</span>
                  <span className="block text-fg-subtle">A production system has six layers.</span>
                </h2>
                <p className="mt-5 max-w-[42ch] text-[1rem] leading-relaxed text-fg-muted max-lg:hidden [@media(max-height:820px)]:hidden">
                  It has to reach the right information, act inside its permissions, and still be right in six months.
                </p>
              </motion.div>

              {wide ? (
                <div className="mt-auto max-w-[24rem] [@media(max-height:760px)]:hidden">
                  <motion.div style={{ opacity: traceOut }}>
                    <Trace active={active} done={done} />
                  </motion.div>
                </div>
              ) : (
                <MobileLayer active={active} />
              )}
            </div>

            {wide &&
              ANATOMY.map((l, i) => (
                <div
                  key={l.title}
                  ref={(el) => {
                    anchors.current[i] = el;
                  }}
                  className="absolute left-0 top-0 will-change-transform"
                >
                  <LayerLabel index={i} title={l.title} description={l.description} active={active} done={done} />
                </div>
              ))}
          </motion.div>

          {/* Closing line, once the whole stack runs */}
          <motion.div
            style={{ opacity: finalIn, y: finalY }}
            className="pointer-events-none absolute inset-x-0 bottom-0"
          >
            <div className="mx-auto w-full max-w-[1400px] px-6 pb-10 md:px-8 lg:pb-14">
              <div className="max-w-[30rem] max-lg:rounded-2xl max-lg:border max-lg:border-line max-lg:bg-black/80 max-lg:p-5 max-lg:backdrop-blur-sm">
                <p className="font-display text-balance text-[clamp(1.25rem,0.95rem+0.9vw,1.75rem)] font-[440] leading-[1.18] tracking-[-0.03em] text-fg [font-stretch:104%]">
                  Permissions, evaluation, observability and human controls are where most of the engineering actually goes.
                </p>
                <p className="mt-3 text-[0.9375rem] leading-relaxed text-fg-muted">
                  That is the part we build, and the part we keep running after launch.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function Eyebrow({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-4 font-mono text-[0.75rem] uppercase tracking-[0.2em] text-fg-subtle">
      <span className="tabular-nums text-fg">{index}</span>
      <motion.span
        aria-hidden
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
        className="h-px w-16 origin-left bg-line-strong md:w-24"
      />
      <span>{label}</span>
    </div>
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

/** A layer's name at the rim of its plane: lit when its turn comes. */
function LayerLabel({
  index,
  title,
  description,
  active,
  done,
}: {
  index: number;
  title: string;
  description: string;
  active: number;
  done: boolean;
}) {
  const on = index === active && !done;
  const past = done || (active >= 0 && index < active);
  return (
    <div className="relative">
      <span
        className={cn(
          "absolute left-[6px] top-0 h-px origin-left bg-fg transition-[width,opacity] duration-700 ease-[var(--ease-out-expo)]",
          on ? "w-14 opacity-90" : "w-6 opacity-30"
        )}
      />
      <span
        className={cn(
          "absolute -left-[3px] -top-[3px] size-[7px] rounded-full border transition-colors duration-500",
          on ? "border-fg bg-fg" : past ? "border-fg/70 bg-black" : "border-fg/30 bg-black"
        )}
      />
      <div
        className={cn(
          "absolute top-0 w-[13rem] -translate-y-1/2 transition-[left] duration-700 ease-[var(--ease-out-expo)] xl:w-[14rem] min-[1440px]:w-[15.5rem] min-[1536px]:w-[17rem]",
          on ? "left-[4.5rem]" : "left-[2.5rem]"
        )}
      >
        <div className="flex items-baseline gap-3">
          <span className={cn("font-mono text-[0.6875rem] tabular-nums transition-colors duration-500", on ? "text-fg" : "text-fg-subtle/70")}>
            {String(index + 1).padStart(2, "0")}
          </span>
          <span
            className={cn(
              "font-display text-[1rem] font-[480] leading-tight tracking-[-0.025em] transition-colors duration-500 [font-stretch:104%] xl:text-[1.0625rem]",
              on ? "text-fg" : past ? "text-fg-muted" : "text-fg-subtle/60"
            )}
          >
            {title}
          </span>
        </div>
        <div
          className={cn(
            "grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out-expo)] max-xl:hidden",
            on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="overflow-hidden pl-[1.85rem]">
            <p className="pt-1 text-[0.875rem] leading-snug text-fg-muted">
              {description}
              {index === 1 && <span className="text-fg"> The only layer a demo shows.</span>}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

type State = "done" | "running" | "approval" | "queued";

/** The request trace, advancing with the lit layer. */
function Trace({ active, done }: { active: number; done: boolean }) {
  const stateOf = (i: number): State => {
    if (done || i < active) return "done";
    if (i === active) return i === ACTION ? "approval" : "running";
    return "queued";
  };
  return (
    <div className="rounded-[18px] border border-line bg-black/70 p-2 backdrop-blur-md">
      <div className="flex items-center justify-between px-3 pb-2 pt-1.5">
        <span className="text-[0.8125rem] font-medium text-fg">One request, traced</span>
        <span className="rounded-full border border-line px-2 py-0.5 font-mono text-[0.625rem] text-fg-subtle">illustration</span>
      </div>
      <ol className="flex flex-col gap-0.5">
        {ANATOMY.map((l, i) => {
          const st = stateOf(i);
          return (
            <li
              key={l.title}
              className={cn(
                "flex items-center gap-3 rounded-[10px] px-2.5 py-[0.45rem] transition-colors duration-500",
                (st === "running" || st === "approval") && "bg-fg/[0.06]"
              )}
            >
              <StatusIcon state={st} />
              <span className="min-w-0 flex-1">
                <span className={cn("block text-[0.8125rem] font-medium leading-tight transition-colors duration-500", st === "queued" ? "text-fg-subtle" : "text-fg")}>
                  {l.title}
                </span>
                <span className="block truncate font-mono text-[0.6875rem] text-fg-subtle">{TRACE[i]}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function StatusIcon({ state }: { state: State }) {
  const base = "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-500";
  if (state === "done")
    return (
      <span className={cn(base, "border-fg bg-fg text-black")}>
        <Check className="size-3" strokeWidth={3} aria-label="Done" />
      </span>
    );
  if (state === "approval")
    return (
      <span className={cn(base, "border-fg text-fg")}>
        <UserRound className="size-3" aria-label="Waiting for a person to approve" />
      </span>
    );
  if (state === "running")
    return (
      <span className={cn(base, "border-fg/60 text-fg")}>
        <Loader className="size-3 animate-spin" aria-label="Running" />
      </span>
    );
  return <span className={cn(base, "border-dashed border-fg/25")} aria-label="Queued" />;
}

/** Small screens: the lit layer reads out under the stack. */
function MobileLayer({ active }: { active: number }) {
  const i = Math.max(0, active);
  const l = ANATOMY[i];
  return (
    <div className="mt-auto">
      <div className="mb-4 flex gap-1.5">
        {ANATOMY.map((x, k) => (
          <span key={x.title} className={cn("h-1 flex-1 rounded-full transition-colors duration-500", k <= i ? "bg-fg" : "bg-line-strong")} />
        ))}
      </div>
      <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
        <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle">Layer {String(i + 1).padStart(2, "0")} of 06</span>
        <p className="font-display mt-1 text-[1.5rem] font-[460] leading-tight tracking-[-0.03em] text-fg">{l.title}</p>
        <p className="mt-1 text-[0.9375rem] text-fg-muted">
          {l.description}
          {i === 1 && <span className="text-fg"> The only layer a demo shows.</span>}
        </p>
      </motion.div>
    </div>
  );
}

/** Reduced motion: the finished sphere, standing still, and the layers as a list. */
function StillHero() {
  const zero = useMotionValue(0);
  const one = useMotionValue(1);
  const none = useMotionValue(-10);
  return (
    <section data-nav-tone="dark" aria-labelledby="ai-hero-title" className="tone-dark relative">
      <div className="relative h-dvh min-h-[640px] overflow-hidden bg-black pt-[72px]">
        <NeuralWeb className="absolute inset-0" layer={zero} focus={none} focusAmt={zero} corona={one} still />
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent" />
        <div className="container-site relative flex h-full flex-col justify-end gap-8 pb-14">
          <Eyebrow index="01" label="AI" />
          <div className="@container">
            <h1 id="ai-hero-title" className="font-display text-[clamp(2.4rem,9.4cqi,5.75rem)] font-[400] leading-[0.96] tracking-[-0.045em] text-fg [font-stretch:110%]">
              <span className="block">Production AI,</span>
              <span className="block text-fg-subtle">engineered end to end.</span>
            </h1>
          </div>
          <p className="max-w-[52ch] text-[1.0625rem] leading-relaxed text-fg-muted">
            Systems that reach the right information, act inside their permissions and stay right long after launch. We build the
            model and everything around it that makes it safe to rely on.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <BookCall size="lg" />
            <TextLink href="#in-production" className="px-3">
              See it in a real product
            </TextLink>
          </div>
        </div>
      </div>
      <div className="container-site py-24">
        <Eyebrow index="02" label="How production AI works" />
        <h2 className="font-display mt-6 text-[clamp(1.9rem,1rem+2.2vw,3rem)] font-[440] leading-[1.04] tracking-[-0.04em] text-fg">
          <span className="block">A model answers questions.</span>
          <span className="block text-fg-subtle">A production system has six layers.</span>
        </h2>
        <ol className="mt-12 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {ANATOMY.map((l, i) => (
            <li key={l.title} className="bg-black p-7">
              <span className="font-mono text-[0.75rem] tabular-nums text-fg-subtle">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-2 text-[1.125rem] font-semibold tracking-[-0.02em] text-fg">{l.title}</h3>
              <p className="mt-1.5 text-[0.9375rem] text-fg-muted">{l.description}</p>
            </li>
          ))}
        </ol>
        <p className="mt-12 max-w-[46ch] text-xl font-medium leading-snug tracking-[-0.02em] text-fg">
          Permissions, evaluation, observability and human controls are where most of the engineering actually goes.
        </p>
      </div>
    </section>
  );
}

