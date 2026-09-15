/**
 * Shader of the sonar.
 *
 * ## The mathematical idea
 *
 * Pulses emitted at regular intervals from a point, widening and fading out
 * with the distance. A pulse is not a sine: it is a steep front followed by a
 * tail. The fractional part of `distance x spacing - time x speed` advances
 * outwards as time passes; raised to a power, it is bright just before falling
 * back to zero — that is the front, on the outside of the ring — and dark just
 * after — that is the tail, on the inside.
 *
 * The fading with the distance is an exponential: the rings near the centre are
 * full, the distant ones fade out before the edge of the frame.
 *
 * The centre is the pointer, damped by the component: when it moves, the rings
 * already emitted do not remember their origin — they follow. That is a choice:
 * a sonar that kept its rings at the old point would be `click-waves`, and that
 * one already exists.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the rings.
 * - `uColorC` — the front of the pulses.
 * - `uPointer` — position of the centre, in texture coordinates.
 * - `uSpeed` — speed of propagation.
 * - `uSpacing` — rings per frame height.
 * - `uFade` — rate of fading with the distance.
 */
export const SONAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uSpacing;
uniform float uFade;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 centre = uPointer * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);

  float d = length(p - centre);
  float spacing = max(uSpacing, 0.5);

  // The phase advances outwards; its power makes the front.
  float phase = fract(d * spacing - uTime * uSpeed);
  float pulse = pow(phase, 6.0);
  float front = pow(phase, 24.0);

  // Fading with the distance: the distant rings fade out.
  float reach = exp(-d * uFade);

  // The range circles: fixed, thin, spaced twice as widely as the pulses. They
  // give the scale against which the rings advance.
  float ring = abs(fract(d * spacing * 0.5 + 0.5) - 0.5) / (spacing * 0.5);
  float range = (1.0 - smoothstep(px * 0.5, px * 1.5, ring)) * reach * 0.35;

  // The centre: a dot, and a halo that breathes.
  float core = 1.0 - smoothstep(px * 2.0, px * 4.0, d);
  float halo = exp(-d * 18.0) * (0.5 + 0.2 * sin(uTime * 2.0));

  vec3 colour = mix(uColorA, uColorB, range + halo * 0.4);
  colour = mix(colour, uColorB, pulse * reach * 0.8);
  colour = mix(colour, uColorC, (front * reach + core) * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
