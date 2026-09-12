/**
 * Shader de la grille balayee.
 *
 * ## L'idee mathematique
 *
 * Une grille est lue, jamais dessinee : la distance a la ligne la plus
 * proche est la partie fractionnaire des coordonnees, recentree. Par-dessus,
 * une barre parcourt un axe du cadre a vitesse constante. Elle ne s'arrete
 * pas au bord : sa course inclut une marge de chaque cote, si bien qu'elle
 * sort du cadre avant de reapparaitre de l'autre — un saut a l'ecran se
 * remarquerait, une sortie ne se remarque pas.
 *
 * La trainee n'est pas un degrade continu. Chaque cellule deja balayee
 * s'eteint a son rythme, depuis une intensite qui lui est propre : un
 * balayage uniforme se lirait comme un simple degrade qui glisse, alors que
 * des cellules inegales se lisent comme des cellules activees.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les lignes.
 * - `uColorC` — la barre et les cellules qu'elle allume.
 * - `uCells` — nombre de cellules sur la hauteur.
 * - `uSpeed` — vitesse de la barre.
 * - `uTrail` — longueur de la trainee, en cellules.
 * - `uVertical` — un si la barre parcourt la largeur, zero pour la hauteur.
 */
export const GRID_SCAN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uSpeed;
uniform float uTrail;
uniform float uVertical;

// Nombre pseudo-aleatoire, stable par cellule.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 60.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;

  // Un pixel, en unites de cellule.
  float px = cells / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 local = abs(fract(p) - 0.5);
  float lines = 1.0 - smoothstep(px * 0.4, px * 1.4, 0.5 - max(local.x, local.y));

  // L'axe balaye : la hauteur par defaut, la largeur si vertical.
  float extent = mix(1.0, aspect, uVertical) * cells;
  float axis = mix(p.y, p.x, uVertical);
  float centre = mix(id.y, id.x, uVertical) + 0.5;

  // La barre parcourt l'axe avec une marge de chaque cote : elle sort du
  // cadre avant de repartir, sans jamais sauter a l'ecran.
  float margin = cells * 0.2;
  float head = fract(uTime * uSpeed * 0.2) * (extent + 2.0 * margin) - margin;

  // Le front : un trait vif a la position de la barre.
  float front = 1.0 - smoothstep(0.0, px * 3.0, abs(head - axis));

  // La trainee : chaque cellule deja balayee s'eteint a son rythme, depuis
  // une intensite qui lui est propre.
  float behind = head - centre;
  float wake = step(0.0, behind) * exp(-behind / max(uTrail, 0.2)) * (0.4 + 0.6 * hash(id));

  // Un halo doux de part et d'autre du front, porte par les lignes.
  float halo = exp(-abs(head - axis) * 0.8);

  vec3 colour = mix(uColorA, uColorB, lines * (0.35 + 0.65 * halo));
  colour = mix(colour, uColorC, wake * 0.55 * (1.0 - lines * 0.5));
  colour = mix(colour, uColorC, front * 0.95);

  gl_FragColor = vec4(colour, 1.0);
}
`
