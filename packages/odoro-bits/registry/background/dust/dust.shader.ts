/**
 * Shader for the dust.
 *
 * ## The mathematical idea
 *
 * Two things: a shaft and motes. The shaft is a soft band around an oblique
 * line through the centre, measured as a signed distance to that line; it
 * widens as it moves away from its source and loses its strength, like a beam
 * coming in through a window. A slow value noise modulates it, so that it has
 * the texture of air rather than that of a flat fill.
 *
 * The motes are hashed per cell across three layers, and drift along a sum of
 * sines of non-multiple frequencies — an approximated Brownian walk, with no
 * state to keep. What makes it dust is that the motes are only visible inside
 * the shaft: their light is multiplied by the intensity of the beam at their
 * position — the mote's, not the fragment's, so that a mote enters the light
 * as one whole.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the shadow of the room.
 * - `uColorB` — the hue of the shaft.
 * - `uColorC` — the motes in the light.
 * - `uSpeed` — drift speed of the motes.
 * - `uDensity` — number of cells over the height, for the near layer.
 * - `uAngle` — tilt of the shaft, in degrees.
 * - `uWidth` — half-width of the shaft, in frame heights.
 * - `uLayers` — number of layers evaluated, and so the cost.
 */
export const DUST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uAngle;
uniform float uWidth;
uniform float uLayers;

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float dustHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Two decorrelated numbers for the same cell.
vec2 dustHash2(vec2 p) {
  return vec2(dustHash(p), dustHash(p + vec2(37.3, 17.7)));
}

// Value noise: smoothed interpolation between the cell's four corners.
float dustNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = dustHash(cell);
  float b = dustHash(cell + vec2(1.0, 0.0));
  float c = dustHash(cell + vec2(0.0, 1.0));
  float d = dustHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Intensity of the shaft at a point, in centred coordinates.
float shaft(vec2 c, vec2 dir, vec2 nrm) {
  float across = dot(c, nrm);
  float along = dot(c, dir);

  // The beam widens as it moves away from its source, and weakens.
  float width = max(uWidth, 0.02) * (0.7 + 0.5 * smoothstep(-1.0, 1.0, along));
  float band = 1.0 - smoothstep(width * 0.3, width, abs(across));
  float strength = 0.55 + 0.45 * smoothstep(1.0, -0.6, along);

  return band * strength;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(aspect, 1.0) * 0.5;
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  float rad = radians(uAngle);
  vec2 dir = vec2(cos(rad), sin(rad));
  vec2 nrm = vec2(-dir.y, dir.x);

  // The veil of the shaft: its texture is a slow noise, the air moving inside.
  float veil = shaft(uv - centre, dir, nrm);
  float air = 0.7 + 0.3 * dustNoise(uv * 3.0 + vec2(t * 0.06, -t * 0.03));
  vec3 colour = uColorA + uColorB * veil * air * 0.35;

  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.6);

    // The motes barely fall: the air carries them more than it drops them.
    vec2 drift = vec2(t * 0.015, t * 0.03) * (1.0 - depth * 0.25);
    vec2 p = uv * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 neighbour = cell + vec2(float(dx), float(dy));
        vec2 seed = dustHash2(neighbour + depth * 59.0);
        float exists = step(0.3, dustHash(neighbour + 9.0 + depth));

        // Approximated Brownian walk: two sines per axis, non-multiple
        // frequencies, hashed phases.
        vec2 wander = 0.35 * vec2(
          sin(t * 0.31 + seed.x * 6.28318) + 0.5 * sin(t * 0.83 + seed.y * 4.0),
          cos(t * 0.27 + seed.y * 6.28318) + 0.5 * cos(t * 0.71 + seed.x * 5.0)
        );
        vec2 moteCentre = neighbour + 0.5 + wander;

        // The mote is only visible inside the light: the shaft is read at its
        // position, not at the fragment's.
        vec2 world = (moteCentre - drift) / scale;
        float light = mix(0.06, 1.0, shaft(world - centre, dir, nrm));

        float d = length(p - moteCentre);
        float size = (0.03 + 0.04 * seed.x) * (1.0 - depth * 0.3);
        float halo = exp(-d * d / (size * size));

        colour += uColorC * halo * light * exists * (0.9 - depth * 0.3);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
