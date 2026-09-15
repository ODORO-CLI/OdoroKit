/**
 * Shader of the pixel blast.
 *
 * ## The mathematical idea
 *
 * The frame is a grid of square pixels, and everything drawn in it is aligned
 * on that grid: the fragment knows nothing but the grid cell it occupies. A
 * burst is a start point, an age and a seed; each of its pixels leaves in a
 * hashed direction, is slowed by a drag and falls back under gravity —
 * analytic position, nothing is integrated from frame to frame. The pixel is
 * lit if its grid cell is the fragment's: no halo, no disc, a crisp square
 * that hops from cell to cell.
 *
 * The blast itself is a solid square that widens by one cell per instant and
 * dies out at once. A pixel that reaches the bottom of the frame stops there
 * for a moment before vanishing: that is what makes the fall read.
 *
 * The bursts live in a buffer of five slots stamped by the engine clock — a
 * start at -1000 gives an enormous age, hence an inert burst — and an
 * automatic burst goes off on its own at a hashed point.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB`, `uColorC` — the two pixel hues, blended per burst.
 * - `uClicks` — five bursts (x, y, start time), ring buffer.
 * - `uPixels` — pixels of the grid over the height.
 * - `uCount` — pixels per burst, and therefore the cost.
 * - `uGravity` — strength of the fall.
 * - `uAuto` — period of the automatic bursts, in seconds; zero switches them off.
 */
export const PIXEL_BLAST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[5];
uniform float uPixels;
uniform float uCount;
uniform float uGravity;
uniform float uAuto;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float blastHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for one and the same seed.
vec2 blastHash2(vec2 p) {
  return vec2(blastHash(p), blastHash(p + vec2(37.3, 17.7)));
}

// Light a burst lays into the given grid cell, at the given age.
vec3 burst(vec2 cell, vec2 origin, float age, float seed, int pixels, float grid) {
  if (age < 0.0 || age > 4.0) return vec3(0.0);

  vec3 light = vec3(0.0);
  float hue = blastHash(vec2(seed, 3.1));
  float k = 1.4;
  float reach = (1.0 - exp(-k * age)) / k;
  float fall = uGravity * age * age * 0.5;
  float ground = 0.5 / grid;

  // Constant bounds: the language specification demands them; the quality
  // leaves earlier.
  for (int j = 0; j < 32; j += 1) {
    if (j >= pixels) break;
    float fj = float(j);
    vec2 h = blastHash2(vec2(fj, seed));

    float angle = (fj + h.x * 0.9) / float(pixels) * 6.2831853;
    float v0 = 0.25 + 0.3 * h.y;

    vec2 pos = origin + vec2(cos(angle), sin(angle)) * v0 * reach;
    pos.y -= fall;

    // The pixel stops at the ground, then dies out: the fall reads.
    float posed = step(pos.y, ground);
    pos.y = max(pos.y, ground);

    vec2 pc = floor(pos * grid);
    float hit = step(abs(pc.x - cell.x), 0.5) * step(abs(pc.y - cell.y), 0.5);

    float life = exp(-age * (0.9 + 0.6 * h.x)) * (1.0 - posed * min(age, 1.0) * 0.6);
    vec3 colour = mix(uColorB, uColorC, fract(hue + h.y * 0.4));
    light += colour * hit * life;
  }

  // The blast: a solid square that widens by one cell per instant.
  vec2 oc = floor(origin * grid);
  float radius = floor(age * 18.0);
  float square = step(max(abs(cell.x - oc.x), abs(cell.y - oc.y)), radius) * exp(-age * 9.0);
  light += uColorC * square;

  return light;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float grid = max(uPixels, 4.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 cell = floor(p * grid);
  int pixels = int(clamp(uCount, 4.0, 32.0));

  // The grid at rest: a barely visible checker, so that the pixels have a
  // lattice to land on.
  float checker = mod(cell.x + cell.y, 2.0);
  vec3 colour = mix(uColorA, uColorB, 0.025 + 0.02 * checker);

  for (int i = 0; i < 5; i += 1) {
    vec3 click = uClicks[i];
    vec2 origin = click.xy * vec2(aspect, 1.0);
    colour += burst(cell, origin, uTime - click.z, click.z * 7.3 + float(i), pixels, grid);
  }

  // The automatic burst: one per period, at a hashed point of the frame.
  if (uAuto > 0.0) {
    float period = max(uAuto, 0.5);
    float index = floor(uTime / period);
    float autoAge = uTime - index * period;
    vec2 autoOrigin = vec2(0.15 + 0.7 * blastHash(vec2(index, 1.3)), 0.35 + 0.5 * blastHash(vec2(index, 9.1)));
    colour += burst(cell, autoOrigin * vec2(aspect, 1.0), autoAge, index * 3.7, pixels, grid);
  }

  gl_FragColor = vec4(min(colour, vec3(1.0)), 1.0);
}
`
