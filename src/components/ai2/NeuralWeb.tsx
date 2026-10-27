"use client";

import type { MotionValue } from "framer-motion";
import { Camera, Geometry, Mesh, Program, Renderer, Transform, Vec3 } from "ogl";
import { NEON_GLSL } from "@/lib/palette";
import React, { useEffect, useRef } from "react";

/**
 * /ai-2's centrepiece, after the cosmic knowledge-graph study HubTech supplied:
 * a dense, neon graph of the six layers of a production AI system.
 *
 * Out of a drifting cloud it condenses into a sphere. Each layer is a sector of
 * swirling clusters around a bright hub, wired to a white-hot core through
 * radial shafts; a dense band rings the equator, and a belt of loose, unlinked
 * points drifts outside it over a field of stars. Packets of light run the
 * links. Scrolling (driven by the parent's MotionValues) lifts every sector off
 * the sphere onto its own plate: the core stretches into a spine and the
 * equator band splits into the plates' rims, so the one "model" becomes a stack
 * of six layers.
 *
 * Every node carries three positions (cloud, sphere, layer) and the shaders
 * blend between them, so the morph costs nothing on the CPU. Labels are HTML,
 * moved each frame to projected anchor points.
 */

export type NeuralWebProps = {
  className?: string;
  /** 0 = sphere, 1 = six separate layers */
  layer: MotionValue<number>;
  /** Index of the lit layer, fractional while moving between them */
  focus: MotionValue<number>;
  /** 0 = every layer lit, 1 = only the focused one */
  focusAmt: MotionValue<number>;
  /** The outer belt and the core's rings, 0..1; they draw back as the layers form */
  corona: MotionValue<number>;
  /** Extra speed and brightness for the packets, 0..1 */
  flow?: MotionValue<number>;
  /** Wrappers that ride on each sector's hub while it is a sphere */
  sectorAnchors?: React.RefObject<(HTMLElement | null)[]>;
  /** Wrappers that sit at the right-hand rim of each layer */
  layerAnchors?: React.RefObject<(HTMLElement | null)[]>;
  /** Wrapper centred on the core, for a CSS glow */
  coreAnchor?: React.RefObject<HTMLElement | null>;
  /** Wide screens put the stack right of centre to leave room for copy */
  wide?: boolean;
  paused?: boolean;
  /** Render one finished frame and never animate */
  still?: boolean;
};

const K = 6;
const LAYER_GAP = 0.5;
const DISC = 0.86;
const GOLDEN = Math.PI * (3 - Math.sqrt(5));
/** Shell radii of the open sectors' inner decks. */
const DECKS = [0.8, 0.88, 0.95, 1];

/** Node kinds, carried to the shaders in aInfo.z. */
const SECTOR = 0;
const SUB = 1;
const HUB = 2;
const SPINE = 3;
const CORE = 4;
const BAND = 5;
const STRAY = 6;

/* ── Deterministic data ─────────────────────────────────────────────────── */

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type V3 = [number, number, number];
const norm = (v: V3): V3 => {
  const l = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const scale = (v: V3, s: number): V3 => [v[0] * s, v[1] * s, v[2] * s];
const dist2 = (a: V3, b: V3) => (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
const layerY = (k: number) => (2.5 - k) * LAYER_GAP;

type Built = {
  nodeCount: number;
  A: Float32Array;
  B: Float32Array;
  C: Float32Array;
  info: Float32Array; // cluster, seed, kind, size
  edges: Uint32Array; // pairs
  edgeW: Float32Array; // brightness per edge
  hubs: number[];
  packetEdges: number[];
};

function buildGraph(density: number): Built {
  const rnd = mulberry32(20261027);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  const count = (n: number) => Math.max(4, Math.round(n * density));

  // Six sector centres: octahedron vertices, turned off-axis. Consecutive
  // sectors share a border, so links between them become links between
  // neighbouring layers once the sphere comes apart.
  const raw: V3[] = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
    [-1, 0, 0],
    [0, -1, 0],
    [0, 0, -1],
  ];
  const ca = 0.62;
  const cb = 0.48;
  const centers = raw.map(([x, y, z]) => {
    const x1 = x * Math.cos(ca) + z * Math.sin(ca);
    const z1 = -x * Math.sin(ca) + z * Math.cos(ca);
    return norm([x1, y * Math.cos(cb) - z1 * Math.sin(cb), y * Math.sin(cb) + z1 * Math.cos(cb)]);
  });
  // Each sector is a cube face seen from the centre; its frame runs along the
  // face's edges so the face can be flattened into a disc.
  const frames = centers.map((_, k) => ({ e1: centers[(k + 1) % 3], e2: centers[(k + 2) % 3] }));
  const sectorOf = (dir: V3) => {
    let best = 0;
    let bd = -2;
    for (let j = 0; j < K; j++) {
      const d = dot(dir, centers[j]);
      if (d > bd) {
        bd = d;
        best = j;
      }
    }
    return best;
  };
  // The equator is kept for the band, so sectors stop just short of it.
  const offBand = (dir: V3): V3 => (Math.abs(dir[1]) < 0.075 ? norm([dir[0], dir[1] < 0 ? -0.095 : 0.095, dir[2]]) : dir);

  type N = { a: V3; b: V3; c: V3; k: number; seed: number; kind: number; size: number };
  const nodes: N[] = [];
  const add = (n: N) => nodes.push(n) - 1;

  const toDisc = (dir: V3, k: number, r: number): V3 => {
    const c = centers[k];
    const { e1, e2 } = frames[k];
    // Gnomonic projection onto the face (a square), then square to disc.
    const dc = Math.max(0.2, Math.abs(dot(dir, c)));
    const u = Math.max(-1, Math.min(1, dot(dir, e1) / dc));
    const v = Math.max(-1, Math.min(1, dot(dir, e2) / dc));
    let x = u * Math.sqrt(1 - (v * v) / 2);
    let z = v * Math.sqrt(1 - (u * u) / 2);
    // Spread outward, so the clusters by the hub open out across the plate.
    const l = Math.hypot(x, z);
    if (l > 0) {
      x *= Math.pow(l, 0.62) / l;
      z *= Math.pow(l, 0.62) / l;
    }
    // Inner decks sit a little inside the rim and just under the plate.
    const s = DISC * (0.45 + 0.55 * r);
    return [x * s, layerY(k) + (r - 1) * 0.07 + (rnd() - 0.5) * 0.01, z * s];
  };
  // Each sector gathers out of its own part of the cloud, so condensing reads as gathering.
  const cloud = (k: number): V3 => {
    const c = k >= 0 ? centers[k] : norm([gauss(), gauss(), gauss()]);
    const r = 1.5 + rnd() * 0.9;
    return [c[0] * r * 1.35 + gauss() * 0.75, c[1] * r * 0.85 + gauss() * 0.5, c[2] * r + gauss() * 0.75 - 0.4];
  };

  const byK: number[][] = Array.from({ length: K }, () => []);
  const subs: { id: number; k: number; members: number[] }[] = [];
  const hubs: number[] = [];

  for (let k = 0; k < K; k++) {
    const c = centers[k];
    const { e1, e2 } = frames[k];
    // Odd sectors are open lattices: their points sit on stacked inner decks.
    const open = k % 2 === 1;
    const radius = (i: number) => (open ? DECKS[i % 4] : i % 6 === 0 ? 0.86 : 1 + (rnd() - 0.5) * 0.03);
    const point = (dir: V3, r: number, size: number) => {
      const id = add({ a: cloud(k), b: scale(dir, r), c: toDisc(dir, k, r), k, seed: rnd(), kind: SECTOR, size });
      byK[k].push(id);
      return id;
    };

    // Three swirling systems per sector, phyllotaxis around a bright centre.
    for (let s = 0; s < 3; s++) {
      const ang = (s / 3) * Math.PI * 2 + k * 0.4 + rnd() * 0.3;
      const off = Math.tan(0.19 + rnd() * 0.08);
      const sd = norm([
        c[0] + (e1[0] * Math.cos(ang) + e2[0] * Math.sin(ang)) * off,
        c[1] + (e1[1] * Math.cos(ang) + e2[1] * Math.sin(ang)) * off,
        c[2] + (e1[2] * Math.cos(ang) + e2[2] * Math.sin(ang)) * off,
      ]);
      const t1 = norm(cross(sd, e2));
      const t2 = cross(sd, t1);
      const subR = open ? 0.95 : 1.005;
      const id = add({ a: cloud(k), b: scale(sd, subR), c: toDisc(sd, k, subR), k, seed: rnd() * 0.3, kind: SUB, size: 9 });
      byK[k].push(id);
      const members: number[] = [];
      const n = count(170);
      const R = 0.15 + rnd() * 0.06;
      for (let j = 0; j < n; j++) {
        const rr = R * Math.sqrt((j + 0.6) / n) * (0.8 + rnd() * 0.4);
        const th = j * GOLDEN + rnd() * 0.25;
        const dir = offBand(
          norm([
            sd[0] + (t1[0] * Math.cos(th) + t2[0] * Math.sin(th)) * rr,
            sd[1] + (t1[1] * Math.cos(th) + t2[1] * Math.sin(th)) * rr,
            sd[2] + (t1[2] * Math.cos(th) + t2[2] * Math.sin(th)) * rr,
          ])
        );
        members.push(point(dir, radius(j), 3.2 + Math.pow(rnd(), 3) * 4 + (1 - j / n) * 2));
      }
      subs.push({ id, k, members });
    }

    // Loose points fill the rest of the sector's territory.
    const loose = count(240);
    for (let made = 0, i = 0; made < loose; i++) {
      const dir = offBand(norm([gauss(), gauss(), gauss()]));
      if (sectorOf(dir) !== k) continue;
      point(dir, radius(i), 2.8 + Math.pow(rnd(), 3) * 3.4);
      made++;
    }
    // A knot of light round the hub.
    const knot = count(30);
    for (let i = 0; i < knot; i++) {
      point(offBand(norm([c[0] + gauss() * 0.045, c[1] + gauss() * 0.045, c[2] + gauss() * 0.045])), open ? 0.97 : 1, 3.4 + rnd() * 2.4);
    }
    const hub = add({ a: cloud(k), b: scale(c, open ? 0.97 : 1.01), c: [0, layerY(k), 0], k, seed: rnd() * 0.2, kind: HUB, size: 16 });
    byK[k].push(hub);
    hubs.push(hub);
  }

  // The core, its containment shell and the shafts out to each hub. Once the
  // layers form they all gather on the spine through the middle of the stack.
  const spineAt = (y: number): V3 => [(rnd() - 0.5) * 0.03, y, (rnd() - 0.5) * 0.03];
  const layerAt = (y: number) => Math.max(0, Math.min(K - 1, Math.round(2.5 - y / LAYER_GAP)));
  const core = add({ a: [0, 0, -0.4], b: [0, 0, 0], c: [0, 0, 0], k: 2.5, seed: 0.05, kind: CORE, size: 64 });
  const shell: number[] = [];
  for (let i = 0, n = count(220); i < n; i++) {
    const d = norm([gauss(), gauss(), gauss()]);
    const y = (rnd() - 0.5) * 2 * layerY(0);
    shell.push(add({ a: cloud(-1), b: scale(d, 0.07 + rnd() * 0.12), c: spineAt(y), k: layerAt(y), seed: rnd(), kind: SPINE, size: 2.4 + rnd() * 1.6 }));
  }
  const shafts: number[][] = [];
  for (let k = 0; k < K; k++) {
    const h = nodes[hubs[k]].b;
    const ids: number[] = [];
    for (let j = 0, n = count(40); j < n; j++) {
      const t = 0.13 + (j / n) * 0.8;
      const b: V3 = [h[0] * t + (rnd() - 0.5) * 0.02, h[1] * t + (rnd() - 0.5) * 0.02, h[2] * t + (rnd() - 0.5) * 0.02];
      ids.push(add({ a: cloud(k), b, c: spineAt(layerY(k) * t), k, seed: rnd(), kind: SPINE, size: 3 + rnd() * 1.6 }));
    }
    shafts.push(ids);
  }

  // The equator band: two lips and a recessed floor. Every twelfth point keeps
  // to one lip or the floor and one layer, so the band splits cleanly into six rims.
  const bandN = Math.max(12, Math.round((760 * density) / 12) * 12);
  const band: number[] = [];
  for (let i = 0; i < bandN; i++) {
    const lon = (i / bandN) * Math.PI * 2 + (rnd() - 0.5) * 0.015;
    const lane = i % 4;
    const y = lane === 0 ? 0.055 : lane === 1 ? -0.055 : (rnd() - 0.5) * 0.06;
    const r = lane < 2 ? Math.sqrt(1 - y * y) * 0.998 : 0.9 + (rnd() - 0.5) * 0.02;
    const k = i % K;
    const rim = DISC * (lane < 2 ? 1.06 : 1.0);
    band.push(
      add({
        a: [Math.cos(lon) * 2.2 + gauss() * 0.6, gauss() * 0.5, Math.sin(lon) * 2.2 + gauss() * 0.6 - 0.4],
        b: [Math.cos(lon) * r, y, Math.sin(lon) * r],
        c: [Math.cos(lon) * rim, layerY(k) + (lane === 0 ? 0.012 : lane === 1 ? -0.012 : 0), Math.sin(lon) * rim],
        k,
        seed: rnd(),
        kind: BAND,
        size: 2.6 + rnd() * 2,
      })
    );
  }

  // A tilted belt of loose, unlinked points outside the sphere.
  const strays: number[] = [];
  for (let i = 0, n = count(520); i < n; i++) {
    const t = rnd() * Math.PI * 2;
    const R = 1.5 + Math.pow(rnd(), 0.8) * 1.1;
    const b: V3 = [Math.cos(t) * R, (rnd() - 0.5) * 0.5 + Math.sin(t * 2) * 0.2, Math.sin(t) * R];
    strays.push(add({ a: [b[0] * 1.3 + gauss() * 0.4, b[1] * 1.3 + gauss() * 0.4, b[2] * 1.3 + gauss() * 0.4], b, c: scale(b, 1.25), k: 2.5, seed: rnd(), kind: STRAY, size: 2.4 + rnd() * 2 }));
  }

  /* Links */
  const pairs: number[] = [];
  const weights: number[] = [];
  const seen = new Set<number>();
  const total = nodes.length;
  const link = (i: number, j: number, w: number) => {
    if (i === j) return;
    const key = i < j ? i * total + j : j * total + i;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push(i, j);
    weights.push(w);
  };

  for (let k = 0; k < K; k++) {
    const hub = hubs[k];
    const hb = nodes[hub].b;
    const pts = byK[k].filter((i) => nodes[i].kind === SECTOR);
    // Nearest neighbours: the fine mesh of the surface.
    for (const i of pts) {
      const bi = nodes[i].b;
      let n1 = -1;
      let n2 = -1;
      let n3 = -1;
      let d1 = 1e9;
      let d2 = 1e9;
      let d3 = 1e9;
      for (const j of pts) {
        if (j === i) continue;
        const d = dist2(bi, nodes[j].b);
        if (d < d1) {
          d3 = d2; n3 = n2; d2 = d1; n2 = n1; d1 = d; n1 = j;
        } else if (d < d2) {
          d3 = d2; n3 = n2; d2 = d; n2 = j;
        } else if (d < d3) {
          d3 = d; n3 = j;
        }
      }
      if (n1 >= 0 && d1 < 0.03) link(i, n1, 0.14);
      if (n2 >= 0 && d2 < 0.025) link(i, n2, 0.11);
      if (n3 >= 0 && d3 < 0.02 && rnd() < 0.5) link(i, n3, 0.08);
    }
    // Ordered by distance from the hub: the hub bursts out to the nearest, and
    // rings of similar distance chain together into the web's long threads.
    const byHub = [...pts].sort((a, b) => dist2(nodes[a].b, hb) - dist2(nodes[b].b, hb));
    byHub.forEach((i, idx) => {
      if (idx < 40) link(hub, i, idx < 16 ? 0.5 : 0.28);
      else if (idx % 14 === 0) link(hub, i, 0.2);
      const j = byHub[idx + 1];
      if (j !== undefined && dist2(nodes[i].b, nodes[j].b) < 0.1) link(i, j, 0.06);
      const l = byHub[idx + 3];
      if (idx % 2 === 0 && l !== undefined && dist2(nodes[i].b, nodes[l].b) < 0.08) link(i, l, 0.05);
    });
    link(hub, hubs[(k + 1) % K], 0.42);
    link(hub, hubs[(k + 2) % K], 0.3);
    link(core, hub, 0.75);
    const shaft = shafts[k];
    link(core, shaft[0], 0.38);
    for (let j = 0; j < shaft.length - 1; j++) link(shaft[j], shaft[j + 1], 0.38);
    link(shaft[shaft.length - 1], hub, 0.38);
  }
  for (const s of subs) {
    link(s.id, hubs[s.k], 0.42);
    s.members.forEach((i, j) => {
      if (j < 20) link(s.id, i, 0.22);
      else if (j % 9 === 0) link(s.id, i, 0.16);
    });
  }
  // Long links across the border of consecutive sectors.
  for (let k = 0; k < K - 1; k++) {
    const a = byK[k].filter((i) => nodes[i].kind === SECTOR && dot(norm(nodes[i].b), centers[k + 1]) > 0.42);
    const b = byK[k + 1].filter((i) => nodes[i].kind === SECTOR && dot(norm(nodes[i].b), centers[k]) > 0.42);
    for (let m = 0, n = count(14); m < n && a.length && b.length; m++) {
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)], 0.1);
    }
  }
  for (const i of shell) if (rnd() < 0.25) link(core, i, 0.12);
  for (let i = 0; i < bandN; i++) {
    link(band[i], band[(i + 12) % bandN], 0.2);
    if (i % 3 === 0) link(band[i], band[(i + 24) % bandN], 0.12);
  }
  for (let i = 0; i + 1 < strays.length; i += 2) if (rnd() < 0.45) link(strays[i], strays[i + 1], 0.07);

  const A = new Float32Array(total * 3);
  const B = new Float32Array(total * 3);
  const C = new Float32Array(total * 3);
  const info = new Float32Array(total * 4);
  nodes.forEach((nd, i) => {
    A.set(nd.a, i * 3);
    B.set(nd.b, i * 3);
    C.set(nd.c, i * 3);
    info.set([nd.k, nd.seed, nd.kind, nd.size], i * 4);
  });

  // Packets prefer the structural links so the flow reads.
  const packetEdges: number[] = [];
  for (let e = 0; e < weights.length; e++) {
    const w = weights[e];
    const m = w >= 0.7 ? 18 : w >= 0.4 ? 7 : w >= 0.28 ? 3 : w >= 0.16 ? 2 : w >= 0.1 ? 1 : 0;
    for (let r = 0; r < m; r++) packetEdges.push(e);
  }

  return { nodeCount: total, A, B, C, info, edges: new Uint32Array(pairs), edgeW: new Float32Array(weights), hubs, packetEdges };
}

/* ── Shaders ────────────────────────────────────────────────────────────── */

const COMMON = /* glsl */ `
uniform float uTime;
uniform float uForm;
uniform float uLayer;
uniform float uFocus;
uniform float uFocusAmt;
uniform float uDist;
uniform float uSurge;
uniform float uPointerOn;
uniform vec2 uPointer;
uniform float uAspect;
uniform float uOrbit;

float easeIO(float x) { return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0; }

vec3 morph(vec3 A, vec3 B, vec3 C, float seed) {
  float f = easeIO(clamp(uForm * 1.35 - seed * 0.35, 0.0, 1.0));
  float l = easeIO(clamp(uLayer * 1.3 - seed * 0.3, 0.0, 1.0));
  vec3 p = mix(A, B, f);
  // Spiral in while condensing.
  float sw = (1.0 - f) * (1.6 + seed * 1.8);
  float cs = cos(sw), sn = sin(sw);
  p = vec3(p.x * cs - p.z * sn, p.y, p.x * sn + p.z * cs);
  // Breathe gently on the sphere.
  p *= 1.0 + sin(uTime * 0.9 + seed * 37.0) * 0.006 * (1.0 - l);
  // Bulge outward mid-flight so the sectors peel off rather than slide.
  vec3 bulge = normalize(B + vec3(0.0001)) * sin(l * 3.14159) * 0.28;
  return mix(p, C, l) + bulge;
}

float focusWeight(float cluster) {
  float near = 1.0 - smoothstep(0.0, 0.85, abs(cluster - uFocus));
  return mix(1.0, mix(0.2, 1.0, near), uFocusAmt);
}

float depthOf(vec4 mv) {
  return clamp((mv.z + uDist + 1.1) / 2.2, 0.0, 1.0);
}

float hotOf(vec4 clip) {
  vec2 ndc = clip.xy / clip.w;
  vec2 d = (ndc - uPointer) * vec2(uAspect, 1.0);
  return smoothstep(0.34, 0.0, length(d)) * uPointerOn;
}

float waveOf(vec3 p) {
  if (uSurge > 3.0) return 0.0;
  float r = uSurge * 1.5;
  return exp(-pow((length(p) - r) * 5.0, 2.0)) * (1.0 - smoothstep(1.4, 3.0, uSurge));
}
${NEON_GLSL}
const vec3 CYAN = vec3(0.0, 0.82, 1.0);
const vec3 SKY = vec3(0.22, 0.74, 0.97);
const vec3 ICE = vec3(0.88, 0.95, 1.0);
const vec3 ROSE = vec3(0.96, 0.25, 0.37);
const vec3 AMBER = vec3(0.96, 0.62, 0.04);

// Sectors take their layer's tone, drifting a little toward their neighbours;
// the band is cyan until it becomes the plates' rims; the core and its shafts
// burn ice-white; the loose belt glows rose to amber.
vec3 nodeColor(float kind, float cluster, float seed) {
  if (kind > 5.5) return mix(ROSE, AMBER, seed);
  if (kind > 4.5) return mix(mix(CYAN, SKY, seed * 0.6), neon(cluster), uLayer);
  if (kind > 3.5) return ICE;
  if (kind > 2.5) return mix(CYAN, ICE, seed * 0.7);
  if (kind > 1.5) return neon(cluster);
  return neon(cluster + (seed - 0.5) * 0.3);
}

// The belt is lit while it orbits and fades back as the layers form.
float strayDim(float kind) {
  return kind > 5.5 ? mix(0.18, 0.9, uOrbit) : 1.0;
}
`;

const NODE_VERT = /* glsl */ `
precision highp float;
attribute vec3 aA;
attribute vec3 aB;
attribute vec3 aC;
attribute vec4 aInfo;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uDpr;
uniform float uScale;
${COMMON}
varying float vAlpha;
varying float vKind;
varying vec3 vCol;

void main() {
  vec3 p = morph(aA, aB, aC, aInfo.y);
  float kind = aInfo.z;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = depthOf(mv);
  float hot = hotOf(gl_Position);
  float wave = waveOf(p);
  float stray = step(5.5, kind);
  float fw = mix(focusWeight(aInfo.x), 1.0, stray);
  float twinkle = 0.82 + 0.18 * sin(uTime * (0.8 + aInfo.y * 2.2) + aInfo.y * 61.0);
  float base = mix(0.68, 1.0, depth) * fw * twinkle;
  vAlpha = (base * mix(0.6, 1.0, uForm) + hot * 0.8 * fw + wave * 0.9) * strayDim(kind);
  vKind = kind;
  // Dust condenses into colour; hubs burn whiter, and so does whatever the pointer or a surge touches.
  vec3 c = mix(vec3(0.75), nodeColor(kind, aInfo.x, aInfo.y), 0.4 + 0.6 * uForm);
  float white = (kind > 1.5 && kind < 2.5 ? 0.3 : kind > 0.5 && kind < 1.5 ? 0.15 : 0.0) + hot * 0.55 + wave * 0.6;
  vCol = mix(c, vec3(1.0), clamp(white, 0.0, 0.85));
  float s = aInfo.w * (1.0 + hot * 1.2 + wave * 1.3) * mix(0.75, 1.15, depth);
  // The core shrinks as it stretches into the spine.
  if (kind > 3.5 && kind < 4.5) s *= 1.0 - uLayer * 0.7;
  gl_PointSize = max(1.0, s * uDpr * uScale);
}
`;

const NODE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying float vKind;
varying vec3 vCol;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  // A white-hot centre in a soft halo of the node's colour.
  float halo = pow(1.0 - d * 2.0, 2.1);
  float hotc = smoothstep(0.22, 0.0, d);
  vec3 col = mix(vCol, vec3(1.0), hotc * 0.7);
  float a = halo;
  if (vKind > 3.5 && vKind < 4.5) {
    // The core: a white point in a cyan corona.
    float pin = smoothstep(0.14, 0.0, d);
    float corona = exp(-d * 9.0);
    col = mix(vec3(0.0, 0.82, 1.0), vec3(1.0), clamp(pin + corona * 0.35, 0.0, 1.0));
    a = clamp(pin + corona * 0.8, 0.0, 1.0);
  } else if (vKind > 1.5 && vKind < 2.5) {
    // Hubs carry a ring.
    a = max(halo, smoothstep(0.045, 0.0, abs(d - 0.4)) * 0.8);
    col = mix(vCol, vec3(1.0), hotc * 0.85);
  }
  gl_FragColor = vec4(col, a * clamp(vAlpha * 1.15, 0.0, 1.0));
}
`;

const EDGE_VERT = /* glsl */ `
precision highp float;
attribute vec3 aA;
attribute vec3 aB;
attribute vec3 aC;
attribute vec4 aInfo; // cluster, seed, kind, weight
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
${COMMON}
varying float vAlpha;
varying vec3 vCol;

void main() {
  vec3 p = morph(aA, aB, aC, aInfo.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float kind = aInfo.z;
  float w = aInfo.w;
  float depth = depthOf(mv);
  float hot = hotOf(gl_Position);
  float stray = step(5.5, kind);
  float strong = step(0.4, w);
  // Each end takes its node's colour; the trunk lines run whiter.
  vCol = mix(nodeColor(kind, aInfo.x, aInfo.y), vec3(0.85, 1.0, 0.96), clamp(strong * 0.38 + hot * 0.45, 0.0, 0.8));
  float fw = mix(focusWeight(aInfo.x), 1.0, stray);
  // The fine mesh thins once the plates form, so their structure reads.
  float faint = 1.0 - step(w, 0.13) * uLayer * 0.6;
  vAlpha = w * mix(0.35, 1.0, depth) * fw * uForm * uForm * (1.0 + strong * uLayer * 0.5) * faint * strayDim(kind)
         + (hot * 0.22 + waveOf(p) * 0.35) * (1.0 - stray);
}
`;

const EDGE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying vec3 vCol;
void main() { gl_FragColor = vec4(vCol, clamp(vAlpha, 0.0, 1.0)); }
`;

const PACKET_VERT = /* glsl */ `
precision highp float;
attribute vec3 aA0;
attribute vec3 aB0;
attribute vec3 aC0;
attribute vec3 aA1;
attribute vec3 aB1;
attribute vec3 aC1;
attribute vec4 aPk;   // phase, speed, trail, seed of start
attribute vec4 aMeta; // seed of end, cluster of end, size, kind of end
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uDpr;
uniform float uScale;
uniform float uPkTime;
uniform float uFlow;
${COMMON}
varying float vAlpha;
varying vec3 vCol;

void main() {
  float t = fract(uPkTime * aPk.y + aPk.x - aPk.z * 0.022);
  // A white-hot head trailing the colour of where it is going.
  vec3 c = nodeColor(aMeta.w, aMeta.y, aMeta.x);
  vCol = aPk.z < 0.5 ? mix(c, vec3(1.0), 0.6) : c;
  vec3 p0 = morph(aA0, aB0, aC0, aPk.w);
  vec3 p1 = morph(aA1, aB1, aC1, aMeta.x);
  vec3 p = mix(p0, p1, t);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = depthOf(mv);
  float trail = 1.0 - aPk.z * 0.34;
  vAlpha = trail * sin(t * 3.14159) * uForm * uForm * mix(0.3, 1.0, depth) * focusWeight(aMeta.y) * (0.8 + uFlow * 0.6);
  gl_PointSize = max(1.0, aMeta.z * (1.0 - aPk.z * 0.22) * uDpr * uScale * mix(0.75, 1.15, depth));
}
`;

const PACKET_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying vec3 vCol;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vCol, pow(1.0 - d * 2.0, 1.8) * clamp(vAlpha * 1.3, 0.0, 1.0));
}
`;

const PLATE_VERT = /* glsl */ `
precision highp float;
attribute vec3 aPos;
attribute vec2 aPlate; // layer, strength
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
${COMMON}
varying float vAlpha;
varying vec3 vCol;
void main() {
  vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
  gl_Position = projectionMatrix * mv;
  float show = smoothstep(0.55, 1.0, uLayer);
  float fw = focusWeight(aPlate.x);
  float lit = uFocusAmt * (1.0 - smoothstep(0.0, 0.6, abs(aPlate.x - uFocus)));
  vCol = mix(neon(aPlate.x), vec3(1.0), lit * 0.25);
  vAlpha = aPlate.y * show * mix(0.35, 1.0, depthOf(mv)) * fw * (1.0 + lit * 1.4);
}
`;

const PLATE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying vec3 vCol;
void main() { gl_FragColor = vec4(vCol, clamp(vAlpha * 1.2, 0.0, 1.0)); }
`;

/** Plain lines in one colour: the band's rims and the core's rings. */
const LINE_VERT = /* glsl */ `
precision highp float;
attribute vec3 aPos;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
void main() { gl_Position = projectionMatrix * modelViewMatrix * vec4(aPos, 1.0); }
`;

const LINE_FRAG = /* glsl */ `
precision highp float;
uniform vec3 uColor;
uniform float uAlpha;
void main() { gl_FragColor = vec4(uColor, uAlpha); }
`;

const STAR_VERT = /* glsl */ `
precision highp float;
attribute vec3 aPos;
attribute vec4 aStar; // colour, size
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uDpr;
uniform float uScale;
uniform float uDim;
varying vec3 vCol;
varying float vAlpha;
void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(aPos, 1.0);
  vCol = aStar.rgb;
  vAlpha = (0.7 + 0.3 * sin(uTime * (0.5 + fract(aPos.x * 7.13) * 1.6) + aPos.y * 3.0)) * uDim;
  gl_PointSize = max(1.0, aStar.w * uDpr * uScale);
}
`;

const STAR_FRAG = /* glsl */ `
precision highp float;
varying vec3 vCol;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(vCol, smoothstep(0.5, 0.05, d) * vAlpha);
}
`;

/* ── Component ──────────────────────────────────────────────────────────── */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/** Points round a circle as line-segment pairs. */
function ringSegments(out: number[], r: number, y: number, segs: number, dash = false) {
  for (let s = 0; s < segs; s++) {
    if (dash && s % 2) continue;
    const a0 = (s / segs) * Math.PI * 2;
    const a1 = ((s + 1) / segs) * Math.PI * 2;
    out.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r);
  }
}

export function NeuralWeb({
  className,
  layer,
  focus,
  focusAmt,
  corona,
  flow,
  sectorAnchors,
  layerAnchors,
  coreAnchor,
  wide = true,
  paused = false,
  still = false,
}: NeuralWebProps) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ paused, wide, still });
  const wake = useRef<() => void>(() => {});

  useEffect(() => {
    live.current = { paused, wide, still };
    wake.current();
  }, [paused, wide, still]);

  useEffect(() => {
    const el = host.current;
    if (!el) return;

    const small = window.innerWidth < 768;
    const density = small ? 0.5 : 1;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 1.75);
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr, alpha: false, antialias: true, depth: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    el.appendChild(canvas);

    const camera = new Camera(gl, { fov: 35, near: 0.1, far: 60 });
    const scene = new Transform();
    const sky = new Transform();
    sky.setParent(scene);
    const root = new Transform();
    root.setParent(scene);
    const tilt = new Transform();
    tilt.setParent(root);
    const spin = new Transform();
    spin.setParent(tilt);

    const web = buildGraph(density);
    const still0 = live.current.still;

    const shared = {
      uTime: { value: 0 },
      uForm: { value: still0 ? 1 : 0 },
      uLayer: { value: 0 },
      uFocus: { value: -10 },
      uFocusAmt: { value: 0 },
      uDist: { value: 6 },
      uSurge: { value: 9 },
      uPointerOn: { value: 0 },
      uPointer: { value: [0, 0] },
      uAspect: { value: 1 },
      uOrbit: { value: 1 },
      uDpr: { value: dpr },
      uScale: { value: 1 },
    };
    const additive = (p: Program) => {
      p.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      return p;
    };
    const flat = { transparent: true, depthTest: false, depthWrite: false, cullFace: false } as const;

    // Stars, far behind everything.
    const rnd = mulberry32(99);
    const starCount = Math.round(2400 * density);
    const starPos = new Float32Array(starCount * 3);
    const starInfo = new Float32Array(starCount * 4);
    const starTones = [
      [1, 1, 1],
      [0, 0.96, 0.67],
      [0, 0.82, 1],
      [0.62, 0.31, 0.87],
      [0.58, 0.64, 0.72],
    ];
    for (let i = 0; i < starCount; i++) {
      const z = -3 - Math.pow(rnd(), 0.7) * 14;
      const spread = 1.2 - z * 0.62;
      starPos.set([(rnd() - 0.5) * spread * 2.4, (rnd() - 0.5) * spread * 1.4, z], i * 3);
      const tone = starTones[i % starTones.length];
      const b = 0.25 + rnd() * 0.55;
      starInfo.set([tone[0] * b, tone[1] * b, tone[2] * b, 0.8 + Math.pow(rnd(), 2.5) * 2.2], i * 4);
    }
    const starUniforms = { uTime: shared.uTime, uDpr: shared.uDpr, uScale: shared.uScale, uDim: { value: 1 } };
    const starMesh = new Mesh(gl, {
      mode: gl.POINTS,
      frustumCulled: false,
      geometry: new Geometry(gl, { aPos: { size: 3, data: starPos }, aStar: { size: 4, data: starInfo } }),
      program: additive(new Program(gl, { vertex: STAR_VERT, fragment: STAR_FRAG, uniforms: starUniforms, ...flat })),
    });

    // Links
    const ec = web.edges.length;
    const eA = new Float32Array(ec * 3);
    const eB = new Float32Array(ec * 3);
    const eC = new Float32Array(ec * 3);
    const eInfo = new Float32Array(ec * 4);
    for (let v = 0; v < ec; v++) {
      const i = web.edges[v];
      eA.set(web.A.subarray(i * 3, i * 3 + 3), v * 3);
      eB.set(web.B.subarray(i * 3, i * 3 + 3), v * 3);
      eC.set(web.C.subarray(i * 3, i * 3 + 3), v * 3);
      eInfo.set([web.info[i * 4], web.info[i * 4 + 1], web.info[i * 4 + 2], web.edgeW[v >> 1]], v * 4);
    }
    const edgeMesh = new Mesh(gl, {
      mode: gl.LINES,
      frustumCulled: false,
      geometry: new Geometry(gl, {
        aA: { size: 3, data: eA },
        aB: { size: 3, data: eB },
        aC: { size: 3, data: eC },
        aInfo: { size: 4, data: eInfo },
      }),
      program: additive(new Program(gl, { vertex: EDGE_VERT, fragment: EDGE_FRAG, uniforms: shared, ...flat })),
    });

    // Nodes
    const nodeMesh = new Mesh(gl, {
      mode: gl.POINTS,
      frustumCulled: false,
      geometry: new Geometry(gl, {
        aA: { size: 3, data: web.A },
        aB: { size: 3, data: web.B },
        aC: { size: 3, data: web.C },
        aInfo: { size: 4, data: web.info },
      }),
      program: additive(new Program(gl, { vertex: NODE_VERT, fragment: NODE_FRAG, uniforms: shared, ...flat })),
    });

    // Packets: three points each, a head and a short tail.
    const pc = Math.round(1500 * density);
    const TR = 3;
    const pv = pc * TR;
    const pA0 = new Float32Array(pv * 3);
    const pB0 = new Float32Array(pv * 3);
    const pC0 = new Float32Array(pv * 3);
    const pA1 = new Float32Array(pv * 3);
    const pB1 = new Float32Array(pv * 3);
    const pC1 = new Float32Array(pv * 3);
    const pPk = new Float32Array(pv * 4);
    const pMeta = new Float32Array(pv * 4);
    const rank = (n: number) => {
      const kind = web.info[n * 4 + 2];
      return kind === CORE ? 3 : kind === HUB ? 2 : kind === SUB || kind === SPINE ? 1 : 0;
    };
    for (let p = 0; p < pc; p++) {
      const e = web.packetEdges[Math.floor(rnd() * web.packetEdges.length)];
      let i = web.edges[e * 2];
      let j = web.edges[e * 2 + 1];
      // Outward from the core and the hubs, mostly.
      if (rank(i) < rank(j) ? rnd() < 0.75 : rnd() < 0.25) [i, j] = [j, i];
      const strong = web.edgeW[e] >= 0.4;
      const len = Math.hypot(web.B[i * 3] - web.B[j * 3], web.B[i * 3 + 1] - web.B[j * 3 + 1], web.B[i * 3 + 2] - web.B[j * 3 + 2]);
      const speed = Math.min(1.4, (strong ? 0.5 : 0.24) / Math.max(0.08, len)) * (0.6 + rnd() * 0.8);
      const phase = rnd();
      for (let t = 0; t < TR; t++) {
        const v = p * TR + t;
        pA0.set(web.A.subarray(i * 3, i * 3 + 3), v * 3);
        pB0.set(web.B.subarray(i * 3, i * 3 + 3), v * 3);
        pC0.set(web.C.subarray(i * 3, i * 3 + 3), v * 3);
        pA1.set(web.A.subarray(j * 3, j * 3 + 3), v * 3);
        pB1.set(web.B.subarray(j * 3, j * 3 + 3), v * 3);
        pC1.set(web.C.subarray(j * 3, j * 3 + 3), v * 3);
        pPk.set([phase, speed, t, web.info[i * 4 + 1]], v * 4);
        pMeta.set([web.info[j * 4 + 1], web.info[j * 4], strong ? 4.4 : 3.2, web.info[j * 4 + 2]], v * 4);
      }
    }
    const packetUniforms = { ...shared, uPkTime: { value: 0 }, uFlow: { value: 0 } };
    const packetMesh = new Mesh(gl, {
      mode: gl.POINTS,
      frustumCulled: false,
      geometry: new Geometry(gl, {
        aA0: { size: 3, data: pA0 },
        aB0: { size: 3, data: pB0 },
        aC0: { size: 3, data: pC0 },
        aA1: { size: 3, data: pA1 },
        aB1: { size: 3, data: pB1 },
        aC1: { size: 3, data: pC1 },
        aPk: { size: 4, data: pPk },
        aMeta: { size: 4, data: pMeta },
      }),
      program: additive(new Program(gl, { vertex: PACKET_VERT, fragment: PACKET_FRAG, uniforms: packetUniforms, ...flat })),
    });

    // The band's lips and floor, drawn as fine rings while it is a sphere.
    const rimVerts: number[] = [];
    for (const [r, y] of [
      [Math.sqrt(1 - 0.055 ** 2), 0.055],
      [Math.sqrt(1 - 0.055 ** 2), -0.055],
      [0.9, 0],
    ]) {
      ringSegments(rimVerts, r, y, 160);
    }
    const rimUniforms = { uColor: { value: [0, 0.82, 1] }, uAlpha: { value: 0 } };
    const rimMesh = new Mesh(gl, {
      mode: gl.LINES,
      frustumCulled: false,
      geometry: new Geometry(gl, { aPos: { size: 3, data: new Float32Array(rimVerts) } }),
      program: additive(new Program(gl, { vertex: LINE_VERT, fragment: LINE_FRAG, uniforms: rimUniforms, ...flat })),
    });

    // Gimbal rings turning round the core.
    const gimbals = [0.13, 0.165, 0.2].map((r, i) => {
      const verts: number[] = [];
      ringSegments(verts, r, 0, 72);
      const uniforms = { uColor: { value: i % 2 ? [0, 0.82, 1] : [0, 0.96, 0.67] }, uAlpha: { value: 0 } };
      const t = new Transform();
      t.setParent(tilt);
      const mesh = new Mesh(gl, {
        mode: gl.LINES,
        frustumCulled: false,
        geometry: new Geometry(gl, { aPos: { size: 3, data: new Float32Array(verts) } }),
        program: additive(new Program(gl, { vertex: LINE_VERT, fragment: LINE_FRAG, uniforms, ...flat })),
      });
      mesh.setParent(t);
      t.rotation.set(i * 1.1, i * 0.7, 0);
      return { t, uniforms, speed: (i % 2 ? -1 : 1) * (0.35 + i * 0.12) };
    });

    // Plates
    const plateVerts: number[] = [];
    const plateInfo: number[] = [];
    for (let k = 0; k < K; k++) {
      const y = layerY(k);
      const ring = (r: number, alpha: number, dash: boolean) => {
        const before = plateVerts.length;
        ringSegments(plateVerts, r, y, 120, dash);
        for (let v = before; v < plateVerts.length; v += 3) plateInfo.push(k, alpha);
      };
      ring(DISC * 1.06, 0.42, false);
      ring(DISC * 0.52, 0.16, true);
      for (let t = 0; t < 48; t++) {
        const a = (t / 48) * Math.PI * 2;
        const r0 = DISC * 1.06;
        const r1 = DISC * (t % 4 === 0 ? 1.14 : 1.1);
        plateVerts.push(Math.cos(a) * r0, y, Math.sin(a) * r0, Math.cos(a) * r1, y, Math.sin(a) * r1);
        plateInfo.push(k, 0.3, k, 0.3);
      }
    }
    const plateMesh = new Mesh(gl, {
      mode: gl.LINES,
      frustumCulled: false,
      geometry: new Geometry(gl, {
        aPos: { size: 3, data: new Float32Array(plateVerts) },
        aPlate: { size: 2, data: new Float32Array(plateInfo) },
      }),
      program: additive(new Program(gl, { vertex: PLATE_VERT, fragment: PLATE_FRAG, uniforms: shared, ...flat })),
    });

    starMesh.setParent(sky);
    rimMesh.setParent(spin);
    plateMesh.setParent(spin);
    edgeMesh.setParent(spin);
    nodeMesh.setParent(spin);
    packetMesh.setParent(spin);

    /* Layout */
    let w = 1;
    let h = 1;
    let distB = 6;
    let distC = 6;
    /** 0 at 1024px wide, 1 from 1440px: how much room the stack and its labels have beside the copy. */
    const roomy = () => Math.min(1, Math.max(0, (w - 1024) / 416));
    const resize = () => {
      w = el.clientWidth || 1;
      h = el.clientHeight || 1;
      renderer.setSize(w, h);
      const aspect = w / h;
      camera.perspective({ aspect });
      const tanH = Math.tan((35 * Math.PI) / 360);
      // Sphere fills ~68% of the height on wide screens, ~72% of the width on tall ones.
      distB = Math.max(2 / (0.68 * 2 * tanH), 2 / (0.72 * 2 * tanH * aspect));
      // The stack is ~2.7 units tall and ~2.2 wide; on narrower desktops it stands a little smaller so its labels fit.
      distC = Math.max(3.05 / ((live.current.wide ? 0.72 + 0.04 * roomy() : 0.76) * 2 * tanH), 2.1 / ((live.current.wide ? 0.42 : 0.84) * 2 * tanH * aspect));
      shared.uAspect.value = aspect;
      shared.uScale.value = Math.min(1.25, Math.max(0.6, h / 900));
      draw(performance.now());
    };

    /* Pointer */
    const ptr = { x: 0, y: 0, on: 0, target: 0, sx: 0, sy: 0 };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) {
        ptr.target = 0;
        return;
      }
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -(((e.clientY - r.top) / r.height) * 2 - 1);
      ptr.target = e.pointerType === "mouse" ? 1 : 0;
    };
    const onLeave = () => (ptr.target = 0);
    let surgeAt = -10;
    const onDown = (e: PointerEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest("a,button,input,textarea,select,label")) return;
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top || e.clientY > r.bottom) return;
      surgeAt = clock;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    el.parentElement?.addEventListener("pointerdown", onDown);

    /* Loop */
    let raf = 0;
    let visible = true;
    let last = performance.now();
    let clock = 0;
    let pkTime = 0;
    let spinA = 0.6;
    let started = -1;
    let introSurged = false;
    let tiltX = 0.3;
    let yaw = 0;
    const tmp = new Vec3();

    const project = (x: number, y: number, z: number, m: Transform) => {
      tmp.set(x, y, z).applyMatrix4(m.worldMatrix);
      const zf = tmp[2];
      camera.project(tmp);
      return { x: (tmp[0] * 0.5 + 0.5) * w, y: (0.5 - tmp[1] * 0.5) * h, z: zf };
    };

    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const isStill = live.current.still;
      if (!isStill) clock += dt;
      if (started < 0) started = clock;
      const since = clock - started;

      const L = easeIO(clamp01(layer.get()));
      const form = isStill ? 1 : easeOut(clamp01((since - 0.15) / 2.6));
      const orbit = clamp01(corona.get());
      const fl = flow?.get() ?? 0;
      if (!isStill && !introSurged && since > 2.5) {
        introSurged = true;
        surgeAt = clock;
      }

      ptr.on += (ptr.target * (1 - L * 0.5) - ptr.on) * Math.min(1, dt * 4);
      ptr.sx += (ptr.x - ptr.sx) * Math.min(1, dt * 3);
      ptr.sy += (ptr.y - ptr.sy) * Math.min(1, dt * 3);

      spinA += dt * (0.065 + L * 0.05 + fl * 0.05);
      const tiltTarget = 0.22 + L * 0.07 - ptr.sy * 0.16 * (1 - L * 0.5);
      tiltX += (tiltTarget - tiltX) * Math.min(1, dt * 3);
      yaw += (ptr.sx * 0.3 * (1 - L * 0.6) - yaw) * Math.min(1, dt * 3);
      tilt.rotation.x = tiltX;
      tilt.rotation.y = yaw;
      spin.rotation.y = spinA;
      // The stars drift slowly and lean a little with the pointer, for depth.
      sky.rotation.y = Math.sin(clock * 0.03) * 0.06 + yaw * 0.12;
      sky.rotation.x = -tiltX * 0.08;
      gimbals.forEach((g, i) => {
        g.t.rotation.y = clock * g.speed;
        g.t.rotation.z = i * 0.7 + clock * g.speed * 0.4;
        g.uniforms.uAlpha.value = 0.5 * form * (1 - L);
      });
      rimUniforms.uAlpha.value = 0.13 * form * (1 - L);

      const wideNow = live.current.wide;
      const aspectNow = w / h;
      root.position.x = (wideNow ? 0.55 + 0.13 * roomy() : 0) * L;
      root.position.y = wideNow ? 0.1 - 0.08 * L : aspectNow < 0.8 ? 0.95 - 0.75 * L : 0.28 - 0.1 * L;
      const dist = distB + (distC - distB) * L;
      camera.position.set(0, 0, dist);

      pkTime += dt * (1 + fl * 1.4);
      shared.uTime.value = clock;
      shared.uForm.value = form;
      shared.uLayer.value = clamp01(layer.get());
      shared.uFocus.value = focus.get();
      shared.uFocusAmt.value = clamp01(focusAmt.get());
      shared.uDist.value = dist;
      shared.uSurge.value = clock - surgeAt;
      shared.uPointerOn.value = ptr.on;
      shared.uPointer.value = [ptr.sx, ptr.sy];
      shared.uOrbit.value = Math.min(orbit, 1 - L * 0.8);
      starUniforms.uDim.value = 1 - L * 0.45;
      packetUniforms.uPkTime.value = pkTime;
      packetUniforms.uFlow.value = fl;

      renderer.render({ scene, camera, sort: false });

      // Anchors for the HTML layer.
      const core = coreAnchor?.current;
      if (core) {
        const c = project(0, 0, 0, tilt);
        core.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;
        core.style.opacity = (form * (1 - L)).toFixed(3);
      }
      const chips = sectorAnchors?.current;
      if (chips) {
        const b = web.B;
        for (let k = 0; k < K; k++) {
          const a = chips[k];
          if (!a) continue;
          const i = web.hubs[k];
          const hp = project(b[i * 3], b[i * 3 + 1], b[i * 3 + 2], spin);
          a.style.transform = `translate3d(${hp.x.toFixed(1)}px, ${hp.y.toFixed(1)}px, 0)`;
          // Dimmer on the far side, only while it is a sphere, and clear of the copy along the bottom.
          const near = 0.35 + 0.65 * clamp01((hp.z + 0.15) / 0.45);
          const clear = clamp01((h * 0.66 - hp.y) / (h * 0.08));
          a.style.opacity = (near * clear * clamp01((form - 0.85) / 0.15) * (1 - clamp01(L * 4))).toFixed(3);
        }
      }
      const anchors = layerAnchors?.current;
      if (anchors) {
        for (let k = 0; k < K; k++) {
          const a = anchors[k];
          if (!a) continue;
          const lp = project(DISC * 1.16, layerY(k), 0, tilt);
          a.style.transform = `translate3d(${lp.x.toFixed(1)}px, ${lp.y.toFixed(1)}px, 0)`;
        }
      }
    };

    const loop = (now: number) => {
      draw(now);
      raf = requestAnimationFrame(loop);
    };
    const run = () => {
      const s = live.current;
      const should = visible && !s.paused && !s.still && !document.hidden;
      if (should && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      } else if (!should && raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      if (!should) requestAnimationFrame((t) => draw(t));
    };
    wake.current = () => {
      resize();
      run();
    };

    const io = new IntersectionObserver((entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      run();
    });
    io.observe(el);
    const ro = new ResizeObserver(() => resize());
    ro.observe(el);
    const onVis = () => run();
    document.addEventListener("visibilitychange", onVis);
    // Still renders follow the scroll-driven values too.
    const unsubs = [layer, focus, focusAmt, corona].map((mv) =>
      mv.on("change", () => {
        if (!raf) requestAnimationFrame((t) => draw(t));
      })
    );

    resize();
    run();

    return () => {
      cancelAnimationFrame(raf);
      raf = 0;
      io.disconnect();
      ro.disconnect();
      unsubs.forEach((u) => u());
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      el.parentElement?.removeEventListener("pointerdown", onDown);
      wake.current = () => {};
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      canvas.remove();
    };
  }, [layer, focus, focusAmt, corona, flow, sectorAnchors, layerAnchors, coreAnchor]);

  return <div ref={host} aria-hidden className={className} />;
}
