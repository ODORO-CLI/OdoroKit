/**
 * Fireworks shader.
 *
 * ## The mathematical idea
 *
 * A burst is a start point, an age and a seed. Each spark leaves it in a
 * direction spread around the circle, at a hashed speed, and its position
 * at instant t is analytic: the distance travelled under a drag
 * proportional to the speed is `v0 (1 - e^{-kt}) / k` — the sparks slow
 * down of their own accord — and gravity takes `g t^2 / 2` off the height.
 * Nothing is integrated from frame to frame: each fragment solves the spark
 * where it is.
 *
 * The fading out is an exponential of the age, modulated by a fast flicker
 * of its own phase; a brief flash at the start point marks the explosion
 * itself.
 *
 * The bursts live in a buffer of six slots timestamped by the engine clock
 * — a start at -1000 gives an enormous age, hence an inert burst — and an
 * automatic burst, drawn from a period counter, goes off on its own at a
 * hashed point: a sky that comes alive only on a click would stay empty on
 * most pages.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the sky.
 * - `uColorB`, `uColorC` — the two spark hues, mixed per burst.
 * - `uClicks` — six bursts (x, y, start time), circular buffer.
 * - `uSparks` — sparks per burst, and so the cost.
 * - `uGravity` — strength of the fall-back.
 * - `uDecay` — rate at which the sparks fade out.
 * - `uAuto` — period of the automatic bursts, in seconds; zero cuts them.
 */
export const FIREWORKS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[6];
uniform float uSparks;
uniform float uGravity;
uniform float uDecay;
uniform float uAuto;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float burstHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same seed.
vec2 burstHash2(vec2 p) {
  return vec2(burstHash(p), burstHash(p + vec2(37.3, 17.7)));
}

// Light a burst lays down at point p, at the given age.
vec3 burst(vec2 p, vec2 origin, float age, float seed, int sparks) {
  // Too early or too old: nothing to compute, and that is the case for every
  // empty slot of the buffer.
  if (age < 0.0 || age > 6.0) return vec3(0.0);

  vec3 light = vec3(0.0);
  float burstTint = burstHash(vec2(seed, 3.1));
  float k = 1.6;

  // Constant bounds: the language specification demands it; quality exits
  // earlier.
  for (int j = 0; j < 48; j += 1) {
    if (j >= sparks) break;
    float fj = float(j);
    vec2 h = burstHash2(vec2(fj, seed));

    // Directions spread around the circle, each nudged a little: a regular
    // burst looks mechanical, a random burst has holes.
    float angle = (fj + h.x * 0.8) / float(sparks) * 6.28318;
    float v0 = 0.22 + 0.25 * h.y;

    float reach = v0 * (1.0 - exp(-k * age)) / k;
    vec2 pos = origin + vec2(cos(angle), sin(angle)) * reach;
    pos.y -= uGravity * age * age * 0.5;

    float d = length(p - pos);
    float size = 0.006 + 0.004 * h.y;
    float core = exp(-d * d / (size * size));
    float halo = 0.15 * exp(-d * d / (size * size * 12.0));

    float decay = exp(-uDecay * age) * (0.75 + 0.25 * sin(age * 25.0 + h.x * 6.28318));
    decay *= smoothstep(0.0, 0.05, age);

    vec3 tint = mix(uColorB, uColorC, fract(burstTint + h.y * 0.35));
    light += tint * (core + halo) * decay;
  }

  // The flash of the explosion: broad, brief, at the start point.
  float d0 = length(p - origin);
  light += uColorC * exp(-d0 * d0 / 0.002) * exp(-age * 12.0) * 2.0;

  return light;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int sparks = int(clamp(uSparks, 4.0, 48.0));

  vec3 colour = uColorA;

  for (int i = 0; i < 6; i += 1) {
    vec3 click = uClicks[i];
    vec2 origin = click.xy * vec2(aspect, 1.0);
    colour += burst(p, origin, uTime - click.z, click.z * 7.3 + float(i), sparks);
  }

  // The automatic burst: one per period, at a hashed point of the frame's top.
  if (uAuto > 0.0) {
    float period = max(uAuto, 0.5);
    float index = floor(uTime / period);
    float autoAge = uTime - index * period;
    vec2 autoOrigin = vec2(0.2 + 0.6 * burstHash(vec2(index, 1.3)), 0.45 + 0.4 * burstHash(vec2(index, 9.1)));
    colour += burst(p, autoOrigin * vec2(aspect, 1.0), autoAge, index * 3.7, sparks);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
