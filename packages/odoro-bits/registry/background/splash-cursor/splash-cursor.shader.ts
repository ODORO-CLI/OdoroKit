/**
 * Shader for the splashes.
 *
 * ## The mathematical idea
 *
 * Ten blots alive at once, each one deposited by the loop when the pointer
 * moves. A blot is not a disc: its radius is modulated by two harmonics of
 * the polar angle, phase-shifted by a seed drawn from its deposit time. No
 * two blots ever share the same outline.
 *
 * It opens out quickly then settles — a rising exponential — and dies away
 * slowly, as a falling exponential of the age. The contributions add up,
 * and the hue is their weighted average: two blots that overlap mix their
 * colours instead of masking each other, which is what fresh paint does
 * too.
 *
 * A deposit at -1000 gives a huge age, hence a nil contribution: the empty
 * slots of the buffer are inert from the start.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the first paint hue.
 * - `uColorC` — the second paint hue.
 * - `uSplash` — ten deposits (x, y, deposit time), ring buffer.
 * - `uLife` — lifetime of a blot, in seconds.
 * - `uSize` — radius of a blot, in frame heights.
 * - `uLobes` — irregularity of the outline, between zero and one.
 */
export const SPLASH_CURSOR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uSplash[10];
uniform float uLife;
uniform float uSize;
uniform float uLobes;

// Seed of a blot: its deposit time is enough, it is unique.
float splashSeed(float birth) {
  return fract(sin(birth * 78.233) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float amount = 0.0;
  vec3 tint = vec3(0.0);

  // Constant bound: the language specification demands it, and ten blots
  // are enough to cover a fast gesture without leaving a hole.
  for (int i = 0; i < 10; i += 1) {
    vec3 blot = uSplash[i];
    vec2 d = p - blot.xy * vec2(aspect, 1.0);
    float age = max(uTime - blot.z, 0.0);
    float seed = splashSeed(blot.z);

    // The outline: two low harmonics of the angle, phase-shifted by the
    // seed. Any higher and the blot would turn into a star.
    float angle = atan(d.y, d.x);
    float lobes = 1.0
      + uLobes * 0.22 * sin(angle * 3.0 + seed * 24.0)
      + uLobes * 0.10 * sin(angle * 7.0 - seed * 17.0);

    float grown = 1.0 - exp(-age * 5.0);
    float radius = max(uSize, 0.01) * lobes * grown;
    float fade = exp(-age / max(uLife, 0.05));

    float blob = (1.0 - smoothstep(radius * 0.45, radius, length(d))) * fade;

    amount += blob;
    tint += mix(uColorB, uColorC, fract(seed * 6.0)) * blob;
  }

  // Weighted average: where nothing is deposited, the quotient never
  // matters since the mix falls back entirely onto the background.
  vec3 paint = tint / max(amount, 0.0001);
  vec3 colour = mix(uColorA, paint, clamp(amount, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
