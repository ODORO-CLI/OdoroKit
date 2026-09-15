/**
 * Shader of the field of particles.
 *
 * ## The mathematical idea
 *
 * One particle per cell of a hashed grid, on two layers of different scale
 * for depth. Every layer slides in a direction of its own, and every particle
 * orbits gently around its anchor point on two sines whose frequencies are
 * not multiples of one another: the drift never repeats to the eye.
 *
 * At rest, the particles are three quarters extinguished. The sparkle comes
 * from the pointer: a soft window around its damped position gives back its
 * full light to every particle it covers, and pulls it towards the sparkle
 * hue. It is the position of the particle that is tested, not that of the
 * fragment — the sparkle lights up whole particles, it does not cut a crisp
 * disc out of the field.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the particles at rest.
 * - `uColorC` — the sparkle under the pointer.
 * - `uPointer` — damped position of the pointer, in texture coordinates.
 * - `uSpeed` — speed of the drift.
 * - `uDensity` — number of cells over the height, for the near layer.
 * - `uRadius` — radius of the sparkle, in frame heights.
 * - `uLayers` — number of layers evaluated, and therefore the cost.
 */
export const PARTICLE_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uDensity;
uniform float uRadius;
uniform float uLayers;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float fieldHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for one and the same cell.
vec2 fieldHash2(vec2 p) {
  return vec2(fieldHash(p), fieldHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 2.0));

  vec3 colour = uColorA;

  // Two layers: the near one is looser and coarser, the far one tighter and
  // finer. Constant bounds, early exit driven by the quality.
  for (int layer = 0; layer < 2; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.8);

    // Every layer drifts in its own direction, the far one more slowly.
    vec2 drift = vec2(0.07 - depth * 0.05, 0.04 + depth * 0.02) * t;
    vec2 p = uv * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 neighbour = cell + vec2(float(dx), float(dy));
        vec2 seed = fieldHash2(neighbour + depth * 53.0);

        vec2 centre = neighbour + 0.5
          + 0.32 * vec2(sin(t * 0.61 + seed.x * 6.28318), cos(t * 0.47 + seed.y * 6.28318));

        // The position of the particle in frame coordinates, so as to compare
        // it with the pointer: the sparkle lights up whole particles.
        vec2 world = (centre - drift) / scale;
        float boost = 1.0 - smoothstep(0.0, max(uRadius, 0.01), length(world - m));

        float d = length(p - centre);
        float size = (0.05 + 0.05 * seed.x) * (1.0 - depth * 0.4);
        float halo = exp(-d * d / (size * size));

        // At rest, a quarter of the light; under the pointer, all of it.
        float light = mix(0.25, 1.4, boost) * (1.0 - depth * 0.35);
        vec3 tint = mix(uColorB, uColorC, boost);
        colour += tint * halo * light;
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
