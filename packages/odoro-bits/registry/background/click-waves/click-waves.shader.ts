/**
 * Click waves shader.
 *
 * ## The mathematical idea
 *
 * Each click is a circular wave: a sine of the distance minus the age times
 * the speed, under a double exponential envelope — one puts the wave out
 * with time, the other with distance. The eight live waves sum, and their
 * height displaces the lookup into a light noise: the rings deform
 * something instead of floating on a flat tint.
 *
 * A start at -1000 gives an enormous age, hence a null envelope: the empty
 * slots of the buffer are inert by default.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the surface texture.
 * - `uColorC` — the glint on the crests.
 * - `uClicks` — eight clicks (x, y, start time), circular buffer.
 * - `uSpeed` — propagation speed of the rings.
 * - `uWidth` — wavelength of the rings.
 * - `uDecay` — rate at which they fade with time.
 */
export const CLICK_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[8];
uniform float uSpeed;
uniform float uWidth;
uniform float uDecay;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float waveHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float waveNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = waveHash(cell);
  float b = waveHash(cell + vec2(1.0, 0.0));
  float c = waveHash(cell + vec2(0.0, 1.0));
  float d = waveHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float width = max(uWidth, 0.02);
  float height = 0.0;

  // Constant bounds: the language specification demands it, and eight live
  // clicks are enough — the ninth would already have gone.
  for (int i = 0; i < 8; i += 1) {
    vec3 clic = uClicks[i];
    vec2 centre = clic.xy * vec2(aspect, 1.0);
    float age = uTime - clic.z;
    float d = length(p - centre);

    // The front sits at radius age x speed; the wave exists only behind it.
    float front = age * uSpeed;
    float behind = smoothstep(0.0, width, front - d);

    float wave = sin((d - front) * (6.2831853 / width));
    float envelope = exp(-uDecay * max(age, 0.0)) * exp(-d * 1.5);

    height += wave * envelope * behind;
  }

  // The noise is read at a point displaced by the wave height: it is that
  // refraction that makes the rings visible across the whole surface.
  float grain = waveNoise(p * 3.0 + height * 0.8 + uTime * 0.03);

  vec3 colour = mix(uColorA, uColorB, grain * 0.45 + 0.1);

  // The crests light up, the troughs darken slightly.
  colour += uColorC * clamp(height, 0.0, 1.0) * 0.5;
  colour *= 1.0 - clamp(-height, 0.0, 1.0) * 0.25;

  gl_FragColor = vec4(colour, 1.0);
}
`
