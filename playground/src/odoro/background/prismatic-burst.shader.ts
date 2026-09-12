/**
 * Shader de l'eclat prismatique.
 *
 * ## L'idee mathematique
 *
 * Des rais radiaux, comme les rayons crepusculaires, mais tout ce qui les
 * distingue tient en trois choses. Ils tournent : le bruit angulaire est lu
 * sur un angle qui derive. Ils changent de teinte sur le tour : la couleur
 * de chaque rai est prise entre deux tokens selon un sinus de l'angle, ce
 * qui fait plusieurs cycles de teinte autour du foyer. Et ils pulsent : des
 * anneaux partent du foyer et s'eloignent, en relevant les rais qu'ils
 * traversent.
 *
 * Le bruit angulaire reste une somme de sinus de frequences entieres, pour
 * que le tour se referme sans couture.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte des rais.
 * - `uColorC` — la seconde teinte des rais, et le foyer.
 * - `uX`, `uY` — position du foyer, en fraction du cadre.
 * - `uSpokes` — nombre de rais sur le tour.
 * - `uSpeed` — vitesse de rotation et des pulsations.
 * - `uBurst` — force des anneaux qui partent du foyer.
 * - `uDetail` — nombre d'harmoniques du bruit angulaire, et donc son cout.
 */
export const PRISMATIC_BURST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uSpokes;
uniform float uSpeed;
uniform float uBurst;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 foyer = vec2(uX * aspect, uY);
  float t = uTime * uSpeed;

  vec2 ecart = p - foyer;
  float rayon = length(ecart);
  float angle = atan(ecart.y, ecart.x) + t * 0.15;

  float f1 = max(floor(uSpokes), 2.0);
  float f2 = floor(f1 * 1.7) + 1.0;
  float f3 = floor(f1 * 2.6) + 2.0;
  int harmoniques = int(clamp(uDetail, 1.0, 3.0));

  // Le bruit angulaire, sur un angle qui derive : les rais tournent.
  float faisceau = 0.5 + 0.5 * sin(angle * f1);
  if (harmoniques >= 2) {
    faisceau = faisceau * 0.65 + (0.5 + 0.5 * sin(angle * f2 - t * 0.6)) * 0.35;
  }
  if (harmoniques >= 3) {
    faisceau = faisceau * 0.75 + (0.5 + 0.5 * sin(angle * f3 + t * 0.4)) * 0.25;
  }
  float profil = pow(faisceau, 3.0);

  // La teinte : trois cycles sur le tour, et un cycle radial plus lent, pour
  // que la couleur d'un rai change aussi le long de sa longueur.
  float cycle = 0.5 + 0.5 * sin(angle * 3.0 + t * 0.5);
  float cycleRadial = 0.5 + 0.5 * sin(rayon * 5.0 - t * 1.2);
  vec3 teinte = mix(uColorB, uColorC, mix(cycle, cycleRadial, 0.35));

  // Les anneaux : une puissance d'un sinus de la distance, qui s'eloigne.
  float anneau = pow(0.5 + 0.5 * sin(rayon * 11.0 - t * 2.5), 5.0) * uBurst;

  float attenuation = exp(-rayon * 1.5);
  float intensite = profil * attenuation * (0.7 + 0.8 * anneau);
  float coeur = exp(-rayon * rayon * 40.0);

  vec3 colour = mix(uColorA, teinte, clamp(intensite, 0.0, 1.0));
  colour = mix(colour, uColorC, coeur * 0.8);
  colour += teinte * anneau * profil * attenuation * 0.25;
  colour += uColorC * coeur * 0.3;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
