/**
 * Lightfall shader.
 *
 * ## The mathematical idea
 *
 * The frame is cut into columns; each carries a drop of light falling at its
 * own cadence, drawn once from its index. The drop is a gaussian in width
 * and, in height, a sharp head followed by an exponential trail: it is the
 * trail which makes the fall, a drop without one is just a point going down.
 * Three depths are stacked — finer, slower and paler as they recede — over a
 * curtain of light which comes down from the top and shivers with a slow
 * noise.
 *
 * All the light is laid down by a bounded mix towards its hues: nothing is
 * added without a bound, nothing is multiplied towards black.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the curtain.
 * - `uColorC` — the drops.
 * - `uSpeed` — falling speed.
 * - `uDensity` — number of columns across the height of the frame.
 * - `uLength` — length of the trails, in frame heights.
 * - `uLayers` — number of stacked depths, and so the cost.
 */
export const LIGHTFALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uLength;
uniform float uLayers;

float fallHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise, for the shiver of the curtain.
float fallNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = fallHash(cell);
  float b = fallHash(cell + vec2(1.0, 0.0));
  float c = fallHash(cell + vec2(0.0, 1.0));
  float d = fallHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// One depth of drops: one column per cell, one drop per column.
float fallLayer(vec2 p, float t, float density, float trailLength, float seed) {
  float x = p.x * density + seed;
  float column = floor(x);
  float lx = fract(x) - 0.5;

  float h1 = fallHash(vec2(column, seed));
  float h2 = fallHash(vec2(column + 3.1, seed * 1.7));

  // One column in three stays empty: a full fall would be a curtain.
  float active = step(0.33, h1);

  // The head goes from top to bottom, loops, at its own cadence.
  float head = 1.25 - fract(t * (0.5 + 0.7 * h2) + h1) * 1.6;
  float dy = p.y - head;

  // The trail above the head, cut sharp below it.
  float trail = exp(-max(dy, 0.0) / max(trailLength, 0.01)) * smoothstep(-0.02, 0.0, dy);
  float tip = exp(-dy * dy / 0.0008);

  float width = exp(-lx * lx * 40.0);

  return active * width * (trail * 0.7 + tip * 0.6) * (0.6 + 0.4 * h2);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float density = max(uDensity, 1.0);
  int layers = int(clamp(uLayers, 1.0, 3.0));

  // The curtain: the light comes from the top and shivers with a slow noise.
  float shiver = fallNoise(vec2(p.x * 3.0 + t * 0.2, vUv.y * 2.0 - t * 0.35));
  float curtain = smoothstep(0.15, 1.0, vUv.y) * (0.45 + 0.55 * shiver);
  curtain += exp(-(1.0 - vUv.y) * 5.0) * 0.5;

  // The depths, from the nearest to the furthest: each finer, slower and
  // paler than the one before.
  float drops = fallLayer(p, t, density, uLength, 0.0);
  if (layers >= 2) {
    drops += 0.55 * fallLayer(p, t * 0.7, density * 1.6, uLength * 0.7, 0.37);
  }
  if (layers >= 3) {
    drops += 0.3 * fallLayer(p, t * 0.5, density * 2.4, uLength * 0.5, 0.71);
  }

  vec3 colour = mix(uColorA, uColorB, clamp(curtain, 0.0, 1.0) * 0.5);
  colour = mix(colour, uColorC, clamp(drops, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
