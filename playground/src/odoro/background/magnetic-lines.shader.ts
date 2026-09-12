/**
 * Shader des lignes de champ.
 *
 * ## L'idee mathematique
 *
 * Deux poles de signe oppose dans le plan. Les lignes de champ d'un tel
 * dipole sont les cercles qui passent par les deux poles ; les
 * equipotentielles, les cercles d'Apollonius qui les entourent. Les premieres
 * sont les niveaux de la difference des angles sous lesquels on voit chaque
 * pole, les secondes les niveaux de la difference des logarithmes des
 * distances. Aucune integration : tout est analytique, et le gradient l'est
 * aussi — c'est lui qui donne l'epaisseur des traits en pixels, sans derivee
 * d'ecran.
 *
 * La difference des angles saute d'un tour entier de part et d'autre de la
 * coupure de l'arc tangente ; comme le nombre de lignes est entier, la partie
 * fractionnaire ne voit pas ce saut, et les cercles restent continus.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les lignes de champ.
 * - `uColorC` — les poles et le champ pres d'eux.
 * - `uPointer` — position amortie du pointeur, centree, entre -1 et 1, y vers le bas.
 * - `uLines` — nombre de lignes de champ par tour.
 * - `uSpread` — demi-distance des poles, en hauteurs de cadre.
 * - `uSpeed` — vitesse de glissement des lignes le long du champ.
 * - `uPotential` — 1 pour dessiner aussi les equipotentielles.
 */
export const MAGNETIC_LINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uLines;
uniform float uSpread;
uniform float uSpeed;
uniform float uPotential;

const float TAU = 6.28318530718;

// Un trait fin centre sur les entiers d'un champ scalaire, d'epaisseur fixe
// en pixels : la pente du champ ramene la distance a l'ecran.
float ligneTrait(float valeur, float pente, float pixel, float largeur) {
  float ecart = abs(fract(valeur) - 0.5);
  float demi = pente * pixel * largeur;
  return 1.0 - smoothstep(demi * 0.6, demi * 1.6, 0.5 - ecart);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float pixel = 1.0 / max(uResolution.y, 1.0);

  // Le premier pole respire lentement ; le second suit le pointeur.
  vec2 poleA = vec2(-uSpread, sin(uTime * 0.3) * 0.06);
  vec2 poleB = vec2(uSpread, 0.0) + vec2(uPointer.x * aspect, -uPointer.y) * 0.3;

  vec2 dA = p - poleA;
  vec2 dB = p - poleB;
  float lA = max(length(dA), 0.0005);
  float lB = max(length(dB), 0.0005);

  float lignes = max(floor(uLines), 2.0);

  // Lignes de champ : difference des angles. Son gradient est la somme des
  // perpendiculaires divisees par les distances au carre.
  float psi = (atan(dA.y, dA.x) - atan(dB.y, dB.x)) / TAU * lignes + uTime * uSpeed;
  vec2 gradPsi = (vec2(-dA.y, dA.x) / (lA * lA) - vec2(-dB.y, dB.x) / (lB * lB)) / TAU * lignes;
  float champ = ligneTrait(psi, length(gradPsi), pixel, 1.1);

  // Equipotentielles : difference des logarithmes, gradient en 1 / distance.
  float phi = (log(lA) - log(lB)) / TAU * lignes * 0.5;
  vec2 gradPhi = (dA / (lA * lA) - dB / (lB * lB)) / TAU * lignes * 0.5;
  float potentiel = ligneTrait(phi, length(gradPhi), pixel, 0.8) * step(0.5, uPotential);

  // Les traits se resserrent a l'infini pres des poles : ils y sont fondus
  // dans un halo, sinon ils moirent.
  float proche = exp(-lA * 9.0) + exp(-lB * 9.0);
  float halo = exp(-lA * lA * 900.0) + exp(-lB * lB * 900.0);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, potentiel * 0.22);
  colour = mix(colour, uColorB, champ * (0.75 - proche * 0.4));
  colour = mix(colour, uColorC, clamp(champ * proche * 1.2 + halo, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
