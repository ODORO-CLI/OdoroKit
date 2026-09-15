/**
 * Cursor grid shader.
 *
 * ## The mathematical idea
 *
 * A grid of tiles, and two distances instead of one: from the tile's centre
 * to the live pointer, and from the same centre to the lagged pointer. The
 * first lights up, the second leaves a trail behind the gesture — two
 * positions are enough where a history buffer would otherwise be needed for
 * a per-tile fade.
 *
 * The distance is neither the disc nor the square but a mix of the two: a
 * round halo would ignore the grid it lights, a square halo would copy it
 * too faithfully. Halfway between, the patch stays round while still
 * leaning on the tiles.
 *
 * Each tile breathes at its own phase, drawn from its cell coordinates:
 * without that the sheet would light up all at once, like a screen.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the grid's line, and the trail.
 * - `uColorC` — the lit tiles.
 * - `uPointer` — live pointer position, in texture coordinates.
 * - `uEcho` — lagged pointer position, same frame.
 * - `uCells` — number of cells across the height.
 * - `uRadius` — reach of the lighting, in frame heights.
 * - `uTrail` — strength of the trail, between zero and one.
 */
export const CURSOR_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform vec2 uEcho;
uniform float uCells;
uniform float uRadius;
uniform float uTrail;

// A cell's own phase, stable from one frame to the next.
float cellPhase(vec2 cell) {
  return fract(sin(dot(cell, vec2(41.7, 289.3))) * 24634.6345);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uCells, 3.0, 48.0);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  vec2 centre = (cell + 0.5) / scale;
  vec2 live = uPointer * vec2(aspect, 1.0);
  vec2 lagged = uEcho * vec2(aspect, 1.0);
  float reach = max(uRadius, 0.05);

  // The mix of the square and the disc: neither one quite.
  vec2 dLive = abs(centre - live);
  float nearLive = mix(max(dLive.x, dLive.y), length(dLive), 0.55);
  vec2 dLagged = abs(centre - lagged);
  float nearLagged = mix(max(dLagged.x, dLagged.y), length(dLagged), 0.55);

  float lit = 1.0 - smoothstep(reach * 0.2, reach, nearLive);
  float trail =
    (1.0 - smoothstep(reach * 0.4, reach * 1.4, nearLagged)) * clamp(uTrail, 0.0, 1.0);

  // Each tile breathes at its phase: the sheet does not light up all at once.
  lit *= 0.6 + 0.4 * (0.5 + 0.5 * sin(uTime * 2.0 + cellPhase(cell) * 6.2831853));

  // The tile and its line, drawn from the same hollow: the distance to the
  // cell's edge, zero on the stroke, greatest at the centre.
  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float inset = 0.5 - max(abs(local.x), abs(local.y));
  float tile = smoothstep(0.0, 0.05, inset - 0.07);
  float line = 1.0 - smoothstep(px, px * 3.0, abs(inset - 0.05));

  vec3 colour = mix(uColorA, uColorB, line * 0.35);
  colour = mix(colour, uColorB, tile * trail * 0.55);
  colour = mix(colour, uColorC, tile * lit);

  gl_FragColor = vec4(colour, 1.0);
}
`
