/**
 * Shader for the ribbons.
 *
 * ## The mathematical idea
 *
 * Each ribbon is a horizontal sinusoid with its own phase, and its light is an
 * exponential of the vertical distance to its axis: far from the ribbon the
 * contribution fades out, close to it it saturates gently. The ribbons sum
 * together, so that their crossings brighten by themselves.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB`, `uColorC` — the two hues between which the ribbons are staged,
 *   from the bottom up.
 * - `uSpeed` — speed of the undulation.
 * - `uCount` — number of ribbons, bounded at ten.
 * - `uAmplitude` — height of the undulation, as a fraction of the frame.
 */
export const RIBBONS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uCount;
uniform float uAmplitude;

// Three sines at non-multiple frequencies: they never fall back into phase,
// so the undulation does not read as a mechanical pattern.
float ribbonWave(float x, float phase) {
  return sin(x * 1.0 + phase) * 0.55
    + sin(x * 2.1 + phase * 1.7) * 0.30
    + sin(x * 3.7 + phase * 0.6) * 0.15;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect * 4.0;
  float t = uTime * uSpeed;

  float ribbons = clamp(uCount, 1.0, 10.0);
  vec3 colour = uColorA;

  for (int i = 0; i < 10; i += 1) {
    if (float(i) >= ribbons) break;

    float k = (float(i) + 0.5) / ribbons;

    // The vertical phase offset: each ribbon gets a phase tied to its rank,
    // without which they would all undulate as a single block.
    float axis = k + uAmplitude * ribbonWave(x, t + k * 6.28318);

    // Attenuation by distance to the axis: an exponential, the profile of a
    // glow, where a plain threshold would make flat bands.
    float offset = abs(vUv.y - axis);
    float glow = exp(-offset * offset * 2400.0) + exp(-offset * offset * 220.0) * 0.35;

    vec3 tint = mix(uColorB, uColorC, k);
    colour += tint * glow * (0.35 + 0.65 * k);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
