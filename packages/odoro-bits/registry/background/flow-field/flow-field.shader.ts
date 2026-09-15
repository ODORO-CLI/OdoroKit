/**
 * Flow field shader.
 *
 * ## The mathematical idea
 *
 * A divergence-free velocity field — the gradient of a value noise turned by
 * a quarter turn — and particles that follow it. No simulation: each
 * fragment walks back up the field against the current, step by step, and
 * looks whether a seed lives upstream. A seed is a cell of a grid whose hash
 * passes a threshold; its particle is born at the seed, advances one step
 * per unit of age, and drags a fading tail behind it.
 *
 * Walking back up the field from the fragment gives the same path as walking
 * down it from the seed, up to the integration error: that is what makes it
 * possible to draw the trajectory without ever storing it.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the trail.
 * - `uColorC` — the head of the particle.
 * - `uScale` — frequency of the noise, hence the size of the eddies.
 * - `uSpeed` — speed of the particles.
 * - `uDensity` — share of the cells that carry a seed.
 * - `uTrail` — length of the tail, in steps.
 * - `uSteps` — number of steps walked back per fragment, hence the reach.
 */
export const FLOW_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uScale;
uniform float uSpeed;
uniform float uDensity;
uniform float uTrail;
uniform float uSteps;

// Ceiling on the steps walked back: the loop is bounded by a constant, the
// setting only shortens it.
const int MAX_STEPS = 24;

// Integration step, in frame heights.
const float STEP = 0.011;

// Size of the seed cells: a little wider than the step, so that a path
// never skips a cell it crosses.
const float CELLS = 44.0;

// Projection onto an arbitrary direction, amplified sine, fractional
// part. Hashing by the product of the coordinates, shorter, leaves
// diagonal traces that the field lines up into a rail of particles.
float flowHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// 2D value noise, smoothed interpolation between four draws.
float flowNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);
  float a = flowHash(cell);
  float b = flowHash(cell + vec2(1.0, 0.0));
  float c = flowHash(cell + vec2(0.0, 1.0));
  float d = flowHash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// The field: the gradient of the noise turned by a quarter turn. Such a
// field has no divergence, so the particles neither pile up nor drain away
// anywhere — they turn.
vec2 flowField(vec2 p) {
  vec2 drift = vec2(uTime * 0.05, -uTime * 0.035);
  vec2 q = p * uScale + drift;
  float e = 0.03;
  float centre = flowNoise(q);
  float right = flowNoise(q + vec2(e, 0.0));
  float up = flowNoise(q + vec2(0.0, e));
  vec2 gradient = vec2(right - centre, up - centre) / e;
  vec2 field = vec2(gradient.y, -gradient.x);
  return field / max(length(field), 0.25);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  int steps = int(clamp(uSteps, 2.0, float(MAX_STEPS)));
  float reach = float(steps) + uTrail;

  vec2 q = p;
  float tail = 0.0;
  float head = 0.0;

  for (int i = 0; i < MAX_STEPS; i += 1) {
    if (i >= steps) break;
    vec2 direction = flowField(q);
    q -= direction * STEP;

    vec2 cell = floor(q * CELLS);
    float draw = flowHash(cell);
    if (draw > uDensity) continue;

    // The seed is a precise point of its cell; the trace is lit only within
    // the perpendicular offset, otherwise the whole cell would light up as a
    // ribbon.
    vec2 seed = (cell + 0.5 + (vec2(flowHash(cell + 3.1), flowHash(cell + 7.7)) - 0.5) * 0.8) / CELLS;
    vec2 offset = q - seed;
    float perpendicular = abs(offset.x * direction.y - offset.y * direction.x);
    float profile = exp(-perpendicular * perpendicular * 60000.0);

    // The particle's age advances with time; its head is "age" steps from the
    // seed, and the fragment is "i" steps away: the difference says where one
    // is along the tail.
    float phase = fract(uTime * uSpeed * 0.28 + flowHash(cell + 11.3));
    float age = phase * reach;
    float behind = age - float(i);
    float alive = step(0.0, behind) * (1.0 - smoothstep(0.0, uTrail, behind));

    tail = max(tail, alive * profile);
    head = max(head, alive * profile * exp(-behind * 1.6));
  }

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, tail * 0.85);
  colour += uColorC * head * 0.9;

  // A discreet vignette, so that the sheet is not wallpaper.
  float edge = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour = mix(colour, uColorA, smoothstep(0.55, 1.1, edge) * 0.3);

  gl_FragColor = vec4(colour, 1.0);
}
`
