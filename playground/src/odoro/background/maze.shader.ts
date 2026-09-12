/**
 * Shader du labyrinthe.
 *
 * ## L'idee mathematique
 *
 * Le labyrinthe est celui d'une ligne de BASIC celebre : dans chaque cellule,
 * une diagonale montante ou descendante, tiree a pile ou face. Les
 * diagonales se raccordent aux coins, et l'oeil y lit des couloirs.
 *
 * Le dessin est date : une epoque entiere par periode, et dans chaque epoque
 * un front qui balaie le cadre en diagonale, de bas en haut et de gauche a
 * droite. Devant le front, la cellule montre le trait de l'epoque
 * precedente ; derriere, celui de l'epoque en cours. Dans la cellule que le
 * front traverse, le nouveau trait s'allonge d'un bout a l'autre pendant que
 * l'ancien s'efface par le meme bout, et une tete lumineuse marque la pointe
 * du trait en train de naitre.
 *
 * Rien n'est memorise d'image en image : l'age suffit a savoir ce que chaque
 * cellule doit montrer.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les traits.
 * - `uColorC` — la tete qui dessine.
 * - `uPeriod` — duree d'un dessin complet, en secondes.
 * - `uDensity` — nombre de cellules sur la hauteur.
 * - `uThickness` — epaisseur des traits, en fraction de la cellule.
 */
export const MAZE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPeriod;
uniform float uDensity;
uniform float uThickness;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float mazeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Le trait d'une cellule a une epoque : sa distance au fragment, et
// l'abscisse du fragment le long du trait, de 0 a 1.
vec2 mazeTrait(vec2 f, vec2 cell, float epoch) {
  float rising = step(0.5, mazeHash(cell + epoch * 17.0));
  // Montante : de (0,0) a (1,1). Descendante : de (0,1) a (1,0).
  float d = mix(abs(f.x + f.y - 1.0), abs(f.x - f.y), rising) * 0.7071068;
  float s = mix((f.x + 1.0 - f.y) * 0.5, (f.x + f.y) * 0.5, rising);
  return vec2(d, s);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 f = fract(p);

  float phase = uTime / max(uPeriod, 0.5);
  float epoch = floor(phase);

  // Le front, en unites de diagonale : il part avant la premiere cellule et
  // finit apres la derniere, pour que chaque trait soit dessine en entier.
  float diagonals = scale * aspect + scale + 2.0;
  float front = fract(phase) * diagonals - 1.0;
  float draw = clamp(front - (cell.x + cell.y), 0.0, 1.0);

  vec2 fresh = mazeTrait(f, cell, epoch);
  vec2 old = mazeTrait(f, cell, epoch - 1.0);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float halfWidth = max(uThickness, 0.01) * 0.5;

  // Le nouveau trait existe jusqu'a l'abscisse du front ; l'ancien au-dela.
  float newLine = (1.0 - smoothstep(halfWidth - px, halfWidth + px, fresh.x)) * step(fresh.y, draw);
  float oldLine = (1.0 - smoothstep(halfWidth - px, halfWidth + px, old.x)) * step(draw, old.y);
  float line = max(newLine, oldLine);

  // La tete : au bout du trait qui nait, seulement dans la cellule traversee.
  float active = step(0.001, draw) * step(draw, 0.999);
  float rising = step(0.5, mazeHash(cell + epoch * 17.0));
  vec2 headPos = mix(vec2(draw, 1.0 - draw), vec2(draw, draw), rising);
  float head = exp(-dot(f - headPos, f - headPos) / 0.02) * active;

  vec3 colour = mix(uColorA, uColorB, line * 0.85);
  colour += uColorC * head * 1.2;

  gl_FragColor = vec4(colour, 1.0);
}
`
