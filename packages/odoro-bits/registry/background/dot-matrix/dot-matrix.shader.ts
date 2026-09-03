/**
 * Shader de la trame de points.
 *
 * ## Ce que le shader calcule
 *
 * Une grille de points, chacun allume ou eteint selon un retard qui depend de
 * sa distance au centre. Le front de propagation qui en resulte — du centre
 * vers les bords, ou l'inverse — est la seule chose que ce fichier produit ;
 * tout le reste n'est que la maille et son scintillement.
 *
 * ## Pourquoi le pas de la grille se deduit du plus petit cote
 *
 * L'implementation dont ce composant s'inspire exprimait la maille en pixels,
 * et devait donc connaitre la densite de pixels du canevas pour la corriger —
 * une valeur que le moteur choisit lui-meme, en fonction de la qualite
 * retenue, et qu'il ne transmet pas.
 *
 * Le reglage est donc un **nombre de cellules** sur le plus petit cote. La
 * densite apparente ne depend plus ni de l'ecran ni du format de la fenetre, et
 * aucune valeur ne circule entre le moteur et le shader pour l'obtenir.
 *
 * ## Pourquoi le fond est peint ici
 *
 * La surface est allouee sans canal alpha : ce qui n'est pas ecrit est noir,
 * pas transparent. Le fond fait donc partie du rendu, et il vient d'un token
 * comme les deux teintes des points.
 *
 * @module
 */

/**
 * Fragment shader de la trame.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA`, `uColorB` — les deux teintes entre lesquelles les points sont
 *   repartis, par leur graine.
 * - `uColorBackground` — le fond, peint sous la trame.
 * - `uCells` — nombre de cellules sur le plus petit cote.
 * - `uDot` — cote du point, en fraction de la cellule.
 * - `uSpeed` — vitesse de propagation du front.
 * - `uReverse` — `0.0` pour l'entree, `1.0` pour la sortie.
 * - `uPhase` — temps auquel la phase courante a commence. Sans lui, une
 *   inversion en cours de route reprendrait l'animation la ou le temps absolu
 *   se trouve, c'est-a-dire terminee.
 * - `uFlicker` — part de scintillement, de `0.0` a `1.0`.
 */
export const DOT_MATRIX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorBackground;
uniform float uCells;
uniform float uDot;
uniform float uSpeed;
uniform float uReverse;
uniform float uPhase;
uniform float uFlicker;

// Nombre pseudo-aleatoire, deterministe et sans motif perceptible : on projette
// le point sur une direction arbitraire, on prend le sinus, on l'amplifie et on
// n'en garde que la partie fractionnaire.
float trameHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // Le pas de la maille vient du plus petit cote : la densite apparente ne
  // depend alors ni du format de la fenetre ni de la densite de pixels.
  float pitch = min(uResolution.x, uResolution.y) / max(uCells, 1.0);

  vec2 pixel = vUv * uResolution;
  vec2 cell = floor(pixel / pitch);
  vec2 inside = fract(pixel / pitch);

  // Le point est centre dans sa cellule. Pose au coin, il donnerait une grille
  // visiblement decalee d'une demi-maille vers le bas a gauche.
  vec2 offset = abs(inside - 0.5);
  float reachDot = uDot * 0.5;
  float mask = step(offset.x, reachDot) * step(offset.y, reachDot);

  float seed = trameHash(cell);

  // Scintillement : chaque cellule change de palier a intervalle regulier. Le
  // decalage par la graine evite que la grille entiere ne clignote d'un bloc.
  float slot = floor(uTime * 0.4 + seed * 8.0);
  float twinkle = mix(1.0, 0.25 + 0.75 * trameHash(cell + slot), uFlicker);

  // Distance au centre, comptee en cellules et ramenee entre zero et un.
  vec2 middle = uResolution * 0.5 / pitch;
  float span = max(length(middle), 1.0);
  float reach = distance(cell, middle) / span;

  float elapsed = max(uTime - uPhase, 0.0) * uSpeed;

  // L'entree part du centre, la sortie part des bords : c'est le meme retard,
  // lu dans l'autre sens.
  float delay = mix(reach, 1.0 - reach, uReverse) + seed * 0.18;
  float opened = smoothstep(delay, delay + 0.35, elapsed);
  float presence = mix(opened, 1.0 - opened, uReverse);

  vec3 ink = mix(uColorA, uColorB, seed);
  vec3 colour = mix(uColorBackground, ink, mask * twinkle * presence);

  gl_FragColor = vec4(colour, 1.0);
}
`
