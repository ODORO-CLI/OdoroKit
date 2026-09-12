/**
 * Shader des courants.
 *
 * ## L'idee mathematique
 *
 * Des lignes de courant : un premier bruit a grande echelle donne en chaque
 * point un angle d'ecoulement ; le point de lecture est advecte le long de
 * cet angle, puis tourne dans le repere local du courant et etire — l'echelle
 * varie vite en travers du flot, lentement le long. Le second bruit, lu dans
 * ce repere anisotrope, s'allonge donc en filaments qui suivent le champ,
 * sans qu'aucune ligne ne soit tracee.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — l'eau profonde.
 * - `uColorB` — la teinte des courants.
 * - `uColorC` — la teinte des filaments rapides.
 * - `uSpeed` — vitesse d'advection.
 * - `uScale` — echelle du bruit ; plus haut, plus fin.
 * - `uStretch` — anisotropie ; plus haut, filaments plus longs.
 * - `uDetail` — nombre d'octaves du bruit fin, et donc son cout.
 */
export const CURRENTS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uStretch;
uniform float uDetail;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float courantHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float courantNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = courantHash(cell);
  float b = courantHash(cell + vec2(1.0, 0.0));
  float c = courantHash(cell + vec2(0.0, 1.0));
  float d = courantHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float courantFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += courantNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.5);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDetail, 1.0, 5.0));

  // Le champ d'ecoulement : un bruit a grande echelle, trois octaves
  // suffisent — il ne porte que la direction, pas le detail.
  float champ = courantFbm(p * 0.35 + vec2(t * 0.5, -t * 0.3), 3);
  float angle = (champ - 0.5) * 9.42477;
  float c = cos(angle);
  float s = sin(angle);

  // Advection : le point de lecture remonte le courant, donc le motif
  // descend le long du champ au lieu de defiler tout droit.
  vec2 q = p - t * vec2(c, s) * 0.6;

  // Rotation dans le repere local, puis anisotropie : la coordonnee en
  // travers du flot est dilatee, le bruit y varie donc vite et s'allonge en
  // filaments le long du courant.
  vec2 repere = vec2(c * q.x + s * q.y, (-s * q.x + c * q.y) * max(uStretch, 1.0));

  float filament = courantFbm(repere, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.3, 0.68, filament));
  colour = mix(colour, uColorC, pow(smoothstep(0.5, 0.88, filament), 3.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
