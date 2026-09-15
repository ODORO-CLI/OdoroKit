/**
 * Shader of the ripple distortion.
 *
 * ## The mathematical idea
 *
 * A single source, the pointer, emits concentric waves: a sine of the distance
 * minus the time, under an exponential envelope that extinguishes them as they
 * travel away. The height of the wave is not seen directly — it **offsets the
 * lookup** of a pattern of bands, exactly as rippled glass offsets what is
 * seen through it. Without that detour, one would see drawn rings; with it,
 * one sees a deformed surface.
 *
 * The distance is measured in a frame of reference corrected by the aspect
 * ratio of the surface: without that correction, the rings would be ellipses
 * as soon as the area is not square.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — size of the canvas in pixels, supplied by the engine.
 * - `uColorA` — the trough of the bands.
 * - `uColorB` — their crest.
 * - `uColorC` — the sheen carried by the crests of the wave.
 * - `uPointer` — position of the pointer, damped, in texture coordinates.
 * - `uSpeed` — speed of propagation.
 * - `uScale` — tightness of the waves and of the bands.
 * - `uAmount` — amplitude of the lookup offset.
 */
export const RIPPLE_DISTORTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uScale;
uniform float uAmount;

void main() {
  // The aspect ratio of the surface corrects the distance: without it, the
  // rings flatten into ellipses on a wide area.
  float aspect = max(uResolution.x, 1.0) / max(uResolution.y, 1.0);
  vec2 offset = vec2((vUv.x - uPointer.x) * aspect, vUv.y - uPointer.y);
  float distance = length(offset);

  // The envelope extinguishes the wave with distance: the source stays
  // readable, and the edges do not shimmer forever.
  float envelope = exp(-distance * 2.6);
  float wave = sin(distance * uScale - uTime * uSpeed * 3.0) * envelope;

  // The outward direction, guarded against the exact centre where it does not
  // exist.
  vec2 direction = offset / max(distance, 0.001);
  vec2 read = vUv + direction * wave * uAmount * 0.06;

  // A pattern of oblique bands: it is what makes the deformation visible.
  float bands = 0.5 + 0.5 * sin((read.x + read.y) * uScale * 0.42 + uTime * uSpeed * 0.5);
  vec3 colour = mix(uColorA, uColorB, bands);

  // The crests carry the sheen, in both directions: a wave has a top and a
  // bottom, and lighting only one of the two gives a look of painted waves.
  colour = mix(colour, uColorC, smoothstep(0.25, 1.0, abs(wave)) * 0.55);

  gl_FragColor = vec4(colour, 1.0);
}
`
