/**
 * Shader des rangees glissantes.
 *
 * ## L'idee mathematique
 *
 * Le cadre est decoupe en rangees ; chaque rangee glisse d'un bloc, en sens
 * alterne avec sa voisine et a une vitesse qui lui est propre. Le glissement
 * n'est pas un deplacement de tuiles : c'est l'abscisse qui est decalee du
 * temps avant que la rangee soit lue en cellules. Deux rangees voisines ne
 * restent donc jamais alignees, et l'oeil ne trouve aucune colonne fixe a
 * quoi se raccrocher — c'est ce qui donne l'impression d'un convoyeur, pas
 * d'un damier qui tremble.
 *
 * Une tuile est un rectangle arrondi lu par sa distance signee ; sa largeur
 * depend de la rangee, sa clarte d'un tirage stable. Quelques tuiles portent
 * l'accent et respirent lentement, chacune a sa phase.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les tuiles.
 * - `uColorC` — les tuiles accentuees.
 * - `uRows` — nombre de rangees sur la hauteur.
 * - `uSpeed` — vitesse du glissement.
 * - `uGap` — espace entre les tuiles, en fraction de rangee.
 * - `uAccent` — part des tuiles accentuees, entre zero et un.
 */
export const GRID_MOTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uRows;
uniform float uSpeed;
uniform float uGap;
uniform float uAccent;

// Nombre pseudo-aleatoire, stable par cellule.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// Distance signee a un rectangle arrondi centre sur l'origine.
float roundedBox(vec2 point, vec2 extent, float radius) {
  vec2 d = abs(point) - extent + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float rows = clamp(uRows, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * rows;

  // Un pixel, en unites de rangee.
  float px = rows / max(uResolution.y, 1.0);

  float row = floor(p.y);

  // Sens alterne d'une rangee a l'autre, et vitesse propre : deux rangees
  // voisines ne restent jamais alignees.
  float direction = mod(row, 2.0) * 2.0 - 1.0;
  float rate = (0.5 + 0.5 * hash(vec2(row, 3.0))) * direction;

  // Les tuiles n'ont pas toutes la meme largeur ; une rangee garde la sienne.
  float width = 1.4 + hash(vec2(row, 7.0)) * 1.4;

  float x = (p.x + uTime * uSpeed * rate) / width;
  vec2 id = vec2(floor(x), row);
  vec2 local = vec2(fract(x) * width, fract(p.y));
  vec2 size = vec2(width, 1.0);

  float gap = clamp(uGap, 0.04, 0.5);
  float dist = roundedBox(local - size * 0.5, size * 0.5 - gap * 0.5, 0.14);
  float tile = 1.0 - smoothstep(-px, px, dist);

  // Chaque tuile a sa clarte ; quelques-unes portent l'accent, et respirent.
  float shade = 0.35 + 0.65 * hash(id);
  float accent = step(1.0 - clamp(uAccent, 0.0, 1.0), hash(id + 11.0));
  float breath = 0.6 + 0.4 * sin(uTime * 1.4 + hash(id + 5.0) * 6.2832);

  vec3 tint = mix(uColorA, uColorB, shade);
  tint = mix(tint, uColorC, accent * breath);
  vec3 colour = mix(uColorA, tint, tile);

  gl_FragColor = vec4(colour, 1.0);
}
`
