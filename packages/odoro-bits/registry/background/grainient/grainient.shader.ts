/**
 * Grainient shader.
 *
 * ## The mathematical idea
 *
 * A gradient of blobs, like the sheet of colours, but whose substance is
 * grain. Each blob is a gaussian of the distance to a centre tracing a slow
 * Lissajous curve; the even blobs carry one hue, the odd ones the
 * other.
 *
 * The grain is not laid over the image afterwards: it is in the gradient. A
 * pseudo-random number per pixel, renewed twelve times a second, shifts the
 * weight of each hue before the mix. The transitions dissolve into dots
 * instead of spreading, which gives the printed look. The background itself
 * stays intact: the grain lives only where there is
 * colour.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the even blobs.
 * - `uColorC` — the hue of the odd blobs.
 * - `uSpeed` — drift speed of the blobs.
 * - `uGrain` — strength of the grain.
 * - `uScale` — size of the blobs.
 * - `uBlobs` — number of blobs, and so their cost.
 */
export const GRAINIENT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uGrain;
uniform float uScale;
uniform float uBlobs;

// Pseudo-random number from an index: amplified sine, fractional part.
float grainHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Pseudo-random number from a point: projection, amplified sine.
float grainHash2(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int blobs = int(clamp(uBlobs, 1.0, 6.0));
  float radius = max(uScale, 0.2) * 0.45;

  // The weights of the two hues: one gaussian per blob, summed by parity.
  float weightB = 0.0;
  float weightC = 0.0;

  // Constant bound: the language specification demands it. Six blobs are
  // enough; beyond that they overlap and the gradient becomes uniform.
  for (int i = 0; i < 6; i += 1) {
    if (i >= blobs) break;
    float fi = float(i);
    float h1 = grainHash(fi + 1.0);
    float h2 = grainHash(fi + 11.0);
    float h3 = grainHash(fi + 23.0);
    vec2 centre = vec2(
      0.5 + 0.4 * sin(t * (0.3 + h1 * 0.4) + h2 * 6.2831),
      0.5 + 0.38 * cos(t * (0.25 + h3 * 0.5) + h1 * 6.2831)
    ) * vec2(aspect, 1.0);
    vec2 d = p - centre;
    float weight = exp(-dot(d, d) / (radius * radius));
    if (mod(fi, 2.0) < 0.5) weightB += weight; else weightC += weight;
  }

  // The grain: one draw per pixel, renewed twelve times a second — faster,
  // it buzzes; slower, it flickers.
  float image = floor(uTime * 12.0);
  float grain = grainHash2(gl_FragCoord.xy + image * 7.13) - 0.5;
  float strength = clamp(uGrain, 0.0, 1.0) * 0.45;

  // The grain shifts the weights before the mix: it lives only where there
  // is colour, and never reaches the bare background.
  float kB = clamp(weightB + grain * strength * smoothstep(0.0, 0.5, weightB), 0.0, 1.0);
  float kC = clamp(weightC + grain * strength * smoothstep(0.0, 0.5, weightC), 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, kB);
  colour = mix(colour, uColorC, kC);

  // A slight luminance grain over the colour, for the printed look.
  colour += mix(uColorB, uColorC, 0.5) * grain * strength * 0.25 * max(kB, kC);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
