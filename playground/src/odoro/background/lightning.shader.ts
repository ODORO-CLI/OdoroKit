/**
 * Shader des eclairs.
 *
 * ## L'idee mathematique
 *
 * Un chemin vertical deplace par un bruit multi-octave : chaque octave ajoute
 * un zigzag plus fin, et c'est leur somme qui fait la ramure. Le trait est une
 * exponentielle de la distance horizontale au chemin — le profil d'un arc vu a
 * travers l'air. Le temps est hache en paliers : le hachage du palier decide
 * si un eclair frappe, et une enveloppe exponentielle le fait vivre deux ou
 * trois images avant de laisser une lueur residuelle.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le ciel de nuit.
 * - `uColorB` — la lueur diffuse autour de l'arc.
 * - `uColorC` — le trait de l'arc lui-meme.
 * - `uFrequency` — cadence des paliers, donc des rafales possibles.
 * - `uBranches` — octaves du deplacement, donc la ramure du chemin.
 * - `uGlow` — portee de la lueur autour du trait.
 */
export const LIGHTNING_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uFrequency;
uniform float uBranches;
uniform float uGlow;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float eclairHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Bruit de valeur 1D : interpolation lissee entre deux tirages entiers.
float eclairNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(eclairHash(cell), eclairHash(cell + 1.0), smoothed);
}

// Deplacement du chemin : somme d'octaves, chacune deux fois plus fine et
// presque deux fois plus faible. Les octaves basses courbent le tronc, les
// hautes font les brisures — c'est le reglage de ramure.
float eclairChemin(float y, float graine, int octaves) {
  float total = 0.0;
  float amplitude = 0.24;
  float frequence = 2.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += (eclairNoise(y * frequence + graine * 77.0) - 0.5) * amplitude;
    frequence *= 2.3;
    amplitude *= 0.55;
  }

  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);
  int octaves = int(clamp(uBranches, 1.0, 6.0));

  // Le temps est hache en paliers : un eclair vit a l'interieur d'un palier,
  // jamais a cheval sur deux, et le hachage du palier fait office de de.
  float cadence = max(uFrequency, 0.05);
  float palier = floor(uTime * cadence);
  float vie = fract(uTime * cadence);
  float graine = eclairHash(palier);

  // Trois paliers sur cinq restent muets : c'est le silence entre les coups
  // qui rend les rafales credibles, pas les coups eux-memes.
  float actif = step(0.4, graine);

  // Enveloppe : un flash bref, puis un second retour plus faible — le
  // re-amorcage d'un vrai eclair — puis la lueur residuelle qui s'eteint.
  float enveloppe = exp(-vie * 10.0) + 0.45 * exp(-abs(vie - 0.2) * 28.0);
  enveloppe *= actif;

  // Le chemin descend du haut : son ancrage horizontal change a chaque palier.
  float ancrage = (graine - 0.5) * 0.8;
  float chemin = ancrage + eclairChemin(vUv.y, graine, octaves) * (1.0 - vUv.y * 0.35);

  // Trait et lueur : deux exponentielles de la meme distance, l'une raide
  // pour l'arc, l'autre large pour l'air illumine autour.
  float ecart = abs(p.x - chemin);
  float trait = exp(-ecart * 220.0);
  float lueur = exp(-ecart * ecart / max(uGlow * uGlow * 0.045, 0.0008));

  // L'eclat illumine aussi tout le ciel, faiblement : sans cette nappe, l'arc
  // flotterait sur un fond que rien ne relie a lui.
  vec3 colour = uColorA
    + uColorB * enveloppe * (lueur * 0.85 + 0.08)
    + uColorC * enveloppe * trait;

  gl_FragColor = vec4(colour, 1.0);
}
`
