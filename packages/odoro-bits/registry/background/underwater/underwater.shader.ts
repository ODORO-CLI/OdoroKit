/**
 * Shader des rais sous l'eau.
 *
 * ## L'idee mathematique
 *
 * La lumiere entre par la surface, au-dessus du cadre : les rais convergent
 * vers un point place au-dela du bord haut, si bien qu'ils sont presque
 * paralleles mais s'ouvrent legerement en descendant, comme sous une surface
 * reelle. Leur intensite est un bruit 1D de l'angle en deux harmoniques,
 * dont les phases ondulent — la surface bouge, les rais se balancent — et
 * ils s'eteignent avec la profondeur.
 *
 * Les bulles montent par colonnes : une par cellule, sa taille, sa cadence
 * et son balancement tires de l'indice de la colonne. Chacune est un anneau
 * fin et un point de reflet decale vers la lumiere — c'est ce point qui fait
 * la bulle, un anneau seul n'est qu'un cercle. Deux profondeurs, la
 * lointaine plus petite et plus lente.
 *
 * La profondeur teinte le bas du cadre par melange borne : l'eau colore un
 * fond clair sans le noircir.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la lumiere des rais et des bulles.
 * - `uColorC` — la teinte de la profondeur.
 * - `uSpeed` — vitesse du balancement et de la montee.
 * - `uRays` — nombre de rais sur la largeur.
 * - `uBubbles` — nombre de colonnes de bulles sur la hauteur ; zero les supprime.
 */
export const UNDERWATER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRays;
uniform float uBubbles;

float eauHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Une profondeur de bulles : une colonne par cellule, une bulle par colonne.
float bulles(vec2 p, float t, float density, float taille, float graine) {
  float x = p.x * density + graine;
  float colonne = floor(x);
  float h1 = eauHash(vec2(colonne, graine));
  float h2 = eauHash(vec2(colonne + 5.3, graine * 2.1));
  float h3 = eauHash(vec2(colonne + 11.7, graine * 3.3));

  // Une colonne sur deux est vide : une nuee reguliere se lirait comme une
  // grille.
  float active = step(0.45, h1);

  // La montee, bouclee ; le balancement, un sinus de la hauteur.
  float y = fract(t * (0.06 + 0.08 * h2) + h1) * 1.3 - 0.15;
  // Le balancement reste dans la cellule, rayon compris : une bulle coupee
  // au bord d'une colonne trahirait la grille.
  float cx = 0.5 + 0.12 * sin(y * 9.0 + h3 * 6.2831853);
  float rayon = taille * (0.5 + 0.5 * h3) / density;

  vec2 centre = vec2((colonne - graine + cx) / density, y);
  float d = length(p - centre);

  float e = (d - rayon) / (rayon * 0.28);
  float anneau = exp(-e * e);

  vec2 reflet = centre + vec2(-rayon * 0.35, rayon * 0.4);
  vec2 dr = p - reflet;
  float point = exp(-dot(dr, dr) / (rayon * rayon * 0.06));

  return active * (anneau * 0.6 + point * 0.9);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  // La profondeur : la teinte s'epaissit vers le bas, sans jamais depasser
  // la moitie — le texte pose dessus reste lisible.
  float profondeur = 1.0 - vUv.y;
  vec3 colour = mix(uColorA, uColorC, 0.12 + 0.38 * profondeur);

  // Les rais : ils convergent vers la surface, au-dessus du cadre, et se
  // balancent parce que leurs phases ondulent.
  vec2 surface = vec2(aspect * 0.5, 1.9);
  vec2 ecart = p - surface;
  float angle = atan(ecart.x, -ecart.y);
  float n = max(uRays, 1.0);
  float rai = 0.5 + 0.5 * sin(angle * n * 4.0 + 0.6 * sin(t * 0.7 + angle * 7.0) + t * 0.25);
  rai = rai * 0.6 + 0.4 * (0.5 + 0.5 * sin(angle * n * 9.0 - t * 0.4 + 0.8 * cos(t * 0.5)));
  rai = pow(rai, 3.0);
  float lumiere = rai * (0.25 + 0.75 * vUv.y) * smoothstep(0.0, 0.85, vUv.y);
  colour = mix(colour, uColorB, clamp(lumiere * 0.8, 0.0, 1.0));

  // Les bulles, sur deux profondeurs ; la lointaine plus petite et plus lente.
  float density = uBubbles;
  if (density >= 0.5) {
    float nuee = bulles(p, t, density, 0.36, 0.0);
    nuee += 0.55 * bulles(p, t * 0.7, density * 1.7, 0.24, 0.43);
    colour = mix(colour, uColorB, clamp(nuee, 0.0, 1.0) * 0.9);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
