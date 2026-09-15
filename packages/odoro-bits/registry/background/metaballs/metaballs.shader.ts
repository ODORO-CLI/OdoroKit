/**
 * Shader of the metaballs.
 *
 * ## The mathematical idea
 *
 * Every ball emits a field in r2/d2; the sum of the fields is thresholded by a
 * narrow smoothstep, so that two balls drawing near join through a neck before
 * merging — with no code gluing them together.
 *
 * What sets this background apart from a plain threshold is the lighting: the
 * gradient of the field, obtained from two offset reads, serves as the normal.
 * A fixed light then gives a diffuse and a highlight, and the matter goes from
 * flat wash to gel. The cost is three sums instead of one, which stays bounded
 * by the number of balls.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the hue of the gel.
 * - `uColorC` — the highlight.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uSpeed` — speed at which the balls drift.
 * - `uCount` — number of free balls.
 * - `uThreshold` — threshold of the field.
 * - `uGloss` — strength of the highlight.
 */
export const METABALLS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uCount;
uniform float uThreshold;
uniform float uGloss;

// Pseudo-random number for an index: amplified sine, fractional part.
float ballsHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Centre of ball i: a Lissajous curve with periods drawn from the index, never
// multiples of one another, so that the orbit never closes.
vec2 ballsCentre(float i, float t, float aspect) {
  float h1 = ballsHash(i + 1.0);
  float h2 = ballsHash(i + 11.0);
  float h3 = ballsHash(i + 23.0);
  vec2 c = vec2(
    0.5 + 0.38 * sin(t * (0.4 + h1 * 0.5) + h2 * 6.2831),
    0.5 + 0.34 * cos(t * (0.3 + h3 * 0.6) + h1 * 6.2831)
  );
  return c * vec2(aspect, 1.0);
}

// Sum of the fields: the free balls, then the pointer's one.
float ballsField(vec2 p, float t, float aspect, int count, vec2 m) {
  float total = 0.0;

  // Constant bound: the language specification demands it. Twelve balls are
  // enough; beyond that, they overlap and the pattern is lost.
  for (int i = 0; i < 12; i += 1) {
    if (i >= count) break;
    float fi = float(i);
    vec2 c = ballsCentre(fi, t, aspect);
    float r = 0.09 + 0.07 * ballsHash(fi + 41.0);
    vec2 d = p - c;
    total += r * r / max(dot(d, d), 0.0001);
  }

  vec2 dm = p - m;
  total += 0.02 / max(dot(dm, dm), 0.0001);

  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int count = int(clamp(uCount, 1.0, 12.0));

  // Three reads of the field: the value, and two offsets for the gradient.
  float e = 0.004;
  float f = ballsField(p, t, aspect, count, m);
  float fx = ballsField(p + vec2(e, 0.0), t, aspect, count, m);
  float fy = ballsField(p + vec2(0.0, e), t, aspect, count, m);

  // The matter: a narrow threshold, for a crisp edge without aliasing.
  float threshold = max(uThreshold, 0.1);
  float body = smoothstep(threshold - 0.12, threshold + 0.12, f);

  // The normal: the gradient of the field, flattened, raised by a vertical
  // component. Near the edge, the gradient dominates and the surface lies down;
  // at the core, it faces the camera. That is what makes the balls bulge.
  vec2 grad = vec2(fx - f, fy - f) / e;
  vec3 n = normalize(vec3(-grad * 0.06, 1.0));

  vec3 lightDir = normalize(vec3(-0.45, 0.55, 0.7));
  float diffuse = max(dot(n, lightDir), 0.0);
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 h = normalize(lightDir + view);
  float highlight = pow(max(dot(n, h), 0.0), 40.0) * uGloss;

  // The edge: where the normal lies down, a lighter rim, as on a translucent
  // gel seen head-on.
  float rim = pow(1.0 - max(n.z, 0.0), 1.5) * 0.5;

  vec3 gel = uColorB * (0.55 + 0.45 * diffuse);
  gel = mix(gel, uColorC, rim);
  gel += uColorC * highlight;

  // A soft shadow under the balls, which lifts them off the background.
  float shadow = smoothstep(threshold * 0.45, threshold, f) * 0.18;
  vec3 background = uColorA * (1.0 - shadow);

  gl_FragColor = vec4(mix(background, gel, body), 1.0);
}
`
