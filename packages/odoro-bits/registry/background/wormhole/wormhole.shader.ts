/**
 * Twisted vortex shader.
 *
 * ## The mathematical idea
 *
 * The same perspective as the tunnel — depth is the inverse of the radius —
 * but nothing else in common. The angle is twisted with depth: the further a
 * point is, the more it is turned, so that the ribs of the corridor wind into
 * a helix instead of running straight towards the centre. The whole thing
 * also pivots with time, and the vanishing point wanders along a slow
 * ellipse: the corridor is curved, not straight.
 *
 * The walls carry six ribs, read as a cosine of the twisted angle, and depth
 * bands that advance. The hue is not fixed: it turns around the wall with the
 * twisted angle and the depth, from one colour to the other. The glint
 * follows the ribs, where a band crosses them.
 *
 * The vanishing point is put out before it can beat against the pixel grid:
 * that is not decorative.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the walls.
 * - `uColorC` — the second hue, and the glint of the ribs.
 * - `uSpeed` — speed of travel.
 * - `uTwist` — twist of the ribs with depth.
 * - `uSpin` — rotation speed of the whole.
 * - `uRings` — density of the depth bands.
 */
export const WORMHOLE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uTwist;
uniform float uSpin;
uniform float uRings;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;

  // The vanishing point wanders: the corridor is curved, not straight.
  p -= 0.22 * vec2(sin(uTime * 0.6), cos(uTime * 0.45));

  float r = length(p);
  float angle = atan(p.y, p.x);
  float z = 1.0 / max(r, 0.01);
  float t = uTime * uSpeed;

  // The twist: the angle turns with depth; the whole thing pivots.
  float twisted = angle + z * uTwist * 0.25 + uTime * uSpin;

  // The depth advances; the bands are read from it as a sine.
  float depth = z * max(uRings, 1.0) * 0.25 - t * 3.0;

  // The walls: six twisted ribs, and bands that advance.
  float ribs = 0.5 + 0.5 * cos(twisted * 6.0);
  float band = smoothstep(0.25, 0.75, 0.5 + 0.5 * sin(depth));

  // The hue turns around the wall; the glint follows the ribs.
  float hue = 0.5 + 0.5 * sin(twisted * 3.0 + depth * 0.5);
  float glint = pow(ribs, 6.0) * band;

  // The vanishing point is put out before it can beat against the pixels.
  float far = smoothstep(0.03, 0.35, r);

  vec3 wall = mix(uColorB, uColorC, hue);
  vec3 colour = mix(uColorA, wall, (0.25 + 0.75 * band) * far * (0.5 + 0.5 * ribs));
  colour = mix(colour, uColorC, glint * far * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
