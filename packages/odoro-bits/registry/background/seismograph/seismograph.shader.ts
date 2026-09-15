/**
 * Shader of the seismograph.
 *
 * ## The mathematical idea
 *
 * The paper scrolls to the left; the styli are fixed. A fragment at abscissa x
 * therefore carries what a stylus wrote there at some past instant, and that
 * instant can be computed: the point of paper under the fragment was under the
 * stylus `(xStylus - x) / speed` seconds ago. A click places a stylus at its
 * abscissa; the shake it writes is a damped sine of the time elapsed since the
 * click, and it can only exist on the paper that has already passed under that
 * stylus — between the point of the click and the length of paper scrolled
 * since.
 *
 * Each trace is confined to its horizontal band: the shake is weighted by the
 * vertical distance between the trace and the click, as a Gaussian, and its
 * amplitude is bounded to half a band. The fragment therefore evaluates only
 * its own trace, and the eight live clicks.
 *
 * The slope of the trace is obtained by finite difference rather than by
 * analytic differentiation: the sum of eight windowed damped sines differentiates
 * badly, and two more evaluations cost less than a wrong formula.
 *
 * A click at -1000 has a huge age: its shake is out from the start.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the paper.
 * - `uColorB` — the ink of the traces.
 * - `uColorC` — the fresh ink of a shake.
 * - `uClicks` — eight clicks (x, y, start time), ring buffer.
 * - `uTraces` — number of traces.
 * - `uScroll` — speed of the paper, in frame widths per second.
 * - `uDecay` — rate at which the shakes are damped.
 * - `uAmplitude` — strength of the shakes, in half-bands.
 */
export const SEISMOGRAPH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[8];
uniform float uTraces;
uniform float uScroll;
uniform float uDecay;
uniform float uAmplitude;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float seismoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// One-dimensional value noise along the paper, per trace.
float seismoNoise(float u, float row) {
  float cell = floor(u);
  float local = fract(u);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(seismoHash(vec2(cell, row)), seismoHash(vec2(cell + 1.0, row)), smoothed);
}

// The shake written on the paper at abscissa x, for the given trace. Returns a
// displacement as a fraction of a half-band, and the freshness of the ink.
vec2 shakeAt(float x, float centre, float traces) {
  float shake = 0.0;
  float fresh = 0.0;

  // Constant bounds: the language specification demands it, and eight live
  // shakes are enough — the ninth would already have left the frame.
  for (int i = 0; i < 8; i += 1) {
    vec3 click = uClicks[i];
    float age = uTime - click.z;

    // The time elapsed since the click when this point of paper was under the
    // stylus: negative to the right of the stylus (not yet written), greater
    // than the age to the left of the scrolled length (written before the
    // click).
    float tau = age + (x - click.x) / max(uScroll, 0.001);
    float written = step(0.0, tau) * step(tau, age);

    // A damped sine, whose frequency falls with time as an aftershock dulls.
    float envelope = exp(-uDecay * max(tau, 0.0));
    float wave = sin(tau * (28.0 - 12.0 * clamp(tau, 0.0, 1.0)));

    // The trace only trembles if the click is at its height.
    float reach = exp(-pow((centre - click.y) * traces * 0.8, 2.0));

    shake += wave * envelope * written * reach;
    fresh = max(fresh, envelope * written * reach);
  }

  return vec2(shake, fresh);
}

// The ordinate of the trace at abscissa x: its axis, the background tremble of
// the paper, the shake.
float trace(float x, float index, float traces, float pitch) {
  float centre = (index + 0.5) * pitch;

  // The paper in its own coordinates: whatever is written on it scrolls with it.
  float paper = x + uTime * uScroll;
  float jitter = (seismoNoise(paper * 60.0, index) - 0.5) * pitch * 0.12;

  float shake = clamp(shakeAt(x, centre, traces).x * uAmplitude, -1.0, 1.0);
  return centre + jitter + shake * pitch * 0.45;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float traces = clamp(uTraces, 1.0, 8.0);
  float pitch = 1.0 / traces;
  float index = floor(vUv.y * traces);
  float px = 1.0 / max(uResolution.y, 1.0);

  // Slope by finite difference, two reads either side.
  float e = 1.5 / max(uResolution.x, 1.0);
  float y = trace(vUv.x, index, traces, pitch);
  float slope = (trace(vUv.x + e, index, traces, pitch) - trace(vUv.x - e, index, traces, pitch))
    / (2.0 * e * aspect);
  float d = abs(vUv.y - y) / sqrt(1.0 + slope * slope);

  float ink = 1.0 - smoothstep(px * 0.7, px * 1.9, d);
  float fresh = shakeAt(vUv.x, (index + 0.5) * pitch, traces).y;

  // The paper: a thin rule per band, and graduations scrolling past.
  float rule = 1.0 - smoothstep(px * 0.5, px * 1.5, abs(fract(vUv.y * traces + 0.5) - 0.5) * pitch);
  float paper = vUv.x + uTime * uScroll;
  float tick = 1.0 - smoothstep(0.0, 1.5 / max(uResolution.x, 1.0), abs(fract(paper * 20.0 + 0.5) - 0.5) / 20.0);

  vec3 colour = mix(uColorA, uColorB, rule * 0.12 + tick * 0.06);
  colour = mix(colour, uColorB, ink * 0.9);
  colour = mix(colour, uColorC, ink * fresh);

  gl_FragColor = vec4(colour, 1.0);
}
`
