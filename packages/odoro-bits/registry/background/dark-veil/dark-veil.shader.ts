/**
 * Dark veil shader.
 *
 * ## The mathematical idea
 *
 * Two slow gaussians make a glow at the bottom of the frame. Over the top,
 * a fractal noise warped by itself — two lookups serve as displacement for
 * a third — draws a cloth whose folds drift; a slow wave sets it rippling.
 * The glow comes through only by the veil's gaps, and the veil itself is
 * not a darkening: it is a capped mix towards its deep hue, which stays
 * legible on a light background as well as on a dark
 * one.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the glow under the veil.
 * - `uColorC` — the deep hue of the veil.
 * - `uSpeed` — drift speed of the veil.
 * - `uScale` — scale of the folds; higher is finer.
 * - `uOpacity` — thickness of the veil; at zero, only the glow remains.
 * - `uOctaves` — noise detail, and so its cost.
 */
export const DARK_VEIL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
uniform float uOctaves;

float veilHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float veilNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = veilHash(cell);
  float b = veilHash(cell + vec2(1.0, 0.0));
  float c = veilHash(cell + vec2(0.0, 1.0));
  float d = veilHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Capped sum of octaves: low quality stops earlier.
float veilFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += veilNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 5.0));

  // The glow: two gaussian sources wandering slowly along the bottom.
  vec2 f1 = vec2(aspect * (0.35 + 0.1 * sin(t * 0.37)), 0.25 + 0.08 * sin(t * 0.23));
  vec2 f2 = vec2(aspect * (0.68 + 0.1 * cos(t * 0.29)), 0.42 + 0.1 * cos(t * 0.41));
  vec2 d1 = p - f1;
  vec2 d2 = p - f2;
  float glow = clamp(exp(-dot(d1, d1) * 3.5) + 0.8 * exp(-dot(d2, d2) * 4.5), 0.0, 1.0);

  // The veil: the domain ripples first — a slow wave pleats it — then the
  // noise warps by itself, which gives folds of cloth and not round
  // patches.
  vec2 q = p * max(uScale, 0.1);
  q.y += 0.12 * sin(q.x * 1.5 + t * 0.8);
  vec2 warp = vec2(
    veilFbm(q + vec2(t * 0.15, 0.0), octaves),
    veilFbm(q + vec2(5.2, 1.3) - vec2(0.0, t * 0.1), octaves)
  );
  float density = veilFbm(q + 1.6 * warp, octaves);
  float veil = smoothstep(0.35, 0.75, density) * clamp(uOpacity, 0.0, 1.0);

  // The glow comes through only by the gaps.
  vec3 colour = mix(uColorA, uColorB, glow * (1.0 - veil) * 0.7);

  // The veil: a capped mix towards its hue, never a multiplication towards
  // black — on a light background it stays a cloth, not a hole.
  colour = mix(colour, uColorC, veil * 0.5);

  // The fringe: the glow catches the edge of the folds.
  float edge = smoothstep(0.3, 0.45, density) * (1.0 - smoothstep(0.45, 0.6, density));
  colour = mix(colour, uColorB, edge * glow * 0.35);

  gl_FragColor = vec4(colour, 1.0);
}
`
