/**
 * Spiral galaxy shader.
 *
 * ## The mathematical idea
 *
 * The plane is read in polar form from the centre, then twisted: the angle
 * is increased by the logarithm of the radius times a twist. In that
 * domain, a radial straight line becomes a logarithmic spiral — the shape
 * of the observed arms — and a cosine of the twisted angle, raised to a
 * power, gives the arms themselves: bright on the crest, nearly empty between.
 *
 * The points are hashed per cell in that twisted domain, but their halo is
 * measured in real distance after the return to the plane: a disc stays a
 * disc, where a distance measured in the polar domain would give points
 * ever more stretched towards the edge. The angular domain is periodic by
 * construction — the cells are taken modulo their number — so that the seam
 * of the arc tangent is never seen.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the points of the arms.
 * - `uColorC` — the core and the points near the core.
 * - `uSpeed` — speed of the rotation.
 * - `uArms` — number of arms.
 * - `uTwist` — twist of the arms; higher means more tightly wound.
 * - `uDensity` — number of radial cells.
 * - `uLayers` — number of layers evaluated, and so the cost.
 */
export const GALAXY_SPIRAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uArms;
uniform float uTwist;
uniform float uDensity;
uniform float uLayers;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float galaxyHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same cell.
vec2 galaxyHash2(vec2 p) {
  return vec2(galaxyHash(p), galaxyHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // The overall rotation: slow, and it is the plane that turns, not the
  // points one by one — a single cosine for the whole picture.
  float c = cos(t * 0.12);
  float s = sin(t * 0.12);
  vec2 v = mat2(c, -s, s, c) * uv;

  float r = length(v);
  float a = atan(v.y, v.x);
  float arms = max(floor(uArms + 0.5), 1.0);
  int layers = int(clamp(uLayers, 1.0, 2.0));

  vec3 colour = uColorA;

  for (int layer = 0; layer < 2; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 4.0) * (1.0 + depth * 0.9);

    // A whole number of angular cells: that is what makes the domain periodic
    // and erases the seam of the arc tangent.
    float K = floor(scale * 1.2);

    float phi = a + uTwist * log(max(r, 0.02));
    vec2 q = vec2(r * scale, phi / 6.28318 * K);
    vec2 cell = floor(q);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 neighbour = cell + vec2(float(dx), float(dy));
        vec2 key = vec2(neighbour.x, mod(neighbour.y, K)) + depth * 47.0;
        vec2 seed = galaxyHash2(key);
        float exists = step(0.3, galaxyHash(key + 5.0));

        // Position in the twisted domain, with a slow drift of its own.
        vec2 centreQ = neighbour + 0.5
          + 0.36 * vec2(sin(t * 0.4 + seed.x * 6.28318), cos(t * 0.33 + seed.y * 6.28318));

        // Back to the plane: that is where the halo is measured, in real distance.
        float r0 = centreQ.x / scale;
        float phi0 = centreQ.y / K * 6.28318;
        float a0 = phi0 - uTwist * log(max(r0, 0.02));
        vec2 xy0 = r0 * vec2(cos(a0), sin(a0));

        float d = length(v - xy0);
        float size = (0.004 + 0.006 * seed.x) * (1.0 - depth * 0.35);
        float halo = exp(-d * d / (size * size));

        // The arms: one crest per arm, empty between two.
        float armMask = mix(0.06, 1.0, pow(0.5 + 0.5 * cos(phi0 * arms), 3.0));

        // The density falls off with the radius, and the flicker is each point's own.
        float falloff = exp(-r0 * 2.2);
        float flicker = 0.7 + 0.3 * sin(t * 2.0 + seed.y * 6.28318);

        vec3 tint = mix(uColorB, uColorC, smoothstep(0.35, 0.0, r0));
        colour += tint * halo * armMask * falloff * flicker * exists * (1.0 - depth * 0.3);
      }
    }
  }

  // The core: a tight nucleus and a broader halo, both at the centre.
  colour += uColorC * exp(-r * r / 0.006) * 0.9;
  colour += uColorB * exp(-r * r / 0.05) * 0.3;

  gl_FragColor = vec4(colour, 1.0);
}
`
