/**
 * Shader of the organic shape.
 *
 * ## The mathematical idea
 *
 * A shape in polar coordinates: its radius is a mean radius modulated by
 * three sines of the angle, at harmonics 3, 5 and 7, each turning at its own
 * speed. Three odd harmonics are enough: they never line up into a regular
 * pattern, and the shape looks alive without ever looking geometric. A slow
 * sine of time makes the mean radius breathe.
 *
 * The edge is not a line: the signed distance is disturbed by a fine noise
 * before the threshold, which fringes the outline, and a halo decays
 * exponentially with the distance beyond it. The fringe and the halo share
 * the same colour, which is not the one of the body.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the shape.
 * - `uColorC` — the fringe and the halo.
 * - `uSize` — mean radius, in frame heights.
 * - `uSpeed` — speed of the breathing.
 * - `uWobble` — amplitude of the harmonics.
 * - `uFringe` — width of the fringe, strength of the halo.
 * - `uDetail` — octaves of the noise of the fringe.
 */
export const BLOB_MORPH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSize;
uniform float uSpeed;
uniform float uWobble;
uniform float uFringe;
uniform float uDetail;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float blobHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float blobNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = blobHash(cell);
  float b = blobHash(cell + vec2(1.0, 0.0));
  float c = blobHash(cell + vec2(0.0, 1.0));
  float d = blobHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves, bounded at three: the fringe is fine, not deep.
float blobFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 3; i += 1) {
    if (i >= octaves) break;
    total += blobNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int detail = int(clamp(uDetail, 1.0, 3.0));

  float angle = atan(p.y, p.x);
  float dist = length(p);

  // The outline: three odd harmonics, each turning at its own speed, over a
  // mean radius that breathes.
  float harmonics =
    0.5 * sin(3.0 * angle + t) +
    0.3 * sin(5.0 * angle - t * 1.3) +
    0.2 * sin(7.0 * angle + t * 0.7);
  float breath = 1.0 + 0.06 * sin(t * 1.7);
  float radius = uSize * breath * (1.0 + uWobble * harmonics);

  // The signed distance, disturbed by the noise before the threshold: this
  // is what fringes the edge instead of drawing it.
  float fringe = max(uFringe, 0.0);
  float noise = blobFbm(p * 14.0 + vec2(t * 0.6, -t * 0.4), detail) - 0.5;
  float d = dist - radius + noise * 0.06 * fringe;

  float body = 1.0 - smoothstep(-0.006, 0.006, d);

  // The halo: an exponential of the distance beyond the edge, and filaments
  // drawn from a noise read in polar coordinates, escaping from the edge.
  float halo = exp(-max(d, 0.0) * 18.0) * fringe * 0.8;
  float filaments = pow(blobNoise(vec2(angle * 6.0, dist * 6.0 - t * 0.8)), 3.0);
  halo += filaments * exp(-max(d, 0.0) * 6.0) * fringe * 0.5;

  // The body: darker at the edge, lighter at the core, like a volume.
  float depth = smoothstep(0.0, radius * 0.9, radius - dist);
  vec3 matter = mix(uColorB * 0.7, uColorB * 1.05, depth);
  // The inner fringe takes the colour of the halo, so that the edge reads
  // continuous on either side of the line.
  float rim = 1.0 - smoothstep(0.0, 0.05 * (0.5 + fringe), -d);
  matter = mix(matter, uColorC, rim * 0.6);

  vec3 colour = mix(uColorA, uColorC, clamp(halo, 0.0, 1.0));
  colour = mix(colour, matter, body);

  gl_FragColor = vec4(colour, 1.0);
}
`
