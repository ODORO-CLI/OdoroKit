/**
 * Shader of the ASCII field.
 *
 * ## The mathematical idea
 *
 * A noise field — three octaves of value noise on a slow drift — is never
 * shown as such. It is sampled at the centre of every character cell,
 * quantised into ten levels, and each level picks a character from the
 * classic ramp of the image-to-text converters, ordered by number of lit
 * pixels: from the space to the at sign. The ink density of a cell thus
 * follows the value of the field, and the image reads from afar as a
 * gradient, from up close as text.
 *
 * ## The glyphs
 *
 * No font, no texture: every character is a mask of thirty-five bits over
 * a grid of five by seven. A float does not hold that many without loss;
 * the mask is therefore cut into two integers, the four top rows and the
 * three bottom ones, each read bit by bit through division by a power of
 * two and parity.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the ink.
 * - `uColorC` — the ink of the highest levels.
 * - `uCells` — number of characters across the width.
 * - `uSpeed` — drift speed of the field.
 * - `uScale` — scale of the field; higher means more detail.
 * - `uContrast` — contrast of the field before quantisation.
 */
export const ASCII_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uSpeed;
uniform float uScale;
uniform float uContrast;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float asciiHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float asciiNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = asciiHash(cell);
  float b = asciiHash(cell + vec2(1.0, 0.0));
  float c = asciiHash(cell + vec2(0.0, 1.0));
  float d = asciiHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Three octaves, constant bound.
float asciiField(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += asciiNoise(p) * amplitude;
    p = p * 2.1 + 5.3;
    amplitude *= 0.5;
  }
  return value / 0.875;
}

// The bit of the given rank within a mask.
float asciiBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// The ramp, by increasing density: space . - : + = % * # @. Two integers
// per character: the four top rows, the three bottom ones.
vec2 asciiGlyph(float level) {
  if (level < 0.5) return vec2(0.0, 0.0);
  if (level < 1.5) return vec2(0.0, 396.0);
  if (level < 2.5) return vec2(31.0, 0.0);
  if (level < 3.5) return vec2(12672.0, 12672.0);
  if (level < 4.5) return vec2(4255.0, 4224.0);
  if (level < 5.5) return vec2(992.0, 31744.0);
  if (level < 6.5) return vec2(845892.0, 8563.0);
  if (level < 7.5) return vec2(21983.0, 15008.0);
  if (level < 8.5) return vec2(338922.0, 32074.0);
  return vec2(476917.0, 24079.0);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 10.0, 200.0);

  // One cell: five by seven of glyph, plus one unit of leading on each
  // side. Six units wide, eight tall.
  float cellW = aspect / cells;
  float cellH = cellW * 8.0 / 6.0;

  vec2 p = vec2(vUv.x * aspect / cellW, (1.0 - vUv.y) / cellH);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // The field, read at the centre of the cell, then contrasted and quantised.
  vec2 centre = (id + 0.5) * vec2(cellW, cellH);
  float t = uTime * uSpeed;
  float value = asciiField(centre * uScale + vec2(t * 0.6, t * 0.35));
  value = clamp((value - 0.5) * max(uContrast, 0.1) + 0.5, 0.0, 0.999);
  float level = floor(value * 10.0);

  // The pixel of the glyph: the row picks the integer, the position the bit.
  vec2 g = vec2(floor(local.x * 6.0), floor(local.y * 8.0));
  float inside = step(g.x, 4.5) * step(g.y, 6.5);
  vec2 mask = asciiGlyph(level);
  float top = step(g.y, 3.5);
  float index = mix((6.0 - g.y) * 5.0 + (4.0 - g.x), (3.0 - g.y) * 5.0 + (4.0 - g.x), top);
  float bit = asciiBit(mix(mask.y, mask.x, top), index) * inside;

  vec3 colour = mix(uColorA, uColorB, bit * (0.5 + 0.5 * value));
  colour = mix(colour, uColorC, bit * smoothstep(0.7, 1.0, value));

  gl_FragColor = vec4(colour, 1.0);
}
`
