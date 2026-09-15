/**
 * Shader for the rays.
 *
 * ## The mathematical idea
 *
 * Radial crepuscular rays: the intensity is a 1D noise of the angle around an
 * adjustable point — here three sines at integer, non-multiple frequencies, so
 * periodic over the complete turn and with no seam at angle zero. A power
 * tightens or softens the rays, an exponential of the distance fades them out
 * as one moves away from the point, and slow phases make the shimmer.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the rays.
 * - `uColorC` — the hue of the focus.
 * - `uX`, `uY` — position of the emission point, as a fraction of the frame.
 * - `uCount` — number of rays around the turn.
 * - `uSoftness` — softness of the rays; low, they are thin and hard.
 * - `uDetail` — number of harmonics in the angular noise, and so its cost.
 */
export const RAYS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uCount;
uniform float uSoftness;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 focus = vec2(uX * aspect, uY);

  vec2 offset = p - focus;
  float radius = length(offset);
  float angle = atan(offset.y, offset.x);
  float t = uTime;

  // The frequencies are integers derived from the number of rays: a
  // non-integer frequency would leave a seam visible at angle zero, where
  // the turn closes back on itself.
  float f1 = max(floor(uCount), 2.0);
  float f2 = floor(f1 * 1.7) + 1.0;
  float f3 = floor(f1 * 2.6) + 2.0;
  int harmonics = int(clamp(uDetail, 1.0, 3.0));

  // Three sines at non-multiple frequencies: a 1D noise of the angle,
  // periodic, that never falls back into phase. The phases drift slowly,
  // each at its own speed: that is the shimmer.
  float beam = 0.5 + 0.5 * sin(angle * f1 + t * 0.21);
  if (harmonics >= 2) {
    beam = beam * 0.65 + (0.5 + 0.5 * sin(angle * f2 - t * 0.17)) * 0.35;
  }
  if (harmonics >= 3) {
    beam = beam * 0.75 + (0.5 + 0.5 * sin(angle * f3 + t * 0.13)) * 0.25;
  }

  // The power sculpts the profile: high exponent, thin rays on a black
  // background; low exponent, a continuous veil. That is the softness setting.
  float profile = pow(beam, mix(7.0, 1.6, clamp(uSoftness, 0.0, 1.0)));

  // The exponential of the distance fades the rays out far from the focus:
  // light does not decay linearly, and the eye knows it.
  float attenuation = exp(-radius * 1.6);

  vec3 colour = uColorA
    + uColorB * profile * attenuation
    + uColorC * exp(-radius * radius * 9.0) * (0.5 + 0.3 * profile);

  gl_FragColor = vec4(colour, 1.0);
}
`
