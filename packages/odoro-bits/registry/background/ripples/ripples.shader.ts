/**
 * Shader for the drops.
 *
 * ## The mathematical idea
 *
 * Each drop emits damped rings: a sine of the distance to its centre, delayed
 * by the time, multiplied by a decreasing exponential of that same distance —
 * sin(d.f - t).exp(-d.a). The waves sum together, and where two trains of
 * rings cross, they interfere as they would on the surface of still water.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, the water at rest.
 * - `uColorB` — the hue of the crests.
 * - `uColorC` — the hue of the troughs.
 * - `uSpeed` — speed at which the rings propagate.
 * - `uDrops` — number of drops, bounded at twelve.
 * - `uDecay` — damping: the higher it is, the closer the rings stay to their
 *   centre.
 */
export const RIPPLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrops;
uniform float uDecay;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float dropHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  float drops = clamp(uDrops, 1.0, 12.0);
  float wave = 0.0;

  for (int i = 0; i < 12; i += 1) {
    if (float(i) >= drops) break;

    // The centre is drawn from the rank of the drop: deterministic, and so
    // stable from one frame to the next — a draw per frame would only be noise.
    float n = float(i);
    vec2 centre = vec2(dropHash(vec2(n, 1.0)) * aspect, dropHash(vec2(n, 7.0)));

    // The damped ring: the sine propagates, the exponential fades out. The
    // phase offset per drop desynchronises them, without which they would all
    // beat with one heart.
    float d = length(p - centre);
    wave += sin(d * 28.0 - t * 3.0 + n * 2.4) * exp(-d * max(uDecay, 0.1));
  }

  // The sum is brought back around zero per drop: the amplitude must not grow
  // with their number, only fill up with interferences.
  wave /= sqrt(drops);

  // The crests take one hue, the troughs the other: it is the sign of the
  // wave that chooses, its absolute value that doses.
  vec3 colour = mix(uColorA, uColorB, smoothstep(0.0, 0.9, max(wave, 0.0)));
  colour = mix(colour, uColorC, smoothstep(0.0, 0.9, max(-wave, 0.0)));

  gl_FragColor = vec4(colour, 1.0);
}
`
