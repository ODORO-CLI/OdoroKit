/**
 * Shader of the triangulation.
 *
 * ## The mathematical idea
 *
 * A grid of cells, each cut in two by a diagonal. The diagonal alternates
 * from one cell to the next — in a chequerboard — without which the tiling
 * would have a dominant direction and the facets would form stripes. The side
 * of the diagonal the fragment falls on gives the facet; a stable draw on the
 * identifier of the facet gives its phase.
 *
 * The lighting combines two movements: a slow breathing of each facet's own,
 * and a diagonal sweep that crosses the tiling — like a reflection sliding
 * over a crystal. The first on its own would make a shimmer with no
 * direction; the second on its own, a plain wave. Together, the facets seem
 * to receive a light that moves, and each answers it in its own way.
 *
 * The edges are read by distance: to the diagonal, to the borders of the
 * cell. They are tinted towards the background, so that they read as joints,
 * not as strokes.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, and the joints.
 * - `uColorB` — the lit facets.
 * - `uColorC` — the tint of the brightest facets.
 * - `uSize` — number of cells over the height.
 * - `uSpeed` — speed of the lighting.
 * - `uContrast` — gap between dark and light facets.
 * - `uTint` — weight of the tint on the brightest facets.
 */
export const TRIANGLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSize;
uniform float uSpeed;
uniform float uContrast;
uniform float uTint;

// Pseudo-random number, stable per facet.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float size = clamp(uSize, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * size;

  // One pixel, in cell units.
  float px = size / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p);

  // The diagonal alternates in a chequerboard: the tiling has no dominant
  // direction.
  float flip = mod(id.x + id.y, 2.0);
  float diagonal = mix(f.x - f.y, f.x + f.y - 1.0, flip);
  float side = step(0.0, diagonal);
  vec2 facet = id * 2.0 + vec2(side, 0.0);
  float seed = hash(facet);

  // The lighting: a breathing of the facet's own, and a diagonal sweep that
  // crosses the tiling.
  float own = 0.5 + 0.5 * sin(uTime * uSpeed * (0.4 + 0.6 * seed) + seed * 6.2832);
  float sweep = 0.5 + 0.5 * sin((id.x - id.y * 0.6) * 0.5 - uTime * uSpeed * 0.8);
  float light = mix(own, sweep, 0.45);

  // The edges: the diagonal and the borders of the cell, a thin line.
  float toDiagonal = abs(diagonal) * 0.7071;
  vec2 toEdge = min(f, 1.0 - f);
  float edge = min(toDiagonal, min(toEdge.x, toEdge.y));
  float joint = 1.0 - smoothstep(px * 0.3, px * 1.2, edge);

  float contrast = clamp(uContrast, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, (0.15 + 0.85 * light) * contrast);
  colour = mix(colour, uColorC, clamp(uTint, 0.0, 1.0) * pow(light, 4.0) * (0.4 + 0.6 * seed));
  colour = mix(colour, uColorA, joint * 0.6);

  gl_FragColor = vec4(colour, 1.0);
}
`
