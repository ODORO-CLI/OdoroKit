/**
 * Currents shader.
 *
 * ## The mathematical idea
 *
 * Streamlines: a first noise at large scale gives, at every point, a flow
 * angle; the lookup point is advected along that angle, then rotated into
 * the current's local frame and stretched — the scale varies fast across
 * the flow, slowly along it. The second noise, read in that anisotropic
 * frame, therefore stretches into filaments that follow the field, without
 * a single line being drawn.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the deep water.
 * - `uColorB` — the hue of the currents.
 * - `uColorC` — the hue of the fast filaments.
 * - `uSpeed` — advection speed.
 * - `uScale` — noise scale; higher is finer.
 * - `uStretch` — anisotropy; higher means longer filaments.
 * - `uDetail` — number of octaves of the fine noise, and so its cost.
 */
export const CURRENTS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uStretch;
uniform float uDetail;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float currentHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float currentNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = currentHash(cell);
  float b = currentHash(cell + vec2(1.0, 0.0));
  float c = currentHash(cell + vec2(0.0, 1.0));
  float d = currentHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as faint.
float currentFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += currentNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.5);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDetail, 1.0, 5.0));

  // The flow field: a large-scale noise, three octaves are enough — it
  // carries only the direction, not the detail.
  float field = currentFbm(p * 0.35 + vec2(t * 0.5, -t * 0.3), 3);
  float angle = (field - 0.5) * 9.42477;
  float c = cos(angle);
  float s = sin(angle);

  // Advection: the lookup point runs back up the current, so the pattern
  // travels down the field instead of scrolling straight.
  vec2 q = p - t * vec2(c, s) * 0.6;

  // Rotation into the local frame, then anisotropy: the coordinate across
  // the flow is dilated, so the noise varies fast there and stretches into
  // filaments along the current.
  vec2 frame = vec2(c * q.x + s * q.y, (-s * q.x + c * q.y) * max(uStretch, 1.0));

  float filament = currentFbm(frame, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.3, 0.68, filament));
  colour = mix(colour, uColorC, pow(smoothstep(0.5, 0.88, filament), 3.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
