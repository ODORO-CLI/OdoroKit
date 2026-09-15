/**
 * Shader fragments written from first principles.
 *
 * Every function carries the explanation of the technique used and of its
 * parameters. Nothing is taken from an implementation found online: published
 * shaders often come under restrictive licences, and the underlying
 * mathematics is in any case shorter to re-derive than to clear legally.
 *
 * @module
 */

/**
 * Vertex of a triangle covering the screen.
 *
 * A single triangle rather than two: the diagonal of a quad makes the
 * fragments along it be processed twice, and a triangle that overflows the
 * screen has no such seam.
 */
export const FULLSCREEN_VERTEX = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Value noise and sum of octaves.
 *
 * ## The principle
 *
 * Value noise associates a pseudo-random number with every point of an integer
 * grid, then interpolates between the four corners of the cell you are in. The
 * interpolation is not linear but smoothed by the polynomial `3t2 - 2t3`,
 * whose derivative vanishes at both ends: without it, the edges of the grid
 * would stay visible as a lattice.
 *
 * The pseudo-random number comes from a hash function: the point is projected
 * onto an arbitrary direction, the sine is taken, multiplied by a large number
 * and only the fractional part is kept. This is not randomness, but it is
 * deterministic, piecewise continuous and without a perceptible pattern —
 * which is enough.
 *
 * ## The sum of octaves
 *
 * A single noise is too regular. Several are superposed, each twice as fine
 * and twice as weak as the previous one. The result looks the same at every
 * scale, which is precisely the look of natural things — clouds, terrain,
 * veins.
 *
 * The number of octaves is the cost lever: each one doubles the work.
 */
export const NOISE_FUNCTIONS = /* glsl */ `
// Pseudo-random number, deterministic and without a perceptible pattern.
float odoroHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float odoroNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3: zero derivative at the ends, so no visible edge.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = odoroHash(cell);
  float b = odoroHash(cell + vec2(1.0, 0.0));
  float c = odoroHash(cell + vec2(0.0, 1.0));
  float d = odoroHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float odoroFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    total += odoroNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}
`

/**
 * Aurora: sheets of colour slowly deformed.
 *
 * ## The technique
 *
 * The sampled point is not the fragment coordinate, but that coordinate
 * **displaced by a first noise**. Deforming the domain rather than the value
 * produces swirls and folds, where a plain sum of octaves would only give
 * blotches. It is the same principle as a distortion map, applied upstream
 * rather than downstream.
 *
 * Time enters into the displacement, not into the colour: the sheet deforms
 * instead of flickering.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds.
 * - `uResolution` — size in pixels, to correct the aspect ratio.
 * - `uColorA`, `uColorB`, `uColorC` — the three blended hues.
 * - `uSpeed` — deformation speed.
 * - `uScale` — scale of the pattern; larger means finer.
 * - `uOctaves` — detail, and therefore cost.
 */
export const AURORA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOctaves;

${NOISE_FUNCTIONS}

void main() {
  // Aspect ratio correction: without it, the pattern stretches with the window
  // instead of keeping its proportions.
  vec2 p = vUv;
  p.x *= uResolution.x / max(uResolution.y, 1.0);
  p *= uScale;

  float t = uTime * uSpeed;
  int octaves = int(uOctaves);

  // Domain displacement: this is what produces the folds.
  vec2 offset = vec2(
    odoroFbm(p + vec2(0.0, t), octaves),
    odoroFbm(p + vec2(t * 0.7, 5.2), octaves)
  );

  float field = odoroFbm(p + offset * 2.0, octaves);

  // Two successive blends rather than one: the central hue appears in the
  // middle of the range instead of being crushed at the ends.
  vec3 color = mix(uColorA, uColorB, smoothstep(0.25, 0.75, field));
  color = mix(color, uColorC, smoothstep(0.55, 1.0, field));

  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * Grid in perspective, with attenuation towards the horizon.
 *
 * ## The technique
 *
 * The lines are not drawn: they are **deduced** from the position. The
 * fractional part of the scaled coordinate is taken, and its distance to the
 * edge of the cell is examined. A line is simply the place where that distance
 * is small.
 *
 * The thickness is computed from the derivative of the coordinate — `fwidth` —
 * rather than fixed in world units. This is what gives lines of constant
 * thickness on screen whatever the perspective, and without shimmering in the
 * distance: without that correction, far lines would drop below the size of a
 * pixel and flicker at the slightest movement.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds.
 * - `uResolution` — size in pixels.
 * - `uColorLine`, `uColorBackground` — hues of the lines and of the background.
 * - `uSpeed` — scrolling speed towards the observer.
 * - `uDensity` — number of visible cells.
 */
export const GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorLine;
uniform vec3 uColorBackground;
uniform float uSpeed;
uniform float uDensity;

void main() {
  // Origin at the centre, vertical axis pointing up.
  vec2 p = vUv * 2.0 - 1.0;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  // Below the horizon only: above it, the background alone.
  float horizon = 0.0;
  if (p.y >= horizon) {
    gl_FragColor = vec4(uColorBackground, 1.0);
    return;
  }

  // Projection: the closer to the horizon, the further away the ground.
  float depth = 1.0 / max(horizon - p.y, 0.0001);
  vec2 plane = vec2(p.x * depth, depth + uTime * uSpeed) * uDensity;

  // Distance to the cell edge, in both directions.
  vec2 edge = abs(fract(plane) - 0.5);

  // Thickness in pixels rather than in world units: without it, far lines would
  // drop below the pixel and shimmer.
  vec2 width = fwidth(plane);
  vec2 line = smoothstep(width * 1.5, vec2(0.0), edge);
  float strength = max(line.x, line.y);

  // Attenuation towards the horizon: what is far must fade away.
  strength *= smoothstep(0.0, 0.35, -p.y);

  gl_FragColor = vec4(mix(uColorBackground, uColorLine, strength), 1.0);
}
`
