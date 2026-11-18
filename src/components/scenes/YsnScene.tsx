"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Eye, Send, Video } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Assemble, LivePill, MicroLabel, SceneShell } from "./SceneShell";

const CHAT = [
  { who: "coach_m", tone: "bg-white/20 text-fg", text: "Great press on the left side" },
  { who: "sam.parent", tone: "bg-white/10 text-fg", text: "What a save!!" },
  { who: "scout_ny", tone: "bg-fg text-black", text: "Who's #7? Tracking well" },
  { who: "riley", tone: "border border-white/25 text-fg", text: "Watching from Ohio, go team" },
];

// Player dots on the pitch, in % of the pitch box.
const HOME = [[18, 50], [34, 28], [36, 70], [52, 45], [58, 22], [62, 74], [74, 52]];
const AWAY = [[84, 50], [70, 34], [66, 62], [48, 30], [44, 64], [30, 48], [88, 30]];

export function YsnScene({ tag }: { tag?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <SceneShell label="YSN live stream with chat" tag={tag}>
      <div className="flex h-full gap-3 p-3 @[520px]:gap-4 @[520px]:p-4">
        <div className="flex min-w-0 flex-1 flex-col gap-2.5">
          <Assemble className="relative flex-1 overflow-hidden rounded-[10px] border border-white/[0.08] bg-[radial-gradient(120%_90%_at_50%_10%,oklch(0.3_0_0),oklch(0.15_0_0)_70%)]">
            <svg aria-hidden viewBox="0 0 100 60" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
              <g fill="none" stroke="oklch(1 0 0 / 0.22)" strokeWidth="0.6" vectorEffect="non-scaling-stroke">
                <rect x="4" y="6" width="92" height="48" vectorEffect="non-scaling-stroke" />
                <path d="M50 6 V54" vectorEffect="non-scaling-stroke" />
                <ellipse cx="50" cy="30" rx="7" ry="9" vectorEffect="non-scaling-stroke" />
                <rect x="4" y="18" width="12" height="24" vectorEffect="non-scaling-stroke" />
                <rect x="84" y="18" width="12" height="24" vectorEffect="non-scaling-stroke" />
              </g>
              {[0, 1, 2, 3, 4].map((i) => (
                <rect key={i} x={4 + i * 18.4} y="6" width="9.2" height="48" fill="oklch(1 0 0 / 0.025)" />
              ))}
            </svg>
            {HOME.map(([x, y], i) => (
              <span
                key={`h${i}`}
                className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_6px_oklch(1_0_0/0.8)]"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
            {AWAY.map(([x, y], i) => (
              <span
                key={`a${i}`}
                className="absolute size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/70"
                style={{ left: `${x}%`, top: `${y}%` }}
              />
            ))}
            {/* The ball, moving between two players */}
            <motion.span
              className="absolute size-[5px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-fg shadow-[0_0_8px_oklch(1_0_0)]"
              initial={{ left: "52%", top: "45%" }}
              animate={reduce ? undefined : { left: ["52%", "58%", "62%", "58%", "52%"], top: ["45%", "26%", "70%", "40%", "45%"] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="absolute inset-x-2.5 top-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <LivePill />
                <span className="rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-fg-muted backdrop-blur">Cam 2</span>
              </span>
              <span className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] text-fg-muted backdrop-blur">
                <Eye className="size-3" />
                1.2K
              </span>
            </div>
            <div className="absolute bottom-2.5 left-2.5 flex items-center overflow-hidden rounded-[6px] border border-white/10 bg-black/80 text-[10.5px] backdrop-blur">
              <span className="px-2 py-1 font-medium">HOM</span>
              <span className="bg-white/[0.06] px-2 py-1 font-mono tabular-nums">2 – 0</span>
              <span className="px-2 py-1 font-medium">AWY</span>
              <span className="border-l border-white/10 px-2 py-1 font-mono tabular-nums text-fg">63&apos;</span>
            </div>
          </Assemble>
          <div className="flex items-center justify-between gap-2">
            <div className="flex gap-1">
              {["Cam 1", "Cam 2", "Cam 3", "Wide"].map((c) => (
                <span
                  key={c}
                  className={cn("rounded-full px-2 py-0.5 text-[10px]", c === "Cam 2" ? "bg-fg text-black" : "text-fg-subtle")}
                >
                  {c}
                </span>
              ))}
            </div>
            <span className="hidden items-center gap-1 text-[10px] text-fg-subtle @[480px]:flex">
              <Video className="size-3" />
              Sponsor slot
            </span>
          </div>
        </div>

        <Assemble
          delay={0.15}
          x={14}
          y={0}
          className="hidden w-[38%] max-w-[220px] flex-col rounded-[10px] border border-white/[0.08] bg-white/[0.025] @[400px]:flex"
        >
          <div className="flex items-center justify-between border-b border-white/[0.06] px-3 py-2">
            <span className="text-[11px] font-medium">Live chat</span>
            <MicroLabel>214</MicroLabel>
          </div>
          <ul className="flex flex-1 flex-col justify-end gap-2.5 overflow-hidden px-3 py-2.5">
            {CHAT.map((m, i) => (
              <li key={m.who}>
                <Assemble delay={0.35 + i * 0.12} y={12} className="flex gap-2">
                  <span className={cn("grid size-5 shrink-0 place-items-center rounded-full text-[9px] font-semibold uppercase", m.tone)}>
                    {m.who[0]}
                  </span>
                  <span className="min-w-0 text-[10.5px] leading-snug">
                    <span className="block text-fg-subtle">@{m.who}</span>
                    <span className="block text-fg-muted">{m.text}</span>
                  </span>
                </Assemble>
              </li>
            ))}
          </ul>
          <div className="m-2 flex items-center justify-between rounded-[7px] border border-white/[0.08] px-2.5 py-1.5">
            <span className="text-[10px] text-fg-subtle">Say something…</span>
            <Send className="size-3 text-fg" />
          </div>
        </Assemble>
      </div>
    </SceneShell>
  );
}
