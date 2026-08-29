/**
 * Shaders de fond : la famille des pavages.
 *
 * Quatre motifs bases sur le meme geste — replier l'espace sur une cellule, et
 * ne dessiner qu'elle. C'est ce qui rend le cout independant du nombre de
 * cellules : qu'il y en ait dix ou dix mille a l'ecran, chaque fragment n'en
 * evalue qu'une (ou ses voisines immediates, pour le pavage cellulaire).
 *
 * Aucun de ces shaders n'est repris d'ailleurs.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Cellules : un pavage de Voronoi anime.
 *
 * ## La technique
 *
 * Chaque cellule d'une grille reguliere recoit un germe place au hasard a
 * l'interieur d'elle-meme. Un fragment cherche alors le germe le plus proche,
 * en ne testant que sa propre cellule et les huit voisines — au-dela, un
 * germe ne peut plus etre le plus proche, puisqu'il est necessairement a plus
 * d'une cellule de distance.
 *
 * Neuf tests, quelle que soit la densite : c'est ce qui rend un pavage de
 * Voronoi realisable en temps reel, alors que le calculer par la geometrie
 * demanderait une triangulation.
 *
 * ## Pourquoi la seconde distance
 *
 * La distance au germe le plus proche donne des cellules pleines. La
 * **difference** entre la premiere et la seconde distance s'annule exactement
 * la ou deux germes sont equidistants — c'est-a-dire sur les aretes. C'est
 * ainsi qu'on obtient le reseau, sans jamais construire une seule arete.
 *
 * Le germe se deplace sur un cercle plutot qu'au hasard : un deplacement
 * aleatoire ferait sortir les germes de leur cellule et casserait
 * l'hypothese des neuf voisines.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uEdge`.
 */
export const CELLS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uEdge;

// Deux nombres decorreles pour une meme cellule : le second decalage evite
// que les germes s'alignent sur une diagonale.
vec2 odoroGerme(vec2 cellule) {
  float a = fract(sin(dot(cellule, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(cellule, vec2(269.5, 183.3))) * 43758.5453);
  return vec2(a, b);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  vec2 cellule = floor(p);
  vec2 local = fract(p);

  float premiere = 8.0;
  float seconde = 8.0;

  // Neuf cellules suffisent : un germe situe au-dela est necessairement plus
  // loin que le plus proche des neuf, quelle que soit sa position interne.
  for (int y = -1; y <= 1; y += 1) {
    for (int x = -1; x <= 1; x += 1) {
      vec2 voisine = vec2(float(x), float(y));
      vec2 germe = odoroGerme(cellule + voisine);

      // Le germe tourne sur un petit cercle : il reste dans sa cellule, ce
      // qui preserve l'hypothese des neuf voisines.
      vec2 position = voisine + 0.5 + 0.36 * vec2(
        sin(t + germe.x * 6.28318),
        cos(t + germe.y * 6.28318)
      );

      float d = length(position - local);

      // Classement en deux valeurs : le minimum, et le minimum suivant.
      if (d < premiere) {
        seconde = premiere;
        premiere = d;
      } else if (d < seconde) {
        seconde = d;
      }
    }
  }

  // La difference s'annule la ou deux germes sont equidistants : c'est
  // exactement l'arete, obtenue sans jamais en construire une.
  float arete = smoothstep(0.0, max(uEdge, 0.01), seconde - premiere);

  vec3 colour = mix(uColorA, uColorB, premiere * 0.9);
  colour = mix(uColorC, colour, arete);

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Alveoles : un pavage hexagonal qui pulse.
 *
 * ## Replier l'espace sur un hexagone
 *
 * Un carre se replie avec `fract`. Un hexagone n'a pas d'equivalent direct :
 * la grille hexagonale est la superposition de deux grilles rectangulaires
 * decalees d'une demi-maille. On evalue donc les deux, et on garde celle dont
 * le centre est le plus proche.
 *
 * Le rapport `sqrt(3)/2` entre les axes n'est pas un reglage : c'est la
 * hauteur d'un triangle equilateral de cote un. Avec une autre valeur, les
 * hexagones sont etires et le pavage laisse des trous.
 *
 * La distance employee n'est pas euclidienne mais **hexagonale** — le maximum
 * de trois projections. C'est elle qui donne des bords droits plutot que des
 * disques.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uEdge`.
 */
export const HEX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uEdge;

// sqrt(3)/2 : la hauteur d'un triangle equilateral de cote un. Toute autre
// valeur etire les hexagones et laisse des trous dans le pavage.
const vec2 MAILLE = vec2(1.0, 1.7320508);

// Distance hexagonale : le maximum de trois projections, une par paire de
// cotes opposes. Elle donne des bords droits la ou la distance euclidienne
// donnerait des disques.
float odoroDistanceHex(vec2 p) {
  p = abs(p);
  return max(p.x * 0.8660254 + p.y * 0.5, p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  // Une grille hexagonale est la superposition de deux grilles decalees d'une
  // demi-maille ; on evalue les deux et on garde la plus proche.
  vec2 a = mod(p, MAILLE) - MAILLE * 0.5;
  vec2 b = mod(p - MAILLE * 0.5, MAILLE) - MAILLE * 0.5;
  vec2 local = dot(a, a) < dot(b, b) ? a : b;

  // L'identifiant de la cellule : il decale la phase, sans quoi tous les
  // hexagones pulseraient ensemble.
  vec2 cellule = p - local;
  float phase = fract(sin(dot(floor(cellule), vec2(127.1, 311.7))) * 43758.5453);

  float d = odoroDistanceHex(local);
  float pulsation = 0.34 + 0.10 * sin(t + phase * 6.28318);
  float forme = smoothstep(pulsation + max(uEdge, 0.005), pulsation, d);

  gl_FragColor = vec4(mix(uColorA, uColorB, forme), 1.0);
}
`

/**
 * Mosaique : un bruit quantifie en carreaux.
 *
 * ## Pourquoi quantifier plutot que dessiner des carreaux
 *
 * Dessiner mille carreaux demanderait mille elements. Evaluer un champ
 * continu **au centre de la cellule** plutot qu'au point courant produit
 * exactement le meme resultat : tous les fragments d'une cellule lisent la
 * meme valeur, donc la meme couleur.
 *
 * Le carreau n'existe nulle part dans le calcul. Il apparait parce que la
 * fonction a ete echantillonnee grossierement — c'est du sous-echantillonnage
 * volontaire, l'inverse exact de ce qu'on cherche d'habitude.
 *
 * ## Le joint
 *
 * Sans lui, les carreaux voisins de valeurs proches se fondent et la grille
 * disparait. Un lisere tire de la coordonnee locale la retablit, et son
 * epaisseur est reglable independamment de la taille des carreaux.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`, `uGap`.
 */
export const MOSAIC_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uGap;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 1.0);
  float t = uTime * uSpeed;

  vec2 cellule = floor(p);
  vec2 local = fract(p);

  // Le champ est lu au centre de la cellule, jamais au point courant : tous
  // les fragments d'un carreau lisent donc la meme valeur.
  float v = odoroFbm((cellule + 0.5) * 0.18 + vec2(t, t * 0.6), 3);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.35, 0.65, v));
  colour = mix(colour, uColorC, smoothstep(0.72, 0.92, v));

  // Le joint : sans lui, deux carreaux de valeurs voisines se fondent et la
  // grille disparait.
  vec2 bord = min(local, 1.0 - local);
  float joint = smoothstep(0.0, max(uGap, 0.001), min(bord.x, bord.y));

  gl_FragColor = vec4(colour * (0.35 + 0.65 * joint), 1.0);
}
`

/**
 * Trame : un demi-ton dont les points grossissent avec la lumiere.
 *
 * ## Ce qu'imite ce shader
 *
 * L'impression en demi-ton rend les nuances par la **taille** des points, pas
 * par leur couleur : la trame est bicolore, et c'est le taux de couverture qui
 * simule le gris. Reproduire cela demande un champ continu, une grille, et un
 * disque dont le rayon suit le champ.
 *
 * ## Pourquoi la grille est tournee
 *
 * Une trame alignee sur les axes de l'image entre en battement avec la grille
 * de pixels de l'ecran, et produit un moire tres visible. Les imprimeurs
 * tournent leurs trames pour la meme raison. Quinze degres suffisent a
 * decorreler les deux grilles.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uAngle`.
 */
export const HALFTONE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAngle;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // Le champ est lu avant rotation : c'est la trame qui tourne, pas l'image,
  // exactement comme en impression.
  float lumiere = odoroFbm(p * 2.4 + vec2(t, -t * 0.7), 3);

  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 tourne = mat2(c, -s, s, c) * p * max(uScale, 1.0);

  vec2 local = fract(tourne) - 0.5;
  float rayon = length(local);

  // 0.5 est le rayon a couverture totale d'une maille de cote un : au-dela
  // les disques se recouvrent et la nuance cesse de progresser.
  float cible = lumiere * 0.5;

  // La largeur du degrade est fixe en unites de maille : le point reste net a
  // toute densite au lieu de s'adoucir quand la trame se resserre.
  float point = smoothstep(cible + 0.03, cible - 0.03, rayon);

  gl_FragColor = vec4(mix(uColorA, uColorB, point), 1.0);
}
`
