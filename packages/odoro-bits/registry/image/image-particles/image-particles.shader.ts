/**
 * Shaders of the image in particles.
 *
 * ## Everything happens at the vertex
 *
 * Each point carries its final place — that is its `position` — and a random
 * draw that says where it comes from. The gathering is nothing but a blend
 * between the two, driven by a single uniform: no position is recomputed by
 * the central processor, and the whole animation fits into an interpolation.
 *
 * ## The size of the points is a projection, not a magic number
 *
 * `gl_PointSize` is expressed in pixels of the drawing buffer. Converting it
 * from a size in scene units requires the projection factor — height of the
 * buffer divided by twice the tangent of the half field of view — which
 * arrives as a uniform. Without it, the points would change apparent size with
 * the pixel density of the screen and with the height of the frame.
 *
 * @module
 */

/**
 * Vertex: scatter, gather, breathe.
 *
 * The breathing only starts once the image is formed — it is multiplied by the
 * progress of the gathering. Otherwise the points would arrive already moving,
 * and one would not see the image settle.
 */
export const IMAGE_PARTICLES_VERTEX = /* glsl */ `
attribute vec3 aTint;
attribute vec3 aSeed;

uniform float uTime;
uniform float uScatter;
uniform float uAssembly;
uniform float uCell;
uniform float uProjection;

varying vec3 vTint;

void main() {
  vTint = aTint;

  vec3 loose = position + aSeed * uScatter;
  vec3 place = mix(loose, position, uAssembly);

  float phase = uTime + aSeed.x * 6.2831853;
  place.z += sin(phase) * uScatter * 0.07 * uAssembly;

  vec4 seen = modelViewMatrix * vec4(place, 1.0);
  gl_PointSize = uCell * uProjection / max(-seen.z, 0.001);
  gl_Position = projectionMatrix * seen;
}
`

/**
 * Fragment: a disc, not a square.
 *
 * A square point reads as a pixel — hence as a display fault. Discarding the
 * corners costs less than a texture and requires no download.
 */
export const IMAGE_PARTICLES_FRAGMENT = /* glsl */ `
precision mediump float;

varying vec3 vTint;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  if (dot(offset, offset) > 0.25) discard;
  gl_FragColor = vec4(vTint, 1.0);
}
`
