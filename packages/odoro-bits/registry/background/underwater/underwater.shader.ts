/**
 * Shader of the underwater rays.
 *
 * ## The mathematical idea
 *
 * The light comes in through the surface, above the frame: the rays converge
 * towards a point placed beyond the top edge, so that they are nearly
 * parallel but open out slightly on the way down, as under a real surface.
 * Their intensity is a 1D noise of the angle in two harmonics, whose phases
 * undulate — the surface moves, the rays sway — and they die away with depth.
 *
 * The bubbles rise in columns: one per cell, its size, its rate and its sway
 * drawn from the index of the column. Each is a thin ring and a highlight dot
 * offset towards the light — it is that dot which makes the bubble, a ring on
 * its own is only a circle. Two depths, the far one smaller and slower.
 *
 * The depth tints the bottom of the frame by a bounded mix: the water colours
 * a light background without blackening it.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the light of the rays and of the bubbles.
 * - `uColorC` — the tint of the depth.
 * - `uSpeed` — speed of the sway and of the rise.
 * - `uRays` — number of rays over the width.
 * - `uBubbles` — number of bubble columns over the height; zero removes them.
 */
export const UNDERWATER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRays;
uniform float uBubbles;

float waterHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// One depth of bubbles: one column per cell, one bubble per column.
float bubbles(vec2 p, float t, float density, float size, float seed) {
  float x = p.x * density + seed;
  float column = floor(x);
  float h1 = waterHash(vec2(column, seed));
  float h2 = waterHash(vec2(column + 5.3, seed * 2.1));
  float h3 = waterHash(vec2(column + 11.7, seed * 3.3));

  // Every other column is empty: an even swarm would read as a grid.
  float active = step(0.45, h1);

  // The rise, looped; the sway, a sine of the height.
  float y = fract(t * (0.06 + 0.08 * h2) + h1) * 1.3 - 0.15;
  // The sway stays inside the cell, radius included: a bubble cut off at the
  // edge of a column would give the grid away.
  float cx = 0.5 + 0.12 * sin(y * 9.0 + h3 * 6.2831853);
  float radius = size * (0.5 + 0.5 * h3) / density;

  vec2 centre = vec2((column - seed + cx) / density, y);
  float d = length(p - centre);

  float e = (d - radius) / (radius * 0.28);
  float ring = exp(-e * e);

  vec2 highlight = centre + vec2(-radius * 0.35, radius * 0.4);
  vec2 dr = p - highlight;
  float point = exp(-dot(dr, dr) / (radius * radius * 0.06));

  return active * (ring * 0.6 + point * 0.9);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  // The depth: the tint thickens towards the bottom, without ever going past
  // half — text placed over it stays readable.
  float depth = 1.0 - vUv.y;
  vec3 colour = mix(uColorA, uColorC, 0.12 + 0.38 * depth);

  // The rays: they converge towards the surface, above the frame, and sway
  // because their phases undulate.
  vec2 surface = vec2(aspect * 0.5, 1.9);
  vec2 offset = p - surface;
  float angle = atan(offset.x, -offset.y);
  float n = max(uRays, 1.0);
  float ray = 0.5 + 0.5 * sin(angle * n * 4.0 + 0.6 * sin(t * 0.7 + angle * 7.0) + t * 0.25);
  ray = ray * 0.6 + 0.4 * (0.5 + 0.5 * sin(angle * n * 9.0 - t * 0.4 + 0.8 * cos(t * 0.5)));
  ray = pow(ray, 3.0);
  float light = ray * (0.25 + 0.75 * vUv.y) * smoothstep(0.0, 0.85, vUv.y);
  colour = mix(colour, uColorB, clamp(light * 0.8, 0.0, 1.0));

  // The bubbles, over two depths; the far one smaller and slower.
  float density = uBubbles;
  if (density >= 0.5) {
    float swarm = bubbles(p, t, density, 0.36, 0.0);
    swarm += 0.55 * bubbles(p, t * 0.7, density * 1.7, 0.24, 0.43);
    colour = mix(colour, uColorB, clamp(swarm, 0.0, 1.0) * 0.9);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
