/**
 * Shader of the magnetic grid.
 *
 * ## The mathematical idea
 *
 * A grid of dots, each dot pushed away by the pointer: the offset is the
 * direction times a strength exponential in the distance — or pulled in, when
 * the sense is reversed. The dot moves aside inside the shader, no geometry:
 * every fragment evaluates the nine cells around it, so that a dot can slide
 * out of its cell without being clipped.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the dots at rest.
 * - `uColorC` — the dots under influence.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uDensity` — number of dots per frame height.
 * - `uRadius` — reach of the magnet.
 * - `uForce` — amplitude of the offset.
 * - `uAttract` — 1 to attract, 0 to repel.
 */
export const MAGNET_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uDensity;
uniform float uRadius;
uniform float uForce;
uniform float uAttract;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  float density = max(uDensity, 2.0);
  vec2 base = floor(p * density);

  // Repel by default, attract when the sense is reversed.
  float polarity = 1.0 - 2.0 * step(0.5, uAttract);

  float point = 0.0;
  float energy = 0.0;

  // Nine cells per fragment, at constant bounds: a displaced dot can come from
  // a neighbouring cell, and evaluating it only within its own would clip it at
  // the edge as soon as it moves aside.
  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 cell = base + vec2(float(dx), float(dy));
      vec2 centre = (cell + 0.5) / density;

      vec2 away = centre - m;
      float dist = length(away);
      vec2 dir = away / max(dist, 0.0001);

      // The force decays exponentially with the distance: close to the cursor
      // the field is crisp, far from it the grid goes back to perfect order.
      float strength = uForce * exp(-dist / max(uRadius, 0.01));
      vec2 pos = centre + dir * polarity * strength * (0.9 / density);

      float d = length(p - pos);
      float radius = 0.11 / density;
      point = max(point, 1.0 - smoothstep(radius * 0.5, radius, d));
      energy = max(energy, strength * (1.0 - smoothstep(radius * 0.5, radius * 1.4, d)));
    }
  }

  vec3 colour = mix(uColorA, uColorB, point * 0.85);

  // The dots under influence change hue: the field also shows through the
  // colour, not only through the displacement.
  colour = mix(colour, uColorC, clamp(energy * 1.6, 0.0, 1.0));

  // Discreet vignette, so the sheet is not a wallpaper.
  float fromCentre = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.5, 1.1, fromCentre) * 0.35;

  gl_FragColor = vec4(colour, 1.0);
}
`
