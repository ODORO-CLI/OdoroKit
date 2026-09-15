/**
 * Shader of the marble.
 *
 * ## The mathematical idea
 *
 * A domain warp in three storeys: a noise is read where a second noise has
 * displaced it, itself read where a third has displaced it. A single storey
 * gives scrolls; three give the tight folds and the twists of a stone that
 * flowed before it set.
 *
 * The veins are not a threshold of the noise: they are the level lines of a
 * sine of the warped noise — where the sine vanishes — thinned by a power. That
 * is what makes them fine and continuous, where a plain threshold would give
 * blotches. A second network, finer and rarer, carries the accent.
 *
 * Time enters only the first storey, very slowly: marble is not supposed to
 * move, only to breathe enough that it is not mistaken for a picture.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the stone.
 * - `uColorB` — the veins.
 * - `uColorC` — the accent streak.
 * - `uSpeed` — speed of the warp.
 * - `uScale` — scale of the pattern.
 * - `uVeins` — fineness of the veins.
 * - `uOctaves` — octaves of each noise, and therefore the cost.
 */
export const MARBLE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uVeins;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float marbleHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float marbleNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = marbleHash(cell);
  float b = marbleHash(cell + vec2(1.0, 0.0));
  float c = marbleHash(cell + vec2(0.0, 1.0));
  float d = marbleHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float marbleFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += marbleNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // The three storeys: each noise displaces the domain of the next. Two
  // components per storey, read at different offsets, so that the displacement
  // has a direction and not only an amplitude.
  vec2 q = vec2(
    marbleFbm(p + vec2(t, 0.0), octaves),
    marbleFbm(p + vec2(5.2, 1.3) - t * 0.7, octaves)
  );
  vec2 r = vec2(
    marbleFbm(p + 4.0 * q + vec2(1.7, 9.2), octaves),
    marbleFbm(p + 4.0 * q + vec2(8.3, 2.8), octaves)
  );
  float v = marbleFbm(p + 4.0 * r, octaves);

  // The veins: the zeros of a sine of the warped noise, thinned by a power that
  // grows with the setting. The warp by r adds the tight twists that make the
  // difference with plain rippled lines.
  float fineness = mix(3.0, 14.0, clamp(uVeins, 0.0, 1.0));
  float wave = sin(v * 12.0 + r.x * 4.0);
  float vein = pow(1.0 - abs(wave), fineness);

  // A finer and rarer network, for the accent: its frequency is higher, and its
  // threshold harsher.
  float fineWave = sin(v * 31.0 - r.y * 6.0 + q.x * 3.0);
  float streak = pow(1.0 - abs(fineWave), fineness * 2.0) * smoothstep(0.45, 0.7, q.y);

  // The stone: a soft marbling in the colour of the background, so it is not a
  // flat wash between the veins.
  vec3 stone = uColorA * (1.0 - (q.x - 0.5) * 0.1);
  stone = mix(stone, uColorB, smoothstep(0.55, 0.9, r.y) * 0.18);

  vec3 colour = mix(stone, uColorB, clamp(vein, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(streak, 0.0, 1.0) * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
