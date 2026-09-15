/**
 * Full-frame background shaders.
 *
 * The primitives — noise, fullscreen vertex — live in the neighbouring module.
 * Here they are compositions: each answers a precise visual intent, and all of
 * them receive `uTime` and `uResolution` from the engine.
 *
 * None is taken from elsewhere. The mathematics of each is explained where it
 * lives, which is also the only way to be able to modify it later without
 * reinventing it.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Waves: bands that undulate and fold back.
 *
 * ## Why three sines
 *
 * A single sine function gives a regular, and therefore mechanical, wave.
 * Three sines of non-multiple frequencies superpose without ever coming back
 * into phase: the pattern no longer repeats to the eye, while staying
 * perfectly deterministic.
 *
 * The edge of each band is softened over a width expressed as a fraction of
 * the screen, not in pattern units: it therefore stays crisp at any surface
 * size, instead of thickening when you enlarge.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (number of bands),
 * `uAmplitude`.
 */
export const WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAmplitude;

float odoroWave(float x, float phase) {
  return uAmplitude * (
    sin(x * 1.0 + phase) * 0.50 +
    sin(x * 2.3 + phase * 1.4) * 0.30 +
    sin(x * 4.1 + phase * 0.7) * 0.20
  );
}

void main() {
  vec2 p = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  float bands = max(uScale, 1.0);

  for (int i = 0; i < 8; i += 1) {
    if (float(i) >= bands) break;

    float k = float(i) / bands;
    float centre = k + odoroWave(p.x * aspect * 3.0, t + k * 6.28318);
    float edge = smoothstep(0.045, 0.0, abs(p.y - centre));
    colour = mix(colour, uColorB, edge * (0.35 + 0.65 * k));
  }

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Dot field: a grid of breathing discs.
 *
 * ## Why a folded grid rather than drawn points
 *
 * Drawing a thousand points would require a thousand objects, a thousand
 * positions and as much work per frame. Folding space onto itself gives the
 * same grid in one subtraction: every pixel computes its distance to the
 * centre of **its** cell, without ever knowing that there are others.
 *
 * The cost therefore does not depend on the number of points.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (density), `uRadius`.
 */
export const DOTS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uRadius;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * uScale;

  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // Every cell breathes at its own rhythm: without this offset, the whole grid
  // would pulse in unison, which reads as a flicker.
  float phase = odoroHash(cell) * 6.28318;
  float pulse = 0.5 + 0.5 * sin(uTime * uSpeed + phase);

  float radius = uRadius * (0.55 + 0.45 * pulse);
  float disc = smoothstep(radius, radius - 0.08, length(local));

  gl_FragColor = vec4(mix(uColorA, uColorB, disc * pulse), 1.0);
}
`

/**
 * Beams: oblique shafts of light.
 *
 * ## The tilted frame
 *
 * The beams are not drawn diagonally: it is space that is rotated before
 * vertical bands are drawn in it. A coordinate rotation costs two
 * multiplications, where reasoning about oblique lines would cost far more —
 * in computation as in readability.
 *
 * The attenuation towards the bottom uses a power rather than a straight line:
 * light does not decay linearly, and the eye knows it.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (number of shafts),
 * `uAngle` in radians.
 */
export const BEAMS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAngle;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 turned = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

  // The noise slightly displaces each shaft: perfectly regular bands read as a
  // texture, not as light.
  float drift = odoroNoise(vec2(turned.x * 2.0, uTime * uSpeed * 0.3)) - 0.5;
  float bands = sin((turned.x + drift * 0.3) * uScale + uTime * uSpeed);

  float strength = pow(max(bands, 0.0), 3.0);
  strength *= pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.6);

  gl_FragColor = vec4(mix(uColorA, uColorB, strength), 1.0);
}
`

/**
 * Mesh: a few patches of colour that drift and blend.
 *
 * ## Why three centres are enough
 *
 * A mesh gradient is almost always made of three or four patches. Beyond that,
 * they overlap everywhere and the result tends towards a uniform average: you
 * pay computation to lose the pattern.
 *
 * The three centres describe ellipses of non-multiple periods, so that the
 * composition never comes back to exactly the same state.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale` (extent).
 */
export const MESH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;

float odoroBlob(vec2 p, vec2 centre, float radius) {
  return smoothstep(radius, 0.0, length(p - centre));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  vec2 a = vec2(0.30 * aspect + 0.22 * sin(t), 0.35 + 0.20 * cos(t * 0.83));
  vec2 b = vec2(0.70 * aspect + 0.18 * cos(t * 1.19), 0.62 + 0.24 * sin(t * 0.71));
  vec2 c = vec2(0.50 * aspect + 0.26 * sin(t * 0.61), 0.50 + 0.18 * cos(t * 1.37));

  float wa = odoroBlob(p, a, uScale);
  float wb = odoroBlob(p, b, uScale);
  float wc = odoroBlob(p, c, uScale);
  float total = wa + wb + wc;

  // The sum of the weights exceeds one where the patches overlap: without
  // normalisation, those areas saturate instead of blending.
  vec3 blended = (uColorA * wa + uColorB * wb + uColorC * wc) / max(total, 0.001);

  gl_FragColor = vec4(mix(uColorA, blended, clamp(total, 0.0, 1.0)), 1.0);
}
`
