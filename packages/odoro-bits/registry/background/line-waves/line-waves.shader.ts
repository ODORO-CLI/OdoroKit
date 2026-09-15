/**
 * Shader of the line waves.
 *
 * ## The mathematical idea
 *
 * The frame is cut into horizontal bands, one line per band. Each line is a
 * y = f(x): the sum of two non-harmonic sines, phase-shifted by the index of
 * the band. The phase offset is what makes the figure: at a given instant, the
 * crests of neighbouring lines are not aligned, and the eye reads a diagonal
 * sheet sliding past while each line only ever moves up and down.
 *
 * The fragment knows only its own band and its two neighbours: the amplitude is
 * expressed in band heights and clamped to one, so a line never strays further
 * than one band from its axis. Three evaluations per fragment, whatever the
 * number of lines.
 *
 * The distance to the line is divided by the norm of its slope: without that,
 * the stroke thickens where it is flat and thins where it climbs.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the ink of the lines.
 * - `uColorC` — the glint of the crests.
 * - `uCount` — number of lines.
 * - `uAmplitude` — height of the swell, in band heights.
 * - `uSpeed` — speed of the swell.
 * - `uThickness` — thickness of the stroke, as a fraction of the height.
 */
export const LINE_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uThickness;

// Two non-harmonic sines: the 4/9 ratio never falls back into phase within the
// frame, so the swell does not repeat to the eye.
float swell(float x, float t, float phase) {
  return sin(x * 4.0 - t + phase) * 0.7 + sin(x * 9.0 + t * 0.6 - phase * 1.7) * 0.3;
}

// Derivative of the swell with respect to x, to normalise the thickness.
float slopeOf(float x, float t, float phase) {
  return cos(x * 4.0 - t + phase) * 2.8 + cos(x * 9.0 + t * 0.6 - phase * 1.7) * 2.7;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;

  float count = clamp(uCount, 2.0, 48.0);
  float pitch = 1.0 / count;
  float amplitude = clamp(uAmplitude, 0.0, 1.0) * pitch;

  float px = 1.0 / max(uResolution.y, 1.0);
  float thickness = max(uThickness, px);

  float band = floor(vUv.y * count);
  float ink = 0.0;
  float crest = 0.0;

  // The fragment's band and its two neighbours: the amplitude is clamped to one
  // band height, a line never goes further than that.
  for (int k = -1; k <= 1; k += 1) {
    float i = band + float(k);
    if (i < 0.0 || i >= count) continue;

    float phase = i * 0.55;
    float wave = swell(x, t, phase);
    float centre = (i + 0.5) * pitch + wave * amplitude;

    // The slope is in frame units: the amplitude enters it, and so does the aspect.
    float slope = slopeOf(x, t, phase) * amplitude * aspect;
    float d = abs(vUv.y - centre) / sqrt(1.0 + slope * slope);

    float line = 1.0 - smoothstep(thickness - px, thickness + px, d);
    ink = max(ink, line);
    // The crest: where the swell is at its highest, the stroke lights up.
    crest = max(crest, line * smoothstep(0.3, 1.0, wave));
  }

  vec3 colour = mix(uColorA, uColorB, ink * 0.85);
  colour = mix(colour, uColorC, crest * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
