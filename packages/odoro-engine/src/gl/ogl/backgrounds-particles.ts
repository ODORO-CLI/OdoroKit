/**
 * Background shaders: the scatter family.
 *
 * Four patterns made of many small elements — stars, drops, threads, bubbles.
 * None exists as an object: each is recovered by the fragment from its
 * position, thanks to the same principle as the tilings. This is what makes it
 * possible to display thousands of them without declaring a single one.
 *
 * None of these shaders is taken from elsewhere.
 *
 * @module
 */

/**
 * Stars: a scatter at several depths.
 *
 * ## How a thousand stars fit in nine lines
 *
 * Space is folded onto a grid, each cell contains at most one star, and its
 * position inside the cell is drawn from the identifier of the cell. The
 * fragment therefore never has to walk a list: it looks at which cell it is
 * in, and computes the only star that can be there.
 *
 * ## The depth
 *
 * Three layers of different densities scroll at three speeds. This is
 * parallax in the strict sense: what is far moves little. A single layer would
 * give a flat scatter, immediately recognisable as a sliding texture.
 *
 * The twinkling is not random per frame — that would produce noise. It is a
 * sine whose phase is drawn from the star: each twinkles at its own rhythm,
 * and reproducibly.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (density), `uTwinkle`.
 */
export const STARS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uTwinkle;

vec3 odoroRandom3(vec2 cell) {
  float a = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(cell, vec2(269.5, 183.3))) * 43758.5453);
  float c = fract(sin(dot(cell, vec2(419.2, 371.9))) * 43758.5453);
  return vec3(a, b, c);
}

// One layer: a grid, one star per cell, no list to walk.
float odoroLayer(vec2 p, float density, float t, float twinkle) {
  vec2 grid = p * density;
  vec2 cell = floor(grid);
  vec2 local = fract(grid);

  vec3 rand = odoroRandom3(cell);

  // Two thirds of the cells stay empty: one star per cell would give a
  // perfectly regular grid, which the eye recognises.
  if (rand.z > 0.34) return 0.0;

  float d = length(local - rand.xy);

  // The twinkling is a sine whose phase is drawn from the star: each has its
  // own rhythm, and it is reproducible from one frame to the next.
  float brightness = 1.0 - twinkle * (0.5 + 0.5 * sin(t * 3.0 + rand.z * 62.8));

  return smoothstep(0.06, 0.0, d) * brightness;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  float density = max(uScale, 1.0);
  float twinkle = clamp(uTwinkle, 0.0, 1.0);

  // Three depths, three speeds: what is far moves little. A single layer would
  // read as a sliding texture.
  float light = odoroLayer(p + vec2(t * 0.010, 0.0), density, t, twinkle) * 1.0;
  light += odoroLayer(p + vec2(t * 0.025, 0.0), density * 1.7, t, twinkle) * 0.7;
  light += odoroLayer(p + vec2(t * 0.050, 0.0), density * 2.6, t, twinkle) * 0.4;

  gl_FragColor = vec4(mix(uColorA, uColorB, clamp(light, 0.0, 1.0)), 1.0);
}
`

/**
 * Rain: vertical trails of unequal lengths.
 *
 * ## The technique
 *
 * Space is cut into columns. Each column receives a speed and a phase drawn
 * from its index, then scrolls independently: it is that offset which keeps
 * the rain from falling in ranks.
 *
 * A drop is a segment, not a point. It is drawn by fading progressively
 * upwards from its head — the trail is therefore free, it is only a function
 * of the distance to the head.
 *
 * ## Why the column is folded, not the drop
 *
 * Folding the vertical coordinate of the whole column means a drop that leaves
 * at the bottom comes back at the top without discontinuity. Moving a drop
 * would require making it exist as an object, and handling its disappearance.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (columns), `uLength`.
 */
export const RAIN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uLength;

float odoroHash1(float x) {
  return fract(sin(x * 127.1) * 43758.5453);
}

void main() {
  vec2 p = vUv;
  float t = uTime * uSpeed;

  float columns = max(uScale, 1.0);
  float index = floor(p.x * columns);
  float inside = fract(p.x * columns);

  float rand = odoroHash1(index);

  // Speed and phase of the column's own: without that offset, the rain would
  // fall in perfectly aligned ranks.
  float speed = 0.6 + rand * 1.4;
  float head = fract(rand + t * speed);

  // The coordinate is folded onto the whole column: a drop that leaves at the
  // bottom comes back at the top without having to make it disappear.
  float distance = fract(p.y + head);

  // The trail is only a function of the distance to the head: no segment is
  // drawn, only the fading suggests it.
  float trail = smoothstep(max(uLength, 0.01), 0.0, distance);

  // Width of the line: the same softening on each side of the column.
  float line = smoothstep(0.5, 0.15, abs(inside - 0.5));

  gl_FragColor = vec4(mix(uColorA, uColorB, trail * line), 1.0);
}
`

/**
 * Threads: a bundle of fine curves.
 *
 * ## How to trace a curve without tracing it
 *
 * A fragment cannot follow a path; it can, however, measure its distance to a
 * curve whose equation it knows. Here each thread is a `y = f(x)`, and the
 * fragment compares its own `y` to the thread's. Close by, it lights up; far
 * away, it stays dark.
 *
 * ## The slope correction
 *
 * Without it, a thread looks thick where it is flat and thin where it climbs:
 * the vertical distance is not the distance to the curve. Dividing by the
 * square root of `1 + f'(x)2` corrects exactly that gap — it is the same
 * division that appears in the distance from a point to a line.
 *
 * Without that correction, the effect looks like an anti-aliasing error. With
 * it, the thickness is constant over the whole length of the thread.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (number of threads),
 * `uThickness`.
 */
export const THREADS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uThickness;

void main() {
  vec2 p = vUv;
  float t = uTime * uSpeed;
  float threads = max(uScale, 1.0);
  float thickness = max(uThickness, 0.0005);

  vec3 colour = uColorA;

  for (int i = 0; i < 12; i += 1) {
    if (float(i) >= threads) break;

    float k = float(i) / threads;
    float phase = t + k * 6.28318;

    // Two sines of non-multiple frequencies: the thread does not repeat to the
    // eye across the width of the frame.
    float y = 0.5
      + 0.18 * sin(p.x * 4.0 + phase)
      + 0.07 * sin(p.x * 9.3 - phase * 1.7)
      + (k - 0.5) * 0.7;

    // The derivative of the same expression: it serves to correct the thickness.
    float slope = 0.18 * 4.0 * cos(p.x * 4.0 + phase)
      - 0.07 * 9.3 * cos(p.x * 9.3 - phase * 1.7);

    // Distance to the curve, not vertical distance: without this division the
    // thread would look thick where it is flat and thin where it climbs.
    float d = abs(p.y - y) / sqrt(1.0 + slope * slope);

    colour = mix(colour, uColorB, smoothstep(thickness, 0.0, d));
  }

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Bubbles: discs that rise and merge into one another.
 *
 * ## The merging
 *
 * Two discs drawn side by side stay two discs. Adding fields that decay with
 * distance, then thresholding the sum, makes them merge as soon as they come
 * close: this is the principle of implicit surfaces, and the only way to get
 * that neck-shaped junction without describing any geometry.
 *
 * The field used is `r2/d2`, which equals one on the edge of the disc and
 * decays afterwards. The sum is compared to one, so that an isolated disc
 * recovers exactly its nominal size — which would not be the case with a
 * Gaussian field.
 *
 * ## The rise
 *
 * Every bubble has its own speed, and its height is folded onto `[0,1]`: it
 * reappears at the bottom as soon as it leaves at the top, without
 * discontinuity. Its horizontal drift is a sine with its own phase — without
 * it, the bubbles would rise on rails.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale` (count), `uRadius`.
 */
export const BUBBLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float count = max(uScale, 1.0);
  float radius = max(uRadius, 0.001);
  float field = 0.0;

  for (int i = 0; i < 16; i += 1) {
    if (float(i) >= count) break;

    float k = float(i);
    float rand = fract(sin(k * 127.1) * 43758.5453);
    float other = fract(sin(k * 311.7) * 43758.5453);

    // The height is folded: the bubble reappears at the bottom as soon as it
    // leaves at the top, without having to create or destroy it.
    float y = fract(rand + t * (0.3 + other * 0.7)) - 0.5;
    float x = (rand - 0.5) * aspect + 0.08 * sin(t * 1.3 + other * 6.28318);

    float size = radius * (0.5 + other);
    vec2 offset = p - vec2(x, y);

    // r2/d2: equals one on the edge, decays afterwards. Compared to one, an
    // isolated disc recovers exactly its nominal size.
    field += (size * size) / max(dot(offset, offset), 0.0001);
  }

  // The threshold on the sum, and not on each disc: this is where two close
  // bubbles merge, forming a neck.
  float shape = smoothstep(0.85, 1.15, field);

  gl_FragColor = vec4(mix(uColorA, uColorB, shape), 1.0);
}
`
