/**
 * Dither shader.
 *
 * ## The mathematical idea
 *
 * An ordered dither compares each pixel to a threshold that depends on its
 * position in a small repeated matrix — Bayer's — rather than to a fixed
 * threshold. A continuous gradient then becomes a density of dots: where
 * the value is high, almost every pixel passes; where it is low, almost
 * none. It is the technique of printers and two-colour consoles, and it
 * gives that even grain no noise can replace.
 *
 * The eight by eight matrix is not a texture: it is computed by a
 * recurrence, the matrix of rank n being that of rank n-1 folded. Without
 * bitwise operations, absent from the language used here, the recurrence is
 * written in floating-point arithmetic.
 *
 * The gradient is a value noise of two octaves, in slow drift. Three hues:
 * the value is first quantised into two steps, and the dither plays only
 * between two neighbouring hues.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA`, `uColorB`, `uColorC` — the three hues, from the lowest to the highest.
 * - `uSpeed` — speed of the gradient.
 * - `uPixel` — side of one dither pixel, in physical pixels.
 * - `uScale` — scale of the gradient.
 */
export const DITHER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uPixel;
uniform float uScale;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float ditherHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float ditherNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = ditherHash(cell);
  float b = ditherHash(cell + vec2(1.0, 0.0));
  float c = ditherHash(cell + vec2(0.0, 1.0));
  float d = ditherHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Bayer matrix by recurrence: rank two is written out in the clear, each
// following rank folds the previous one at half scale.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  float pixel = max(uPixel, 1.0);
  // The dither pixel: everything that follows is computed at its cell's centre.
  vec2 grid = floor(gl_FragCoord.xy / pixel);
  vec2 uv = (grid + 0.5) * pixel / uResolution;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y) * uScale;

  float t = uTime * uSpeed;
  float value = ditherNoise(p + vec2(t * 0.35, t * 0.2));
  value += 0.5 * ditherNoise(p * 2.1 - vec2(t * 0.15, t * 0.4));
  value /= 1.5;

  // A slight contrast: without it, the dither stays in the mid greys.
  value = smoothstep(0.2, 0.8, value);

  // Two steps, and the dither between the two neighbouring hues.
  float scaled = value * 2.0;
  float base = min(floor(scaled), 1.0);
  float rest = scaled - base;
  float on = step(bayer8(grid), rest);
  float level = base + on;

  vec3 colour = mix(uColorA, uColorB, clamp(level, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(level - 1.0, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
