/**
 * Shader du terminal defaillant.
 *
 * ## L'idee mathematique
 *
 * Un ecran de caracteres, ligne par ligne. Le texte se tape : un front
 * avance sur les lignes a vitesse constante, la ligne en cours ne montre
 * que les caracteres deja tapes, et un curseur clignote a leur suite. Quand
 * la derniere ligne est pleine, l'ecran s'efface et tout recommence.
 *
 * Les defauts sont haches par paliers de temps, jamais continus : une
 * panne se produit, tient quelques images, cesse. Trois defauts. Le
 * scintillement baisse toute l'image d'un coup. Le dechirement decale
 * horizontalement une bande de lignes, d'un nombre entier de colonnes — un
 * decalage fractionnaire se lirait comme un flou, pas comme une coupure.
 * La corruption remplace le glyphe de quelques cellules par un autre,
 * pendant la meme bande.
 *
 * ## Les glyphes
 *
 * Aucune police, aucune texture : chaque glyphe est un masque de quinze bits
 * sur une grille de trois par cinq, ecrit en clair comme un entier, et lu
 * bit a bit par division par une puissance de deux et parite.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le phosphore du texte.
 * - `uColorC` — le curseur et les cellules corrompues.
 * - `uColumns` — nombre de colonnes sur la largeur.
 * - `uSpeed` — vitesse de frappe, en lignes par seconde.
 * - `uFlicker` — force du scintillement.
 * - `uTearing` — frequence et amplitude des dechirements.
 */
export const FAULTY_TERMINAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uColumns;
uniform float uSpeed;
uniform float uFlicker;
uniform float uTearing;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float termHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Le bit de rang donne d'un masque.
float termBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// Seize glyphes sur trois par cinq, le bit de poids fort en haut a gauche.
float termGlyph(float id) {
  if (id < 0.5) return 31599.0;
  if (id < 1.5) return 11415.0;
  if (id < 2.5) return 29671.0;
  if (id < 3.5) return 29391.0;
  if (id < 4.5) return 23497.0;
  if (id < 5.5) return 31183.0;
  if (id < 6.5) return 29330.0;
  if (id < 7.5) return 31695.0;
  if (id < 8.5) return 11245.0;
  if (id < 9.5) return 31143.0;
  if (id < 10.5) return 31140.0;
  if (id < 11.5) return 23533.0;
  if (id < 12.5) return 18727.0;
  if (id < 13.5) return 29842.0;
  if (id < 14.5) return 29351.0;
  return 23186.0;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float columns = clamp(uColumns, 12.0, 120.0);
  float cellW = aspect / columns;
  float cellH = cellW * 1.5;
  float rows = floor(1.0 / cellH);

  // Les pannes sont hachees : une graine par palier d'un quart de seconde.
  float burst = floor(uTime * 4.0);
  float faulty = step(1.0 - clamp(uTearing, 0.0, 1.0) * 0.45, termHash(vec2(burst, 3.0)));

  // Le dechirement : une bande de lignes decalee d'un nombre entier de
  // colonnes, pendant la duree de la panne.
  float y = (1.0 - vUv.y) / cellH;
  float bandTop = termHash(vec2(burst, 5.0)) * rows;
  float bandRows = 1.0 + floor(termHash(vec2(burst, 9.0)) * 4.0);
  float inBand = step(bandTop, y) * step(y, bandTop + bandRows);
  float shift = floor((termHash(vec2(burst, 13.0)) - 0.5) * 8.0) * faulty * inBand;

  vec2 p = vec2(vUv.x * aspect / cellW + shift, y);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // Le front de frappe : quelle ligne se tape, et jusqu'ou.
  float page = rows + 4.0;
  float progress = mod(uTime * uSpeed, page);
  float line = floor(progress);
  float epoch = floor(uTime * uSpeed / page);

  // Chaque ligne a sa longueur, tiree de son rang et de la page. Quelques
  // lignes restent vides : un terminal aere ses sorties.
  float lineSeed = termHash(vec2(id.y, epoch));
  float lineLength = step(0.15, lineSeed) * (4.0 + floor(lineSeed * (columns - 8.0)));
  float typed = fract(progress) * lineLength;

  float written = step(id.y + 0.5, line) * step(id.x, lineLength - 1.0);
  float typing = step(abs(id.y - line), 0.5) * step(id.x, typed - 1.0);
  float shown = max(written, typing) * step(id.x, columns - 1.0);

  // La corruption : pendant la panne, quelques cellules changent de glyphe.
  float corrupt = faulty * inBand * step(0.7, termHash(id + burst));
  float glyph = floor(termHash(vec2(id.x * 1.7 + id.y * 3.1, epoch + corrupt * burst)) * 16.0);

  vec2 g = vec2(floor(local.x * 4.0), floor(local.y * 6.0));
  float inside = step(g.x, 2.5) * step(g.y, 4.5);
  float bit = termBit(termGlyph(glyph), (4.0 - g.y) * 3.0 + (2.0 - g.x)) * inside;

  // Le curseur : un bloc plein a la suite du texte tape, qui clignote.
  float cursorCol = floor(typed);
  float cursor = step(abs(id.y - line), 0.5) * step(abs(id.x - cursorCol), 0.5)
    * step(0.5, fract(uTime * 2.0)) * step(g.x, 2.5) * step(g.y, 4.5);

  // Le scintillement : toute l'image baisse par paliers rapides.
  float dim = 1.0 - clamp(uFlicker, 0.0, 1.0) * 0.5 * termHash(vec2(floor(uTime * 24.0), 1.0)) * faulty;

  float ink = bit * shown * dim;
  vec3 colour = mix(uColorA, uColorB, ink * (1.0 - corrupt));
  colour = mix(colour, uColorC, max(ink * corrupt, cursor * dim));

  gl_FragColor = vec4(colour, 1.0);
}
`
