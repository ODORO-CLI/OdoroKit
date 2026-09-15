/**
 * Floating lines shader.
 *
 * ## The mathematical idea
 *
 * Each line is a curved segment laid in a frame of its own: a centre that
 * drifts on two slow sines, a tilted direction that oscillates, a finite
 * length. In that frame, the fragment projects onto the segment's axis —
 * which gives the position along the line — and onto its normal — which
 * gives the distance to the stroke, less a sinusoidal bend.
 *
 * The ends are not cut: they fade out over the last third of the length.
 * That is what makes the segment float instead of settling.
 *
 * The centres each drift at their own speed and the tilts differ: two lines
 * always end up crossing, and it is the crossing — a brighter point where
 * two halos add up — that gives the
 * depth.
 *
 * The distance to the stroke is divided by the norm of its slope, as for any
 * y = f(x): without that the bend would thicken the stroke in its curves.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the halo of the lines.
 * - `uColorC` — the core of the stroke.
 * - `uCount` — number of lines, capped at ten.
 * - `uSpeed` — speed of the drift.
 * - `uLength` — length of the segments, in frame heights.
 * - `uGlow` — width of the halo.
 */
export const FLOATING_LINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSpeed;
uniform float uLength;
uniform float uGlow;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float px = 1.0 / max(uResolution.y, 1.0);
  int count = int(clamp(uCount, 1.0, 10.0));

  float halo = 0.0;
  float core = 0.0;

  // Ten at most: the bound is constant, the language specification demands
  // it, and beyond that the crossings blur into one another.
  for (int i = 0; i < 10; i += 1) {
    if (i >= count) break;
    float index = float(i);

    // The centre drifts on two sines of different periods: the trajectory is a
    // Lissajous figure that does not visibly close on itself.
    vec2 centre = vec2(
      aspect * (0.5 + sin(t * (0.21 + index * 0.017) + index * 2.1) * 0.42),
      0.5 + cos(t * (0.17 + index * 0.023) + index * 1.3) * 0.38
    );

    // The tilt oscillates around a diagonal of the line's own.
    float angle = 0.4 + index * 0.65 + sin(t * 0.13 + index) * 0.35;
    vec2 dir = vec2(cos(angle), sin(angle));
    vec2 normal = vec2(-dir.y, dir.x);

    vec2 rel = p - centre;
    float along = dot(rel, dir);
    float across = dot(rel, normal);

    // Bend: the segment is not straight, it ripples gently along its axis, and
    // the slope of that ripple normalises the thickness.
    float bend = 0.05;
    float freq = 5.0 + index * 0.7;
    float wave = sin(along * freq + t * 1.4 + index);
    float slope = bend * freq * cos(along * freq + t * 1.4 + index);
    float d = abs(across - bend * wave) / sqrt(1.0 + slope * slope);

    // The ends fade out over the last third: the segment floats.
    float halfLength = max(uLength, 0.1) * (0.7 + 0.3 * sin(index * 3.7));
    float ends = 1.0 - smoothstep(halfLength * 0.65, halfLength, abs(along));

    float thin = 1.0 - smoothstep(px * 0.6, px * 1.8, d);
    float glow = exp(-d / max(uGlow, 0.005));

    // Each line has its own intensity, breathing slowly.
    float weight = 0.6 + 0.4 * sin(t * 0.5 + index * 1.9);

    halo += glow * ends * weight;
    core = max(core, thin * ends * weight);
  }

  vec3 colour = mix(uColorA, uColorB, clamp(halo, 0.0, 1.0) * 0.7);
  colour = mix(colour, uColorC, clamp(core, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
