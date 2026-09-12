/**
 * Shader des barres d'egaliseur.
 *
 * ## L'idee mathematique
 *
 * Aucun son n'est ecoute : le niveau de chaque barre est un bruit de valeur
 * lu en (indice de barre, temps). Le bruit est lisse en temps — la barre
 * monte et descend, elle ne saute pas — et independant d'une barre a l'autre
 * — deux voisines ne bougent pas ensemble. C'est ce couple qui fait croire
 * a un spectre.
 *
 * Une enveloppe en cloche centree sur le premier tiers donne plus de hauteur
 * aux graves qu'aux aigus, comme sur un vrai analyseur ; un battement lent
 * commun a toutes les barres tient lieu de mesure.
 *
 * Le pic est un second bruit, lu plus lentement et pris au maximum avec le
 * niveau : il descend apres la barre, ce qui est exactement ce que fait un
 * indicateur de crete a retombee.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le pied des barres.
 * - `uColorC` — leur sommet et le pic.
 * - `uBars` — nombre de barres.
 * - `uSpeed` — vitesse du spectre.
 * - `uGap` — espace entre barres, en fraction de leur pas.
 * - `uSegments` — nombre de segments par barre ; zero pour des barres pleines.
 * - `uMirror` — un pour un spectre symetrique autour du milieu.
 */
export const AUDIO_BARS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBars;
uniform float uSpeed;
uniform float uGap;
uniform float uSegments;
uniform float uMirror;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float barreHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur, lisse en temps seulement : les barres sont independantes,
// donc l'interpolation ne se fait que sur l'axe du temps.
float niveau(float bar, float t) {
  float cell = floor(t);
  float local = fract(t);
  float smoothed = local * local * (3.0 - 2.0 * local);
  float a = barreHash(vec2(bar, cell));
  float b = barreHash(vec2(bar, cell + 1.0));
  return mix(a, b, smoothed);
}

void main() {
  float bars = clamp(uBars, 4.0, 96.0);
  float index = floor(vUv.x * bars);
  float local = fract(vUv.x * bars);
  float t = uTime * uSpeed;

  // Enveloppe en cloche sur le premier tiers : les graves montent plus haut.
  float position = (index + 0.5) / bars;
  float envelope = 0.35 + 0.65 * exp(-pow((position - 0.3) * 2.4, 2.0));

  // Le battement commun : la mesure que toutes les barres suivent.
  float beat = 0.85 + 0.15 * sin(t * 2.4);

  float level = envelope * beat * (0.12 + 0.88 * niveau(index, t * 3.0));
  float peak = max(level, envelope * (0.12 + 0.88 * niveau(index + 0.5, t * 1.1))) + 0.03;

  // La hauteur lue : depuis le bas, ou depuis le milieu en miroir.
  float y = mix(vUv.y, abs(vUv.y - 0.5) * 2.0, uMirror);
  float px = 1.0 / max(uResolution.y, 1.0);

  float demi = clamp(uGap, 0.0, 0.9) * 0.5;
  float column = step(demi, local) * step(local, 1.0 - demi);

  float fill = (1.0 - smoothstep(level - px, level + px, y)) * column;

  // Les segments : des rangees de fond a intervalle regulier.
  float segments = max(uSegments, 0.0);
  float rows = fract(y * segments);
  float led = mix(1.0, step(0.25, rows), step(1.0, segments));
  fill *= led;

  // Le pic : un segment fin, un cran au-dessus du niveau.
  float cap = (1.0 - smoothstep(px * 1.5, px * 3.0, abs(y - peak))) * column;

  // Du pied au sommet, la couleur monte vers l'eclat.
  float rise = clamp(y / max(level, 0.001), 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, fill);
  colour = mix(colour, uColorC, fill * rise * rise);
  colour = mix(colour, uColorC, cap * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
