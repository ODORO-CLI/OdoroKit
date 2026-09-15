/**
 * Shader for the scanned grid.
 *
 * ## The mathematical idea
 *
 * A grid is read, never drawn: the distance to the nearest line is the
 * fractional part of the coordinates, recentred. Over it, a bar travels one
 * axis of the frame at constant speed. It does not stop at the edge: its run
 * includes a margin on each side, so that it leaves the frame before
 * reappearing on the other side — a jump on screen would be noticed, an
 * exit is not.
 *
 * The trail is not a continuous gradient. Every cell already scanned fades
 * at its own rate, from an intensity of its own: a uniform sweep would read
 * as a plain gradient that slides, whereas uneven cells read as cells that
 * have been switched on.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the lines.
 * - `uColorC` — the bar and the cells it lights.
 * - `uCells` — number of cells across the height.
 * - `uSpeed` — speed of the bar.
 * - `uTrail` — length of the trail, in cells.
 * - `uVertical` — one if the bar travels the width, zero for the height.
 */
export const GRID_SCAN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uSpeed;
uniform float uTrail;
uniform float uVertical;

// Pseudo-random number, stable per cell.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 60.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;

  // One pixel, in cell units.
  float px = cells / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 local = abs(fract(p) - 0.5);
  float lines = 1.0 - smoothstep(px * 0.4, px * 1.4, 0.5 - max(local.x, local.y));

  // The scanned axis: the height by default, the width if vertical.
  float extent = mix(1.0, aspect, uVertical) * cells;
  float axis = mix(p.y, p.x, uVertical);
  float centre = mix(id.y, id.x, uVertical) + 0.5;

  // The bar travels the axis with a margin on each side: it leaves the
  // frame before setting off again, without ever jumping on screen.
  float margin = cells * 0.2;
  float head = fract(uTime * uSpeed * 0.2) * (extent + 2.0 * margin) - margin;

  // The front: a sharp stroke at the position of the bar.
  float front = 1.0 - smoothstep(0.0, px * 3.0, abs(head - axis));

  // The trail: every cell already scanned fades at its own rate, from an
  // intensity of its own.
  float behind = head - centre;
  float wake = step(0.0, behind) * exp(-behind / max(uTrail, 0.2)) * (0.4 + 0.6 * hash(id));

  // A soft halo on either side of the front, carried by the lines.
  float halo = exp(-abs(head - axis) * 0.8);

  vec3 colour = mix(uColorA, uColorB, lines * (0.35 + 0.65 * halo));
  colour = mix(colour, uColorC, wake * 0.55 * (1.0 - lines * 0.5));
  colour = mix(colour, uColorC, front * 0.95);

  gl_FragColor = vec4(colour, 1.0);
}
`
