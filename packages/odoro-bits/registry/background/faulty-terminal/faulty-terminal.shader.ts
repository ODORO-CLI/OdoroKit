/**
 * Faulty terminal shader.
 *
 * ## The mathematical idea
 *
 * A screen of characters, line by line. The text types itself: a front
 * advances down the lines at constant speed, the current line shows only
 * the characters already typed, and a cursor blinks after them. When the
 * last line is full, the screen clears and it all starts over.
 *
 * The faults are chopped into steps of time, never continuous: a failure
 * occurs, holds for a few frames, stops. Three faults. The flicker dims the
 * whole picture at once. The tearing shifts a band of lines sideways, by a
 * whole number of columns — a fractional shift would read as blur, not as a
 * cut. The corruption replaces the glyph of a few cells with another one,
 * during the same
 * band.
 *
 * ## The glyphs
 *
 * No font, no texture: each glyph is a fifteen-bit mask on a three by five
 * grid, written out in the clear as an integer, and read bit by bit by
 * division by a power of two and parity.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the phosphor of the text.
 * - `uColorC` — the cursor and the corrupted cells.
 * - `uColumns` — number of columns across the width.
 * - `uSpeed` — typing speed, in lines per second.
 * - `uFlicker` — strength of the flicker.
 * - `uTearing` — frequency and amplitude of the tearing.
 */
export const FAULTY_TERMINAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uColumns;
uniform float uSpeed;
uniform float uFlicker;
uniform float uTearing;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float termHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// The bit of a given rank in a mask.
float termBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// Sixteen glyphs on three by five, the most significant bit top left.
float termGlyph(float id) {
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
  float columns = clamp(uColumns, 12.0, 120.0);
  float cellW = aspect / columns;
  float cellH = cellW * 1.5;
  float rows = floor(1.0 / cellH);

  // The failures are chopped: one seed per quarter-second step.
  float burst = floor(uTime * 4.0);
  float faulty = step(1.0 - clamp(uTearing, 0.0, 1.0) * 0.45, termHash(vec2(burst, 3.0)));

  // The tearing: a band of lines shifted by a whole number of columns, for
  // as long as the failure lasts.
  float y = (1.0 - vUv.y) / cellH;
  float bandTop = termHash(vec2(burst, 5.0)) * rows;
  float bandRows = 1.0 + floor(termHash(vec2(burst, 9.0)) * 4.0);
  float inBand = step(bandTop, y) * step(y, bandTop + bandRows);
  float shift = floor((termHash(vec2(burst, 13.0)) - 0.5) * 8.0) * faulty * inBand;

  vec2 p = vec2(vUv.x * aspect / cellW + shift, y);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // The typing front: which line is being typed, and how far.
  float page = rows + 4.0;
  float progress = mod(uTime * uSpeed, page);
  float line = floor(progress);
  float epoch = floor(uTime * uSpeed / page);

  // Each line has its own length, drawn from its rank and from the page. A
  // few lines stay empty: a terminal spaces out its output.
  float lineSeed = termHash(vec2(id.y, epoch));
  float lineLength = step(0.15, lineSeed) * (4.0 + floor(lineSeed * (columns - 8.0)));
  float typed = fract(progress) * lineLength;

  float written = step(id.y + 0.5, line) * step(id.x, lineLength - 1.0);
  float typing = step(abs(id.y - line), 0.5) * step(id.x, typed - 1.0);
  float shown = max(written, typing) * step(id.x, columns - 1.0);

  // The corruption: during the failure, a few cells change glyph.
  float corrupt = faulty * inBand * step(0.7, termHash(id + burst));
  float glyph = floor(termHash(vec2(id.x * 1.7 + id.y * 3.1, epoch + corrupt * burst)) * 16.0);

  vec2 g = vec2(floor(local.x * 4.0), floor(local.y * 6.0));
  float inside = step(g.x, 2.5) * step(g.y, 4.5);
  float bit = termBit(termGlyph(glyph), (4.0 - g.y) * 3.0 + (2.0 - g.x)) * inside;

  // The cursor: a solid block after the typed text, blinking.
  float cursorCol = floor(typed);
  float cursor = step(abs(id.y - line), 0.5) * step(abs(id.x - cursorCol), 0.5)
    * step(0.5, fract(uTime * 2.0)) * step(g.x, 2.5) * step(g.y, 4.5);

  // The flicker: the whole picture dims in fast steps.
  float dim = 1.0 - clamp(uFlicker, 0.0, 1.0) * 0.5 * termHash(vec2(floor(uTime * 24.0), 1.0)) * faulty;

  float ink = bit * shown * dim;
  vec3 colour = mix(uColorA, uColorB, ink * (1.0 - corrupt));
  colour = mix(colour, uColorC, max(ink * corrupt, cursor * dim));

  gl_FragColor = vec4(colour, 1.0);
}
`
