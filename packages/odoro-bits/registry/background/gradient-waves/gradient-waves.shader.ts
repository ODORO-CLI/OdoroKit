/**
 * Gradient waves shader.
 *
 * ## The mathematical idea
 *
 * A gradient repeated in horizontal bands — background, first hue, second
 * hue, background — whose height is displaced by a swell. The swell is a
 * sum of sines of the abscissa, at non-multiple frequencies and opposite
 * speeds, so that it never closes back on itself.
 *
 * What sets these waves apart from rippling lines or from slices: there is
 * neither stroke nor step, only sheets of colour sliding over one another.
 * The softness sets the width of the transitions: low, the bands are clean;
 * high, they melt into a single gradient that
 * ripples.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the bands.
 * - `uColorC` — the second hue of the bands.
 * - `uBands` — number of bands across the height.
 * - `uAmplitude` — height of the swell, as a fraction of the frame.
 * - `uSpeed` — speed of the swell.
 * - `uSoftness` — width of the transitions.
 * - `uDetail` — number of harmonics in the swell, and so its cost.
 */
export const GRADIENT_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBands;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uSoftness;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;
  int harmonics = int(clamp(uDetail, 1.0, 3.0));

  // The swell: sines at non-multiple frequencies, at opposite speeds.
  float swell = sin(x * 2.4 + t);
  if (harmonics >= 2) swell += 0.5 * sin(x * 4.1 - t * 1.3 + 1.0);
  if (harmonics >= 3) swell += 0.25 * sin(x * 7.3 + t * 0.7 + 2.0);
  swell *= uAmplitude;

  // The band: the displaced height, and a slow drift upwards.
  float phase = (vUv.y + swell) * max(uBands, 0.5) - uTime * 0.05;
  float w = fract(phase);

  // The repeated gradient: the background at 0, the first hue at a third,
  // the second at two thirds, the background at 1. The softness widens them.
  float softness = mix(0.06, 0.33, clamp(uSoftness, 0.0, 1.0));
  float kB = smoothstep(0.333 - softness, 0.333, w) * smoothstep(0.666, 0.666 - softness, w);
  float kC = smoothstep(0.666 - softness, 0.666, w) * smoothstep(1.0, 1.0 - softness, w);

  vec3 colour = mix(uColorA, uColorB, kB);
  colour = mix(colour, uColorC, kC);

  // The crest: where the swell peaks, the band brightens a little.
  float crest = smoothstep(0.0, 1.0, swell / max(uAmplitude * 1.75, 0.0001));
  colour += mix(uColorB, uColorC, 0.5) * crest * 0.12 * max(kB, kC);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
