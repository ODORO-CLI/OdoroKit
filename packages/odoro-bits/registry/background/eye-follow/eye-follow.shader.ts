/**
 * Shader for the eyes that follow.
 *
 * ## The mathematical idea
 *
 * One eye per cell of a grid. The shape of the eye is not an ellipse but the
 * intersection of two vertically offset discs: that is what gives it its two
 * pointed corners, which an ellipse does not have. In signed distance, an
 * intersection is a maximum — two lengths, one `max`, and the shape is done.
 *
 * The gaze is the direction from the cell towards the pointer, squashed: a lot
 * along the x axis, little along the y axis. An iris that moved as much in
 * both directions would leave the eye through the top before reaching its
 * corner.
 *
 * The blink is a squashing of the local frame along y, not a shutter laid over
 * the top: the eye therefore closes on itself, and its eyelid does not have to
 * be drawn. Every eye blinks at its own pace, drawn from its cell
 * coordinates.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, and the spark inside the iris.
 * - `uColorB` — the line of the eye and its pupil.
 * - `uColorC` — the iris.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uEyes` — number of eyes over the height.
 * - `uGaze` — amplitude of the gaze, between zero and one.
 * - `uBlink` — frequency of the blinks. Zero cuts them.
 */
export const EYE_FOLLOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uEyes;
uniform float uGaze;
uniform float uBlink;

// Pace of its own for one eye, stable from one frame to the next.
float eyeSeed(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uEyes, 1.0, 10.0);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  vec2 centre = (cell + 0.5) / scale;
  vec2 m = uPointer * vec2(aspect, 1.0);

  // The gaze: direction towards the pointer, amplitude bounded and squashed.
  vec2 towards = m - centre;
  float span = length(towards);
  vec2 dir = span > 0.0001 ? towards / span : vec2(0.0, 0.0);
  float reach = min(span * 2.5, 1.0) * clamp(uGaze, 0.0, 1.0);
  vec2 look = vec2(dir.x * 0.20, dir.y * 0.07) * reach;

  // The blink: a narrow impulse inside the eye's own cycle.
  float seed = eyeSeed(cell);
  float beat = fract(uTime * (0.10 + 0.09 * seed) * max(uBlink, 0.0) + seed);
  float lid = (beat - 0.5) * 26.0;
  float shut = exp(-lid * lid) * step(0.0001, uBlink);
  float open = max(1.0 - shut, 0.07);

  // The eye's frame of reference, squashed by the eyelid.
  vec2 q = vec2(local.x, local.y / open);

  // The intersection of two discs: a max of two signed distances.
  float upper = length(q - vec2(0.0, 0.36)) - 0.55;
  float lower = length(q - vec2(0.0, -0.36)) - 0.55;
  float shape = max(upper, lower);

  float px = scale / max(uResolution.y, 1.0) * 1.6;
  float inside = 1.0 - smoothstep(0.0, px * 2.0, shape);
  float outline = 1.0 - smoothstep(px, px * 3.0, abs(shape));

  // The iris, the pupil, and the spark offset up and to the left.
  float iris = 1.0 - smoothstep(0.0, px * 2.0, length(q - look) - 0.15);
  float pupil = 1.0 - smoothstep(0.0, px * 2.0, length(q - look) - 0.065);
  float spark =
    1.0 - smoothstep(0.0, px * 2.0, length(q - look - vec2(0.055, 0.055)) - 0.028);

  vec3 colour = uColorA;
  colour = mix(colour, mix(uColorA, uColorB, 0.07), inside);
  colour = mix(colour, uColorC, iris * inside);
  colour = mix(colour, uColorB, pupil * inside);
  colour = mix(colour, uColorA, spark * inside);
  colour = mix(colour, uColorB, outline * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
