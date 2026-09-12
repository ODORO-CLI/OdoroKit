/**
 * Shader de la grille magnetique.
 *
 * ## L'idee mathematique
 *
 * Une grille de points dont chaque point est repousse par le pointeur : le
 * decalage est la direction fois une force en exponentielle de la distance —
 * ou attire, quand le sens est inverse. Le point s'ecarte dans le shader,
 * aucune geometrie : chaque fragment evalue les neuf cellules qui l'entourent,
 * si bien qu'un point peut glisser hors de sa cellule sans etre rogne.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les points au repos.
 * - `uColorC` — les points sous influence.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uDensity` — nombre de points par hauteur de cadre.
 * - `uRadius` — portee de l'aimant.
 * - `uForce` — amplitude du decalage.
 * - `uAttract` — 1 pour attirer, 0 pour repousser.
 */
export const MAGNET_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uDensity;
uniform float uRadius;
uniform float uForce;
uniform float uAttract;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  float density = max(uDensity, 2.0);
  vec2 base = floor(p * density);

  // Repousser par defaut, attirer quand le sens est inverse.
  float sens = 1.0 - 2.0 * step(0.5, uAttract);

  float point = 0.0;
  float energie = 0.0;

  // Neuf cellules par fragment, a bornes constantes : un point deplace peut
  // venir d'une cellule voisine, et ne l'evaluer que dans la sienne le
  // rognerait au bord des qu'il s'ecarte.
  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 cell = base + vec2(float(dx), float(dy));
      vec2 centre = (cell + 0.5) / density;

      vec2 away = centre - m;
      float dist = length(away);
      vec2 dir = away / max(dist, 0.0001);

      // La force decroit en exponentielle de la distance : proche du curseur
      // le champ est net, loin de lui la grille redevient parfaitement sage.
      float strength = uForce * exp(-dist / max(uRadius, 0.01));
      vec2 pos = centre + dir * sens * strength * (0.9 / density);

      float d = length(p - pos);
      float rayon = 0.11 / density;
      point = max(point, 1.0 - smoothstep(rayon * 0.5, rayon, d));
      energie = max(energie, strength * (1.0 - smoothstep(rayon * 0.5, rayon * 1.4, d)));
    }
  }

  vec3 colour = mix(uColorA, uColorB, point * 0.85);

  // Les points sous influence changent de teinte : le champ se voit aussi par
  // la couleur, pas seulement par le deplacement.
  colour = mix(colour, uColorC, clamp(energie * 1.6, 0.0, 1.0));

  // Vignette discrete, pour que la nappe ne soit pas un papier peint.
  float ecart = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.5, 1.1, ecart) * 0.35;

  gl_FragColor = vec4(colour, 1.0);
}
`
