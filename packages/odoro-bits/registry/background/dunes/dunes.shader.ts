/**
 * Shader for the dunes.
 *
 * ## The mathematical idea
 *
 * Stacked crests: n horizon curves — a load-bearing sine plus a value noise
 * that breaks its regularity — stacked from top to bottom. Each layer covers
 * the previous one through a plain vertical threshold, and drifts at its own
 * speed: it is the parallax that gives the depth, not a gradient. The lower
 * layers are lighter, like sand catching the grazing light.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the sky.
 * - `uColorB` — the farthest crest.
 * - `uColorC` — the nearest crest, the lightest one.
 * - `uSpeed` — drift speed of the layers.
 * - `uLayers` — number of stacked crests.
 * - `uAmplitude` — height of the undulations.
 */
export const DUNES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uLayers;
uniform float uAmplitude;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float duneHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// 1D value noise: smoothed interpolation between two integer draws.
float duneNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(duneHash(cell), duneHash(cell + 1.0), smoothed);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 2.0, 6.0));

  vec3 colour = uColorA;

  for (int i = 0; i < 6; i += 1) {
    if (i >= layers) break;

    float k = float(i) / max(float(layers) - 1.0, 1.0);

    // Every layer steps down one notch and slows: the near crests advance less
    // than the far ones, and that mismatch is the parallax.
    float base = 0.78 - k * 0.55;
    float phase = t * (1.2 - 0.9 * k) + float(i) * 4.7;

    // A sine for the framing, a noise to break its regularity: the sine alone
    // would make a mechanical wave, the noise alone a jittery line.
    float crest = base + uAmplitude * (
      sin(x * 2.1 + phase) * 0.5 +
      (duneNoise(x * 3.7 + phase * 0.6 + float(i) * 13.0) - 0.5) * 1.0
    );

    // Fill under the curve: the layer covers everything below it, with an edge
    // softened over half a percent of the screen.
    float below = smoothstep(crest + 0.004, crest - 0.004, vUv.y);

    // Nearer, lighter: the layer tint runs from the far to the grazing one.
    vec3 tint = mix(uColorB, uColorC, k);
    colour = mix(colour, tint, below);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
