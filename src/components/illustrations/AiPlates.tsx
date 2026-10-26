"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/useReducedMotion";
import React from "react";
import { DisciplineFigure } from "./Disciplines";
import { Backdrop, DISPLAY, Figure, Glow, INK, Label, Line, Ping, Signal, TextBars, onEllipse, r2, smooth } from "./kit";

/**
 * Plates for the AI page, in the same white ink as the home illustrations.
 * The three pillars share a 400 x 240 stage; the four kinds of work share the
 * 480 x 384 stage of the discipline plates.
 */
const PW = 400;
const PH = 240;
const W = 480;
const H = 384;
const EASE = [0.22, 1, 0.36, 1] as const;

function useAppear() {
  const reduce = useReducedMotion();
  return (i: number) => ({
    initial: reduce ? false : { opacity: 0, y: 10 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration: 0.7, ease: EASE, delay: 0.15 + i * 0.25 },
  });
}

function useDraw() {
  const reduce = useReducedMotion();
  return (delay = 0, duration = 1.4) => ({
    initial: reduce ? false : { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true, amount: 0.4 },
    transition: { duration, ease: EASE, delay },
  });
}

export function PillarFigure({ id }: { id: string }) {
  if (id === "systems") return <SystemsPlate />;
  if (id === "agents") return <AgentsPlate />;
  return <EvaluationPlate />;
}

export function BuildFigure({ index }: { index: number }) {
  if (index === 0) return <DisciplineFigure id="ai" />;
  if (index === 1) return <InsightPlate />;
  if (index === 2) return <WorkflowPlate />;
  return <VisionPlate />;
}

/* ── Pillars ────────────────────────────────────────────────────────────── */

/** AI systems: what it reads, sees and hears becomes understanding, a forecast and a recommendation. */
function SystemsPlate() {
  const senses = [
    { y: 50, label: "READ" },
    { y: 104, label: "SEE" },
    { y: 158, label: "HEAR" },
  ];
  const hub = { x: 182, y: 120 };
  const links = senses.map((s) => {
    const y = s.y + 16;
    return Math.abs(y - hub.y) < 4 ? `M106 ${y} H152` : `M106 ${y} C132 ${y}, 128 ${hub.y}, 152 ${hub.y}`;
  });
  const ring = Array.from({ length: 8 }, (_, i) => onEllipse(hub.x, hub.y, 22, 22, i * 45 + 22));
  const toPredict = `M212 ${hub.y} H240`;
  const past: [number, number][] = [[248, 140], [262, 132], [274, 136], [286, 122], [298, 126]];
  const future: [number, number][] = [[298, 126], [310, 112], [322, 106]];
  const toRec = `M332 ${hub.y} H346`;

  return (
    <Figure viewBox={`0 0 ${PW} ${PH}`} label="Text, images and audio flowing into a system that understands them, forecasts what comes next and recommends an action">
      <Backdrop w={PW} h={PH} corners={false} />
      {senses.map((s, i) => (
        <g key={s.label}>
          <rect x="30" y={s.y} width="76" height="32" rx="9" fill={INK.surface} stroke={INK.line} vectorEffect="non-scaling-stroke" />
          <Label x={40} y={s.y + 19} size={6.5}>{s.label}</Label>
          {i === 0 && <TextBars x={70} y={s.y + 12} widths={[26, 18, 22]} gap={4.5} weight={1.4} tone={0.4} />}
          {i === 1 && (
            <path d={`M70 ${s.y + 24} l7 -8 l5 4 l6 -7 l8 11`} stroke={INK.soft} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          )}
          {i === 2 && (
            <g stroke="#fff" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round">
              {[4, 9, 6, 12, 7, 10, 5].map((hh, k) => (
                <path key={k} d={`M${71 + k * 4.2} ${r2(s.y + 16 - hh / 2)} v${hh}`}>
                  <animate attributeName="stroke-opacity" values="0.25;0.8;0.25" dur="1.4s" begin={`${-k * 0.18}s`} repeatCount="indefinite" />
                </path>
              ))}
            </g>
          )}
        </g>
      ))}
      {links.map((d) => (
        <Line key={d} d={d} />
      ))}

      <Glow cx={hub.x} cy={hub.y} r={64} />
      <g>
        <animateTransform attributeName="transform" type="rotate" from={`0 ${hub.x} ${hub.y}`} to={`360 ${hub.x} ${hub.y}`} dur="30s" repeatCount="indefinite" />
        {ring.map(([x, y], i) => {
          const [nx, ny] = ring[(i + 3) % ring.length];
          return <path key={i} d={`M${x} ${y} L${nx} ${ny}`} stroke={INK.faint} vectorEffect="non-scaling-stroke" />;
        })}
        {ring.map(([x, y], i) => (
          <g key={`n${i}`}>
            <path d={`M${hub.x} ${hub.y} L${x} ${y}`} stroke={INK.line} vectorEffect="non-scaling-stroke" />
            <circle cx={x} cy={y} r="2.4" fill={INK.soft} />
          </g>
        ))}
      </g>
      <circle cx={hub.x} cy={hub.y} r="7" fill={INK.raised} stroke={INK.strong} vectorEffect="non-scaling-stroke" />
      <circle cx={hub.x} cy={hub.y} r="2.6" fill={INK.white} />
      <Label x={hub.x} y={hub.y + 44} anchor="middle" size={6.5}>UNDERSTAND</Label>

      <Line d={toPredict} />
      <Line d={smooth(past)} tone="strong" width={1.4} />
      <Line d={smooth(future)} tone="soft" dash="2 3" />
      <circle cx="322" cy="106" r="2.6" fill={INK.white} />
      <Ping cx={322} cy={106} r={3} to={10} />
      <Line d="M244 150 H328" tone="faint" />
      <Label x={286} y={170} anchor="middle" size={6.5}>PREDICT</Label>

      <Line d={toRec} />
      <rect x="346" y={hub.y - 22} width="34" height="44" rx="8" fill={INK.raised} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
      <circle cx="363" cy={hub.y - 6} r="6" stroke={INK.strong} vectorEffect="non-scaling-stroke" />
      <path d={`M360 ${hub.y - 6} l2 2 l4 -4.5`} stroke={INK.white} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <TextBars x={354} y={hub.y + 9} widths={[18, 12]} gap={5} weight={1.4} tone={0.45} />
      <Label x={363} y={hub.y + 44} anchor="middle" size={6.5}>ACT</Label>

      {links.map((d, i) => (
        <Signal key={d} d={d} dur={2.4} delay={i * 0.8} />
      ))}
      <Signal d={toPredict} dur={1.6} delay={0.5} tail={36} head={10} />
      <Signal d={toRec} dur={1.6} delay={1.2} tail={40} head={12} />
    </Figure>
  );
}

/** Agents: an objective at the centre of a plan-tools-act-check loop, with a person approving actions. */
function AgentsPlate() {
  const box = { x: 70, y: 46, w: 260, h: 148, r: 22 };
  const loop = `M${box.x + box.r} ${box.y} H${box.x + box.w - box.r} Q${box.x + box.w} ${box.y} ${box.x + box.w} ${box.y + box.r} V${box.y + box.h - box.r} Q${box.x + box.w} ${box.y + box.h} ${box.x + box.w - box.r} ${box.y + box.h} H${box.x + box.r} Q${box.x} ${box.y + box.h} ${box.x} ${box.y + box.h - box.r} V${box.y + box.r} Q${box.x} ${box.y} ${box.x + box.r} ${box.y} Z`;
  const nodes = [
    { x: 112, y: box.y, label: "PLAN", up: true },
    { x: 288, y: box.y, label: "TOOLS", up: true },
    { x: 288, y: box.y + box.h, label: "ACT", up: false },
    { x: 112, y: box.y + box.h, label: "CHECK", up: false },
  ];
  const gate = { x: 200, y: box.y + box.h };
  const c = { x: 200, y: box.y + box.h / 2 };

  return (
    <Figure viewBox={`0 0 ${PW} ${PH}`} label="An agent working towards an objective in a loop of plan, tools, act and check, with a person approving each action">
      <Backdrop w={PW} h={PH} corners={false} />
      <path d={loop} stroke={INK.line} vectorEffect="non-scaling-stroke" />
      <Glow cx={c.x} cy={c.y} r={58} opacity={0.8} />
      {[24, 16, 8].map((r, i) => (
        <circle key={r} cx={c.x} cy={c.y} r={r} stroke={i === 2 ? INK.strong : INK.line} fill={i === 2 ? INK.raised : "none"} vectorEffect="non-scaling-stroke" />
      ))}
      <circle cx={c.x} cy={c.y} r="2.6" fill={INK.white} />
      <Label x={c.x} y={c.y + 40} anchor="middle" size={6.5}>OBJECTIVE</Label>
      {nodes.map((n) => (
        <path key={`s${n.label}`} d={`M${n.x} ${n.y} L${c.x} ${c.y}`} stroke={INK.faint} strokeDasharray="1 4" vectorEffect="non-scaling-stroke" />
      ))}
      {nodes.map((n) => (
        <g key={n.label}>
          <circle cx={n.x} cy={n.y} r="9" fill={INK.raised} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
          <circle cx={n.x} cy={n.y} r="2.6" fill={INK.soft} />
          <Label x={n.x} y={n.up ? n.y - 16 : n.y + 22} anchor="middle" size={6.5} tone="hi">
            {n.label}
          </Label>
        </g>
      ))}
      <g>
        <rect x={gate.x - 10} y={gate.y - 10} width="20" height="20" rx="4" transform={`rotate(45 ${gate.x} ${gate.y})`} fill={INK.white} />
        <circle cx={gate.x} cy={gate.y - 2.6} r="2.4" fill={INK.ground} />
        <path d={`M${gate.x - 4.2} ${gate.y + 4.6} Q${gate.x} ${gate.y - 0.4} ${gate.x + 4.2} ${gate.y + 4.6}`} stroke={INK.ground} strokeWidth="1.4" strokeLinecap="round" />
      </g>
      <Ping cx={gate.x} cy={gate.y} r={14} to={26} dur={3} />
      <Label x={gate.x} y={gate.y + 30} anchor="middle" size={6.5} tone="white">
        A PERSON APPROVES
      </Label>
      <Signal d={loop} dur={7} tail={10} head={3} />
    </Figure>
  );
}

/** Evaluation: scores across releases held above an agreed threshold, one drift caught. */
function EvaluationPlate() {
  const draw = useDraw();
  const x0 = 40;
  const x1 = 364;
  const yT = 104;
  const pts: [number, number][] = [
    [40, 82], [76, 74], [112, 80], [148, 66], [184, 70], [220, 62], [256, 126], [292, 68], [328, 60], [364, 56],
  ];
  const plot = smooth(pts);
  return (
    <Figure viewBox={`0 0 ${PW} ${PH}`} label="Evaluation scores over successive releases staying above an acceptance threshold, with one drop flagged and fixed">
      <Backdrop w={PW} h={PH} corners={false} />
      {[48, 104, 160].map((y) => (
        <Line key={y} d={`M${x0} ${y} H${x1}`} tone="grid" />
      ))}
      <Line d={`M${x0} 188 H${x1}`} tone="line" />
      <rect x={x0} y={yT} width={x1 - x0} height="84" fill="#fff" fillOpacity="0.025" />
      <Line d={`M${x0} ${yT} H${x1}`} tone="soft" dash="3 4" />
      <Label x={x0} y={yT + 16} size={6.5}>ACCEPTANCE THRESHOLD</Label>
      {pts.map(([x], i) => (
        <g key={x}>
          <path d={`M${x} 188 v4`} stroke={INK.line} vectorEffect="non-scaling-stroke" />
          <Label x={x} y={206} anchor="middle" size={6}>{`v${i + 1}`}</Label>
        </g>
      ))}
      <motion.path d={plot} stroke={INK.white} strokeWidth="1.5" strokeLinecap="round" {...draw(0.2, 1.8)} />
      {pts.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 6 ? 4 : 2.6} fill={i === 6 ? INK.ground : INK.white} stroke={i === 6 ? INK.white : "none"} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      ))}
      <Ping cx={256} cy={126} r={6} to={16} />
      <rect x="216" y="138" width="80" height="20" rx="10" fill={INK.raised} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
      <Label x={256} y={151} anchor="middle" size={6.5} tone="white">DRIFT CAUGHT</Label>
      <line x1={x0} x2={x0} y1="40" y2="188" stroke="#fff" strokeOpacity="0.35" vectorEffect="non-scaling-stroke">
        <animate attributeName="x1" values={`${x0};${x1}`} dur="6s" repeatCount="indefinite" />
        <animate attributeName="x2" values={`${x0};${x1}`} dur="6s" repeatCount="indefinite" />
      </line>
    </Figure>
  );
}

/* ── Kinds of work ──────────────────────────────────────────────────────── */

/** Insight: a messy table read row by row, turned into a trend and one finding. */
function InsightPlate() {
  const appear = useAppear();
  const draw = useDraw();
  const reduce = useReducedMotion();
  const table = { x: 30, y: 82, w: 160, h: 228 };
  const rows = 11;
  const rowH = (table.h - 36) / rows;
  const chart = { x: 228, y: 82, w: 222, h: 228 };
  const base = chart.y + chart.h - 34;
  const bars = [52, 74, 64, 96, 112, 138];
  const bx = (i: number) => chart.x + 22 + i * 32;
  const trend = smooth(bars.map((b, i) => [bx(i) + 10, base - b - 14] as [number, number]));
  const feed = `M${table.x + table.w} ${table.y + table.h / 2} C${table.x + table.w + 20} ${table.y + table.h / 2}, ${chart.x - 20} ${chart.y + chart.h / 2}, ${chart.x} ${chart.y + chart.h / 2}`;

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="Rows of a spreadsheet read one by one and turned into a rising trend with one highlighted finding">
      <Backdrop w={W} h={H} />
      <Label x={36} y={44} size={7}>Documents, tables, logs</Label>
      <Label x={W - 36} y={44} anchor="end" size={7}>One decision</Label>

      <rect x={table.x} y={table.y} width={table.w} height={table.h} rx="12" fill={INK.surface} stroke={INK.line} />
      <Label x={table.x + 14} y={table.y + 22} size={7} tone="hi">orders.csv</Label>
      <Line d={`M${table.x} ${table.y + 32} H${table.x + table.w}`} tone="faint" />
      {Array.from({ length: rows }, (_, i) => {
        const y = table.y + 44 + i * rowH;
        return (
          <g key={i}>
            <TextBars x={table.x + 14} y={y} widths={[22, 48, 30]} gap={0} weight={2} tone={0.22} />
            <path d={`M${table.x + 40} ${r2(y)} h48 M${table.x + 96} ${r2(y)} h${18 + ((i * 13) % 34)}`} stroke="#fff" strokeOpacity="0.2" strokeWidth="2" strokeLinecap="round" />
          </g>
        );
      })}
      <rect x={table.x + 6} y={table.y + 37} width={table.w - 12} height={rowH} rx="4" fill="#fff" fillOpacity="0.1">
        {!reduce && (
          <animate attributeName="y" values={`${table.y + 37};${r2(table.y + 37 + rowH * (rows - 1))}`} dur="4.4s" repeatCount="indefinite" />
        )}
      </rect>

      <Line d={feed} tone="mid" dash="2 3" />
      <Signal d={feed} dur={2.2} tail={30} head={8} />

      <rect x={chart.x} y={chart.y} width={chart.w} height={chart.h} rx="12" fill={INK.surface} stroke={INK.line} />
      {[0, 1, 2].map((k) => (
        <Line key={k} d={`M${chart.x + 14} ${base - 40 - k * 42} H${chart.x + chart.w - 14}`} tone="grid" />
      ))}
      <Line d={`M${chart.x + 14} ${base} H${chart.x + chart.w - 14}`} tone="line" />
      {bars.map((b, i) => (
        <motion.rect
          key={i}
          x={bx(i)}
          y={base - b}
          width="20"
          height={b}
          rx="4"
          fill="#fff"
          fillOpacity={i === bars.length - 1 ? 0.85 : 0.16}
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.9, ease: EASE, delay: 0.2 + i * 0.08 }}
          style={{ transformOrigin: `${bx(i) + 10}px ${base}px` }}
        />
      ))}
      <motion.path d={trend} stroke={INK.white} strokeWidth="1.6" strokeLinecap="round" {...draw(0.7, 1.4)} />
      <motion.g {...appear(3)}>
        <rect x={chart.x + 18} y={chart.y + 14} width="104" height="40" rx="10" fill={INK.raised} stroke={INK.mid} />
        <Label x={chart.x + 30} y={chart.y + 30} size={7} tone="white">Finding</Label>
        <TextBars x={chart.x + 30} y={chart.y + 42} widths={[66]} weight={2} tone={0.5} />
        <Ping cx={bx(5) + 10} cy={base - bars[5] - 14} r={4} to={14} />
      </motion.g>
    </Figure>
  );
}

/** Workflow: what arrives is classified, then routed to a person or completed automatically. */
function WorkflowPlate() {
  const appear = useAppear();
  const inbox = ["invoice.pdf", "email", "form"];
  const trig = { x: 160, y: 200 };
  const cls = { x: 270, y: 200 };
  const per = { x: 378, y: 132 };
  const auto = { x: 378, y: 268 };
  const done = { x: 452, y: 200 };
  const paths = {
    a: `M${trig.x + 40} ${trig.y} H${cls.x - 40}`,
    b: `M${cls.x + 40} ${cls.y} C${cls.x + 62} ${cls.y}, ${per.x - 62} ${per.y}, ${per.x - 40} ${per.y}`,
    c: `M${cls.x + 40} ${cls.y} C${cls.x + 62} ${cls.y}, ${auto.x - 62} ${auto.y}, ${auto.x - 40} ${auto.y}`,
    d: `M${per.x + 40} ${per.y} C${done.x - 6} ${per.y}, ${done.x} ${per.y + 20}, ${done.x} ${done.y - 14}`,
    e: `M${auto.x + 40} ${auto.y} C${done.x - 6} ${auto.y}, ${done.x} ${auto.y - 20}, ${done.x} ${done.y + 14}`,
  };
  const box = (p: { x: number; y: number }, label: string, tone: "plain" | "lit" | "white") => (
    <g>
      <rect
        x={p.x - 40}
        y={p.y - 24}
        width="80"
        height="48"
        rx="12"
        fill={tone === "white" ? INK.white : INK.raised}
        stroke={tone === "plain" ? INK.line : tone === "lit" ? INK.strong : "none"}
      />
      <Label x={p.x} y={p.y + 3} anchor="middle" size={7.5} tone={tone === "white" ? "dark" : "hi"}>
        {label}
      </Label>
    </g>
  );

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="Incoming documents classified by a workflow, then sent to a person for approval or completed automatically">
      <Backdrop w={W} h={H} />
      <Label x={36} y={44} size={7}>What arrives</Label>
      <Label x={W - 36} y={44} anchor="end" size={7}>Oversight kept</Label>

      {inbox.map((t, i) => {
        const cy = 128 + i * 72;
        const d = `M104 ${cy} C132 ${cy}, ${trig.x - 64} ${trig.y}, ${trig.x - 40} ${trig.y}`;
        return (
          <motion.g key={t} {...appear(i)}>
            <rect x="24" y={cy - 11} width="80" height="22" rx="11" fill={INK.surface} stroke={INK.line} />
            <Label x={64} y={cy + 3} anchor="middle" size={6.5}>{t}</Label>
            <Line d={d} tone="faint" />
          </motion.g>
        );
      })}
      {Object.values(paths).map((d) => (
        <Line key={d} d={d} />
      ))}
      {box(trig, "Trigger", "plain")}
      <Glow cx={cls.x} cy={cls.y} r={70} opacity={0.7} />
      {box(cls, "Classify", "lit")}
      {box(per, "Approve", "white")}
      <circle cx={per.x - 44} cy={per.y - 46} r="3.6" fill={INK.white} />
      <path d={`M${per.x - 50} ${per.y - 35} Q${per.x - 44} ${per.y - 44} ${per.x - 38} ${per.y - 35}`} stroke={INK.white} strokeWidth="1.4" strokeLinecap="round" />
      <Label x={per.x - 30} y={per.y - 38} size={6.5}>Person in the loop</Label>
      {box(auto, "Auto", "plain")}
      <circle cx={done.x} cy={done.y} r="14" fill={INK.raised} stroke={INK.strong} />
      <path d={`M${done.x - 5} ${done.y} l3.5 3.5 l7 -7.5`} stroke={INK.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <Ping cx={done.x} cy={done.y} r={14} to={26} dur={3} />

      <Signal d={paths.a} dur={1.6} tail={34} head={10} />
      <Signal d={paths.b} dur={2.4} delay={0.8} />
      <Signal d={paths.c} dur={2.4} delay={1.9} />
      <Signal d={paths.d} dur={2.2} delay={1.6} />
      <Signal d={paths.e} dur={2.2} delay={2.7} />
    </Figure>
  );
}

/** Vision: pose keypoints on a sprinting athlete, the knee angle read and one risk flagged. */
function VisionPlate() {
  const reduce = useReducedMotion();
  const joints: [number, number][] = [
    [254, 98], // head
    [246, 132], // neck
    [206, 160], // l elbow
    [186, 198], // l hand
    [280, 156], // r elbow
    [308, 130], // r hand
    [238, 206], // hip
    [284, 238], // l knee
    [266, 296], // l ankle
    [198, 246], // r knee
    [162, 270], // r ankle
  ];
  const bones = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [1, 6], [6, 7], [7, 8], [6, 9], [9, 10]];
  const frame = { x: 132, y: 66, w: 220, h: 262 };
  const k = joints[7];

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} labelScale={1.15} label="Computer vision tracking an athlete's joints, reading the knee angle and flagging a movement risk">
      <Backdrop w={W} h={H} />
      <Label x={36} y={44} size={7}>Training footage</Label>
      <Label x={W - 36} y={44} anchor="end" size={7}>Shared with clinicians</Label>

      <g stroke={INK.strong} strokeWidth="1.6" strokeLinecap="round">
        <path d={`M${frame.x} ${frame.y + 18} V${frame.y} H${frame.x + 18}`} />
        <path d={`M${frame.x + frame.w - 18} ${frame.y} H${frame.x + frame.w} V${frame.y + 18}`} />
        <path d={`M${frame.x} ${frame.y + frame.h - 18} V${frame.y + frame.h} H${frame.x + 18}`} />
        <path d={`M${frame.x + frame.w - 18} ${frame.y + frame.h} H${frame.x + frame.w} V${frame.y + frame.h - 18}`} />
      </g>
      <Label x={frame.x} y={frame.y - 10} size={7} tone="hi">Athlete · tracked</Label>
      <rect x={frame.x + 2} y={frame.y} width={frame.w - 4} height="2" fill="#fff" fillOpacity="0.4">
        {!reduce && <animate attributeName="y" values={`${frame.y};${frame.y + frame.h};${frame.y}`} dur="5s" repeatCount="indefinite" />}
      </rect>
      <Glow cx={238} cy={196} r={120} opacity={0.5} />

      {bones.map(([a, b], i) => (
        <motion.line
          key={i}
          x1={joints[a][0]}
          y1={joints[a][1]}
          x2={joints[b][0]}
          y2={joints[b][1]}
          stroke={INK.white}
          strokeWidth="2.4"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0, opacity: 0 }}
          whileInView={{ pathLength: 1, opacity: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.1 + i * 0.07 }}
        />
      ))}
      {joints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={i === 0 ? 11 : 4} fill={i === 0 ? "none" : INK.ground} stroke={INK.white} strokeWidth={i === 0 ? 2.2 : 1.6} />
      ))}
      <path d={`M${k[0] - 18} ${k[1] - 22} A 28 28 0 0 1 ${k[0] + 6} ${k[1] + 27}`} stroke={INK.soft} strokeWidth="1.2" />
      <Ping cx={k[0]} cy={k[1]} r={6} to={20} />
      <rect x="318" y="226" width="118" height="44" rx="11" fill={INK.raised} stroke={INK.mid} />
      <Label x={330} y={244} size={7} tone="white">Knee angle</Label>
      <text x="330" y="262" fontSize="12" fill={INK.soft} style={DISPLAY} letterSpacing="-0.02em">
        Risk flagged
      </text>
      <Line d={`M${k[0] + 8} ${k[1]} H318`} tone="mid" dash="2 3" />
      <Line d={`M60 ${frame.y + frame.h + 18} H${W - 60}`} tone="faint" />
    </Figure>
  );
}
