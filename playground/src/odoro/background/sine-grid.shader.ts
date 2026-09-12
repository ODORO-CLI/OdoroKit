/**
 * Shader de la grille sinusoidale.
 *
 * ## L'idee mathematique
 *
 * Une grille n'est pas dessinee, elle est lue : la distance a la ligne la
 * plus proche est la partie fractionnaire des coordonnees, recentree. Pour
 * faire osciller chaque noeud, on ne deplace pas les noeuds — on deforme le
 * domaine avant de le lire. Un decalage en sinus de y sur x, et en sinus de x
 * sur y, avec le temps dans la phase : chaque noeud decrit une petite boucle,
 * et les lignes qui le joignent se courbent avec lui.
 *
 * Le moire vient d'une seconde grille, lue sur le meme domaine mais un peu
 * plus fine, tournee de quelques degres et deformee en contre-phase. La ou
 * les deux reseaux coincident, les traits s'additionnent ; la ou ils se
 * decalent, ils s'annulent a moitie. Les franges qui en resultent se
 * deplacent lentement — bien plus lentement que les noeuds — parce qu'elles
 * dependent de la difference des deux deformations, pas de leur somme.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les lignes.
 * - `uColorC` — les noeuds.
 * - `uCells` — nombre de cellules sur la hauteur.
 * - `uAmplitude` — course de l'oscillation, en cellules.
 * - `uSpeed` — vitesse de l'oscillation.
 * - `uMoire` — poids de la seconde grille.
 */
export const SINE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uMoire;

// Distance a la ligne la plus proche d'une grille unitaire.
float grille(vec2 q) {
  vec2 local = abs(fract(q + 0.5) - 0.5);
  return min(local.x, local.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;
  float t = uTime * uSpeed;

  // Un pixel, en unites de cellule.
  float px = cells / max(uResolution.y, 1.0);
  float amplitude = clamp(uAmplitude, 0.0, 0.5);

  // Le domaine est deforme avant lecture : chaque noeud decrit une boucle.
  vec2 q = p + amplitude * vec2(sin(p.y * 1.1 + t), sin(p.x * 0.9 - t * 1.3));

  float lines = 1.0 - smoothstep(px * 0.5, px * 1.5, grille(q));
  float node = 1.0 - smoothstep(px * 2.0, px * 3.5, length(fract(q + 0.5) - 0.5));

  // La seconde grille : un peu plus fine, tournee, deformee en contre-phase.
  float angle = 0.07;
  mat2 turn = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec2 r = turn * p * 1.04;
  vec2 q2 = r + amplitude * vec2(sin(r.y * 1.1 - t), sin(r.x * 0.9 + t * 1.3));
  float lines2 = 1.0 - smoothstep(px * 0.5, px * 1.5, grille(q2));

  float ink = clamp(lines * 0.7 + lines2 * uMoire * 0.5, 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, ink);
  colour = mix(colour, uColorC, node);

  gl_FragColor = vec4(colour, 1.0);
}
`
