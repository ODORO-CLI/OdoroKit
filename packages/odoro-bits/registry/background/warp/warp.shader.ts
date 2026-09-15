/**
 * Hyperspace shader.
 *
 * ## The mathematical idea
 *
 * In polar coordinates, a star rushing towards the observer only moves along
 * the radius: its angular heading is fixed. The grid is therefore laid on
 * (angle, 1/r) — the inverse of the radius makes the perspective — and time
 * does nothing but slide the radial coordinate. The stretch is a power tail
 * along that same coordinate, and three offset grids make the three depths.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the tint of the near stars.
 * - `uColorC` — the tint of the distant stars.
 * - `uSpeed` — speed of the radial scroll.
 * - `uDensity` — number of angular lanes in the first layer.
 * - `uStretch` — length of the trails, from 0 to 1.
 * - `uLayers` — number of depth layers, from 1 to 3.
 */
export const WARP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uStretch;
uniform float uLayers;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float warpHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float r = length(p);
  float a = atan(p.y, p.x) / 6.28318 + 0.5;
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  float layers = clamp(uLayers, 1.0, 3.0);

  for (int i = 0; i < 3; i += 1) {
    if (float(i) >= layers) break;

    float depth = float(i);

    // Each layer has its own number of lanes, an integer so that the hash
    // joins up again at the angular seam, and its own speed: the near layers
    // scroll faster, and that is the whole parallax.
    float lanes = floor(max(uDensity, 4.0)) + depth * 7.0;
    float speed = 1.0 - depth * 0.35;

    // The perspective: 1/r sends the edge of the screen close to zero and the
    // centre to infinity. Moving forward is sliding that coordinate.
    float sx = a * lanes;
    float q = (0.35 / (r + 0.08) - t * speed) * 3.0;

    vec2 cell = vec2(mod(floor(sx), lanes), floor(q));
    float seed = warpHash(cell + depth * 13.0);

    // Roughly one lane in four carries a star: the threshold thins them out.
    float presence = step(0.72, seed);

    // A thin stroke in angle, a power tail along the radius: the exponent
    // decays with the stretch, so the trail lengthens.
    float fx = fract(sx) - 0.35 - 0.3 * warpHash(cell + 5.0);
    float width = exp(-fx * fx * 320.0);
    float trail = pow(1.0 - fract(q), 1.0 / max(uStretch * (0.4 + 0.6 * min(uSpeed, 1.5)), 0.03));

    // The stars are born away from the centre: at the exact vanishing point,
    // everything piles up and would only make one crackling pixel.
    float birth = smoothstep(0.04, 0.35, r);

    vec3 tint = mix(uColorB, uColorC, depth * 0.5);
    colour += tint * presence * width * trail * birth * (1.0 - depth * 0.3);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
