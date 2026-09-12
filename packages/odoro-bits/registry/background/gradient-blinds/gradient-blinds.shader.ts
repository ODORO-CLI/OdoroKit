/**
 * Shader des stores de degrade.
 *
 * ## L'idee mathematique
 *
 * Des lamelles verticales devant un degrade. Chaque lamelle est une cellule
 * d'une grille en x ; son ouverture est une fraction de la cellule, et cette
 * fraction suit une onde qui traverse les lamelles d'un bord a l'autre —
 * c'est la vague d'ouverture. Une seconde onde, en y, incline la vague pour
 * que le store ne s'ouvre pas en bloc rectangulaire.
 *
 * Derriere, le degrade est un melange entre deux tokens le long d'une
 * diagonale qui derive. Devant, la lamelle fermee est le fond lui-meme, a
 * peine teinte pour que sa structure reste visible ; a la lisiere de
 * l'ouverture, un liseret rappelle l'epaisseur de la lamelle.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, les lamelles fermees.
 * - `uColorB` — le debut du degrade.
 * - `uColorC` — la fin du degrade, et le liseret.
 * - `uCount` — nombre de lamelles sur la largeur.
 * - `uSpeed` — vitesse de la vague d'ouverture.
 * - `uOpen` — ouverture moyenne, entre ferme et ouvert.
 * - `uTilt` — inclinaison des lamelles.
 * - `uDetail` — 1 pour le liseret et l'ombre, 0 pour des aplats.
 */
export const GRADIENT_BLINDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSpeed;
uniform float uOpen;
uniform float uTilt;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;
  float count = max(floor(uCount), 2.0);

  // Les lamelles : une grille en x, inclinee par y.
  float x = vUv.x + (vUv.y - 0.5) * uTilt * 0.5;
  float index = floor(x * count);
  float cellule = fract(x * count);

  // L'ouverture : une vague qui traverse les lamelles, inclinee par une
  // seconde onde en y, autour de l'ouverture moyenne.
  float vague = sin(index / count * 6.2831853 * 1.5 - t * 2.0);
  float pente = sin(vUv.y * 3.5 + t * 0.8 + index * 0.4);
  float ouverture = clamp(uOpen + 0.4 * vague + 0.15 * pente, 0.0, 1.0);

  // Le degrade derriere : une diagonale qui derive.
  float diagonale = (vUv.x * aspect + vUv.y) * 0.8 + t * 0.15;
  vec3 teinte = mix(uColorB, uColorC, 0.5 + 0.5 * sin(diagonale * 2.0));

  // La lamelle : ouverte a gauche de la cellule, fermee a droite.
  float bord = 0.012;
  float visible = 1.0 - smoothstep(ouverture - bord, ouverture + bord, cellule);

  vec3 colour = mix(uColorA, teinte, visible);

  // La lamelle fermee garde une trace de la teinte : sa structure reste
  // lisible sans que le fond soit assombri.
  colour = mix(colour, teinte, (1.0 - visible) * 0.07);

  if (uDetail > 0.5) {
    // Le liseret : l'epaisseur de la lamelle a la lisiere de l'ouverture.
    float liseret = exp(-abs(cellule - ouverture) * 90.0);
    colour = mix(colour, uColorC, liseret * 0.5 * step(0.02, ouverture));

    // L'ombre portee du store sur le degrade : plus la lamelle est ouverte,
    // plus l'ombre s'eloigne — un simple retour vers le fond, borne.
    float ombre = exp(-(ouverture - cellule) * 30.0) * visible;
    colour = mix(colour, uColorA, ombre * 0.25);
  }

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
