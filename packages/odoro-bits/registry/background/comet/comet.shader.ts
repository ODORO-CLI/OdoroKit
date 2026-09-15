/**
 * Comet shader.
 *
 * ## The mathematical idea
 *
 * A head as a gaussian halo at the damped pointer position, and a tail
 * stretched opposite the catch-up velocity: the fragment's relative
 * position is projected onto the direction of movement, and the tail is a
 * transverse gaussian that narrows and fades along that projection. Once
 * the comet has caught the pointer, the velocity falls to zero and the tail
 * vanishes of its own accord. A light flicker animates the head.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the sky.
 * - `uColorB` — the tail.
 * - `uColorC` — the head.
 * - `uPointer` — damped position of the comet, in texture coordinates.
 * - `uVelocity` — catch-up velocity, in texture coordinates per second.
 * - `uSize` — radius of the head.
 * - `uTail` — length of the tail.
 */
export const COMET_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uSize;
uniform float uTail;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float cometHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  vec2 vel = uVelocity * vec2(aspect, 1.0);

  float size = max(uSize, 0.01);
  float speed = length(vel);
  vec2 dir = vel / max(speed, 0.0001);

  vec2 rel = p - m;
  float d2 = dot(rel, rel);

  // The head: a gaussian halo, with a light flicker — a slow beat modulates
  // a fast grain, never enough to put the head out.
  float flicker = 0.9 + 0.1 * sin(uTime * 9.0 + cometHash(floor(vUv * 64.0)) * 6.2831);
  float head = exp(-d2 / (size * size)) * flicker;

  // The tail: behind the head, opposite the movement. The projection onto
  // the direction gives the position along the tail, the transverse
  // component the distance to its axis.
  float along = dot(rel, -dir);
  float across = dot(rel, vec2(-dir.y, dir.x));

  // The length follows the catch-up velocity: comet at rest, tail gone.
  float tailLength = uTail * clamp(speed * 0.8, 0.0, 1.0);
  float fall = clamp(1.0 - along / max(tailLength, 0.001), 0.0, 1.0);

  // The tail narrows as it moves away from the head.
  float sigma = size * (0.25 + 0.75 * fall);
  float tail = exp(-(across * across) / (sigma * sigma)) * fall * fall * step(0.0, along);

  // A fixed backdrop of star dust, very discreet, so that the sky is not a
  // flat tint.
  vec2 cell = floor(vUv * vec2(aspect, 1.0) * 60.0);
  float star = step(0.995, cometHash(cell)) * (0.3 + 0.7 * cometHash(cell + 11.0));

  vec3 colour = uColorA;
  float radial = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.4, 1.0, radial) * 0.4;

  colour += uColorB * star * 0.35;
  colour += uColorB * tail * 0.8;
  colour += uColorC * head * 1.2;

  gl_FragColor = vec4(colour, 1.0);
}
`
