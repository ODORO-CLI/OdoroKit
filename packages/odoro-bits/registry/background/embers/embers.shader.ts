/**
 * Shader for the embers.
 *
 * ## The mathematical idea
 *
 * One ember per cell of a hashed grid, across three layers of depth. The grid
 * descends — each column at its own speed — so the embers rise, at paces that
 * are close but never identical. Each one sways sideways on a sine of hashed
 * phase.
 *
 * What sets an ember apart from an inverted snowflake is that it goes out: its
 * light is a function of its height in the frame, full at the bottom, nil
 * before the top. It is computed on the ember's position, not the fragment's,
 * so that an ember goes out as one whole and not in slices. The twinkle is a
 * fast sine of its own phase; the hue slides from the body to the hot tip when
 * the ember is at once low and bright.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the embers, and the glow of the ground.
 * - `uColorC` — the hot tip of the bright embers.
 * - `uSpeed` — speed of the rise.
 * - `uDensity` — number of cells over the height, for the near layer.
 * - `uGlow` — reach of the soft halo around each ember.
 * - `uLayers` — number of layers evaluated, and so the cost.
 */
export const EMBERS_FRAGMENT = /* glsl */ `
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
uniform float uLayers;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float emberHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same cell.
vec2 emberHash2(vec2 p) {
  return vec2(emberHash(p), emberHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  vec3 colour = uColorA;

  // The glow of the hearth, at the bottom of the frame: where the embers come
  // from.
  colour += uColorB * 0.10 * pow(1.0 - vUv.y, 3.0);

  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.55);
    float rise = 1.0 - depth * 0.3;

    vec2 p = uv * scale;

    // One speed per column: two neighbouring embers never rise in step, which
    // would otherwise let the grid be read.
    float column = floor(p.x);
    float rate = (0.7 + 0.6 * emberHash(vec2(column, depth))) * rise;
    p.y -= t * rate;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 neighbour = cell + vec2(float(dx), float(dy));
        vec2 seed = emberHash2(neighbour + depth * 71.0);
        float exists = step(0.35, emberHash(neighbour + 5.0 + depth));

        float sway = 0.3 * sin(t * 0.9 + seed.x * 6.28318 + neighbour.y * 0.5);
        vec2 centre = neighbour + vec2(0.5 + sway, 0.5);

        // Height of the ember in the frame: that is what puts it out.
        float height = (centre.y + t * rate) / scale;
        float life = pow(clamp(1.0 - height, 0.0, 1.0), 1.4);

        float flicker = 0.55 + 0.45 * sin(t * 6.0 * (0.6 + seed.y) + seed.x * 6.28318);

        float d = length(p - centre);
        float size = (0.05 + 0.06 * seed.y) * (1.0 - depth * 0.3);
        float core = exp(-d * d / (size * size));
        float halo = 0.25 * exp(-d * d / (size * size * max(uGlow, 0.1) * max(uGlow, 0.1) * 6.0));

        vec3 tint = mix(uColorB, uColorC, flicker * life);
        colour += tint * (core + halo) * life * flicker * exists * (1.0 - depth * 0.3);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
