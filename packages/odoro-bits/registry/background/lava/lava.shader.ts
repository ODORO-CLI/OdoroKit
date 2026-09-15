/**
 * Lava shader.
 *
 * ## The mathematical idea
 *
 * Metaballs: every centre emits a 1/d2 field, and it is the sum of the
 * fields which is thresholded — two blobs drawing near therefore merge of
 * their own accord, without any code gluing them back together. The centres
 * drift on sines whose periods are not multiples of one another, so that
 * their orbits never close exactly. Two soft thresholds tier the colour: the
 * dark edge, the bright core.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the cold rock of the background.
 * - `uColorB` — the edge of the blobs, still dark.
 * - `uColorC` — the molten core.
 * - `uSpeed` — drift speed of the centres.
 * - `uBlobs` — number of blobs, and so of summed fields.
 * - `uThreshold` — field threshold; lower means more matter.
 */
export const LAVA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBlobs;
uniform float uThreshold;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float lavaHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int blobCount = int(clamp(uBlobs, 2.0, 8.0));

  float field = 0.0;

  for (int i = 0; i < 8; i += 1) {
    if (i >= blobCount) break;

    float seed = float(i) + 1.0;
    float ha = lavaHash(seed);
    float hb = lavaHash(seed + 17.0);

    // Two sines whose periods are not multiples: the orbit never closes
    // exactly, so no blob ever runs twice along the same path.
    vec2 centre = vec2(0.5 * aspect, 0.5) + vec2(
      sin(t * (0.31 + ha * 0.47) + ha * 6.28318) * 0.34 * aspect,
      cos(t * (0.23 + hb * 0.41) + hb * 6.28318) * 0.38
    );

    // A 1/d2 field: this is what makes nearby blobs merge, the sum of two
    // fields passing the threshold where neither alone could.
    vec2 offset = p - centre;
    float radius = 0.016 + 0.014 * ha;
    field += radius / (dot(offset, offset) + 0.002);
  }

  float threshold = max(uThreshold, 0.1);

  // Two soft steps: the edge rises towards the dark hue well before the
  // threshold, the bright core only shows clearly beyond it.
  float edge = smoothstep(threshold * 0.55, threshold, field);
  float core = smoothstep(threshold, threshold * 1.9, field);

  vec3 colour = mix(uColorA, uColorB, edge);
  colour = mix(colour, uColorC, core);

  gl_FragColor = vec4(colour, 1.0);
}
`
