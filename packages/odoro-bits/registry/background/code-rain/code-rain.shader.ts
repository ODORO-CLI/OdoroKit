/**
 * Shader de la pluie de code.
 *
 * ## L'idee mathematique
 *
 * L'ecran est decoupe en cellules de caracteres. Chaque colonne porte une
 * goutte : une tete qui descend a sa propre vitesse, suivie d'une trainee
 * dont l'intensite decroit exponentiellement avec l'age — le nombre de
 * lignes qui la separent de la tete. La descente boucle sur la hauteur plus
 * la longueur de la trainee, si bien qu'une goutte sort entierement par le
 * bas avant de repartir du haut.
 *
 * ## Les glyphes
 *
 * Aucune police, aucune texture : chaque glyphe est un masque de quinze bits
 * sur une grille de trois par cinq, ecrit en clair comme un entier. Le bit
 * d'une position se lit par division par une puissance de deux et parite —
 * le langage employe ici n'a pas d'operations sur les bits, mais un
 * flottant tient quinze bits sans perte. Une cellule change de glyphe a son
 * propre rythme, tire de sa position : une pluie ou tous les caracteres
 * mutent ensemble se lit comme un stroboscope.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la trainee.
 * - `uColorC` — la tete.
 * - `uColumns` — nombre de colonnes sur la largeur.
 * - `uSpeed` — vitesse de chute.
 * - `uTrail` — longueur de la trainee, en lignes.
 * - `uMutate` — cadence des changements de glyphe, par seconde.
 */
export const CODE_RAIN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uColumns;
uniform float uSpeed;
uniform float uTrail;
uniform float uMutate;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float rainHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Le bit de rang donne d'un masque : division par une puissance de deux,
// puis parite. Exact tant que le masque tient dans la mantisse.
float rainBit(float mask, float index) {
  return mod(floor(mask / exp2(index)), 2.0);
}

// Seize glyphes sur trois par cinq, le bit de poids fort en haut a gauche.
float rainGlyph(float id) {
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
  float columns = clamp(uColumns, 8.0, 120.0);

  // Une cellule : trois par cinq de glyphe, plus un interligne de chaque
  // cote. Quatre unites de large, six de haut.
  float cellW = aspect / columns;
  float cellH = cellW * 1.5;
  float rows = floor(1.0 / cellH) + 1.0;

  vec2 p = vec2(vUv.x * aspect / cellW, (1.0 - vUv.y) / cellH);
  vec2 id = floor(p);
  vec2 local = fract(p);

  // La goutte de cette colonne : sa vitesse, son depart, sa position.
  float seed = rainHash(vec2(id.x, 7.0));
  float cycle = rows + uTrail;
  float head = mod(uTime * uSpeed * (3.0 + 5.0 * seed) + seed * cycle, cycle);

  // L'age de la ligne : zero a la tete, croissant derriere elle, et
  // enroule sur le cycle pour que la queue de la goutte precedente subsiste.
  float age = mod(head - id.y, cycle);
  float trail = exp(-age / max(uTrail, 0.5)) * step(age, uTrail * 2.5);
  float tip = 1.0 - smoothstep(0.0, 1.0, age);

  // Le glyphe de la cellule, retire a son propre rythme.
  float epoch = floor(uTime * uMutate + rainHash(id) * 11.0);
  float glyph = floor(rainHash(vec2(id.x * 3.1 + id.y, epoch)) * 16.0);
  vec2 g = vec2(floor(local.x * 4.0), floor(local.y * 6.0));
  float inside = step(g.x, 2.5) * step(g.y, 4.5);
  float bit = rainBit(rainGlyph(glyph), (4.0 - g.y) * 3.0 + (2.0 - g.x)) * inside;

  // Chaque cellule a sa luminance : une trainee uniforme se lirait comme
  // une barre, pas comme des caracteres.
  float shade = 0.6 + 0.4 * rainHash(id + epoch);

  vec3 colour = mix(uColorA, uColorB, bit * trail * shade);
  colour = mix(colour, uColorC, bit * tip);

  gl_FragColor = vec4(colour, 1.0);
}
`
