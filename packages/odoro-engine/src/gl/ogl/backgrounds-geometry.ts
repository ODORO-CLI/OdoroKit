/**
 * Shaders de fond : la famille des constructions.
 *
 * Quatre motifs ou la figure vient d'un changement de coordonnees plutot que
 * d'un bruit : polaires pour le tunnel et le spectre, iso-valeurs pour les
 * courbes de niveau, distance signee pour la grille ondulante. Ils ont en
 * commun d'etre parfaitement deterministes — aucun hasard n'y entre.
 *
 * Aucun de ces shaders n'est repris d'ailleurs.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Tunnel : une perspective obtenue sans matrice.
 *
 * ## Pourquoi 1/r donne de la profondeur
 *
 * Dans un couloir cylindrique regarde de face, la distance parcourue le long
 * de l'axe est inversement proportionnelle au rayon apparent : ce qui est
 * loin est petit, ce qui est proche remplit l'ecran. Poser `z = 1/r` reproduit
 * exactement cette relation — c'est la meme division que celle d'une
 * projection perspective, appliquee directement en deux dimensions.
 *
 * L'angle sert de seconde coordonnee de texture. On obtient donc un depliage
 * complet du cylindre en deux lignes, sans camera, sans matrice et sans
 * geometrie.
 *
 * ## L'assombrissement au loin
 *
 * Il n'est pas decoratif. Sans lui, le motif se resserre indefiniment vers le
 * centre et finit par battre avec la grille de pixels : le point de fuite se
 * met a grouiller. L'attenuation eteint la zone avant que le battement
 * n'apparaisse.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (anneaux),
 * `uSegments`.
 */
export const TUNNEL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uSegments;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float rayon = max(length(p), 0.0001);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // z = 1/r : la relation exacte entre distance et rayon apparent dans un
  // couloir cylindrique. C'est toute la perspective.
  float profondeur = 1.0 / rayon;

  float anneaux = fract(profondeur * max(uScale, 0.1) + t);
  float secteurs = fract(angle / 6.28318 * max(uSegments, 1.0) + t * 0.15);

  // Deux liseres croises : le damier apparait sans qu'aucun carreau ne soit
  // decrit, seulement par le produit de deux repliements.
  float grille = max(
    smoothstep(0.06, 0.0, abs(anneaux - 0.5) - 0.44),
    smoothstep(0.06, 0.0, abs(secteurs - 0.5) - 0.44)
  );

  // Sans cette attenuation, le motif se resserre jusqu'a battre avec la
  // grille de pixels et le point de fuite se met a grouiller.
  float lointain = smoothstep(0.0, 0.42, rayon);

  gl_FragColor = vec4(mix(uColorA, uColorB, grille * lointain), 1.0);
}
`

/**
 * Spectre : un balayage angulaire de teintes.
 *
 * ## Pourquoi trois cosinus decales
 *
 * Passer d'une teinte a l'autre en interpolant lineairement entre deux
 * couleurs traverse du gris : les composantes se rejoignent au milieu. Trois
 * cosinus decales d'un tiers de tour ne se croisent jamais toutes les trois au
 * meme endroit, et la saturation reste constante sur tout le tour.
 *
 * C'est la meme raison qui fait qu'une roue chromatique est ronde et non
 * segmentee. La formule tient en une ligne, et remplace une conversion
 * teinte-saturation-luminosite complete.
 *
 * ## Le melange avec la palette
 *
 * Un spectre pur ignorerait les tokens, ce que ce systeme n'admet pas. La
 * teinte calculee est donc **teintee** par les deux couleurs recues plutot que
 * de les remplacer : le fond reste dans les tons du theme, et le balayage
 * n'en est qu'une modulation.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (tours),
 * `uSaturation`.
 */
export const SPECTRUM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uSaturation;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float angle = atan(p.y, p.x) / 6.28318 + 0.5;
  float rayon = length(p);
  float t = uTime * uSpeed;

  float tour = fract(angle * max(uScale, 1.0) + t);

  // Trois cosinus decales d'un tiers de tour : ils ne se rejoignent jamais
  // tous au meme endroit, donc le tour ne traverse pas de gris.
  vec3 roue = 0.5 + 0.5 * cos(6.28318 * (tour + vec3(0.0, 0.3333, 0.6667)));

  // La teinte module la palette au lieu de la remplacer : le fond reste dans
  // les tons du theme.
  vec3 base = mix(uColorA, uColorB, smoothstep(0.0, 0.8, rayon));
  vec3 colour = mix(base, base * roue * 2.0, clamp(uSaturation, 0.0, 1.0));

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`

/**
 * Courbes de niveau : une carte topographique animee.
 *
 * ## Comment on obtient une ligne a partir d'une surface
 *
 * Une courbe de niveau est le lieu ou une fonction vaut un multiple d'un pas
 * donne. Replier la valeur du champ sur ce pas, puis marquer les alentours de
 * zero, donne exactement ces lieux — une ligne par palier, sans qu'aucune ne
 * soit tracee.
 *
 * ## La correction par la pente
 *
 * Le meme probleme que pour les fils, en deux dimensions : la ou le terrain
 * est plat, les paliers sont eloignes et les lignes s'epaississent jusqu'a
 * remplir la zone ; la ou il est raide, elles se resserrent jusqu'a
 * disparaitre.
 *
 * La pente est donc mesuree, puis divisee. `fwidth` la donnerait en une
 * instruction, mais il demande une extension en WebGL 1 et le shader tombe
 * silencieusement quand elle manque — ce qui s'est produit ici avant que ce
 * calcul ne soit ecrit a la main.
 *
 * Le champ est donc echantillonne deux fois de plus, a un pixel de distance
 * en x puis en y. C'est une difference finie : trois evaluations au lieu
 * d'une, contre une portabilite qui ne depend de rien.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`,
 * `uLevels`.
 */
export const CONTOUR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uLevels;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  vec2 derive = vec2(t, t * 0.35);
  float altitude = odoroFbm(p + derive, 4);
  float paliers = max(uLevels, 1.0);

  // Le champ replie sur le pas : chaque passage par zero est une courbe de
  // niveau, sans qu'aucune n'ait ete tracee.
  float niveau = fract(altitude * paliers);
  float distance = abs(niveau - 0.5);

  // Un pixel, exprime dans les unites du champ. C'est le pas de la difference
  // finie qui remplace fwidth, lequel demande une extension en WebGL 1.
  vec2 pas = vec2(aspect, 1.0) * max(uScale, 0.1) / max(uResolution, vec2(1.0));

  float dx = odoroFbm(p + derive + vec2(pas.x, 0.0), 4) - altitude;
  float dy = odoroFbm(p + derive + vec2(0.0, pas.y), 4) - altitude;

  // La pente en paliers par pixel : diviser par elle exprime l'ecart en
  // pixels, donc une epaisseur constante quelle que soit l'inclinaison.
  float pente = length(vec2(dx, dy)) * paliers;
  float ligne = smoothstep(0.0, 1.5, distance / max(pente, 0.0001));

  vec3 terrain = mix(uColorA, uColorB, altitude);

  gl_FragColor = vec4(mix(uColorC, terrain, ligne), 1.0);
}
`

/**
 * Grille ondulante : un quadrillage souleve par une onde.
 *
 * ## Ce qui distingue ce fond du quadrillage statique
 *
 * `background/grid-lines` dessine une grille avec deux degrades repetes, sans
 * contexte graphique — c'est le bon choix quand la grille ne fait que derive.
 * Ici la grille est **deformee** : chaque intersection est deplacee par une
 * onde radiale, ce qu'aucune repetition de degrade ne peut faire.
 *
 * C'est la seule raison d'employer une surface graphique pour une grille. Si
 * l'amplitude est nulle, le composant sans WebGL fait exactement le meme
 * travail pour treize kilo-octets de moins.
 *
 * ## L'onde
 *
 * Elle est fonction de la distance au centre, pas des coordonnees : les
 * cretes sont donc des cercles concentriques, et la deformation reste
 * coherente quel que soit le rapport de forme du cadre.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (mailles),
 * `uAmplitude`.
 */
export const RIPPLE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAmplitude;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float rayon = length(p);

  // L'onde depend de la distance au centre : les cretes sont des cercles, et
  // la deformation reste coherente quel que soit le rapport de forme.
  float onde = sin(rayon * 14.0 - t * 3.0) * uAmplitude;

  // Le deplacement est radial : chaque point s'ecarte du centre le long de sa
  // propre direction, ce qui evite le cisaillement d'un decalage constant.
  vec2 direction = rayon > 0.0001 ? p / rayon : vec2(0.0);
  vec2 deplace = (p + direction * onde) * max(uScale, 1.0);

  vec2 local = abs(fract(deplace) - 0.5);
  float trait = max(
    smoothstep(0.5, 0.46, local.x),
    smoothstep(0.5, 0.46, local.y)
  );

  // Attenuation vers les bords : sans elle, la grille s'arrete net et se lit
  // comme une texture posee sur le cadre.
  float voile = smoothstep(0.85, 0.15, rayon);

  gl_FragColor = vec4(mix(uColorA, uColorB, trait * voile), 1.0);
}
`
