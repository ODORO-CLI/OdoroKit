/**
 * Gradient blinds shader.
 *
 * ## The mathematical idea
 *
 * Vertical slats in front of a gradient. Each slat is a cell of a grid in x;
 * its opening is a fraction of the cell, and that fraction follows a wave
 * that crosses the slats from one edge to the other — that is the opening
 * wave. A second wave, in y, tilts it so that the blind does not open as a
 * rectangular block.
 *
 * Behind, the gradient is a mix between two tokens along a diagonal that
 * drifts. In front, the closed slat is the background itself, barely tinted
 * so that its structure stays visible; at the rim of the opening, an edging
 * recalls the slat's thickness.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, the closed slats.
 * - `uColorB` — the start of the gradient.
 * - `uColorC` — the end of the gradient, and the edging.
 * - `uCount` — number of slats across the width.
 * - `uSpeed` — speed of the opening wave.
 * - `uOpen` — average opening, between shut and open.
 * - `uTilt` — tilt of the slats.
 * - `uDetail` — 1 for the edging and the shadow, 0 for flat tints.
 */
export const GRADIENT_BLINDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSpeed;
uniform float uOpen;
uniform float uTilt;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;
  float count = max(floor(uCount), 2.0);

  // The slats: a grid in x, tilted by y.
  float x = vUv.x + (vUv.y - 0.5) * uTilt * 0.5;
  float index = floor(x * count);
  float cell = fract(x * count);

  // The opening: a wave crossing the slats, tilted by a second wave in y,
  // around the average opening.
  float wave = sin(index / count * 6.2831853 * 1.5 - t * 2.0);
  float slope = sin(vUv.y * 3.5 + t * 0.8 + index * 0.4);
  float opening = clamp(uOpen + 0.4 * wave + 0.15 * slope, 0.0, 1.0);

  // The gradient behind: a diagonal that drifts.
  float diagonal = (vUv.x * aspect + vUv.y) * 0.8 + t * 0.15;
  vec3 tint = mix(uColorB, uColorC, 0.5 + 0.5 * sin(diagonal * 2.0));

  // The slat: open on the left of the cell, shut on the right.
  float edge = 0.012;
  float visible = 1.0 - smoothstep(opening - edge, opening + edge, cell);

  vec3 colour = mix(uColorA, tint, visible);

  // The closed slat keeps a trace of the hue: its structure stays legible
  // without the background being darkened.
  colour = mix(colour, tint, (1.0 - visible) * 0.07);

  if (uDetail > 0.5) {
    // The edging: the slat's thickness at the rim of the opening.
    float rim = exp(-abs(cell - opening) * 90.0);
    colour = mix(colour, uColorC, rim * 0.5 * step(0.02, opening));

    // The blind's shadow cast on the gradient: the wider the slat opens, the
    // further the shadow moves away — a plain return towards the background.
    float shadow = exp(-(opening - cell) * 30.0) * visible;
    colour = mix(colour, uColorA, shadow * 0.25);
  }

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
