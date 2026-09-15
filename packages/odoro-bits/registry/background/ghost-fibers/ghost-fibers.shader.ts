/**
 * Ghost fibers shader.
 *
 * ## The mathematical idea
 *
 * Twelve fibers, each a curve `y = base + amplitude x sin(x x frequency
 * + phase)` whose seed fixes the amplitude, the frequency and the drift. The
 * fragment does not walk the curve: it compares its ordinate with the
 * fiber's at the same abscissa, which suffices as long as the fibers stay
 * close to the horizontal.
 *
 * The attraction is an interpolation, not a force: level with the pointer,
 * the fiber's ordinate is pulled towards its own by a fraction equal to a
 * gaussian of the gap in abscissa. The fiber therefore pinches around the
 * cursor and recovers its path further on, without discontinuity.
 *
 * Each fiber is painted twice: a very fine core, and a broad haze doubling
 * it. It is that pairing that makes it a ghost — a stroke alone would be a
 * hair, a haze alone a cloud.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the fibers at rest.
 * - `uColorC` — the fibers pulled towards the pointer.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uFibers` — number of fibers, capped at twelve.
 * - `uBend` — strength of the attraction, between zero and one.
 * - `uSpeed` — drift speed of the fibers.
 */
export const GHOST_FIBERS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uFibers;
uniform float uBend;
uniform float uSpeed;

// A fiber's seed, stable from one frame to the next.
float fiberSeed(float index) {
  return fract(sin(index * 91.37) * 47453.19);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  float count = clamp(uFibers, 1.0, 12.0);
  float veil = 0.0;
  float pulled = 0.0;

  // Constant bound: the language specification demands it. The fibers beyond
  // the setting are cancelled by a mask rather than by a loop exit, which
  // older platforms refuse.
  for (int i = 0; i < 12; i += 1) {
    float index = float(i);
    float used = step(index, count - 0.5);

    float seed = fiberSeed(index + 1.0);
    float base = (index + 0.5) / count;
    float amplitude = 0.04 + seed * 0.10;
    float frequency = 1.6 + seed * 3.4;
    float phase = seed * 6.2831853 + uTime * uSpeed * (0.4 + seed * 0.7);

    float y = base + amplitude * sin(p.x * frequency + phase);

    // The pointer's grip: a gaussian of the gap in abscissa.
    float dx = (p.x - m.x) / (0.32 * aspect);
    float grip = exp(-dx * dx) * clamp(uBend, 0.0, 1.0);
    y = mix(y, m.y, grip * 0.9);

    float d = p.y - y;
    float core = exp(-d * d * 9000.0);
    float haze = exp(-d * d * 260.0);
    float strand = used * (core * 0.85 + haze * 0.30);

    veil += strand;
    pulled += strand * grip;
  }

  vec3 colour = mix(uColorA, uColorB, clamp(veil, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(pulled, 0.0, 1.0) * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
