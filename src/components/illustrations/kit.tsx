"use client";

import { useReducedMotion } from "@/lib/useReducedMotion";
import React, { createContext, useContext, useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Shared drawing kit for the site's illustrations: one monochrome ink scale,
 * hairline strokes, a dot field, soft glows and signals that travel along paths.
 * Every illustration is drawn in its own viewBox and fills its container.
 */

export const INK = {
  grid: "oklch(1 0 0 / 0.05)",
  faint: "oklch(1 0 0 / 0.1)",
  line: "oklch(1 0 0 / 0.17)",
  mid: "oklch(1 0 0 / 0.36)",
  soft: "oklch(1 0 0 / 0.58)",
  strong: "oklch(1 0 0 / 0.86)",
  white: "oklch(0.985 0 0)",
  label: "oklch(0.6 0 0)",
  labelHi: "oklch(0.82 0 0)",
  surface: "oklch(0.14 0 0)",
  raised: "oklch(0.18 0 0)",
  ground: "oklch(0.1 0 0)",
  /** The accent: whatever is live, moving or done. Green, or white on the black-and-white pages (--ink-signal). */
  signal: "var(--ink-signal, oklch(0.82 0.17 152))",
  /** Opacity of a signal's trail and its glow; fainter white on the black-and-white pages. */
  signalTail: "var(--ink-signal-tail, 0.35)",
  signalHalo: "var(--ink-signal-halo, 0.18)",
} as const;

export const MONO: React.CSSProperties = { fontFamily: "var(--font-geist-mono), ui-monospace, monospace" };
export const DISPLAY: React.CSSProperties = {
  fontFamily: "var(--font-mona), var(--font-geist-sans), sans-serif",
  fontStretch: "110%",
};

/** Round to two decimals so server and client render identical coordinates. */
export const r2 = (n: number) => Math.round(n * 100) / 100;

/** A point on an ellipse, angle in degrees, clockwise from three o'clock. */
export function onEllipse(cx: number, cy: number, rx: number, ry: number, deg: number): [number, number] {
  const a = (deg * Math.PI) / 180;
  return [r2(cx + rx * Math.cos(a)), r2(cy + ry * Math.sin(a))];
}

/** A smooth curve through points (Catmull-Rom converted to cubic Béziers). */
export function smooth(points: [number, number][]) {
  let d = `M${points[0][0]} ${points[0][1]}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1 = [r2(p1[0] + (p2[0] - p0[0]) / 6), r2(p1[1] + (p2[1] - p0[1]) / 6)];
    const c2 = [r2(p2[0] - (p3[0] - p1[0]) / 6), r2(p2[1] - (p3[1] - p1[1]) / 6)];
    d += ` C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${p2[0]} ${p2[1]}`;
  }
  return d;
}

const FigureContext = createContext({ id: "fig", labelScale: 1 });
export const useFigure = () => useContext(FigureContext);

/**
 * Root of every illustration. Its SVG animations pause while it is offscreen;
 * with reduced motion they hold a composed still frame instead of running.
 */
export function Figure({
  viewBox,
  label,
  className,
  labelScale = 1,
  children,
}: {
  viewBox: string;
  label: string;
  className?: string;
  /** Wider figures shrink more on phones, so their captions are set a little larger. */
  labelScale?: number;
  children: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const id = `fig${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (reduce) {
      svg.setCurrentTime(1.6);
      svg.pauseAnimations();
      return;
    }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) svg.unpauseAnimations();
      else svg.pauseAnimations();
    });
    io.observe(svg);
    return () => io.disconnect();
  }, [reduce]);

  return (
    <svg ref={ref} viewBox={viewBox} className={cn("block h-full w-full", className)} role="img" aria-label={label} fill="none">
      <defs>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff" stopOpacity="0.3" />
          <stop offset="0.4" stopColor="#fff" stopOpacity="0.07" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-fall`} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.14" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <pattern id={`${id}-hatch`} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0 V6" stroke="#fff" strokeOpacity="0.07" strokeWidth="1" />
        </pattern>
      </defs>
      <FigureContext.Provider value={{ id, labelScale }}>{children}</FigureContext.Provider>
    </svg>
  );
}

/** A faint dot field that fades out towards the edges, plus registration marks in the corners. */
export function Backdrop({ w, h, step = 16, corners = true }: { w: number; h: number; step?: number; corners?: boolean }) {
  const { id } = useFigure();
  const m = 14;
  const s = 5;
  return (
    <g aria-hidden>
      <defs>
        <pattern id={`${id}-dots`} width={step} height={step} patternUnits="userSpaceOnUse">
          <circle cx={step / 2} cy={step / 2} r="0.75" fill="#fff" fillOpacity="0.11" />
        </pattern>
        <radialGradient id={`${id}-vignette`} cx="50%" cy="50%" r="62%">
          <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
        <mask id={`${id}-vmask`}>
          <rect width={w} height={h} fill={`url(#${id}-vignette)`} />
        </mask>
      </defs>
      <rect width={w} height={h} fill={`url(#${id}-dots)`} mask={`url(#${id}-vmask)`} />
      {corners && (
        <g stroke={INK.mid} strokeWidth="1" vectorEffect="non-scaling-stroke">
          <path d={`M${m} ${m + s} V${m} H${m + s}`} />
          <path d={`M${w - m - s} ${m} H${w - m} V${m + s}`} />
          <path d={`M${m} ${h - m - s} V${h - m} H${m + s}`} />
          <path d={`M${w - m - s} ${h - m} H${w - m} V${h - m - s}`} />
        </g>
      )}
    </g>
  );
}

/** A soft white light pool. */
export function Glow({ cx, cy, r, opacity = 1 }: { cx: number; cy: number; r: number; opacity?: number }) {
  const { id } = useFigure();
  return <circle cx={cx} cy={cy} r={r} fill={`url(#${id}-glow)`} opacity={opacity} aria-hidden />;
}

/** Small monospace caption. */
export function Label({
  x,
  y,
  children,
  anchor = "start",
  size = 8,
  tone = "label",
}: {
  x: number;
  y: number;
  children: React.ReactNode;
  anchor?: "start" | "middle" | "end";
  size?: number;
  tone?: "label" | "hi" | "white" | "dark";
}) {
  const { labelScale } = useFigure();
  const fill = tone === "hi" ? INK.labelHi : tone === "white" ? INK.white : tone === "dark" ? INK.ground : INK.label;
  return (
    <text x={x} y={y} textAnchor={anchor} fontSize={r2(size * labelScale)} letterSpacing="0.08em" fill={fill} style={MONO}>
      {children}
    </text>
  );
}

/** A hairline path. */
export function Line({
  d,
  tone = "line",
  width = 1,
  dash,
}: {
  d: string;
  tone?: keyof typeof INK;
  width?: number;
  dash?: string;
}) {
  return (
    <path
      d={d}
      stroke={INK[tone]}
      strokeWidth={width}
      strokeDasharray={dash}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect={width <= 1 ? "non-scaling-stroke" : undefined}
    />
  );
}

/**
 * A light that travels along a path: a faint tail with a bright head and a
 * soft halo. Uses pathLength so any path works without measuring it.
 */
export function Signal({
  d,
  dur = 3,
  delay = 0,
  tail = 22,
  head = 5,
  width = 1.6,
}: {
  d: string;
  dur?: number;
  delay?: number;
  tail?: number;
  head?: number;
  width?: number;
}) {
  const anim = (
    <animate
      attributeName="stroke-dashoffset"
      values={`${tail};-100`}
      dur={`${dur}s`}
      begin={`${-delay}s`}
      repeatCount="indefinite"
    />
  );
  const common = { d, pathLength: 100, strokeLinecap: "round" as const, fill: "none" };
  return (
    <g aria-hidden>
      <path {...common} style={{ stroke: INK.signal, strokeOpacity: INK.signalTail }} strokeWidth={width} strokeDasharray={`${tail} 300`}>
        {anim}
      </path>
      <path {...common} style={{ stroke: INK.signal, strokeOpacity: INK.signalHalo }} strokeWidth={width * 3.2} strokeDasharray={`0 ${tail - head} ${head} 300`}>
        {anim}
      </path>
      <path {...common} style={{ stroke: INK.signal }} strokeWidth={width} strokeDasharray={`0 ${tail - head} ${head} 300`}>
        {anim}
      </path>
    </g>
  );
}

/** A ring that breathes outward from a point, for live or waiting states. */
export function Ping({ cx, cy, r = 6, to = 16, dur = 2.4, delay = 0 }: { cx: number; cy: number; r?: number; to?: number; dur?: number; delay?: number }) {
  return (
    <circle cx={cx} cy={cy} r={r} style={{ stroke: INK.signal }} strokeWidth="1" vectorEffect="non-scaling-stroke" aria-hidden>
      <animate attributeName="r" values={`${r};${to}`} dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" />
      <animate attributeName="stroke-opacity" values="0.6;0" dur={`${dur}s`} begin={`${-delay}s`} repeatCount="indefinite" />
    </circle>
  );
}

/** A small round node: hairline ring, filled core. */
export function Node({ cx, cy, r = 10, core = 3, tone = "mid", bright = false }: { cx: number; cy: number; r?: number; core?: number; tone?: keyof typeof INK; bright?: boolean }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={INK.raised} stroke={bright ? INK.strong : INK[tone]} strokeWidth="1" vectorEffect="non-scaling-stroke" />
      <circle cx={cx} cy={cy} r={core} fill={bright ? INK.white : INK.soft} />
    </g>
  );
}

/** Rounded text placeholder bars, thinner than real type so they read as content, not as words. */
export function TextBars({
  x,
  y,
  widths,
  gap = 9,
  weight = 2.4,
  tone = 0.4,
}: {
  x: number;
  y: number;
  widths: number[];
  gap?: number;
  weight?: number;
  tone?: number;
}) {
  return (
    <g stroke="#fff" strokeOpacity={tone} strokeWidth={weight} strokeLinecap="round" aria-hidden>
      {widths.map((w, i) => (
        <path key={i} d={`M${x} ${r2(y + i * gap)} h${w}`} />
      ))}
    </g>
  );
}
