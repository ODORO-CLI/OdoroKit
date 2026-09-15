/**
 * Hexagonal wave shader.
 *
 * ## The mathematical idea
 *
 * A hexagonal tiling reads as two rectangular grids offset by half a cell:
 * for each point, take whichever of the two has the nearer centre. The
 * centre thus retained identifies the cell; the hexagonal distance to that
 * centre — the maximum of the projection onto the slanted axis and of the
 * abscissa — is one half on the edges, which gives the line and the
 * interior.
 *
 * The wave is not evaluated per pixel: it is evaluated at the centre of the
 * cell. That is what makes each cell light up as one block, like a key,
 * instead of letting a continuous ripple travel across it. A sine of the
 * distance to the pointer, offset by time, moves away from the pointer; an
 * exponential extinguishes it with distance.
 *
 * The centre is the pointer, damped by the component.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the edges.
 * - `uColorC` — the lit cells.
 * - `uPointer` — the source position, in texture coordinates.
 * - `uSize` — cells per frame height.
 * - `uSpeed` — wave speed.
 * - `uSpacing` — waves per frame height.
 * - `uFade` — fade-out speed with distance.
 */
export const HEX_WAVE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSize;
uniform float uSpeed;
uniform float uSpacing;
uniform float uFade;

// Tiling step: one cell wide, root three tall.
const vec2 HEX = vec2(1.0, 1.7320508);

// Hexagonal distance to the centre: one half on the edges.
float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, normalize(HEX)), p.x);
}

// Cell coordinates: the local point (xy) and the centre (zw).
vec4 hexCoords(vec2 p) {
  vec2 h = HEX * 0.5;
  vec2 a = mod(p, HEX) - h;
  vec2 b = mod(p - h, HEX) - h;
  vec2 local = dot(a, a) < dot(b, b) ? a : b;
  return vec4(local, p - local);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float size = clamp(uSize, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * size;
  vec2 centre = uPointer * vec2(aspect, 1.0) * size;

  // One pixel, in cell units.
  float px = size / max(uResolution.y, 1.0);

  vec4 hex = hexCoords(p);
  float edge = hexDist(hex.xy);

  // The wave is evaluated at the cell centre: it lights up as one block.
  float d = length(hex.zw - centre) / size;
  float wave = 0.5 + 0.5 * sin(d * 6.2832 * max(uSpacing, 0.5) - uTime * uSpeed * 3.0);
  float reach = exp(-d * uFade);
  float lit = smoothstep(0.35, 0.95, wave) * reach;

  // The cell under the pointer stays filled.
  float core = 1.0 - smoothstep(0.0, 0.12, d);

  // The edges: a thin line; the interior, slightly set back.
  float border = smoothstep(0.5 - px * 1.8, 0.5 - px * 0.4, edge);
  float fill = 1.0 - smoothstep(0.5 - px * 3.0, 0.5 - px * 1.8, edge);

  vec3 colour = mix(uColorA, uColorB, border * 0.9);
  colour = mix(colour, uColorC, fill * clamp(lit * 0.85 + core, 0.0, 1.0));
  colour = mix(colour, uColorC, border * lit * 0.5);

  gl_FragColor = vec4(colour, 1.0);
}
`
