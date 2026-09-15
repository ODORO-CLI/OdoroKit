/**
 * Lens flare shader.
 *
 * ## The mathematical idea
 *
 * A point source at the pointer: a sharp gaussian core, an exponential
 * halo, and an anamorphic streak — stretched in width, thin in height — of
 * the kind a cylindrical lens leaves behind. The ghosts are the signature of
 * the flare: discs and rings aligned on the line joining the source to the
 * centre of the frame, each with a position and a size drawn from its index,
 * in alternating hues. A large iris ring closes the chain on the side
 * opposite the source.
 *
 * Everything is laid down by a bounded mix towards the hues: on a light
 * background, the flare colours instead of washing out to white.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the warm hue: source, streak, even ghosts.
 * - `uColorC` — the cool hue: odd ghosts, iris ring.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uIntensity` — overall intensity of the flare.
 * - `uGhosts` — number of ghosts along the axis.
 * - `uStreak` — length of the anamorphic streak, in frame heights.
 */
export const LENS_FLARE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uIntensity;
uniform float uGhosts;
uniform float uStreak;

// A ghost: a soft disc and a sharper ring at its edge.
float ghost(vec2 p, vec2 centre, float radius) {
  float d = length(p - centre);
  float disc = 1.0 - smoothstep(radius * 0.6, radius, d);
  float e = (d - radius) / (radius * 0.18);
  float ring = exp(-e * e);
  return disc * 0.3 + ring * 0.55;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 source = uPointer * vec2(aspect, 1.0);
  vec2 centre = vec2(aspect * 0.5, 0.5);
  int n = int(clamp(uGhosts, 0.0, 6.0));

  // A slow breathing: a perfectly still flare looks painted.
  float breath = 0.92 + 0.08 * sin(uTime * 1.3);
  float strength = max(uIntensity, 0.0) * breath;

  vec2 d = p - source;
  float r = length(d);

  // The source: sharp core, endless halo.
  float core = exp(-r * r * 140.0);
  float halo = exp(-r * 3.5) * 0.5;

  // The anamorphic streak: thin in height, long in width.
  float streakLength = max(uStreak, 0.02);
  float streak = exp(-d.y * d.y * 4000.0) * exp(-abs(d.x) / streakLength * 1.5) * 0.7;

  // The ghosts: along the source -> centre axis, on either side of the
  // centre, in alternating hues. The closer the source is to the centre, the
  // tighter the chain draws — as in a real lens.
  vec2 axis = centre - source;
  float warm = 0.0;
  float cool = 0.0;
  for (int i = 0; i < 6; i += 1) {
    if (i >= n) break;
    float k = -0.5 + float(i) * 0.45;
    float h = fract(float(i) * 0.618 + 0.13);
    vec2 g = centre + axis * k;
    float radius = 0.025 + 0.045 * h;
    float value = ghost(p, g, radius) * (0.5 + 0.5 * h);
    if (fract(float(i) * 0.5) < 0.25) {
      warm += value;
    } else {
      cool += value;
    }
  }

  // The iris ring: large, thin, opposite the source.
  vec2 iris = centre + axis * 1.1;
  float ei = (length(p - iris) - 0.32) / 0.018;
  float ring = exp(-ei * ei) * 0.35;

  vec3 colour = mix(uColorA, uColorB, clamp((halo + streak + warm * 0.6) * strength, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp((cool * 0.6 + ring) * strength, 0.0, 1.0));

  // The core: the warm hue at full, then a wash towards the cool one which
  // makes the white point without ever writing white.
  colour = mix(colour, uColorB, clamp(core * strength, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(core * strength * 0.45, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
