/**
 * Fireflies shader.
 *
 * ## The mathematical idea
 *
 * One firefly per cell of a grid, its position drawn from the cell's hash,
 * its blinking a sine of its own phase — never a draw per frame, which
 * would produce nothing but noise. The halo is a decaying exponential of
 * the distance, summed over the nine neighbouring cells so that it crosses
 * its cell's edges.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the night background.
 * - `uColorB`, `uColorC` — the two firefly hues, spread by seed.
 * - `uSpeed` — rate of the blinking and of the drift.
 * - `uDensity` — number of cells across the shorter side.
 * - `uGlow` — reach of the halo.
 */
export const FIREFLIES_FRAGMENT = /* glsl */ `
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

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float fireflyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same cell: the second is hashed from a
// shifted point, without which x and y would be tied together.
vec2 fireflyHash2(vec2 p) {
  return vec2(fireflyHash(p), fireflyHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uDensity, 1.0);
  float t = uTime * uSpeed;

  vec2 cell = floor(p);
  vec3 colour = uColorA;

  // The nine neighbouring cells: a halo overflows its cell, and without that
  // sweep it would be cut clean at every mesh edge.
  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 neighbour = cell + vec2(float(dx), float(dy));
      vec2 seed = fireflyHash2(neighbour);

      // The firefly drifts gently around its anchor point: two sines of
      // non-multiple frequencies, so that the orbit never closes exactly on
      // itself.
      vec2 centre = neighbour + 0.5
        + 0.28 * vec2(sin(t * 0.7 + seed.x * 6.28318), cos(t * 0.53 + seed.y * 6.28318));

      // Each firefly blinks at its own phase: the negative half of the sine is
      // crushed, for brief flashes separated by real nights.
      float phase = seed.x * 6.28318;
      float flash = pow(max(sin(t * 1.6 + phase), 0.0), 3.0);

      // Halo: an exponential of the distance, the profile of a point source
      // seen through the air.
      float d = length(p - centre);
      float halo = exp(-d * d / max(uGlow * uGlow * 0.18, 0.0005)) * flash;

      vec3 tint = mix(uColorB, uColorC, fireflyHash(neighbour + 11.0));
      colour += tint * halo;
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
