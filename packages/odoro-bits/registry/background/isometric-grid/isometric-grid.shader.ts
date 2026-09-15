/**
 * Isometric tile shader.
 *
 * ## The mathematical idea
 *
 * A cube seen in isometry is a hexagon with a vertex on top, cut into three
 * rhombi that meet at the centre: the top face, the right one, the left one.
 * The tiling is therefore a hexagonal grid — two rectangular grids offset by
 * half a cell, of which the nearer cell is kept — and the face is read from
 * the angle of the fragment around the centre of the hexagon.
 *
 * The three faces get three fixed shades, as under a light coming from the
 * upper left. It is that difference of shades that makes the relief: without
 * it, the tiling is flat.
 *
 * The lighting is a sine of a phase proper to each cube, thresholded: an
 * adjustable share of the cubes is lit at any moment, and never the same
 * ones. A draw per frame would give nothing but noise.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the shading of the faces, mixed into the background.
 * - `uColorC` — the lighting.
 * - `uSpeed` — speed of the lighting.
 * - `uDensity` — number of cubes over the height.
 * - `uLit` — share of the cubes lit at any given moment.
 */
export const ISOMETRIC_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uLit;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float isoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Hexagonal grid with a vertex on top: local coordinates (xy) and cell
// identifier (zw). Both rectangular grids are evaluated, the nearer one
// wins.
vec4 isoHex(vec2 uv) {
  const vec2 s = vec2(1.0, 1.7320508);
  vec4 hc = floor(vec4(uv, uv - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
  vec4 h = vec4(uv - hc.xy * s, uv - (hc.zw + 0.5) * s);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hc.xy) : vec4(h.zw, hc.zw + 0.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;

  vec4 hex = isoHex(p);
  vec2 local = hex.xy;
  vec2 id = hex.zw;

  // The face is read from the angle: top between 30 and 150 degrees, right
  // below 30, left beyond 150.
  float angle = atan(local.y, local.x);
  float top = step(0.5235988, angle) * step(angle, 2.6179939);
  float right = step(angle, 0.5235988) * step(-1.5707963, angle);
  float left = 1.0 - top - right;

  float shade = top * 1.0 + right * 0.62 + left * 0.38;

  // The edge of the hexagon, in hexagonal distance: a dark line that
  // separates the cubes.
  float hexDist = max(abs(local.x) * 0.8660254 + abs(local.y) * 0.5, abs(local.y));
  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float edge = smoothstep(0.5 - px * 2.0, 0.5, hexDist);

  // The three inner edges, from the centre towards the vertices at 30, 150
  // and 270 degrees: the distance to each half-line.
  float seam = 1.0;
  for (int i = 0; i < 3; i += 1) {
    float a = 0.5235988 + float(i) * 2.0943951;
    vec2 dir = vec2(cos(a), sin(a));
    float along = max(dot(local, dir), 0.0);
    seam = min(seam, length(local - dir * along));
  }
  float inner = smoothstep(px * 2.0, 0.0, seam);

  // Lighting: a sine of its own phase, thresholded by the requested share.
  float phase = isoHash(id);
  float wave = 0.5 + 0.5 * sin(uTime * uSpeed * 2.0 + phase * 12.566);
  float lit = smoothstep(1.0 - uLit, 1.0 - uLit * 0.5, wave) * step(0.001, uLit);

  vec3 block = mix(uColorA, uColorB, 0.16 + 0.02 * phase) * (0.55 + 0.45 * shade);
  vec3 glow = uColorC * (0.55 + 0.45 * shade);
  vec3 colour = mix(block, glow, lit);

  colour = mix(colour, uColorA, edge * 0.7);
  colour = mix(colour, uColorA, inner * 0.35);

  gl_FragColor = vec4(colour, 1.0);
}
`
