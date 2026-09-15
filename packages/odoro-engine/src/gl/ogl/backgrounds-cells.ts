/**
 * Background shaders: the tiling family.
 *
 * Four patterns based on the same gesture — fold space onto one cell, and draw
 * only that one. This is what makes the cost independent of the number of
 * cells: whether there are ten or ten thousand on screen, each fragment only
 * evaluates one (or its immediate neighbours, for the cellular tiling).
 *
 * None of these shaders is taken from elsewhere.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Cells: an animated Voronoi tiling.
 *
 * ## The technique
 *
 * Every cell of a regular grid receives a seed placed at random inside itself.
 * A fragment then looks for the nearest seed, testing only its own cell and
 * the eight neighbours — beyond that, a seed can no longer be the nearest,
 * since it is necessarily more than one cell away.
 *
 * Nine tests, whatever the density: that is what makes a Voronoi tiling
 * feasible in real time, whereas computing it through geometry would require a
 * triangulation.
 *
 * ## Why the second distance
 *
 * The distance to the nearest seed gives filled cells. The **difference**
 * between the first and the second distance vanishes exactly where two seeds
 * are equidistant — that is to say, on the edges. This is how the lattice is
 * obtained, without ever building a single edge.
 *
 * The seed moves on a circle rather than at random: a random displacement
 * would take the seeds out of their cell and would break the assumption of the
 * nine neighbours.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uEdge`.
 */
export const CELLS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uEdge;

// Two decorrelated numbers for the same cell: the second offset keeps the
// seeds from aligning on a diagonal.
vec2 odoroSeed(vec2 cell) {
  float a = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(cell, vec2(269.5, 183.3))) * 43758.5453);
  return vec2(a, b);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  vec2 cell = floor(p);
  vec2 local = fract(p);

  float nearest = 8.0;
  float second = 8.0;

  // Nine cells are enough: a seed beyond that is necessarily further than the
  // nearest of the nine, whatever its internal position.
  for (int y = -1; y <= 1; y += 1) {
    for (int x = -1; x <= 1; x += 1) {
      vec2 neighbour = vec2(float(x), float(y));
      vec2 seed = odoroSeed(cell + neighbour);

      // The seed turns on a small circle: it stays inside its cell, which
      // preserves the assumption of the nine neighbours.
      vec2 position = neighbour + 0.5 + 0.36 * vec2(
        sin(t + seed.x * 6.28318),
        cos(t + seed.y * 6.28318)
      );

      float d = length(position - local);

      // Ranking into two values: the minimum, and the next minimum.
      if (d < nearest) {
        second = nearest;
        nearest = d;
      } else if (d < second) {
        second = d;
      }
    }
  }

  // The difference vanishes where two seeds are equidistant: that is exactly
  // the edge, obtained without ever building one.
  float edge = smoothstep(0.0, max(uEdge, 0.01), second - nearest);

  vec3 colour = mix(uColorA, uColorB, nearest * 0.9);
  colour = mix(uColorC, colour, edge);

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Honeycomb: a hexagonal tiling that pulses.
 *
 * ## Folding space onto a hexagon
 *
 * A square folds with `fract`. A hexagon has no direct equivalent: the
 * hexagonal grid is the superposition of two rectangular grids offset by half
 * a lattice cell. Both are therefore evaluated, and the one whose centre is
 * nearest is kept.
 *
 * The `sqrt(3)/2` ratio between the axes is not a setting: it is the height of
 * an equilateral triangle of side one. With any other value, the hexagons are
 * stretched and the tiling leaves holes.
 *
 * The distance used is not Euclidean but **hexagonal** — the maximum of three
 * projections. It is what gives straight edges rather than discs.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uEdge`.
 */
export const HEX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uEdge;

// sqrt(3)/2: the height of an equilateral triangle of side one. Any other
// value stretches the hexagons and leaves holes in the tiling.
const vec2 LATTICE = vec2(1.0, 1.7320508);

// Hexagonal distance: the maximum of three projections, one per pair of
// opposite sides. It gives straight edges where the Euclidean distance would
// give discs.
float odoroHexDistance(vec2 p) {
  p = abs(p);
  return max(p.x * 0.8660254 + p.y * 0.5, p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  // A hexagonal grid is the superposition of two grids offset by half a
  // lattice cell; both are evaluated and the nearest is kept.
  vec2 a = mod(p, LATTICE) - LATTICE * 0.5;
  vec2 b = mod(p - LATTICE * 0.5, LATTICE) - LATTICE * 0.5;
  vec2 local = dot(a, a) < dot(b, b) ? a : b;

  // The identifier of the cell: it offsets the phase, without which all the
  // hexagons would pulse together.
  vec2 cell = p - local;
  float phase = fract(sin(dot(floor(cell), vec2(127.1, 311.7))) * 43758.5453);

  float d = odoroHexDistance(local);
  float pulse = 0.34 + 0.10 * sin(t + phase * 6.28318);
  float shape = smoothstep(pulse + max(uEdge, 0.005), pulse, d);

  gl_FragColor = vec4(mix(uColorA, uColorB, shape), 1.0);
}
`

/**
 * Mosaic: a noise quantised into tiles.
 *
 * ## Why quantise rather than draw tiles
 *
 * Drawing a thousand tiles would require a thousand elements. Evaluating a
 * continuous field **at the centre of the cell** rather than at the current
 * point produces exactly the same result: every fragment of a cell reads the
 * same value, therefore the same colour.
 *
 * The tile exists nowhere in the computation. It appears because the function
 * was sampled coarsely — this is deliberate under-sampling, the exact opposite
 * of what is usually sought.
 *
 * ## The gap
 *
 * Without it, neighbouring tiles of close values blend together and the grid
 * disappears. A thin border drawn from the local coordinate restores it, and
 * its thickness is adjustable independently of the size of the tiles.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uGap`.
 */
export const MOSAIC_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uGap;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  vec2 cell = floor(p);
  vec2 local = fract(p);

  // The field is read at the centre of the cell, never at the current point:
  // every fragment of a tile therefore reads the same value.
  float v = odoroFbm((cell + 0.5) * 0.18 + vec2(t, t * 0.6), 3);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.35, 0.65, v));
  colour = mix(colour, uColorC, smoothstep(0.72, 0.92, v));

  // The gap: without it, two tiles of neighbouring values blend together and
  // the grid disappears.
  vec2 border = min(local, 1.0 - local);
  float gap = smoothstep(0.0, max(uGap, 0.001), min(border.x, border.y));

  gl_FragColor = vec4(colour * (0.35 + 0.65 * gap), 1.0);
}
`

/**
 * Halftone: a screen whose dots grow with the light.
 *
 * ## What this shader imitates
 *
 * Halftone printing renders shades by the **size** of the dots, not by their
 * colour: the screen is two-tone, and it is the coverage ratio that simulates
 * the grey. Reproducing this requires a continuous field, a grid, and a disc
 * whose radius follows the field.
 *
 * ## Why the grid is rotated
 *
 * A screen aligned on the axes of the image beats against the pixel grid of
 * the display, and produces a very visible moire. Printers rotate their
 * screens for the same reason. Fifteen degrees is enough to decorrelate the
 * two grids.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uAngle`.
 */
export const HALFTONE_FRAGMENT = /* glsl */ `
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
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // The field is read before rotation: it is the screen that turns, not the
  // image, exactly as in printing.
  float light = odoroFbm(p * 2.4 + vec2(t, -t * 0.7), 3);

  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 turned = mat2(c, -s, s, c) * p * max(uScale, 1.0);

  vec2 local = fract(turned) - 0.5;
  float radius = length(local);

  // 0.5 is the radius at full coverage of a lattice cell of side one: beyond
  // that the discs overlap and the shade stops progressing. The field is
  // squared: without that compression, half the cells exceed half coverage and
  // the screen becomes a flat tint where nothing registers.
  float target = 0.5 * light * light;

  // The width of the gradient is fixed in lattice units: the dot stays crisp at
  // any density instead of softening when the screen tightens.
  float point = smoothstep(target + 0.03, target - 0.03, radius);

  gl_FragColor = vec4(mix(uColorA, uColorB, point), 1.0);
}
`
