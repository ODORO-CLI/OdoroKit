/**
 * Background shaders: the construction family.
 *
 * Four patterns where the figure comes from a change of coordinates rather
 * than from a noise: polar for the tunnel and the spectrum, iso-values for the
 * contour lines, signed distance for the rippling grid. They have in common
 * being perfectly deterministic — no randomness enters them.
 *
 * None of these shaders is taken from elsewhere.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Tunnel: a perspective obtained without a matrix.
 *
 * ## Why 1/r gives depth
 *
 * In a cylindrical corridor viewed head on, the distance travelled along the
 * axis is inversely proportional to the apparent radius: what is far is small,
 * what is near fills the screen. Setting `z = 1/r` reproduces exactly that
 * relation — it is the same division as that of a perspective projection,
 * applied directly in two dimensions.
 *
 * The angle serves as the second texture coordinate. A complete unwrapping of
 * the cylinder is therefore obtained in two lines, without a camera, without a
 * matrix and without geometry.
 *
 * ## The darkening in the distance
 *
 * It is not decorative. Without it, the pattern tightens indefinitely towards
 * the centre and ends up beating against the pixel grid: the vanishing point
 * starts to swarm. The attenuation puts out the area before the beat appears.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (rings), `uSegments`.
 */
export const TUNNEL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uSegments;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float radius = max(length(p), 0.0001);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // z = 1/r: the exact relation between distance and apparent radius in a
  // cylindrical corridor. That is the whole perspective.
  float depth = 1.0 / radius;

  float rings = fract(depth * max(uScale, 0.1) + t);
  float sectors = fract(angle / 6.28318 * max(uSegments, 1.0) + t * 0.15);

  // Two crossed thin borders: the chequerboard appears without any tile being
  // described, only through the product of two foldings. The border is where
  // the folding approaches its edges — the thin band, not its complement: with
  // the bounds reversed, the whole screen filled up except the lines.
  float grid = max(
    smoothstep(0.0, 0.06, abs(rings - 0.5) - 0.44),
    smoothstep(0.0, 0.06, abs(sectors - 0.5) - 0.44)
  );

  // Without this attenuation, the pattern tightens until it beats against the
  // pixel grid and the vanishing point starts to swarm.
  float distant = smoothstep(0.0, 0.42, radius);

  gl_FragColor = vec4(mix(uColorA, uColorB, grid * distant), 1.0);
}
`

/**
 * Spectrum: an angular sweep of hues.
 *
 * ## Why three offset cosines
 *
 * Going from one hue to another by interpolating linearly between two colours
 * passes through grey: the components meet in the middle. Three cosines offset
 * by a third of a revolution never cross all three at the same place, and the
 * saturation stays constant all the way round.
 *
 * It is the same reason that makes a colour wheel round and not segmented. The
 * formula fits on one line, and replaces a complete
 * hue-saturation-lightness conversion.
 *
 * ## The blend with the palette
 *
 * A pure spectrum would ignore the tokens, which this system does not allow.
 * The computed hue therefore **tints** the two colours received rather than
 * replacing them: the background stays in the tones of the theme, and the
 * sweep is only a modulation of it.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (revolutions),
 * `uSaturation`.
 */
export const SPECTRUM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uSaturation;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float angle = atan(p.y, p.x) / 6.28318 + 0.5;
  float radius = length(p);
  float t = uTime * uSpeed;

  float turn = fract(angle * max(uScale, 1.0) + t);

  // Three cosines offset by a third of a revolution: they never meet all at
  // the same place, so the sweep does not pass through grey.
  vec3 wheel = 0.5 + 0.5 * cos(6.28318 * (turn + vec3(0.0, 0.3333, 0.6667)));

  // The hue modulates the palette instead of replacing it: the background
  // stays in the tones of the theme.
  vec3 base = mix(uColorA, uColorB, smoothstep(0.0, 0.8, radius));
  vec3 colour = mix(base, base * wheel * 2.0, clamp(uSaturation, 0.0, 1.0));

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`

/**
 * Contour lines: an animated topographic map.
 *
 * ## How a line is obtained from a surface
 *
 * A contour line is the place where a function equals a multiple of a given
 * step. Folding the value of the field onto that step, then marking the
 * surroundings of zero, gives exactly those places — one line per level,
 * without any of them being traced.
 *
 * ## The correction by the slope
 *
 * The same problem as for the threads, in two dimensions: where the terrain is
 * flat, the levels are far apart and the lines thicken until they fill the
 * area; where it is steep, they tighten until they disappear.
 *
 * The slope is therefore measured, then divided by. `fwidth` would give it in
 * one instruction, but it requires an extension in WebGL 1 and the shader
 * fails silently when it is missing — which is what happened here before this
 * computation was written by hand.
 *
 * The field is therefore sampled twice more, one pixel away in x then in y.
 * This is a finite difference: three evaluations instead of one, in exchange
 * for a portability that depends on nothing.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uLevels`.
 */
export const CONTOUR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uLevels;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  vec2 drift = vec2(t, t * 0.35);
  float altitude = odoroFbm(p + drift, 4);
  float levels = max(uLevels, 1.0);

  // The field folded onto the step: every zero crossing is a contour line,
  // without any of them having been traced.
  float level = fract(altitude * levels);
  float distance = abs(level - 0.5);

  // One pixel, expressed in the units of the field. This is the step of the
  // finite difference that replaces fwidth, which requires an extension in
  // WebGL 1.
  vec2 texel = vec2(aspect, 1.0) * max(uScale, 0.1) / max(uResolution, vec2(1.0));

  float dx = odoroFbm(p + drift + vec2(texel.x, 0.0), 4) - altitude;
  float dy = odoroFbm(p + drift + vec2(0.0, texel.y), 4) - altitude;

  // The slope in levels per pixel: dividing by it expresses the gap in pixels,
  // therefore a constant thickness whatever the steepness.
  float slope = length(vec2(dx, dy)) * levels;
  float line = smoothstep(0.0, 1.5, distance / max(slope, 0.0001));

  vec3 terrain = mix(uColorA, uColorB, altitude);

  gl_FragColor = vec4(mix(uColorC, terrain, line), 1.0);
}
`

/**
 * Rippling grid: a lattice lifted by a wave.
 *
 * ## What distinguishes this background from the static lattice
 *
 * `background/grid-lines` draws a grid with two repeated gradients, without a
 * graphics context — that is the right choice when the grid only drifts. Here
 * the grid is **deformed**: every intersection is displaced by a radial wave,
 * which no repetition of a gradient can do.
 *
 * That is the only reason to use a graphics surface for a grid. If the
 * amplitude is zero, the component without WebGL does exactly the same work
 * for thirteen kilobytes less.
 *
 * ## The wave
 *
 * It is a function of the distance to the centre, not of the coordinates: the
 * crests are therefore concentric circles, and the deformation stays coherent
 * whatever the aspect ratio of the frame.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (cells), `uAmplitude`.
 */
export const RIPPLE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAmplitude;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float radius = length(p);

  // The wave depends on the distance to the centre: the crests are circles,
  // and the deformation stays coherent whatever the aspect ratio.
  float wave = sin(radius * 14.0 - t * 3.0) * uAmplitude;

  // The displacement is radial: every point moves away from the centre along
  // its own direction, which avoids the shearing of a constant offset.
  vec2 direction = radius > 0.0001 ? p / radius : vec2(0.0);
  vec2 displaced = (p + direction * wave) * max(uScale, 1.0);

  vec2 local = abs(fract(displaced) - 0.5);
  float stroke = max(
    smoothstep(0.5, 0.46, local.x),
    smoothstep(0.5, 0.46, local.y)
  );

  // Attenuation towards the edges: without it, the grid stops dead and reads
  // as a texture laid on the frame.
  float fade = smoothstep(0.85, 0.15, radius);

  gl_FragColor = vec4(mix(uColorA, uColorB, stroke * fade), 1.0);
}
`
