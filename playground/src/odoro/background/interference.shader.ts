/**
 * Shader du moire.
 *
 * ## L'idee mathematique
 *
 * Deux reseaux d'anneaux — un sinus de la distance a chaque centre — dont le
 * produit fait apparaitre des battements : sin(d1.f).sin(d2.f) est lumineux
 * la ou les deux reseaux sont en phase, sombre la ou ils s'opposent, et ces
 * franges dessinent des hyperboles qu'aucun des deux reseaux ne contient. Les
 * centres orbitent lentement, le moire se recompose sans fin.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB`, `uColorC` — les deux tons des franges.
 * - `uSpeed` — vitesse des orbites.
 * - `uFrequency` — nombre d'anneaux par unite de distance.
 * - `uSeparation` — rayon des orbites, donc ecart des deux centres.
 */
export const INTERFERENCE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uFrequency;
uniform float uSeparation;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // Les deux centres orbitent a des periodes non multiples : la figure ne
  // revient jamais exactement au meme etat.
  vec2 c1 = uSeparation * vec2(cos(t), sin(t * 0.83));
  vec2 c2 = -uSeparation * vec2(cos(t * 0.71 + 2.0), sin(t * 0.93 + 1.0));

  // Chaque reseau est un sinus de la distance a son centre : des anneaux
  // concentriques, rien de plus.
  float f = max(uFrequency, 1.0) * 6.28318;
  float onde1 = sin(distance(p, c1) * f);
  float onde2 = sin(distance(p, c2) * f);

  // Le produit fait le moire : lumineux en phase, sombre en opposition. Les
  // franges dessinent des hyperboles qu'aucun des deux reseaux ne contient.
  float battement = onde1 * onde2;
  float k = 0.5 + 0.5 * battement;

  // Les deux tons se partagent les franges selon une derive lente : la
  // palette respire sans que la figure ne clignote.
  float partage = 0.5 + 0.5 * sin(length(p) * 3.0 - t * 0.6);
  vec3 frange = mix(uColorB, uColorC, partage);

  vec3 colour = mix(uColorA, frange, smoothstep(0.25, 1.0, k) * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
