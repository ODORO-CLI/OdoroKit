/**
 * Shader of the acid squares.
 *
 * ## The mathematical idea
 *
 * Within each cell, concentric squares of decreasing size, from the
 * largest to the smallest. Each turns around the shared centre a little
 * faster than the one enclosing it, and starts out with a fixed angular
 * offset upon itself: seen together, they form a square spiral that seems
 * to screw itself down.
 *
 * The fragment is painted by the smallest square that contains it — the
 * loop runs from the largest to the smallest and overwrites the colour
 * every time. The hues alternate from one square to the next, and
 * neighbouring cells turn in opposite directions: two cells side by side
 * do not read as one and the same texture repeated.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB`, `uColorC` — the two alternating hues.
 * - `uSpeed` — rotation speed of the outermost square.
 * - `uRings` — number of nested squares, and therefore the cost.
 * - `uDensity` — number of cells over the height.
 * - `uTwist` — angular offset between two neighbouring squares, in radians.
 */
export const ACID_SQUARES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRings;
uniform float uDensity;
uniform float uTwist;

vec2 acidRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  // The cells are centred on the frame: a single cell fits in the middle,
  // several of them spread out around it.
  vec2 p = (vec2(vUv.x * aspect, vUv.y) - vec2(aspect, 1.0) * 0.5) * scale;
  vec2 cell = floor(p + 0.5);
  vec2 local = p - cell;

  // Neighbouring cells turn in opposite directions.
  float direction = mod(cell.x + cell.y, 2.0) < 0.5 ? 1.0 : -1.0;
  float t = uTime * uSpeed * direction;

  int rings = int(clamp(uRings, 1.0, 14.0));
  float px = scale / max(uResolution.y, 1.0) * 1.5;

  vec3 colour = uColorA;

  // Constant bounds: the language specification demands it; the quality
  // setting breaks out earlier. From the largest to the smallest: the last
  // one that contains the fragment is the one that paints it.
  for (int i = 0; i < 14; i += 1) {
    if (i >= rings) break;
    float fi = float(i);
    float size = 0.5 * (1.0 - fi / float(rings)) * 0.96;
    float angle = t * (1.0 + fi * 0.35) + fi * uTwist;

    vec2 q = acidRotate(local, angle);
    float d = max(abs(q.x), abs(q.y));

    float inside = 1.0 - smoothstep(size - px, size + px, d);
    vec3 tint = mod(fi, 2.0) < 0.5 ? uColorB : uColorC;
    // The square darkens towards its edge: every ring then reads in relief.
    float depth = 0.75 + 0.25 * smoothstep(size, size * 0.6, d);
    colour = mix(colour, tint * depth, inside);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
