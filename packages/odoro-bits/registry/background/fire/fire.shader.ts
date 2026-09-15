/**
 * Fire shader.
 *
 * ## The mathematical idea
 *
 * A fractal noise whose domain descends with time — the substance seems to
 * rise — stretched in height to give tongues and not balls, and swayed
 * sideways by a sine of the height. The heat is that noise minus a ramp of
 * the height: full at ground level, it dissolves on the way up, and it is
 * the noise that decides where one tongue climbs higher than its
 * neighbours. Two soft thresholds on the heat give the body and the core.
 *
 * Time enters only through the displacement of the domain: the flames rise
 * continuously, they do not flicker. Distinct from lava, with its slow
 * metaballs, and from embers, which are particles.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the body of the flames.
 * - `uColorC` — their core.
 * - `uSpeed` — rising speed.
 * - `uHeight` — height of the flames, as a fraction of the frame.
 * - `uScale` — fineness of the tongues; higher is finer.
 * - `uOctaves` — noise detail, and so its cost.
 */
export const FIRE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHeight;
uniform float uScale;
uniform float uOctaves;

float fireHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float fireNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = fireHash(cell);
  float b = fireHash(cell + vec2(1.0, 0.0));
  float c = fireHash(cell + vec2(0.0, 1.0));
  float d = fireHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float fireFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += fireNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.0 + vec2(5.1, 1.7);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float scale = max(uScale, 0.2);
  float height = max(uHeight, 0.05);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));

  // The domain descends: the substance rises. Stretched in height for
  // tongues; swayed by a sine that grows with the height.
  vec2 q = vec2(p.x * scale, p.y * scale * 0.6 - t * 1.2);
  q.x += 0.18 * sin(p.y * 4.0 - t * 2.0) * p.y;

  float noise = fireFbm(q, octaves) * 0.7
    + fireFbm(q * 2.1 + vec2(3.3, -t * 0.6), octaves) * 0.3;

  // The heat: the noise minus a ramp of the height. At ground level almost
  // everything burns; at the set height, only the tallest tongues
  // survive.
  float heat = clamp(noise * 1.6 + 0.3 - vUv.y / height * 1.3, 0.0, 1.0);

  float body = smoothstep(0.05, 0.55, heat);
  float core = smoothstep(0.65, 1.0, heat);

  // The glow above the flames: the heat tinting the air.
  float glow = exp(-vUv.y / height * 2.0) * 0.25 * (1.0 - body);

  vec3 colour = mix(uColorA, uColorB, clamp(body + glow, 0.0, 1.0));
  colour = mix(colour, uColorC, core);

  gl_FragColor = vec4(colour, 1.0);
}
`
