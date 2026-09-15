/**
 * Low fog shader.
 *
 * ## The mathematical idea
 *
 * Two sheets of fog, each a fractal noise stretched across the width: dense
 * at the bottom of the frame, dissolved above a crest the noise draws. The
 * two planes slide in opposite directions — it is the parallax that parts
 * them to the eye, more surely than their hue. The far plane climbs higher
 * and carries a cold hue; the near one stays low, denser, in the theme's
 * neutral.
 *
 * The fog is laid down by a capped mix towards its hues: on a light
 * background it greys; on a dark one it lightens. Either way it stays a fog
 * and the text stays legible.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the near sheet.
 * - `uColorC` — the far sheet.
 * - `uSpeed` — sliding speed.
 * - `uHeight` — height of the fog, as a fraction of the frame.
 * - `uDensity` — maximum opacity of the sheets.
 * - `uOctaves` — noise detail, and so its cost.
 */
export const FOG_DRIFT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHeight;
uniform float uDensity;
uniform float uOctaves;

float fogHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fogNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = fogHash(cell);
  float b = fogHash(cell + vec2(1.0, 0.0));
  float c = fogHash(cell + vec2(0.0, 1.0));
  float d = fogHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float fogFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += fogNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.1 + vec2(3.7, 1.3);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// One sheet: dense at the bottom, dissolved above a noisy crest. The noise
// is stretched across the width — fog spreads, it does not rise in columns.
float fogSheet(vec2 p, float t, float speed, float height, float scale, int octaves, float seed) {
  vec2 q = vec2(p.x * scale + t * speed, p.y * scale * 2.2 + seed);
  float n = fogFbm(q, octaves);

  float crest = max(height, 0.02) * (0.5 + 0.9 * n);
  float mass = 1.0 - smoothstep(crest * 0.25, crest, p.y);

  return mass * (0.6 + 0.4 * n);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float density = clamp(uDensity, 0.0, 1.0);

  // The far one climbs higher, finer and slower; the near one, low and
  // broad, slides the other way.
  float far = fogSheet(p, t, 0.12, uHeight * 1.35, 1.7, octaves, 3.7);
  float near = fogSheet(p, t, -0.2, uHeight * 0.85, 2.6, octaves, 9.1);

  // The caps keep the ink legible: even at full density, the near sheet
  // takes only three quarters of its hue.
  vec3 colour = mix(uColorA, uColorC, clamp(far, 0.0, 1.0) * 0.55 * density);
  colour = mix(colour, uColorB, clamp(near, 0.0, 1.0) * 0.75 * density);

  gl_FragColor = vec4(colour, 1.0);
}
`
