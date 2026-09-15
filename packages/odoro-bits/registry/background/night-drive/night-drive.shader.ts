/**
 * Shader of the night drive.
 *
 * ## The mathematical idea
 *
 * A ground in perspective with no camera and no matrix: below the horizon line,
 * the depth is the inverse of the distance to the horizon, and the world
 * abscissa is the screen abscissa multiplied by that depth. The edges of the
 * road are two fixed world abscissas; the centre line is a line of dashes read
 * as the fractional part of the depth, offset by time to make it scroll. The
 * thickness of the strokes is bounded in screen pixels, not in world units:
 * without that they would vanish well before the horizon.
 *
 * The street lamps are a bounded queue. Each lamp has a phase along the road
 * that advances with time; its depth is a quadratic function of it, so that it
 * approaches slowly from afar and rushes past. Its head and its base are
 * projected the same way as the ground; a halo at the height of the head, a
 * pole between the two, a flattened pool on the ground. Everything is mixed
 * towards the colour of the lamp, never added: an addition would saturate on a
 * light background and the lamps would disappear in a light theme.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the lines of the road, the poles, the horizon glow.
 * - `uColorC` — the lamps.
 * - `uSpeed` — speed of the road.
 * - `uWidth` — half-width of the road, in world units.
 * - `uLamps` — number of street lamps per side, bounded at twelve.
 * - `uHeight` — height of the street lamps, in world units.
 */
export const NIGHT_DRIVE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uWidth;
uniform float uLamps;
uniform float uHeight;

const int MAX_LAMPS = 12;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  // The horizon a little above the centre; below it, the ground at z = 1/y,
  // the camera one unit above the ground.
  float horizon = 0.12;
  float drop = horizon - p.y;
  float ground = step(0.0, drop);
  float z = 1.0 / max(drop, 0.001);
  float wx = p.x * z;

  // The edges of the road and the dashed centre line, in the plane of the
  // ground. Their thickness is bounded in screen pixels: otherwise they fade.
  float halfWidth = max(uWidth, 0.2);
  float edges = 1.0 - smoothstep(px * 0.6, px * 1.8, abs(abs(wx) - halfWidth) / z);
  float dash = step(0.5, fract(z * 0.35 - t * 2.0));
  float axis = (1.0 - smoothstep(px * 0.5, px * 1.5, abs(wx) / z)) * dash;

  // The lines fade out as they approach the horizon.
  float fade = smoothstep(0.0, 0.1, drop);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, (edges + axis * 0.8) * fade * ground * 0.85);

  // The sky: a low glow at the horizon, that of a city far away.
  float sky = (1.0 - ground) * exp(-(p.y - horizon) * 9.0);
  colour = mix(colour, uColorB, sky * 0.18);

  // The street lamps: at regular intervals along the road, they advance towards
  // the camera and leave the field. The queue is bounded.
  float lamps = clamp(uLamps, 1.0, float(MAX_LAMPS));
  for (int i = 0; i < MAX_LAMPS; i += 1) {
    if (float(i) >= lamps) break;

    // The phase advances; the depth is a quadratic function of it.
    float u = fract(float(i) / lamps + t * 0.12);
    float zi = 0.7 + 28.0 * (1.0 - u) * (1.0 - u);

    for (int s = 0; s < 2; s += 1) {
      float sideX = (float(s) * 2.0 - 1.0) * halfWidth * 1.25 / zi;
      vec2 head = vec2(sideX, horizon + uHeight / zi);
      vec2 base = vec2(sideX, horizon - 1.0 / zi);

      // The pole: a stroke between the base and the head.
      float onPole = step(base.y, p.y) * step(p.y, head.y);
      float pole = (1.0 - smoothstep(px * 0.4, px * 1.4, abs(p.x - sideX))) * onPole;
      colour = mix(colour, uColorB, pole * 0.7);

      // The lamp: a halo growing as it approaches, and its pool on the ground,
      // flattened by the perspective.
      float size = 0.015 + 0.25 / zi;
      float glow = exp(-length(p - head) / size);
      float pool = exp(-length((p - base) * vec2(1.0, 4.0)) / (size * 2.5)) * ground;
      colour = mix(colour, uColorC, clamp(glow * 0.9 + pool * 0.35, 0.0, 1.0));
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
