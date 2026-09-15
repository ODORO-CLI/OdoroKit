/**
 * Iridescence shader.
 *
 * ## The mathematical idea
 *
 * A mother-of-pearl: a surface that ripples gently, and whose hue depends
 * on the angle it is looked at from. The surface is a sum of directional
 * sines with a long wavelength, whose gradient is computed by hand — no
 * offset lookup, the derivative of a sine is known. The gradient gives a
 * normal; the tilt of the normal and the height give a phase, and the phase
 * turns the hue between two tokens.
 *
 * What makes mother-of-pearl rather than a soap film or an oil sheet:
 * everything is soft. The bands are wide, the blend is a cosine with no dark
 * fringes, and the light is one broad highlight and one narrow highlight
 * laid down by bounded addition, never by darkening. On a light background,
 * the sheet stays pastel; on a dark background, it glows.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first hue of the pearl.
 * - `uColorC` — the second hue, and the highlight.
 * - `uSpeed` — speed of the ripple.
 * - `uScale` — scale of the waves; higher is tighter.
 * - `uShimmer` — strength of the highlights.
 * - `uBands` — hue turns over the whole height of the surface.
 * - `uDetail` — number of waves summed, and so their cost.
 */
export const IRIDESCENCE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uShimmer;
uniform float uBands;
uniform float uDetail;

// A directional wave: the height, and its gradient in the same computation.
vec3 pearlWave(vec2 p, vec2 dir, float freq, float phase, float amp) {
  float arg = dot(p, dir) * freq + phase;
  return vec3(sin(arg) * amp, cos(arg) * amp * freq * dir);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  float t = uTime * uSpeed;
  int waves = int(clamp(uDetail, 1.0, 4.0));

  // The surface: up to four waves, with directions and frequencies that are
  // not aligned so that the pattern does not repeat.
  vec3 field = pearlWave(p, normalize(vec2(1.0, 0.6)), 1.8, t * 0.9, 0.5);
  if (waves >= 2) field += pearlWave(p, normalize(vec2(-0.4, 1.0)), 2.6, -t * 0.7 + 1.3, 0.3);
  if (waves >= 3) field += pearlWave(p, normalize(vec2(0.9, -0.3)), 3.9, t * 1.1 + 2.1, 0.15);
  if (waves >= 4) field += pearlWave(p, normalize(vec2(0.2, 0.9)), 6.1, -t * 0.5 + 0.4, 0.07);

  float height = field.x;
  vec3 n = normalize(vec3(-field.yz * 0.8, 1.0));

  // The hue: a phase made of the height and of the tilt. The cosine turns
  // between the two tokens without ever hollowing out a fringe.
  float phase = height * uBands * 3.14159 + n.x * 3.0 + n.y * 1.5 + t * 0.3;
  vec3 tint = mix(uColorB, uColorC, 0.5 + 0.5 * cos(phase));

  // The presence: the pearl covers everything, but denser on the crests.
  float presence = 0.32 + 0.38 * smoothstep(-0.8, 0.8, height);

  // The light: one broad highlight and one narrow one, from a fixed lamp.
  vec3 light = normalize(vec3(-0.5, 0.6, 0.65));
  vec3 h = normalize(light + vec3(0.0, 0.0, 1.0));
  float specular = max(dot(n, h), 0.0);
  float broad = pow(specular, 6.0) * 0.25;
  float narrow = pow(specular, 40.0) * 0.5;

  // A slow diagonal sweep, like the reflection of a window going by.
  float sweep = pow(max(sin((p.x + p.y) * 1.2 - uTime * 0.25), 0.0), 8.0) * 0.2;

  vec3 colour = mix(uColorA, tint, presence);
  colour += mix(uColorB, uColorC, 0.5) * broad * uShimmer;
  colour += uColorC * (narrow + sweep) * uShimmer;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
