/**
 * Shader of the snow.
 *
 * ## The mathematical idea
 *
 * Three layers of flakes, one per cell of a hashed grid. The fall is a vertical
 * translation of the grid — the near layers fall faster and bigger, that is the
 * parallax — and every flake drifts sideways on a sine whose phase is hashed:
 * two neighbouring flakes never sway together. The flake is a halo exponential
 * in the distance, summed over the nine neighbouring cells.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the winter night.
 * - `uColorB` — the distant flakes, bluish.
 * - `uColorC` — the near flakes, white.
 * - `uSpeed` — speed of the fall.
 * - `uDensity` — number of cells across the shorter side.
 * - `uDrift` — amplitude of the sideways sway.
 */
export const SNOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uDrift;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float snowHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for one cell: the second is hashed from an offset
// point, without which x and y would be tied together.
vec2 snowHash2(vec2 p) {
  return vec2(snowHash(p), snowHash(p + vec2(37.3, 17.7)));
}

// One layer of flakes: the grid descends with time, and every pixel sums the
// nine neighbouring cells — a halo overflows its cell, and without that walk it
// would be sliced at every cell boundary.
vec3 snowLayer(vec2 uv, float aspect, float t, float depth, vec3 tint, float glint) {
  // Near: fewer cells, hence bigger flakes, and a faster fall. It is the
  // parallax that makes the depth read.
  float cellSize = max(uDensity, 2.0) * (1.6 - 0.4 * depth);
  float fall = t * (0.6 + 0.5 * depth);

  vec2 p = vec2(uv.x * aspect, uv.y + fall + depth * 3.17) * cellSize;
  vec2 cell = floor(p);
  vec3 total = vec3(0.0);

  float reach = 0.012 + 0.01 * depth;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 neighbour = cell + vec2(float(dx), float(dy));
      vec2 seed = snowHash2(neighbour);

      // The sideways drift: one sine per flake, with hashed phase and
      // frequency — two neighbours never sway in unison.
      float sway = uDrift * 0.4 * sin(t * (0.6 + seed.x * 0.8) + seed.y * 6.28318);

      vec2 centre = neighbour + 0.5 + (seed - 0.5) * 0.6 + vec2(sway, 0.0);
      vec2 offset = p - centre;

      // The flake: a halo exponential in the squared distance, the profile of a
      // point of light softened by the air.
      float halo = exp(-dot(offset, offset) / reach);

      total += tint * halo * glint * (0.5 + 0.5 * seed.x);
    }
  }

  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  colour += snowLayer(vUv, aspect, t, 0.0, uColorB, 0.35);
  colour += snowLayer(vUv, aspect, t, 1.0, mix(uColorB, uColorC, 0.5), 0.55);
  colour += snowLayer(vUv, aspect, t, 2.0, uColorC, 0.8);

  gl_FragColor = vec4(colour, 1.0);
}
`
