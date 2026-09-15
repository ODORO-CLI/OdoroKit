/**
 * Watercolour shader.
 *
 * ## The mathematical idea
 *
 * Each blot lives through a cycle: it spreads — its radius grows fast then
 * slows down, like water taking the paper —, it dries, and it fades away to
 * be born again elsewhere. The cycle is a phase drawn from the index, so the
 * blots are never in step with one another.
 *
 * Two details make a watercolour rather than a coloured disc. The edge is not
 * round: the distance to the centre is perturbed by a fractal noise, which
 * tears it up the way water follows the fibres. And the pigment is not
 * uniform: as it dries, it migrates towards the edge and forms there the dark
 * rim that is so characteristic — a ring whose intensity grows as the cycle
 * advances.
 *
 * The blots compose like washes: each one blends its colour into the previous
 * result and darkens it a little, which gives the build-up of layers where
 * they overlap.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the paper.
 * - `uColorB` — the first pigment.
 * - `uColorC` — the second pigment.
 * - `uSpeed` — speed of the cycle.
 * - `uBlots` — number of living blots.
 * - `uBleed` — fringe of the edge.
 * - `uGrain` — grain of the paper.
 */
export const WATERCOLOR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBlots;
uniform float uBleed;
uniform float uGrain;

// Pseudo-random number for an index: amplified sine, fractional part.
float washHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Pseudo-random number for a point: projection onto an arbitrary direction,
// amplified sine, fractional part.
float washHash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float washNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = washHash2(cell);
  float b = washHash2(cell + vec2(1.0, 0.0));
  float c = washHash2(cell + vec2(0.0, 1.0));
  float d = washHash2(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of three octaves: enough to tear up an edge, no more.
float washFbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i += 1) {
    total += washNoise(p) * amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }
  return total / 0.875;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int blots = int(clamp(uBlots, 1.0, 10.0));
  float t = uTime * uSpeed;

  // The paper: a fine grain, in the colour of the background, a little darker
  // in the hollows between the fibres.
  float fibres = washNoise(p * 90.0) * 0.6 + washNoise(p * 220.0) * 0.4;
  vec3 colour = uColorA * (1.0 - (fibres - 0.5) * 0.12 * uGrain);

  // Constant bound: the language specification demands it. Ten blots already
  // cover the paper.
  for (int i = 0; i < 10; i += 1) {
    if (i >= blots) break;
    float fi = float(i);
    float h1 = washHash(fi + 5.0);
    float h2 = washHash(fi + 19.0);
    float h3 = washHash(fi + 37.0);

    // The cycle: a phase of its own, and a cycle number that moves the blot
    // on every rebirth, so that it does not land in the same place twice.
    float cycle = (t + h1 * 7.0) / 7.0;
    float turn = floor(cycle);
    float phase = fract(cycle);
    vec2 centre = vec2(
      (0.15 + 0.7 * washHash(fi * 3.0 + turn + 1.0)) * aspect,
      0.15 + 0.7 * washHash(fi * 5.0 + turn + 2.0)
    );

    // The spreading: fast at first, then slowed down — water takes the paper
    // quickly, then runs out on it.
    float maxRadius = 0.14 + 0.12 * h2;
    float spread = 1.0 - pow(1.0 - min(phase / 0.5, 1.0), 3.0);
    float radius = maxRadius * spread;

    // The torn edge: the noise follows the fibres, it is fixed in the plane
    // and specific to the blot.
    float fringe = washFbm(p * 7.0 + vec2(h3 * 40.0, turn * 3.0)) - 0.5;
    float d = length(p - centre) + fringe * 0.09 * uBleed;

    float coverage = 1.0 - smoothstep(radius - 0.015, radius + 0.005, d);

    // The drying: the pigment migrates towards the edge as the phase
    // advances, and the core lightens by as much.
    float drying = smoothstep(0.2, 0.75, phase);
    float rim = smoothstep(radius - 0.07, radius - 0.01, d) * coverage;
    float density = coverage * (0.5 - 0.2 * drying) + rim * (0.25 + 0.45 * drying);

    // The fading, at the end of the cycle, then back to zero at the start.
    float life = (1.0 - smoothstep(0.8, 1.0, phase)) * smoothstep(0.0, 0.04, phase);
    float weight = clamp(density * life, 0.0, 1.0);

    // The pigments alternate from one blot to the next.
    vec3 pigment = mod(fi, 2.0) < 0.5 ? uColorB : uColorC;

    // A wash settles on the previous one: a blend, and a slight darkening
    // where the layers pile up.
    colour = mix(colour, pigment, weight * 0.85);
    colour *= 1.0 - weight * 0.12;
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
