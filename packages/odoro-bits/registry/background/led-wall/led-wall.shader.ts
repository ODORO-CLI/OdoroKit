/**
 * LED wall shader.
 *
 * ## The mathematical idea
 *
 * Two superposed images. The first is what the wall displays: a slow
 * gradient, the sum of a few sines of time and position. It is never read
 * per pixel — it is sampled at the centre of every dot, so that a dot has a
 * single colour, like a real diode. That sampling is what makes the wall:
 * the same image read continuously would be a plain gradient.
 *
 * The second is the dot itself: a rounded square read through its signed
 * distance, with a gap around it where the background — the casing — stays
 * visible. A short halo spills out of the dot without reaching its
 * neighbours: a diode lights its surroundings a little. Every dot has a
 * slightly uneven luminance, drawn once, because a real wall is never
 * uniform.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, between the dots.
 * - `uColorB` — the first colour of the displayed gradient.
 * - `uColorC` — the second.
 * - `uPixels` — number of dots across the height.
 * - `uSpeed` — speed of the gradient.
 * - `uGap` — gap between the dots, as a fraction of a dot.
 * - `uBloom` — weight of the halo around every dot.
 */
export const LED_WALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPixels;
uniform float uSpeed;
uniform float uGap;
uniform float uBloom;

// Pseudo-random number, stable per dot.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// Signed distance to a rounded square centred on the origin.
float roundedBox(vec2 point, float extent, float radius) {
  vec2 d = abs(point) - extent + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float pixels = clamp(uPixels, 4.0, 120.0);
  vec2 p = vUv * vec2(aspect, 1.0) * pixels;

  // One screen pixel, in dot units.
  float px = pixels / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  // The displayed image, sampled at the centre of the dot.
  vec2 c = (id + 0.5) / pixels;
  float t = uTime * uSpeed;
  float v = sin(c.x * 2.2 + t)
    + sin(c.y * 3.1 - t * 0.8)
    + sin((c.x + c.y) * 1.7 + t * 0.6)
    + sin(length(c - vec2(aspect * 0.5, 0.5)) * 5.0 - t);
  vec3 image = mix(uColorB, uColorC, smoothstep(0.15, 0.85, v * 0.125 + 0.5));

  // The dot: a rounded square, and the gap around it.
  float gap = clamp(uGap, 0.05, 0.6);
  float extent = 0.5 - gap * 0.5;
  float dist = roundedBox(f, extent, extent * 0.45);
  float led = 1.0 - smoothstep(-px, px, dist);

  // The halo: it spills out of the dot without reaching its neighbours.
  float bloom = exp(-max(dist, 0.0) * 6.0) * clamp(uBloom, 0.0, 1.0);

  // A luminance uneven from one dot to the next, drawn once.
  float wear = 0.82 + 0.18 * hash(id);

  vec3 colour = mix(uColorA, image, (led + bloom * (1.0 - led)) * wear);

  gl_FragColor = vec4(colour, 1.0);
}
`
