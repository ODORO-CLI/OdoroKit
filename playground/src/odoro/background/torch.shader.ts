/**
 * Shader de la torche.
 *
 * ## L'idee mathematique
 *
 * Un motif discret — une grille fine relevee d'un bruit de valeur — couvert
 * d'un voile sombre. La lueur est une fenetre douce autour du pointeur : un
 * smoothstep de la distance rend au motif sa lumiere, et une pointe chaude au
 * centre donne a la lueur sa matiere.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond sous le voile.
 * - `uColorB` — les traits du motif.
 * - `uColorC` — la chaleur du faisceau.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uRadius` — rayon de la lueur.
 * - `uSoftness` — douceur du bord de la lueur.
 * - `uDim` — opacite du voile hors du faisceau.
 */
export const TORCH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uSoftness;
uniform float uDim;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float torchHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float torchNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = torchHash(cell);
  float b = torchHash(cell + vec2(1.0, 0.0));
  float c = torchHash(cell + vec2(0.0, 1.0));
  float d = torchHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  // Le motif sous le voile : une grille fine, relevee d'un bruit lent. C'est
  // lui que la torche revele — sans motif, la lueur n'eclairerait rien.
  vec2 lines = abs(fract(p * 24.0) - 0.5);
  float grid = 1.0 - smoothstep(0.0, 0.08, min(lines.x, lines.y));
  float grain = torchNoise(p * 5.0 + uTime * 0.05);

  vec3 motif = mix(uColorA, uColorB, grid * 0.55 + grain * 0.25);

  // La lueur : pleine jusqu'au bord interieur, eteinte au rayon. La douceur
  // regle la largeur de la transition entre les deux.
  float d = length(p - m);
  float inner = uRadius * (1.0 - clamp(uSoftness, 0.05, 1.0));
  float torch = 1.0 - smoothstep(inner, max(uRadius, inner + 0.001), d);

  // Le voile retire de la lumiere partout ou la torche ne porte pas.
  float lit = mix(1.0 - clamp(uDim, 0.0, 1.0), 1.0, torch);
  vec3 colour = motif * lit;

  // La pointe chaude au coeur du faisceau : le carre resserre l'apport sur le
  // centre, la ou une torche reelle brule.
  colour += uColorC * torch * torch * 0.35;

  gl_FragColor = vec4(colour, 1.0);
}
`
