/**
 * Kaleidoscope shader.
 *
 * ## The mathematical idea
 *
 * An angular fold: the pixel's angle is brought back modulo 2pi/n, then
 * mirrored about the middle of the sector. Every pixel of a sector therefore
 * reads the same domain, and any pattern — here an animated fractal noise —
 * becomes symmetrical without any symmetry being drawn. A slow rotation of
 * the angle before the fold turns the whole thing.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the sheets.
 * - `uColorC` — the hue of the highlights.
 * - `uSpeed` — rotation and noise drift speed.
 * - `uSegments` — number of sectors in the fold.
 * - `uScale` — noise scale; higher is finer.
 * - `uDetail` — number of noise octaves, and so its cost.
 */
export const KALEIDOSCOPE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uSegments;
uniform float uScale;
uniform float uDetail;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float kaleidoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float kaleidoNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = kaleidoHash(cell);
  float b = kaleidoHash(cell + vec2(1.0, 0.0));
  float c = kaleidoHash(cell + vec2(0.0, 1.0));
  float d = kaleidoHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as faint.
float kaleidoFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += kaleidoNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 q = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDetail, 1.0, 6.0));

  float radius = length(q);
  float angle = atan(q.y, q.x) + t * 0.4;

  // Fold: modulo to bring it back into one sector, absolute value around the
  // middle for the mirror. That reflection is what makes the kaleidoscope,
  // the modulo alone would give only a repetition, not a symmetry.
  float sector = 6.28318 / max(uSegments, 3.0);
  angle = mod(angle, sector);
  angle = abs(angle - sector * 0.5);

  // Back to cartesian: every sector reads the same domain.
  vec2 domain = vec2(cos(angle), sin(angle)) * radius * max(uScale, 0.2);

  float sheet = kaleidoFbm(domain + vec2(t * 0.3, -t * 0.2), octaves);

  // Second read, offset by the first: the highlights coil instead of
  // floating above the sheets.
  float highlight = kaleidoFbm(domain * 1.7 + sheet * 1.2 - t * 0.15, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.3, 0.75, sheet));
  colour = mix(colour, uColorC, smoothstep(0.55, 0.9, highlight) * 0.8);

  gl_FragColor = vec4(colour, 1.0);
}
`
