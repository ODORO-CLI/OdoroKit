/**
 * Shader of the pollen.
 *
 * ## The mathematical idea
 *
 * Two planes, and that is all there is to the depth. The far plane is a
 * tight scatter of small, sharp grains: a disc with a soft edge. The near
 * plane is a loose scatter of large, blurred grains: a wide, pale gaussian,
 * which is what an object out of the focal plane gives. Both drift slowly,
 * the near one a little faster than the far one.
 *
 * The pointer shifts the two planes against its motion, the near one more
 * than the far one: that is the parallax, and it is what makes the eye read
 * the two planes as two distances rather than as two sizes.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the far grains, sharp.
 * - `uColorC` — the near grains, blurred.
 * - `uPointer` — damped position of the pointer, centred, bounded to [-1, 1].
 * - `uSpeed` — speed of the drift.
 * - `uDensity` — number of cells over the height of the far plane.
 * - `uBlur` — blur of the near plane.
 * - `uParallax` — amplitude of the shift under the pointer.
 * - `uSpread` — radius in cells walked around the current cell; zero at low
 *   quality, where a grain no longer spills out of its cell.
 */
export const POLLEN_FRAGMENT = /* glsl */ `
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
uniform float uBlur;
uniform float uParallax;
uniform float uSpread;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float pollenHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for one and the same cell.
vec2 pollenHash2(vec2 p) {
  return vec2(pollenHash(p), pollenHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;

  // Plane 0: far, sharp. Plane 1: near, blurred.
  for (int plane = 0; plane < 2; plane += 1) {
    float nearPlane = float(plane);
    float scale = max(uDensity, 2.0) * (1.0 - nearPlane * 0.55);

    // The near one shifts more than the far one: that is the whole parallax.
    vec2 offset = uPointer * uParallax * (0.02 + nearPlane * 0.06);

    // The pollen barely falls and drifts sideways; the near one goes faster.
    vec2 drift = vec2(t * (0.03 + nearPlane * 0.05), -t * (0.02 + nearPlane * 0.04));
    vec2 p = (uv + offset) * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        // At low quality, only the current cell is read.
        if (abs(float(dx)) > uSpread || abs(float(dy)) > uSpread) continue;

        vec2 neighbour = cell + vec2(float(dx), float(dy));
        vec2 seed = pollenHash2(neighbour + nearPlane * 83.0);
        float exists = step(0.25, pollenHash(neighbour + 7.0 + nearPlane * 9.0));

        vec2 centre = neighbour + 0.5
          + 0.3 * vec2(sin(t * 0.5 + seed.x * 6.28318), cos(t * 0.4 + seed.y * 6.28318));

        float d = length(p - centre);
        float size = (0.06 + 0.05 * seed.x) * (1.0 + nearPlane * (1.5 + uBlur * 2.0));

        // Sharp: a disc with a soft edge. Blurred: a wide, pale gaussian, the
        // paler the stronger the blur — the light spreads out.
        float sharp = 1.0 - smoothstep(size * 0.6, size, d);
        float blurred = exp(-d * d / (size * size)) * 0.6 / (1.0 + uBlur);
        float shape = mix(sharp, blurred, nearPlane);

        colour += mix(uColorB, uColorC, nearPlane) * shape * exists * (0.8 - nearPlane * 0.25);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
