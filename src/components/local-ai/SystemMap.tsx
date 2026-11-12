"use client";

import { AnimatePresence, animate, motion, useInView, useMotionValue } from "framer-motion";
import { Pause, Play } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { FLOW_MODES, IP_GUARANTEE, SYSTEM_NODES, type FlowMode, type NodeKey } from "@/lib/localAi";
import { useMedia } from "@/lib/useMedia";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { cn } from "@/lib/utils";
import { Airlock, Mono, type Geo, type Pt } from "./Airlock";
import { Caption, EASE, LiveDot, RailList, StageCard } from "./kit";

const DWELL = 3200;
const OUTSIDE: NodeKey[] = ["router", "policy-gate", "openai", "ensemble", "anthropic"];

/** Where on the story's scroll each path sits: answered inside, scrubbed and sent, or all of it at once. */
const MODE_AT: Record<FlowMode, number> = { local: 0.3, sanitized: 0.53, all: 0.95 };

const SHORT: Record<NodeKey, string> = {
  employees: "Employees",
  firewall: "Firewall",
  "local-model": "Local model",
  "private-data": "Private data",
  router: "AI router",
  "policy-gate": "Policy gate",
  openai: "OpenAI",
  ensemble: "Frontier ensemble",
  anthropic: "Anthropic",
};

/** Each node's place on the drawing, and which side its name sits. */
function place(k: NodeKey, g: Geo): { at: Pt; label: Pt; anchor: "t" | "b" | "l" | "r" | "tl" } {
  const o = g.office;
  const mid = { x: (g.core.x + g.gate.x) / 2, y: (g.core.y + g.gate.y) / 2 };
  switch (k) {
    case "employees":
      return { at: g.employee, label: { x: g.employee.x, y: g.employee.y + 20 }, anchor: "t" };
    case "firewall":
      return g.wide
        ? { at: { x: g.wallA.x, y: g.wallA.y + 22 }, label: { x: g.wallA.x, y: g.wallA.y + 2 }, anchor: "b" }
        : { at: { x: o.x + 18, y: g.gate.y }, label: { x: o.x + 4, y: g.gate.y + 18 }, anchor: "tl" };
    case "local-model":
      return { at: g.core, label: { x: g.core.x, y: g.core.y + 32 }, anchor: "t" };
    case "private-data":
      return g.wide
        ? { at: { x: o.x + o.w * 0.78, y: o.y + o.h * 0.2 }, label: { x: o.x + o.w * 0.78, y: o.y + o.h * 0.2 + 20 }, anchor: "t" }
        : { at: { x: o.x + o.w * 0.8, y: o.y + o.h * 0.18 }, label: { x: o.x + o.w * 0.8, y: o.y + o.h * 0.18 + 18 }, anchor: "t" };
    case "router":
      return g.wide
        ? { at: { x: mid.x, y: mid.y - 22 }, label: { x: mid.x, y: mid.y - 40 }, anchor: "b" }
        : { at: { x: mid.x - 22, y: mid.y }, label: { x: mid.x - 40, y: mid.y - 7 }, anchor: "r" };
    case "policy-gate":
      return g.wide
        ? { at: g.gate, label: { x: g.gate.x, y: g.gate.y + 28 }, anchor: "t" }
        : { at: g.gate, label: { x: g.gate.x + 26, y: g.gate.y - 7 }, anchor: "l" };
    case "openai":
    case "ensemble":
    case "anthropic": {
      const m = g.models[k === "openai" ? 0 : k === "ensemble" ? 1 : 2];
      return g.wide ? { at: m, label: { x: m.x + 22, y: m.y - 7 }, anchor: "l" } : { at: m, label: { x: m.x, y: m.y + 20 }, anchor: "t" };
    }
  }
}

/**
 * How the system works, on the same drawing the page opens with, sized to one
 * screen under both bars. The guarantee and the three paths sit on the left;
 * picking a path changes what flows. A question is traced stage by stage on
 * its own; pick any part of the drawing to stop there.
 */
export function SystemMap() {
  const reduce = useReducedMotion();
  const wide = useMedia("(min-width: 1024px)");
  const root = useRef<HTMLElement>(null);
  const inView = useInView(root, { amount: 0.35 });

  const [mode, setMode] = useState<FlowMode>("all");
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<NodeKey | null>(null);
  const [playing, setPlaying] = useState(true);
  const progress = useMotionValue(MODE_AT.all);

  const flow = FLOW_MODES.find((m) => m.key === mode)!;
  const path = flow.path;
  const focus: NodeKey = picked ?? path[idx % path.length];
  const touring = playing && !reduce && !picked;

  useEffect(() => {
    const c = animate(progress, MODE_AT[mode], { duration: reduce ? 0 : 1.4, ease: EASE });
    return () => c.stop();
  }, [mode, progress, reduce]);

  useEffect(() => {
    if (!touring || !inView) return;
    const t = window.setTimeout(() => setIdx((i) => (i + 1) % path.length), DWELL);
    return () => window.clearTimeout(t);
  }, [idx, touring, inView, path.length]);

  const choose = (m: FlowMode) => {
    setMode(m);
    setIdx(0);
    setPicked(null);
    setPlaying(true);
  };
  const pick = (k: NodeKey) => {
    setPicked(k);
    setPlaying(false);
  };
  const toggle = () => {
    if (touring) return setPlaying(false);
    if (picked && path.includes(picked)) setIdx(path.indexOf(picked));
    setPicked(null);
    setPlaying(true);
  };

  const node = SYSTEM_NODES[focus];
  const step = path.indexOf(focus);
  const off = (k: NodeKey) => mode === "local" && OUTSIDE.includes(k);

  return (
    <section ref={root} id="how-it-works" data-nav-tone="dark" aria-labelledby="how-title" className="tone-dark relative scroll-mt-[120px]">
      <div className="container-site grid gap-8 py-16 lg:min-h-[calc(100svh-120px)] lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:grid-rows-[1fr_auto_auto_1fr] lg:gap-x-12 lg:gap-y-0 lg:py-8">
        {/* Words and paths: the heading first, then (on phones) the drawing, then the rest */}
        <div className="min-w-0 lg:col-start-1 lg:row-start-2">
          <h2
            id="how-title"
            className="font-display text-[clamp(1.9rem,1.2rem+1.5vw,2.6rem)] font-[440] leading-[1.04] tracking-[-0.036em] text-fg [font-stretch:104%] [@media(min-width:1024px)_and_(max-height:820px)]:text-[1.875rem]"
          >
            How the system works. <span className="text-fg-subtle">Your IP never leaves the building.</span>
          </h2>
        </div>
        {/* The drawing */}
        <StageCard
          className="lg:col-start-2 lg:row-span-4 lg:row-start-1 lg:mt-0 lg:self-center"
          index={String(Math.max(0, step) + 1).padStart(2, "0")}
          title={node.stage}
          aside={
            <Caption className="flex items-center gap-2">
              <LiveDot />
              <span className="hidden sm:inline">{flow.status}</span>
            </Caption>
          }
          footer={
            <div className="flex items-start justify-between gap-6" aria-live={touring ? "off" : "polite"}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={focus}
                  initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -6, filter: "blur(4px)" }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="min-h-[3em] text-[0.875rem] leading-relaxed text-fg-muted [@media(min-width:1024px)_and_(max-height:820px)]:line-clamp-2 [@media(min-width:1024px)_and_(max-height:820px)]:min-h-[2.6em]"
                >
                  <span className="font-medium text-fg">{node.title}.</span> {node.desc}
                </motion.p>
              </AnimatePresence>
              {!reduce && (
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={touring ? "Pause the tour" : "Play the tour"}
                  className="grid size-8 shrink-0 place-items-center rounded-full border border-line-strong text-fg-muted transition-colors hover:text-fg"
                >
                  {touring ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
                </button>
              )}
            </div>
          }
          segments={{ count: path.length, lit: step + 1 }}
          bodyClassName="p-0 md:p-0"
        >
          <div className="relative h-[24rem] sm:h-[28rem] lg:h-[clamp(20rem,calc(100svh-23rem),31rem)]">
            <Airlock progress={progress} wide={wide} fill still={reduce} className="absolute inset-0">
              {(g) => (
                <div>
                  <span aria-hidden className="absolute" style={{ left: g.office.x + 16, top: g.office.y + 14 }}>
                    <Mono>On-site or regional data center</Mono>
                  </span>
                  <span aria-hidden className="absolute -translate-x-1/2" style={{ left: g.vault.x, top: g.vault.y + 22 }}>
                    <Mono>Vault</Mono>
                  </span>
                  {(Object.keys(SHORT) as NodeKey[]).map((k) => {
                    const p = place(k, g);
                    const on = k === focus;
                    const dim = off(k);
                    return (
                      <React.Fragment key={k}>
                        <button
                          type="button"
                          onClick={() => pick(k)}
                          aria-pressed={on}
                          aria-label={`${SYSTEM_NODES[k].title}${dim ? " (idle on this path)" : ""}`}
                          className="pointer-events-auto absolute size-10 -translate-x-1/2 -translate-y-1/2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-signal"
                          style={{ left: p.at.x, top: p.at.y }}
                        >
                          {on && (
                            <motion.span
                              layoutId="map-focus"
                              transition={{ type: "spring", stiffness: 300, damping: 32 }}
                              className="absolute inset-0 rounded-full border border-fg"
                            >
                              <span className="absolute inset-0 animate-ping rounded-full border border-signal/60" />
                            </motion.span>
                          )}
                          {!on && <span className="absolute inset-[13px] rounded-full border border-fg/0 transition-colors hover:border-fg/40" />}
                        </button>
                        <span
                          aria-hidden
                          onClick={() => pick(k)}
                          className="pointer-events-auto absolute cursor-pointer"
                          style={{ left: p.label.x, top: p.label.y }}
                        >
                          <span
                            className={cn(
                              "block whitespace-nowrap text-[0.8125rem] font-medium leading-none transition-[color,opacity] duration-500",
                              p.anchor === "t" && "-translate-x-1/2",
                              p.anchor === "b" && "-translate-x-1/2 -translate-y-full",
                              p.anchor === "r" && "-translate-x-full",
                              on ? "text-fg" : "text-fg-muted hover:text-fg",
                              dim && "opacity-35"
                            )}
                          >
                            {SHORT[k]}
                          </span>
                        </span>
                      </React.Fragment>
                    );
                  })}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute font-mono text-[0.625rem] uppercase tracking-[0.2em] transition-opacity duration-500",
                      mode === "local" ? "text-rose opacity-100" : "opacity-0"
                    )}
                    style={g.wide ? { left: g.gate.x + 14, top: g.gate.y - 26 } : { left: g.gate.x + 26, top: g.gate.y + 10 }}
                  >
                    Egress locked
                  </span>
                </div>
              )}
            </Airlock>
          </div>
        </StageCard>

        <div className="min-w-0 lg:col-start-1 lg:row-start-3">
          <div className="space-y-3 lg:mt-5 text-[0.9375rem] leading-[1.6] text-fg-muted [@media(min-width:1024px)_and_(max-height:820px)]:text-[0.875rem]">
            {IP_GUARANTEE.map((p) => (
              <p key={p}>{p}</p>
            ))}
            <p className="text-fg">Compliance officers can prove mathematically that zero corporate IP ever crossed the firewall.</p>
          </div>
          <div className="mt-7 [@media(min-width:1024px)_and_(max-height:820px)]:mt-4">
            <div>
              <RailList
                compact
                shortHide
                label="Path through the system"
                items={FLOW_MODES.map((m) => ({ key: m.key, title: m.label, body: m.body }))}
                value={mode}
                onChange={choose}
              />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
