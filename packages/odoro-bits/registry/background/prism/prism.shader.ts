/**
 * Shader of the prism.
 *
 * ## The mathematical idea
 *
 * Three pieces, in the order in which the light crosses them. An incoming
 * beam: the distance to a segment, with a gaussian core and a halo. A prism:
 * an equilateral triangle by its signed distance, of which only the edge
 * shines. A dispersion: a fan of angles at the exit, where the hue turns from
 * one token to the other according to the position within the fan — a
 * spectrum between two colours of the project, not a hard-coded rainbow — and
 * where a cosine draws lines, like the lines of a real spectrum.
 *
 * The aperture of the fan breathes slowly, and a shimmer slides along the
 * rays, so that the scene is not a still image.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the start of the spectrum.
 * - `uColorC` — the end of the spectrum.
 * - `uX`, `uY` — position of the prism, as a fraction of the frame.
 * - `uSpread` — aperture of the fan, in radians.
 * - `uBands` — number of lines in the spectrum.
 * - `uSpeed` — speed of the breathing and of the shimmer.
 * - `uDetail` — pieces drawn: 1 the fan alone, 3 everything.
 */
export const PRISM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uSpread;
uniform float uBands;
uniform float uSpeed;
uniform float uDetail;

// Distance to a segment.
float prismSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Signed distance to an equilateral triangle of the given half-side, point
// upwards: negative inside, positive outside.
float prismTriangle(vec2 p, float side) {
  const float k = 1.7320508;
  p.x = abs(p.x) - side;
  p.y = p.y + side / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
  p.x -= clamp(p.x, -2.0 * side, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(uX * aspect, uY);
  float t = uTime * uSpeed;
  int pieces = int(clamp(uDetail, 1.0, 3.0));

  float side = 0.13;
  vec2 entry = centre + vec2(-side * 0.55, side * 0.1);
  vec2 exitPoint = centre + vec2(side * 0.55, -side * 0.05);
  vec3 white = mix(uColorB, uColorC, 0.5);

  vec3 colour = uColorA;

  // The incoming beam: it comes from the left, dropping a little.
  if (pieces >= 2) {
    float d = prismSegment(p, vec2(-1.0, uY + 0.45), entry);
    float core = exp(-(d * d) / 0.00004);
    float halo = exp(-d / 0.035) * 0.35;
    colour = mix(colour, white, clamp(halo + core, 0.0, 1.0));
    colour += white * core * 0.3;
  }

  // The prism: the interior barely tinted, the edge that shines.
  if (pieces >= 3) {
    float sd = prismTriangle(p - centre, side);
    float interior = 1.0 - smoothstep(-0.004, 0.004, sd);
    float edge = exp(-abs(sd) / 0.004);
    colour = mix(colour, white, interior * 0.08);
    colour = mix(colour, uColorC, edge * 0.6);
  }

  // The fan: the angle from the exit, related to the aperture.
  vec2 offset = p - exitPoint;
  float radius = length(offset);
  float angle = atan(offset.y, offset.x);
  float aperture = max(uSpread, 0.05) * (1.0 + 0.12 * sin(t * 0.7));
  float bottom = -0.12 - aperture * 0.5;
  float frac = (angle - bottom) / aperture;

  float inside = smoothstep(-0.03, 0.06, frac) * smoothstep(1.03, 0.94, frac);
  float front = smoothstep(0.0, 0.03, offset.x);
  float falloff = exp(-radius * 1.1);
  float shimmer = 0.85 + 0.15 * sin(radius * 24.0 - t * 3.0 + frac * 6.0);

  // The spectrum: the hue turns from one token to the other; the cosine draws
  // the lines that make it read as a spectrum.
  vec3 tint = mix(uColorB, uColorC, clamp(frac, 0.0, 1.0));
  float lines = 0.6 + 0.4 * cos(frac * uBands * 6.2831853);

  float fan = inside * front * falloff * lines * shimmer;
  colour = mix(colour, tint, clamp(fan, 0.0, 1.0));
  colour += tint * fan * 0.2;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
