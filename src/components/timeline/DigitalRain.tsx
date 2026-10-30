"use client";

import { Mesh, Program, Renderer, Texture, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/lib/useReducedMotion";

/**
 * Digital rain: columns of green glyphs written downward, the way a terminal
 * fills in the films. Each drop's head moves a whole cell at a time and burns
 * near white, its trail fades through the site's green, and the glyphs under it
 * keep changing at their own pace. Three sheets at different sizes give the
 * rain depth; the nearest and farthest are drawn a little soft, so the middle
 * one reads as the plane in focus. Near the pointer, the glyphs between the
 * drops show faintly.
 *
 * One full-screen triangle and one fragment shader. The glyphs come from an
 * atlas per sheet, drawn at the sheet's exact cell size so nothing is scaled.
 * It only runs while it is on screen.
 */

// Mirrored half-width katakana, as in the films, then digits and a few marks.
const KANA = "ｦｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ";
const MARKS = "0123456789:.=*+-<>¦|Z";
// Without a font that carries katakana, mirrored capitals stand in.
const LATIN = "ABCDEFGHJKLMNPQRSTUVWXYZ";
const FONT = `"Hiragino Sans", "Hiragino Kaku Gothic ProN", "Yu Gothic UI", "Yu Gothic", Meiryo, "Noto Sans JP", "Noto Sans CJK JP", "MS Gothic", monospace`;
const GRID = 8;

/** Cell height in CSS pixels, share of columns that rain, speed, brightness, softness. */
const SHEETS = [
  { size: 12, density: 0.75, speed: 0.55, level: 0.34, blur: 0.5 },
  { size: 19, density: 0.56, speed: 0.8, level: 0.78, blur: 0 },
  { size: 30, density: 0.16, speed: 1.05, level: 1, blur: 1.2 },
];

const VERT = /* glsl */ `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const FRAG = /* glsl */ `
precision highp float;
uniform sampler2D uAtlas0;
uniform sampler2D uAtlas1;
uniform sampler2D uAtlas2;
uniform vec2 uCell0;
uniform vec2 uCell1;
uniform vec2 uCell2;
uniform float uGlyphs;
uniform float uTime;
uniform float uGlyphTime;
uniform vec2 uRes;
uniform float uDpr;
uniform vec2 uPointer;
uniform float uPointerOn;

const float GRID = ${GRID.toFixed(1)};
const vec3 DEEP = vec3(0.0, 0.17, 0.07);
const vec3 GREEN = vec3(0.3, 0.88, 0.52);
const vec3 MINT = vec3(0.84, 1.0, 0.9);

// Hashes without sin, so they hold up on mobile GPUs however long the page stays open.
float h1(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float h2(vec2 p) {
  vec3 q = fract(vec3(p.xyx) * 0.1031);
  q += dot(q, q.yzx + 33.33);
  return fract((q.x + q.y) * q.z);
}

// Row of drop d's head in a column (far above the frame before its first
// start), and the length of its trail this time down.
void drop(float id, float d, float rows, float speedK, out float head, out float trail) {
  float speed = (7.0 + h1(id * 3.1 + d * 1.7) * 9.0) * speedK;
  float period = rows + 24.0 + h1(id * 7.7 + d) * rows;
  // A quarter of the columns are already falling when the page opens; the rest start from the top.
  float start = (h1(id * 9.1 + d * 3.3) - 0.25) * rows * 0.9 + d * period * 0.5;
  float phase = uTime * speed - start;
  float cycle = floor(phase / period);
  head = phase < 0.0 ? -1000.0 : floor(phase - cycle * period);
  trail = 9.0 + h1(id * 5.3 + cycle * 1.37 + d) * 26.0;
}

vec3 sheet(sampler2D atlas, vec2 cellSize, float seed, float density, float speedK, float level, float near, float reach) {
  vec2 frag = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 cell = floor(frag / cellSize);
  vec2 local = fract(frag / cellSize);
  float rows = ceil(uRes.y / cellSize.y);

  float glow = 0.0;
  float lit = 0.0;
  float head = 0.0;
  for (int k = -1; k <= 1; k++) {
    // Only the nearer sheets light their neighbours' cells; the far one is too fine to show it.
    if (reach < 0.5 && k != 0) continue;
    float c = cell.x + float(k);
    float id = c + seed * 131.0;
    if (h1(id * 1.73) > density) continue;
    for (int d = 0; d < 2; d++) {
      float hr;
      float tr;
      drop(id, float(d), rows, speedK, hr, tr);
      // The head lights the cells around it.
      vec2 dv = (frag - (vec2(c, hr) + 0.5) * cellSize) / cellSize.y;
      glow += exp(-dot(dv, dv) * 2.4);
      if (k == 0) {
        float dist = hr - cell.y;
        if (dist >= 0.0 && dist <= tr) {
          lit = max(lit, 1.0 - dist / tr);
          head = max(head, 1.0 - step(0.5, dist));
        }
      }
    }
  }

  // Most cells change their glyph slowly, a few quickly, on their own clock (the rain's
  // speeds up with the scroll; this one never does). The head writes a glyph of its own
  // into each cell it enters.
  float rate = h2(cell * 0.71 + seed);
  float tick = head > 0.5 ? 4099.0 : mod(floor(uGlyphTime * (0.25 + rate * rate * 4.0) + rate * 17.0), 4096.0);
  float g = floor(h2(cell + vec2(tick * 0.173, seed * 7.0)) * uGlyphs);
  vec2 slot = vec2(mod(g, GRID), floor(g / GRID));
  vec2 uv = (slot + local) / GRID;
  float ink = texture2D(atlas, vec2(uv.x, 1.0 - uv.y)).r;

  float vary = 0.55 + 0.45 * h2(cell * 1.91 + seed);
  float shown = max(pow(lit, 1.6) * vary, near * 0.38 * vary);
  vec3 tone = mix(DEEP, GREEN, smoothstep(0.0, 0.8, max(lit, near * 0.55)));
  tone = mix(tone, MINT, head);
  vec3 col = tone * ink * (shown + head * 1.25);
  col += GREEN * glow * 0.13 + MINT * glow * glow * 0.04;
  return col * level;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, gl_FragCoord.y);
  float near = uPointerOn * (1.0 - smoothstep(0.0, 190.0 * uDpr, length(p - uPointer)));
  vec3 col = sheet(uAtlas0, uCell0, 1.0, ${SHEETS[0].density.toFixed(2)}, ${SHEETS[0].speed.toFixed(2)}, ${SHEETS[0].level.toFixed(2)}, near * 0.5, 0.0);
  col += sheet(uAtlas1, uCell1, 2.0, ${SHEETS[1].density.toFixed(2)}, ${SHEETS[1].speed.toFixed(2)}, ${SHEETS[1].level.toFixed(2)}, near, 1.0);
  col += sheet(uAtlas2, uCell2, 3.0, ${SHEETS[2].density.toFixed(2)}, ${SHEETS[2].speed.toFixed(2)}, ${SHEETS[2].level.toFixed(2)}, near * 0.6, 1.0);
  // Soft shoulder, so where drops cross the light rolls off instead of clipping.
  col = 1.0 - exp(-col * 1.35);
  gl_FragColor = vec4(col, 1.0);
}
`;

/** Ink coverage of one glyph drawn in FONT, to tell a real glyph from a missing-glyph box. */
function inkOf(ch: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const x = c.getContext("2d", { willReadFrequently: true });
  if (!x) return "";
  x.fillStyle = "#fff";
  x.font = `24px ${FONT}`;
  x.textBaseline = "middle";
  x.fillText(ch, 4, 16);
  const d = x.getImageData(0, 0, 32, 32).data;
  let s = "";
  for (let i = 3; i < d.length; i += 16) s += d[i] > 127 ? "1" : "0";
  return s;
}

function glyphSet() {
  const kana = inkOf("ｱ");
  // U+0378 is unassigned: if katakana draws the same, the font has none.
  const usable = kana.includes("1") && kana !== inkOf("͸");
  return { glyphs: [...(usable ? KANA : LATIN), ...MARKS].slice(0, GRID * GRID), mirror: usable ? KANA : LATIN };
}

/** One sheet's glyphs, white on black, each in a cell of exactly the sheet's size. */
function atlas(cw: number, ch: number, blur: number, glyphs: string[], mirror: string) {
  const c = document.createElement("canvas");
  c.width = cw * GRID;
  c.height = ch * GRID;
  const x = c.getContext("2d");
  if (!x) return c;
  x.fillStyle = "#000";
  x.fillRect(0, 0, c.width, c.height);
  x.fillStyle = "#fff";
  x.textAlign = "center";
  x.textBaseline = "middle";
  x.font = `600 ${Math.round(ch * 0.86)}px ${FONT}`;
  if (blur > 0) x.filter = `blur(${blur}px)`;
  glyphs.forEach((g, i) => {
    x.save();
    x.translate((i % GRID) * cw + cw / 2, Math.floor(i / GRID) * ch + ch * 0.54);
    if (mirror.includes(g)) x.scale(-1, 1);
    x.fillText(g, 0, 0);
    x.restore();
  });
  return c;
}

export function DigitalRain({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let renderer: Renderer;
    try {
      renderer = new Renderer({ dpr, alpha: false, antialias: false, depth: false, powerPreference: "low-power" });
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

    const { glyphs, mirror } = glyphSet();
    const cells = SHEETS.map((s) => {
      const ch = Math.round(s.size * dpr);
      return [Math.round(ch * 0.62), ch] as [number, number];
    });
    const textures = SHEETS.map(
      (s, i) =>
        new Texture(gl, {
          image: atlas(cells[i][0], cells[i][1], s.blur * dpr, glyphs, mirror),
          generateMipmaps: false,
          minFilter: gl.LINEAR,
          magFilter: gl.LINEAR,
          wrapS: gl.CLAMP_TO_EDGE,
          wrapT: gl.CLAMP_TO_EDGE,
        })
    );

    const uniforms = {
      uAtlas0: { value: textures[0] },
      uAtlas1: { value: textures[1] },
      uAtlas2: { value: textures[2] },
      uCell0: { value: cells[0] },
      uCell1: { value: cells[1] },
      uCell2: { value: cells[2] },
      uGlyphs: { value: glyphs.length },
      // Standing still, the frame shows the rain long after it began.
      uTime: { value: reduce ? 24 : 0 },
      uGlyphTime: { value: reduce ? 24 : 0 },
      uRes: { value: [1, 1] },
      uDpr: { value: dpr },
      uPointer: { value: [0, 0] },
      uPointerOn: { value: 0 },
    };
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program: new Program(gl, { vertex: VERT, fragment: FRAG, uniforms }) });

    const resize = () => {
      renderer.setSize(el.clientWidth || 1, el.clientHeight || 1);
      uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
      if (reduce) renderer.render({ scene: mesh });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    if (reduce) {
      return () => {
        ro.disconnect();
        canvas.remove();
        gl.getExtension("WEBGL_lose_context")?.loseContext();
      };
    }

    // The pointer is kept in viewport terms and placed on the canvas each frame, so it stays put while the page scrolls.
    let mouse = false;
    let cx = 0;
    let cy = 0;
    let pointerOn = 0;
    const onMove = (e: PointerEvent) => {
      mouse = e.pointerType === "mouse";
      cx = e.clientX;
      cy = e.clientY;
    };
    const onOut = (e: PointerEvent) => {
      if (!e.relatedTarget) mouse = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut);

    let visible = true;
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting));
    io.observe(el);

    let raf = 0;
    let last = performance.now();
    let rush = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (document.hidden || !visible) return;
      const r = el.getBoundingClientRect();
      const inside = mouse && cx >= r.left && cx <= r.right && cy >= r.top && cy <= r.bottom;
      pointerOn += ((inside ? 1 : 0) - pointerOn) * Math.min(1, dt * 5);
      uniforms.uPointer.value = [(cx - r.left) * dpr, (r.bottom - cy) * dpr];
      uniforms.uPointerOn.value = pointerOn;
      // The rain gathers speed as the page leaves it, up to two and a half times as fast.
      const gone = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      rush += (gone - rush) * Math.min(1, dt * 6);
      uniforms.uTime.value += dt * (1 + rush * 1.5);
      uniforms.uGlyphTime.value += dt;
      renderer.render({ scene: mesh });
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      io.disconnect();
      ro.disconnect();
      canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [reduce]);

  return <div ref={host} aria-hidden className={className} />;
}
