"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React from "react";
import { Backdrop, DISPLAY, Figure, Glow, INK, Label, Line, Ping, Signal, TextBars, onEllipse, r2, smooth } from "./kit";

/**
 * One drawn plate per discipline, white ink on black, all on the same
 * 480 x 384 stage so the horizontal track reads as one set.
 */
const W = 480;
const H = 384;
const EASE = [0.22, 1, 0.36, 1] as const;

function useAppear() {
  const reduce = useReducedMotion();
  return (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.7, ease: EASE, delay: 0.15 + i * 0.3 },
  });
}

export function DisciplineFigure({ id }: { id: string }) {
  switch (id) {
    case "ai":
      return <AssistantPlate />;
    case "web":
      return <PlatformPlate />;
    case "app":
      return <PhonePlate />;
    case "qa":
    default:
      return <ChecksPlate />;
  }
}

/** AI: a customer question answered by an assistant, the answer traced to the passage it came from. */
function AssistantPlate() {
  const appear = useAppear();
  const doc = { x: 318, y: 92, w: 138, h: 214 };
  const docLines = [104, 96, 110, 88, 108, 100, 92, 110, 84, 102, 96, 70, 90];
  const hi = [5, 6, 7];
  const lineY = (i: number) => doc.y + 46 + i * 12.5;
  const cite = `M154 219 C232 219, 250 ${lineY(6)}, ${doc.x + 8} ${lineY(6)}`;

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="A customer question answered by an assistant, with the answer traced to the passage in its source document">
      <Backdrop w={W} h={H} />

      <circle cx="38" cy="46" r="11" fill={INK.raised} stroke={INK.mid} />
      <path d="M38 39.5 Q39 45 44.5 46 Q39 47 38 52.5 Q37 47 31.5 46 Q37 45 38 39.5 Z" fill={INK.white} />
      <Label x={56} y={49} tone="hi" size={7.5}>Assistant</Label>

      <motion.g {...appear(0)}>
        <rect x="120" y="70" width="180" height="42" rx="14" fill={INK.raised} stroke={INK.line} />
        <TextBars x={136} y={86} widths={[128, 84]} gap={11} tone={0.42} />
      </motion.g>

      <motion.g {...appear(1)}>
        <rect x="24" y="126" width="258" height="114" rx="16" fill={INK.surface} stroke={INK.mid} />
        <TextBars x={40} y={148} widths={[214, 196, 220, 132]} gap={14} tone={0.72} />
        <rect x="40" y="209" width="114" height="20" rx="10" fill="#fff" fillOpacity="0.07" stroke={INK.soft} />
        <Label x={97} y={222} anchor="middle" size={7} tone="white">Source · p.12</Label>
      </motion.g>

      <motion.g {...appear(2)}>
        <rect x="150" y="256" width="150" height="34" rx="14" fill={INK.raised} stroke={INK.line} />
        <TextBars x={166} y={273} widths={[104]} tone={0.42} />
      </motion.g>

      <motion.g {...appear(3)}>
        <rect x="24" y="306" width="58" height="26" rx="13" fill={INK.surface} stroke={INK.line} />
        {[0, 1, 2].map((i) => (
          <circle key={i} cx={40 + i * 13} cy="319" r="2.6" fill={INK.white}>
            <animate attributeName="fill-opacity" values="0.25;1;0.25" dur="1.2s" begin={`${-1.2 + i * 0.2}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </motion.g>

      {/* the source document, with the cited passage lit */}
      <rect x={doc.x} y={doc.y} width={doc.w} height={doc.h} rx="12" fill={INK.surface} stroke={INK.line} />
      <Label x={doc.x + 14} y={doc.y + 20} size={7} tone="hi">Policy.pdf</Label>
      <Label x={doc.x + doc.w - 14} y={doc.y + 20} anchor="end" size={7}>p.12</Label>
      <Line d={`M${doc.x} ${doc.y + 30} H${doc.x + doc.w}`} tone="faint" />
      <rect x={doc.x + 8} y={lineY(hi[0]) - 8} width={doc.w - 16} height={hi.length * 12.5 + 3} rx="5" fill="#fff" fillOpacity="0.08" />
      <rect x={doc.x + 8} y={lineY(hi[0]) - 8} width="2" height={hi.length * 12.5 + 3} rx="1" fill={INK.white} />
      {docLines.map((w, i) => (
        <path
          key={i}
          d={`M${doc.x + 16} ${lineY(i)} h${w}`}
          stroke="#fff"
          strokeOpacity={hi.includes(i) ? 0.82 : 0.2}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      ))}

      <Line d={cite} tone="mid" dash="2 3" />
      <Signal d={cite} dur={2.8} delay={0.6} tail={30} head={8} />
    </Figure>
  );
}

/** Web: a signed-in dashboard in the browser, served by an API and a database behind it. */
function PlatformPlate() {
  const reduce = useReducedMotion();
  const win = { x: 22, y: 44, w: 336, h: 296 };
  const side = 70;
  const cx0 = win.x + side + 14;
  const plot = { x0: cx0, x1: win.x + win.w - 16, y0: 150, y1: 226 };
  const series = [0.3, 0.42, 0.36, 0.55, 0.5, 0.66, 0.6, 0.78, 0.72, 0.88];
  const pts = series.map(
    (v, i) => [r2(plot.x0 + (i / (series.length - 1)) * (plot.x1 - plot.x0)), r2(plot.y1 - v * (plot.y1 - plot.y0))] as [number, number]
  );
  const curve = smooth(pts);
  const api = { x: 420, y: 128 };
  const db = { x: 420, y: 262 };
  const toApi = `M${win.x + win.w} ${api.y} H${api.x - 30}`;
  const toDb = `M${api.x} ${api.y + 22} V${db.y - 26}`;

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="A web dashboard in a browser window, served by an API and a database">
      <Backdrop w={W} h={H} />

      {/* browser */}
      <rect x={win.x} y={win.y} width={win.w} height={win.h} rx="14" fill={INK.surface} stroke={INK.mid} />
      <Line d={`M${win.x} ${win.y + 28} H${win.x + win.w}`} tone="faint" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={win.x + 16 + i * 11} cy={win.y + 14} r="3" fill={INK.line} />
      ))}
      <rect x={win.x + 70} y={win.y + 7} width="196" height="14" rx="7" fill={INK.ground} stroke={INK.faint} />
      <path
        d={`M${win.x + 80} ${win.y + 15.5} v-2.5 a2.5 2.5 0 0 1 5 0 v2.5 M${win.x + 78.5} ${win.y + 15.5} h8 v4 h-8 z`}
        stroke={INK.soft}
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <TextBars x={win.x + 94} y={win.y + 14} widths={[88]} weight={2} tone={0.3} />

      {/* sidebar */}
      <Line d={`M${win.x + side} ${win.y + 28} V${win.y + win.h}`} tone="faint" />
      {[0, 1, 2, 3, 4].map((i) => {
        const y = win.y + 50 + i * 24;
        const on = i === 1;
        return (
          <g key={i}>
            {on && <rect x={win.x + 8} y={y - 9} width={side - 16} height="18" rx="6" fill="#fff" fillOpacity="0.08" />}
            <rect x={win.x + 15} y={y - 3.5} width="7" height="7" rx="2" fill={on ? INK.white : INK.line} />
            <path d={`M${win.x + 28} ${y} h${on ? 26 : 20}`} stroke="#fff" strokeOpacity={on ? 0.75 : 0.25} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}
      <circle cx={win.x + 22} cy={win.y + win.h - 22} r="8" fill={INK.raised} stroke={INK.mid} />
      <path d={`M${win.x + 34} ${win.y + win.h - 22} h22`} stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />

      {/* figures row */}
      {[0, 1, 2].map((i) => {
        const w = (plot.x1 - plot.x0 - 16) / 3;
        const x = r2(plot.x0 + i * (w + 8));
        const spark = [6, 9, 7, 12, 10, 14].map((v, k) => [r2(x + 10 + k * ((w - 20) / 5)), r2(win.y + 76 - v)] as [number, number]);
        return (
          <g key={i}>
            <rect x={x} y={win.y + 40} width={w} height="48" rx="9" fill={INK.raised} stroke={INK.line} />
            <path d={`M${x + 10} ${win.y + 52} h${r2(w * 0.38)}`} stroke="#fff" strokeOpacity="0.3" strokeWidth="2" strokeLinecap="round" />
            <path d={smooth(spark)} stroke={i === 0 ? INK.white : INK.soft} strokeWidth="1.3" strokeLinecap="round" />
          </g>
        );
      })}

      {/* chart */}
      {[0, 0.5, 1].map((f) => (
        <Line key={f} d={`M${plot.x0} ${r2(plot.y1 - f * (plot.y1 - plot.y0))} H${plot.x1}`} tone={f === 0 ? "line" : "grid"} />
      ))}
      <path d={`${curve} L${plot.x1} ${plot.y1} L${plot.x0} ${plot.y1} Z`} fill="#fff" fillOpacity="0.05" />
      <motion.path
        d={curve}
        stroke={INK.white}
        strokeWidth="1.6"
        strokeLinecap="round"
        initial={reduce ? false : { pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 1.6, ease: EASE, delay: 0.3 }}
      />
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={INK.white} />
      <Ping cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={3} to={10} />

      {/* rows */}
      {[0, 1, 2].map((i) => {
        const y = 250 + i * 26;
        return (
          <g key={i}>
            <Line d={`M${plot.x0} ${y - 13} H${plot.x1}`} tone="grid" />
            <circle cx={plot.x0 + 8} cy={y} r="5" fill={INK.raised} stroke={INK.mid} />
            <TextBars x={plot.x0 + 22} y={y} widths={[[92, 70, 84][i]]} weight={2} tone={0.36} />
            <rect x={plot.x1 - 46} y={y - 7} width="46" height="14" rx="7" fill={i === 1 ? "#fff" : "none"} fillOpacity={0.9} stroke={i === 1 ? "none" : INK.line} />
            <path d={`M${plot.x1 - 37} ${y} h28`} stroke={i === 1 ? INK.ground : INK.soft} strokeOpacity={i === 1 ? 0.7 : 0.5} strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}

      {/* the pointer working the dashboard */}
      <g aria-hidden>
        <animateTransform
          attributeName="transform"
          type="translate"
          values="250 120; 290 188; 290 188; 318 276; 318 276; 250 120"
          keyTimes="0; 0.28; 0.45; 0.7; 0.86; 1"
          dur="7s"
          repeatCount="indefinite"
          calcMode="spline"
          keySplines="0.22 1 0.36 1; 0 0 1 1; 0.22 1 0.36 1; 0 0 1 1; 0.4 0 0.2 1"
        />
        <path d="M0 0 L0 13 L3.6 9.6 L6.2 15 L8.4 14 L5.8 8.8 L10.6 8.6 Z" fill={INK.white} stroke={INK.ground} strokeWidth="1" strokeLinejoin="round" />
      </g>

      {/* backend */}
      <Line d={toApi} tone="mid" dash="2 4" />
      <Line d={toDb} tone="mid" dash="2 4" />
      <Signal d={toApi} dur={2.2} tail={40} head={12} />
      <Signal d={`M${api.x - 30} ${api.y} H${win.x + win.w}`} dur={2.2} delay={1.1} tail={40} head={12} />
      <Signal d={toDb} dur={2.4} delay={0.5} tail={40} head={12} />

      <Glow cx={api.x} cy={api.y} r={62} opacity={0.8} />
      <rect x={api.x - 30} y={api.y - 22} width="60" height="44" rx="12" fill={INK.raised} stroke={INK.strong} />
      <path d={`M${api.x - 12} ${api.y - 6} l-6 6 l6 6 M${api.x + 12} ${api.y - 6} l6 6 l-6 6 M${api.x + 3} ${api.y - 9} l-6 18`} stroke={INK.white} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <Label x={api.x} y={api.y - 32} anchor="middle" size={7} tone="hi">API</Label>

      <g>
        <path d={`M${db.x - 28} ${db.y - 18} V${db.y + 26} A28 9 0 0 0 ${db.x + 28} ${db.y + 26} V${db.y - 18}`} fill={INK.raised} stroke={INK.mid} />
        <ellipse cx={db.x} cy={db.y - 18} rx="28" ry="9" fill={INK.surface} stroke={INK.strong} />
        <path d={`M${db.x - 28} ${db.y - 3} A28 9 0 0 0 ${db.x + 28} ${db.y - 3} M${db.x - 28} ${db.y + 12} A28 9 0 0 0 ${db.x + 28} ${db.y + 12}`} stroke={INK.line} />
        <Label x={db.x} y={db.y + 54} anchor="middle" size={7} tone="hi">Database</Label>
      </g>
    </Figure>
  );
}

/** App: one phone, a notification arriving, both platforms and the store release behind it. */
function PhonePlate() {
  const ph = { x: 172, y: 26, w: 136, h: 332 };
  const scr = { x: ph.x + 8, y: ph.y + 8, w: ph.w - 16, h: ph.h - 16 };
  const ring = { x: scr.x + 30, y: scr.y + 112 };
  const stages = ["Build", "Review", "Release"];
  const stageY = (i: number) => 112 + i * 76;
  const rail = `M60 ${stageY(0)} V${stageY(2)}`;
  const platforms = [
    { name: "iOS", tech: "Swift", y: 140 },
    { name: "Android", tech: "Kotlin", y: 242 },
  ];

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="A phone receiving a notification, built for iOS and Android and moving through a store release">
      <Backdrop w={W} h={H} />
      <Glow cx={240} cy={190} r={150} opacity={0.6} />

      {/* the release, left */}
      <Label x={36} y={70} size={7}>Store release</Label>
      <Line d={rail} />
      <Signal d={rail} dur={3.2} tail={30} head={9} />
      {stages.map((s, i) => (
        <g key={s}>
          <circle cx="60" cy={stageY(i)} r="11" fill={INK.raised} stroke={i === 2 ? INK.strong : INK.mid} />
          {i < 2 ? (
            <path d={`M55.5 ${stageY(i)} l3 3 l6 -6.5`} stroke={INK.white} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          ) : (
            <circle cx="60" cy={stageY(i)} r="3.6" fill={INK.white} />
          )}
          {i === 2 && <Ping cx={60} cy={stageY(i)} r={11} to={20} />}
          <Label x={80} y={stageY(i) + 3} size={7.5} tone={i === 2 ? "white" : "hi"}>
            {s}
          </Label>
        </g>
      ))}

      {/* platforms, right */}
      {platforms.map((p, i) => (
        <g key={p.name}>
          <Line d={`M${ph.x + ph.w} ${p.y + 16} H360`} tone="mid" dash="2 4" />
          <Signal d={`M${ph.x + ph.w} ${p.y + 16} H360`} dur={2.4} delay={i * 1.2} tail={44} head={14} />
          <rect x="360" y={p.y} width="96" height="32" rx="10" fill={INK.raised} stroke={INK.line} />
          <Label x={374} y={p.y + 14} size={7.5} tone="white">{p.name}</Label>
          <Label x={374} y={p.y + 25} size={6.5}>{p.tech}</Label>
        </g>
      ))}

      {/* phone */}
      <rect x={ph.x} y={ph.y} width={ph.w} height={ph.h} rx="26" fill={INK.ground} stroke={INK.strong} />
      <rect x={scr.x} y={scr.y} width={scr.w} height={scr.h} rx="19" fill={INK.surface} />
      <rect x={240 - 20} y={scr.y + 8} width="40" height="11" rx="5.5" fill={INK.ground} />

      {/* screen: greeting, a progress card, a list and the tab bar */}
      <TextBars x={scr.x + 12} y={scr.y + 44} widths={[54, 82]} gap={11} weight={2.6} tone={0.7} />
      <rect x={scr.x + 10} y={scr.y + 74} width={scr.w - 20} height="76" rx="12" fill={INK.raised} stroke={INK.line} />
      <circle cx={ring.x} cy={ring.y} r="16" stroke={INK.faint} strokeWidth="4" />
      <circle
        cx={ring.x}
        cy={ring.y}
        r="16"
        stroke={INK.white}
        strokeWidth="4"
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray="72 100"
        transform={`rotate(-90 ${ring.x} ${ring.y})`}
      >
        <animate attributeName="stroke-dasharray" values="8 100;72 100;72 100;8 100" keyTimes="0;0.4;0.9;1" dur="6s" repeatCount="indefinite" />
      </circle>
      <TextBars x={scr.x + 56} y={ring.y - 6} widths={[42, 30]} gap={10} weight={2.2} tone={0.45} />
      {[0, 1, 2].map((i) => {
        const y = scr.y + 172 + i * 34;
        return (
          <g key={i}>
            <rect x={scr.x + 10} y={y - 12} width="24" height="24" rx="7" fill={i === 0 ? INK.white : INK.raised} stroke={i === 0 ? "none" : INK.line} />
            <TextBars x={scr.x + 42} y={y - 4} widths={[[52, 44, 58][i], [34, 40, 28][i]]} gap={9} weight={2} tone={0.38} />
          </g>
        );
      })}
      <Line d={`M${scr.x} ${scr.y + scr.h - 38} H${scr.x + scr.w}`} tone="faint" />
      {[0, 1, 2, 3].map((i) => (
        <rect
          key={i}
          x={r2(scr.x + 16 + i * ((scr.w - 32 - 12) / 3))}
          y={scr.y + scr.h - 25}
          width="12"
          height="12"
          rx="3.5"
          fill={i === 0 ? INK.white : "none"}
          stroke={i === 0 ? "none" : INK.mid}
        />
      ))}

      {/* the notification dropping in, holding, and leaving */}
      <g aria-hidden>
        <animateTransform attributeName="transform" type="translate" values="0 -40; 0 0; 0 0; 0 -40" keyTimes="0; 0.12; 0.8; 1" dur="5s" repeatCount="indefinite" calcMode="spline" keySplines="0.22 1 0.36 1; 0 0 1 1; 0.4 0 1 1" />
        <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.12;0.8;1" dur="5s" repeatCount="indefinite" />
        <rect x={scr.x + 6} y={scr.y + 24} width={scr.w - 12} height="36" rx="11" fill={INK.raised} stroke={INK.mid} />
        <rect x={scr.x + 13} y={scr.y + 32} width="20" height="20" rx="6" fill={INK.white} />
        <TextBars x={scr.x + 40} y={scr.y + 37} widths={[46, 60]} gap={9} weight={2} tone={0.6} />
      </g>
    </Figure>
  );
}

/** QA: every release runs the same checks; a sweep lights them in turn until the gate passes. */
function ChecksPlate() {
  const c = { x: 240, y: 168 };
  const total = 36;
  const dur = 6;
  const tick = (i: number, a: number, b: number) => {
    const deg = -90 + (i / total) * 360;
    const [x1, y1] = onEllipse(c.x, c.y, a, a, deg);
    const [x2, y2] = onEllipse(c.x, c.y, b, b, deg);
    return `M${x1} ${y1} L${x2} ${y2}`;
  };
  const stages = ["Build", "Test", "Release"];
  const sx = (i: number) => 124 + i * 116;
  const pipe = `M${sx(0)} 338 H${sx(2)}`;

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="A release gate where every check lights in turn until the release passes">
      <Backdrop w={W} h={H} />
      <Label x={36} y={44} size={7}>Every commit</Label>
      <Label x={W - 36} y={44} anchor="end" size={7}>Same checks, every release</Label>

      <Glow cx={c.x} cy={c.y} r={124} opacity={0.8} />
      <circle cx={c.x} cy={c.y} r="118" stroke={INK.faint} />
      {Array.from({ length: total * 2 }, (_, i) => (
        <path key={i} d={tick(i / 2, 118, i % 2 === 0 ? 124 : 121)} stroke={INK.line} />
      ))}
      <circle cx={c.x} cy={c.y} r="70" stroke={INK.faint} />

      {Array.from({ length: total }, (_, i) => {
        const on = r2(0.04 + 0.62 * (i / total));
        return (
          <path key={i} d={tick(i, 82, 106)} stroke="#fff" strokeWidth="3.4" strokeLinecap="round" strokeOpacity="0.12">
            <animate
              attributeName="stroke-opacity"
              values="0.12;0.12;0.95;0.95;0.12"
              keyTimes={`0;${on};${r2(on + 0.02)};0.94;1`}
              dur={`${dur}s`}
              repeatCount="indefinite"
            />
          </path>
        );
      })}

      {/* the reading sweep, one turn per run, then a held pass */}
      <path d={tick(0, 74, 112)} stroke="#fff" strokeOpacity="0.5">
        <animateTransform
          attributeName="transform"
          type="rotate"
          values={`0 ${c.x} ${c.y};360 ${c.x} ${c.y};360 ${c.x} ${c.y}`}
          keyTimes="0;0.66;1"
          dur={`${dur}s`}
          repeatCount="indefinite"
        />
        <animate attributeName="stroke-opacity" values="0.5;0.5;0;0" keyTimes="0;0.66;0.67;1" dur={`${dur}s`} repeatCount="indefinite" />
      </path>

      <Label x={c.x} y={c.y - 30} anchor="middle" size={7.5}>Release gate</Label>
      <g>
        <animate attributeName="opacity" values="1;1;0;0;1" keyTimes="0;0.66;0.68;0.98;1" dur={`${dur}s`} repeatCount="indefinite" />
        <text x={c.x} y={c.y + 12} textAnchor="middle" fontSize="30" fontWeight="420" letterSpacing="-0.03em" fill={INK.soft} style={DISPLAY}>
          Running
        </text>
      </g>
      <g opacity="0">
        <animate attributeName="opacity" values="0;0;1;1;0" keyTimes="0;0.66;0.68;0.98;1" dur={`${dur}s`} repeatCount="indefinite" />
        <text x={c.x} y={c.y + 14} textAnchor="middle" fontSize="40" fontWeight="440" letterSpacing="-0.03em" fill={INK.white} style={DISPLAY}>
          Pass
        </text>
      </g>
      <Label x={c.x} y={c.y + 38} anchor="middle" size={7.5}>
        {`${total} checks`}
      </Label>

      {/* the pipeline under it */}
      <Line d={pipe} />
      <Signal d={pipe} dur={dur} tail={18} head={5} />
      {stages.map((s, i) => (
        <g key={s}>
          <rect x={sx(i) - 34} y="326" width="68" height="24" rx="12" fill={i === 1 ? INK.white : INK.raised} stroke={i === 1 ? "none" : INK.line} />
          <Label x={sx(i)} y={341} anchor="middle" size={7.5} tone={i === 1 ? "dark" : "hi"}>
            {s}
          </Label>
        </g>
      ))}
    </Figure>
  );
}
