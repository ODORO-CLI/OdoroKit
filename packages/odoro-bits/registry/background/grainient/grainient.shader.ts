/**
 * Shader du degrade granuleux.
 *
 * ## L'idee mathematique
 *
 * Un degrade de taches, comme la nappe de couleurs, mais dont la matiere
 * est du grain. Chaque tache est une gaussienne de la distance a un centre
 * qui decrit une courbe de Lissajous lente ; les taches paires portent une
 * teinte, les impaires l'autre.
 *
 * Le grain n'est pas pose sur l'image apres coup : il est dans le degrade.
 * Un nombre pseudo-aleatoire par pixel, renouvele a douze images par
 * seconde, decale le poids de chaque teinte avant le melange. Les
 * transitions se dissolvent en points au lieu de s'etaler, ce qui donne
 * l'aspect imprime. Le fond, lui, reste intact : le grain ne vit que la ou
 * il y a de la couleur.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte des taches paires.
 * - `uColorC` — la teinte des taches impaires.
 * - `uSpeed` — vitesse de derive des taches.
 * - `uGrain` — force du grain.
 * - `uScale` — taille des taches.
 * - `uBlobs` — nombre de taches, et donc leur cout.
 */
export const GRAINIENT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uGrain;
uniform float uScale;
uniform float uBlobs;

// Nombre pseudo-aleatoire d'un indice : sinus amplifie, partie fractionnaire.
float grainHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Nombre pseudo-aleatoire d'un point : projection, sinus amplifie.
float grainHash2(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int taches = int(clamp(uBlobs, 1.0, 6.0));
  float rayon = max(uScale, 0.2) * 0.45;

  // Les poids des deux teintes : une gaussienne par tache, sommee par parite.
  float poidsB = 0.0;
  float poidsC = 0.0;

  // Borne constante : la specification du langage l'exige. Six taches
  // suffisent ; au-dela, elles se recouvrent et le degrade devient uniforme.
  for (int i = 0; i < 6; i += 1) {
    if (i >= taches) break;
    float fi = float(i);
    float h1 = grainHash(fi + 1.0);
    float h2 = grainHash(fi + 11.0);
    float h3 = grainHash(fi + 23.0);
    vec2 centre = vec2(
      0.5 + 0.4 * sin(t * (0.3 + h1 * 0.4) + h2 * 6.2831),
      0.5 + 0.38 * cos(t * (0.25 + h3 * 0.5) + h1 * 6.2831)
    ) * vec2(aspect, 1.0);
    vec2 d = p - centre;
    float poids = exp(-dot(d, d) / (rayon * rayon));
    if (mod(fi, 2.0) < 0.5) poidsB += poids; else poidsC += poids;
  }

  // Le grain : un tirage par pixel, renouvele a douze images par seconde —
  // plus vite, il bourdonne ; moins vite, il scintille.
  float image = floor(uTime * 12.0);
  float grain = grainHash2(gl_FragCoord.xy + image * 7.13) - 0.5;
  float force = clamp(uGrain, 0.0, 1.0) * 0.45;

  // Le grain decale les poids avant le melange : il ne vit que la ou il y a
  // de la couleur, et n'atteint jamais le fond nu.
  float kB = clamp(poidsB + grain * force * smoothstep(0.0, 0.5, poidsB), 0.0, 1.0);
  float kC = clamp(poidsC + grain * force * smoothstep(0.0, 0.5, poidsC), 0.0, 1.0);

  vec3 colour = mix(uColorA, uColorB, kB);
  colour = mix(colour, uColorC, kC);

  // Un leger grain de luminance sur la couleur, pour l'aspect imprime.
  colour += mix(uColorB, uColorC, 0.5) * grain * force * 0.25 * max(kB, kC);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
