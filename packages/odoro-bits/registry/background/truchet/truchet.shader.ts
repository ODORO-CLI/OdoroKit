/**
 * Shader des tuiles de Truchet.
 *
 * ## L'idee mathematique
 *
 * Une tuile de Truchet porte deux quarts de cercle, centres sur deux coins
 * opposes, de rayon une demi-tuile : quelle que soit son orientation, ses
 * arcs rejoignent ceux des voisines, et le pavage forme des courbes fermees
 * sans qu'aucune tuile ne connaisse les autres.
 *
 * Chaque tuile a une orientation de depart hachee, et pivote d'un quart de
 * tour a chaque periode. Le pivot est anime : un tiers de periode de
 * rotation, puis le repos. Une cascade diagonale retarde chaque tuile sur
 * sa voisine, si bien que le pavage se recompose en vague plutot que d'un
 * coup.
 *
 * La couleur est attachee a l'arc, pas au coin : quand la tuile pivote, la
 * couleur tourne avec elle, et les courbes du pavage changent de teinte la
 * ou elles se raccordent autrement.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le premier arc.
 * - `uColorC` — le second arc.
 * - `uSpeed` — periodes par seconde.
 * - `uDensity` — nombre de tuiles sur la hauteur.
 * - `uThickness` — epaisseur des arcs, en fraction de la tuile.
 * - `uStagger` — retard diagonal entre deux tuiles voisines, en periodes.
 */
export const TRUCHET_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uThickness;
uniform float uStagger;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float truchetHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 truchetRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // La cascade : chaque tuile est en retard sur sa voisine diagonale. La
  // partie entiere compte les quarts de tour faits, la partie fractionnaire
  // anime celui en cours pendant son premier tiers.
  float phase = uTime * uSpeed - (cell.x + cell.y) * uStagger;
  float turns = floor(phase);
  float progress = smoothstep(0.0, 0.34, fract(phase));

  float start = floor(truchetHash(cell) * 4.0);
  float angle = (start + turns + progress) * 1.5707963;

  vec2 q = truchetRotate(local, angle);

  // Les deux arcs : quarts de cercle centres sur deux coins opposes.
  float d1 = abs(length(q - vec2(-0.5, -0.5)) - 0.5);
  float d2 = abs(length(q - vec2(0.5, 0.5)) - 0.5);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float halfWidth = max(uThickness, 0.01) * 0.5;
  float arc1 = 1.0 - smoothstep(halfWidth - px, halfWidth + px, d1);
  float arc2 = 1.0 - smoothstep(halfWidth - px, halfWidth + px, d2);

  // Pendant le pivot, la tuile s'assombrit un peu : l'oeil suit la vague.
  float moving = progress * (1.0 - progress) * 4.0;

  vec3 colour = mix(uColorA, uColorB, 0.06 * moving);
  colour = mix(colour, uColorB, arc1);
  colour = mix(colour, uColorC, arc2);

  gl_FragColor = vec4(colour, 1.0);
}
`
