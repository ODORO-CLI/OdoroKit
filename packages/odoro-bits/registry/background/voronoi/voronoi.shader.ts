/**
 * Voronoi cells shader.
 *
 * ## The mathematical idea
 *
 * One seed per cell of a grid, moved around its anchor point by two sines
 * each with their own phase. The first pass finds, among the nine
 * neighbouring cells, the seed closest to the fragment.
 *
 * The second pass gives the exact distance to the edge: for each other seed,
 * the distance from the fragment to the perpendicular bisector between it and
 * the closest seed, keeping the smallest. That is what sets this background
 * apart from the cellular tiling, which approximates the edge by the
 * difference of the first two distances — an approximation that thickens in
 * the corners. Here the edge has the same width everywhere, and a glow can
 * hang onto it.
 *
 * Each cell carries a shade drawn from its identifier, and its seed shines as
 * a dot: the tiling reads like stained glass, not like noise.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the edges and the seeds.
 * - `uColorC` — the tint of the cells.
 * - `uSpeed` — drift speed of the seeds.
 * - `uDensity` — number of cells over the height.
 * - `uGlow` — reach of the edge glow, in cells.
 * - `uRange` — radius of the second pass (1 or 2), and therefore the cost.
 */
export const VORONOI_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uGlow;
uniform float uRange;

// Two decorrelated pseudo-random numbers for a cell.
vec2 vorHash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}

// Position of a cell's seed, drifting around its anchor point.
vec2 vorSeed(vec2 cell) {
  vec2 h = vorHash2(cell);
  return cell + 0.5 + 0.38 * sin(uTime * uSpeed + 6.2831853 * h);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uDensity, 1.0);
  vec2 n = floor(p);
  vec2 f = fract(p);

  // First pass: the closest seed among the nine neighbours.
  float md = 8.0;
  vec2 mr = vec2(0.0);
  vec2 mg = vec2(0.0);
  for (int j = -1; j <= 1; j += 1) {
    for (int i = -1; i <= 1; i += 1) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = vorSeed(n + g) - n - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // Second pass: exact distance to the edge, through the perpendicular
  // bisectors. Constant bounds; low quality skips the outer ring.
  float range = clamp(uRange, 1.0, 2.0) + 0.5;
  float edge = 8.0;
  for (int j = -2; j <= 2; j += 1) {
    for (int i = -2; i <= 2; i += 1) {
      if (abs(float(i)) > range || abs(float(j)) > range) continue;
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = vorSeed(n + g) - n - f;
      vec2 diff = r - mr;
      if (dot(diff, diff) > 0.00001) {
        edge = min(edge, dot(0.5 * (mr + r), normalize(diff)));
      }
    }
  }

  vec2 id = n + mg;
  vec2 tint = vorHash2(id + 7.3);

  // The cell: a shade of its own, darker towards the edge.
  float depth = smoothstep(0.0, 0.5, edge);
  vec3 cell = mix(uColorA, uColorC, (0.18 + 0.3 * tint.x) * (0.6 + 0.4 * depth));

  // The edge: a crisp stroke, and a glow fading away from it.
  float px = max(uDensity, 1.0) / max(uResolution.y, 1.0) * 1.5;
  float line = 1.0 - smoothstep(0.0, px * 2.0, edge);
  float halo = exp(-edge / max(uGlow, 0.005)) * 0.55;

  // The seed: a dot pulsing gently, offset per cell.
  float seed = exp(-dot(mr, mr) / 0.0025) * (0.6 + 0.4 * sin(uTime * 2.0 + tint.y * 6.2831853));

  vec3 colour = cell;
  colour += uColorB * (halo + seed * 0.8);
  colour = mix(colour, uColorB, line);

  gl_FragColor = vec4(colour, 1.0);
}
`
