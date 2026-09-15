/**
 * Shader of the torch.
 *
 * ## The mathematical idea
 *
 * A discreet pattern — a fine grid lifted by a value noise — covered by a dark
 * veil. The glow is a soft window around the pointer: a smoothstep of the
 * distance gives the pattern its light back, and a warm peak at the centre
 * gives the glow its substance.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background under the veil.
 * - `uColorB` — the strokes of the pattern.
 * - `uColorC` — the warmth of the beam.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uRadius` — radius of the glow.
 * - `uSoftness` — softness of the edge of the glow.
 * - `uDim` — opacity of the veil outside the beam.
 */
export const TORCH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uSoftness;
uniform float uDim;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float torchHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float torchNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = torchHash(cell);
  float b = torchHash(cell + vec2(1.0, 0.0));
  float c = torchHash(cell + vec2(0.0, 1.0));
  float d = torchHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  // The pattern under the veil: a fine grid, lifted by a slow noise. This is
  // what the torch reveals — with no pattern, the glow would light nothing.
  vec2 lines = abs(fract(p * 24.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.08, min(lines.x, lines.y));
  float grain = torchNoise(p * 5.0 + uTime * 0.05);

  vec3 pattern = mix(uColorA, uColorB, grid * 0.55 + grain * 0.25);

  // The glow: full up to the inner edge, out at the radius. Softness sets the
  // width of the transition between the two.
  float d = length(p - m);
  float inner = uRadius * (1.0 - clamp(uSoftness, 0.05, 1.0));
  float torch = 1.0 - smoothstep(inner, max(uRadius, inner + 0.001), d);

  // The veil takes light away everywhere the torch does not reach.
  float lit = mix(1.0 - clamp(uDim, 0.0, 1.0), 1.0, torch);
  vec3 colour = pattern * lit;

  // The warm peak at the heart of the beam: the square tightens the
  // contribution onto the centre, where a real torch burns.
  colour += uColorC * torch * torch * 0.35;

  gl_FragColor = vec4(colour, 1.0);
}
`
