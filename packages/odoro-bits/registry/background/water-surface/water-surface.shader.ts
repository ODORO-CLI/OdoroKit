/**
 * Water surface shaders: Gerstner waves and a grazing reflection.
 *
 * ## The idea
 *
 * Four Gerstner waves, each one twice as short and twice as weak as the
 * previous one, in directions that are not aligned. A Gerstner wave does not
 * only lift the point: it also moves it towards the crest, which pinches the
 * crests and widens the troughs — that pinching is what tells water apart
 * from a rippling sheet. The normal is analytic, the sum of the derivatives
 * of each wave.
 *
 * In the fragment, a fine three-dimensional noise perturbs the normal: these
 * are the ripples the wind raises, too small for the geometry, and they are
 * what makes the sun sparkle.
 *
 * ## Why a Fresnel term
 *
 * Water only reflects the sky at grazing angles: seen head on, you see
 * through it; seen edge on, it is a mirror. The tint moves from the colour of
 * the water to that of the sky depending on the viewing angle, and it is that
 * transition, more than any reflection, that makes the surface read as water.
 *
 * The noise is supplied by the engine (`NOISE_FUNCTIONS_3D`), prefixed to the
 * fragment.
 *
 * @module
 */

/** Vertex shader: Gerstner waves, analytic normal, tangent frame. */
export const WATER_SURFACE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uWavelength;
uniform float uChop;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vTangentX;
varying vec3 vTangentY;
varying vec3 vViewPosition;
varying vec2 vPlane;

const int WAVES = 4;
const float TAU = 6.28318530718;

void main() {
  vec2 at = position.xy;
  vec3 displaced = vec3(at, 0.0);
  vec3 normal = vec3(0.0, 0.0, 1.0);

  float wavelength = uWavelength;
  float amplitude = uAmplitude;

  for (int i = 0; i < WAVES; i += 1) {
    // Directions that never repeat: the angle advances by an irrational
    // step, so no wave is parallel to any other.
    float angle = 0.4 + float(i) * 1.9;
    vec2 direction = vec2(cos(angle), sin(angle));
    float k = TAU / max(wavelength, 0.05);
    // Deep-water dispersion relation: long waves travel faster than short
    // ones.
    float omega = sqrt(9.8 * k) * uSpeed;
    float phase = k * dot(direction, at) - omega * uTime;

    // The pinch: the point slides towards the crest. Spread over the waves so
    // that the sum never makes the surface fold back on itself.
    float pinch = uChop * 0.85 / float(WAVES);
    float cosine = cos(phase);
    float sine = sin(phase);

    displaced.xy += direction * (pinch / k) * cosine;
    displaced.z += amplitude * sine;

    normal.xy -= direction * k * amplitude * cosine;
    normal.z -= pinch * sine;

    wavelength *= 0.55;
    amplitude *= 0.6;
  }

  vPlane = at;
  vNormal = normalize(normalMatrix * normalize(normal));
  vTangentX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
  vTangentY = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader: ripples, Fresnel, sun, haze. */
export const WATER_SURFACE_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uWater;
uniform vec3 uSky;
uniform float uSun;

varying vec3 vNormal;
varying vec3 vTangentX;
varying vec3 vTangentY;
varying vec3 vViewPosition;
varying vec2 vPlane;

void main() {
  // The ripples: the gradient of a fine noise, applied in the tangent frame
  // of the surface. They fade out in the distance, where they would only make
  // pixel noise.
  float distance = length(vViewPosition);
  float fine = 1.0 - smoothstep(2.0, 9.0, distance);
  float e = 0.06;
  vec3 q = vec3(vPlane * 5.0, uTime * 0.45);
  float n0 = odoroNoise3(q);
  float nx = odoroNoise3(q + vec3(e, 0.0, 0.0));
  float ny = odoroNoise3(q + vec3(0.0, e, 0.0));
  vec3 normal = normalize(
    vNormal + (vTangentX * (n0 - nx) + vTangentY * (n0 - ny)) * 3.0 * fine
  );

  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);

  // Fresnel: head on the water, edge on the sky.
  float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 4.0);
  vec3 colour = mix(uWater, uSky, fresnel);

  // The sun, low ahead: a narrow glint, and a wider shimmer that the ripples
  // break up into sparkles.
  vec3 sun = normalize(vec3(0.3, 0.4, -1.0));
  vec3 halfway = normalize(sun + view);
  float alignment = max(dot(normal, halfway), 0.0);
  float glint = pow(alignment, 240.0) * 2.2;
  float sparkles = pow(alignment, 36.0) * 0.4;
  float diffuse = 0.75 + 0.25 * max(dot(normal, sun), 0.0);

  colour = colour * diffuse + uSky * (glint + sparkles) * uSun;

  // Haze: the surface blends into the background well before the edge of the
  // plane.
  float fog = smoothstep(4.0, 13.0, distance);
  colour = mix(colour, uDeep, fog);

  gl_FragColor = vec4(colour, 1.0);
}
`
