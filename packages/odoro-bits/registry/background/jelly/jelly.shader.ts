/**
 * Jelly shaders: a sphere that wobbles where it is touched.
 *
 * ## The idea
 *
 * Each vertex is displaced along its normal — its position on the unit
 * sphere — by a height that sums three things per impact: a brief hollow at
 * the place of the blow, a wave that runs over the surface as it dies out,
 * and a swaying of the whole mass along the axis of the blow. The distance
 * to the impact is geodesic — the angle between the two directions — so that
 * the wave is round on the sphere, not squashed on the sides.
 *
 * A slow noise makes the surface breathe between two blows: a jelly that
 * stands still is no longer a jelly.
 *
 * ## The normal
 *
 * It is recomputed by finite differences on the sphere: the height is
 * evaluated at two neighbouring points, in the tangent plane, and the cross
 * product of the two offsets gives the normal of the displaced surface.
 * Without it, the light would ignore the waves, and they would only be seen
 * on the outline.
 *
 * The noise is supplied by the engine (`NOISE_FUNCTIONS_3D`), prefixed to
 * the vertex.
 *
 * @module
 */

/** Vertex shader: impacts, breathing, normal by finite differences. */
export const JELLY_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec4 uImpacts[4];
uniform float uWobble;
uniform float uStiffness;
uniform float uDamping;

varying vec3 vNormal;
varying vec3 vViewPosition;

const int IMPACTS = 4;

// Height of the surface in one direction: breathing plus impacts.
float jellyHeight(vec3 n) {
  float total = (odoroNoise3(n * 1.6 + vec3(0.0, uTime * 0.35, 0.0)) - 0.5) * 0.35;

  for (int i = 0; i < IMPACTS; i += 1) {
    vec4 impact = uImpacts[i];
    float age = uTime - impact.w;
    if (age < 0.0) continue;
    float along = dot(n, impact.xyz);
    float angle = acos(clamp(along, -1.0, 1.0));
    float fade = exp(-age * uDamping);

    // The hollow of the finger, which releases quickly.
    float dent = -exp(-angle * angle * 10.0) * exp(-age * 7.0) * 1.2;
    // The wave running out from the impact, fainter as it travels away.
    float wave = cos(angle * 5.0 - age * uStiffness) * exp(-angle * 0.8) * fade * 0.5;
    // The swaying of the whole mass along the axis of the blow.
    float mass = along * sin(age * uStiffness * 0.55) * fade * 0.35;

    total += dent + wave + mass;
  }

  return total;
}

vec3 jellyPoint(vec3 n) {
  return n * (1.0 + jellyHeight(n) * uWobble);
}

void main() {
  vec3 n = normalize(position);
  vec3 p = jellyPoint(n);

  // Two tangents, two neighbouring points, one normal.
  vec3 helper = abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(n, helper));
  vec3 t2 = cross(n, t1);
  float eps = 0.02;
  vec3 p1 = jellyPoint(normalize(n + t1 * eps));
  vec3 p2 = jellyPoint(normalize(n + t2 * eps));
  vec3 normal = normalize(cross(p1 - p, p2 - p));

  vNormal = normalize(normalMatrix * normal);
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader: translucent body, fresnel, two highlights. */
export const JELLY_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uBody;
uniform vec3 uHighlight;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);

  // The edge brightens: the light goes through the jelly where it is thin.
  float fresnel = pow(1.0 - facing, 2.5);

  vec3 light = normalize(vec3(-0.5, 0.9, 0.7));
  float diffuse = max(dot(normal, light), 0.0);
  float specular = pow(max(dot(normal, normalize(light + view)), 0.0), 90.0);

  // A second highlight, broader and lower: the bounce off the table.
  vec3 bounce = normalize(vec3(0.7, -0.3, 0.5));
  float rebound = pow(max(dot(normal, normalize(bounce + view)), 0.0), 30.0) * 0.3;

  vec3 colour = uBody * (0.55 + 0.45 * diffuse);
  colour = mix(colour, uHighlight, clamp(fresnel * 0.55 + specular + rebound, 0.0, 1.0));

  gl_FragColor = vec4(colour, 0.72 + fresnel * 0.28);
}
`
