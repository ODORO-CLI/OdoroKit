/**
 * Shaders of the tide: a sheet lifted by a swell of noise.
 *
 * ## The idea
 *
 * A plane each of whose vertices rises by the value of a three-dimensional
 * noise read at (x, y, time). Two layers: a wide, slow swell, and a fine
 * ripple crossing it at an angle — the second one keeps the first from reading
 * as a sheet that breathes.
 *
 * The normal comes from two finite differences on the height: what the relief
 * does to the light, it also does to the reflections, and that is the only
 * thing that gives volume to a sheet without a texture.
 *
 * ## Why a haze
 *
 * A finite plane has an edge, and an edge shows. The colour is blended into
 * the background colour with distance: the horizon vanishes before reaching
 * the edge of the geometry, and the sheet looks endless.
 *
 * The noise is supplied by the engine (`NOISE_FUNCTIONS_3D`), prefixed to the
 * vertex.
 *
 * @module
 */

/** Vertex shader: swell, finite differences, normal. */
export const TIDE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform int uOctaves;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vHeight;

float tide(vec2 at) {
  vec3 field = vec3(at * uFrequency, uTime * uSpeed);
  float swell = odoroFbm3(field, uOctaves) - 0.5;
  // The fine ripple slides at an angle and beats faster: two rhythms that
  // never overlap, so never a regular breathing.
  vec3 fine = vec3(
    at * uFrequency * 3.0 + vec2(uTime * uSpeed * 0.6, uTime * uSpeed * 0.25),
    uTime * uSpeed * 1.7
  );
  float ripple = odoroNoise3(fine) - 0.5;
  return swell + ripple * 0.18;
}

void main() {
  float height = tide(position.xy) * uAmplitude;
  vec3 displaced = vec3(position.xy, height);

  // Normal of a height field z = h(x, y): (-dh/dx, -dh/dy, 1), up to a factor.
  // Two neighbouring reads are enough.
  float epsilon = 0.05;
  float alongX = tide(position.xy + vec2(epsilon, 0.0)) * uAmplitude;
  float alongY = tide(position.xy + vec2(0.0, epsilon)) * uAmplitude;
  vec3 normal = normalize(vec3(height - alongX, height - alongY, epsilon));

  vHeight = height / max(uAmplitude, 0.001);
  vNormal = normalize(normalMatrix * normal);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader: colour by height, grazing light, crest, haze. */
export const TIDE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uCrest;
uniform float uShine;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vHeight;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(-vViewPosition);

  // The hollows keep the background colour, the bumps take the hue.
  float lift = smoothstep(-1.0, 1.0, vHeight);
  vec3 colour = mix(uDeep, uMid, lift);

  // A fixed grazing light, in view space: it comes from the top left and
  // brushes the sheet, which underlines every crest.
  vec3 light = normalize(vec3(-0.4, 0.8, 0.6));
  float diffuse = max(dot(normal, light), 0.0);
  vec3 halfway = normalize(light + view);
  float specular = pow(max(dot(normal, halfway), 0.0), 48.0) * uShine;
  float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);

  // The bumps light themselves: without this glow, a dark sheet seen at a
  // grazing angle is nothing but grey relief.
  float glow = pow(lift, 3.0) * 0.35 * uShine;
  colour = colour * (0.45 + 0.65 * diffuse) + uCrest * (specular + fresnel * 0.35 * uShine + glow);

  // Haze: the sheet blends into the background well before the edge of the
  // plane.
  float distance = length(vViewPosition);
  float fog = smoothstep(3.5, 11.0, distance);
  colour = mix(colour, uDeep, fog);

  gl_FragColor = vec4(colour, 1.0);
}
`
