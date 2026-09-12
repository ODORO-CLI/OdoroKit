/**
 * Shader de la distorsion d'ondes.
 *
 * ## L'idee mathematique
 *
 * Une seule source, le pointeur, emet des ondes concentriques : un sinus de la
 * distance moins le temps, sous une enveloppe exponentielle qui les eteint en
 * s'eloignant. La hauteur de l'onde ne se voit pas directement — elle **decale
 * la lecture** d'un motif de bandes, exactement comme une vitre ondulee decale
 * ce qu'on voit au travers. Sans ce detour, on verrait des anneaux dessines ;
 * avec lui, on voit une surface deformee.
 *
 * La distance est mesuree dans un repere corrige par le rapport de la surface :
 * sans cette correction, les anneaux seraient des ellipses des que la zone
 * n'est pas carree.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le creux des bandes.
 * - `uColorB` — leur crete.
 * - `uColorC` — l'eclat porte par les cretes de l'onde.
 * - `uPointer` — position du pointeur, amortie, en coordonnees de texture.
 * - `uSpeed` — vitesse de propagation.
 * - `uScale` — serrage des ondes et des bandes.
 * - `uAmount` — amplitude du decalage de lecture.
 */
export const RIPPLE_DISTORTION_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uScale;
uniform float uAmount;

void main() {
  // Le rapport de la surface corrige la distance : sans lui, les anneaux
  // s'aplatissent en ellipses sur une zone large.
  float aspect = max(uResolution.x, 1.0) / max(uResolution.y, 1.0);
  vec2 offset = vec2((vUv.x - uPointer.x) * aspect, vUv.y - uPointer.y);
  float distance = length(offset);

  // L'enveloppe eteint l'onde avec l'eloignement : la source reste lisible,
  // et les bords ne tremblent pas indefiniment.
  float envelope = exp(-distance * 2.6);
  float wave = sin(distance * uScale - uTime * uSpeed * 3.0) * envelope;

  // La direction de fuite, protegee du centre exact ou elle n'existe pas.
  vec2 direction = offset / max(distance, 0.001);
  vec2 read = vUv + direction * wave * uAmount * 0.06;

  // Un motif de bandes obliques : c'est lui qui rend la deformation visible.
  float bands = 0.5 + 0.5 * sin((read.x + read.y) * uScale * 0.42 + uTime * uSpeed * 0.5);
  vec3 colour = mix(uColorA, uColorB, bands);

  // Les cretes portent l'eclat, dans les deux sens : une onde a un dessus et
  // un dessous, et n'eclairer que l'un des deux donne un rendu de vagues
  // peintes.
  colour = mix(colour, uColorC, smoothstep(0.25, 1.0, abs(wave)) * 0.55);

  gl_FragColor = vec4(colour, 1.0);
}
`
