/**
 * Cloud layers shader.
 *
 * ## The mathematical idea
 *
 * Three layers of fractal noise, thresholded by the coverage to give masses
 * with crisp edges, each drifting at its own speed and its own scale: the
 * far one, fine and slow; the near one, broad and fast. It is the parallax
 * that makes the depth, not a camera.
 *
 * Each layer is lit by a second lookup into the noise, shifted towards the
 * light: where the density falls off in that direction, the mass is exposed
 * and lights up; where it grows, the mass lies in its neighbour's shadow.
 * A cloud read this way has a bright top and a dark underside, which noise
 * alone does not give.
 *
 * Distinct from smoke, advected by a curl, and from the nebula, darkened at
 * the edges: here opaque masses, stacked and lit.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the clouds, in shadow.
 * - `uColorC` — their lit tops.
 * - `uSpeed` — drift speed of the near layer.
 * - `uScale` — scale of the masses; higher is finer.
 * - `uCoverage` — sky coverage, from zero to one.
 * - `uOctaves` — noise detail, and so its cost.
 */
export const CLOUD_LAYER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uCoverage;
uniform float uOctaves;

float cloudHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float cloudNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = cloudHash(cell);
  float b = cloudHash(cell + vec2(1.0, 0.0));
  float c = cloudHash(cell + vec2(0.0, 1.0));
  float d = cloudHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float cloudFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += cloudNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// One layer: the mass, and its light. The shift towards the light is in
// noise units, hence the same fraction of cloud at every scale.
vec2 cloudLayer(vec2 q, float coverage, int octaves) {
  float density = cloudFbm(q, octaves);
  float exposed = cloudFbm(q + vec2(-0.12, 0.12), octaves);

  float threshold = 1.0 - clamp(coverage, 0.0, 1.0) * 0.9;
  float mass = smoothstep(threshold - 0.12, threshold + 0.22, density);

  // The density falls off towards the light: the top is exposed.
  float light = clamp((density - exposed) * 6.0 + 0.35, 0.0, 1.0);

  return vec2(mass, light);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float scale = max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  vec3 colour = uColorA;

  // From the farthest to the nearest: each layer covers the ones before it,
  // broader, faster and more opaque.
  vec2 far = cloudLayer(p * scale * 1.8 + vec2(t * 0.35, 3.1), uCoverage * 0.85, octaves);
  colour = mix(colour, mix(uColorB, uColorC, far.y), far.x * 0.5);

  vec2 mid = cloudLayer(p * scale * 1.1 + vec2(t * 0.65, 7.7), uCoverage, octaves);
  colour = mix(colour, mix(uColorB, uColorC, mid.y), mid.x * 0.75);

  vec2 near = cloudLayer(p * scale * 0.65 + vec2(t, 12.3), uCoverage, octaves);
  colour = mix(colour, mix(uColorB, uColorC, near.y), near.x * 0.92);

  gl_FragColor = vec4(colour, 1.0);
}
`
