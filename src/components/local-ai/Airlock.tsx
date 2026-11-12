"use client";

import { type MotionValue } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/* ── The drawing ───────────────────────────────────────────────────────── */

export type Pt = { x: number; y: number };
export type Geo = {
  w: number;
  h: number;
  wide: boolean;
  office: { x: number; y: number; w: number; h: number };
  employee: Pt;
  core: Pt;
  vault: Pt;
  gate: Pt;
  wallA: Pt;
  wallB: Pt;
  models: Pt[];
  outside: Pt;
};

/** One layout for the canvas and the labels. Wide: left to right. Narrow: top to bottom. */
function layout(w: number, h: number, wide: boolean, fill = false): Geo {
  if (wide) {
    const x0 = w * (fill ? 0.06 : 0.075);
    const x1 = w * (fill ? 0.9 : 0.925);
    const y0 = fill ? 48 : 64;
    const y1 = fill ? h - 56 : Math.max(y0 + 240, h * 0.6);
    const sw = x1 - x0;
    const sh = y1 - y0;
    const my = (y0 + y1) / 2;
    const wx = x0 + sw * 0.665;
    return {
      w,
      h,
      wide,
      office: { x: x0, y: y0, w: sw * 0.6, h: sh },
      employee: { x: x0 + sw * 0.06, y: my },
      core: { x: x0 + sw * 0.29, y: my },
      vault: { x: x0 + sw * 0.5, y: y1 - sh * 0.18 },
      gate: { x: wx, y: my },
      wallA: { x: wx, y: y0 - 14 },
      wallB: { x: wx, y: y1 + 14 },
      models: [-1, 0, 1].map((k) => ({ x: x0 + sw * 0.885, y: my + k * sh * 0.32 })),
      outside: { x: wx + 28, y: y0 },
    };
  }
  const x0 = 24;
  const x1 = w - 24;
  const y0 = fill ? 36 : 44;
  const y1 = fill ? h - 64 : h * 0.54;
  const sw = x1 - x0;
  const sh = y1 - y0;
  const wy = y0 + sh * 0.72;
  return {
    w,
    h,
    wide,
    office: { x: x0, y: y0, w: sw, h: sh * 0.62 },
    employee: { x: x0 + sw * 0.13, y: y0 + sh * 0.12 },
    core: { x: x0 + sw * 0.46, y: y0 + sh * 0.3 },
    vault: { x: x0 + sw * 0.84, y: y0 + sh * 0.48 },
    gate: { x: x0 + sw * 0.46, y: wy },
    wallA: { x: x0 - 10, y: wy },
    wallB: { x: x1 + 10, y: wy },
    models: [0.14, 0.5, 0.86].map((f) => ({ x: x0 + sw * f, y: y0 + sh * 0.93 })),
    outside: { x: x0, y: wy + 12 },
  };
}

const GREEN = "74,222,128";
const WHITE = "255,255,255";
const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const ramp = (v: number, a: number, b: number) => clamp01((v - a) / (b - a));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);

function rng(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Packet kinds: what travels, and how it looks. */
const K = { Ambient: 0, Query: 1, Answer: 2, Secret: 3, Tag: 4, Back: 5, Restore: 6 } as const;
type Kind = (typeof K)[keyof typeof K];

type Packet = { kind: Kind; route: string[]; cut: number[]; born: number; dur: number; off: number; seg: number; src: number };

/** How far each wire bows, so packets ride the wires drawn under them. */
const BEND: Record<string, number> = {
  "e-c": 0.16,
  "c-g": -0.14,
  "g-v": 0.24,
  "v-c": -0.22,
  "g-m0": 0.1,
  "g-m1": 0,
  "g-m2": -0.1,
};
const bendOf = (a: string, b: string) => {
  if (a.startsWith("p") || b.startsWith("p")) return 0.08;
  if (BEND[`${a}-${b}`] !== undefined) return BEND[`${a}-${b}`];
  if (BEND[`${b}-${a}`] !== undefined) return -BEND[`${b}-${a}`];
  return 0;
};

/**
 * The office, the airlock and the frontier models on one canvas. `progress`
 * runs the story from 0 to 1 (see STEP_AT); labels come from `children`,
 * placed on the layout the canvas draws.
 */
export function Airlock({
  progress,
  wide,
  fill,
  still,
  onStats,
  className,
  children,
}: {
  progress: MotionValue<number>;
  wide: boolean;
  /** Use the whole box for the drawing, with no room kept for words under it. */
  fill?: boolean;
  still?: boolean;
  /** Called when the count of secrets kept or tags sent changes. */
  onStats?: (kept: number, sent: number) => void;
  className?: string;
  children?: (geo: Geo) => React.ReactNode;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const [geo, setGeo] = useState<Geo | null>(null);
  const stats = useRef(onStats);
  useEffect(() => {
    stats.current = onStats;
  }, [onStats]);

  useEffect(() => {
    const el = wrap.current;
    const cv = canvas.current;
    const ctx = cv?.getContext("2d");
    if (!el || !cv || !ctx) return;

    const N = wide ? 760 : 340;
    const rand = rng(11);
    const hx = new Float32Array(N);
    const hy = new Float32Array(N);
    const ph = new Float32Array(N);
    const sp = new Float32Array(N);
    const rank = new Float32Array(N);
    const tone = new Float32Array(N);
    const sec = new Uint8Array(N);
    const px = new Float32Array(N);
    const py = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      // Denser around the model, thinning out to the walls.
      if (rand() < 0.45) {
        const a = rand() * Math.PI * 2;
        const r = Math.sqrt(-2 * Math.log(rand() + 1e-6)) * 0.16;
        hx[i] = clamp01(0.48 + Math.cos(a) * r * 0.9);
        hy[i] = clamp01(0.5 + Math.sin(a) * r * 1.1);
      } else {
        hx[i] = 0.03 + rand() * 0.94;
        hy[i] = 0.05 + rand() * 0.9;
      }
      ph[i] = rand() * Math.PI * 2;
      sp[i] = 0.25 + rand() * 0.6;
      rank[i] = rand();
      tone[i] = 0.16 + rand() * 0.34;
      sec[i] = rand() < 0.09 ? 1 : 0;
    }

    let g = layout(1, 1, wide, fill);
    let dpr = 1;
    const resize = () => {
      const r = el.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      cv.style.width = `${r.width}px`;
      cv.style.height = `${r.height}px`;
      g = layout(r.width, r.height, wide, fill);
      setGeo(g);
    };

    const pointer = { x: -1e4, y: -1e4 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    };
    const onLeave = () => {
      pointer.x = pointer.y = -1e4;
    };

    const pointOf = (key: string): Pt => {
      switch (key) {
        case "e":
          return g.employee;
        case "c":
          return g.core;
        case "g":
          return g.gate;
        case "v":
          return g.vault;
        case "m0":
          return g.models[0];
        case "m1":
          return g.models[1];
        case "m2":
          return g.models[2];
        default: {
          const i = Number(key.slice(1));
          return { x: px[i], y: py[i] };
        }
      }
    };

    /** A point along a bowed wire from a to b. */
    const along = (a: Pt, b: Pt, bend: number, u: number, off: number): Pt => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const nx = -dy / len;
      const ny = dx / len;
      const cx = (a.x + b.x) / 2 + nx * bend * len;
      const cy = (a.y + b.y) / 2 + ny * bend * len;
      const v = 1 - u;
      const s = Math.sin(u * Math.PI) * off;
      return { x: v * v * a.x + 2 * v * u * cx + u * u * b.x + nx * s, y: v * v * a.y + 2 * v * u * cy + u * u * b.y + ny * s };
    };

    const posOf = (pk: Packet, u: number): { p: Pt; seg: number } => {
      const n = pk.route.length - 1;
      let s = 0;
      while (s < n - 1 && u >= pk.cut[s + 1]) s++;
      const lo = pk.cut[s];
      const hi = pk.cut[s + 1];
      const local = easeIO(clamp01((u - lo) / (hi - lo)));
      const a = pk.route[s];
      const b = pk.route[s + 1];
      return { p: along(pointOf(a), pointOf(b), bendOf(a, b), local, pk.off), seg: s };
    };

    const packets: Packet[] = [];
    const acc = { amb: 0, q: 0, a: 0, out: 0, back: 0, rest: 0 };
    let t = 0;
    let corePulse = 0;
    const modelPulse = [0, 0, 0];
    const flashes: { x: number; y: number; t0: number; c: string }[] = [];
    let keptN = 0;
    let inVault = 0;
    let sentN = 0;
    let restored = 0;
    let shownKept = -1;
    let shownSent = -1;

    const spawn = (kind: Kind, route: string[], cut: number[], dur: number) => {
      packets.push({ kind, route, cut, born: t, dur, off: (rand() - 0.5) * 10, seg: 0, src: -1 });
    };

    const update = (dt: number, v: number) => {
      t += dt;
      const open = 1 - ramp(v, 0.1, 0.14);
      const fin = ramp(v, 0.86, 0.9);
      const wA = ramp(v, 0.14, 0.18) * (1 - ramp(v, 0.37, 0.41));
      const wAns = ramp(v, 0.22, 0.27) * (1 - ramp(v, 0.37, 0.41));
      const wB = ramp(v, 0.4, 0.44) * (1 - ramp(v, 0.61, 0.65)) + 0.45 * fin;
      const wC = ramp(v, 0.64, 0.68) * (1 - ramp(v, 0.84, 0.88)) + 0.45 * fin;
      const scale = wide ? 1 : 0.6;

      acc.amb += dt * 9 * scale;
      while (acc.amb >= 1) {
        acc.amb -= 1;
        const i = Math.floor(rand() * N);
        const inward = rand() < 0.6;
        packets.push({
          kind: K.Ambient,
          route: inward ? [`p${i}`, "c"] : ["c", `p${i}`],
          cut: [0, 1],
          born: t,
          dur: 1.4 + rand() * 1.2,
          off: (rand() - 0.5) * 6,
          seg: 0,
          src: i,
        });
      }
      acc.q += dt * 4.5 * scale * (wA + 0.25 * open + 0.3 * fin);
      while (acc.q >= 1) {
        acc.q -= 1;
        spawn(K.Query, ["e", "c"], [0, 1], 1.5 + rand() * 0.4);
      }
      acc.a += dt * 4.5 * scale * (wAns + 0.2 * open + 0.3 * fin);
      while (acc.a >= 1) {
        acc.a -= 1;
        spawn(K.Answer, ["c", "e"], [0, 1], 1.5 + rand() * 0.4);
      }
      acc.out += dt * 8 * scale * wB;
      while (acc.out >= 1) {
        acc.out -= 1;
        if (rand() < 0.42) spawn(K.Secret, ["c", "g", "v"], [0, 0.55, 1], 2.6 + rand() * 0.5);
        else spawn(K.Tag, ["c", "g", `m${Math.floor(rand() * 3)}`], [0, 0.5, 1], 2.6 + rand() * 0.5);
      }
      acc.back += dt * 7 * scale * wC;
      while (acc.back >= 1) {
        acc.back -= 1;
        spawn(K.Back, [`m${Math.floor(rand() * 3)}`, "g", "c"], [0, 0.5, 1], 2.4 + rand() * 0.5);
      }
      acc.rest += dt * 3 * scale * wC;
      while (acc.rest >= 1) {
        acc.rest -= 1;
        if (inVault - restored > 0) {
          restored++;
          spawn(K.Restore, ["v", "c"], [0, 1], 1.6 + rand() * 0.3);
        }
      }

      for (let i = packets.length - 1; i >= 0; i--) {
        const pk = packets[i];
        const u = (t - pk.born) / pk.dur;
        if (u >= 1) {
          const last = pk.route[pk.route.length - 1];
          if (pk.kind === K.Secret) inVault++;
          if (last === "c" && pk.kind !== K.Ambient) corePulse = 1;
          if (last.startsWith("m")) modelPulse[Number(last[1])] = 1;
          packets.splice(i, 1);
          continue;
        }
        const seg = posOf(pk, u).seg;
        if (seg !== pk.seg) {
          pk.seg = seg;
          if (pk.route[seg] === "g") {
            if (pk.kind === K.Secret) {
              keptN++;
              flashes.push({ ...g.gate, t0: t, c: WHITE });
            }
            if (pk.kind === K.Tag) {
              sentN++;
              flashes.push({ ...g.gate, t0: t, c: GREEN });
            }
          }
        }
      }
      corePulse *= Math.exp(-dt * 3);
      for (let k = 0; k < 3; k++) modelPulse[k] *= Math.exp(-dt * 2.4);
      while (flashes.length && t - flashes[0].t0 > 0.7) flashes.shift();

      if (keptN !== shownKept || sentN !== shownSent) {
        shownKept = keptN;
        shownSent = sentN;
        stats.current?.(keptN, sentN);
      }
    };

    const wire = (a: Pt, b: Pt, bend: number, alpha: number, color = WHITE) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const cx = (a.x + b.x) / 2 + (-dy / len) * bend * len;
      const cy = (a.y + b.y) / 2 + (dx / len) * bend * len;
      ctx.strokeStyle = `rgba(${color},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      ctx.stroke();
    };

    const draw = (v: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, g.w, g.h);
      const lit = ramp(v, 0.18, 0.34);
      const pull = ramp(v, 0.16, 0.24) * (1 - ramp(v, 0.33, 0.4));
      const scrub = ramp(v, 0.4, 0.46);
      const modelsOn = 0.25 + 0.3 * ramp(v, 0.42, 0.5) + 0.45 * ramp(v, 0.64, 0.7);
      const o = g.office;

      // The office: a soft glow round the model and a dashed wall.
      const glowR = Math.max(o.w, o.h) * 0.62;
      const grd = ctx.createRadialGradient(g.core.x, g.core.y, 0, g.core.x, g.core.y, glowR);
      grd.addColorStop(0, `rgba(${GREEN},${0.07 + 0.1 * lit + 0.05 * corePulse})`);
      grd.addColorStop(1, `rgba(${GREEN},0)`);
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, g.w, g.h);
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 6]);
      ctx.strokeStyle = `rgba(${WHITE},0.18)`;
      ctx.beginPath();
      ctx.roundRect(o.x, o.y, o.w, o.h, 22);
      ctx.stroke();
      ctx.setLineDash([]);

      // Wires
      ctx.lineWidth = 1;
      wire(g.employee, g.core, bendOf("e", "c"), 0.12);
      wire(g.core, g.gate, bendOf("c", "g"), 0.08 + 0.1 * scrub);
      wire(g.gate, g.vault, bendOf("g", "v"), 0.06 + 0.1 * scrub);
      wire(g.vault, g.core, bendOf("v", "c"), 0.05 + 0.06 * scrub);
      for (let k = 0; k < 3; k++) wire(g.gate, g.models[k], bendOf("g", `m${k}`), 0.05 + 0.12 * (modelsOn - 0.25), GREEN);

      // The data field
      const t2 = t;
      for (let i = 0; i < N; i++) {
        let x = o.x + hx[i] * o.w + Math.sin(t2 * sp[i] + ph[i]) * 4;
        let y = o.y + hy[i] * o.h + Math.cos(t2 * sp[i] * 0.8 + ph[i] * 1.3) * 4;
        if (pull > 0) {
          const k = pull * (0.12 + 0.2 * rank[i]);
          x += (g.core.x - x) * k;
          y += (g.core.y - y) * k;
        }
        const dx = x - pointer.x;
        const dy = y - pointer.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < 8100) {
          const d = Math.sqrt(d2) || 1;
          const f = ((90 - d) / 90) * 16;
          x += (dx / d) * f;
          y += (dy / d) * f;
        }
        px[i] = x;
        py[i] = y;
        if (sec[i]) {
          const a = 0.45 + 0.4 * scrub * (0.5 + 0.5 * Math.sin(t2 * 3 + ph[i]));
          ctx.fillStyle = `rgba(${WHITE},${a})`;
          ctx.fillRect(x - 1.4, y - 1.4, 2.8, 2.8);
        } else if (rank[i] < lit * 0.88) {
          ctx.fillStyle = `rgba(${GREEN},${0.35 + tone[i]})`;
          ctx.fillRect(x - 0.9, y - 0.9, 1.8, 1.8);
        } else {
          ctx.fillStyle = `rgba(${WHITE},${tone[i]})`;
          ctx.fillRect(x - 0.8, y - 0.8, 1.6, 1.6);
        }
      }

      // Packets, each with a short trail along its wire
      for (const pk of packets) {
        const u = (t - pk.born) / pk.dur;
        const head = posOf(pk, u).p;
        const tail = posOf(pk, Math.max(0, u - (pk.kind === K.Ambient ? 0.08 : 0.06))).p;
        const green = pk.kind === K.Answer || pk.kind === K.Tag || pk.kind === K.Back;
        const c = green ? GREEN : WHITE;
        if (pk.kind === K.Ambient) {
          ctx.strokeStyle = `rgba(${WHITE},0.16)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(tail.x, tail.y);
          ctx.lineTo(head.x, head.y);
          ctx.stroke();
          continue;
        }
        const tg = ctx.createLinearGradient(tail.x, tail.y, head.x, head.y);
        tg.addColorStop(0, `rgba(${c},0)`);
        tg.addColorStop(1, `rgba(${c},0.75)`);
        ctx.strokeStyle = tg;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(head.x, head.y);
        ctx.stroke();
        ctx.fillStyle = `rgba(${c},0.18)`;
        ctx.beginPath();
        ctx.arc(head.x, head.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = `rgba(${c},1)`;
        if (pk.kind === K.Secret || pk.kind === K.Restore) ctx.fillRect(head.x - 2.6, head.y - 2.6, 5.2, 5.2);
        else {
          ctx.beginPath();
          ctx.arc(head.x, head.y, 2.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // The firewall: a lit bar with the airlock in it
      const wa = g.wallA;
      const wb = g.wallB;
      const glint = (t * 0.35) % 1;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = `rgba(${GREEN},${0.32 + 0.25 * scrub})`;
      ctx.beginPath();
      ctx.moveTo(wa.x, wa.y);
      ctx.lineTo(wb.x, wb.y);
      ctx.stroke();
      const gx = wa.x + (wb.x - wa.x) * glint;
      const gy = wa.y + (wb.y - wa.y) * glint;
      const vertical = Math.abs(wb.y - wa.y) > Math.abs(wb.x - wa.x);
      const gl = vertical ? ctx.createLinearGradient(gx, gy - 40, gx, gy + 40) : ctx.createLinearGradient(gx - 40, gy, gx + 40, gy);
      gl.addColorStop(0, `rgba(${GREEN},0)`);
      gl.addColorStop(0.5, `rgba(${GREEN},0.95)`);
      gl.addColorStop(1, `rgba(${GREEN},0)`);
      ctx.strokeStyle = gl;
      ctx.lineWidth = 2;
      ctx.beginPath();
      if (vertical) {
        ctx.moveTo(gx, gy - 40);
        ctx.lineTo(gx, gy + 40);
      } else {
        ctx.moveTo(gx - 40, gy);
        ctx.lineTo(gx + 40, gy);
      }
      ctx.stroke();
      // the airlock brackets
      const gtx = g.gate.x;
      const gty = g.gate.y;
      ctx.fillStyle = "#000";
      if (vertical) ctx.fillRect(gtx - 4, gty - 16, 8, 32);
      else ctx.fillRect(gtx - 16, gty - 4, 32, 8);
      ctx.strokeStyle = `rgba(${WHITE},${0.55 + 0.4 * scrub})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      if (vertical) {
        ctx.moveTo(gtx - 9, gty - 16);
        ctx.lineTo(gtx + 9, gty - 16);
        ctx.moveTo(gtx - 9, gty + 16);
        ctx.lineTo(gtx + 9, gty + 16);
      } else {
        ctx.moveTo(gtx - 16, gty - 9);
        ctx.lineTo(gtx - 16, gty + 9);
        ctx.moveTo(gtx + 16, gty - 9);
        ctx.lineTo(gtx + 16, gty + 9);
      }
      ctx.stroke();
      for (const f of flashes) {
        const k = (t - f.t0) / 0.7;
        ctx.strokeStyle = `rgba(${f.c},${0.7 * (1 - k)})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(f.x, f.y, 6 + k * 26, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Employee
      ctx.fillStyle = `rgba(${WHITE},0.95)`;
      ctx.beginPath();
      ctx.arc(g.employee.x, g.employee.y, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${WHITE},0.35)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(g.employee.x, g.employee.y, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Local model
      const cg = ctx.createRadialGradient(g.core.x, g.core.y, 0, g.core.x, g.core.y, 70);
      cg.addColorStop(0, `rgba(${GREEN},${0.32 + 0.3 * corePulse})`);
      cg.addColorStop(0.4, `rgba(${GREEN},${0.08 + 0.08 * corePulse})`);
      cg.addColorStop(1, `rgba(${GREEN},0)`);
      ctx.fillStyle = cg;
      ctx.fillRect(g.core.x - 70, g.core.y - 70, 140, 140);
      ctx.strokeStyle = `rgba(${GREEN},0.85)`;
      ctx.lineWidth = 1.25;
      ctx.setLineDash([3, 5]);
      ctx.lineDashOffset = -t * 14;
      ctx.beginPath();
      ctx.arc(g.core.x, g.core.y, 20 + 3 * corePulse, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(g.core.x, g.core.y, 5, 0, Math.PI * 2);
      ctx.fill();

      // Vault, filling with the secrets it keeps
      const level = Math.max(0, Math.min(12, inVault - restored));
      const vw = 52;
      const vh = 30;
      ctx.fillStyle = "#000";
      ctx.fillRect(g.vault.x - vw / 2, g.vault.y - vh / 2, vw, vh);
      ctx.strokeStyle = `rgba(${WHITE},${0.35 + 0.35 * scrub})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(g.vault.x - vw / 2, g.vault.y - vh / 2, vw, vh, 6);
      ctx.stroke();
      for (let k = 0; k < 12; k++) {
        const cx = g.vault.x - vw / 2 + 7 + (k % 6) * 7.6;
        const cy = g.vault.y - 6 + Math.floor(k / 6) * 8;
        ctx.fillStyle = k < level ? `rgba(${WHITE},0.95)` : `rgba(${WHITE},0.12)`;
        ctx.fillRect(cx - 2, cy - 2, 4, 4);
      }

      // Frontier models, beyond the wall
      for (let k = 0; k < 3; k++) {
        const m = g.models[k];
        const on = modelsOn + 0.4 * modelPulse[k];
        const mg = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, 36);
        mg.addColorStop(0, `rgba(${GREEN},${0.2 * on})`);
        mg.addColorStop(1, `rgba(${GREEN},0)`);
        ctx.fillStyle = mg;
        ctx.fillRect(m.x - 36, m.y - 36, 72, 72);
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(m.x, m.y, 11, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = `rgba(${WHITE},${0.2 + 0.6 * on})`;
        ctx.lineWidth = 1.25;
        ctx.stroke();
        ctx.fillStyle = `rgba(${GREEN},${Math.min(1, on)})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    if (still) {
      // Run the flow for a few seconds out of sight, then draw that one frame.
      const settle = () => {
        for (let i = 0; i < 200; i++) update(1 / 30, progress.get());
        draw(progress.get());
      };
      settle();
      const ro2 = new ResizeObserver(() => draw(progress.get()));
      ro2.observe(el);
      const off = progress.on("change", settle);
      return () => {
        ro.disconnect();
        ro2.disconnect();
        off();
      };
    }

    let raf = 0;
    let last = performance.now();
    let visible = true;
    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const v = progress.get();
      update(dt, v);
      draw(v);
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVis);
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    start();
    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [wide, fill, still, progress]);

  return (
    <div ref={wrap} className={cn("pointer-events-none", className)}>
      <canvas ref={canvas} aria-hidden className="absolute inset-0" />
      {geo && children?.(geo)}
    </div>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn("font-mono text-[0.625rem] uppercase tracking-[0.2em] text-fg-subtle", className)}>{children}</span>;
}

export function Label({
  at,
  on,
  anchor = "t",
  children,
}: {
  at: Pt;
  on: boolean;
  anchor?: "t" | "tl" | "l" | "b" | "r";
  children: React.ReactNode;
}) {
  return (
    <div className="absolute" style={{ left: at.x, top: at.y }}>
      <div
        className={cn(
          "whitespace-nowrap text-[0.8125rem] font-medium leading-none text-fg transition-opacity duration-700",
          anchor === "t" && "-translate-x-1/2 text-center",
          anchor === "b" && "-translate-x-1/2 -translate-y-full text-center",
          anchor === "r" && "-translate-x-full text-right",
          on ? "opacity-100" : "opacity-30"
        )}
      >
        {children}
      </div>
    </div>
  );
}
