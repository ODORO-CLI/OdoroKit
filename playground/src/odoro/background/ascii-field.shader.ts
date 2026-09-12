/**
 * Shader du champ ASCII.
 *
 * ## L'idee mathematique
 *
 * Un champ de bruit — trois octaves de bruit de valeur en derive lente —
 * n'est jamais affiche tel quel. Il est echantillonne au centre de chaque
 * cellule de caractere, quantifie en dix niveaux, et chaque niveau choisit
 * un caractere de la rampe classique des convertisseurs d'images en texte,
 * ordonnee par nombre de pixels allumes : de l'espace au arobase. La
 * densite d'encre d'une cellule suit donc la valeur du champ, et l'image se
 * lit de loin comme un degrade, de pres comme du texte.
 *
 * ## Les glyphes
 *
 * Aucune police, aucune texture : chaque caractere est un masque de
 * trente-cinq bits sur une grille de cinq par sept. Un flottant n'en tient
 * pas autant sans perte ; le masque est donc coupe en deux entiers, les
 * quatre lignes du haut et les trois du bas, chacun lu bit a bit par
 * division par une puissance de deux et parite.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — l'encre.
 * - `uColorC` — l'encre des niveaux les plus hauts.
 * - `uCells` — nombre de caracteres sur la largeur.
 * - `uSpeed` — vitesse de derive du champ.
 * - `uScale` — echelle du champ ; plus haut, plus de details.
 * - `uContrast` — contraste du champ avant quantification.
 */
export const ASCII_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uSpeed;
uniform float uScale;
uniform float uContrast;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float asciiHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float asciiNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = asciiHash(cell);
  float b = asciiHash(cell + vec2(1.0, 0.0));
  float c = asciiHash(cell + vec2(0.0, 1.0));
  float d = asciiHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Trois octaves, borne constante.
float asciiField(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i++) {
    value += asciiNoise(p) * amplitude;
    p = p * 2.1 + 5.3;
    amplitude *= 0.5;
  }
  return value / 0.875;
}

// Le bit de rang donne d'un masque.
float asciiBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// La rampe, par densite croissante : espace . - : + = % * # @. Deux
// entiers par caractere : les quatre lignes du haut, les trois du bas.
vec2 asciiGlyph(float level) {
  if (level < 0.5) return vec2(0.0, 0.0);
  if (level < 1.5) return vec2(0.0, 396.0);
  if (level < 2.5) return vec2(31.0, 0.0);
  if (level < 3.5) return vec2(12672.0, 12672.0);
  if (level < 4.5) return vec2(4255.0, 4224.0);
  if (level < 5.5) return vec2(992.0, 31744.0);
  if (level < 6.5) return vec2(845892.0, 8563.0);
  if (level < 7.5) return vec2(21983.0, 15008.0);
  if (level < 8.5) return vec2(338922.0, 32074.0);
  return vec2(476917.0, 24079.0);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 10.0, 200.0);

  // Une cellule : cinq par sept de glyphe, plus un interligne de chaque
  // cote. Six unites de large, huit de haut.
  float cellW = aspect / cells;
  float cellH = cellW * 8.0 / 6.0;

  vec2 p = vec2(vUv.x * aspect / cellW, (1.0 - vUv.y) / cellH);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // Le champ, lu au centre de la cellule, puis contraste et quantifie.
  vec2 centre = (id + 0.5) * vec2(cellW, cellH);
  float t = uTime * uSpeed;
  float value = asciiField(centre * uScale + vec2(t * 0.6, t * 0.35));
  value = clamp((value - 0.5) * max(uContrast, 0.1) + 0.5, 0.0, 0.999);
  float level = floor(value * 10.0);

  // Le pixel du glyphe : la ligne choisit l'entier, la position le bit.
  vec2 g = vec2(floor(local.x * 6.0), floor(local.y * 8.0));
  float inside = step(g.x, 4.5) * step(g.y, 6.5);
  vec2 mask = asciiGlyph(level);
  float top = step(g.y, 3.5);
  float index = mix((6.0 - g.y) * 5.0 + (4.0 - g.x), (3.0 - g.y) * 5.0 + (4.0 - g.x), top);
  float bit = asciiBit(mix(mask.y, mask.x, top), index) * inside;

  vec3 colour = mix(uColorA, uColorB, bit * (0.5 + 0.5 * value));
  colour = mix(colour, uColorC, bit * smoothstep(0.7, 1.0, value));

  gl_FragColor = vec4(colour, 1.0);
}
`
