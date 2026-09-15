/**
 * Shader of the shape grid.
 *
 * ## The mathematical idea
 *
 * One shape per cell, chosen among three by a hash of the cell: a disc, a
 * square, an equilateral triangle. Each is a signed distance field, which gives
 * a crisp edge at any size and an anti-aliasing of a single `smoothstep`.
 *
 * Each shape turns at its own speed, in its own direction, and breathes to a
 * sine of its own phase: two neighbouring shapes are never in phase, and the
 * grid does not read as a texture turning as one block. The hue is placed
 * between the two colours according to a second hash.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB`, `uColorC` — the two hues between which each shape is placed.
 * - `uSpeed` — average rotation speed.
 * - `uDensity` — number of cells across the height.
 * - `uSize` — radius of the shapes, as a fraction of the cell.
 */
export const SHAPE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uSize;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float shapeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 shapeRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Centred equilateral triangle, of radius r.
float shapeTriangle(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  float h1 = shapeHash(cell);
  float h2 = shapeHash(cell + vec2(37.3, 17.7));
  float h3 = shapeHash(cell + vec2(91.1, 53.9));

  // Its own direction and speed, its own phase: nothing turns as one block.
  float direction = h2 < 0.5 ? -1.0 : 1.0;
  float angle = uTime * uSpeed * direction * (0.6 + 0.8 * h3) + h1 * 6.2831853;
  float breath = 0.85 + 0.15 * sin(uTime * 1.3 + h2 * 6.2831853);
  float r = max(uSize, 0.02) * breath;

  vec2 q = shapeRotate(local, angle);

  float kind = floor(h1 * 3.0);
  float d;
  if (kind < 1.0) {
    d = length(q) - r;
  } else if (kind < 2.0) {
    d = max(abs(q.x), abs(q.y)) - r * 0.85;
  } else {
    d = shapeTriangle(q, r * 1.1);
  }

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float fill = 1.0 - smoothstep(-px, px, d);

  vec3 tint = mix(uColorB, uColorC, h3);
  vec3 colour = mix(uColorA, tint, fill);

  gl_FragColor = vec4(colour, 1.0);
}
`
