/**
 * Shader for the electric field: a Jacob's ladder.
 *
 * ## The mathematical idea
 *
 * Two electrodes spreading apart towards the top, and an arc joining them. The
 * arc is born at the bottom, where the electrodes are close, and climbs
 * carried by the air it heats; at the top the gap becomes too wide, the arc
 * breaks and a new one strikes at the bottom. The arc's path is a height
 * displaced by a multi-octave noise read along the horizontal axis, re-hashed
 * some thirty times a second: it is that re-hashing that makes the crackle,
 * not a continuous motion.
 *
 * Two ghost frames follow the arc a little lower, fainter: the ionised air
 * keeps for a few instants the trace of the path the arc has just left.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the glow of the arc and the electrodes.
 * - `uColorC` — the line of the arc itself.
 * - `uSpeed` — climbs per second.
 * - `uJitter` — amplitude of the path's displacement.
 * - `uGlow` — reach of the glow around the line.
 * - `uBranches` — octaves of the displacement, and so the break-up of the path.
 */
export const ELECTRIC_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uJitter;
uniform float uGlow;
uniform float uBranches;

// Rate at which the path is re-hashed, in frames per second.
const float CRACKLE = 28.0;

// Number of ghost frames behind the arc.
const int GHOSTS = 2;

float arcHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float arcNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(arcHash(cell), arcHash(cell + 1.0), smoothed);
}

// Vertical displacement of the path along x: octaves that get finer and
// finer, each one fainter. The seed changes on every re-hash.
float arcPath(float x, float seed, int octaves) {
  float total = 0.0;
  float amplitude = 0.09;
  float frequency = 3.0;
  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += (arcNoise(x * frequency + seed * 91.0) - 0.5) * amplitude;
    frequency *= 2.2;
    amplitude *= 0.5;
  }
  return total;
}

// Half-gap of the electrodes at a given height: they diverge.
float arcGap(float y) {
  return 0.06 + y * 0.34;
}

// Glow and line of an arc at height "base", at a given intensity: two
// coverages between 0 and 1, which the compositor blends into the background.
// Adding the colours instead of blending them would saturate to white on a
// light theme.
vec2 arcRender(vec2 p, float base, float seed, float intensity, int octaves, float phase) {
  float halfGap = arcGap(base);
  // The path lives only between the electrodes: outside their gap, nothing.
  float inside = smoothstep(halfGap + 0.02, halfGap - 0.01, abs(p.x));
  // The displacement is zero at the electrodes and greatest in the middle: the
  // arc is anchored at both its ends.
  float anchor = 1.0 - pow(abs(p.x) / max(halfGap, 0.001), 2.0);
  float path = base + arcPath(p.x / max(halfGap, 0.05), seed, octaves) * uJitter * (0.6 + halfGap * 2.5) * anchor;

  float gap = abs(p.y - path);
  float line = exp(-gap * 260.0);
  float glow = exp(-gap * gap / max(uGlow * uGlow * 0.02, 0.0005));

  // Towards the break, the arc thins out and dies in fits and starts.
  float dying = smoothstep(1.0, 0.82, phase);
  float life = intensity * inside * mix(0.35, 1.0, dying);

  return vec2(glow * life * 0.8, line * life);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);
  int octaves = int(clamp(uBranches, 1.0, 5.0));

  float rate = max(uSpeed, 0.02);
  float cycle = floor(uTime * rate);
  float phase = fract(uTime * rate);

  // The arc speeds up as it climbs: the hot air carries it faster and faster.
  float height = 0.06 + pow(phase, 1.35) * 0.86;

  // The re-hash: one seed per crackle frame, and per cycle.
  float frame = floor(uTime * CRACKLE);
  float seed = arcHash(frame + cycle * 977.0);
  float flicker = 0.7 + 0.3 * arcHash(frame * 3.7 + cycle);

  // The electrodes: two diverging lines, lit by the arc as it goes past.
  float halfGap = arcGap(vUv.y);
  float electrode = exp(-abs(abs(p.x) - halfGap) * 320.0);
  float heat = exp(-abs(vUv.y - height) * 9.0) * flicker;

  // The arc, then its ghosts a little lower and fainter: the coverages combine
  // through the maximum, not through the sum.
  vec2 arc = arcRender(p, height, seed, flicker, octaves, phase);
  for (int i = 1; i <= GHOSTS; i += 1) {
    float lag = float(i) * 0.028;
    float older = arcHash(frame - float(i) * 3.0 + cycle * 977.0);
    vec2 ghost = arcRender(p, height - lag, older, 0.35 / float(i), octaves, phase) * step(lag, height - 0.03);
    arc = max(arc, ghost);
  }

  // A rising glow: the air above the arc is already hot.
  float air = exp(-max(vUv.y - height, 0.0) * 6.0) * exp(-abs(p.x) * 4.0) * step(height, vUv.y);

  // From the background towards the glow, then towards the line: each layer is
  // blended into the previous one, which holds on a light theme as on a dark
  // one.
  float glow = clamp(air * 0.1 * flicker + electrode * (0.25 + heat * 0.7) + arc.x, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, glow);
  colour = mix(colour, uColorC, clamp(arc.y, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
