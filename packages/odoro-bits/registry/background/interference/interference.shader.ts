/**
 * Moire shader.
 *
 * ## The mathematical idea
 *
 * Two gratings of rings — a sine of the distance to each centre — whose
 * product brings out beats: sin(d1.f).sin(d2.f) is bright where the two
 * gratings are in phase, dark where they oppose each other, and those
 * fringes draw hyperbolas that neither of the two gratings contains. The
 * centres orbit slowly, the moire recomposes endlessly.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB`, `uColorC` — the two tones of the fringes.
 * - `uSpeed` — orbit speed.
 * - `uFrequency` — number of rings per unit of distance.
 * - `uSeparation` — orbit radius, hence the gap between the two centres.
 */
export const INTERFERENCE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uFrequency;
uniform float uSeparation;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // The two centres orbit at periods that are not multiples of one another:
  // the figure never comes back to exactly the same state.
  vec2 c1 = uSeparation * vec2(cos(t), sin(t * 0.83));
  vec2 c2 = -uSeparation * vec2(cos(t * 0.71 + 2.0), sin(t * 0.93 + 1.0));

  // Each grating is a sine of the distance to its centre: concentric rings,
  // nothing more.
  float f = max(uFrequency, 1.0) * 6.28318;
  float wave1 = sin(distance(p, c1) * f);
  float wave2 = sin(distance(p, c2) * f);

  // The product makes the moire: bright in phase, dark in opposition. The
  // fringes draw hyperbolas that neither of the two gratings contains.
  float beat = wave1 * wave2;
  float k = 0.5 + 0.5 * beat;

  // The two tones share the fringes according to a slow drift: the palette
  // breathes without the figure flickering.
  float split = 0.5 + 0.5 * sin(length(p) * 3.0 - t * 0.6);
  vec3 fringe = mix(uColorB, uColorC, split);

  vec3 colour = mix(uColorA, fringe, smoothstep(0.25, 1.0, k) * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
