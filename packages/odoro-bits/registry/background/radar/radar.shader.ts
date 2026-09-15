/**
 * Shader for the radar.
 *
 * ## The mathematical idea
 *
 * A sweep: the difference between the pixel's angle and the time's angle,
 * folded modulo 2pi, gives the age of the last pass — an exponential of that
 * age makes the trail that follows the beam. The graduation rings are the
 * fractional part of the radius, thresholded. The echoes light up when the
 * beam passes over their angle and decay with that same age.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background of the screen.
 * - `uColorB` — the hue of the graduations and of the trail.
 * - `uColorC` — the hue of the beam and of the echoes.
 * - `uSpeed` — speed of the sweep's rotation.
 * - `uRings` — number of graduation rings.
 * - `uFade` — persistence of the trail and of the echoes.
 * - `uEchos` — number of echoes lit as the beam passes.
 */
export const RADAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRings;
uniform float uFade;
uniform float uEchos;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float radarHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 q = (vUv - 0.5) * vec2(aspect, 1.0) * 2.1;
  float radius = length(q);
  float angle = atan(q.y, q.x);
  float t = uTime * uSpeed;

  // The age of the last pass: the difference of the angle to the time, folded
  // over the turn. Exactly zero under the beam, almost 2pi just ahead of it.
  float age = mod(t * 2.0 - angle, 6.28318);

  float persistence = max(uFade, 0.05);
  float trail = exp(-age / persistence);
  float beam = smoothstep(0.12, 0.0, age);

  // Graduations: the fractional part of the radius, thresholded near both of
  // its edges — one subtraction replaces n drawn circles.
  float division = fract(radius * max(uRings, 1.0));
  float line = smoothstep(0.045, 0.0, min(division, 1.0 - division)) * 0.35;

  // The scope: everything fades out beyond the dial, gently.
  float dial = 1.0 - smoothstep(0.92, 1.0, radius);

  vec3 colour = uColorA + uColorB * (trail * 0.4 + line) * dial;

  // The echoes: each one has a hashed angle and radius, lights up when the
  // beam passes over its angle, and decays with the same age as the trail.
  int count = int(clamp(uEchos, 0.0, 3.0));
  for (int i = 0; i < 3; i += 1) {
    if (i >= count) break;

    float seed = float(i) * 7.0 + 3.0;
    float echoAngle = radarHash(seed) * 6.28318;
    float echoRadius = 0.25 + 0.6 * radarHash(seed + 11.0);
    vec2 position = echoRadius * vec2(cos(echoAngle), sin(echoAngle));

    float echoAge = mod(t * 2.0 - echoAngle, 6.28318);
    float glint = exp(-echoAge / (persistence * 0.6));

    vec2 offset = q - position;
    float blob = exp(-dot(offset, offset) / 0.002);
    colour += uColorC * blob * glint * dial;
  }

  colour += uColorC * beam * trail * dial * 0.9;

  gl_FragColor = vec4(colour, 1.0);
}
`
