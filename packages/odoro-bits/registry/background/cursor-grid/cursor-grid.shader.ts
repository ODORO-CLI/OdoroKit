/**
 * Shader de la grille au curseur.
 *
 * ## L'idee mathematique
 *
 * Une grille de paves, et deux distances au lieu d'une : celle du centre du
 * pave au pointeur vif, celle du meme centre au pointeur retarde. La
 * premiere allume, la seconde laisse une trainee derriere le geste — deux
 * positions suffisent la ou un tampon d'historique serait necessaire pour
 * un fondu par pave.
 *
 * La distance n'est ni le disque ni le carre mais un melange des deux : un
 * halo rond ignorerait la grille qu'il eclaire, un halo carre la recopierait
 * trop fidelement. A mi-chemin, la tache reste ronde tout en s'appuyant sur
 * les paves.
 *
 * Chaque pave respire a sa propre phase, tiree de ses coordonnees de
 * cellule : sans cela la nappe s'allumerait d'un bloc, comme un ecran.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le filet de la grille, et la trainee.
 * - `uColorC` — les paves allumes.
 * - `uPointer` — position vive du pointeur, en coordonnees de texture.
 * - `uEcho` — position retardee du pointeur, meme repere.
 * - `uCells` — nombre de cellules sur la hauteur.
 * - `uRadius` — portee de l allumage, en hauteurs de cadre.
 * - `uTrail` — force de la trainee, entre zero et un.
 */
export const CURSOR_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform vec2 uEcho;
uniform float uCells;
uniform float uRadius;
uniform float uTrail;

// Phase propre a une cellule, stable d'une image a l'autre.
float cellPhase(vec2 cell) {
  return fract(sin(dot(cell, vec2(41.7, 289.3))) * 24634.6345);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uCells, 3.0, 48.0);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  vec2 centre = (cell + 0.5) / scale;
  vec2 vif = uPointer * vec2(aspect, 1.0);
  vec2 lent = uEcho * vec2(aspect, 1.0);
  float reach = max(uRadius, 0.05);

  // Le melange du carre et du disque : ni l'un ni l'autre tout a fait.
  vec2 dv = abs(centre - vif);
  float nearVif = mix(max(dv.x, dv.y), length(dv), 0.55);
  vec2 dl = abs(centre - lent);
  float nearLent = mix(max(dl.x, dl.y), length(dl), 0.55);

  float lit = 1.0 - smoothstep(reach * 0.2, reach, nearVif);
  float trail =
    (1.0 - smoothstep(reach * 0.4, reach * 1.4, nearLent)) * clamp(uTrail, 0.0, 1.0);

  // Chaque pave respire a sa phase : la nappe ne s'allume pas d'un bloc.
  lit *= 0.6 + 0.4 * (0.5 + 0.5 * sin(uTime * 2.0 + cellPhase(cell) * 6.2831853));

  // Le pave et son filet, tires du meme creux : la distance au bord de la
  // cellule, nulle sur le trait, maximale au centre.
  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float inset = 0.5 - max(abs(local.x), abs(local.y));
  float pave = smoothstep(0.0, 0.05, inset - 0.07);
  float filet = 1.0 - smoothstep(px, px * 3.0, abs(inset - 0.05));

  vec3 colour = mix(uColorA, uColorB, filet * 0.35);
  colour = mix(colour, uColorB, pave * trail * 0.55);
  colour = mix(colour, uColorC, pave * lit);

  gl_FragColor = vec4(colour, 1.0);
}
`
