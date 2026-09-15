/**
 * Light pillar shader.
 *
 * ## The mathematical idea
 *
 * A vertical column is a distance to an axis. Two profiles are laid over
 * it: a narrow gaussian for the core, a wide exponential for the halo —
 * real light has a sharp centre and a trail which never quite ends, and a
 * single curve cannot give both.
 *
 * The breathing is the width oscillating, on two periods that are not
 * multiples so as not to beat like a metronome. The streaks are a 1D noise
 * of the height, climbing: three sines of frequencies that are not
 * multiples, so the light seems to flow inside the column rather than
 * blink.
 *
 * The light is laid over the background by a bounded mix towards its hues,
 * never by darkening: the column stays legible on a light background.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the halo.
 * - `uColorC` — the core.
 * - `uX` — horizontal position of the axis, as a fraction of the frame.
 * - `uWidth` — width of the core, as a fraction of the height.
 * - `uBreath` — speed of the breathing.
 * - `uGlow` — extent of the halo.
 * - `uDetail` — number of harmonics in the streaks, and so their cost.
 */
export const LIGHT_PILLAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uWidth;
uniform float uBreath;
uniform float uGlow;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float axis = uX * aspect;
  float t = uTime;
  int harmonics = int(clamp(uDetail, 1.0, 3.0));

  // The breathing: two periods that are not multiples, so the column never
  // beats twice the same way.
  float breath = 0.5
    + 0.3 * sin(t * uBreath * 1.3)
    + 0.2 * sin(t * uBreath * 0.47 + 1.7);
  float width = max(uWidth, 0.01) * (0.8 + 0.4 * breath);

  // The streaks: a 1D noise of the climbing height, in bounded harmonics.
  float streak = 0.5 + 0.5 * sin(vUv.y * 9.0 - t * 0.8);
  if (harmonics >= 2) {
    streak = streak * 0.6 + (0.5 + 0.5 * sin(vUv.y * 23.0 + t * 1.3)) * 0.4;
  }
  if (harmonics >= 3) {
    streak = streak * 0.75 + (0.5 + 0.5 * sin(vUv.y * 51.0 - t * 2.1)) * 0.25;
  }

  // The core, gaussian and sharp; the halo, exponential and endless.
  float d = abs(p.x - axis);
  float core = exp(-(d * d) / (width * width * 0.25));
  float halo = exp(-d / (width * 4.0)) * uGlow;

  // The ends: the column fades out towards the edges, a little faster at the
  // top, like a jet scattering as it rises.
  float height = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

  // The foot: the light touching the ground spreads into a pool.
  float foot = exp(-(d * d) * 6.0 - vUv.y * vUv.y * 30.0) * 0.5;

  // The streaks mark the core; on the halo they only just surface, otherwise
  // they bar the whole frame with horizontal bands.
  float veil = clamp((halo * (0.88 + 0.12 * streak) + foot) * height, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, veil);
  colour = mix(colour, uColorC, clamp(core * height * (0.6 + 0.4 * streak), 0.0, 1.0));
  colour += uColorC * core * height * 0.25 * breath;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
