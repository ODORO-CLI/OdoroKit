/**
 * Shader for the flipping tiles.
 *
 * ## The mathematical idea
 *
 * One tile per cell of a grid, flipped about its vertical axis by an angle
 * that depends on the distance from the cell to the pointer: a sine of that
 * distance minus time, under an envelope that dies away with distance. The
 * nearby tiles flip in concentric waves; the distant ones stay flat, front
 * face visible.
 *
 * The flip is faked without a camera: the apparent width of the tile is the
 * cosine of the angle, the visible face is given by its sign, and the two
 * vertical edges spread apart in opposite directions by a fraction of the
 * sine — a perspective of a single term, yet the eye sees a tile tipping
 * over. A tile seen edge-on darkens.
 *
 * It is the whole cell that is tested against the pointer, not the
 * fragment: a tile flips as one block, it does not twist.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the front face.
 * - `uColorC` — the back face.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uSpeed` — speed at which the waves travel.
 * - `uDensity` — number of tiles over the height.
 * - `uRadius` — reach of the waves, in frame heights.
 */
export const TILES_FLIP_FRAGMENT = /* glsl */ `
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

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // The distance from the centre of the tile to the pointer, in frame heights.
  vec2 centre = (cell + 0.5) / scale;
  vec2 m = uPointer * vec2(aspect, 1.0);
  float dist = length(centre - m);

  // The wave: a sine travelling away from the pointer, killed by distance.
  float reach = max(uRadius, 0.05);
  float envelope = 1.0 - smoothstep(0.0, reach, dist);
  float wave = 0.5 - 0.5 * cos(dist * (18.0 / reach) - uTime * uSpeed * 5.0);
  float angle = wave * envelope * 3.1415927;

  float c = cos(angle);
  float s = sin(angle);

  // The apparent width is the cosine; the vertical edges spread apart
  // in opposite directions by a fraction of the sine.
  float halfWidth = 0.44 * abs(c);
  float lean = 0.16 * s * sign(local.x);
  float halfHeight = 0.44 * (1.0 + lean);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float inX = 1.0 - smoothstep(halfWidth - px, halfWidth + px, abs(local.x));
  float inY = 1.0 - smoothstep(halfHeight - px, halfHeight + px, abs(local.y));
  float tile = inX * inY;

  // The visible face follows the sign of the cosine; seen edge-on, the tile is
  // dark.
  vec3 face = c >= 0.0 ? uColorB : uColorC;
  face *= 0.55 + 0.45 * abs(c);

  vec3 colour = mix(uColorA, face, tile);

  gl_FragColor = vec4(colour, 1.0);
}
`
