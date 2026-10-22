"use client";

import React from "react";
import { Backdrop, Figure, Glow, INK, Label, Line, Ping, Signal, TextBars, onEllipse, r2, smooth, useFigure } from "./kit";

/**
 * One drawing per layer of a production AI system, all on a 3:2 stage so the
 * cards of the layer deck share one plate shape.
 */
const W = 360;
const H = 240;

export function LayerFigure({ index }: { index: number }) {
  switch (index) {
    case 0:
      return <ContextPlate />;
    case 1:
      return <ModelPlate />;
    case 2:
      return <ToolsPlate />;
    case 3:
      return <ActionPlate />;
    case 4:
      return <VerifyPlate />;
    default:
      return <MonitorPlate />;
  }
}

/** A hairline ruler along the bottom edge. */
function Ruler({ y = 222 }: { y?: number }) {
  const ticks = [];
  for (let x = 24; x <= W - 24; x += 12) ticks.push(x);
  return (
    <g aria-hidden>
      <Line d={`M24 ${y} H${W - 24}`} tone="faint" />
      {ticks.map((x, i) => (
        <path key={x} d={`M${x} ${y} v${i % 4 === 0 ? 5 : 2.5}`} stroke={INK.faint} vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  );
}

/** Context and data: the sources inside the permission line feed the context; the rest stay locked out. */
function ContextPlate() {
  const tile = { w: 70, h: 34 };
  const allowed = [
    { x: 30, y: 46, name: "Docs" },
    { x: 110, y: 46, name: "Tables" },
    { x: 30, y: 92, name: "Tickets" },
    { x: 110, y: 92, name: "Wiki" },
  ];
  const locked = [
    { x: 30, y: 168, name: "Payroll" },
    { x: 110, y: 168, name: "Inbox" },
  ];
  const ctx = { x: 262, y: 100 };
  const feeds = allowed.map((t) => {
    const sx = t.x + tile.w;
    const sy = t.y + tile.h / 2;
    return `M${sx} ${sy} C${sx + 34} ${sy}, ${ctx.x - 64} ${ctx.y}, ${ctx.x - 38} ${ctx.y}`;
  });

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} label="Data sources inside a permission boundary feeding the model's context, with two sources locked out">
      <Backdrop w={W} h={H} />
      <rect x="18" y="30" width="174" height="108" rx="12" stroke={INK.soft} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
      <rect x="26" y="24" width="52" height="12" rx="6" fill={INK.ground} />
      <Label x={30} y={33} size={6.5} tone="hi">Allowed</Label>

      {feeds.map((d, i) => (
        <g key={d}>
          <Line d={d} />
          <Signal d={d} dur={2.8} delay={i * 0.7} tail={26} head={7} />
        </g>
      ))}

      {allowed.map((t) => (
        <g key={t.name}>
          <rect x={t.x} y={t.y} width={tile.w} height={tile.h} rx="8" fill={INK.raised} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
          <rect x={t.x + 9} y={t.y + 11} width="9" height="12" rx="2" stroke={INK.soft} vectorEffect="non-scaling-stroke" />
          <Label x={t.x + 24} y={t.y + 20} size={6.5} tone="hi">{t.name}</Label>
        </g>
      ))}

      {locked.map((t) => (
        <g key={t.name} opacity="0.7">
          <rect x={t.x} y={t.y} width={tile.w} height={tile.h} rx="8" stroke={INK.line} strokeDasharray="2 3" vectorEffect="non-scaling-stroke" />
          <path
            d={`M${t.x + 11} ${t.y + 15} v-2.5 a3 3 0 0 1 6 0 v2.5 M${t.x + 9.5} ${t.y + 15} h9 v7 h-9 z`}
            stroke={INK.soft}
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          <Label x={t.x + 24} y={t.y + 20} size={6.5}>{t.name}</Label>
        </g>
      ))}
      <Label x={30} y={158} size={6}>Locked out</Label>

      <Glow cx={ctx.x} cy={ctx.y} r={70} />
      {[2, 1, 0].map((k) => (
        <rect
          key={k}
          x={ctx.x - 36 + k * 6}
          y={ctx.y - 44 - k * 6}
          width="76"
          height="92"
          rx="10"
          fill={k === 0 ? INK.surface : INK.ground}
          stroke={k === 0 ? INK.strong : INK.line}
          vectorEffect="non-scaling-stroke"
        />
      ))}
      <Label x={ctx.x - 26} y={ctx.y - 28} size={6.5} tone="hi">Context</Label>
      <TextBars x={ctx.x - 26} y={ctx.y - 12} widths={[52, 44, 56, 36, 48]} gap={9} weight={2} tone={0.45} />
      <Ruler />
    </Figure>
  );
}

/** Model: inputs of different kinds converging into a model, which returns a recommended next action. */
function ModelPlate() {
  const cy = 120;
  const cards = [
    { y: 40, label: "DOC" },
    { y: 97, label: "IMAGE" },
    { y: 154, label: "AUDIO" },
  ];
  const cardH = 46;
  const model = { x: 194, y: cy };
  const links = cards.map((c) => {
    const y = c.y + cardH / 2;
    return y === cy ? `M118 ${y} H168` : `M118 ${y} C146 ${y}, 142 ${cy}, 168 ${cy}`;
  });
  const out = `M220 ${cy} H252`;
  const wave = [3, 7, 4, 11, 6, 14, 9, 5, 12, 8, 16, 7, 10, 4, 8, 5];

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} label="Documents, images and audio flowing into a model that returns a recommended next action">
      <Backdrop w={W} h={H} />
      <Label x={24} y={28}>Input</Label>
      <Label x={model.x} y={28} anchor="middle">Model</Label>
      <Label x={252} y={28}>Output</Label>

      {cards.map((c) => (
        <g key={c.label}>
          <rect x="24" y={c.y} width="94" height={cardH} rx="9" fill={INK.surface} stroke={INK.line} vectorEffect="non-scaling-stroke" />
          <Label x={34} y={c.y + 14} size={6.5}>{c.label}</Label>
          <circle cx="118" cy={c.y + cardH / 2} r="2" fill={INK.soft} />
        </g>
      ))}
      <TextBars x={34} y={65} widths={[62, 48, 56]} gap={6.5} weight={1.8} tone={0.32} />
      <g aria-hidden>
        <rect x="34" y="117" width="34" height="18" rx="3" stroke={INK.mid} vectorEffect="non-scaling-stroke" />
        <path d="M36 133 l8 -8 l5 4 l6 -6 l11 10" stroke={INK.soft} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <circle cx="60" cy="122" r="2" fill={INK.soft} />
        <TextBars x={74} y={121} widths={[34, 22]} gap={7} weight={1.8} tone={0.28} />
      </g>
      <g stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
        {wave.map((h, i) => (
          <path key={i} d={`M${34 + i * 4.6} ${r2(185 - h / 2)} v${h}`} />
        ))}
      </g>

      {links.map((d) => (
        <Line key={d} d={d} />
      ))}
      <Line d={out} tone="mid" />

      <Glow cx={model.x} cy={model.y} r={70} />
      <circle cx={model.x} cy={model.y} r="35" stroke={INK.faint} strokeDasharray="1 4" vectorEffect="non-scaling-stroke">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${model.x} ${model.y}`} to={`360 ${model.x} ${model.y}`} dur="40s" repeatCount="indefinite" />
      </circle>
      {Array.from({ length: 24 }, (_, i) => {
        const [x1, y1] = onEllipse(model.x, model.y, 28, 28, i * 15);
        const [x2, y2] = onEllipse(model.x, model.y, i % 6 === 0 ? 31.5 : 30, i % 6 === 0 ? 31.5 : 30, i * 15);
        return <path key={i} d={`M${x1} ${y1} L${x2} ${y2}`} stroke={INK.mid} vectorEffect="non-scaling-stroke" />;
      })}
      <circle cx={model.x} cy={model.y} r="26" fill={INK.surface} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
      <circle cx={model.x} cy={model.y} r="14" fill={INK.raised} stroke={INK.strong} vectorEffect="non-scaling-stroke" />
      <circle cx={model.x} cy={model.y} r="4.5" fill={INK.white} />

      <rect x="252" y={cy - 34} width="86" height="68" rx="11" fill={INK.raised} stroke={INK.mid} vectorEffect="non-scaling-stroke" />
      <Label x={262} y={cy - 18} size={6.5} tone="hi">Next action</Label>
      <circle cx="267" cy={cy + 1} r="6.5" stroke={INK.strong} vectorEffect="non-scaling-stroke" />
      <path d={`M264 ${cy + 1} l2 2 l4 -4.5`} stroke={INK.white} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <TextBars x={280} y={cy - 2} widths={[46, 30]} gap={7} weight={1.8} tone={0.5} />
      <path d={`M262 ${cy + 21} h66`} stroke={INK.faint} strokeWidth="2.4" strokeLinecap="round" />
      <path d={`M262 ${cy + 21} h50`} stroke={INK.strong} strokeWidth="2.4" strokeLinecap="round" />

      {links.map((d, i) => (
        <Signal key={d} d={d} dur={2.6} delay={i * 0.85} />
      ))}
      <Signal d={out} dur={1.3} delay={0.4} tail={34} head={10} />
      <Ruler />
    </Figure>
  );
}

/** Tools and systems: the model wired out to the systems it is able to reach. */
function ToolsPlate() {
  const c = { x: 180, y: 120 };
  const tools = ["Search", "CRM", "Calendar", "Billing", "Database", "Email"].map((name, i) => {
    const [x, y] = onEllipse(c.x, c.y, 128, 76, -90 + i * 60);
    return { name, x, y, live: i !== 3 };
  });

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} label="A model connected to search, CRM, calendar, billing, database and email">
      <Backdrop w={W} h={H} />
      <ellipse cx={c.x} cy={c.y} rx="128" ry="76" stroke={INK.grid} strokeDasharray="2 5" vectorEffect="non-scaling-stroke" />
      {tools.map((t, i) => (
        <g key={t.name}>
          <Line d={`M${c.x} ${c.y} L${t.x} ${t.y}`} tone={t.live ? "line" : "faint"} dash={t.live ? undefined : "2 4"} />
          {t.live && <Signal d={`M${c.x} ${c.y} L${t.x} ${t.y}`} dur={2.6} delay={i * 0.45} tail={28} head={8} />}
        </g>
      ))}

      <Glow cx={c.x} cy={c.y} r={66} />
      <circle cx={c.x} cy={c.y} r="30" stroke={INK.faint} strokeDasharray="1 4" vectorEffect="non-scaling-stroke">
        <animateTransform attributeName="transform" type="rotate" from={`0 ${c.x} ${c.y}`} to={`360 ${c.x} ${c.y}`} dur="36s" repeatCount="indefinite" />
      </circle>
      <circle cx={c.x} cy={c.y} r="21" fill={INK.surface} stroke={INK.strong} vectorEffect="non-scaling-stroke" />
      <circle cx={c.x} cy={c.y} r="5.5" fill={INK.white} />

      {tools.map((t) => (
        <g key={t.name} opacity={t.live ? 1 : 0.55}>
          <rect x={t.x - 34} y={t.y - 12} width="68" height="24" rx="8" fill={INK.raised} stroke={t.live ? INK.mid : INK.line} vectorEffect="non-scaling-stroke" />
          <circle cx={t.x - 23} cy={t.y} r="2.4" fill={t.live ? INK.white : INK.mid} />
          <Label x={t.x - 16} y={t.y + 2.5} size={6.5} tone={t.live ? "hi" : "label"}>
            {t.name}
          </Label>
        </g>
      ))}
    </Figure>
  );
}

const ICONS: Record<string, string> = {
  inbox: "M4 13 L7 6 H17 L20 13 V18 Q20 19 19 19 H5 Q4 19 4 18 Z M4 13 H9 L10 15 H14 L15 13 H20",
  split: "M16 3 H21 V8 M8 3 H3 V8 M12 22 V13.7 Q12 12.5 11.2 11.7 L3 3 M15 9 L21 3",
  bolt: "M13 2 L4 14 H11 L10 22 L19 10 H12 Z",
  check: "M5 12.5 L10 17.5 L19 7.5",
};

/** Action: a request classified, then routed to a person or completed automatically. */
function ActionPlate() {
  const AW = 480;
  const AH = 320;
  const cy = 160;
  const N = {
    trigger: { x: 62, y: cy },
    classify: { x: 172, y: cy },
    approve: { x: 302, y: cy - 82 },
    auto: { x: 302, y: cy + 82 },
    done: { x: 420, y: cy },
  };
  const s = 30;
  const route = (via: { x: number; y: number }) =>
    `M${N.trigger.x + s} ${N.trigger.y} H${N.classify.x + s} C${N.classify.x + 70} ${N.classify.y}, ${via.x - 66} ${via.y}, ${via.x - s} ${via.y} H${via.x + s} C${via.x + 64} ${via.y}, ${N.done.x - 62} ${N.done.y}, ${N.done.x - s} ${N.done.y}`;
  const routeA = route(N.approve);
  const routeB = route(N.auto);

  const tile = (n: { x: number; y: number }, icon: string, tone: "plain" | "mid" | "strong") => (
    <g>
      <rect
        x={n.x - s}
        y={n.y - s}
        width={s * 2}
        height={s * 2}
        rx="16"
        fill={tone === "strong" ? INK.raised : INK.surface}
        stroke={tone === "strong" ? INK.strong : tone === "mid" ? INK.mid : INK.line}
      />
      <g transform={`translate(${n.x - 12} ${n.y - 12})`} stroke={tone === "plain" ? INK.soft : INK.white} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {icon === "person" ? (
          <>
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21 A8 8 0 0 1 20 21" />
          </>
        ) : (
          <path d={ICONS[icon]} />
        )}
      </g>
    </g>
  );

  return (
    <Figure viewBox={`0 0 ${AW} ${AH}`} labelScale={1.15} label="A request classified, then routed to a person for approval or completed automatically">
      <Backdrop w={AW} h={AH} />
      <Line d={routeA} />
      <Line d={routeB} />
      <Signal d={routeA} dur={5} tail={14} head={3.5} />
      <Signal d={routeB} dur={5} delay={2.5} tail={14} head={3.5} />

      <Label x={226} y={cy - 54} anchor="middle" size={6.5}>Needs judgement</Label>
      <Label x={226} y={cy + 62} anchor="middle" size={6.5}>Routine</Label>

      <Glow cx={N.approve.x} cy={N.approve.y} r={70} />
      <rect x={N.approve.x - s - 7} y={N.approve.y - s - 7} width={(s + 7) * 2} height={(s + 7) * 2} rx="21" stroke="#fff" strokeWidth="1">
        <animate attributeName="stroke-opacity" values="0;0.45;0" dur="2.6s" repeatCount="indefinite" />
      </rect>

      {tile(N.trigger, "inbox", "plain")}
      {tile(N.classify, "split", "mid")}
      {tile(N.approve, "person", "strong")}
      {tile(N.auto, "bolt", "plain")}
      {tile(N.done, "check", "strong")}

      <Label x={N.trigger.x} y={N.trigger.y + 50} anchor="middle" size={7}>Trigger</Label>
      <Label x={N.classify.x} y={N.classify.y + 50} anchor="middle" size={7}>Classify</Label>
      <Label x={N.approve.x} y={N.approve.y - 44} anchor="middle" size={7} tone="hi">Person approves</Label>
      <Label x={N.auto.x} y={N.auto.y + 48} anchor="middle" size={7}>Automatic</Label>
      <Label x={N.done.x} y={N.done.y + 50} anchor="middle" size={7} tone="hi">Done</Label>
    </Figure>
  );
}

/** Verification: evaluation scores across releases against an acceptance threshold, with one drop flagged. */
function VerifyPlate() {
  const plot = { x0: 56, x1: 336, y0: 44, y1: 188 };
  const yOf = (v: number) => r2(plot.y0 + ((1 - v) / 0.3) * (plot.y1 - plot.y0));
  const scores = [0.9, 0.92, 0.91, 0.94, 0.93, 0.95, 0.94, 0.81, 0.93, 0.95, 0.96, 0.96];
  const step = (plot.x1 - plot.x0 - 16) / (scores.length - 1);
  const pts = scores.map((v, i) => [r2(plot.x0 + 8 + i * step), yOf(v)] as [number, number]);
  const line = smooth(pts);
  const area = `${line} L${pts[pts.length - 1][0]} ${plot.y1} L${pts[0][0]} ${plot.y1} Z`;
  const threshold = yOf(0.85);
  const drift = pts[7];
  const { x0, x1, y0, y1 } = plot;

  return (
    <Figure viewBox={`0 0 ${W} ${H}`} label="Evaluation scores across releases staying above an acceptance threshold, with one drop flagged">
      <VerifyFill area={area} threshold={threshold} plot={plot} />
      <Backdrop w={W} h={H} />
      <Label x={x0} y={28}>Eval score</Label>

      {[1, 0.9, 0.8, 0.7].map((v) => (
        <g key={v}>
          <Line d={`M${x0} ${yOf(v)} H${x1}`} tone={v === 0.7 ? "line" : "grid"} />
          <Label x={x0 - 8} y={yOf(v) + 3} anchor="end" size={6.5}>
            {v.toFixed(2)}
          </Label>
        </g>
      ))}
      <Line d={`M${x0} ${threshold} H${x1}`} tone="soft" dash="3 3" />
      <Label x={x1} y={threshold - 6} anchor="end" size={6.5} tone="hi">
        Threshold 0.85
      </Label>

      <path d={line} stroke={INK.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) =>
        i === 7 ? null : <circle key={i} cx={x} cy={y} r="2.3" fill={INK.ground} stroke={INK.white} strokeWidth="1.2" vectorEffect="non-scaling-stroke" />
      )}

      <Line d={`M${drift[0]} ${y0 + 12} V${y1}`} tone="mid" dash="2 3" />
      <Ping cx={drift[0]} cy={drift[1]} r={4} to={14} />
      <circle cx={drift[0]} cy={drift[1]} r="4" fill={INK.white} />
      <rect x={drift[0] - 40} y={y0 + 2} width="80" height="17" rx="8.5" fill={INK.white} />
      <Label x={drift[0]} y={y0 + 13.5} anchor="middle" size={6.5} tone="dark">
        Drop · flagged
      </Label>

      {pts.map(([x], i) => (
        <path key={i} d={`M${x} ${y1} v4`} stroke={INK.line} vectorEffect="non-scaling-stroke" />
      ))}
      <Label x={x0} y={y1 + 18} size={6.5}>Release 1</Label>
      <Label x={x1} y={y1 + 18} anchor="end" size={6.5}>Release 12</Label>

      <g aria-hidden>
        <path d={`M0 ${y0} V${y1}`} stroke="#fff" strokeOpacity="0.28" vectorEffect="non-scaling-stroke">
          <animateTransform attributeName="transform" type="translate" values={`${x0} 0;${x1} 0`} dur="6s" repeatCount="indefinite" />
        </path>
      </g>
    </Figure>
  );
}

function VerifyFill({ area, threshold, plot }: { area: string; threshold: number; plot: { x0: number; x1: number; y0: number; y1: number } }) {
  const { id } = useFigure();
  return (
    <g aria-hidden>
      {/* the failing zone under the threshold is hatched; the score area fades down from the line */}
      <rect x={plot.x0} y={threshold} width={plot.x1 - plot.x0} height={plot.y1 - threshold} fill={`url(#${id}-hatch)`} />
      <path d={area} fill={`url(#${id}-fall)`} />
    </g>
  );
}

/** Monitoring: a live reading that keeps scrolling past, months after launch, with the alert line under it. */
function MonitorPlate() {
  return (
    <Figure viewBox={`0 0 ${W} ${H}`} label="A live accuracy reading scrolling past over months, above an alert line, with uptime underneath">
      <Backdrop w={W} h={H} />
      <MonitorTrace />
    </Figure>
  );
}

function MonitorTrace() {
  const { id } = useFigure();
  const plot = { x0: 36, x1: 324, y0: 52, y1: 168 };
  const pw = plot.x1 - plot.x0;
  const period = [0.86, 0.9, 0.87, 0.92, 0.89, 0.93, 0.88, 0.91, 0.94, 0.9, 0.92, 0.87];
  const n = period.length;
  const yOf = (v: number) => r2(plot.y1 - ((v - 0.74) / 0.24) * (plot.y1 - plot.y0));
  // Two periods plus the first point again, so the scroll loops without a seam.
  const pts = Array.from({ length: n * 2 + 1 }, (_, i) => [r2(plot.x0 + (i * pw) / n), yOf(period[i % n])] as [number, number]);
  const trace = smooth(pts);
  const alert = yOf(0.8);
  const months = ["Launch", "Month 2", "Month 4", "Month 6"];
  const bars = 48;

  return (
    <g>
      <defs>
        <clipPath id={`${id}-plot`}>
          <rect x={plot.x0} y={plot.y0 - 10} width={pw} height={plot.y1 - plot.y0 + 20} />
        </clipPath>
        <linearGradient id={`${id}-edge`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.12" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <mask id={`${id}-fade`}>
          <rect x={plot.x0} y={plot.y0 - 10} width={pw} height={plot.y1 - plot.y0 + 20} fill={`url(#${id}-edge)`} />
        </mask>
      </defs>

      <Label x={plot.x0} y={30}>Accuracy · live</Label>
      <Ping cx={plot.x1 - 30} cy={27} r={3} to={10} />
      <circle cx={plot.x1 - 30} cy={27} r="3" fill={INK.white} />
      <Label x={plot.x1} y={30} anchor="end" tone="hi">Live</Label>

      {[0, 0.5, 1].map((f) => (
        <Line key={f} d={`M${plot.x0} ${r2(plot.y1 - f * (plot.y1 - plot.y0))} H${plot.x1}`} tone={f === 0 ? "line" : "grid"} />
      ))}
      <rect x={plot.x0} y={alert} width={pw} height={plot.y1 - alert} fill={`url(#${id}-hatch)`} />
      <Line d={`M${plot.x0} ${alert} H${plot.x1}`} tone="soft" dash="3 3" />
      <Label x={plot.x0 + 6} y={alert + 12} size={6.5} tone="hi">Alert below</Label>

      <g clipPath={`url(#${id}-plot)`} mask={`url(#${id}-fade)`}>
        <g>
          <animateTransform attributeName="transform" type="translate" values={`0 0;${-pw} 0`} dur="14s" repeatCount="indefinite" />
          <path d={`${trace} L${pts[pts.length - 1][0]} ${plot.y1} L${plot.x0} ${plot.y1} Z`} fill={`url(#${id}-fall)`} />
          <path d={trace} stroke={INK.white} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <Line d={`M${plot.x1} ${plot.y0 - 6} V${plot.y1}`} tone="mid" dash="2 3" />

      {months.map((m, i) => (
        <Label key={m} x={r2(plot.x0 + (i / (months.length - 1)) * pw)} y={plot.y1 + 14} anchor={i === 0 ? "start" : i === months.length - 1 ? "end" : "middle"} size={6.5}>
          {m}
        </Label>
      ))}

      <Label x={plot.x0} y={204} size={6.5}>Uptime</Label>
      <g strokeLinecap="round" strokeWidth="2.6">
        {Array.from({ length: bars }, (_, i) => {
          const x = r2(plot.x0 + 44 + i * ((pw - 44) / (bars - 1)));
          return <path key={i} d={`M${x} 196 v10`} stroke="#fff" strokeOpacity={i === 31 ? 0.18 : 0.62} />;
        })}
      </g>
    </g>
  );
}
