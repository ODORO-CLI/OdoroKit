/**
 * Shader des nappes qui se plient.
 *
 * ## L'idee mathematique
 *
 * Chaque nappe est une bande epaisse autour d'une courbe : la distance,
 * dans un repere tourne propre a la nappe, entre l'ordonnee et une somme de
 * deux sinus de l'abscisse. Les nappes ont des orientations differentes,
 * si bien qu'elles se croisent au lieu de rester paralleles ; la pliure
 * est l'amplitude des sinus.
 *
 * La ou deux nappes se recouvrent, la couleur ne se contente pas de
 * remplacer : la somme des couvertures depasse un, et cet exces devient un
 * eclat ajoute, borne. C'est ce qui rend les nappes translucides plutot que
 * decoupees. Un liseret a leur bord rappelle leur epaisseur.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte de la premiere nappe.
 * - `uColorC` — la teinte de la derniere nappe, et le liseret.
 * - `uSheets` — nombre de nappes, et donc leur cout.
 * - `uThickness` — epaisseur des nappes, en fraction du cadre.
 * - `uBend` — amplitude des pliures.
 * - `uSpeed` — vitesse du mouvement.
 */
export const COLOR_BENDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSheets;
uniform float uThickness;
uniform float uBend;
uniform float uSpeed;

// Nombre pseudo-aleatoire d'un indice : sinus amplifie, partie fractionnaire.
float nappeHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) - vec2(aspect * 0.5, 0.5);
  float t = uTime * uSpeed;
  int nappes = int(clamp(uSheets, 1.0, 5.0));
  float epaisseur = max(uThickness, 0.02);

  vec3 colour = uColorA;
  float couverture = 0.0;
  float liseret = 0.0;

  // Borne constante : la specification du langage l'exige. Cinq nappes
  // suffisent ; au-dela, le fond disparait et les croisements avec lui.
  for (int i = 0; i < 5; i += 1) {
    if (i >= nappes) break;
    float fi = float(i);
    float h1 = nappeHash(fi + 1.0);
    float h2 = nappeHash(fi + 17.0);

    // Le repere propre : chaque nappe est tournee d'un angle qui derive.
    float angle = (fi / max(float(nappes), 1.0)) * 2.4 - 1.2 + sin(t * 0.3 + h1 * 6.28) * 0.25;
    vec2 q = vec2(
      cos(angle) * p.x - sin(angle) * p.y,
      sin(angle) * p.x + cos(angle) * p.y
    );

    // La courbe : deux sinus, et un decalage vertical propre a la nappe.
    float centre = (h2 - 0.5) * 0.5
      + uBend * (0.25 * sin(q.x * 2.2 + t * (0.8 + h1 * 0.5) + h2 * 6.28)
      + 0.12 * sin(q.x * 4.7 - t * (0.6 + h2 * 0.4)));

    float d = abs(q.y - centre);
    float nappe = 1.0 - smoothstep(epaisseur - 0.04, epaisseur + 0.02, d);
    float bord = smoothstep(epaisseur - 0.05, epaisseur - 0.02, d) * nappe;

    vec3 teinte = mix(uColorB, uColorC, fi / max(float(nappes) - 1.0, 1.0));
    colour = mix(colour, teinte, nappe * 0.8);
    couverture += nappe;
    liseret = max(liseret, bord);
  }

  // Le croisement : l'exces de couverture devient un eclat, borne.
  float eclat = smoothstep(1.1, 2.2, couverture);
  colour += mix(uColorB, uColorC, 0.5) * eclat * 0.3;
  colour = mix(colour, uColorC, liseret * 0.35);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
