/**
 * Shader of the parallax veils.
 *
 * ## The mathematical idea
 *
 * Three veils of fractal noise, each read at a point offset by the damped
 * pointer position by a different factor: the finest veil slides the most,
 * and it is that gap between the speeds which makes the depth. A slow
 * automatic drift keeps the veils alive when no pointer goes by.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the deep background.
 * - `uColorB` — the intermediate veils.
 * - `uColorC` — the surface veil.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uDepth` — amplitude of the parallax.
 * - `uSpeed` — speed of the automatic drift.
 * - `uScale` — scale of the noise; the higher, the finer.
 */
export const VEIL_PARALLAX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uDepth;
uniform float uSpeed;
uniform float uScale;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float veilHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
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

// Sum of three octaves: each pass twice as fine, twice as weak.
float veilFbm(vec2 p) {
  float total = veilNoise(p) * 0.5;
  total += veilNoise(p * 2.0) * 0.25;
  total += veilNoise(p * 4.0) * 0.125;
  return total / 0.875;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // The pointer, brought back to the centre: every veil slides by its own
  // factor.
  vec2 offset = (uPointer - 0.5) * uDepth;

  // Back veil: almost still, it acts as the anchor of the depth.
  float back = veilFbm(p + offset * 0.35 + vec2(t * 0.3, t * 0.12));

  // Middle veil: a notch finer, a notch more mobile.
  float middle = veilFbm(p * 1.6 + offset * 1.0 + vec2(-t * 0.2, t * 0.26) + 3.7);

  // Surface veil: the finest and the most sensitive to the pointer — it is
  // the gap between the three slides that makes the depth readable.
  float surface = veilFbm(p * 2.4 + offset * 1.9 + vec2(t * 0.16, -t * 0.22) + 8.1);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, smoothstep(0.3, 0.8, back) * 0.55);
  colour = mix(colour, uColorB, smoothstep(0.4, 0.85, middle) * 0.4);
  colour = mix(colour, uColorC, smoothstep(0.5, 0.9, surface) * 0.45);

  // Vignette: darkening the edges heightens the window effect.
  float fromCentre = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.45, 1.0, fromCentre) * 0.45;

  gl_FragColor = vec4(colour, 1.0);
}
`
