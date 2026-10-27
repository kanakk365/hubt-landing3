/**
 * The colour of the moving work: the hero animations and the six layers of a
 * production AI system. Six tones of matched lightness, from the site's green
 * through teal, sky, indigo and violet to rose. A sweep runs green to rose and
 * back rather than wrapping, so it never passes through a muddy mix. Everything
 * outside the animations stays black, white and green.
 */
export const SPECTRUM = [
  { name: "green", hex: "#4ade80", rgb: [0.29, 0.87, 0.5] },
  { name: "teal", hex: "#2dd4bf", rgb: [0.18, 0.83, 0.75] },
  { name: "sky", hex: "#38bdf8", rgb: [0.22, 0.74, 0.97] },
  { name: "indigo", hex: "#818cf8", rgb: [0.51, 0.55, 0.97] },
  { name: "violet", hex: "#c084fc", rgb: [0.75, 0.52, 0.99] },
  { name: "rose", hex: "#fb7185", rgb: [0.98, 0.44, 0.52] },
] as const;

/** One colour per layer, in layer order (Context and data first). */
export const LAYER_HEX = SPECTRUM.map((c) => c.hex);

/**
 * The knowledge graph on /ai-2, after the cosmic visualizer study: the same
 * walk from green to rose, but at full saturation, the way light reads on
 * black. One tone per layer, in layer order.
 */
export const NEON = [
  { name: "mint", hex: "#00f5aa", rgb: [0.0, 0.96, 0.67] },
  { name: "cyan", hex: "#00d2ff", rgb: [0.0, 0.82, 1.0] },
  { name: "blue", hex: "#4d7cff", rgb: [0.3, 0.49, 1.0] },
  { name: "purple", hex: "#9d4edd", rgb: [0.62, 0.31, 0.87] },
  { name: "fuchsia", hex: "#e879f9", rgb: [0.91, 0.47, 0.98] },
  { name: "rose", hex: "#f43f5e", rgb: [0.96, 0.25, 0.37] },
] as const;

export const NEON_HEX = NEON.map((c) => c.hex);

type Tone = { readonly rgb: readonly number[] };
const v3 = (rgb: readonly number[]) => `vec3(${rgb.map((n) => n.toFixed(3)).join(", ")})`;

/**
 * GLSL for `vec3 <fn>(float h)`: h in palette steps (0 = the first tone, 1 =
 * the next…). Whole numbers land exactly on a tone; beyond the last the sweep
 * turns back rather than wrapping, eased between neighbours. Written without
 * arrays so it compiles in GLSL ES 1.0 and 3.0 alike.
 */
function paletteGlsl(fn: string, tones: readonly Tone[]) {
  const last = tones.length - 1;
  return `
vec3 ${fn}At(float i) {
${tones
  .slice(0, -1)
  .map((c, i) => `  if (i < ${i}.5) return ${v3(c.rgb)};`)
  .join("\n")}
  return ${v3(tones[last].rgb)};
}
vec3 ${fn}(float h) {
  float x = ${last}.0 - abs(mod(h, ${last * 2}.0) - ${last}.0);
  float i = floor(x);
  float f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  return mix(${fn}At(i), ${fn}At(min(i + 1.0, ${last}.0)), f);
}
`;
}

/** `vec3 spectrum(float h)` over SPECTRUM. */
export const SPECTRUM_GLSL = paletteGlsl("spectrum", SPECTRUM);

/** `vec3 neon(float h)` over NEON. */
export const NEON_GLSL = paletteGlsl("neon", NEON);
