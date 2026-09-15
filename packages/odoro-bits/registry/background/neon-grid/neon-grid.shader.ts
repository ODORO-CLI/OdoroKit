/**
 * Shader of the neon grid.
 *
 * ## The mathematical idea
 *
 * Below the horizon, the ground is projected by setting the depth equal to the
 * inverse of the distance to the horizon: the vertical lines converge, the
 * depth lines crowd together, and a plain offset of the domain makes them
 * scroll towards the viewer.
 *
 * The strokes are filtered analytically: the coverage of a pixel is the exact
 * integral of the pulse train over the footprint of the pixel, derived from the
 * projection — with no screen-space derivative. Near the horizon, where dozens
 * of cells fit into one pixel, the coverage tends towards its mean instead of
 * moiring, and the cores fade out when they outgrow their cell.
 *
 * Above it, a striped sun: a disc whose lower part is cut by slits growing
 * wider towards the horizon, and sliding. A neon horizon line sews the two
 * halves together.
 *
 * Distinct from the flat grid, which drifts without perspective, and from the
 * tunnel, which is radial: here the grid recedes towards a point on the
 * horizon.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the neon of the grid and of the horizon.
 * - `uColorC` — the sun.
 * - `uSpeed` — speed at which the ground scrolls.
 * - `uHorizon` — height of the horizon, as a fraction of the frame.
 * - `uDensity` — number of visible depth lines.
 * - `uGlow` — reach of the halo of the strokes, in ground cells.
 */
export const NEON_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHorizon;
uniform float uDensity;
uniform float uGlow;

// Coverage of a pulse train of width w, centred on the integers, integrated
// over the footprint f of the pixel. A one-pixel box is not enough when the
// cell approaches the pixel — the two frequencies beat — so, as soon as the
// footprint exceeds a quarter of a cell, the coverage slides towards its mean,
// which is the width.
float stroke(float x, float w, float f) {
  float width = clamp(w, 0.0, 1.0);
  float footprint = max(f, 0.0001) * 1.5;
  float a = x + 0.5 - 0.5 * footprint;
  float b = x + 0.5 + 0.5 * footprint;
  float ia = floor(a) * width + clamp(fract(a) - 0.5 + 0.5 * width, 0.0, width);
  float ib = floor(b) * width + clamp(fract(b) - 0.5 + 0.5 * width, 0.0, width);
  return mix((ib - ia) / footprint, width, smoothstep(0.25, 0.6, f));
}

// The halo of a stroke: an exponential of the distance to the stroke, which
// also slides towards its mean when the cells crowd below the pixel.
float halo(float x, float g, float f) {
  float l = abs(fract(x) - 0.5);
  float mean = 2.0 * g * (1.0 - exp(-0.5 / g));
  return mix(exp(-l / g), mean, smoothstep(0.15, 0.5, f));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float horizon = clamp(uHorizon, 0.2, 0.8);
  float x = (vUv.x - 0.5) * aspect;
  float t = uTime * uSpeed;
  float px = 1.0 / max(uResolution.y, 1.0);
  float density = max(uDensity, 1.0) * 0.25;

  float ground = 0.0;
  float sun = 0.0;
  float sky = 0.0;

  if (vUv.y < horizon) {
    // The ground: the depth is the inverse of the distance to the horizon.
    float depth = max(horizon - vUv.y, 0.0005);
    float xw = x / depth * density;
    float zw = 1.0 / depth * density + t * 2.0;

    // The footprint of a pixel in ground cells: the gradient of the projection.
    // The vertical lines also vary with the height — all the more so the
    // further from the vanishing point — hence the second term. The cores are
    // a pixel and a half at every distance.
    float fx = px * density / depth * sqrt(1.0 + (x * x) / (depth * depth));
    float fz = px * density / (depth * depth);
    float wx = fx * 1.5;
    float wz = fz * 1.5;

    // A core wider than a third of its cell is no longer a stroke: it fades
    // out, and only the haze remains near the horizon.
    float coreX = stroke(xw, wx, fx) * (1.0 - smoothstep(0.2, 0.5, wx));
    float coreZ = stroke(zw, wz, fz) * (1.0 - smoothstep(0.2, 0.5, wz));

    float g = max(uGlow, 0.005);
    float halos = halo(xw, g, fx) + halo(zw, g, fz);

    float haze = exp(-depth * 22.0) * 0.35;
    ground = max(coreX, coreZ) + halos * 0.35 + haze;
  } else {
    // The sky: a hue fading out as it rises.
    float y = vUv.y - horizon;
    sky = exp(-y * 5.0) * 0.25;

    // The sun: a disc above the horizon, cut at the bottom by slits that widen
    // downwards and slide slowly. Even right at the horizon, a sliver of disc
    // remains between two slits: the sun settles, it does not float.
    vec2 centre = vec2(0.0, 0.17);
    float rs = length(vec2(x, y) - centre);
    float radius = 0.2;
    float disc = 1.0 - smoothstep(radius, radius + px * 3.0, rs);
    float threshold = mix(-0.85, 1.3, smoothstep(0.0, 0.3, y));
    float bands = smoothstep(-0.12, 0.12, sin(y * 70.0 - t * 1.5) + threshold);
    float corona = exp(-max(rs - radius, 0.0) * 9.0) * 0.45;
    sun = disc * bands + corona;
  }

  // The horizon: a neon line sewing the ground to the sky.
  float line = exp(-abs(vUv.y - horizon) / 0.006) * 0.75;

  vec3 colour = mix(uColorA, uColorC, clamp(sun, 0.0, 1.0));
  colour = mix(colour, uColorB, clamp(ground + sky + line, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
