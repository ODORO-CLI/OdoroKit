/**
 * Shader of the molten metal.
 *
 * ## The mathematical idea
 *
 * A bath of hot metal: a crust that cracks, and under it a matter glowing red.
 * The heat field is a fractal noise with domain warping — two passes, so that
 * the flows coil instead of unrolling sheets — and it drifts very slowly, like
 * a heavy liquid.
 *
 * The colour is a ramp with three stops: the background for the crust, a warm
 * hue for the metal, a light hue for the core of the bath. The veins are the
 * level lines of the field, where the crust cracks and lets the heat show. The
 * relief comes from two offset reads of the field, which give a normal; a
 * grazing light turns it into a paste.
 *
 * On a light background, the bath keeps its warm hues: the crust is the
 * background itself, never the background darkened.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, the crust.
 * - `uColorB` — the hot metal.
 * - `uColorC` — the core of the bath, and the veins.
 * - `uSpeed` — speed of the flow.
 * - `uScale` — scale of the field; higher is finer.
 * - `uHeat` — share of the bath that is molten.
 * - `uOctaves` — detail of the noise, and therefore its cost.
 */
export const MOLTEN_METAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uHeat;
uniform float uOctaves;

// Pseudo-random number: projection onto an arbitrary direction, amplified sine,
// fractional part.
float metalHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float metalNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = metalHash(cell);
  float b = metalHash(cell + vec2(1.0, 0.0));
  float c = metalHash(cell + vec2(0.0, 1.0));
  float d = metalHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Sum of octaves: each pass twice as fine and twice as weak.
float metalFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += metalNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// The heat field: two domain warps, then the noise.
float metalHeat(vec2 p, float t, int octaves) {
  vec2 q = vec2(
    metalFbm(p + vec2(t, 0.0), octaves),
    metalFbm(p + vec2(5.2, 1.3) - t * 0.7, octaves)
  );
  vec2 r = vec2(
    metalFbm(p + q * 2.0 + vec2(1.7, 9.2) + t * 0.4, octaves),
    metalFbm(p + q * 2.0 + vec2(8.3, 2.8) - t * 0.3, octaves)
  );
  return metalFbm(p + r * 1.8, octaves);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // Three reads of the field: the value, and two offsets for the relief.
  float e = 0.02;
  float heat = metalHeat(p, t, octaves);
  float cx = metalHeat(p + vec2(e, 0.0), t, octaves);
  float cy = metalHeat(p + vec2(0.0, e), t, octaves);

  // A slow beat: the bath breathes.
  heat += 0.05 * sin(uTime * 1.5 + heat * 8.0);

  // The ramp: the crust, then the metal, then the core. The heat setting moves
  // the thresholds, and therefore the share of the bath that is molten.
  float molten = clamp(uHeat, 0.0, 1.0);
  float metal = smoothstep(0.68 - molten * 0.25, 0.86 - molten * 0.2, heat);
  float core = smoothstep(0.8 - molten * 0.15, 0.98 - molten * 0.1, heat);

  // The veins: the level lines of the field, where the crust cracks.
  float vein = 1.0 - smoothstep(0.0, 0.025, abs(heat - (0.62 - molten * 0.2)));
  vein *= 1.0 - metal;

  // The relief: the gradient of the field as the normal, a grazing light.
  vec3 n = normalize(vec3(-(cx - heat), -(cy - heat), e * 1.5));
  vec3 lightDir = normalize(vec3(-0.6, 0.5, 0.5));
  float diffuse = max(dot(n, lightDir), 0.0);
  vec3 h = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float highlight = pow(max(dot(n, h), 0.0), 24.0);

  vec3 colour = mix(uColorA, uColorB, metal * (0.7 + 0.3 * diffuse));
  colour = mix(colour, uColorC, core * (0.6 + 0.4 * diffuse));
  colour = mix(colour, uColorC, vein * 0.7);

  // The glow: the core radiates, and the paste catches the light.
  colour += uColorC * core * core * 0.3;
  colour += uColorB * vein * 0.2;
  colour += mix(uColorB, uColorC, 0.5) * highlight * metal * 0.25;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
