/**
 * Shader of the volumetric rays.
 *
 * ## The mathematical idea
 *
 * A beam is only visible if it crosses something: here a haze of fractal
 * noise that drifts. The mask of the rays is a 1D noise of the angle around
 * the focus, as for the flat rays; but the light that reaches a fragment is
 * integrated along the ray — a march at constant steps from the fragment
 * towards the focus, summing the haze crossed on the way. A thick haze
 * upstream puts the ray out; a local haze scatters it. This is what sets
 * these rays apart from the flat ones: they have a volume, they go out behind
 * one bank of haze and light up in the next.
 *
 * The light is laid down by a bounded mix towards its hues: the haze holds on
 * a light background as well as on a dark one.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the light of the rays.
 * - `uColorC` — the tint of the haze and of the focus.
 * - `uX`, `uY` — position of the focus, as a fraction of the frame.
 * - `uCount` — number of rays around the turn.
 * - `uStrength` — intensity of the light.
 * - `uSamples` — number of steps of the march, and therefore the cost.
 */
export const VOLUMETRIC_RAYS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uCount;
uniform float uStrength;
uniform float uSamples;

float hazeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float hazeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = hazeHash(cell);
  float b = hazeHash(cell + vec2(1.0, 0.0));
  float c = hazeHash(cell + vec2(0.0, 1.0));
  float d = hazeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Two octaves are enough for the haze: it is read at every step of the march,
// and it is the march that smooths.
float haze(vec2 p, float t) {
  vec2 q = p * 1.6 + vec2(t * 0.06, -t * 0.02);
  return hazeNoise(q) * 0.65 + hazeNoise(q * 2.1 + vec2(1.7, 4.3) + vec2(-t * 0.04, 0.0)) * 0.35;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 focus = vec2(uX * aspect, uY);
  float t = uTime;
  int steps = int(clamp(uSamples, 2.0, 16.0));

  vec2 offset = p - focus;
  float radius = length(offset);
  float angle = atan(offset.y, offset.x);

  // The angular mask: two sines of non-multiple integer frequencies, with no
  // seam around the turn, whose phases drift slowly.
  float f1 = max(floor(uCount), 2.0);
  float f2 = floor(f1 * 1.9) + 1.0;
  float ray = pow(0.5 + 0.5 * sin(angle * f1 + t * 0.12), 3.0) * 0.7
    + pow(0.5 + 0.5 * sin(angle * f2 - t * 0.09), 3.0) * 0.5;

  // The march: from the fragment towards the focus, the haze crossed adds up.
  vec2 stride = -offset / float(steps) * 0.9;
  vec2 s = p;
  float thickness = 0.0;
  for (int i = 0; i < 16; i += 1) {
    if (i >= steps) break;
    s += stride;
    thickness += haze(s, t);
  }
  thickness /= float(steps);

  // The transmission: a thick haze upstream puts the ray out. The lower bound
  // keeps a little light everywhere, or the frame would be cut in two.
  float transmission = 1.0 - smoothstep(0.35, 0.65, thickness) * 0.9;

  // The scattering: it is the local haze that makes the ray visible.
  float localHaze = haze(p, t);
  float scattering = 0.2 + 0.8 * localHaze;

  float light = ray * transmission * scattering * exp(-radius * 1.1) * max(uStrength, 0.0) * 1.3;
  float source = exp(-radius * radius * 7.0) * (0.5 + 0.2 * ray);

  vec3 colour = mix(uColorA, uColorC, clamp(localHaze * 0.22 + source * 0.6, 0.0, 1.0));
  colour = mix(colour, uColorB, clamp(light, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
