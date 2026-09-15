/**
 * Shader for the prismatic burst.
 *
 * ## The mathematical idea
 *
 * Radial rays, like crepuscular rays, but everything that sets them apart
 * comes down to three things. They turn: the angular noise is read on an
 * angle that drifts. They shift hue around the turn: the colour of each
 * ray is taken between two tokens following a sine of the angle, which
 * makes several hue cycles around the focus. And they pulse: rings leave
 * the focus and travel away, lifting the rays they cross on their way.
 *
 * The angular noise stays a sum of sines at integer frequencies, so that
 * the turn closes back on itself with no seam.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the rays.
 * - `uColorC` — the second hue of the rays, and the focus.
 * - `uX`, `uY` — position of the focus, as a fraction of the frame.
 * - `uSpokes` — number of rays around the turn.
 * - `uSpeed` — speed of the rotation and of the pulses.
 * - `uBurst` — strength of the rings leaving the focus.
 * - `uDetail` — number of harmonics in the angular noise, and so its cost.
 */
export const PRISMATIC_BURST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uSpokes;
uniform float uSpeed;
uniform float uBurst;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 focus = vec2(uX * aspect, uY);
  float t = uTime * uSpeed;

  vec2 offset = p - focus;
  float radius = length(offset);
  float angle = atan(offset.y, offset.x) + t * 0.15;

  float f1 = max(floor(uSpokes), 2.0);
  float f2 = floor(f1 * 1.7) + 1.0;
  float f3 = floor(f1 * 2.6) + 2.0;
  int harmonics = int(clamp(uDetail, 1.0, 3.0));

  // The angular noise, on an angle that drifts: the rays turn.
  float beam = 0.5 + 0.5 * sin(angle * f1);
  if (harmonics >= 2) {
    beam = beam * 0.65 + (0.5 + 0.5 * sin(angle * f2 - t * 0.6)) * 0.35;
  }
  if (harmonics >= 3) {
    beam = beam * 0.75 + (0.5 + 0.5 * sin(angle * f3 + t * 0.4)) * 0.25;
  }
  float profile = pow(beam, 3.0);

  // The hue: three cycles around the turn, and a slower radial cycle, so
  // that the colour of a ray changes along its length too.
  float cycle = 0.5 + 0.5 * sin(angle * 3.0 + t * 0.5);
  float radialCycle = 0.5 + 0.5 * sin(radius * 5.0 - t * 1.2);
  vec3 tint = mix(uColorB, uColorC, mix(cycle, radialCycle, 0.35));

  // The rings: a power of a sine of the distance, travelling away.
  float ring = pow(0.5 + 0.5 * sin(radius * 11.0 - t * 2.5), 5.0) * uBurst;

  float attenuation = exp(-radius * 1.5);
  float intensity = profile * attenuation * (0.7 + 0.8 * ring);
  float core = exp(-radius * radius * 40.0);

  vec3 colour = mix(uColorA, tint, clamp(intensity, 0.0, 1.0));
  colour = mix(colour, uColorC, core * 0.8);
  colour += tint * ring * profile * attenuation * 0.25;
  colour += uColorC * core * 0.3;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
