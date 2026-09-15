/**
 * Shader of the oscilloscope.
 *
 * ## The mathematical idea
 *
 * An oscilloscope does not draw a curve: a spot sweeps the screen from left
 * to right, and the phosphor keeps the trail of its passage as it dies away.
 * Each fragment therefore reconstructs the age of its own pixel: the spot
 * sits at abscissa `fract(t)` of the current sweep, and a fragment to its
 * left was lit in that sweep, a fragment to its right in the previous one.
 * The age is the difference of the two moments, and the intensity its
 * decreasing exponential — that is the persistence.
 *
 * The signal is frozen per sweep: its phases depend on the sweep number, not
 * on continuous time. Without that the trail would ripple behind the spot,
 * which no phosphor does.
 *
 * The distance to the trail is divided by the norm of its slope, as for any
 * y = f(x). A fixed graticule, underneath, gives the scale.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the graticule.
 * - `uColorC` — the phosphor.
 * - `uSpeed` — sweeps per second.
 * - `uDecay` — decay speed of the phosphor.
 * - `uFrequency` — periods of the signal in the frame.
 * - `uAmplitude` — height of the signal, as a fraction of the frame.
 */
export const OSCILLOSCOPE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDecay;
uniform float uFrequency;
uniform float uAmplitude;

// The signal of sweep n: three sines whose phases depend on n.
float signal(float x, float n) {
  float w = uFrequency * 6.2831853;
  return sin(x * w + n * 0.4) * 0.6
    + sin(x * w * 2.3 + n * 0.9) * 0.25
    + sin(x * w * 0.5 + n * 1.7) * 0.15;
}

// Derivative of the signal with respect to x, to normalise the thickness. The
// name keeps "signal" in front because a bare "slope" would collide with the
// local that holds its value in main().
float signalSlope(float x, float n) {
  float w = uFrequency * 6.2831853;
  return cos(x * w + n * 0.4) * 0.6 * w
    + cos(x * w * 2.3 + n * 0.9) * 0.25 * w * 2.3
    + cos(x * w * 0.5 + n * 1.7) * 0.15 * w * 0.5;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);
  float x = vUv.x;

  // The current sweep and the position of the spot.
  float speed = max(uSpeed, 0.01);
  float sweeps = uTime * speed;
  float current = floor(sweeps);
  float spot = fract(sweeps);

  // This fragment was lit in this sweep if it sits behind the spot, in the
  // previous one otherwise. The age follows from that.
  float behind = step(x, spot);
  float n = current - (1.0 - behind);
  float lit = (n + x) / speed;
  float age = uTime - lit;

  float y = 0.5 + signal(x, n) * uAmplitude;
  float slope = signalSlope(x, n) * uAmplitude / aspect;
  float d = abs(vUv.y - y) / sqrt(1.0 + slope * slope);

  float persistence = exp(-age * uDecay);
  float core = 1.0 - smoothstep(px * 0.8, px * 2.2, d);
  float glow = exp(-d * 90.0);
  float trace = (core + glow * 0.6) * persistence;

  // The spot itself: a brighter point where the sweep has got to.
  float head = exp(-length(vec2((x - spot) * aspect, vUv.y - y)) * 60.0);

  // The graticule: ten divisions across, eight down.
  vec2 cell = abs(fract(vUv * vec2(10.0, 8.0) + 0.5) - 0.5);
  vec2 cellPx = cell / vec2(10.0, 8.0) * uResolution;
  float rule = 1.0 - smoothstep(0.5, 1.5, min(cellPx.x, cellPx.y));
  float axes = 1.0 - smoothstep(px, px * 2.0, min(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  vec3 colour = mix(uColorA, uColorB, rule * 0.35 + axes * 0.5);
  colour = mix(colour, uColorC, clamp(trace, 0.0, 1.0));
  colour += uColorC * head * 0.8;

  gl_FragColor = vec4(colour, 1.0);
}
`
