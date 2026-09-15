/**
 * Shaders of the sphere of points.
 *
 * ## The idea
 *
 * Every point is a vertex on a unit sphere. The vertex shader lifts it along
 * its normal — which is its position — by a bump centred on the direction of
 * the pointer, plus a breathing of noise. The bump is a function of the
 * cosine of the angle between the point and the pointer: nil far away,
 * greatest under it, and its extent is a setting.
 *
 * The fragment draws a soft disc inside the point, tinted according to the
 * lift, and dims the rear hemisphere: without that dimming, the two faces of
 * the sphere pile up into a flat disc.
 *
 * The noise is supplied by the engine (`NOISE_FUNCTIONS_3D`), prefixed to the
 * vertex.
 *
 * @module
 */

/** Vertex shader: bump under the pointer, breathing, size from the depth. */
export const PARTICLE_SPHERE_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec3 uPointer;
uniform float uPull;
uniform float uReach;
uniform float uSize;
uniform float uPixelRatio;

varying float vLift;
varying float vFacing;

void main() {
  vec3 normal = normalize(position);

  // The bump: close to 1 under the pointer, nil beyond the reach.
  float proximity = dot(normal, uPointer);
  float bump = smoothstep(1.0 - uReach, 1.0, proximity);
  bump = bump * bump * (3.0 - 2.0 * bump);

  // The breathing: a slow noise that ripples the whole surface.
  float breathe = odoroNoise3(normal * 2.2 + vec3(0.0, uTime * 0.3, 0.0)) - 0.5;

  float lift = bump * uPull + breathe * 0.1;
  vec3 displaced = normal * (1.0 + lift);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vec3 viewNormal = normalize(normalMatrix * normal);

  vLift = bump;
  vFacing = viewNormal.z;

  // The size follows the depth, and the lifted points grow.
  gl_PointSize = uSize * uPixelRatio * (1.0 + bump * 1.4) * (3.2 / max(-viewPosition.z, 0.5));
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader: soft disc, tinted by lift, rear dimmed. */
export const PARTICLE_SPHERE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vLift;
varying float vFacing;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = 1.0 - smoothstep(0.2, 0.5, d);
  if (disc <= 0.001) discard;

  // The rear of the sphere is darker: that is what makes it round.
  float depth = mix(0.3, 1.0, smoothstep(-1.0, 0.6, vFacing));

  vec3 colour = mix(uColorA, uColorB, vLift);
  gl_FragColor = vec4(colour, disc * depth * 0.9);
}
`
