/**
 * Shader du tramage.
 *
 * ## L'idee mathematique
 *
 * Un tramage ordonne compare chaque pixel a un seuil qui depend de sa
 * position dans une petite matrice repetee — celle de Bayer — plutot qu'a un
 * seuil fixe. Un degrade continu devient alors une densite de points : la
 * ou la valeur est haute, presque tous les pixels passent ; la ou elle est
 * basse, presque aucun. C'est la technique des imprimantes et des consoles a
 * deux couleurs, et elle donne ce grain regulier qu'aucun bruit ne remplace.
 *
 * La matrice huit par huit n'est pas une texture : elle se calcule par une
 * recurrence, la matrice de rang n etant celle de rang n-1 repliee. Sans
 * operations sur les bits, absentes du langage employe ici, la recurrence
 * est ecrite en arithmetique flottante.
 *
 * Le degrade est un bruit de valeur a deux octaves, en derive lente. Trois
 * teintes : la valeur est d'abord quantifiee en deux paliers, et le tramage
 * ne joue qu'entre deux teintes voisines.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA`, `uColorB`, `uColorC` — les trois teintes, de la plus basse a la plus haute.
 * - `uSpeed` — vitesse du degrade.
 * - `uPixel` — cote d'un pixel de trame, en pixels physiques.
 * - `uScale` — echelle du degrade.
 */
export const DITHER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uPixel;
uniform float uScale;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float ditherHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float ditherNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = ditherHash(cell);
  float b = ditherHash(cell + vec2(1.0, 0.0));
  float c = ditherHash(cell + vec2(0.0, 1.0));
  float d = ditherHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Matrice de Bayer par recurrence : le rang deux est ecrit en clair, chaque
// rang suivant replie le precedent a l'echelle moitie.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2.0 + a.y * a.y * 0.75);
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

float bayer8(vec2 a) {
  return bayer4(0.5 * a) * 0.25 + bayer2(a);
}

void main() {
  float pixel = max(uPixel, 1.0);
  // Le pixel de trame : tout ce qui suit se calcule au centre de sa case.
  vec2 grid = floor(gl_FragCoord.xy / pixel);
  vec2 uv = (grid + 0.5) * pixel / uResolution;
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(uv.x * aspect, uv.y) * uScale;

  float t = uTime * uSpeed;
  float value = ditherNoise(p + vec2(t * 0.35, t * 0.2));
  value += 0.5 * ditherNoise(p * 2.1 - vec2(t * 0.15, t * 0.4));
  value /= 1.5;

  // Un leger contraste : sans lui, le tramage reste dans les gris moyens.
  value = smoothstep(0.2, 0.8, value);

  // Deux paliers, et le tramage entre les deux teintes voisines.
  float scaled = value * 2.0;
  float base = min(floor(scaled), 1.0);
  float rest = scaled - base;
  float on = step(bayer8(grid), rest);
  float level = base + on;

  vec3 colour = mix(uColorA, uColorB, clamp(level, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(level - 1.0, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
