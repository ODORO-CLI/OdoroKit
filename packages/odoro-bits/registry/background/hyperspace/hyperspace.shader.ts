/**
 * Hyperspace shader.
 *
 * ## The mathematical idea
 *
 * The frame is read in polar coordinates from its centre, the vanishing
 * point. The angle cuts the plane into rays; along each ray, the distance is
 * read as a logarithm: a cell of constant length in that domain is tiny near
 * the centre and wide at the edge, which is exactly the perspective of an
 * object rushing towards the camera. Time translates that domain outwards,
 * and each hashed cell either carries a star or does not.
 *
 * The trail is a ramp along the cell: a sharp head at the front, a tail dying
 * out behind, of a length that grows with the speed — at a standstill one
 * would see dots, at full speed strokes. The thickness is measured as a real
 * distance to the ray, not as an angle, so that the stroke stays as fine near
 * the centre as at the edge.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the trails.
 * - `uColorC` — the warm head of the trails.
 * - `uSpeed` — speed of the rush towards the camera.
 * - `uDensity` — number of rays around one turn, for the near layer.
 * - `uStretch` — extra lengthening of the trails, beyond what the speed gives.
 * - `uLayers` — number of layers evaluated, and so the cost.
 */
export const HYPERSPACE_FRAGMENT = /* glsl */ `
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
float hyperHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  vec3 colour = uColorA;

  // The trail length follows the speed: that is what makes the rush read as
  // an acceleration rather than as a rain of dots.
  float len = clamp(0.12 + uStretch * uSpeed * 0.35, 0.05, 0.95);

  // Three layers of rays, offset in angle and in cadence: without them, the
  // stars of one same ray would all come out of the same hole.
  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float n = max(uDensity, 8.0) * (1.0 + depth * 0.5);

    float ang = (a + depth * 1.7) / 6.28318 * n;
    float ray = floor(ang);

    // Offset from the ray as a real distance: residual angle times radius.
    // The stroke thus keeps the same fineness at any distance from the centre.
    float lateral = (fract(ang) - 0.5) * (6.28318 / n) * r;

    // Distance as a logarithm, translated by time: the cell flees outwards
    // while accelerating, as perspective demands.
    float z = log(max(r, 0.01)) * 3.0 - t * (1.0 + depth * 0.35) + hyperHash(vec2(ray, 3.7 + depth)) * 97.0;
    float id = floor(z);
    float f = fract(z);
    float seed = hyperHash(vec2(ray, id) + depth * 31.0);

    // Roughly one cell in two carries a star.
    float exists = step(0.5, seed);

    // A sharp head at the front of the cell, a tail dying out behind.
    float along = smoothstep(1.0 - len, 1.0, f) * (1.0 - smoothstep(0.97, 1.0, f));

    float width = 0.0025 + 0.002 * seed;
    float across = exp(-lateral * lateral / (width * width));

    // Near the vanishing point the stars are still far away: invisible.
    float approach = smoothstep(0.03, 0.5, r);

    float bright = exists * along * across * approach * (1.0 - depth * 0.3);
    vec3 tint = mix(uColorB, uColorC, smoothstep(0.85, 1.0, f));
    colour += tint * bright;
  }

  // A faint glow at the vanishing point: where everything converges.
  colour += uColorB * 0.12 * exp(-r * r / 0.02);

  gl_FragColor = vec4(colour, 1.0);
}
`
