/**
 * Shader de la vague tranchee.
 *
 * ## L'idee mathematique
 *
 * Une seule bande epaisse, mais lue tranche par tranche : le cadre est
 * decoupe en colonnes, et la hauteur de la bande est evaluee au centre de la
 * colonne, jamais au fragment. La vague est donc constante dans chaque
 * tranche et saute d'une marche a la suivante — c'est la quantification qui
 * fait l'escalier, pas un trace de rectangles.
 *
 * Chaque tranche recoit en plus un battement propre, fonction de son indice :
 * les colonnes ne suivent pas seulement la vague, elles tressaillent chacune
 * a leur rythme, et le mouvement est vertical avant tout.
 *
 * Un sillon d'un pixel separe les tranches, sinon la marche ne se lit pas
 * quand deux colonnes voisines ont presque la meme hauteur.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps de la bande.
 * - `uColorC` — le bord superieur de la bande.
 * - `uSlices` — nombre de tranches.
 * - `uAmplitude` — hauteur de la vague, en fraction du cadre.
 * - `uSpeed` — vitesse de la vague.
 * - `uHeight` — epaisseur de la bande, en fraction du cadre.
 */
export const SLICED_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSlices;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uHeight;

void main() {
  float slices = clamp(uSlices, 4.0, 120.0);
  float index = floor(vUv.x * slices);
  float local = fract(vUv.x * slices);
  float centre = (index + 0.5) / slices;
  float t = uTime * uSpeed;

  // La vague au centre de la tranche : une houle lente, une plus courte en
  // contre-phase, et un battement propre a la colonne.
  float wave = sin(centre * 9.4 - t) * 0.6
    + sin(centre * 23.2 + t * 0.7 + index * 0.3) * 0.25
    + sin(t * 1.7 + index * 1.3) * 0.15;
  float axis = 0.5 + wave * uAmplitude;

  float demi = max(uHeight, 0.02) * 0.5;
  float px = 1.0 / max(uResolution.y, 1.0);
  float d = abs(vUv.y - axis);
  float band = 1.0 - smoothstep(demi - px, demi + px, d);

  // Le sillon : un pixel de fond entre deux tranches, en unites de tranche.
  float gapWidth = slices / max(uResolution.x, 1.0);
  float gap = 1.0 - smoothstep(0.0, gapWidth * 1.5, min(local, 1.0 - local));
  band *= 1.0 - gap;

  // Un halo sous la bande, comme une ombre portee sur le fond.
  float halo = exp(-d * 6.0) * 0.18 * (1.0 - band);

  // Le corps s'eclaircit vers son bord superieur.
  float shade = smoothstep(-demi, demi, vUv.y - axis);

  vec3 colour = mix(uColorA, uColorB, halo);
  colour = mix(colour, uColorB, band);
  colour = mix(colour, uColorC, band * shade * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
