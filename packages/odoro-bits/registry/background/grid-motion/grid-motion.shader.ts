/**
 * Shader for the sliding rows.
 *
 * ## The mathematical idea
 *
 * The frame is cut into rows; each row slides as one block, in the direction
 * opposite to its neighbour and at a speed of its own. The slide is not a
 * displacement of tiles: it is the abscissa that is offset by time before
 * the row is read in cells. Two neighbouring rows therefore never stay
 * aligned, and the eye finds no fixed column to hold on to — that is what
 * gives the impression of a conveyor, not of a chequerboard that trembles.
 *
 * A tile is a rounded rectangle read by its signed distance; its width
 * depends on the row, its lightness on a stable draw. A few tiles carry the
 * accent and breathe slowly, each on its own phase.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the tiles.
 * - `uColorC` — the accented tiles.
 * - `uRows` — number of rows across the height.
 * - `uSpeed` — sliding speed.
 * - `uGap` — space between tiles, as a fraction of a row.
 * - `uAccent` — share of accented tiles, between zero and one.
 */
export const GRID_MOTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uRows;
uniform float uSpeed;
uniform float uGap;
uniform float uAccent;

// Pseudo-random number, stable per cell.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// Signed distance to a rounded rectangle centred on the origin.
float roundedBox(vec2 point, vec2 extent, float radius) {
  vec2 d = abs(point) - extent + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float rows = clamp(uRows, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * rows;

  // One pixel, in row units.
  float px = rows / max(uResolution.y, 1.0);

  float row = floor(p.y);

  // Direction alternates from one row to the next, and each has its own
  // speed: two neighbouring rows never stay aligned.
  float direction = mod(row, 2.0) * 2.0 - 1.0;
  float rate = (0.5 + 0.5 * hash(vec2(row, 3.0))) * direction;

  // The tiles do not all have the same width; a row keeps its own.
  float width = 1.4 + hash(vec2(row, 7.0)) * 1.4;

  float x = (p.x + uTime * uSpeed * rate) / width;
  vec2 id = vec2(floor(x), row);
  vec2 local = vec2(fract(x) * width, fract(p.y));
  vec2 size = vec2(width, 1.0);

  float gap = clamp(uGap, 0.04, 0.5);
  float dist = roundedBox(local - size * 0.5, size * 0.5 - gap * 0.5, 0.14);
  float tile = 1.0 - smoothstep(-px, px, dist);

  // Every tile has its own lightness; a few carry the accent, and breathe.
  float shade = 0.35 + 0.65 * hash(id);
  float accent = step(1.0 - clamp(uAccent, 0.0, 1.0), hash(id + 11.0));
  float breath = 0.6 + 0.4 * sin(uTime * 1.4 + hash(id + 5.0) * 6.2832);

  vec3 tint = mix(uColorA, uColorB, shade);
  tint = mix(tint, uColorC, accent * breath);
  vec3 colour = mix(uColorA, tint, tile);

  gl_FragColor = vec4(colour, 1.0);
}
`
