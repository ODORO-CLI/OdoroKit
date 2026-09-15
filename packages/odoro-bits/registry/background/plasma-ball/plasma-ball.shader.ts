/**
 * Shader of the plasma ball.
 *
 * ## The mathematical idea
 *
 * Everything happens in polar coordinates around the centre of the globe.
 * Every filament is a curve angle = f(radius): a base angle that drifts
 * slowly, plus a rippling that grows with the radius — near the central
 * electrode the filaments are straight, near the glass they snake. The
 * distance from a fragment to a filament is the angular difference times the
 * radius, that is to say an arc length: the stroke keeps the same thickness
 * from the centre to the edge.
 *
 * The main filament is drawn in by the pointer when the latter touches the
 * globe, like a finger on the glass; the others pale. Every filament flickers
 * by re-hashing the time, and ends on the glass in a hot spot.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the glow of the filaments and of the glass.
 * - `uColorC` — the core of the filaments and the electrode.
 * - `uPointer` — damped position of the pointer, centred, between -1 and 1, y downwards.
 * - `uFilaments` — number of filaments.
 * - `uRadius` — radius of the globe, in frame heights.
 * - `uSpeed` — speed of the drift and of the rippling.
 * - `uPull` — strength with which the pointer draws in the main filament.
 */
export const PLASMA_BALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uFilaments;
uniform float uRadius;
uniform float uSpeed;
uniform float uPull;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

// Ceiling on the filaments: the loop is bounded by a constant.
const int MAX_FILAMENTS = 10;

float ballHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float ballNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(ballHash(cell), ballHash(cell + 1.0), smoothed);
}

// Angular difference brought back into [-pi, pi].
float ballAngleDelta(float a, float b) {
  return mod(a - b + PI, TAU) - PI;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 m = vec2(uPointer.x * aspect, -uPointer.y) * 0.5;

  float radius = max(uRadius, 0.05);
  float r = length(p);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;
  int total = int(clamp(uFilaments, 1.0, float(MAX_FILAMENTS)));

  // The finger on the glass: near the globe, the pointer draws in the first
  // filament, the more so the closer it is.
  float touch = smoothstep(radius * 1.5, radius * 0.7, length(m)) * uPull;
  float fingerAngle = atan(m.y, m.x);

  // Re-hashed at twenty-four frames per second: the flicker.
  float frame = floor(uTime * 24.0);

  float core = 0.0;
  float glow = 0.0;
  float hot = 0.0;

  for (int i = 0; i < MAX_FILAMENTS; i += 1) {
    if (i >= total) break;
    float index = float(i);
    float seed = ballHash(index * 3.1 + 0.7);

    // The base angle drifts slowly, each at its own pace.
    float base = index * TAU / float(total) + (ballNoise(t * 0.3 + seed * 40.0) - 0.5) * 2.4;

    // The first filament gives in to the finger.
    float pulled = touch * step(index, 0.5);
    base = base + ballAngleDelta(fingerAngle, base) * pulled;

    // The rippling grows with the radius: straight at the centre, snaking at
    // the edge.
    float wave = (ballNoise(r * 9.0 + t * 1.6 + seed * 60.0) - 0.5) * 1.6
      + (ballNoise(r * 23.0 - t * 2.4 + seed * 17.0) - 0.5) * 0.5;
    float curve = base + wave * r / radius * (1.0 - pulled * 0.6);

    // Arc length to the curve: the stroke keeps its thickness.
    float d = abs(ballAngleDelta(angle, curve)) * r;

    float flicker = 0.65 + 0.35 * ballHash(frame + index * 7.0);
    // The other filaments pale when the finger holds one of them.
    float weight = flicker * mix(1.0, 0.35, touch * (1.0 - pulled)) * (1.0 + pulled * 0.8);
    // The filament lives from the electrode to the glass, and no further.
    float inside = smoothstep(radius + 0.004, radius - 0.006, r);

    core = max(core, exp(-d * 240.0) * weight * inside);
    glow = max(glow, exp(-d * d * 1400.0) * weight * inside);

    // The hot spot, where the filament touches the glass.
    vec2 tip = vec2(cos(curve), sin(curve)) * radius;
    hot = max(hot, exp(-dot(p - tip, p - tip) * 2500.0) * weight);
  }

  // The central electrode: a ball of light.
  float electrode = exp(-r * r * 1800.0) + exp(-r * 22.0) * 0.5;

  // The glass: a rim at the periphery, and a mist that thickens towards the
  // edge, like a reflection on a sphere.
  float glass = exp(-pow(abs(r - radius) * 90.0, 2.0)) * 0.7;
  float mist = smoothstep(radius, radius - 0.02, r) * pow(clamp(r / radius, 0.0, 1.0), 4.0) * 0.12;
  float halo = smoothstep(radius + 0.25, radius, r) * step(radius, r) * 0.06;

  // From the background towards the glow, then towards the core: every layer
  // is blended into the previous one. Adding them would saturate to white on
  // a light theme.
  vec3 colour = uColorA;
  colour = mix(colour, uColorB, clamp(mist + halo + glass * 0.6 + glow * 0.7, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(core * 0.95 + hot * 0.9 + electrode * 0.8, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
