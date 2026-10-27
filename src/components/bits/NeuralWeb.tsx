"use client";

import type { MotionValue } from "framer-motion";
import { Camera, Geometry, Mesh, Program, Renderer, Transform, Vec3 } from "ogl";
import React, { useEffect, useRef } from "react";

/**
 * The AI page's centrepiece, after the knowledge-graph and optical-fibre
 * studies HubTech supplied, redrawn in black and white.
 *
 * A web of nodes condenses out of scattered dust into a sphere: six sectors,
 * one per production layer, linked to a bright core, with packets running
 * along the links. A ring of fibres fans out around it, each strand firing on
 * its own clock. Scrolling (driven by the parent's MotionValues) retracts the
 * fibres and lifts each sector off the sphere onto its own plane, so the
 * single "model" becomes a stack of six layers with a spine running through.
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
  /** Scroll-side multiplier for the fibre ring, 0..1 */
  corona: MotionValue<number>;
  /** Extra speed and brightness for the packets, 0..1 */
  flow?: MotionValue<number>;
  /** Wrapper that follows the model sector's hub around the sphere */
  hubAnchor?: React.RefObject<HTMLElement | null>;
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
const MODEL = 1;
const LAYER_GAP = 0.5;
const DISC = 0.86;

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
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const layerY = (k: number) => (2.5 - k) * LAYER_GAP;

type Built = {
  nodeCount: number;
  A: Float32Array;
  B: Float32Array;
  C: Float32Array;
  info: Float32Array; // cluster, seed, kind, size
  edges: Uint32Array; // pairs
  edgeKind: Float32Array; // alpha per edge
  hubs: number[];
  packetEdges: number[];
};

function buildWeb(density: number): Built {
  const rnd = mulberry32(20261022);
  const gauss = () => {
    let u = 0;
    let v = 0;
    while (u === 0) u = rnd();
    while (v === 0) v = rnd();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };

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
    const y2 = y * Math.cos(cb) - z1 * Math.sin(cb);
    const z2 = y * Math.sin(cb) + z1 * Math.cos(cb);
    return norm([x1, y2, z2]);
  });
  // Each sector is a cube face seen from the centre; its frame runs along
  // the face's edges so the face can be flattened into a disc.
  const frames = centers.map((_, k) => ({ e1: centers[(k + 1) % 3], e2: centers[(k + 2) % 3] }));

  // Knots inside each sector, for the clustered look of a real graph.
  const knots: V3[][] = centers.map((c, k) => {
    const out: V3[] = [];
    for (let j = 0; j < 4; j++) {
      const a = (j / 4) * Math.PI * 2 + rnd() * 0.8;
      const th = 0.32 + rnd() * 0.3;
      const { e1, e2 } = frames[k];
      out.push(
        norm([
          c[0] * Math.cos(th) + (e1[0] * Math.cos(a) + e2[0] * Math.sin(a)) * Math.sin(th),
          c[1] * Math.cos(th) + (e1[1] * Math.cos(a) + e2[1] * Math.sin(a)) * Math.sin(th),
          c[2] * Math.cos(th) + (e1[2] * Math.cos(a) + e2[2] * Math.sin(a)) * Math.sin(th),
        ])
      );
    }
    return out;
  });

  const perSector = Math.round(440 * density);
  type N = { a: V3; b: V3; c: V3; k: number; seed: number; kind: number; size: number };
  const nodes: N[] = [];
  const byK: number[][] = Array.from({ length: K }, () => []);

  const toDisc = (dir: V3, k: number, inner: number | null): V3 => {
    const c = centers[k];
    const { e1, e2 } = frames[k];
    // Gnomonic projection onto the face (a square), then square to disc.
    const dc = Math.max(0.2, Math.abs(dot(dir, c)));
    const u = Math.max(-1, Math.min(1, dot(dir, e1) / dc));
    const v = Math.max(-1, Math.min(1, dot(dir, e2) / dc));
    let x = u * Math.sqrt(1 - (v * v) / 2);
    let z = v * Math.sqrt(1 - (u * u) / 2);
    if (inner !== null) {
      const f = (inner / 0.7) * 0.55;
      x *= f;
      z *= f;
    }
    return [x * DISC, layerY(k) + (rnd() - 0.5) * 0.012, z * DISC];
  };
  const cloud = (): V3 => {
    const d = norm([gauss(), gauss() * 0.7, gauss()]);
    const r = 2.6 + rnd() * 3.2;
    return [d[0] * r * 1.4, d[1] * r, d[2] * r - 0.5];
  };

  for (let k = 0; k < K; k++) {
    let made = 0;
    while (made < perSector) {
      let dir: V3;
      const roll = rnd();
      if (roll < 0.34) {
        const kn = knots[k][Math.floor(rnd() * 4)];
        dir = norm([kn[0] + gauss() * 0.07, kn[1] + gauss() * 0.07, kn[2] + gauss() * 0.07]);
      } else {
        dir = norm([gauss(), gauss(), gauss()]);
        // Keep only directions that fall in this sector.
        let best = 0;
        let bd = -2;
        for (let j = 0; j < K; j++) {
          const d = dot(dir, centers[j]);
          if (d > bd) {
            bd = d;
            best = j;
          }
        }
        if (best !== k) continue;
        dir = norm(lerp3(dir, centers[k], rnd() * 0.22));
      }
      const inner = rnd() < 0.07 ? 0.25 + rnd() * 0.45 : null;
      const r = inner ?? 1 + (rnd() - 0.5) * 0.035;
      const size = 0.9 + Math.pow(rnd(), 3) * 1.8;
      byK[k].push(nodes.length);
      nodes.push({ a: cloud(), b: [dir[0] * r, dir[1] * r, dir[2] * r], c: toDisc(dir, k, inner), k, seed: rnd(), kind: 0, size });
      made++;
    }
  }

  // Knot centres become sub-hubs; the node nearest each sector centre is its hub.
  const hubs: number[] = [];
  for (let k = 0; k < K; k++) {
    const kn = knots[k];
    for (const d of kn) {
      byK[k].push(nodes.length);
      nodes.push({ a: cloud(), b: d, c: toDisc(d, k, null), k, seed: rnd(), kind: 1, size: 3.1 });
    }
    const c = centers[k];
    byK[k].push(nodes.length);
    hubs.push(nodes.length);
    nodes.push({ a: cloud(), b: [c[0] * 1.01, c[1] * 1.01, c[2] * 1.01], c: [0, layerY(k), 0], k, seed: rnd() * 0.2, kind: 2, size: 5.2 });
  }
  // Spine: one node per layer, gathered at the core while it is a sphere.
  const spine: number[] = [];
  for (let k = 0; k < K; k++) {
    spine.push(nodes.length);
    nodes.push({
      a: cloud(),
      b: [(rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.05, (rnd() - 0.5) * 0.05],
      c: [0, layerY(k), 0],
      k,
      seed: rnd() * 0.2,
      kind: 3,
      size: 3.4,
    });
  }

  // Links
  const pairs: number[] = [];
  const kinds: number[] = [];
  const seen = new Set<number>();
  const n = nodes.length;
  const link = (i: number, j: number, alpha: number) => {
    if (i === j) return;
    const key = i < j ? i * n + j : j * n + i;
    if (seen.has(key)) return;
    seen.add(key);
    pairs.push(i, j);
    kinds.push(alpha);
  };
  for (let k = 0; k < K; k++) {
    const ids = byK[k];
    for (const i of ids) {
      if (nodes[i].kind === 2) continue;
      const bi = nodes[i].b;
      let n1 = -1;
      let n2 = -1;
      let n3 = -1;
      let d1 = 1e9;
      let d2 = 1e9;
      let d3 = 1e9;
      for (const j of ids) {
        if (j === i || nodes[j].kind === 2) continue;
        const bj = nodes[j].b;
        const d = (bi[0] - bj[0]) ** 2 + (bi[1] - bj[1]) ** 2 + (bi[2] - bj[2]) ** 2;
        if (d < d1) {
          d3 = d2; n3 = n2; d2 = d1; n2 = n1; d1 = d; n1 = j;
        } else if (d < d2) {
          d3 = d2; n3 = n2; d2 = d; n2 = j;
        } else if (d < d3) {
          d3 = d; n3 = j;
        }
      }
      if (n1 >= 0 && d1 < 0.06) link(i, n1, 0.2);
      if (n2 >= 0 && d2 < 0.05) link(i, n2, 0.16);
      if (n3 >= 0 && d3 < 0.035 && rnd() < 0.5) link(i, n3, 0.12);
    }
    // Sub-hubs fan out to their knot and report to the sector hub.
    const hub = hubs[k];
    for (const i of ids) {
      const nd = nodes[i];
      if (nd.kind === 1) {
        link(i, hub, 0.34);
        for (const j of ids) {
          if (nodes[j].kind !== 0) continue;
          const bj = nodes[j].b;
          const d = (nd.b[0] - bj[0]) ** 2 + (nd.b[1] - bj[1]) ** 2 + (nd.b[2] - bj[2]) ** 2;
          if (d < 0.012 && rnd() < 0.55) link(i, j, 0.22);
        }
      }
    }
    link(hub, spine[k], 0.5);
    if (k < K - 1) link(spine[k], spine[k + 1], 0.6);
  }
  // Long links across the border of consecutive sectors.
  for (let k = 0; k < K - 1; k++) {
    const a = byK[k].filter((i) => nodes[i].kind === 0 && dot(nodes[i].b, centers[k + 1]) > 0.45);
    const b = byK[k + 1].filter((i) => nodes[i].kind === 0 && dot(nodes[i].b, centers[k]) > 0.45);
    const count = Math.round(16 * density);
    for (let m = 0; m < count && a.length && b.length; m++) {
      link(a[Math.floor(rnd() * a.length)], b[Math.floor(rnd() * b.length)], 0.1);
    }
  }

  const A = new Float32Array(n * 3);
  const B = new Float32Array(n * 3);
  const C = new Float32Array(n * 3);
  const info = new Float32Array(n * 4);
  nodes.forEach((nd, i) => {
    A.set(nd.a, i * 3);
    B.set(nd.b, i * 3);
    C.set(nd.c, i * 3);
    info.set([nd.k, nd.seed, nd.kind, nd.size], i * 4);
  });

  // Packets prefer the structural links so the flow reads.
  const packetEdges: number[] = [];
  for (let e = 0; e < kinds.length; e++) {
    const w = kinds[e] >= 0.5 ? 14 : kinds[e] >= 0.3 ? 5 : kinds[e] <= 0.1 ? 4 : 1;
    for (let m = 0; m < w; m++) packetEdges.push(e);
  }

  return {
    nodeCount: n,
    A,
    B,
    C,
    info,
    edges: new Uint32Array(pairs),
    edgeKind: new Float32Array(kinds),
    hubs,
    packetEdges,
  };
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
  return mix(1.0, mix(0.22, 1.0, near), uFocusAmt);
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

void main() {
  vec3 p = morph(aA, aB, aC, aInfo.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = depthOf(mv);
  float hot = hotOf(gl_Position);
  float wave = waveOf(p);
  float fw = focusWeight(aInfo.x);
  float twinkle = 0.72 + 0.28 * sin(uTime * (0.8 + aInfo.y * 2.2) + aInfo.y * 61.0);
  float base = mix(0.16, 1.0, depth) * fw * twinkle;
  vAlpha = base * mix(0.55, 1.0, uForm) + hot * 0.7 * fw + wave * 0.9;
  vKind = aInfo.z;
  float s = aInfo.w * (1.0 + hot * 1.3 + wave * 1.4) * mix(0.7, 1.18, depth);
  if (aInfo.z > 2.5) s *= mix(0.4, 1.0, uLayer);
  gl_PointSize = max(1.0, s * uDpr * uScale);
}
`;

const NODE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
varying float vKind;
void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  if (d > 0.5) discard;
  float a = pow(smoothstep(0.5, 0.0, d), 1.6);
  if (vKind > 1.5) {
    float ring = smoothstep(0.05, 0.0, abs(d - 0.38)) * 0.75;
    a = max(smoothstep(0.24, 0.02, d), ring);
  }
  gl_FragColor = vec4(1.0, 1.0, 1.0, a * clamp(vAlpha, 0.0, 1.0));
}
`;

const EDGE_VERT = /* glsl */ `
precision highp float;
attribute vec3 aA;
attribute vec3 aB;
attribute vec3 aC;
attribute vec4 aInfo;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
${COMMON}
varying float vAlpha;

void main() {
  vec3 p = morph(aA, aB, aC, aInfo.y);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = depthOf(mv);
  float hot = hotOf(gl_Position);
  float strong = step(0.45, aInfo.w);
  float faint = 1.0 - step(aInfo.w, 0.11) * uLayer * 0.65;
  vAlpha = aInfo.w * mix(0.22, 1.0, depth) * focusWeight(aInfo.x) * uForm * uForm * (1.0 + strong * uLayer * 0.6) * faint
         + hot * 0.22 + waveOf(p) * 0.35;
}
`;

const EDGE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(vAlpha, 0.0, 1.0)); }
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
attribute vec4 aMeta; // seed of end, cluster, size, unused
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uDpr;
uniform float uScale;
uniform float uPkTime;
uniform float uFlow;
${COMMON}
varying float vAlpha;

void main() {
  float t = fract(uPkTime * aPk.y + aPk.x - aPk.z * 0.022);
  vec3 p0 = morph(aA0, aB0, aC0, aPk.w);
  vec3 p1 = morph(aA1, aB1, aC1, aMeta.x);
  vec3 p = mix(p0, p1, t);
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float depth = depthOf(mv);
  float trail = 1.0 - aPk.z * 0.34;
  vAlpha = trail * sin(t * 3.14159) * uForm * uForm * mix(0.25, 1.0, depth) * focusWeight(aMeta.y) * (0.75 + uFlow * 0.6);
  gl_PointSize = max(1.0, aMeta.z * (1.0 - aPk.z * 0.22) * uDpr * uScale * mix(0.75, 1.15, depth));
}
`;

const PACKET_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
void main() {
  float d = length(gl_PointCoord - 0.5);
  if (d > 0.5) discard;
  gl_FragColor = vec4(1.0, 1.0, 1.0, smoothstep(0.5, 0.0, d) * clamp(vAlpha, 0.0, 1.0));
}
`;

const FIBRE_VERT = /* glsl */ `
precision highp float;
attribute vec4 aStrand; // theta, root radius, length, seed
attribute vec2 aEnd;    // 0 at the root, 1 at the tip; fire rate
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uGrow;
uniform float uSurge;
uniform float uPointerOn;
uniform vec2 uPointerDir;
uniform float uSpin;
varying float vAlong;
varying float vActive;
varying float vPk;
varying float vFiring;
varying float vContrast;

float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }

void main() {
  float clock = uTime * aEnd.y + aStrand.w * 13.0;
  float idx = floor(clock);
  float ph = fract(clock);
  float firing = step(0.8 - min(uSurge, 1.0) * 0.5, hash11(aStrand.w * 17.3 + idx * 5.7));
  float env = sin(clamp(ph * 1.35, 0.0, 1.0) * 3.14159) * firing;
  float wt = aStrand.x + uSpin;
  float align = max(0.0, dot(vec2(cos(wt), sin(wt)), uPointerDir));
  float pick = pow(align, 40.0) * uPointerOn * (0.4 + 0.6 * hash11(aStrand.w * 3.1));
  float surge = uSurge < 2.0 ? (1.0 - uSurge * 0.5) : 0.0;
  vActive = clamp(env + pick + surge * 0.7, 0.0, 1.5);
  vPk = ph * 1.45 - 0.15;
  vFiring = firing;
  vContrast = 0.5 + 0.5 * hash11(aStrand.w * 7.7);
  float len = aStrand.z * uGrow * (1.0 + 0.14 * vActive);
  float r = aStrand.y * mix(0.9, 1.0, uGrow) + aEnd.x * len;
  vAlong = aEnd.x;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(cos(aStrand.x) * r, sin(aStrand.x) * r, 0.0, 1.0);
}
`;

const FIBRE_FRAG = /* glsl */ `
precision highp float;
uniform float uGrow;
varying float vAlong;
varying float vActive;
varying float vPk;
varying float vFiring;
varying float vContrast;
void main() {
  float shaft = smoothstep(0.0, 0.22, vAlong);
  float tip = smoothstep(0.93, 1.0, vAlong);
  float dormant = mix(0.03, 0.26, shaft) * vContrast * (1.0 - 0.5 * vAlong) + tip * 0.3;
  float packet = exp(-pow((vAlong - vPk) * 5.5, 2.0)) * vFiring;
  float a = dormant + clamp(vActive, 0.0, 1.0) * 0.42 * shaft + packet * 0.85 + tip * vActive * 0.5;
  gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(a, 0.0, 1.0) * uGrow);
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
void main() {
  vec4 mv = modelViewMatrix * vec4(aPos, 1.0);
  gl_Position = projectionMatrix * mv;
  float show = smoothstep(0.55, 1.0, uLayer);
  float fw = focusWeight(aPlate.x);
  float lit = uFocusAmt * (1.0 - smoothstep(0.0, 0.6, abs(aPlate.x - uFocus)));
  vAlpha = aPlate.y * show * mix(0.35, 1.0, depthOf(mv)) * fw * (1.0 + lit * 1.4);
}
`;

const PLATE_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(vAlpha, 0.0, 1.0)); }
`;

const COLLAR_VERT = /* glsl */ `
precision highp float;
attribute vec4 aThread; // base angle, twist, r start, r end
attribute vec2 aSeg;    // position along the thread, seed
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float uTime;
uniform float uGrow;
uniform float uSurge;
varying float vAlpha;
void main() {
  float t = aSeg.x;
  float ang = aThread.x + aThread.y * t;
  float r = mix(1.0, mix(aThread.z, aThread.w, t), uGrow);
  float cycle = fract(uTime * 0.42 + aSeg.y * 0.137);
  float spark = smoothstep(0.2, 0.0, abs(t - (cycle * 3.4 - 0.3))) * step(cycle, 0.42);
  float surge = uSurge < 2.0 ? (1.0 - uSurge * 0.5) : 0.0;
  vAlpha = (0.1 + 0.62 * spark + surge * 0.35) * uGrow;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(cos(ang) * r, sin(ang) * r, sin(t * 3.14159) * 0.06, 1.0);
}
`;

const COLLAR_FRAG = /* glsl */ `
precision highp float;
varying float vAlpha;
void main() { gl_FragColor = vec4(1.0, 1.0, 1.0, clamp(vAlpha, 0.0, 1.0)); }
`;

/* ── Component ──────────────────────────────────────────────────────────── */

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const easeIO = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

export function NeuralWeb({
  className,
  layer,
  focus,
  focusAmt,
  corona,
  flow,
  hubAnchor,
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
    const root = new Transform();
    root.setParent(scene);
    const tilt = new Transform();
    tilt.setParent(root);
    const spin = new Transform();
    spin.setParent(tilt);
    const halo = new Transform();
    halo.setParent(root);

    const web = buildWeb(density);
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
      uDpr: { value: dpr },
      uScale: { value: 1 },
    };
    const additive = (p: Program) => {
      p.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
      return p;
    };

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
      eInfo.set([web.info[i * 4], web.info[i * 4 + 1], 0, web.edgeKind[v >> 1]], v * 4);
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
      program: additive(new Program(gl, { vertex: EDGE_VERT, fragment: EDGE_FRAG, uniforms: shared, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
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
      program: additive(new Program(gl, { vertex: NODE_VERT, fragment: NODE_FRAG, uniforms: shared, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
    });

    // Packets: three points each, a head and a short tail.
    const rnd = mulberry32(99);
    const pc = Math.round(820 * density);
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
    for (let p = 0; p < pc; p++) {
      const e = web.packetEdges[Math.floor(rnd() * web.packetEdges.length)];
      let i = web.edges[e * 2];
      let j = web.edges[e * 2 + 1];
      // Down the spine and outward from hubs, mostly.
      if (web.info[i * 4 + 2] < web.info[j * 4 + 2] ? rnd() < 0.75 : rnd() < 0.25) [i, j] = [j, i];
      const strong = web.edgeKind[e] >= 0.45;
      const len = Math.hypot(web.B[i * 3] - web.B[j * 3], web.B[i * 3 + 1] - web.B[j * 3 + 1], web.B[i * 3 + 2] - web.B[j * 3 + 2]);
      const speed = Math.min(1.4, (strong ? 0.5 : 0.22) / Math.max(0.08, len)) * (0.6 + rnd() * 0.8);
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
        pMeta.set([web.info[j * 4 + 1], web.info[j * 4], strong ? 3.2 : 2.2, 0], v * 4);
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
      program: additive(new Program(gl, { vertex: PACKET_VERT, fragment: PACKET_FRAG, uniforms: packetUniforms, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
    });

    // Fibre ring
    const fc = Math.round(2200 * density);
    const fStrand = new Float32Array(fc * 2 * 4);
    const fEnd = new Float32Array(fc * 2 * 2);
    for (let i = 0; i < fc; i++) {
      const tier = i % 7;
      const theta = (i / fc) * Math.PI * 2 + (rnd() - 0.5) * 0.004;
      const rootR = 1.2 + (tier / 6) * 0.16 + (rnd() - 0.5) * 0.02;
      const len = 0.32 + rnd() * 0.75 + Math.pow(rnd(), 3.6) * 1.25;
      const seed = rnd() * 1000;
      const rate = 0.22 + rnd() * 0.45;
      for (let e = 0; e < 2; e++) {
        fStrand.set([theta, rootR, len, seed], (i * 2 + e) * 4);
        fEnd.set([e, rate], (i * 2 + e) * 2);
      }
    }
    const fibreUniforms = {
      uTime: shared.uTime,
      uGrow: { value: still0 ? 1 : 0 },
      uSurge: shared.uSurge,
      uPointerOn: shared.uPointerOn,
      uPointerDir: { value: [1, 0] },
      uSpin: { value: 0 },
    };
    const fibreMesh = new Mesh(gl, {
      mode: gl.LINES,
      frustumCulled: false,
      geometry: new Geometry(gl, { aStrand: { size: 4, data: fStrand }, aEnd: { size: 2, data: fEnd } }),
      program: additive(new Program(gl, { vertex: FIBRE_VERT, fragment: FIBRE_FRAG, uniforms: fibreUniforms, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
    });

    // Woven collar where the fibres root
    const cc = Math.round(1700 * density);
    const SEG = 5;
    const cThread = new Float32Array(cc * SEG * 2 * 4);
    const cSeg = new Float32Array(cc * SEG * 2 * 2);
    let cv = 0;
    for (let i = 0; i < cc; i++) {
      const base = (i / cc) * Math.PI * 2 + (rnd() - 0.5) * 0.015;
      const twist = (0.12 + rnd() * 0.22) * (i % 2 ? 1 : -1);
      const r0 = 1.05 + Math.pow(rnd(), 1.4) * 0.12;
      const r1 = r0 + 0.1 + rnd() * 0.16;
      const seed = rnd() * 100;
      for (let s = 0; s < SEG; s++) {
        for (const t of [s / SEG, (s + 1) / SEG]) {
          cThread.set([base, twist, r0, r1], cv * 4);
          cSeg.set([t, seed], cv * 2);
          cv++;
        }
      }
    }
    const collarMesh = new Mesh(gl, {
      mode: gl.LINES,
      frustumCulled: false,
      geometry: new Geometry(gl, { aThread: { size: 4, data: cThread }, aSeg: { size: 2, data: cSeg } }),
      program: additive(new Program(gl, { vertex: COLLAR_VERT, fragment: COLLAR_FRAG, uniforms: fibreUniforms, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
    });

    // Plates
    const plateVerts: number[] = [];
    const plateInfo: number[] = [];
    const SEGS = 120;
    for (let k = 0; k < K; k++) {
      const y = layerY(k);
      const ring = (r: number, alpha: number, dash: boolean) => {
        for (let s = 0; s < SEGS; s++) {
          if (dash && s % 2) continue;
          const a0 = (s / SEGS) * Math.PI * 2;
          const a1 = ((s + 1) / SEGS) * Math.PI * 2;
          plateVerts.push(Math.cos(a0) * r, y, Math.sin(a0) * r, Math.cos(a1) * r, y, Math.sin(a1) * r);
          plateInfo.push(k, alpha, k, alpha);
        }
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
      program: additive(new Program(gl, { vertex: PLATE_VERT, fragment: PLATE_FRAG, uniforms: shared, transparent: true, depthTest: false, depthWrite: false, cullFace: false })),
    });

    fibreMesh.setParent(halo);
    collarMesh.setParent(halo);
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
      // Sphere fills ~56% of the height on wide screens, ~68% of the width on tall ones.
      distB = Math.max(2 / (0.56 * 2 * tanH), 2 / (0.68 * 2 * tanH * aspect));
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
      const grow = isStill ? 1 : easeOut(clamp01((since - 1.6) / 2.2));
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
      halo.rotation.z = -clock * 0.05;

      const wideNow = live.current.wide;
      const aspectNow = w / h;
      root.position.x = (wideNow ? 0.55 + 0.13 * roomy() : 0) * L;
      root.position.y = wideNow ? 0.06 - 0.04 * L : aspectNow < 0.8 ? 0.95 - 0.75 * L : 0.28 - 0.1 * L;
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
      packetUniforms.uPkTime.value = pkTime;
      packetUniforms.uFlow.value = fl;
      fibreUniforms.uGrow.value = grow * clamp01(corona.get());
      fibreUniforms.uSpin.value = halo.rotation.z;
      const pl = Math.hypot(ptr.sx, ptr.sy) || 1;
      fibreUniforms.uPointerDir.value = [ptr.sx / pl, ptr.sy / pl];

      renderer.render({ scene, camera, sort: false });

      // Anchors for the HTML layer.
      const core = coreAnchor?.current;
      if (core) {
        const c = project(0, 0, 0, tilt);
        core.style.transform = `translate3d(${c.x.toFixed(1)}px, ${c.y.toFixed(1)}px, 0)`;
        core.style.opacity = (form * (1 - L)).toFixed(3);
      }
      const hubEl = hubAnchor?.current;
      if (hubEl) {
        const i = web.hubs[MODEL];
        const b = web.B;
        const hp = project(b[i * 3], b[i * 3 + 1], b[i * 3 + 2], spin);
        hubEl.style.transform = `translate3d(${hp.x.toFixed(1)}px, ${hp.y.toFixed(1)}px, 0)`;
        // Visible on the near side only, and only while it is a sphere.
        hubEl.style.opacity = (clamp01((hp.z - 0.05) / 0.35) * clamp01((form - 0.85) / 0.15) * (1 - clamp01(L * 4))).toFixed(3);
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
  }, [layer, focus, focusAmt, corona, flow, hubAnchor, layerAnchors, coreAnchor]);

  return <div ref={host} aria-hidden className={className} />;
}
