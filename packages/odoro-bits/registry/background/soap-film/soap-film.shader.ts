/**
 * Shader of the soap film.
 *
 * ## The mathematical idea
 *
 * A thin film coloured by interference: its hue depends on its thickness, and
 * makes a full turn every time the thickness grows by one wavelength. Here, the
 * thickness is a fractal noise, and the turn of hue is a phase: the two colours
 * of the film blend according to the sine of the phase, and a cosine at double
 * frequency hollows out the dark fringes that separate the bands. It is tokens
 * that turn, not a spectrum written in hard.
 *
 * Two details make it soap rather than an abstract sheet. First the drainage:
 * the domain of the noise slides upwards as time passes, which makes the
 * fringes descend as the liquid drains downwards; and the thickness grows with
 * the depth, so that the bands crowd together at the bottom. Then the
 * transparency: where the film is too thin to interfere, it sends nothing back,
 * and it is the background that shows.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, seen through the film.
 * - `uColorB` — the first hue of the film.
 * - `uColorC` — the second hue of the film.
 * - `uSpeed` — speed at which the thicknesses drift.
 * - `uDrain` — drainage downwards.
 * - `uScale` — scale of the thickness field.
 * - `uBands` — turns of hue over the whole thickness.
 * - `uOctaves` — detail of the noise, and therefore its cost.
 */
export const SOAP_FILM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrain;
uniform float uScale;
uniform float uBands;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float filmHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float filmNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = filmHash(cell);
  float b = filmHash(cell + vec2(1.0, 0.0));
  float c = filmHash(cell + vec2(0.0, 1.0));
  float d = filmHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float filmFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += filmNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // The thickness: a noise whose domain rises, so that the fringes descend,
  // plus a slope that thickens the film towards the bottom.
  vec2 q = p * max(uScale, 0.1) + vec2(t * 0.3, t + uTime * uDrain * 0.25);
  float thickness = filmFbm(q, octaves);
  thickness = thickness * 0.75 + (1.0 - vUv.y) * 0.45 * (0.5 + uDrain);

  // The phase: one turn of hue per band. The sine blends the two colours; the
  // cosine at double frequency hollows out the dark fringes.
  float phase = thickness * uBands * 6.2831853;
  vec3 tint = mix(uColorB, uColorC, 0.5 + 0.5 * sin(phase));
  float fringes = 0.55 + 0.45 * cos(phase * 2.0 + 1.2);

  // The transparency: below a minimal thickness, the film sends nothing back.
  float presence = smoothstep(0.12, 0.32, thickness);

  // A reflection sweeping diagonally, like light from a window.
  float sweep = sin((p.x + p.y) * 3.0 - uTime * 0.4);
  float reflection = pow(max(sweep, 0.0), 6.0) * 0.18;

  vec3 film = tint * fringes;
  vec3 colour = mix(uColorA, film, presence * 0.9);
  colour += (uColorB + uColorC) * 0.5 * reflection * presence;

  gl_FragColor = vec4(colour, 1.0);
}
`
