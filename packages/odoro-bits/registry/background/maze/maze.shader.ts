/**
 * Shader of the maze.
 *
 * ## The mathematical idea
 *
 * The maze is the one from a famous line of BASIC: in each cell, a rising or a
 * falling diagonal, drawn by a coin toss. The diagonals join at the corners,
 * and the eye reads corridors in them.
 *
 * The drawing is dated: one whole epoch per period, and within each epoch a
 * front sweeping the frame diagonally, from bottom to top and from left to
 * right. Ahead of the front, the cell shows the stroke of the previous epoch;
 * behind it, the stroke of the current one. In the cell the front is crossing,
 * the new stroke grows from one end to the other while the old one is erased
 * from the same end, and a bright head marks the tip of the stroke being born.
 *
 * Nothing is kept from frame to frame: the age is enough to know what each cell
 * must show.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the strokes.
 * - `uColorC` — the head doing the drawing.
 * - `uPeriod` — duration of a complete drawing, in seconds.
 * - `uDensity` — number of cells across the height.
 * - `uThickness` — thickness of the strokes, as a fraction of the cell.
 */
export const MAZE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPeriod;
uniform float uDensity;
uniform float uThickness;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float mazeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// The stroke of a cell at a given epoch: its distance to the fragment, and the
// abscissa of the fragment along the stroke, from 0 to 1.
vec2 mazeStroke(vec2 f, vec2 cell, float epoch) {
  float rising = step(0.5, mazeHash(cell + epoch * 17.0));
  // Rising: from (0,0) to (1,1). Falling: from (0,1) to (1,0).
  float d = mix(abs(f.x + f.y - 1.0), abs(f.x - f.y), rising) * 0.7071068;
  float s = mix((f.x + 1.0 - f.y) * 0.5, (f.x + f.y) * 0.5, rising);
  return vec2(d, s);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 f = fract(p);

  float phase = uTime / max(uPeriod, 0.5);
  float epoch = floor(phase);

  // The front, in diagonal units: it starts before the first cell and ends
  // after the last one, so that every stroke is drawn in full.
  float diagonals = scale * aspect + scale + 2.0;
  float front = fract(phase) * diagonals - 1.0;
  float draw = clamp(front - (cell.x + cell.y), 0.0, 1.0);

  vec2 fresh = mazeStroke(f, cell, epoch);
  vec2 old = mazeStroke(f, cell, epoch - 1.0);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float halfWidth = max(uThickness, 0.01) * 0.5;

  // The new stroke exists up to the abscissa of the front; the old one beyond.
  float newLine = (1.0 - smoothstep(halfWidth - px, halfWidth + px, fresh.x)) * step(fresh.y, draw);
  float oldLine = (1.0 - smoothstep(halfWidth - px, halfWidth + px, old.x)) * step(draw, old.y);
  float line = max(newLine, oldLine);

  // The head: at the tip of the stroke being born, only in the crossed cell.
  float active = step(0.001, draw) * step(draw, 0.999);
  float rising = step(0.5, mazeHash(cell + epoch * 17.0));
  vec2 headPos = mix(vec2(draw, 1.0 - draw), vec2(draw, draw), rising);
  float head = exp(-dot(f - headPos, f - headPos) / 0.02) * active;

  vec3 colour = mix(uColorA, uColorB, line * 0.85);
  colour += uColorC * head * 1.2;

  gl_FragColor = vec4(colour, 1.0);
}
`
