/**
 * Shader of the static.
 *
 * ## The mathematical idea
 *
 * Television snow: a white noise per screen cell, chopped into time steps —
 * one draw per step and not per frame, without which the shimmer would be
 * unbearable at sixty frames per second. Dark bands scroll slowly downwards,
 * like a synchronisation that is drifting, and a measure of tint pulls the
 * grey towards the colour of the tube.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the black of the tube.
 * - `uColorB` — the tint the grey is pulled towards.
 * - `uColorC` — the white of the grain.
 * - `uFps` — rate of the draw steps.
 * - `uBanding` — depth of the dark bands.
 * - `uTint` — measure of the tint; at zero, the image stays grey.
 */
export const TV_STATIC_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uFps;
uniform float uBanding;
uniform float uTint;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float tvStaticHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // Time is chopped into steps: one draw per step, not per frame. The seed
  // changes entirely from one step to the next, but stays frozen between two
  // — this is what gives the grain of a tube, not of a strobe light.
  float cadence = max(uFps, 1.0);
  float timeStep = floor(uTime * cadence);

  // A grain two screen pixels across: any finer, it would vanish into the
  // filtering; any coarser, it would become a mosaic.
  vec2 cell = floor(vUv * uResolution * 0.5);
  float grain = tvStaticHash(cell + vec2(timeStep * 57.0, timeStep * 113.0));

  // The dark bands: two sines of non-multiple frequencies that scroll slowly
  // downwards, like a vertical synchronisation that is drifting.
  float scroll = vUv.y + uTime * 0.06;
  float band = 1.0 - clamp(uBanding, 0.0, 1.0) * (
    0.32 * (0.5 + 0.5 * sin(scroll * 18.8496)) +
    0.18 * (0.5 + 0.5 * sin(scroll * 43.9823))
  );

  float value = grain * band;

  // The grey first, the tint after: desaturation is the resting point of the
  // setting, the colour of the tube its far end.
  vec3 grey = mix(uColorA, uColorC, value);
  vec3 tint = mix(uColorA, uColorB, value);
  vec3 colour = mix(grey, tint, clamp(uTint, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
