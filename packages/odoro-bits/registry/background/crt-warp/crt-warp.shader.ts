/**
 * Cathode-ray warp shader.
 *
 * ## The mathematical idea
 *
 * A tube is not flat: the image bulges towards the viewer. The bulge is
 * read backwards — for each pixel of the screen, we look for which point
 * of the flat image ends up there — and it comes down to a single formula:
 * the centred coordinates are stretched by a factor that grows with the
 * square of their distance to the centre. The image's corners are pulled
 * out of the frame, and the screen's silhouette becomes a pincushion.
 *
 * Nor is the glass perfect. It splits the light near the edges: the image's
 * two hues are read at two slightly separated positions, the more so the
 * further the pixel lies from the centre. An aperture grid — fine
 * vertical columns, those of a slot-mask tube — is laid over the top, and
 * a vignette breathes slowly. It pulls back towards the background, it
 * does not darken: on a light theme, a tube that is off is white, not
 * black.
 *
 * The image itself is a slow signal: two waves, one rising, the other
 * drifting across, blended by product.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, the tube switched off.
 * - `uColorB` — the first hue of the signal.
 * - `uColorC` — the second.
 * - `uCurve` — bulge of the tube.
 * - `uLines` — number of aperture-grid columns across the width.
 * - `uAberration` — separation of the hues near the edges.
 * - `uSpeed` — speed of the signal.
 */
export const CRT_WARP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCurve;
uniform float uLines;
uniform float uAberration;
uniform float uSpeed;

// The displayed signal: two slow waves, one rising, the other drifting
// across. Returned between zero and one for each hue.
vec2 crtSignal(vec2 uv, float t) {
  float rise = 0.5 + 0.5 * sin(uv.y * 5.0 - t * 0.9 + sin(uv.x * 3.0 + t * 0.4) * 0.8);
  float drift = 0.5 + 0.5 * sin(uv.x * 4.0 + t * 0.6 + uv.y * 2.5);
  return vec2(rise, rise * drift);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  // The bulge: the centred coordinates, stretched with the square of their
  // distance to the centre. The corners leave the frame.
  vec2 centred = (vUv - 0.5) * 2.0;
  vec2 scaled = centred * vec2(aspect, 1.0);
  float r2 = dot(scaled, scaled) / (1.0 + aspect * aspect);
  vec2 warped = centred * (1.0 + uCurve * r2 * 2.0);
  vec2 uv = warped * 0.5 + 0.5;

  // The screen's silhouette: whatever falls outside the flat image is the
  // tube switched off, with an edge softened by a pixel or two.
  float px = 1.0 / max(uResolution.y, 1.0);
  float inset = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float screen = smoothstep(0.0, px * 3.0, inset);

  // The glass splits: each hue is read at its own position, moved out from
  // the centre in proportion to the distance.
  vec2 spread = centred * uAberration * 0.012;
  float rise = crtSignal(uv + spread, t).x;
  float drift = crtSignal(uv - spread, t).y;

  vec3 image = mix(uColorA, uColorB, rise * 0.75);
  image = mix(image, uColorC, drift * 0.7);

  // The aperture grid: fine columns, read in the bulged space so that they
  // curve along with the image.
  float grid = 0.5 + 0.5 * sin(uv.x * max(uLines, 1.0) * 6.28318);
  image = mix(image, uColorA, (1.0 - grid * grid) * 0.22);

  // The vignette breathes, and pulls back towards the background, not black.
  float breath = 0.5 + 0.08 * sin(uTime * 0.7);
  float edge = smoothstep(breath, breath + 0.7, r2 * 2.2);
  image = mix(image, uColorA, edge * 0.7);

  // A frozen reflection on the glass, at the top left.
  vec2 glare = scaled - vec2(-0.45 * aspect, 0.55);
  float shine = exp(-dot(glare, glare) * 3.0) * 0.14;
  image = mix(image, uColorC, shine);

  vec3 colour = mix(uColorA, image, screen);

  gl_FragColor = vec4(colour, 1.0);
}
`
