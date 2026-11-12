"use client";

import { AnimatePresence, motion, useInView } from "framer-motion";
import { Check, Cpu, Fingerprint, HardDrive, KeyRound, Lock, Power } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { SectionIntro } from "@/components/ai2/SectionIntro";
import { VALUE_GROUPS, type ValueKey } from "@/lib/localAi";
import { useMedia } from "@/lib/useMedia";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Caption, EASE, StageCard } from "./kit";

const ITEMS = VALUE_GROUPS.flatMap((g, gi) => g.items.map((it, i) => ({ ...it, group: i === 0 ? g.title : null, gi })));
type Item = (typeof ITEMS)[number];

/**
 * The economic mechanism and the security and IP value, told as you scroll.
 * On wide screens the stage holds still beside the reading column and turns
 * to the next drawing as each point reaches the middle of the screen, the way
 * the AI page shows its kinds of work; the other points fall back. On phones
 * each point carries its own drawing.
 */
export function ValueExplorer() {
  const wide = useMedia("(min-width: 1024px)");
  const [active, setActive] = useState(0);
  const item = ITEMS[active];

  return (
    <section id="value" data-nav-tone="dark" aria-labelledby="value-title" className="tone-dark scroll-mt-[120px]">
      <div className="container-site py-24 md:py-36">
        <SectionIntro
          id="value-title"
          title={["What it saves,", "and what stays yours."]}
          lede="Three points on the economics of running AI on your own hardware, and three on the security and intellectual property it protects."
          split
        />

        <div className="mt-12 md:mt-20 lg:grid lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.12fr)] lg:gap-16">
          <ol className="flex flex-col">
            {ITEMS.map((it, i) => (
              <ValueRow key={it.key} item={it} index={i} active={!wide || i === active} wide={wide} onEnter={() => setActive(i)} />
            ))}
          </ol>
          {wide && (
            <div className="relative">
              <div className="sticky top-[136px] flex h-[calc(100svh-160px)] items-center">
                <div className="w-full">
                  <Stage item={item} index={active} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function ValueRow({ item, index, active, wide, onEnter }: { item: Item; index: number; active: boolean; wide: boolean; onEnter: () => void }) {
  const ref = useRef<HTMLLIElement>(null);
  const centred = useInView(ref, { margin: "-46% 0px -46% 0px" });
  useEffect(() => {
    if (centred) onEnter();
    // onEnter is a fresh closure each render; the row only reports when it reaches the middle.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centred]);

  return (
    <li
      ref={ref}
      className={cn(
        "flex flex-col justify-center transition-[opacity,filter] duration-700 ease-[var(--ease-out-expo)]",
        wide ? "min-h-[72svh] py-10" : "border-t border-line py-12 first:border-t-0 first:pt-0",
        active ? "opacity-100" : "opacity-25 [filter:blur(1px)]"
      )}
    >
      <h3 className="font-display text-balance text-[clamp(1.75rem,1.1rem+1.6vw,2.75rem)] font-[440] leading-[1.02] tracking-[-0.04em] text-fg [font-stretch:106%]">
        {item.title}
      </h3>
      <p className="mt-5 max-w-[52ch] text-[1rem] leading-relaxed text-fg-muted">{item.body}</p>
      {item.meter && (
        <div className="mt-7 flex max-w-[52ch] items-center justify-between gap-4 border-t border-line pt-4 text-[0.875rem]">
          <span className="text-fg-subtle">{item.meter[0]}</span>
          <span className="font-medium text-fg">{item.meter[1]}</span>
        </div>
      )}
      {!wide && (
        <div className="mt-8">
          <Stage item={item} index={index} />
        </div>
      )}
    </li>
  );
}

function Stage({ item, index }: { item: Item; index: number }) {
  return (
    <StageCard
      index={String(index + 1).padStart(2, "0")}
      title={item.title}
      aside={<Caption className="hidden sm:inline">{item.tag ?? "Economics"}</Caption>}
      segments={{ count: ITEMS.length, lit: index + 1 }}
    >
      <div className="relative h-[19rem] sm:h-[22rem] lg:h-[clamp(18rem,calc(100svh-330px),27rem)]">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={item.key}
            className="absolute inset-0"
            initial={{ opacity: 0, filter: "blur(8px)", scale: 0.98 }}
            animate={{ opacity: 1, filter: "blur(0px)", scale: 1 }}
            exit={{ opacity: 0, filter: "blur(8px)", scale: 1.02 }}
            transition={{ duration: 0.55, ease: EASE }}
          >
            <Visual k={item.key} />
          </motion.div>
        </AnimatePresence>
        <span className="absolute bottom-1 right-3 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-fg-subtle">Illustration</span>
      </div>
    </StageCard>
  );
}

function Visual({ k }: { k: ValueKey }) {
  switch (k) {
    case "local":
      return <LocalGrid />;
    case "selective":
      return <Selective />;
    case "shared":
      return <Shared />;
    case "digital":
      return <Digital />;
    case "physical":
      return <Physical />;
    case "ip":
      return <Compounding />;
  }
}

/* 01 · A hundred requests come in; most are answered on your hardware and only a few leave, scrubbed. */
function LocalGrid() {
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? 88 : 0);
  useEffect(() => {
    if (reduce) return;
    let v = 0;
    const t = window.setInterval(() => {
      v = Math.min(88, v + 2);
      setN(v);
      if (v >= 88) window.clearInterval(t);
    }, 28);
    return () => window.clearInterval(t);
  }, [reduce]);
  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 px-6 sm:grid-cols-[auto_1fr] md:px-10">
      <div className="grid grid-cols-10 gap-[7px] justify-self-center">
        {Array.from({ length: 100 }, (_, i) => {
          const local = i < 88;
          return (
            <motion.span
              key={i}
              initial={reduce ? false : { opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : i * 0.012 }}
              className={cn(
                "size-2.5 rounded-full md:size-3",
                local ? "bg-signal shadow-[0_0_10px_oklch(0.82_0.17_152/0.55)]" : "border border-fg/70 bg-black"
              )}
            />
          );
        })}
      </div>
      <div className="hidden sm:block">
        <p className="font-display text-[clamp(3.5rem,2rem+3vw,5.5rem)] font-[380] leading-none tracking-[-0.05em] text-signal tabular-nums">
          {n}
          <span className="text-fg-subtle">/100</span>
        </p>
        <p className="mt-3 max-w-[22ch] text-[0.875rem] leading-relaxed text-fg-muted">requests answered on your own hardware, at no per-token cost</p>
        <p className="mt-5 flex items-center gap-2 text-[0.8125rem] text-fg-subtle">
          <span className="size-2.5 rounded-full border border-fg/70" /> the rest go out scrubbed
        </p>
      </div>
    </div>
  );
}

/* 02 · A router: the hard requests go out, the rest stay. */
function Selective() {
  const reduce = useReducedMotion();
  return (
    <div className="flex h-full items-center gap-4 px-6 md:px-10">
      <span className="flex shrink-0 flex-col items-center gap-2 text-[0.75rem] text-fg-muted">
        <span className="relative grid size-11 place-items-center">
          <span className="absolute inset-0 rounded-full border border-dashed border-signal/60 motion-safe:animate-[spin_9s_linear_infinite]" />
          <span className="size-2.5 rounded-full bg-fg" />
        </span>
        Router
      </span>
      <div className="flex flex-1 flex-col gap-12">
        <Lane label="Frontier API, scrubbed" note="Pay per token" count={1} duration={3.2} reduce={reduce} />
        <Lane label="Local open-weight model" note="$0 per token" count={7} duration={2.6} reduce={reduce} signal />
      </div>
    </div>
  );
}

function Lane({ label, note, count, duration, reduce, signal }: { label: string; note: string; count: number; duration: number; reduce: boolean; signal?: boolean }) {
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-3 text-[0.8125rem]">
        <span className="text-fg">{label}</span>
        <span className={signal ? "text-signal" : "text-fg-subtle"}>{note}</span>
      </div>
      <div className={cn("relative h-px", signal ? "bg-signal/40" : "bg-fg/25")}>
        {Array.from({ length: count }, (_, i) => (
          <motion.span
            key={i}
            className={cn("absolute top-1/2 size-2 -translate-y-1/2 rounded-full", signal ? "bg-signal" : "bg-fg")}
            initial={{ left: "0%", opacity: 0 }}
            animate={reduce ? { left: `${(i + 0.5) * (100 / count)}%`, opacity: 1 } : { left: ["0%", "100%"], opacity: [0, 1, 1, 0] }}
            transition={reduce ? { duration: 0 } : { duration, ease: "linear", repeat: Infinity, delay: (i * duration) / count }}
          />
        ))}
      </div>
    </div>
  );
}

/* 03 · One regional cluster, four businesses, each in its own enclave; the bill splits four ways. */
function Shared() {
  const reduce = useReducedMotion();
  const tenants = ["A", "B", "C", "D"];
  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 px-6 sm:grid-cols-[auto_1fr] md:px-10">
      <div className="justify-self-center">
        <p className="mb-3 font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-subtle">Regional GPU cluster</p>
        <div className="grid grid-cols-2 gap-3">
          {tenants.map((t, i) => (
            <motion.div
              key={t}
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: EASE, delay: reduce ? 0 : 0.1 + i * 0.12 }}
              className="relative rounded-[12px] border border-dashed border-fg/25 p-2.5"
            >
              <div className="grid grid-cols-2 gap-1.5">
                {[0, 1, 2, 3].map((c) => (
                  <motion.span
                    key={c}
                    className="size-5 rounded-[4px] border border-signal/50 bg-signal/15 md:size-6"
                    animate={reduce ? undefined : { opacity: [0.45, 1, 0.45] }}
                    transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.3 + c * 0.15 }}
                  />
                ))}
              </div>
              <span className="mt-2 flex items-center justify-between text-[0.75rem] text-fg">
                Business {t} <Lock className="size-3 text-signal" />
              </span>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="hidden flex-col gap-5 text-[0.8125rem] sm:flex">
        <p className="text-fg-muted">GPUs, power, cooling, security and maintenance</p>
        <Bar label="One business alone" to={1} delay={0.2} reduce={reduce} />
        <Bar label="Shared by four" to={0.25} delay={0.5} reduce={reduce} signal />
      </div>
    </div>
  );
}

function Bar({ label, to, delay, reduce, signal }: { label: string; to: number; delay: number; reduce: boolean; signal?: boolean }) {
  return (
    <div>
      <span className="text-fg-subtle">{label}</span>
      <div className="mt-2 h-2 rounded-full bg-fg/[0.06]">
        <motion.div
          className={cn("h-full origin-left rounded-full", signal ? "bg-signal" : "bg-fg/50")}
          style={{ width: `${to * 100}%` }}
          initial={reduce ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, ease: EASE, delay: reduce ? 0 : delay }}
        />
      </div>
    </div>
  );
}

/* 04 · One secret through each layer of protection. */
function Digital() {
  const reduce = useReducedMotion();
  const stages = [
    { at: "Inside the enclave", show: <span className="font-medium text-fg">Project Horizon · $420M</span> },
    { at: "Tokenised", show: <span className="font-mono text-signal">[DEAL_CODENAME_X] · [DEAL_SIZE_1]</span> },
    { at: "AES-256-GCM in memory", show: <span className="font-mono text-fg-muted">9f3a 0c7e 51d2 … c1e0</span> },
    { at: "TLS 1.3 on the wire", show: <span className="text-fg-muted">Sanitised tokens only · zero raw egress</span> },
  ];
  const [on, setOn] = useState(0);
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setOn((v) => (v + 1) % stages.length), 1500);
    return () => window.clearInterval(t);
  }, [reduce, stages.length]);
  return (
    <ol className="flex h-full flex-col justify-center px-6 md:px-10">
      {stages.map((s, i) => {
        const lit = reduce || i <= on;
        return (
          <li
            key={s.at}
            className={cn(
              "relative flex items-center gap-4 border-b border-line py-4 text-[0.875rem] transition-opacity duration-500 first:border-t",
              lit ? "opacity-100" : "opacity-30"
            )}
          >
            <span
              aria-hidden
              className={cn(
                "size-1.5 shrink-0 rounded-full transition-colors duration-500",
                i === on && !reduce ? "bg-signal shadow-[0_0_10px_oklch(0.82_0.17_152)]" : lit ? "bg-fg/60" : "bg-fg/20"
              )}
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-4">
              <span className="shrink-0 text-[0.75rem] text-fg-subtle sm:w-[10.5rem]">{s.at}</span>
              <span className="min-w-0 break-words">{s.show}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/* 05 · The silicon in a cage you control, each check passed in turn. */
function Physical() {
  const reduce = useReducedMotion();
  const checks = [
    { icon: Fingerprint, label: "Biometric access" },
    { icon: KeyRound, label: "Hardware-key access" },
    { icon: HardDrive, label: "Dedicated NVMe and VRAM, not shared" },
    { icon: Power, label: "Memory scrubbed at power-off" },
  ];
  return (
    <div className="grid h-full grid-cols-1 items-center gap-8 px-6 sm:grid-cols-[auto_1fr] md:px-10">
      <div className="relative mx-auto hidden size-40 sm:block">
        <div
          aria-hidden
          className="absolute inset-0 rounded-[16px] border border-line-strong"
          style={{ backgroundImage: "repeating-linear-gradient(90deg, oklch(1 0 0 / 0.14) 0 1px, transparent 1px 12px)" }}
        />
        <span className="absolute left-1/2 top-1/2 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[14px] border border-signal bg-black text-signal">
          <Cpu className="size-7" />
        </span>
      </div>
      <ul className="flex flex-col gap-2.5">
        {checks.map((c, i) => (
          <motion.li
            key={c.label}
            initial={reduce ? false : { opacity: 0.3 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: reduce ? 0 : 0.25 + i * 0.35 }}
            className="flex items-center gap-3 text-[0.875rem] text-fg"
          >
            <c.icon className="size-4 shrink-0 text-fg-subtle" />
            <span className="flex-1">{c.label}</span>
            <motion.span
              initial={reduce ? false : { scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 26, delay: reduce ? 0 : 0.45 + i * 0.35 }}
              className="grid size-5 place-items-center rounded-full bg-signal text-black"
            >
              <Check className="size-3" strokeWidth={3} />
            </motion.span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

/* 06 · What you own compounds; rented intelligence doesn't accrue. */
function Compounding() {
  const reduce = useReducedMotion();
  const curve = "M20 200 C 140 196, 230 178, 300 140 S 420 50, 500 28";
  return (
    <div className="relative h-full px-4 md:px-8">
      <svg viewBox="0 0 520 230" className="h-full w-full" preserveAspectRatio="xMidYMid meet" aria-hidden>
        <defs>
          <linearGradient id="ip-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="oklch(0.82 0.17 152)" stopOpacity="0.22" />
            <stop offset="1" stopColor="oklch(0.82 0.17 152)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line x1="20" y1="208" x2="500" y2="208" stroke="oklch(1 0 0 / 0.14)" />
        <motion.path
          d={`${curve} L 500 208 L 20 208 Z`}
          fill="url(#ip-fill)"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.9 }}
        />
        <motion.path
          d={curve}
          fill="none"
          stroke="oklch(0.82 0.17 152)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.4, ease: EASE }}
        />
        <line x1="20" y1="186" x2="500" y2="186" stroke="oklch(1 0 0 / 0.35)" strokeDasharray="5 6" />
        <text x="24" y="226" fill="oklch(1 0 0 / 0.45)" fontSize="11">Time</text>
        <text x="300" y="180" fill="oklch(1 0 0 / 0.55)" fontSize="12">Rented AI: nothing accrues</text>
      </svg>
      <div className="absolute left-10 top-[4.5rem] hidden flex-col items-start gap-1.5 md:left-14 md:flex">
        <span className="mb-1 text-[0.9375rem] font-medium text-signal">Company-owned intelligence</span>
        {["Fine-tuning weights", "RAG vector embeddings", "Institutional knowledge"].map((t, i) => (
          <motion.span
            key={t}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE, delay: reduce ? 0 : 1.1 + i * 0.15 }}
            className="flex items-center gap-2 text-[0.8125rem] text-fg-muted"
          >
            <span className="size-1.5 rounded-full bg-signal" />
            {t}
          </motion.span>
        ))}
      </div>
    </div>
  );
}
