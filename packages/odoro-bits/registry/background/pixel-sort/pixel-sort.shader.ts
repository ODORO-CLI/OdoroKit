/**
 * Shader of the pixel sort.
 *
 * ## The mathematical idea
 *
 * Pixel sorting is an accident turned into a style: in an image, the pixels
 * of each column whose luminance passes a threshold are sorted in
 * increasing order, and the column turns into a monotone gradient. The real
 * effect requires reading the whole column; here, it is simulated without
 * any read at all — every column of pixels carries segments whose position,
 * length and start are drawn from their rank. Inside a segment, the
 * luminance grows linearly from top to bottom: that is the gradient a sort
 * would produce. A segment appears only where the background image, read at
 * its origin, passes the threshold — the bands therefore come out of the
 * light areas and flow, as in the original effect.
 *
 * The segments scroll downwards at a speed of their column's own, so that
 * the bands flow at unequal rhythms.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the image and the bottom of the bands.
 * - `uColorC` — the top of the bands.
 * - `uPixel` — width of a column, in physical pixels.
 * - `uDensity` — number of segments over the height of a column.
 * - `uThreshold` — luminance threshold above which a band comes out.
 * - `uSpeed` — speed of the flow.
 */
export const PIXEL_SORT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPixel;
uniform float uDensity;
uniform float uThreshold;
uniform float uSpeed;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float sortHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float sortNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = sortHash(cell);
  float b = sortHash(cell + vec2(1.0, 0.0));
  float c = sortHash(cell + vec2(0.0, 1.0));
  float d = sortHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// The background image: two octaves of noise in slow drift, between zero and one.
float sortImage(vec2 uv, float t) {
  vec2 p = uv * 2.4 + vec2(t * 0.08, -t * 0.05);
  float value = sortNoise(p) + 0.5 * sortNoise(p * 2.3 + 7.0);
  return smoothstep(0.25, 1.1, value / 1.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float pixel = max(uPixel, 1.0);
  float t = uTime;

  // The column: everything that follows is computed at the centre of its width.
  float column = floor(gl_FragCoord.x / pixel);
  float x = (column + 0.5) * pixel / uResolution.x * aspect;

  float image = sortImage(vec2(vUv.x * aspect, vUv.y), t);

  // The segments of the column, scrolling downwards at a speed of the
  // column's own.
  float seed = sortHash(vec2(column, 3.0));
  float density = max(uDensity, 1.0);
  float run = (1.0 - vUv.y) * density + seed * 20.0 + t * uSpeed * (0.3 + 0.7 * seed);
  float segment = floor(run);
  float local = fract(run);

  // Length of the segment, and its origin: the band comes out only if the
  // image is light enough there.
  float span = mix(0.2, 0.95, sortHash(vec2(column, segment)));
  float originY = 1.0 - (segment - seed * 20.0 - t * uSpeed * (0.3 + 0.7 * seed)) / density;
  float origin = sortImage(vec2(x, fract(originY)), t);
  float gate = step(clamp(uThreshold, 0.0, 1.0), origin);

  float inside = step(local, span) * gate;

  // The gradient of the sort: the luminance grows from the top to the bottom
  // of the segment.
  float sorted = local / span;

  vec3 base = mix(uColorA, uColorB, image * 0.85);
  vec3 band = mix(uColorC, uColorB, sorted);
  band = mix(band, uColorA, sorted * sorted * 0.5);

  vec3 colour = mix(base, band, inside);

  gl_FragColor = vec4(colour, 1.0);
}
`
