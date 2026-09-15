/**
 * Shader of the smoke swirls.
 *
 * ## The mathematical idea
 *
 * A fractal noise advected by an approximate curl: four reads of the noise
 * around the point give its gradient by finite differences, and the gradient
 * turned by a quarter turn is a divergence-free field — a flow that swirls
 * without ever compressing. The slow rise comes from a plain offset of the
 * domain downwards as time passes.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the body of the smoke.
 * - `uColorC` — the hue of the densest crests.
 * - `uSpeed` — speed of the swirl.
 * - `uScale` — scale of the pattern; higher is finer.
 * - `uLift` — speed of the rise.
 * - `uOctaves` — detail of the noise, and therefore its cost.
 */
export const SMOKE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uLift;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float smokeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float smokeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3: zero derivative at the ends, hence no visible ridge.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = smokeHash(cell);
  float b = smokeHash(cell + vec2(1.0, 0.0));
  float c = smokeHash(cell + vec2(0.0, 1.0));
  float d = smokeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float smokeFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += smokeNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  // The rise: the domain slides downwards, so the matter appears to go up.
  vec2 p = vec2(vUv.x * aspect, vUv.y - uTime * uLift * 0.1) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // Approximate curl: the gradient of the noise by finite differences — two
  // pairs of offset reads — turned by a quarter turn. A field built this way is
  // divergence-free: it swirls without compressing.
  float e = 0.35;
  float gx = smokeFbm(p + vec2(e, 0.0), octaves) - smokeFbm(p - vec2(e, 0.0), octaves);
  float gy = smokeFbm(p + vec2(0.0, e), octaves) - smokeFbm(p - vec2(0.0, e), octaves);
  vec2 curl = vec2(gy, -gx);

  // The matter is the same noise, read where the curl has pushed it. Time
  // enters only the displacement: the smoke deforms, it does not flicker.
  float density = smokeFbm(p + curl * (1.2 + 0.6 * sin(t * 0.5)) + vec2(t * 0.08, 0.0), octaves);

  // Soft contrast: the ramp is wide, the smoke has no hard edge.
  float body = smoothstep(0.30, 0.80, density);

  vec3 colour = mix(uColorA, uColorB, body);
  colour = mix(colour, uColorC, smoothstep(0.62, 0.95, density) * 0.6);

  gl_FragColor = vec4(colour, 1.0);
}
`
