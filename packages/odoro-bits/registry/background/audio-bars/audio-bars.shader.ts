/**
 * Shader of the audio bars.
 *
 * ## The mathematical idea
 *
 * No sound is listened to: the level of each bar is a value noise read at
 * (bar index, time). The noise is smooth in time — the bar rises and falls,
 * it does not jump — and independent from one bar to the next — two
 * neighbours do not move together. It is that pair of properties that makes
 * a spectrum believable.
 *
 * A bell envelope centred on the first third gives more height to the low
 * end than to the treble, as on a real analyser; a slow beat shared by
 * every bar stands in for a bar of music.
 *
 * The peak is a second noise, read more slowly and taken at the maximum
 * with the level: it comes down after the bar, which is exactly what a
 * falling peak indicator does.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the foot of the bars.
 * - `uColorC` — their top and the peak.
 * - `uBars` — number of bars.
 * - `uSpeed` — speed of the spectrum.
 * - `uGap` — space between bars, as a fraction of their pitch.
 * - `uSegments` — number of segments per bar; zero for solid bars.
 * - `uMirror` — one for a spectrum mirrored around the middle.
 */
export const AUDIO_BARS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBars;
uniform float uSpeed;
uniform float uGap;
uniform float uSegments;
uniform float uMirror;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float barHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise, smooth in time only: the bars are independent, so the
// interpolation happens along the time axis alone.
float barLevel(float bar, float t) {
  float cell = floor(t);
  float local = fract(t);
  float smoothed = local * local * (3.0 - 2.0 * local);
  float a = barHash(vec2(bar, cell));
  float b = barHash(vec2(bar, cell + 1.0));
  return mix(a, b, smoothed);
}

void main() {
  float bars = clamp(uBars, 4.0, 96.0);
  float index = floor(vUv.x * bars);
  float local = fract(vUv.x * bars);
  float t = uTime * uSpeed;

  // Bell envelope over the first third: the low end climbs higher.
  float position = (index + 0.5) / bars;
  float envelope = 0.35 + 0.65 * exp(-pow((position - 0.3) * 2.4, 2.0));

  // The shared beat: the measure that every bar follows.
  float beat = 0.85 + 0.15 * sin(t * 2.4);

  float level = envelope * beat * (0.12 + 0.88 * barLevel(index, t * 3.0));
  float peak = max(level, envelope * (0.12 + 0.88 * barLevel(index + 0.5, t * 1.1))) + 0.03;

  // The height read: from the bottom, or from the middle when mirrored.
  float y = mix(vUv.y, abs(vUv.y - 0.5) * 2.0, uMirror);
  float px = 1.0 / max(uResolution.y, 1.0);

  float halfGap = clamp(uGap, 0.0, 0.9) * 0.5;
  float column = step(halfGap, local) * step(local, 1.0 - halfGap);

  float fill = (1.0 - smoothstep(level - px, level + px, y)) * column;

  // The segments: rows of background at a regular interval.
  float segments = max(uSegments, 0.0);
  float rows = fract(y * segments);
  float led = mix(1.0, step(0.25, rows), step(1.0, segments));
  fill *= led;

  // The peak: a thin segment, one notch above the level.
  float cap = (1.0 - smoothstep(px * 1.5, px * 3.0, abs(y - peak))) * column;

  // From the foot to the top, the colour climbs towards the bright end.
  float rise = clamp(y / max(level, 0.001), 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, fill);
  colour = mix(colour, uColorC, fill * rise * rise);
  colour = mix(colour, uColorC, cap * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
