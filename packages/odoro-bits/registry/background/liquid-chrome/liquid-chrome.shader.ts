/**
 * Shader of the liquid chrome.
 *
 * ## The mathematical idea
 *
 * Chrome is not painted: it reflects. What you see of a chromed surface is its
 * environment, folded by its shape. Here the shape is a liquid — directional
 * sines in a domain distorted by a first sine, which makes the waves soft —
 * and the environment is a studio reduced to the essentials: a light sky, a
 * dark floor, a hard horizon line between the two, and a light box in the sky.
 *
 * The reflected direction is computed from the normal; its vertical component
 * says whether the fragment looks at the sky or at the floor. It is that abrupt
 * flip that makes the chrome, and not a soft reflection: where iridescence
 * smooths, here everything is a step.
 *
 * ## The light and the dark
 *
 * The sky and the floor are the background and the ink of the theme, put in the
 * right order: the shader compares their luminances and takes the lighter one
 * for the sky. In a light theme, the chrome draws itself in ink over the
 * background; in a dark theme, it glows. No colour is ever multiplied towards
 * black: everything is a clamped mix between the tokens, and the horizon rim
 * receives a hue by addition.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the ink, the opposite of the background.
 * - `uColorC` — the hue of the horizon rim.
 * - `uSpeed` — speed of the liquid.
 * - `uScale` — scale of the waves.
 * - `uContrast` — depth of the floor in the reflection.
 * - `uSheen` — strength of the hue at the horizon.
 * - `uDetail` — number of waves summed, and therefore their cost.
 */
export const LIQUID_CHROME_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uContrast;
uniform float uSheen;
uniform float uDetail;

// A directional wave: the height, and its gradient.
vec3 chromeWave(vec2 p, vec2 dir, float freq, float phase, float amp) {
  float arg = dot(p, dir) * freq + phase;
  return vec3(sin(arg) * amp, cos(arg) * amp * freq * dir);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  float t = uTime * uSpeed;
  int waves = int(clamp(uDetail, 1.0, 5.0));

  // The liquid: the domain is distorted before the waves, which makes them
  // soft — straight sines would give corrugated iron, not chrome.
  p += 0.25 * vec2(sin(p.y * 1.4 + t * 0.8), sin(p.x * 1.1 - t * 0.6));

  vec3 field = chromeWave(p, normalize(vec2(1.0, 0.4)), 2.2, t * 1.3, 0.35);
  if (waves >= 2) field += chromeWave(p, normalize(vec2(-0.5, 1.0)), 3.1, -t * 1.0 + 0.7, 0.25);
  if (waves >= 3) field += chromeWave(p, normalize(vec2(0.8, -0.6)), 4.7, t * 1.6 + 2.4, 0.14);
  if (waves >= 4) field += chromeWave(p, normalize(vec2(0.1, 1.0)), 7.3, -t * 0.9 + 1.1, 0.07);
  if (waves >= 5) field += chromeWave(p, normalize(vec2(1.0, 1.0)), 11.0, t * 2.2, 0.03);

  vec3 n = normalize(vec3(-field.yz, 1.0));

  // The reflected direction of a head-on view: only its vertical component
  // matters for an environment made of horizontal bands.
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  // The sky and the floor, in the right order whatever the theme.
  float light = step(dot(uColorB, vec3(0.333)), dot(uColorA, vec3(0.333)));
  vec3 sky = mix(uColorB, uColorA, light);
  vec3 floorColour = mix(uColorA, uColorB, light);

  // The horizon: a step, barely softened. The light box: a band in the sky,
  // which makes the reflection read as a studio reflection.
  float horizon = smoothstep(-0.04, 0.04, r.y + 0.1);
  float box = smoothstep(0.42, 0.47, r.y) * smoothstep(0.72, 0.67, r.y);

  vec3 studio = mix(floorColour, sky, horizon);
  studio = mix(studio, floorColour, box * 0.35);
  vec3 colour = mix(uColorA, studio, clamp(uContrast, 0.0, 1.0));

  // The rim: a hue along the horizon and on the grazing edges, where real
  // chrome takes the colour of whatever surrounds it.
  float rim = exp(-abs(r.y + 0.1) * 14.0);
  float grazing = pow(1.0 - max(n.z, 0.0), 2.0);
  colour = mix(colour, uColorC, clamp(rim * 0.7 + grazing * 0.5, 0.0, 1.0) * uSheen);

  // The highlight: a narrow reflection, added towards the sky.
  vec3 lightDir = normalize(vec3(-0.4, 0.7, 0.6));
  vec3 h = normalize(lightDir + vec3(0.0, 0.0, 1.0));
  float highlight = pow(max(dot(n, h), 0.0), 60.0);
  colour = mix(colour, sky, highlight * 0.9);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
