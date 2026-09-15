/**
 * Lava lamp shader.
 *
 * ## The mathematical idea
 *
 * Implicit surfaces, like metaballs, but constrained by the lamp: distance is
 * stretched vertically, so that a drop is an oval which lengthens as it rises;
 * the centres have only a slow vertical motion, drawn from a sine with its own
 * period, and a slight lateral sway.
 *
 * A reserve of wax fills the bottom of the column: one more field, depending
 * only on height and on a slow noise. A drop coming down melts into it without
 * a seam, and a drop being born rises out of it — that is what makes the cycle
 * believable.
 *
 * The colour is not a step of the field: every drop carries its own, drawn
 * from its height — hot at the bottom, cooled at the top — and where two drops
 * meet, it is the weighted average of the fields which decides. Two colours
 * therefore blend inside the matter itself, not along its edges.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, the glass.
 * - `uColorB` — the hot wax, at the bottom.
 * - `uColorC` — the cooled wax, at the top.
 * - `uSpeed` — speed of the rise.
 * - `uDrops` — number of drops.
 * - `uStretch` — vertical stretch of the drops.
 * - `uGlow` — glow of the heater, at the bottom.
 */
export const LAVA_LAMP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrops;
uniform float uStretch;
uniform float uGlow;

// Pseudo-random number from an index: amplified sine, fractional part.
float lampHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Pseudo-random number from a point: projection onto an arbitrary
// direction, amplified sine, fractional part.
float lampHash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the cell's four corners.
float lampNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = lampHash2(cell);
  float b = lampHash2(cell + vec2(1.0, 0.0));
  float c = lampHash2(cell + vec2(0.0, 1.0));
  float d = lampHash2(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int drops = int(clamp(uDrops, 1.0, 8.0));
  float stretch = max(uStretch, 1.0);

  float field = 0.0;
  vec3 tint = vec3(0.0);

  // Constant bound: the language specification demands it. Eight drops
  // already fill the column.
  for (int i = 0; i < 8; i += 1) {
    if (i >= drops) break;
    float fi = float(i);
    float h1 = lampHash(fi + 3.0);
    float h2 = lampHash(fi + 17.0);
    float h3 = lampHash(fi + 29.0);

    // The height: a slow sine with its own period, bounded so that the drop
    // leaves the reserve and never quite reaches the top. The lateral sway is
    // slower still, and far weaker.
    float y = 0.12 + 0.72 * (0.5 + 0.5 * sin(t * (0.6 + h1 * 0.5) + h2 * 6.2831));
    float x = (0.18 + 0.64 * h3 + 0.05 * sin(t * 0.7 + h1 * 6.2831)) * aspect;

    // The oval: vertical distance is divided by the stretch, and a rising
    // drop lengthens a little more — hot wax is more fluid.
    float elongation = stretch * (1.0 + 0.25 * (y - 0.4));
    vec2 d = (p - vec2(x, y)) * vec2(1.0, 1.0 / elongation);
    float r = 0.07 + 0.05 * h2;
    float weight = r * r / max(dot(d, d), 0.0001);

    field += weight;
    // The drop carries its colour: hot at the bottom, cooled at the top.
    tint += mix(uColorB, uColorC, smoothstep(0.15, 0.85, y)) * weight;
  }

  // The reserve: a field depending only on height, whose surface ripples with
  // a slow noise. A drop settling onto it melts in without a seam.
  float surface = 0.16 + 0.03 * lampNoise(vec2(p.x * 4.0 + t * 0.6, t * 0.4));
  float reserve = 0.012 / max((p.y - surface) * (p.y - surface), 0.0001);
  reserve *= step(surface, p.y);
  float level = smoothstep(surface + 0.02, surface - 0.04, p.y);
  field += reserve + level * 4.0;
  tint += uColorB * (reserve + level * 4.0);

  // The matter: a soft threshold — wax has no sharp edge — and its average
  // colour, weighted by the fields which compose it.
  float body = smoothstep(0.75, 1.35, field);
  vec3 wax = tint / max(field, 0.0001);

  // A simple relief: the wax is darker along its edges, brighter at the core,
  // which gives volume without a normal.
  float core = smoothstep(1.2, 3.5, field);
  wax = mix(wax * 0.78, wax * 1.08, core);

  // The heater: a glow rising from the bottom, a horizontal bell.
  float bell = 1.0 - smoothstep(0.0, aspect * 0.6, abs(p.x - aspect * 0.5));
  float heat = pow(1.0 - vUv.y, 3.0) * bell * uGlow;

  vec3 background = mix(uColorA, uColorB, heat * 0.55);

  gl_FragColor = vec4(mix(background, wax, body), 1.0);
}
`
