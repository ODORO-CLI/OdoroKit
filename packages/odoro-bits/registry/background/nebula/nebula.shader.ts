/**
 * Shader of the nebula.
 *
 * ## The mathematical idea
 *
 * Two layers of fractal noise drifting at different speeds, the second read at
 * a point already displaced by the first: it is that coupling that makes
 * clouds, where two independent layers would only make two superimposed
 * textures. A vignette darkens the edges to give the depth.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the deep background.
 * - `uColorB` — the hue of the clouds.
 * - `uColorC` — the hue of the bright cores.
 * - `uSpeed` — speed at which the two layers drift.
 * - `uScale` — scale of the noise; higher is finer.
 * - `uDepth` — number of octaves of the two layers, and therefore their cost.
 */
export const NEBULA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uDepth;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float nebulaHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float nebulaNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3: zero derivative at the ends, hence no visible ridge.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = nebulaHash(cell);
  float b = nebulaHash(cell + vec2(1.0, 0.0));
  float c = nebulaHash(cell + vec2(0.0, 1.0));
  float d = nebulaHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float nebulaFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += nebulaNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDepth, 1.0, 6.0));

  // First layer: the slow masses, the framework of the clouds.
  float mass = nebulaFbm(p + vec2(t * 0.05, t * 0.02), octaves);

  // Second layer: finer, faster, and read at a point displaced by the first.
  // It is that coupling that coils the swirls; two independent layers would
  // only superimpose.
  float swirl = nebulaFbm(p * 1.7 + vec2(-t * 0.11, t * 0.07) + mass * 1.4, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.25, 0.85, mass));

  // The bright cores appear only where the two layers reinforce each other: the
  // product stays low almost everywhere, which makes them scarce.
  colour = mix(colour, uColorC, smoothstep(0.45, 0.95, mass * swirl * 2.0));

  // Vignette: darkening the edges gives the depth, without which the sheet
  // stays a wallpaper.
  float fromCentre = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.35, 0.95, fromCentre) * 0.65;

  gl_FragColor = vec4(colour, 1.0);
}
`
