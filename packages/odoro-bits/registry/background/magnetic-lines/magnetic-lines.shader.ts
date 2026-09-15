/**
 * Shader of the field lines.
 *
 * ## The mathematical idea
 *
 * Two poles of opposite sign in the plane. The field lines of such a dipole are
 * the circles passing through both poles; the equipotentials, the Apollonius
 * circles surrounding them. The former are the level sets of the difference of
 * the angles under which each pole is seen, the latter the level sets of the
 * difference of the logarithms of the distances. No integration: everything is
 * analytic, and so is the gradient — it is what gives the strokes their
 * thickness in pixels, with no screen-space derivative.
 *
 * The difference of the angles jumps by a full turn on either side of the
 * branch cut of the arc tangent; since the number of lines is an integer, the
 * fractional part does not see that jump, and the circles stay continuous.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the field lines.
 * - `uColorC` — the poles and the field near them.
 * - `uPointer` — damped pointer position, centred, between -1 and 1, y downwards.
 * - `uLines` — number of field lines per turn.
 * - `uSpread` — half-distance of the poles, in frame heights.
 * - `uSpeed` — speed at which the lines slide along the field.
 * - `uPotential` — 1 to also draw the equipotentials.
 */
export const MAGNETIC_LINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uLines;
uniform float uSpread;
uniform float uSpeed;
uniform float uPotential;

const float TAU = 6.28318530718;

// A thin stroke centred on the integers of a scalar field, of fixed thickness
// in pixels: the slope of the field brings the distance back to the screen.
float strokeLine(float value, float slope, float pixel, float width) {
  float offset = abs(fract(value) - 0.5);
  float halfWidth = slope * pixel * width;
  return 1.0 - smoothstep(halfWidth * 0.6, halfWidth * 1.6, 0.5 - offset);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float pixel = 1.0 / max(uResolution.y, 1.0);

  // The first pole breathes slowly; the second follows the pointer.
  vec2 poleA = vec2(-uSpread, sin(uTime * 0.3) * 0.06);
  vec2 poleB = vec2(uSpread, 0.0) + vec2(uPointer.x * aspect, -uPointer.y) * 0.3;

  vec2 dA = p - poleA;
  vec2 dB = p - poleB;
  float lA = max(length(dA), 0.0005);
  float lB = max(length(dB), 0.0005);

  float lines = max(floor(uLines), 2.0);

  // Field lines: difference of the angles. Its gradient is the sum of the
  // perpendiculars divided by the squared distances.
  float psi = (atan(dA.y, dA.x) - atan(dB.y, dB.x)) / TAU * lines + uTime * uSpeed;
  vec2 gradPsi = (vec2(-dA.y, dA.x) / (lA * lA) - vec2(-dB.y, dB.x) / (lB * lB)) / TAU * lines;
  float field = strokeLine(psi, length(gradPsi), pixel, 1.1);

  // Equipotentials: difference of the logarithms, gradient in 1 / distance.
  float phi = (log(lA) - log(lB)) / TAU * lines * 0.5;
  vec2 gradPhi = (dA / (lA * lA) - dB / (lB * lB)) / TAU * lines * 0.5;
  float potential = strokeLine(phi, length(gradPhi), pixel, 0.8) * step(0.5, uPotential);

  // The strokes crowd towards infinity near the poles: there they are melted
  // into a halo, otherwise they moire.
  float near = exp(-lA * 9.0) + exp(-lB * 9.0);
  float halo = exp(-lA * lA * 900.0) + exp(-lB * lB * 900.0);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, potential * 0.22);
  colour = mix(colour, uColorB, field * (0.75 - near * 0.4));
  colour = mix(colour, uColorC, clamp(field * near * 1.2 + halo, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
