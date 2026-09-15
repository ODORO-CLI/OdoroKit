/**
 * Wake shader.
 *
 * ## The mathematical idea
 *
 * The cursor leaves a trail: sixteen positions sampled in the engine loop,
 * each one a Gaussian glow — exponential of the squared distance — whose
 * intensity decays as an exponential of its age. The glows add up, and the
 * sum serves twice: a first time for the tint, a second time, more
 * demanding, for the bright core of the freshest stroke.
 *
 * A deposit at -1000 gives an enormous age, hence a zero intensity: the empty
 * slots of the buffer are inert from the start.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the trail.
 * - `uColorC` — the fresh core of the trail.
 * - `uTrail` — sixteen deposits (x, y, deposit time), circular buffer.
 * - `uLife` — lifetime of a deposit, in seconds.
 * - `uSize` — radius of the glows.
 */
export const WAKE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uTrail[16];
uniform float uLife;
uniform float uSize;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float size = max(uSize, 0.005);
  float glow = 0.0;

  // Constant bounds: the language specification demands it, and sixteen
  // deposits are enough to draw a continuous trail at one deposit per 40 ms.
  for (int i = 0; i < 16; i += 1) {
    vec3 deposit = uTrail[i];
    vec2 centre = deposit.xy * vec2(aspect, 1.0);
    float age = uTime - deposit.z;

    vec2 offset = p - centre;
    float fade = exp(-max(age, 0.0) / max(uLife, 0.05));

    glow += exp(-dot(offset, offset) / (size * size)) * fade;
  }

  vec3 colour = mix(uColorA, uColorB, clamp(glow * 0.6, 0.0, 1.0));

  // The fresh core: only a dense sum of young glows reaches this threshold,
  // so the glint lives near the cursor and dies out along the trail.
  colour = mix(colour, uColorC, smoothstep(0.9, 1.8, glow) * 0.8);

  // A discreet vignette, so that the black is not a flat fill.
  float frameOffset = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.55, 1.1, frameOffset) * 0.3;

  gl_FragColor = vec4(colour, 1.0);
}
`
