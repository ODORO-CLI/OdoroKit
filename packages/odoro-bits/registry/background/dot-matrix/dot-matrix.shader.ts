/**
 * Shader for the dot pattern.
 *
 * ## What the shader computes
 *
 * A grid of dots, each one lit or unlit according to a delay that depends on
 * its distance to the centre. The propagation front that results — from the
 * centre outwards, or the other way round — is the only thing this file
 * produces; everything else is just the mesh and its twinkle.
 *
 * ## Why the grid pitch is derived from the shorter side
 *
 * The implementation this component draws on expressed the mesh in pixels, and
 * therefore had to know the canvas pixel density to correct it — a value the
 * engine picks itself, according to the quality in force, and does not pass
 * on.
 *
 * The setting is therefore a **number of cells** along the shorter side. The
 * apparent density no longer depends on the screen nor on the window aspect
 * ratio, and no value travels between the engine and the shader to obtain it.
 *
 * ## Why the background is painted here
 *
 * The surface is allocated without an alpha channel: whatever is not written
 * is black, not transparent. The background is therefore part of the render,
 * and it comes from a token like the two dot hues.
 *
 * @module
 */

/**
 * Fragment shader for the pattern.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA`, `uColorB` — the two hues the dots are spread between, by their
 *   seed.
 * - `uColorBackground` — the background, painted under the pattern.
 * - `uCells` — number of cells along the shorter side.
 * - `uDot` — dot side, as a fraction of the cell.
 * - `uSpeed` — propagation speed of the front.
 * - `uReverse` — `0.0` for the entrance, `1.0` for the exit.
 * - `uPhase` — time at which the current phase started. Without it, an
 *   inversion mid-course would pick the animation up where absolute time
 *   stands, that is to say finished.
 * - `uFlicker` — share of twinkle, from `0.0` to `1.0`.
 */
export const DOT_MATRIX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorBackground;
uniform float uCells;
uniform float uDot;
uniform float uSpeed;
uniform float uReverse;
uniform float uPhase;
uniform float uFlicker;

// Pseudo-random number, deterministic and with no perceptible pattern: the
// point is projected onto an arbitrary direction, the sine is taken, amplified,
// and only its fractional part is kept.
float patternHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // The mesh pitch comes from the shorter side: the apparent density then
  // depends neither on the window aspect ratio nor on the pixel density.
  float pitch = min(uResolution.x, uResolution.y) / max(uCells, 1.0);

  vec2 pixel = vUv * uResolution;
  vec2 cell = floor(pixel / pitch);
  vec2 inside = fract(pixel / pitch);

  // The dot is centred in its cell. Placed at the corner, it would give a grid
  // visibly shifted half a mesh down and to the left.
  vec2 offset = abs(inside - 0.5);
  float reachDot = uDot * 0.5;
  float mask = step(offset.x, reachDot) * step(offset.y, reachDot);

  float seed = patternHash(cell);

  // Twinkle: each cell steps to a new level at a regular interval. The offset
  // by the seed keeps the whole grid from blinking as one block.
  float slot = floor(uTime * 0.4 + seed * 8.0);
  float twinkle = mix(1.0, 0.25 + 0.75 * patternHash(cell + slot), uFlicker);

  // Distance to the centre, counted in cells and brought back between zero and
  // one.
  vec2 middle = uResolution * 0.5 / pitch;
  float span = max(length(middle), 1.0);
  float reach = distance(cell, middle) / span;

  float elapsed = max(uTime - uPhase, 0.0) * uSpeed;

  // The entrance starts at the centre, the exit starts at the edges: it is the
  // same delay, read the other way round.
  float delay = mix(reach, 1.0 - reach, uReverse) + seed * 0.18;
  float opened = smoothstep(delay, delay + 0.35, elapsed);
  float presence = mix(opened, 1.0 - opened, uReverse);

  vec3 ink = mix(uColorA, uColorB, seed);
  vec3 colour = mix(uColorBackground, ink, mask * twinkle * presence);

  gl_FragColor = vec4(colour, 1.0);
}
`
