"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { Share2, TriangleAlert } from "lucide-react";
import React from "react";
import { Assemble, MicroLabel, SCENE_EASE, SceneShell } from "./SceneShell";

// A sprinting pose, joints in a 200 x 220 box.
const J: [number, number][] = [
  [112, 26], // head
  [106, 52], // neck
  [80, 74], // l elbow
  [64, 98], // l hand
  [128, 72], // r elbow
  [146, 56], // r hand
  [98, 110], // hip
  [132, 132], // l knee
  [124, 174], // l ankle
  [74, 142], // r knee
  [48, 156], // r ankle
];
const BONES = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [1, 6], [6, 7], [7, 8], [6, 9], [9, 10]];

const METRICS = [
  { label: "Knee flexion", value: "142°", bench: 0.72, pro: 0.78 },
  { label: "Hip symmetry", value: "94%", bench: 0.94, pro: 0.97 },
  { label: "Ground contact", value: "0.21 s", bench: 0.58, pro: 0.66 },
];

export function AthleteScene({ tag }: { tag?: boolean }) {
  const reduce = useReducedMotion();
  const draw = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true },
          transition: { duration: 0.6, ease: SCENE_EASE, delay },
        };
  return (
    <SceneShell label="Connected Athlete movement analysis" tag={tag}>
      <div className="flex h-full gap-3 p-3 @[520px]:gap-4 @[520px]:p-4">
        <Assemble className="relative min-w-0 flex-1 overflow-hidden rounded-[10px] border border-white/[0.08] bg-[radial-gradient(90%_80%_at_50%_30%,oklch(0.26_0_0),oklch(0.13_0_0)_75%)]">
          <div className="absolute inset-x-3 top-3 flex items-center justify-between">
            <MicroLabel className="text-fg">pose · 60 fps</MicroLabel>
            <MicroLabel>clip 04 / sprint start</MicroLabel>
          </div>
          {/* Scan line sweeping the clip */}
          {!reduce && (
            <motion.span
              aria-hidden
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"
              initial={{ top: "8%" }}
              animate={{ top: ["8%", "92%", "8%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            />
          )}
          <svg aria-hidden viewBox="0 0 200 220" className="absolute inset-0 m-auto h-[82%] w-full">
            <g stroke="oklch(1 0 0 / 0.55)" strokeWidth="2" fill="none" strokeLinecap="round">
              <path d="M40 14 h12 M40 14 v12" />
              <path d="M160 14 h-12 M160 14 v12" />
              <path d="M40 196 h12 M40 196 v-12" />
              <path d="M160 196 h-12 M160 196 v-12" />
            </g>
            {BONES.map(([a, b], i) => (
              <motion.line
                key={i}
                x1={J[a][0]}
                y1={J[a][1]}
                x2={J[b][0]}
                y2={J[b][1]}
                stroke="oklch(0.92 0 0)"
                strokeWidth="3"
                strokeLinecap="round"
                {...draw(0.2 + i * 0.06)}
              />
            ))}
            {J.map(([x, y], i) => (
              <motion.circle
                key={i}
                cx={x}
                cy={y}
                r={i === 0 ? 9 : 3.5}
                fill={i === 0 ? "none" : "oklch(0.99 0 0)"}
                stroke={i === 0 ? "oklch(0.92 0 0)" : "none"}
                strokeWidth="3"
                initial={reduce ? false : { opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, ease: SCENE_EASE, delay: 0.15 + i * 0.05 }}
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              />
            ))}
            <motion.path d="M118 122 A 18 18 0 0 1 140 146" fill="none" stroke="oklch(1 0 0)" strokeWidth="1.6" strokeDasharray="2 2" {...draw(0.9)} />
            <circle
              cx="132"
              cy="132"
              r="9"
              fill="none"
              stroke="oklch(1 0 0)"
              className="animate-ping motion-reduce:hidden"
              style={{ transformBox: "fill-box", transformOrigin: "center", animationDuration: "2.2s" }}
            />
            <line x1="20" x2="180" y1="186" y2="186" stroke="oklch(1 0 0 / 0.15)" />
          </svg>
          <span className="absolute bottom-3 left-3 rounded-[6px] border border-white/40 bg-black/70 px-2 py-1 font-mono text-[10px] text-fg backdrop-blur">
            L knee 142°
          </span>
        </Assemble>

        <div className="hidden w-[44%] max-w-[250px] flex-col gap-2.5 @[400px]:flex">
          <Assemble delay={0.15} x={14} y={0} className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.025] p-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium">vs pro benchmark</span>
              <MicroLabel>3 of 14</MicroLabel>
            </div>
            <ul className="mt-3 flex flex-col gap-3">
              {METRICS.map((m, i) => (
                <li key={m.label}>
                  <div className="flex items-baseline justify-between text-[10.5px]">
                    <span className="text-fg-muted">{m.label}</span>
                    <span className="font-mono tabular-nums text-fg">{m.value}</span>
                  </div>
                  <div className="relative mt-1.5 h-1 rounded-full bg-white/[0.07]">
                    <motion.div
                      className="h-full origin-left rounded-full bg-fg"
                      style={{ width: `${m.bench * 100}%` }}
                      initial={reduce ? false : { scaleX: 0 }}
                      whileInView={{ scaleX: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: SCENE_EASE, delay: 0.4 + i * 0.1 }}
                    />
                    <span className="absolute top-1/2 h-2.5 w-px -translate-y-1/2 bg-fg/70" style={{ left: `${m.pro * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Assemble>
          <Assemble delay={0.55} y={12} className="rounded-[10px] border border-dashed border-white/40 bg-white/[0.05] p-3">
            <div className="flex items-start gap-2">
              <TriangleAlert className="mt-0.5 size-3.5 shrink-0 text-fg" />
              <div className="min-w-0">
                <p className="text-[11px] font-medium leading-snug text-fg">Left knee load above baseline</p>
                <p className="mt-1 flex items-center gap-1 text-[10px] text-fg-subtle">
                  <Share2 className="size-3" />
                  Shared with physio
                </p>
              </div>
            </div>
          </Assemble>
        </div>
      </div>
    </SceneShell>
  );
}
