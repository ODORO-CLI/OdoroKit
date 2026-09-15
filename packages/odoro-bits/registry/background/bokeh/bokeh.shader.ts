/**
 * Bokeh shader.
 *
 * ## The mathematical idea
 *
 * Three layers of blurred discs, one disc per cell of a hashed grid.
 * Depth is simulated by the layer: the closer it is, the larger, blurrier
 * and slower its discs are — the reverse of a landscape parallax, because a
 * lens blurs what lies outside the plane of focus, not what lies far away.
 * The edge of each disc is a smoothstep whose width is the blur
 * setting.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the darkness of the background.
 * - `uColorB`, `uColorC` — the two disc hues, spread by seed.
 * - `uSpeed` — lateral drift speed.
 * - `uDensity` — number of cells across the shorter side.
 * - `uBlur` — width of the discs' blurred edge.
 */
export const BOKEH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uBlur;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float bokehHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same cell: the second is hashed from a
// shifted point, without which x and y would be tied together.
vec2 bokehHash2(vec2 p) {
  return vec2(bokehHash(p), bokehHash(p + vec2(37.3, 17.7)));
}

// One layer of discs: the grid is shifted sideways by time, and each pixel
// sums the nine neighbouring cells — a disc overflows its cell, and without
// that sweep it would be sliced at every mesh edge.
vec3 bokehLayer(vec2 uv, float aspect, float t, float depth, vec3 tintA, vec3 tintB) {
  // The closer the layer, the fewer cells it has: its discs are larger,
  // blurrier and slower — the rendering of a lens, not of a
  // landscape.
  float mesh = max(uDensity, 1.0) * (1.0 - 0.26 * depth);
  float drift = t * (0.5 - 0.14 * depth) * (mod(depth, 2.0) * 2.0 - 1.0);

  vec2 p = vec2(uv.x * aspect + drift, uv.y + depth * 7.31) * mesh;
  vec2 cell = floor(p);
  vec3 sum = vec3(0.0);

  float radius = 0.22 + 0.14 * depth;
  float blur = clamp(uBlur, 0.05, 1.0) * (0.28 + 0.3 * depth);
  float veil = 0.55 - 0.12 * depth;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 neighbour = cell + vec2(float(dx), float(dy));
      vec2 seed = bokehHash2(neighbour);

      // The disc floats inside its cell, at a hashed point: the grid no longer
      // reads as a grid.
      vec2 centre = neighbour + 0.5 + (seed - 0.5) * 0.6;
      float d = length(p - centre);

      // The blurred edge: a smoothstep whose width is the setting. It is a lens'
      // circle of confusion, not a decorative gradient.
      float disc = smoothstep(radius, radius - max(blur * radius, 0.02), d);

      // Some cells stay empty: a bokeh packed to bursting reads as a texture,
      // not as lights.
      float presence = step(0.35, bokehHash(neighbour + 5.0));

      vec3 tint = mix(tintA, tintB, bokehHash(neighbour + 11.0));
      sum += tint * disc * presence * veil;
    }
  }

  return sum;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  colour += bokehLayer(vUv, aspect, t, 0.0, uColorB, uColorC);
  colour += bokehLayer(vUv, aspect, t, 1.0, uColorB, uColorC);
  colour += bokehLayer(vUv, aspect, t, 2.0, uColorC, uColorB);

  gl_FragColor = vec4(colour, 1.0);
}
`
