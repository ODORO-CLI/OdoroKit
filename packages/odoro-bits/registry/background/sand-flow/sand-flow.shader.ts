/**
 * Shader for the flowing sand.
 *
 * ## The mathematical idea
 *
 * Sand is not a sheet: it is a grid of grains. Every cell of a fine grid
 * draws a grain by lot, placed at a hashed spot in the cell; to make a stream
 * flow, it is enough to scroll the grid downwards, each stream at its own
 * speed. The density of the grains follows the distance to the axis of the
 * stream, so that its edges are frayed, grain by grain, rather than cut
 * clean.
 *
 * At the bottom, a heap: a height profile made of mounds under each stream,
 * filled with the same grid, but held still. The falling grains vanish at the
 * surface of the heap, and a little dust rises there.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the sand.
 * - `uColorC` — the bright grains, which catch the light.
 * - `uStreams` — number of streams.
 * - `uGrain` — number of grains per frame height.
 * - `uSpeed` — falling speed.
 * - `uHeap` — height of the heap, in frame heights.
 */
export const SAND_FLOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uStreams;
uniform float uGrain;
uniform float uSpeed;
uniform float uHeap;

// Ceiling on the streams: the loop is bounded by a constant.
const int MAX_STREAMS = 6;

float sandHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float sandHash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sandNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(sandHash(cell), sandHash(cell + 1.0), smoothed);
}

// A grain in its cell: present if the draw passes the threshold, drawn as a
// disc at a hashed spot in the cell. Returns 0 or the coverage of the disc.
float sandGrain(vec2 q, float threshold, float radius, float pixel) {
  vec2 cell = floor(q);
  float draw = sandHash2(cell);
  if (draw > threshold) return 0.0;
  vec2 centre = cell + 0.5 + (vec2(sandHash2(cell + 3.7), sandHash2(cell + 9.1)) - 0.5) * 0.5;
  float d = length(q - centre);
  return 1.0 - smoothstep(radius - pixel, radius + pixel, d);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float grain = max(uGrain, 20.0);
  // One pixel, in grain cells: used to smooth the discs.
  float pixel = grain / max(uResolution.y, 1.0);
  int total = int(clamp(uStreams, 1.0, float(MAX_STREAMS)));

  // The nearest stream: its distance, its speed and its landing point.
  float nearest = 10.0;
  float speed = 1.0;
  float width = 0.02;
  float nearestIndex = 0.0;
  float heap = 0.0;

  for (int i = 0; i < MAX_STREAMS; i += 1) {
    if (i >= total) break;
    float index = float(i);
    float seed = sandHash(index * 5.3 + 1.1);
    // The streams spread out over the width, offset a little at random.
    float base = (index + 0.5) / float(total) * aspect + (seed - 0.5) * 0.12 * aspect / float(total);
    // A stream barely undulates: sand falls straight, give or take a breath.
    float axis = base + (sandNoise(vUv.y * 2.5 + uTime * 0.35 + seed * 30.0) - 0.5) * 0.03;
    float offset = abs(p.x - axis);
    if (offset < nearest) {
      nearest = offset;
      speed = 0.75 + seed * 0.5;
      width = 0.014 + sandHash(index * 2.9) * 0.016;
      nearestIndex = index;
    }
    // Each stream raises a mound beneath it.
    float mound = exp(-pow((p.x - base) / (0.09 + seed * 0.05), 2.0));
    heap += mound;
  }

  // The profile of the heap: a flat base, mounds, a surface grain.
  float height = uHeap * (0.35 + 0.65 * min(heap, 1.3) / 1.3)
    + (sandNoise(p.x * 18.0) - 0.5) * 0.012;
  float inHeap = step(vUv.y, height);

  vec3 colour = uColorA;

  // The falling stream: the grid scrolls downwards at the speed of the
  // stream, and the density frays out with the distance to the axis.
  float density = 0.6 * smoothstep(width, width * 0.25, nearest);
  vec2 fall = vec2(p.x, vUv.y + uTime * uSpeed * speed * 0.9 + nearestIndex * 3.7) * grain;
  float fallingGrain = sandGrain(fall, density, 0.36, pixel) * (1.0 - inHeap);
  // A soft shadow along the stream: it stays visible between two grains.
  float veil = smoothstep(width * 1.5, 0.0, nearest) * 0.1 * (1.0 - inHeap);

  // The heap: the same grid, held still, denser, whose surface opens up
  // grain by grain.
  float surface = smoothstep(0.0, 0.015, height - vUv.y);
  vec2 rest = p * grain * 1.15 + 17.0;
  float heapGrain = sandGrain(rest, 0.45 + 0.4 * surface, 0.4, pixel) * inHeap;
  float heapShade = inHeap * (0.35 + 0.35 * surface);

  // The dust at the landing point: a breath that pulses.
  float pulse = 0.6 + 0.4 * sandNoise(uTime * 6.0 + nearestIndex * 11.0);
  float dust = exp(-pow(nearest / 0.05, 2.0)) * exp(-max(vUv.y - height, 0.0) * 30.0)
    * (1.0 - inHeap) * 0.18 * pulse;

  // The bright grains are drawn by lot among the grains, each one from its
  // own cell: a falling grain keeps its tint as it falls.
  vec2 cell = fallingGrain > heapGrain ? floor(fall) : floor(rest);
  float bright = step(0.78, sandHash2(cell + 2.0));

  colour = mix(colour, uColorB, clamp(veil + heapShade + dust, 0.0, 1.0));
  float grains = max(fallingGrain, heapGrain);
  colour = mix(colour, mix(uColorB, uColorC, bright), grains * 0.95);

  gl_FragColor = vec4(colour, 1.0);
}
`
