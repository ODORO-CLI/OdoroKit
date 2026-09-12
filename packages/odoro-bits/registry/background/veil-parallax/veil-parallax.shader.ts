/**
 * Shader des nappes parallaxes.
 *
 * ## L'idee mathematique
 *
 * Trois nappes de bruit fractal, chacune lue en un point decale par la
 * position amortie du pointeur d'un facteur different : la nappe la plus fine
 * glisse le plus, et c'est cet ecart entre les vitesses qui fait la
 * profondeur. Une derive automatique lente maintient les nappes vivantes
 * quand aucun pointeur ne passe.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond profond.
 * - `uColorB` — les nappes intermediaires.
 * - `uColorC` — la nappe de surface.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uDepth` — amplitude de la parallaxe.
 * - `uSpeed` — vitesse de la derive automatique.
 * - `uScale` — echelle du bruit ; plus haut, plus fin.
 */
export const VEIL_PARALLAX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uDepth;
uniform float uSpeed;
uniform float uScale;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float veilHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float veilNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = veilHash(cell);
  float b = veilHash(cell + vec2(1.0, 0.0));
  float c = veilHash(cell + vec2(0.0, 1.0));
  float d = veilHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme de trois octaves : chaque passe deux fois plus fine, deux fois plus faible.
float veilFbm(vec2 p) {
  float total = veilNoise(p) * 0.5;
  total += veilNoise(p * 2.0) * 0.25;
  total += veilNoise(p * 4.0) * 0.125;
  return total / 0.875;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // Le pointeur, ramene au centre : chaque nappe glisse d'un facteur propre.
  vec2 offset = (uPointer - 0.5) * uDepth;

  // Nappe du fond : presque immobile, elle sert d'ancre a la profondeur.
  float fond = veilFbm(p + offset * 0.35 + vec2(t * 0.3, t * 0.12));

  // Nappe mediane : un cran plus fine, un cran plus mobile.
  float milieu = veilFbm(p * 1.6 + offset * 1.0 + vec2(-t * 0.2, t * 0.26) + 3.7);

  // Nappe de surface : la plus fine et la plus sensible au pointeur — c'est
  // l'ecart entre les trois glissements qui fait lire la profondeur.
  float surface = veilFbm(p * 2.4 + offset * 1.9 + vec2(t * 0.16, -t * 0.22) + 8.1);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, smoothstep(0.3, 0.8, fond) * 0.55);
  colour = mix(colour, uColorB, smoothstep(0.4, 0.85, milieu) * 0.4);
  colour = mix(colour, uColorC, smoothstep(0.5, 0.9, surface) * 0.45);

  // Vignette : l'assombrissement des bords accentue l'effet de fenetre.
  float ecart = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.45, 1.0, ecart) * 0.45;

  gl_FragColor = vec4(colour, 1.0);
}
`
