/**
 * Shader des vagues de degrade.
 *
 * ## L'idee mathematique
 *
 * Un degrade repete en bandes horizontales — fond, premiere teinte,
 * seconde teinte, fond — dont la hauteur est deplacee par une houle. La
 * houle est une somme de sinus de l'abscisse, a frequences non multiples
 * et a vitesses opposees, pour qu'elle ne se referme jamais sur elle-meme.
 *
 * Ce qui distingue ces vagues des lignes ondulantes ou des tranches : il
 * n'y a ni trait ni marche, seulement des nappes de couleur qui glissent
 * l'une sur l'autre. La douceur regle la largeur des transitions : basse,
 * les bandes sont franches ; haute, elles se fondent en un seul degrade
 * qui ondule.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte des bandes.
 * - `uColorC` — la seconde teinte des bandes.
 * - `uBands` — nombre de bandes sur la hauteur.
 * - `uAmplitude` — hauteur de la houle, en fraction du cadre.
 * - `uSpeed` — vitesse de la houle.
 * - `uSoftness` — largeur des transitions.
 * - `uDetail` — nombre d'harmoniques de la houle, et donc son cout.
 */
export const GRADIENT_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uBands;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uSoftness;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;
  int harmoniques = int(clamp(uDetail, 1.0, 3.0));

  // La houle : des sinus a frequences non multiples, aux vitesses opposees.
  float houle = sin(x * 2.4 + t);
  if (harmoniques >= 2) houle += 0.5 * sin(x * 4.1 - t * 1.3 + 1.0);
  if (harmoniques >= 3) houle += 0.25 * sin(x * 7.3 + t * 0.7 + 2.0);
  houle *= uAmplitude;

  // La bande : la hauteur deplacee, et une derive lente vers le haut.
  float phase = (vUv.y + houle) * max(uBands, 0.5) - uTime * 0.05;
  float w = fract(phase);

  // Le degrade repete : le fond en 0, la premiere teinte en un tiers, la
  // seconde en deux tiers, le fond en 1. La douceur elargit les paliers.
  float douceur = mix(0.06, 0.33, clamp(uSoftness, 0.0, 1.0));
  float kB = smoothstep(0.333 - douceur, 0.333, w) * smoothstep(0.666, 0.666 - douceur, w);
  float kC = smoothstep(0.666 - douceur, 0.666, w) * smoothstep(1.0, 1.0 - douceur, w);

  vec3 colour = mix(uColorA, uColorB, kB);
  colour = mix(colour, uColorC, kC);

  // La crete : la ou la houle culmine, la bande s'eclaire un peu.
  float crete = smoothstep(0.0, 1.0, houle / max(uAmplitude * 1.75, 0.0001));
  colour += mix(uColorB, uColorC, 0.5) * crete * 0.12 * max(kB, kC);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
