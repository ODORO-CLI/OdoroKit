/**
 * Shaders of Molten.
 *
 * ## What the scene computes
 *
 * A subdivided sphere, displaced along its normals by a sum of octaves of
 * three-dimensional noise. The noise field translates through time rather than
 * rotating: the mass then seems to breathe in place, instead of drifting past.
 *
 * ## Why the normal is recomputed
 *
 * Displacing the vertices changes the shape, but not the normals shipped with
 * the geometry: the lighting would stay that of a smooth sphere, which
 * visually cancels the whole deformation. Recomputing them exactly would
 * require the derivative of the noise field.
 *
 * We approximate it by finite differences — three extra evaluations around the
 * point, from which two tangents are drawn. It costs more, and it is that
 * spending which makes the difference between a bumpy sphere and a mass that
 * has relief.
 *
 * ## What the fragment does
 *
 * Two colours, taken from the palette: the core for the hollows, the crust for
 * the ridges. A Fresnel term — light grazes the edges — adds the halo that
 * gives the impression of hot matter. No texture, no file: everything is
 * computed.
 *
 * @module
 */

/**
 * Vertex shader.
 *
 * The noise is prefixed at compile time: the functions come from the engine,
 * and copying them here would make a second version to maintain.
 */
export const MOLTEN_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform int uOctaves;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vRelief;

/**
 * Displacement field at a point of the unit sphere.
 *
 * The variable name avoids the language keyword that denotes a sample: shader
 * compilation would fail, without anything on the TypeScript side reporting
 * it.
 */
float molten(vec3 direction) {
  vec3 field = direction * uFrequency + vec3(0.0, 0.0, uTime * uSpeed);
  return odoroFbm3(field, uOctaves) - 0.5;
}

void main() {
  vec3 direction = normalize(position);
  float relief = molten(direction);
  vec3 displaced = position + direction * relief * uAmplitude;

  // Normal approximated by finite differences. Two tangents are enough: the
  // normal is their cross product.
  vec3 up = abs(direction.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, direction));
  vec3 bitangent = cross(direction, tangent);

  // Named epsilon rather than step: the latter would shadow the native
  // function of the same name, which is legal and confusing.
  float epsilon = 0.02;
  vec3 nearTangent = normalize(direction + tangent * epsilon);
  vec3 nearBitangent = normalize(direction + bitangent * epsilon);

  vec3 pointHere = displaced;
  vec3 pointTangent =
    nearTangent + nearTangent * molten(nearTangent) * uAmplitude;
  vec3 pointBitangent =
    nearBitangent + nearBitangent * molten(nearBitangent) * uAmplitude;

  vec3 normal = normalize(
    cross(pointTangent - pointHere, pointBitangent - pointHere)
  );
  // The cross product can come out flipped depending on the order of the
  // tangents: we realign it on the outgoing direction rather than hope for the
  // right one.
  normal *= sign(dot(normal, direction));

  vRelief = relief;
  vNormal = normalize(normalMatrix * normal);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader. */
export const MOLTEN_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uCore;
uniform vec3 uCrust;
uniform float uGlow;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vRelief;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 toEye = normalize(-vViewPosition);

  // Fresnel: light grazes the edges seen side-on. The exponent three is a
  // common approximation of Schlick's law, close enough for a halo.
  float facing = max(dot(normal, toEye), 0.0);
  float rim = pow(1.0 - facing, 3.0);

  // A minimal diffuse lighting is enough to read the relief: the matter is
  // emissive, it has no source to reflect.
  float diffuse = 0.35 + 0.65 * facing;

  vec3 base = mix(uCore, uCrust, smoothstep(-0.25, 0.3, vRelief));
  vec3 colour = base * diffuse + uCore * rim * uGlow;

  gl_FragColor = vec4(colour, 1.0);
}
`
