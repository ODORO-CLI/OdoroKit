/**
 * Ferrofluid shader.
 *
 * ## The mathematical idea
 *
 * A ferrofluid under a magnet bristles with spikes arranged on a hexagonal
 * lattice. The lattice comes from three cosines at a hundred and twenty
 * degrees: their sum has its maxima on a hexagonal tiling, without a single
 * cell being computed. A power of that sum makes the cones; its exponent
 * grows with the nearness of the magnet, so that the soft mounds far off
 * become needles under the pointer.
 *
 * The magnet's influence is a gaussian of the distance to the pointer. It
 * does two things: it raises the spikes, and it draws the pool along — the
 * fluid's edge, a threshold on the same gaussian perturbed by a noise,
 * follows the magnet.
 *
 * The rendering is that of a relief: the height is evaluated three times,
 * and its gradient serves as the normal. A black, glossy fluid is seen only
 * by its highlights, and it is the normal that places them.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the tray, under the pool.
 * - `uColorB` — the fluid.
 * - `uColorC` — the highlight.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uSpikes` — number of spikes per frame height.
 * - `uReach` — reach of the magnet.
 * - `uHeight` — height of the spikes.
 * - `uGloss` — strength of the highlight.
 * - `uDetail` — noise on the pool's edge, 0 or 1.
 */
export const FERROFLUID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpikes;
uniform float uReach;
uniform float uHeight;
uniform float uGloss;
uniform float uDetail;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float ferroHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float ferroNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = ferroHash(cell);
  float b = ferroHash(cell + vec2(1.0, 0.0));
  float c = ferroHash(cell + vec2(0.0, 1.0));
  float d = ferroHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// The hexagonal lattice: three cosines at a hundred and twenty degrees,
// brought onto [0, 1]. Their common maxima are the vertices of a hexagonal tiling.
float ferroLattice(vec2 p) {
  vec2 d0 = vec2(1.0, 0.0);
  vec2 d1 = vec2(-0.5, 0.8660254);
  vec2 d2 = vec2(-0.5, -0.8660254);
  float sum = cos(dot(p, d0)) + cos(dot(p, d1)) + cos(dot(p, d2));
  return clamp(sum / 3.0 * 0.5 + 0.5, 0.0, 1.0);
}

// The relief: the pool, and the spikes that rise from it.
float ferroRelief(vec2 p, vec2 m, float reach, float frequency, float t) {
  vec2 d = p - m;
  float influence = exp(-dot(d, d) / (reach * reach));

  // The pool's edge: a threshold on the influence, perturbed by a slow noise
  // so that it is not a circle.
  float edge = influence + (ferroNoise(p * 6.0 + t * 0.2) - 0.5) * 0.12 * uDetail;
  float pool = smoothstep(0.08, 0.3, edge);

  // The spikes: soft mounds far from the magnet, needles beneath it. The
  // lattice turns a hair with time, so the fluid seems alive.
  float angle = t * 0.05;
  vec2 q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * (p * frequency);
  float lattice = ferroLattice(q);
  float sharpness = mix(1.5, 9.0, influence);
  float spikes = pow(lattice, sharpness) * influence * uHeight;

  return pool * (0.12 + spikes);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float reach = max(uReach, 0.02);
  float frequency = max(uSpikes, 1.0) * 3.6276;

  // Three evaluations of the relief: the value, and two offsets for the
  // gradient that will serve as the normal.
  float e = 0.003;
  float h = ferroRelief(p, m, reach, frequency, uTime);
  float hx = ferroRelief(p + vec2(e, 0.0), m, reach, frequency, uTime);
  float hy = ferroRelief(p + vec2(0.0, e), m, reach, frequency, uTime);

  vec2 grad = vec2(hx - h, hy - h) / e;
  vec3 n = normalize(vec3(-grad * 0.12, 1.0));

  // The pool's mask, read again without the spikes: where the relief is zero,
  // there is no fluid, only the tray.
  float fluid = smoothstep(0.0, 0.02, h);

  vec3 light = normalize(vec3(-0.5, 0.6, 0.65));
  float diffuse = max(dot(n, light), 0.0);
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 halfStep = normalize(light + view);
  float highlight = pow(max(dot(n, halfStep), 0.0), 60.0) * uGloss;

  // The fluid: dark, a discreet diffuse, a sharp highlight on the edges, and
  // a rim where the surface lies down — that is where black shines.
  float rim = pow(1.0 - max(n.z, 0.0), 2.0);
  vec3 body = uColorB * (0.35 + 0.35 * diffuse);
  body = mix(body, uColorC, rim * 0.45);
  body += uColorC * highlight;

  // The tray: a soft shadow under the pool, lifting it off.
  vec2 dm = p - m;
  float shadow = exp(-dot(dm, dm) / (reach * reach * 2.5)) * 0.15;
  vec3 tray = uColorA * (1.0 - shadow);

  gl_FragColor = vec4(mix(tray, body, fluid), 1.0);
}
`
