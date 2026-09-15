/**
 * Shader of the sliced waves.
 *
 * ## The mathematical idea
 *
 * A single thick band, but read slice by slice: the frame is cut into columns,
 * and the height of the band is evaluated at the centre of the column, never at
 * the fragment. The wave is therefore constant within each slice and jumps from
 * one step to the next — it is the quantisation that makes the staircase, not a
 * drawing of rectangles.
 *
 * Each slice additionally receives a beat of its own, a function of its index:
 * the columns do not merely follow the wave, they each twitch to their own
 * rhythm, and the motion is vertical above all.
 *
 * A one-pixel groove separates the slices, otherwise the step does not read
 * when two neighbouring columns have almost the same height.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the band.
 * - `uColorC` — the upper edge of the band.
 * - `uSlices` — number of slices.
 * - `uAmplitude` — height of the wave, as a fraction of the frame.
 * - `uSpeed` — speed of the wave.
 * - `uHeight` — thickness of the band, as a fraction of the frame.
 */
export const SLICED_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSlices;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uHeight;

void main() {
  float slices = clamp(uSlices, 4.0, 120.0);
  float index = floor(vUv.x * slices);
  float local = fract(vUv.x * slices);
  float centre = (index + 0.5) / slices;
  float t = uTime * uSpeed;

  // The wave at the centre of the slice: a slow swell, a shorter one in
  // counter-phase, and a beat of the column's own.
  float wave = sin(centre * 9.4 - t) * 0.6
    + sin(centre * 23.2 + t * 0.7 + index * 0.3) * 0.25
    + sin(t * 1.7 + index * 1.3) * 0.15;
  float axis = 0.5 + wave * uAmplitude;

  float halfHeight = max(uHeight, 0.02) * 0.5;
  float px = 1.0 / max(uResolution.y, 1.0);
  float d = abs(vUv.y - axis);
  float band = 1.0 - smoothstep(halfHeight - px, halfHeight + px, d);

  // The groove: one pixel of background between two slices, in slice units.
  float gapWidth = slices / max(uResolution.x, 1.0);
  float gap = 1.0 - smoothstep(0.0, gapWidth * 1.5, min(local, 1.0 - local));
  band *= 1.0 - gap;

  // A halo under the band, like a shadow cast on the background.
  float halo = exp(-d * 6.0) * 0.18 * (1.0 - band);

  // The body lightens towards its upper edge.
  float shade = smoothstep(-halfHeight, halfHeight, vUv.y - axis);

  vec3 colour = mix(uColorA, uColorB, halo);
  colour = mix(colour, uColorB, band);
  colour = mix(colour, uColorC, band * shade * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
