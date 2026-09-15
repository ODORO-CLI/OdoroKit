/**
 * Shader of the liquid ether.
 *
 * ## The mathematical idea
 *
 * Advection without simulation. Every move of the pointer drops a vortex: a
 * position, a velocity, a date. At each fragment, the twelve live drops sum
 * into a displacement field — the velocity of each, weighted by a Gaussian of
 * the distance and an exponential of the age. The fractal noise is read at the
 * point displaced by that field: the matter seems pushed where the pointer went
 * past, and lets go as the drops age.
 *
 * The same sum, without the velocity, gives a trail density: it is what lights
 * the wake of the pointer, brighter than the vapour around it.
 *
 * This is not a fluid in the sense of the equations: nothing is conserved from
 * one frame to the next. But the eye only ever sees a vapour following the
 * hand, and that is what was needed.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the vapour.
 * - `uColorC` — the trail of the pointer.
 * - `uTrail` — twelve drops (x, y, vx, vy), ring buffer.
 * - `uStamps` — date of each drop, in the engine's time.
 * - `uSpeed` — speed of the drift without a pointer.
 * - `uRadius` — radius of a drop.
 * - `uStrength` — strength of the push.
 * - `uLife` — lifetime of a drop.
 * - `uOctaves` — detail of the noise, and therefore its cost.
 */
export const LIQUID_ETHER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec4 uTrail[12];
uniform float uStamps[12];
uniform float uSpeed;
uniform float uRadius;
uniform float uStrength;
uniform float uLife;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float etherHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float etherNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = etherHash(cell);
  float b = etherHash(cell + vec2(1.0, 0.0));
  float c = etherHash(cell + vec2(0.0, 1.0));
  float d = etherHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float etherFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += etherNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;
  float radius = max(uRadius, 0.02);
  float life = max(uLife, 0.1);

  vec2 push = vec2(0.0);
  float trail = 0.0;

  // Constant bound: the language specification demands it, and twelve drops
  // already cover a whole gesture — the thirteenth would be out already.
  for (int i = 0; i < 12; i += 1) {
    vec4 drop = uTrail[i];
    float age = uTime - uStamps[i];
    // A drop dated at -1000 has a huge age: its envelope is nil.
    float envelope = exp(-age / life * 3.0) * step(0.0, age);

    vec2 d = p - drop.xy * vec2(aspect, 1.0);
    float weight = exp(-dot(d, d) / (radius * radius)) * envelope;

    push += drop.zw * vec2(aspect, 1.0) * weight;
    trail += weight;
  }

  // The noise is read at the displaced point: that is the advection. The slow
  // drift without a pointer lives in the same domain, so the two compose.
  vec2 q = p * 2.5 - push * uStrength * 0.35 + vec2(t * 0.6, t * 0.35);
  float density = etherFbm(q, octaves);
  float veil = etherFbm(q * 2.1 + vec2(3.7, 1.9) - t * 0.4, octaves);

  // The vapour: a wide ramp, with no edge; the trail feeds it a little.
  float vapour = smoothstep(0.28, 0.82, density * 0.7 + veil * 0.3 + trail * 0.2);

  vec3 colour = mix(uColorA, uColorB, vapour);

  // The wake: brighter where the pointer has just been, and all the more so
  // where the vapour is dense — light needs matter.
  float wake = clamp(trail, 0.0, 1.0);
  colour += uColorC * wake * (0.25 + 0.55 * density);

  gl_FragColor = vec4(colour, 1.0);
}
`
