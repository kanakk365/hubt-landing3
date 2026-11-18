"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Gamepad2, Trophy } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import { Assemble, LivePill, MicroLabel, SCENE_EASE, SceneShell } from "./SceneShell";

type Match = { a: [string, number]; b: [string, number]; live?: boolean };

const QF: Match[] = [
  { a: ["Nova", 3], b: ["Riftline", 1] },
  { a: ["Vanta", 2], b: ["Overcast", 3] },
  { a: ["Kestrel", 3], b: ["Halcyon", 0] },
  { a: ["Tidebreak", 1], b: ["Sundial", 3] },
];
const SF: Match[] = [
  { a: ["Nova", 3], b: ["Overcast", 2] },
  { a: ["Kestrel", 1], b: ["Sundial", 1], live: true },
];

// Column geometry, in % of the bracket box.
const COLS = { qf: [0, 31], sf: [38, 69], f: [76, 100] } as const;
const Y = { qf: [12.5, 37.5, 62.5, 87.5], sf: [25, 75], f: [50] };

function MatchCard({ m, style, delay }: { m: Match; style: React.CSSProperties; delay: number }) {
  const aWin = !m.live && m.a[1] > m.b[1];
  const bWin = !m.live && m.b[1] > m.a[1];
  return (
    <Assemble
      delay={delay}
      x={-10}
      y={0}
      className={cn(
        "absolute -translate-y-1/2 overflow-hidden rounded-[7px] border bg-white/[0.035] text-[10px] leading-none @[560px]:text-[11px]",
        m.live ? "border-white/50 shadow-[0_0_18px_-4px_oklch(1_0_0/0.45)]" : "border-white/[0.08]"
      )}
      style={style}
    >
      {[m.a, m.b].map(([name, score], i) => {
        const win = i === 0 ? aWin : bWin;
        return (
          <div
            key={name}
            className={cn(
              "flex h-[17px] items-center justify-between gap-2 px-2 @[560px]:h-5",
              i === 1 && "border-t border-white/[0.06]",
              win ? "text-fg" : "text-fg-subtle"
            )}
          >
            <span className="flex min-w-0 items-center gap-1.5">
              <span className={cn("h-2.5 w-[2px] shrink-0 rounded-full", win ? "bg-fg" : "bg-white/10")} />
              <span className="truncate">{name}</span>
            </span>
            <span className="font-mono tabular-nums">{score}</span>
          </div>
        );
      })}
    </Assemble>
  );
}

function FinalCard({ style, delay }: { style: React.CSSProperties; delay: number }) {
  return (
    <Assemble
      delay={delay}
      x={-10}
      y={0}
      className="absolute flex -translate-y-1/2 flex-col items-center gap-1.5 rounded-[9px] border border-white/30 bg-[linear-gradient(180deg,oklch(1_0_0/0.12),oklch(1_0_0/0.03))] px-2 py-2.5 text-center"
      style={style}
    >
      <Trophy className="size-4 text-fg" />
      <span className="text-[10.5px] font-semibold @[560px]:text-[11.5px]">Final</span>
      <MicroLabel className="text-[9.5px]">Sat · 10:00 EST</MicroLabel>
    </Assemble>
  );
}

/** Connector paths that draw themselves once, then the live route keeps flowing. */
function Wires({ base, live, delay }: { base: string[]; live: string; delay: number }) {
  const reduce = useReducedMotion();
  return (
    <svg aria-hidden viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
      <g fill="none" stroke="oklch(1 0 0 / 0.16)" strokeWidth="1">
        {base.map((d) => (
          <motion.path
            key={d}
            d={d}
            vectorEffect="non-scaling-stroke"
            initial={reduce ? false : { pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9, ease: SCENE_EASE, delay }}
          />
        ))}
      </g>
      <path
        d={live}
        fill="none"
        stroke="oklch(0.97 0 0)"
        strokeWidth="1.5"
        strokeDasharray="3 4"
        vectorEffect="non-scaling-stroke"
        className="animate-flow-dash motion-reduce:animate-none"
      />
    </svg>
  );
}

export function BattleLoungeScene({ tag }: { tag?: boolean }) {
  const card = (col: readonly [number, number] | [number, number], y: number): React.CSSProperties => ({
    left: `${col[0]}%`,
    width: `${col[1] - col[0]}%`,
    top: `${y}%`,
  });
  return (
    <SceneShell label="Battle's Lounge tournament bracket" tag={tag}>
      <div className="flex h-full flex-col p-4 @[520px]:p-5">
        <Assemble className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid size-7 shrink-0 place-items-center rounded-[8px] bg-fg text-black">
              <Gamepad2 className="size-4" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[12.5px] font-semibold tracking-[-0.01em]">Apex Weekly Qualifier</p>
              <MicroLabel>Arena + online · single elimination</MicroLabel>
            </div>
          </div>
          <LivePill>
            <span className="hidden @[440px]:inline">Semi-final </span>live
          </LivePill>
        </Assemble>

        {/* Full bracket from 440px of container width */}
        <div className="relative mt-4 hidden flex-1 @[440px]:block">
          <Wires
            base={["M31 12.5 H34.5 V25 H38 M31 37.5 H34.5 V25", "M31 62.5 H34.5 V75 H38 M31 87.5 H34.5 V75", "M69 25 H72.5 V50 H76 M69 75 H72.5 V50"]}
            live="M69 75 H72.5 V50 H76"
            delay={0.35}
          />
          {QF.map((m, i) => (
            <MatchCard key={i} m={m} style={card(COLS.qf, Y.qf[i])} delay={0.1 + i * 0.05} />
          ))}
          {SF.map((m, i) => (
            <MatchCard key={i} m={m} style={card(COLS.sf, Y.sf[i])} delay={0.4 + i * 0.06} />
          ))}
          <FinalCard style={card(COLS.f, Y.f[0])} delay={0.65} />
        </div>

        {/* Compact: semi-finals into the final */}
        <div className="relative mt-4 flex-1 @[440px]:hidden">
          <Wires base={["M58 25 H62 V50 H66 M58 75 H62 V50"]} live="M58 75 H62 V50 H66" delay={0.3} />
          {SF.map((m, i) => (
            <MatchCard key={i} m={m} style={card([0, 58], Y.sf[i])} delay={0.1 + i * 0.06} />
          ))}
          <FinalCard style={card([66, 100], 50)} delay={0.4} />
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.06] pt-3">
          <MicroLabel>Registration closes 20 min before start</MicroLabel>
          <span className="hidden rounded-full border border-white/30 bg-white/10 px-2.5 py-0.5 text-[10.5px] font-medium text-fg @[420px]:inline">
            Register
          </span>
        </div>
      </div>
    </SceneShell>
  );
}
