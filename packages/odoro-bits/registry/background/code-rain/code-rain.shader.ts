/**
 * Code rain shader.
 *
 * ## The mathematical idea
 *
 * The screen is cut into character cells. Each column carries one drop: a
 * head falling at its own speed, followed by a trail whose intensity decays
 * exponentially with age — the number of rows separating it from the head.
 * The fall wraps over the height plus the length of the trail, so that a
 * drop leaves the bottom entirely before setting off again from the
 * top.
 *
 * ## The glyphs
 *
 * No font, no texture: each glyph is a fifteen-bit mask on a three by five
 * grid, written out in the clear as an integer. The bit at a position is
 * read by division by a power of two and parity — the language used here
 * has no bitwise operations, but a float holds fifteen bits without loss.
 * A cell changes glyph at its own rhythm, drawn from its position: a rain
 * in which every character mutates together reads as a
 * stroboscope.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the trail.
 * - `uColorC` — the head.
 * - `uColumns` — number of columns across the width.
 * - `uSpeed` — falling speed.
 * - `uTrail` — length of the trail, in rows.
 * - `uMutate` — rate of glyph changes, per second.
 */
export const CODE_RAIN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uColumns;
uniform float uSpeed;
uniform float uTrail;
uniform float uMutate;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float rainHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// The bit of a given rank in a mask: division by a power of two, then
// parity. Exact as long as the mask fits in the mantissa.
float rainBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// Sixteen glyphs on three by five, the most significant bit top left.
float rainGlyph(float id) {
  if (id < 0.5) return 31599.0;
  if (id < 1.5) return 11415.0;
  if (id < 2.5) return 29671.0;
  if (id < 3.5) return 29391.0;
  if (id < 4.5) return 23497.0;
  if (id < 5.5) return 31183.0;
  if (id < 6.5) return 29330.0;
  if (id < 7.5) return 31695.0;
  if (id < 8.5) return 11245.0;
  if (id < 9.5) return 31143.0;
  if (id < 10.5) return 31140.0;
  if (id < 11.5) return 23533.0;
  if (id < 12.5) return 18727.0;
  if (id < 13.5) return 29842.0;
  if (id < 14.5) return 29351.0;
  return 23186.0;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float columns = clamp(uColumns, 8.0, 120.0);

  // One cell: three by five of glyph, plus one leading on each side. Four
  // units wide, six high.
  float cellW = aspect / columns;
  float cellH = cellW * 1.5;
  float rows = floor(1.0 / cellH) + 1.0;

  vec2 p = vec2(vUv.x * aspect / cellW, (1.0 - vUv.y) / cellH);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // This column's drop: its speed, its start, its position.
  float seed = rainHash(vec2(id.x, 7.0));
  float cycle = rows + uTrail;
  float head = mod(uTime * uSpeed * (3.0 + 5.0 * seed) + seed * cycle, cycle);

  // The row's age: zero at the head, growing behind it, and wrapped over
  // the cycle so the tail of the previous drop survives.
  float age = mod(head - id.y, cycle);
  float trail = exp(-age / max(uTrail, 0.5)) * step(age, uTrail * 2.5);
  float tip = 1.0 - smoothstep(0.0, 1.0, age);

  // The cell's glyph, redrawn at its own rhythm.
  float epoch = floor(uTime * uMutate + rainHash(id) * 11.0);
  float glyph = floor(rainHash(vec2(id.x * 3.1 + id.y, epoch)) * 16.0);
  vec2 g = vec2(floor(local.x * 4.0), floor(local.y * 6.0));
  float inside = step(g.x, 2.5) * step(g.y, 4.5);
  float bit = rainBit(rainGlyph(glyph), (4.0 - g.y) * 3.0 + (2.0 - g.x)) * inside;

  // Each cell has its own luminance: a uniform trail would read as a bar,
  // not as characters.
  float shade = 0.6 + 0.4 * rainHash(id + epoch);

  vec3 colour = mix(uColorA, uColorB, bit * trail * shade);
  colour = mix(colour, uColorC, bit * tip);

  gl_FragColor = vec4(colour, 1.0);
}
`
