/**
 * Lightning shader.
 *
 * ## The mathematical idea
 *
 * A vertical path displaced by a multi-octave noise: each octave adds a finer
 * zigzag, and it is their sum which makes the branching. The stroke is an
 * exponential of the horizontal distance to the path — the profile of an arc
 * seen through the air. Time is chopped into slots: the hash of the slot
 * decides whether a bolt strikes, and an exponential envelope makes it live
 * two or three frames before leaving a residual glow.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the night sky.
 * - `uColorB` — the diffuse glow around the arc.
 * - `uColorC` — the stroke of the arc itself.
 * - `uFrequency` — cadence of the slots, and so of the possible bursts.
 * - `uBranches` — octaves of the displacement, and so the branching of the path.
 * - `uGlow` — reach of the glow around the stroke.
 */
export const LIGHTNING_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uFrequency;
uniform float uBranches;
uniform float uGlow;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float boltHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// 1D value noise: smoothed interpolation between two integer draws.
float boltNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(boltHash(cell), boltHash(cell + 1.0), smoothed);
}

// Path displacement: a sum of octaves, each twice as fine and almost twice
// as faint. The low octaves bend the trunk, the high ones make the breaks —
// this is the branching setting.
float boltPath(float y, float seed, int octaves) {
  float total = 0.0;
  float amplitude = 0.24;
  float frequency = 2.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += (boltNoise(y * frequency + seed * 77.0) - 0.5) * amplitude;
    frequency *= 2.3;
    amplitude *= 0.55;
  }

  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);
  int octaves = int(clamp(uBranches, 1.0, 6.0));

  // Time is chopped into slots: a bolt lives inside one slot, never astride
  // two, and the hash of the slot stands in for the die.
  float cadence = max(uFrequency, 0.05);
  float slot = floor(uTime * cadence);
  float life = fract(uTime * cadence);
  float seed = boltHash(slot);

  // Three slots in five stay silent: it is the silence between the strikes
  // which makes the bursts believable, not the strikes themselves.
  float active = step(0.4, seed);

  // Envelope: a brief flash, then a fainter second return — the re-striking
  // of a real bolt — then the residual glow fading out.
  float envelope = exp(-life * 10.0) + 0.45 * exp(-abs(life - 0.2) * 28.0);
  envelope *= active;

  // The path comes down from the top: its horizontal anchor changes each slot.
  float anchor = (seed - 0.5) * 0.8;
  float path = anchor + boltPath(vUv.y, seed, octaves) * (1.0 - vUv.y * 0.35);

  // Stroke and glow: two exponentials of the same distance, one steep for the
  // arc, the other wide for the lit air around it.
  float offset = abs(p.x - path);
  float stroke = exp(-offset * 220.0);
  float glow = exp(-offset * offset / max(uGlow * uGlow * 0.045, 0.0008));

  // The flash also lights the whole sky, faintly: without that sheet, the arc
  // would float on a background nothing ties it to.
  vec3 colour = uColorA
    + uColorB * envelope * (glow * 0.85 + 0.08)
    + uColorC * envelope * stroke;

  gl_FragColor = vec4(colour, 1.0);
}
`
