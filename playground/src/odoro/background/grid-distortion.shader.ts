/**
 * Shader de la grille sous lentille.
 *
 * ## L'idee mathematique
 *
 * La grille n'est pas deformee : c'est le domaine qui l'est, avant lecture.
 * Autour du centre de la lentille, chaque point est tire vers ce centre
 * d'une fraction qui vaut le carre du profil — plein au centre, nul au bord,
 * sans marche. La grille lue sur ce domaine contracte apparait dilatee : les
 * mailles s'ecartent, et les lignes s'epaississent avec elles, comme sous un
 * vrai verre. Un profil lineaire donnerait une cassure au bord ; le carre
 * la lisse.
 *
 * Le bord de la lentille est un anneau fin lu par distance au rayon, et
 * une ombre juste a l'interieur donne l'epaisseur du verre. Le rayon
 * respire a peine : une lentille parfaitement immobile se lirait comme un
 * defaut d'affichage.
 *
 * Le centre est le pointeur, amorti par le composant.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les lignes.
 * - `uColorC` — le bord de la lentille, et les lignes en son centre.
 * - `uPointer` — position du centre, en coordonnees de texture.
 * - `uCells` — nombre de cellules sur la hauteur.
 * - `uStrength` — force du grossissement, entre zero et un.
 * - `uRadius` — rayon de la lentille, en hauteurs de cadre.
 */
export const GRID_DISTORTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uCells;
uniform float uStrength;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 centre = uPointer * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);

  // Le rayon respire a peine.
  float radius = max(uRadius, 0.05) * (1.0 + 0.04 * sin(uTime * 1.3));
  vec2 d = p - centre;
  float r = length(d);

  // Le profil de la lentille : plein au centre, nul au bord, sans marche.
  float inside = 1.0 - smoothstep(0.0, radius, r);
  float bulge = inside * inside;

  // Le domaine est tire vers le centre avant lecture : les mailles y
  // apparaissent dilatees, et les lignes epaissies avec elles.
  vec2 q = centre + d * (1.0 - clamp(uStrength, 0.0, 0.95) * bulge);

  float cells = clamp(uCells, 2.0, 60.0);
  vec2 g = q * cells;
  vec2 local = abs(fract(g) - 0.5);
  float pxc = px * cells;
  float lines = 1.0 - smoothstep(pxc * 0.4, pxc * 1.4, 0.5 - max(local.x, local.y));

  // Le bord du verre, et son ombre juste a l'interieur.
  float rim = 1.0 - smoothstep(px * 1.0, px * 3.0, abs(r - radius));
  float shade = smoothstep(radius * 0.6, radius, r) * inside;

  vec3 colour = mix(uColorA, uColorB, lines * (0.45 + 0.55 * inside));
  colour = mix(colour, uColorA, shade * 0.25);
  colour = mix(colour, uColorC, lines * bulge * 0.6 + rim * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
