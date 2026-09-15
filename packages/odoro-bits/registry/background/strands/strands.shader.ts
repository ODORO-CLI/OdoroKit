/**
 * Shader for the strands.
 *
 * ## The mathematical idea
 *
 * Each strand is an x = f(y) anchored at the bottom of the frame: its
 * horizontal position is that of its column, plus a sway that grows with
 * height — nil at the root, full at the tip. It is this growth as a power of
 * y that makes the seaweed: the base holds, the tip follows the current with
 * a lag.
 *
 * The lag comes from the sway itself, a sine whose phase depends on y: the
 * tip is not at the same instant of the oscillation as the middle, and the
 * strand undulates instead of leaning.
 *
 * The fragment knows only its own column and its two neighbours: the sway is
 * bounded to one column width. Each strand has its own height, a thickness
 * that tapers towards the tip, and the distance to the stroke is divided by
 * the norm of the slope so that the tapering is the only thing at play.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the strands.
 * - `uColorC` — their tip.
 * - `uCount` — number of strands.
 * - `uSway` — amplitude of the sway, in column widths.
 * - `uSpeed` — speed of the current.
 * - `uThickness` — thickness at the root, as a fraction of the width.
 */
export const STRANDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSway;
uniform float uSpeed;
uniform float uThickness;

// Pseudo-random number: amplified sine, fractional part.
float strandHash(float n) {
  return fract(sin(n * 12.9898 + 78.233) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  float count = clamp(uCount, 2.0, 40.0);
  float pitch = 1.0 / count;
  float sway = clamp(uSway, 0.0, 1.0) * pitch;

  float px = 1.0 / max(uResolution.x, 1.0);
  float column = floor(vUv.x * count);
  float y = vUv.y;

  // The root holds, the tip follows: the sway grows as y^1.6.
  float profile = pow(y, 1.6);

  float body = 0.0;
  float tip = 0.0;

  for (int k = -1; k <= 1; k += 1) {
    float i = column + float(k);
    if (i < 0.0 || i >= count) continue;

    float seed = strandHash(i);
    float phase = seed * 6.2831853;

    // Two sines phase-shifted in y: the tip is not at the same instant of
    // the oscillation as the middle, so the strand undulates instead of leaning.
    float wave = sin(y * 3.0 - t + phase) * 0.6 + sin(y * 7.0 - t * 1.4 + phase * 2.3) * 0.4;
    float x = (i + 0.5) * pitch + wave * sway * profile;

    // Derivative in y, to normalise the thickness. The aspect brings the slope
    // back into pixel space.
    float slope = (cos(y * 3.0 - t + phase) * 1.8 + cos(y * 7.0 - t * 1.4 + phase * 2.3) * 2.8)
      * sway * profile * aspect;

    // Each strand has its own height, and fades out over its last stretch.
    float height = 0.5 + seed * 0.45;
    float alive = 1.0 - smoothstep(height - 0.12, height, y);

    // The thickness tapers towards the tip, never below one pixel.
    float thickness = max(uThickness * (1.0 - 0.75 * y / height), px);
    float d = abs(vUv.x - x) / sqrt(1.0 + slope * slope);
    float line = (1.0 - smoothstep(thickness - px, thickness + px, d)) * alive;

    body = max(body, line);
    tip = max(tip, line * smoothstep(height * 0.5, height, y));
  }

  // The background darkens towards the root, like deeper water.
  vec3 colour = mix(uColorA, uColorB, (1.0 - y) * 0.12);
  colour = mix(colour, uColorB, body);
  colour = mix(colour, uColorC, tip * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
