/**
 * Shader for the pulsing halo.
 *
 * ## The mathematical idea
 *
 * A gaussian core that breathes to the rhythm of an adjustable period, and
 * rings emitted at that same rhythm: each is a gaussian of the distance to
 * the centre, whose radius grows with its phase, which widens and pales as
 * it moves away. The rings spread evenly over the period, so that the
 * emission is steady, never in bursts.
 *
 * Distinct from the sonar, whose fronts are steep, follow the pointer and
 * leave a dark wake: here everything is soft, slow, and applied by bounded
 * mixing towards the hues.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the rings and the halo.
 * - `uColorC` — the core.
 * - `uX`, `uY` — position of the centre, as a fraction of the frame.
 * - `uPeriod` — period of the rhythm, in seconds.
 * - `uRings` — number of rings in flight.
 * - `uSize` — reach of the rings, in frame heights.
 */
export const HALO_PULSE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uPeriod;
uniform float uRings;
uniform float uSize;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(uX * aspect, uY);
  float r = length(p - centre);

  float period = max(uPeriod, 0.5);
  float reach = max(uSize, 0.1);
  int n = int(clamp(uRings, 1.0, 6.0));

  // The rings: each offset by a fraction of the period, for a steady
  // emission. The radius grows with the phase; so does the width, and the
  // intensity falls as a square — a ring dies before its reach.
  float rings = 0.0;
  for (int i = 0; i < 6; i += 1) {
    if (i >= n) break;
    float phase = fract(uTime / period + float(i) / float(n));
    float radius = phase * reach;
    float width = 0.012 + 0.06 * phase;
    float e = (r - radius) / width;
    float life = 1.0 - phase;
    rings += exp(-e * e) * life * life;
  }

  // The core breathes to the same rhythm: it swells at emission.
  float breath = 0.5 + 0.5 * sin(uTime / period * 6.2831853);
  float core = exp(-r * r / (0.012 + 0.012 * breath));
  float halo = exp(-r * (7.0 - 2.5 * breath)) * 0.5;

  vec3 colour = mix(uColorA, uColorB, clamp(rings * 0.8 + halo * 0.6, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(core * (0.7 + 0.3 * breath), 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
