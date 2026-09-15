/**
 * Shader of the Truchet tiles.
 *
 * ## The mathematical idea
 *
 * A Truchet tile carries two quarter circles, centred on two opposite
 * corners, of radius half a tile: whatever its orientation, its arcs meet
 * those of its neighbours, and the tiling forms closed curves without any
 * tile knowing the others.
 *
 * Every tile has a hashed starting orientation, and pivots by a quarter turn
 * at every period. The pivot is animated: a third of a period of rotation,
 * then rest. A diagonal cascade delays each tile behind its neighbour, so
 * that the tiling recomposes itself as a wave rather than all at once.
 *
 * The colour is attached to the arc, not to the corner: when the tile pivots,
 * the colour turns with it, and the curves of the tiling change hue where
 * they join up differently.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first arc.
 * - `uColorC` — the second arc.
 * - `uSpeed` — periods per second.
 * - `uDensity` — number of tiles over the height.
 * - `uThickness` — thickness of the arcs, as a fraction of the tile.
 * - `uStagger` — diagonal delay between two neighbouring tiles, in periods.
 */
export const TRUCHET_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uThickness;
uniform float uStagger;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float truchetHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 truchetRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // The cascade: every tile lags behind its diagonal neighbour. The integer
  // part counts the quarter turns already made, the fractional part animates
  // the one under way during its first third.
  float phase = uTime * uSpeed - (cell.x + cell.y) * uStagger;
  float turns = floor(phase);
  float progress = smoothstep(0.0, 0.34, fract(phase));

  float start = floor(truchetHash(cell) * 4.0);
  float angle = (start + turns + progress) * 1.5707963;

  vec2 q = truchetRotate(local, angle);

  // The two arcs: quarter circles centred on two opposite corners.
  float d1 = abs(length(q - vec2(-0.5, -0.5)) - 0.5);
  float d2 = abs(length(q - vec2(0.5, 0.5)) - 0.5);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float halfWidth = max(uThickness, 0.01) * 0.5;
  float arc1 = 1.0 - smoothstep(halfWidth - px, halfWidth + px, d1);
  float arc2 = 1.0 - smoothstep(halfWidth - px, halfWidth + px, d2);

  // During the pivot, the tile darkens a little: the eye follows the wave.
  float moving = progress * (1.0 - progress) * 4.0;

  vec3 colour = mix(uColorA, uColorB, 0.06 * moving);
  colour = mix(colour, uColorB, arc1);
  colour = mix(colour, uColorC, arc2);

  gl_FragColor = vec4(colour, 1.0);
}
`
