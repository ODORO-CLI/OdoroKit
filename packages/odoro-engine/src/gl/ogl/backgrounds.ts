/**
 * Shaders de fond plein cadre.
 *
 * Les primitives — bruit, sommet plein ecran — vivent dans le module voisin.
 * Ici, ce sont des compositions : chacune repond a une intention visuelle
 * precise, et toutes recoivent `uTime` et `uResolution` du moteur.
 *
 * Aucune n'est reprise d'ailleurs. La mathematique de chacune est expliquee la
 * ou elle se trouve, ce qui est aussi la seule facon de pouvoir la modifier
 * plus tard sans la reinventer.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Ondes : des bandes qui ondulent et se replient.
 *
 * ## Pourquoi trois sinus
 *
 * Une seule fonction sinus donne une vague reguliere, donc mecanique. Trois
 * sinus de frequences non multiples se superposent sans jamais se remettre en
 * phase : le motif ne se repete plus a l'oeil, alors qu'il reste parfaitement
 * deterministe.
 *
 * Le bord de chaque bande est adouci sur une largeur exprimee en fraction
 * d'ecran, pas en unites du motif : il reste donc net a toute taille de
 * surface, au lieu de s'epaissir quand on agrandit.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (nombre de bandes),
 * `uAmplitude`.
 */
export const WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uAmplitude;

float odoroWave(float x, float phase) {
  return uAmplitude * (
    sin(x * 1.0 + phase) * 0.50 +
    sin(x * 2.3 + phase * 1.4) * 0.30 +
    sin(x * 4.1 + phase * 0.7) * 0.20
  );
}

void main() {
  vec2 p = vUv;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  float bands = max(uScale, 1.0);

  for (int i = 0; i < 8; i += 1) {
    if (float(i) >= bands) break;

    float k = float(i) / bands;
    float centre = k + odoroWave(p.x * aspect * 3.0, t + k * 6.28318);
    float edge = smoothstep(0.045, 0.0, abs(p.y - centre));
    colour = mix(colour, uColorB, edge * (0.35 + 0.65 * k));
  }

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Champ de points : une grille de disques qui respirent.
 *
 * ## Pourquoi une grille repliee plutot que des points dessines
 *
 * Dessiner mille points demanderait mille objets, mille positions et autant de
 * travail par image. Replier l'espace sur lui-meme donne la meme grille en une
 * soustraction : chaque pixel calcule sa distance au centre de **sa** cellule,
 * sans jamais savoir qu'il y en a d'autres.
 *
 * Le cout ne depend donc pas du nombre de points.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (densite), `uRadius`.
 */
export const DOTS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uRadius;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * uScale;

  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // Chaque cellule respire a son propre rythme : sans ce decalage, toute la
  // grille pulserait a l'unisson, ce qui se lit comme un clignotement.
  float phase = odoroHash(cell) * 6.28318;
  float pulse = 0.5 + 0.5 * sin(uTime * uSpeed + phase);

  float radius = uRadius * (0.55 + 0.45 * pulse);
  float disc = smoothstep(radius, radius - 0.08, length(local));

  gl_FragColor = vec4(mix(uColorA, uColorB, disc * pulse), 1.0);
}
`

/**
 * Faisceaux : des rais de lumiere obliques.
 *
 * ## Le repere incline
 *
 * Les faisceaux ne sont pas traces en diagonale : c'est l'espace qui est
 * tourne avant que des bandes verticales n'y soient dessinees. Une rotation de
 * coordonnees coute deux multiplications, la ou raisonner sur des droites
 * obliques couterait bien davantage — en calcul comme en lisibilite.
 *
 * L'attenuation vers le bas emploie une puissance plutot qu'une droite : la
 * lumiere ne decroit pas lineairement, et l'oeil le sait.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (nombre de rais),
 * `uAngle` en radians.
 */
export const BEAMS_FRAGMENT = /* glsl */ `
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
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y - 0.5);

  float c = cos(uAngle);
  float s = sin(uAngle);
  vec2 turned = vec2(p.x * c - p.y * s, p.x * s + p.y * c);

  // Le bruit deplace legerement chaque rai : des bandes parfaitement
  // regulieres se lisent comme une texture, pas comme de la lumiere.
  float drift = odoroNoise(vec2(turned.x * 2.0, uTime * uSpeed * 0.3)) - 0.5;
  float bands = sin((turned.x + drift * 0.3) * uScale + uTime * uSpeed);

  float strength = pow(max(bands, 0.0), 3.0);
  strength *= pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.6);

  gl_FragColor = vec4(mix(uColorA, uColorB, strength), 1.0);
}
`

/**
 * Nappe : quelques taches de couleur qui derivent et se melangent.
 *
 * ## Pourquoi trois centres suffisent
 *
 * Un degrade en nappe est presque toujours fait de trois ou quatre taches.
 * Au-dela, elles se recouvrent partout et le resultat tend vers une moyenne
 * uniforme : on paie du calcul pour perdre le motif.
 *
 * Les trois centres decrivent des ellipses de periodes non multiples, si bien
 * que la composition ne revient jamais exactement au meme etat.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale` (etendue).
 */
export const MESH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;

float odoroBlob(vec2 p, vec2 centre, float radius) {
  return smoothstep(radius, 0.0, length(p - centre));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  vec2 a = vec2(0.30 * aspect + 0.22 * sin(t), 0.35 + 0.20 * cos(t * 0.83));
  vec2 b = vec2(0.70 * aspect + 0.18 * cos(t * 1.19), 0.62 + 0.24 * sin(t * 0.71));
  vec2 c = vec2(0.50 * aspect + 0.26 * sin(t * 0.61), 0.50 + 0.18 * cos(t * 1.37));

  float wa = odoroBlob(p, a, uScale);
  float wb = odoroBlob(p, b, uScale);
  float wc = odoroBlob(p, c, uScale);
  float total = wa + wb + wc;

  // La somme des poids depasse un la ou les taches se recouvrent : sans
  // normalisation, ces zones saturent au lieu de se melanger.
  vec3 blended = (uColorA * wa + uColorB * wb + uColorC * wc) / max(total, 0.001);

  gl_FragColor = vec4(mix(uColorA * 0.25, blended, clamp(total, 0.0, 1.0)), 1.0);
}
`
