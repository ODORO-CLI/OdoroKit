/**
 * Shader des blocs qui sautent.
 *
 * ## L'idee mathematique
 *
 * Une image de fond — un degrade lent — et, par-dessus, une grille de blocs
 * dont chaque rangee est decalee d'un montant qui lui est propre, pour que
 * les blocs ne s'alignent pas en colonnes. A chaque palier de temps, un
 * tirage par bloc decide s'il saute. Un bloc qui saute lit l'image ailleurs
 * — decalee horizontalement — et l'ecrit avec ses teintes inversees ou
 * ecartees.
 *
 * Tout est hache par paliers, rien ne glisse : entre deux paliers, l'image
 * est parfaitement immobile. C'est ce qui fait un a-coup ; un decalage
 * continu ferait une ondulation.
 *
 * Deux echelles de sauts. Les blocs, petits, frequents. Et des bandes
 * entieres — une rangee sur dix, a un palier sur douze — decalees d'un
 * seul tenant, comme une image dont une ligne de balayage a ete perdue.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte du degrade.
 * - `uColorC` — la seconde, et la teinte des blocs inverses.
 * - `uBlocks` — nombre de rangees de blocs sur la hauteur.
 * - `uRate` — paliers par seconde.
 * - `uAmount` — part des blocs qui sautent a chaque palier.
 * - `uSpeed` — vitesse du degrade de fond.
 */
export const GLITCH_BLOCKS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBlocks;
uniform float uRate;
uniform float uAmount;
uniform float uSpeed;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float blockHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// L'image de fond : un degrade lent en deux teintes. Rendu entre zero et un
// pour chaque teinte.
vec2 blockImage(vec2 uv, float t) {
  float a = 0.5 + 0.5 * sin(uv.x * 2.2 + uv.y * 1.6 + t);
  float b = 0.5 + 0.5 * sin(uv.y * 3.0 - t * 0.7 + sin(uv.x * 2.0 + t * 0.5));
  return vec2(a, a * b);
}

vec3 blockPaint(vec2 uv, float t) {
  vec2 image = blockImage(uv, t);
  vec3 colour = mix(uColorA, uColorB, image.x * 0.8);
  return mix(colour, uColorC, image.y * 0.7);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;
  float palier = floor(uTime * max(uRate, 0.1));
  float amount = clamp(uAmount, 0.0, 1.0);

  // La grille de blocs : chaque rangee a son decalage, pour que rien ne
  // s'aligne en colonnes.
  float rows = clamp(uBlocks, 2.0, 40.0);
  float row = floor(vUv.y * rows);
  float rowShift = blockHash(vec2(row, 17.0));
  vec2 cell = vec2(floor(vUv.x * aspect * rows * 0.7 + rowShift), row);

  // Le tirage du bloc a ce palier : saute-t-il, de combien, comment.
  float draw = blockHash(cell + palier * 0.618);
  float jumps = step(1.0 - amount * 0.35, draw);
  float offset = (blockHash(cell * 1.3 + palier) - 0.5) * 0.25 * jumps;
  float invert = step(0.5, blockHash(cell * 2.1 + palier * 1.7)) * jumps;

  // Les bandes entieres : une rangee sur dix, a un palier sur douze.
  float bandDraw = blockHash(vec2(row * 0.37, palier));
  float band = step(1.0 - amount * 0.1, bandDraw) * step(0.92, blockHash(vec2(palier, 5.0)));
  offset += (blockHash(vec2(palier, row)) - 0.5) * 0.12 * band;

  vec2 uv = vec2(vUv.x * aspect + offset, vUv.y);
  vec3 colour = blockPaint(uv, t);

  // Un bloc inverse ecrit ses teintes a l'envers : la premiere devient la
  // seconde et le fond passe au premier plan. Un bloc ecarte lit chaque
  // teinte a une position differente.
  vec2 image = blockImage(uv, t);
  vec3 inverted = mix(uColorC, uColorA, image.x * 0.8);
  inverted = mix(inverted, uColorB, image.y * 0.5);

  vec2 split = blockImage(uv + vec2(0.03 * jumps, 0.0), t);
  vec3 spread = mix(uColorA, uColorB, image.x * 0.8);
  spread = mix(spread, uColorC, split.y * 0.9);

  colour = mix(colour, spread, jumps * (1.0 - invert));
  colour = mix(colour, inverted, invert);

  gl_FragColor = vec4(colour, 1.0);
}
`
