/**
 * Shader of the scanlines.
 *
 * ## The mathematical idea
 *
 * The whole cathode-ray screen fits into periodic functions of the vertical
 * axis alone: the lines are a high-frequency sine of y, the rolling bar is the
 * fractional part of y offset by time, and the grain is a hash of the pixel
 * replayed in time steps — discrete, because one draw per frame would flicker
 * instead of granulating. A vignette closes the whole thing.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background of the tube.
 * - `uColorB` — the hue of the phosphor.
 * - `uColorC` — the hue of the rolling bar.
 * - `uSpeed` — speed of the bar.
 * - `uLines` — number of lines across the height.
 * - `uFlicker` — share of the animated grain.
 */
export const SCANLINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uLines;
uniform float uFlicker;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float tubeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime;

  // The lines: a sine of y, squared to hollow out the gaps between lines
  // without hardening the crests.
  float line = 0.5 + 0.5 * sin(vUv.y * max(uLines, 1.0) * 6.28318);
  line = 0.35 + 0.65 * line * line;

  // The rolling bar: the fractional part of y offset by time loops the descent
  // round with no test at all.
  float roll = fract(vUv.y + t * uSpeed * 0.2);
  float bar = smoothstep(0.0, 0.12, roll) * smoothstep(0.30, 0.12, roll);

  // The grain: a hash of the pixel replayed in time steps. Discrete — the step
  // holds the image for a few hundredths — because one draw per frame flickers
  // instead of granulating.
  float tick = floor(t * 18.0);
  float grain = (tubeHash(floor(vUv * uResolution * 0.5) + tick) - 0.5) * uFlicker * 0.35;

  vec3 colour = mix(uColorA, uColorB, line * (0.75 + grain));
  colour = mix(colour, uColorC, bar * 0.30);

  // Vignette: the corners of a tube are darker than its centre.
  vec2 offset = (vUv - 0.5) * vec2(aspect, 1.0);
  colour *= 1.0 - smoothstep(0.35, 0.85, length(offset)) * 0.55;

  gl_FragColor = vec4(colour, 1.0);
}
`
