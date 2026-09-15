/**
 * Shader of the VHS tracking.
 *
 * ## The mathematical idea
 *
 * A badly aligned cassette. The background picture is a gentle signal — two
 * slow waves — and everything else is what the tape does to it.
 *
 * The tracking band rolls slowly from the bottom upwards: within its height,
 * every screen line is offset horizontally by an amount drawn from its rank
 * and from the time step, and light streaks appear in it — one draw per line,
 * chopped into steps, without which they would shimmer instead of crackle.
 * The profile of the band is softened at both its edges.
 *
 * The colour jumps are a read of the two hues at two spread-apart positions,
 * a little at all times, and a great deal during the bursts: a draw per step
 * decides whether the whole picture jumps, shakes by a few pixels and doubles
 * its spread. The bottom of the picture carries the head switching: a few
 * lines always offset and noisy, as on any video recorder.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the signal.
 * - `uColorC` — the second, and the streaks of the band.
 * - `uSpeed` — speed of the tracking band.
 * - `uBand` — height of the band, as a fraction of the picture.
 * - `uSplit` — spread of the hues.
 * - `uNoise` — amount of streaks in the band.
 */
export const VHS_TRACKING_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBand;
uniform float uSplit;
uniform float uNoise;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float vhsHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// The signal: two slow waves, returned between zero and one for each hue.
vec2 vhsSignal(vec2 uv, float t) {
  float a = 0.5 + 0.5 * sin(uv.x * 2.4 + uv.y * 1.8 + t * 0.5);
  float b = 0.5 + 0.5 * sin(uv.y * 3.2 - t * 0.35 + sin(uv.x * 1.6 + t * 0.3) * 1.2);
  return vec2(a, a * b);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime;

  // The steps: a fast one for the crackle, a slow one for the bursts.
  float tick = floor(t * 24.0);
  float burstStep = floor(t * 3.0);
  float burst = step(0.82, vhsHash(vec2(burstStep, 2.0)));

  // The screen line, by pairs of pixels.
  float row = floor(vUv.y * uResolution.y * 0.5);

  // The tracking band: its position rolls, its profile is softened.
  float band = clamp(uBand, 0.02, 0.5);
  float rel = fract(vUv.y - t * uSpeed * 0.08) / band;
  float inBand = step(rel, 1.0) * smoothstep(0.0, 0.25, rel) * smoothstep(1.0, 0.75, rel);

  // The offset of the lines: inside the band, drawn per line and per step;
  // everywhere, a shake during the bursts; at the bottom, the switching.
  float wobble = (vhsHash(vec2(row, tick)) - 0.5) * 0.12 * inBand;
  float shake = (vhsHash(vec2(tick, 9.0)) - 0.5) * 0.03 * burst;
  float headSwitch = step(vUv.y, 0.035);
  float switchShift = (vhsHash(vec2(row, floor(t * 12.0))) - 0.5) * 0.06 * headSwitch;

  vec2 uv = vec2(vUv.x * aspect + wobble + shake + switchShift, vUv.y);

  // The two hues read at two spread-apart positions: a little at all times,
  // a great deal during a burst.
  float split = uSplit * 0.01 * (1.0 + 2.0 * burst);
  float first = vhsSignal(uv + vec2(split, 0.0), t).x;
  float second = vhsSignal(uv - vec2(split, 0.0), t).y;

  vec3 colour = mix(uColorA, uColorB, first * 0.8);
  colour = mix(colour, uColorC, second * 0.7);

  // The streaks of the band: per line and per step, thresholded.
  float streak = step(1.0 - clamp(uNoise, 0.0, 1.0) * 0.6, vhsHash(vec2(row * 1.3, tick + 7.0)));
  float streakLength = vhsHash(vec2(row, tick + 3.0));
  float streakHere = streak * step(fract(vUv.x * 2.0 + streakLength), 0.35 + 0.5 * streakLength);
  colour = mix(colour, uColorC, streakHere * inBand * 0.85);

  // The noise of the switching, and a dropped line now and then.
  float switchNoise = step(0.55, vhsHash(vec2(row, floor(t * 12.0) + 1.0))) * headSwitch;
  float dropout = step(0.995, vhsHash(vec2(row, tick))) * step(vUv.x, vhsHash(vec2(tick, row)));
  colour = mix(colour, uColorA, switchNoise * 0.6);
  colour = mix(colour, uColorC, dropout * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
