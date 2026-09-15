/**
 * Glitch blocks shader.
 *
 * ## The mathematical idea
 *
 * A background image — a slow gradient — and, over the top, a grid of blocks
 * in which each row is offset by an amount of its own, so that the blocks do
 * not line up into columns. At every tick of time, a draw per block decides
 * whether it jumps. A block that jumps reads the image elsewhere — shifted
 * horizontally — and writes it with its hues inverted or pulled
 * apart.
 *
 * Everything is chopped into ticks, nothing slides: between two ticks the
 * image is perfectly still. That is what makes a jolt; a continuous shift
 * would make a ripple.
 *
 * Two scales of jump. The blocks, small, frequent. And whole bands — one row
 * in ten, at one tick in twelve — shifted in a single piece, like a picture
 * that has lost a scan line.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the gradient.
 * - `uColorC` — the second, and the hue of the inverted blocks.
 * - `uBlocks` — number of rows of blocks across the height.
 * - `uRate` — ticks per second.
 * - `uAmount` — share of the blocks that jump at each tick.
 * - `uSpeed` — speed of the background gradient.
 */
export const GLITCH_BLOCKS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBlocks;
uniform float uRate;
uniform float uAmount;
uniform float uSpeed;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float blockHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// The background image: a slow gradient in two hues. Returned between zero
// and one for each hue.
vec2 blockImage(vec2 uv, float t) {
  float a = 0.5 + 0.5 * sin(uv.x * 2.2 + uv.y * 1.6 + t);
  float b = 0.5 + 0.5 * sin(uv.y * 3.0 - t * 0.7 + sin(uv.x * 2.0 + t * 0.5));
  return vec2(a, a * b);
}

vec3 blockPaint(vec2 uv, float t) {
  vec2 image = blockImage(uv, t);
  vec3 colour = mix(uColorA, uColorB, image.x * 0.8);
  return mix(colour, uColorC, image.y * 0.7);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;
  float tick = floor(uTime * max(uRate, 0.1));
  float amount = clamp(uAmount, 0.0, 1.0);

  // The grid of blocks: each row has its own offset, so that nothing lines
  // up into columns.
  float rows = clamp(uBlocks, 2.0, 40.0);
  float row = floor(vUv.y * rows);
  float rowShift = blockHash(vec2(row, 17.0));
  vec2 cell = vec2(floor(vUv.x * aspect * rows * 0.7 + rowShift), row);

  // The block's draw at this tick: does it jump, by how much, and how.
  float draw = blockHash(cell + tick * 0.618);
  float jumps = step(1.0 - amount * 0.35, draw);
  float offset = (blockHash(cell * 1.3 + tick) - 0.5) * 0.25 * jumps;
  float invert = step(0.5, blockHash(cell * 2.1 + tick * 1.7)) * jumps;

  // The whole bands: one row in ten, at one tick in twelve.
  float bandDraw = blockHash(vec2(row * 0.37, tick));
  float band = step(1.0 - amount * 0.1, bandDraw) * step(0.92, blockHash(vec2(tick, 5.0)));
  offset += (blockHash(vec2(tick, row)) - 0.5) * 0.12 * band;

  vec2 uv = vec2(vUv.x * aspect + offset, vUv.y);
  vec3 colour = blockPaint(uv, t);

  // An inverted block writes its hues the other way round: the first becomes
  // the second and the background comes to the front. A pulled-apart block
  // reads each hue at a different position.
  vec2 image = blockImage(uv, t);
  vec3 inverted = mix(uColorC, uColorA, image.x * 0.8);
  inverted = mix(inverted, uColorB, image.y * 0.5);

  vec2 split = blockImage(uv + vec2(0.03 * jumps, 0.0), t);
  vec3 spread = mix(uColorA, uColorB, image.x * 0.8);
  spread = mix(spread, uColorC, split.y * 0.9);

  colour = mix(colour, spread, jumps * (1.0 - invert));
  colour = mix(colour, inverted, invert);

  gl_FragColor = vec4(colour, 1.0);
}
`
