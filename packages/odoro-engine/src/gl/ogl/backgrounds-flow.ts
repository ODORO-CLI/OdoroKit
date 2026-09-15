/**
 * Background shaders: the flow family.
 *
 * Four ways to make colour flow without ever moving any geometry. The common
 * point: the fragment does not ask "what is here" but "where would here be if
 * space had flowed", and reads the colour over there.
 *
 * None of these shaders is taken from elsewhere. The mathematics of each is
 * explained where it lives — that is the only way to be able to modify it
 * later without reinventing it.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Plasma: the interference of four waves.
 *
 * ## The technique
 *
 * This is the oldest effect in the history of the demoscene, and it fits in
 * one addition: four sines of different orientations and frequencies,
 * evaluated at the same point. Where they reinforce each other, the value
 * rises; where they oppose each other, it falls. The resulting pattern has no
 * structure of its own — it is made only of their beats.
 *
 * The fourth sine is evaluated on the **distance** to the centre rather than
 * on a linear combination of x and y. That is what stops the figure from
 * staying a grid of diamonds: without it, the first three waves would form a
 * perfectly periodic lattice, and the eye would see it immediately.
 *
 * The sum is brought back into `[0,1]` then passed through a cosine, which
 * folds the scale onto itself: the hues follow one another in a loop instead
 * of saturating at the ends.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`.
 */
export const PLASMA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // Three directional waves: each is a grid of bands, their sum is a lattice.
  // The frequencies are not multiples of one another.
  float v = sin(p.x * 3.0 + t);
  v += sin(p.y * 2.3 - t * 0.8);
  v += sin((p.x + p.y) * 1.7 + t * 0.6);

  // The fourth is radial: it breaks the periodicity of the lattice, without
  // which the figure would stay a recognisable grid of diamonds.
  v += sin(length(p) * 2.9 - t * 1.3);

  // Folding: the cosine sends the scale back onto itself, so the hues loop
  // instead of saturating at the ends of the sum.
  float k = 0.5 + 0.5 * cos(v * 1.2);

  vec3 colour = mix(uColorA, uColorB, k);
  colour = mix(colour, uColorC, 0.5 + 0.5 * sin(v * 0.8 + t * 0.4));

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Silk: a flow obtained by displacing the domain twice.
 *
 * ## Why two passes and not one
 *
 * A fractal noise on its own gives blotches. The same noise evaluated at a
 * point **already displaced** by another noise gives swirls: that is domain
 * displacement, and the aurora already uses it once.
 *
 * Here it is applied **twice**. The first pass creates currents, the second
 * coils them onto themselves. The difference is immediately visible: one pass
 * produces a crumpled fabric, two produce a fabric that flows. It is also what
 * doubles the cost, hence the downgrade by octaves.
 *
 * Time enters into the displacements, never into the final colour: the
 * material deforms instead of flickering.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uOctaves`.
 */
export const SILK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOctaves;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  // First pass: two noises decorrelated by a constant offset, forming a vector
  // field. It gives the currents.
  vec2 current = vec2(
    odoroFbm(p + vec2(0.0, t), octaves),
    odoroFbm(p + vec2(5.2, 1.3 - t), octaves)
  );

  // Second pass: the same field, evaluated where the first one sent it. It is
  // these currents applied to themselves that coil the material.
  vec2 fold = vec2(
    odoroFbm(p + 4.0 * current + vec2(1.7, 9.2), octaves),
    odoroFbm(p + 4.0 * current + vec2(8.3, 2.8), octaves)
  );

  float v = odoroFbm(p + 4.0 * fold, octaves);

  vec3 colour = mix(uColorA, uColorB, clamp(v * 1.6, 0.0, 1.0));

  // The length of the fold marks the areas where the flow coiled the most:
  // that is where the third hue appears.
  colour = mix(colour, uColorC, clamp(length(fold) * 0.7, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Caustics: the light at the bottom of a pool.
 *
 * ## The technique
 *
 * A caustic is the place where refracted rays concentrate. Simulating it
 * properly would require tracing those rays; imitating it only requires
 * reproducing what characterises it to the eye — a lattice of bright, mobile
 * filaments that cross without ever closing back.
 *
 * The procedure: a displacement of the point by the sine of its own
 * coordinates is iterated a few times. Each pass folds space a little more,
 * and the accumulated distance between the point and its image naturally forms
 * lines of concentration. It is the opposite of a blur: instead of averaging,
 * a minimum is accumulated.
 *
 * The exponent applied at the end is what separates a diffuse halo from a
 * crisp filament. Below six, it looks like fog.
 *
 * Uniforms: `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uIntensity`.
 */
export const CAUSTICS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uIntensity;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  vec2 current = p;
  float accumulation = 1.0;

  // Five folds: beyond that, the filaments cross too much to stay legible;
  // below three, the lattice stays a plain grid.
  for (int i = 1; i < 6; i += 1) {
    float n = float(i);
    current += vec2(
      sin(current.y * n + t + 0.3 * n) / n,
      cos(current.x * n + t + 0.2 * n) / n
    );

    // The accumulated minimum: the value only keeps the closest pass, which
    // draws lines instead of a gradient.
    accumulation = min(accumulation, length(current - p) * 0.5);
  }

  // The exponent turns a halo into a filament. Below six, the effect looks
  // like fog rather than refracted light.
  float light = pow(clamp(1.0 - accumulation, 0.0, 1.0), 6.0) * max(uIntensity, 0.0);

  gl_FragColor = vec4(mix(uColorA, uColorB, clamp(light, 0.0, 1.0)), 1.0);
}
`

/**
 * Vortex: space rotates all the more as you approach the centre.
 *
 * ## The technique
 *
 * In polar coordinates, a whirl is not a movement but an addition: a quantity
 * that decreases with the radius is added to the angle. Points close to the
 * centre rotate a lot, distant points almost not at all, and the whole coils
 * into a spiral.
 *
 * The pattern being coiled is deliberately trivial — angular sectors. All the
 * richness comes from the twist, not from the pattern: an already complex
 * pattern would become illegible once coiled.
 *
 * The radius is softened by `1/(r+c)` rather than by `1/r`: without that
 * constant, the twist diverges at the centre and the central pixel flickers on
 * every frame.
 *
 * Uniforms: `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale` (number of
 * arms), `uTwist`.
 */
export const VORTEX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uTwist;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float radius = length(p);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // The constant in the denominator bounds the twist at the centre: with 1/r
  // alone, it diverges and the central pixel flickers on every frame.
  float twist = uTwist / (radius + 0.25);
  float coiled = angle + twist + t;

  float arms = max(uScale, 1.0);
  float sector = 0.5 + 0.5 * sin(coiled * arms);

  vec3 colour = mix(uColorA, uColorB, sector);

  // The core receives the third hue: without it, the convergence of the arms
  // produces a neutral blotch at the exact centre.
  colour = mix(colour, uColorC, smoothstep(0.35, 0.0, radius));

  // Attenuation towards the edges: the frame is not round, and without it the
  // corners show the limit of the disc.
  colour *= smoothstep(0.95, 0.35, radius) * 0.6 + 0.4;

  gl_FragColor = vec4(colour, 1.0);
}
`
