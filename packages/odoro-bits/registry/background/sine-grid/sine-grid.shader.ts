/**
 * Shader of the sine grid.
 *
 * ## The mathematical idea
 *
 * A grid is not drawn, it is read: the distance to the nearest line is the
 * fractional part of the coordinates, recentred. To make each node oscillate,
 * the nodes are not moved — the domain is warped before being read. An offset
 * in sine of y on x, and in sine of x on y, with time in the phase: each node
 * traces a small loop, and the lines joining it bend with it.
 *
 * The moire comes from a second grid, read over the same domain but a little
 * finer, turned by a few degrees and warped in counter-phase. Where the two
 * networks coincide, the strokes add up; where they shift apart, they half
 * cancel. The resulting fringes move slowly — far more slowly than the nodes —
 * because they depend on the difference of the two warps, not on their sum.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the lines.
 * - `uColorC` — the nodes.
 * - `uCells` — number of cells across the height.
 * - `uAmplitude` — travel of the oscillation, in cells.
 * - `uSpeed` — speed of the oscillation.
 * - `uMoire` — weight of the second grid.
 */
export const SINE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uMoire;

// Distance to the nearest line of a unit grid.
float gridDistance(vec2 q) {
  vec2 local = abs(fract(q + 0.5) - 0.5);
  return min(local.x, local.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;
  float t = uTime * uSpeed;

  // One pixel, in cell units.
  float px = cells / max(uResolution.y, 1.0);
  float amplitude = clamp(uAmplitude, 0.0, 0.5);

  // The domain is warped before it is read: each node traces a loop.
  vec2 q = p + amplitude * vec2(sin(p.y * 1.1 + t), sin(p.x * 0.9 - t * 1.3));

  float lines = 1.0 - smoothstep(px * 0.5, px * 1.5, gridDistance(q));
  float node = 1.0 - smoothstep(px * 2.0, px * 3.5, length(fract(q + 0.5) - 0.5));

  // The second grid: a little finer, turned, warped in counter-phase.
  float angle = 0.07;
  mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 r = turn * p * 1.04;
  vec2 q2 = r + amplitude * vec2(sin(r.y * 1.1 - t), sin(r.x * 0.9 + t * 1.3));
  float lines2 = 1.0 - smoothstep(px * 0.5, px * 1.5, gridDistance(q2));

  float ink = clamp(lines * 0.7 + lines2 * uMoire * 0.5, 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, ink);
  colour = mix(colour, uColorC, node);

  gl_FragColor = vec4(colour, 1.0);
}
`
