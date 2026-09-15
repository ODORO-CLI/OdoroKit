/**
 * Shader for the grid under a lens.
 *
 * ## The mathematical idea
 *
 * The grid is not deformed: the domain is, before it is read. Around the
 * lens centre, every point is pulled towards that centre by a fraction
 * worth the square of the profile — full at the centre, nil at the edge,
 * without a step. The grid read on that contracted domain appears dilated:
 * the meshes spread apart, and the lines thicken with them, as under real
 * glass. A linear profile would give a break at the edge; the square
 * smooths it.
 *
 * The lens rim is a thin ring read by distance to the radius, and a shadow
 * just inside gives the glass its thickness. The radius barely breathes: a
 * perfectly still lens would read as a display fault.
 *
 * The centre is the pointer, damped by the component.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the lines.
 * - `uColorC` — the lens rim, and the lines at its centre.
 * - `uPointer` — centre position, in texture coordinates.
 * - `uCells` — number of cells across the height.
 * - `uStrength` — magnification strength, between zero and one.
 * - `uRadius` — lens radius, in frame heights.
 */
export const GRID_DISTORTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uCells;
uniform float uStrength;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 centre = uPointer * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);

  // The radius barely breathes.
  float radius = max(uRadius, 0.05) * (1.0 + 0.04 * sin(uTime * 1.3));
  vec2 d = p - centre;
  float r = length(d);

  // The lens profile: full at the centre, nil at the edge, without a step.
  float inside = 1.0 - smoothstep(0.0, radius, r);
  float bulge = inside * inside;

  // The domain is pulled towards the centre before reading: the meshes
  // appear dilated there, and the lines thickened with them.
  vec2 q = centre + d * (1.0 - clamp(uStrength, 0.0, 0.95) * bulge);

  float cells = clamp(uCells, 2.0, 60.0);
  vec2 g = q * cells;
  vec2 local = abs(fract(g) - 0.5);
  float pxc = px * cells;
  float lines = 1.0 - smoothstep(pxc * 0.4, pxc * 1.4, 0.5 - max(local.x, local.y));

  // The glass rim, and its shadow just inside.
  float rim = 1.0 - smoothstep(px * 1.0, px * 3.0, abs(r - radius));
  float shade = smoothstep(radius * 0.6, radius, r) * inside;

  vec3 colour = mix(uColorA, uColorB, lines * (0.45 + 0.55 * inside));
  colour = mix(colour, uColorA, shade * 0.25);
  colour = mix(colour, uColorC, lines * bulge * 0.6 + rim * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
