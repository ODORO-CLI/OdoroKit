/**
 * Shader of the pixel trail.
 *
 * ## The mathematical idea
 *
 * The fragment never asks whether it is lit: it is **the centre of its
 * pixel** that is tested against the fourteen deposits of the buffer. The
 * whole cell therefore receives the same value, and the trail comes out
 * stepped instead of coming out blurred — which is exactly the difference
 * between a pixel trail and a luminous trail.
 *
 * The decay is not continuous either: the value kept is rounded up to the
 * next step of an adjustable scale. A screen pixel comes down a notch, it
 * does not fade.
 *
 * A deposit at -1000 gives an enormous age, hence a nil contribution: the
 * empty slots of the buffer are inert from the outset.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the cold pixels, at the end of the trail.
 * - `uColorC` — the fresh pixels, under the cursor.
 * - `uTrail` — fourteen deposits (x, y, deposit time), ring buffer.
 * - `uPixel` — number of pixels over the height.
 * - `uLife` — lifetime of a lit pixel, in seconds.
 * - `uLevels` — number of decay steps.
 */
export const PIXEL_TRAIL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uTrail[14];
uniform float uPixel;
uniform float uLife;
uniform float uLevels;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uPixel, 6.0, 90.0);
  vec2 cell = floor(uv * scale);
  vec2 local = fract(uv * scale) - 0.5;

  // The centre of the pixel, and the radius within which a deposit lights it:
  // a little over half a cell, so that a fast gesture leaves no hole.
  vec2 centre = (cell + 0.5) / scale;
  float reach = 0.85 / scale;

  float best = 0.0;

  // Constant bound: the language specification demands it.
  for (int i = 0; i < 14; i += 1) {
    vec3 deposit = uTrail[i];
    vec2 d = abs(centre - deposit.xy * vec2(aspect, 1.0));
    float age = max(uTime - deposit.z, 0.0);

    float touched = step(max(d.x, d.y), reach);
    float alive = clamp(1.0 - age / max(uLife, 0.05), 0.0, 1.0);
    best = max(best, touched * alive);
  }

  // The decay in steps: rounding up keeps the first notch whole for as long
  // as the pixel is not fully out.
  float levels = max(floor(uLevels), 1.0);
  float steps = ceil(best * levels) / levels;

  // The freshness decays faster than the value: the vivid hue stays near the
  // cursor, the trail falls back onto the cold hue.
  float fresh = best * best * best;

  // A thread of background between the pixels: without it, two neighbouring
  // lit pixels form a flat area and the grid disappears.
  float gap = smoothstep(0.0, 0.06, 0.5 - max(abs(local.x), abs(local.y)) - 0.03);

  vec3 lit = mix(uColorB, uColorC, fresh);
  vec3 colour = mix(uColorA, lit, steps * gap);

  gl_FragColor = vec4(colour, 1.0);
}
`
