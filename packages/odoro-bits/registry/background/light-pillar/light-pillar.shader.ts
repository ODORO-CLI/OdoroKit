/**
 * Shader de la colonne de lumiere.
 *
 * ## L'idee mathematique
 *
 * Une colonne verticale, c'est une distance a un axe. Deux profils s'y
 * superposent : une gaussienne etroite pour le coeur, une exponentielle
 * large pour le halo — la lumiere reelle a un centre net et une traine qui
 * ne finit jamais tout a fait, et une seule courbe ne fait pas les deux.
 *
 * La respiration est la largeur qui oscille, sur deux periodes non
 * multiples pour ne pas battre comme un metronome. Les stries sont un bruit
 * 1D de la hauteur qui monte : trois sinus de frequences non multiples,
 * pour que la lumiere semble couler dans la colonne plutot que clignoter.
 *
 * La lumiere se pose sur le fond par melange borne vers ses teintes, jamais
 * par assombrissement : la colonne reste lisible sur un fond clair.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le halo.
 * - `uColorC` — le coeur.
 * - `uX` — position horizontale de l'axe, en fraction du cadre.
 * - `uWidth` — largeur du coeur, en fraction de la hauteur.
 * - `uBreath` — vitesse de la respiration.
 * - `uGlow` — etendue du halo.
 * - `uDetail` — nombre d'harmoniques des stries, et donc leur cout.
 */
export const LIGHT_PILLAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uWidth;
uniform float uBreath;
uniform float uGlow;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float axe = uX * aspect;
  float t = uTime;
  int harmoniques = int(clamp(uDetail, 1.0, 3.0));

  // La respiration : deux periodes non multiples, pour que la colonne ne
  // batte jamais deux fois de la meme facon.
  float souffle = 0.5
    + 0.3 * sin(t * uBreath * 1.3)
    + 0.2 * sin(t * uBreath * 0.47 + 1.7);
  float largeur = max(uWidth, 0.01) * (0.8 + 0.4 * souffle);

  // Les stries : un bruit 1D de la hauteur qui monte, en harmoniques bornees.
  float strie = 0.5 + 0.5 * sin(vUv.y * 9.0 - t * 0.8);
  if (harmoniques >= 2) {
    strie = strie * 0.6 + (0.5 + 0.5 * sin(vUv.y * 23.0 + t * 1.3)) * 0.4;
  }
  if (harmoniques >= 3) {
    strie = strie * 0.75 + (0.5 + 0.5 * sin(vUv.y * 51.0 - t * 2.1)) * 0.25;
  }

  // Le coeur, gaussien et net ; le halo, exponentiel et sans fin.
  float d = abs(p.x - axe);
  float coeur = exp(-(d * d) / (largeur * largeur * 0.25));
  float halo = exp(-d / (largeur * 4.0)) * uGlow;

  // Les extremites : la colonne s'eteint vers les bords, un peu plus vite en
  // haut, comme un jet qui se disperse en montant.
  float hauteur = smoothstep(0.0, 0.18, vUv.y) * smoothstep(1.0, 0.7, vUv.y);

  // Le pied : la lumiere qui touche le sol s'etale en une flaque.
  float pied = exp(-(d * d) * 6.0 - vUv.y * vUv.y * 30.0) * 0.5;

  // Les stries marquent le coeur ; sur le halo, elles ne font qu'affleurer,
  // sinon elles barrent tout le cadre de bandes horizontales.
  float voile = clamp((halo * (0.88 + 0.12 * strie) + pied) * hauteur, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, voile);
  colour = mix(colour, uColorC, clamp(coeur * hauteur * (0.6 + 0.4 * strie), 0.0, 1.0));
  colour += uColorC * coeur * hauteur * 0.25 * souffle;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
