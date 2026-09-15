/**
 * Shader of the oil slick.
 *
 * ## The mathematical idea
 *
 * As with the soap film, a colour by interference: the hue turns with the
 * thickness. But an oil slick is thin, twisted and laid on a dark water — three
 * differences that change the whole render.
 *
 * Thin: the fringes are far tighter, and a cosine at triple frequency separates
 * them with crisp dark fringes. Twisted: the thickness is read in a domain
 * already warped by a first noise, which coils the fringes into swirls instead
 * of spreading them into bands. Laid on water: a third noise cuts out the
 * extent of the slick, and between its lobes, the water ripples under a striped
 * reflection.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the water.
 * - `uColorB` — the first hue of the fringes.
 * - `uColorC` — the second hue of the fringes.
 * - `uSpeed` — speed at which the slick drifts.
 * - `uScale` — scale of the noise.
 * - `uFringes` — density of the fringes.
 * - `uRipple` — strength of the reflections on the water.
 * - `uOctaves` — detail of the noise, and therefore its cost.
 */
export const OIL_SLICK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uFringes;
uniform float uRipple;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float slickHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float slickNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = slickHash(cell);
  float b = slickHash(cell + vec2(1.0, 0.0));
  float c = slickHash(cell + vec2(0.0, 1.0));
  float d = slickHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float slickFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += slickNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // The twist: a first noise warps the domain of the second, and that is what
  // coils the fringes into swirls.
  vec2 twist = vec2(
    slickFbm(p + vec2(t, -t * 0.6), octaves),
    slickFbm(p + vec2(3.1, 7.4) + t * 0.8, octaves)
  );
  float thickness = slickFbm(p * 1.7 + twist * 2.6 - vec2(t * 0.3, 0.0), octaves);

  // The fringes: one turn of hue per unit, tight; the cosine at triple
  // frequency separates them with crisp dark bands.
  float phase = thickness * uFringes * 6.2831853;
  vec3 hue = mix(uColorB, uColorC, 0.5 + 0.5 * sin(phase));
  float bands = 0.35 + 0.65 * pow(0.5 + 0.5 * cos(phase * 3.0), 0.6);
  vec3 iridescent = hue * bands;

  // The extent: a third noise, at a large scale, cuts out the lobes of the
  // slick. Its edge is soft — oil spreads, it does not cut out.
  float extent = slickFbm(p * 0.45 + vec2(t * 0.5, t * 0.2) + 11.0, octaves);
  float slick = smoothstep(0.38, 0.6, extent);

  // The water: dark, striped by a rippling reflection, between the lobes.
  float wave = sin((p.x * 1.4 + p.y * 0.9) * 6.0 + uTime * 1.2 + twist.x * 4.0);
  float reflection = pow(max(wave, 0.0), 8.0) * uRipple;
  vec3 water = uColorA + mix(uColorB, uColorC, 0.5) * reflection * 0.35;

  // At the rim of the slick, where it thins out, the fringes speed up: a little
  // of the hue spills onto the water, like the halo of a real slick.
  float rim = smoothstep(0.3, 0.38, extent) * (1.0 - slick);
  water = mix(water, iridescent * 0.5, rim * 0.6);

  gl_FragColor = vec4(mix(water, iridescent, slick), 1.0);
}
`
