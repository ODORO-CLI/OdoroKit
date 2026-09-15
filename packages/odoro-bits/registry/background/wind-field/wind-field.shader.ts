/**
 * Wind field shader.
 *
 * ## The mathematical idea
 *
 * A grid of cells, and in each one a short stroke: its direction is that of
 * the wind at that point, its length the strength of the wind. The wind is a
 * prevailing bearing deflected by a slow noise, and its strength a second
 * noise crossed by gusts — bands that sweep the frame along the bearing. It
 * is a weather station reading, stroke by stroke, set in motion.
 *
 * A long stroke spills out of its cell; every fragment therefore evaluates
 * the nine cells around it, with constant bounds, so that no stroke is
 * clipped at the edge of its own. The stroke is a tapered capsule: thinner at
 * the back, wider at the front, which gives the direction without an arrow.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the strokes in calm air.
 * - `uColorC` — the strokes inside a gust.
 * - `uCells` — number of cells per frame height.
 * - `uScale` — frequency of the noise, hence the size of the eddies.
 * - `uSpeed` — how fast the wind evolves and the gusts sweep past.
 * - `uGusts` — strength of the gusts.
 */
export const WIND_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uScale;
uniform float uSpeed;
uniform float uGusts;

float windHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float windNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);
  float a = windHash(cell);
  float b = windHash(cell + vec2(1.0, 0.0));
  float c = windHash(cell + vec2(0.0, 1.0));
  float d = windHash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Distance to a tapered capsule between a and b: the radius grows from the
// back towards the front.
float windCapsule(vec2 p, vec2 a, vec2 b, float back, float front) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.000001), 0.0, 1.0);
  return length(p - a - ab * h) - mix(back, front, h);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float pixel = 1.0 / max(uResolution.y, 1.0);

  float cells = max(uCells, 4.0);
  float size = 1.0 / cells;
  vec2 base = floor(p * cells);
  float t = uTime * uSpeed;

  // The prevailing bearing turns very slowly: the wind never comes from quite
  // the same side.
  float bearing = 0.3 + sin(t * 0.07) * 0.5;
  vec2 bearingDir = vec2(cos(bearing), sin(bearing));

  float stroke = 0.0;
  float force = 0.0;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 cell = base + vec2(float(dx), float(dy));
      vec2 centre = (cell + 0.5) * size;

      // The direction: the bearing, deflected by a slow noise read at the
      // centre of the cell. The strength: a second noise, plus the passing
      // gust.
      float deviation = (windNoise(centre * uScale + vec2(t * 0.12, -t * 0.08)) - 0.5) * 3.0;
      vec2 direction = vec2(cos(bearing + deviation), sin(bearing + deviation));

      float breath = windNoise(centre * uScale * 0.6 + vec2(-t * 0.1, t * 0.06) + 40.0);
      // The gust: a band advancing along the bearing, given torn edges by a
      // noise.
      float along = dot(centre, bearingDir) - t * 0.35;
      float gust = pow(0.5 + 0.5 * sin(along * 3.5 + windNoise(centre * 4.0 + t * 0.3) * 2.0), 6.0) * uGusts;
      float strength = clamp(0.25 + breath * 0.6 + gust, 0.0, 1.4);

      // The stroke, centred on the cell, oriented and sized by the wind.
      float strokeLength = size * (0.25 + strength * 0.55);
      vec2 a = centre - direction * strokeLength * 0.5;
      vec2 b = centre + direction * strokeLength * 0.5;
      float d = windCapsule(p, a, b, pixel * 0.5, pixel * (1.0 + strength * 0.9));
      float coverage = 1.0 - smoothstep(-pixel * 0.5, pixel * 0.7, d);

      stroke = max(stroke, coverage);
      force = max(force, coverage * gust);
    }
  }

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, stroke * 0.8);
  // Inside a gust the strokes change hue: the wind going past shows in the
  // colour as much as in the length.
  colour = mix(colour, uColorC, clamp(force * 1.8, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
