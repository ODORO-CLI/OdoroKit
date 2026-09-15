/**
 * Bending sheets shader.
 *
 * ## The mathematical idea
 *
 * Each sheet is a thick band around a curve: the distance, in a rotated
 * frame of the sheet's own, between the ordinate and a sum of two sines of
 * the abscissa. The sheets have different orientations, so that they cross
 * instead of staying parallel; the bend is the amplitude of the
 * sines.
 *
 * Where two sheets overlap, the colour does not merely replace: the sum of
 * the coverages exceeds one, and that excess becomes an added glint, capped.
 * That is what makes the sheets translucent rather than cut out. A rim at
 * their edge recalls their thickness.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the first sheet.
 * - `uColorC` — the hue of the last sheet, and the rim.
 * - `uSheets` — number of sheets, and so their cost.
 * - `uThickness` — thickness of the sheets, as a fraction of the frame.
 * - `uBend` — amplitude of the bends.
 * - `uSpeed` — speed of the movement.
 */
export const COLOR_BENDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSheets;
uniform float uThickness;
uniform float uBend;
uniform float uSpeed;

// Pseudo-random number from an index: amplified sine, fractional part.
float sheetHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) - vec2(aspect * 0.5, 0.5);
  float t = uTime * uSpeed;
  int sheets = int(clamp(uSheets, 1.0, 5.0));
  float thickness = max(uThickness, 0.02);

  vec3 colour = uColorA;
  float coverage = 0.0;
  float rim = 0.0;

  // Constant bound: the language specification demands it. Five sheets are
  // enough; beyond that the background vanishes, and the crossings with it.
  for (int i = 0; i < 5; i += 1) {
    if (i >= sheets) break;
    float fi = float(i);
    float h1 = sheetHash(fi + 1.0);
    float h2 = sheetHash(fi + 17.0);

    // The sheet's own frame: each sheet is rotated by an angle that drifts.
    float angle = (fi / max(float(sheets), 1.0)) * 2.4 - 1.2 + sin(t * 0.3 + h1 * 6.28) * 0.25;
    vec2 q = vec2(
      cos(angle) * p.x - sin(angle) * p.y,
      sin(angle) * p.x + cos(angle) * p.y
    );

    // The curve: two sines, and a vertical offset of the sheet's own.
    float centre = (h2 - 0.5) * 0.5
      + uBend * (0.25 * sin(q.x * 2.2 + t * (0.8 + h1 * 0.5) + h2 * 6.28)
      + 0.12 * sin(q.x * 4.7 - t * (0.6 + h2 * 0.4)));

    float d = abs(q.y - centre);
    float sheet = 1.0 - smoothstep(thickness - 0.04, thickness + 0.02, d);
    float edge = smoothstep(thickness - 0.05, thickness - 0.02, d) * sheet;

    vec3 tint = mix(uColorB, uColorC, fi / max(float(sheets) - 1.0, 1.0));
    colour = mix(colour, tint, sheet * 0.8);
    coverage += sheet;
    rim = max(rim, edge);
  }

  // The crossing: the excess coverage becomes a glint, capped.
  float glint = smoothstep(1.1, 2.2, coverage);
  colour += mix(uColorB, uColorC, 0.5) * glint * 0.3;
  colour = mix(colour, uColorC, rim * 0.35);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
