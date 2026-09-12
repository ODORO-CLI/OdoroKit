/**
 * Shader de la boule plasma.
 *
 * ## L'idee mathematique
 *
 * Tout se passe en coordonnees polaires autour du centre du globe. Chaque
 * filament est une courbe angle = f(rayon) : un angle de base qui derive
 * lentement, plus une ondulation qui grandit avec le rayon — pres de
 * l'electrode centrale les filaments sont droits, pres du verre ils
 * serpentent. La distance d'un fragment a un filament est la difference
 * angulaire fois le rayon, c'est-a-dire une longueur d'arc : le trait garde
 * la meme epaisseur du centre au bord.
 *
 * Le filament principal est attire par le pointeur quand celui-ci touche le
 * globe, comme un doigt sur le verre ; les autres palissent. Chaque filament
 * scintille par rehachage du temps, et finit sur le verre en un point chaud.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la lueur des filaments et du verre.
 * - `uColorC` — le coeur des filaments et l'electrode.
 * - `uPointer` — position amortie du pointeur, centree, entre -1 et 1, y vers le bas.
 * - `uFilaments` — nombre de filaments.
 * - `uRadius` — rayon du globe, en hauteurs de cadre.
 * - `uSpeed` — vitesse de derive et d'ondulation.
 * - `uPull` — force avec laquelle le pointeur attire le filament principal.
 */
export const PLASMA_BALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uFilaments;
uniform float uRadius;
uniform float uSpeed;
uniform float uPull;

const float PI = 3.14159265359;
const float TAU = 6.28318530718;

// Plafond des filaments : la boucle est bornee par une constante.
const int MAX_FILAMENTS = 10;

float boulHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float boulNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(boulHash(cell), boulHash(cell + 1.0), smoothed);
}

// Difference angulaire ramenee dans [-pi, pi].
float boulEcartAngle(float a, float b) {
  return mod(a - b + PI, TAU) - PI;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 m = vec2(uPointer.x * aspect, -uPointer.y) * 0.5;

  float rayon = max(uRadius, 0.05);
  float r = length(p);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;
  int total = int(clamp(uFilaments, 1.0, float(MAX_FILAMENTS)));

  // Le doigt sur le verre : pres du globe, le pointeur attire le premier
  // filament, et d'autant plus qu'il est proche.
  float toucher = smoothstep(rayon * 1.5, rayon * 0.7, length(m)) * uPull;
  float angleDoigt = atan(m.y, m.x);

  // Rehachage a vingt-quatre images par seconde : le scintillement.
  float image = floor(uTime * 24.0);

  float coeur = 0.0;
  float lueur = 0.0;
  float chaud = 0.0;

  for (int i = 0; i < MAX_FILAMENTS; i += 1) {
    if (i >= total) break;
    float indice = float(i);
    float graine = boulHash(indice * 3.1 + 0.7);

    // L'angle de base derive lentement, chacun a son rythme.
    float base = indice * TAU / float(total) + (boulNoise(t * 0.3 + graine * 40.0) - 0.5) * 2.4;

    // Le premier filament cede au doigt.
    float attire = toucher * step(indice, 0.5);
    base = base + boulEcartAngle(angleDoigt, base) * attire;

    // L'ondulation croit avec le rayon : droit au centre, serpentin au bord.
    float onde = (boulNoise(r * 9.0 + t * 1.6 + graine * 60.0) - 0.5) * 1.6
      + (boulNoise(r * 23.0 - t * 2.4 + graine * 17.0) - 0.5) * 0.5;
    float courbe = base + onde * r / rayon * (1.0 - attire * 0.6);

    // Longueur d'arc jusqu'a la courbe : le trait garde son epaisseur.
    float d = abs(boulEcartAngle(angle, courbe)) * r;

    float scintille = 0.65 + 0.35 * boulHash(image + indice * 7.0);
    // Les autres filaments palissent quand le doigt en tient un.
    float poids = scintille * mix(1.0, 0.35, toucher * (1.0 - attire)) * (1.0 + attire * 0.8);
    // Le filament vit de l'electrode au verre, et pas au-dela.
    float dedans = smoothstep(rayon + 0.004, rayon - 0.006, r);

    coeur = max(coeur, exp(-d * 240.0) * poids * dedans);
    lueur = max(lueur, exp(-d * d * 1400.0) * poids * dedans);

    // Le point chaud, la ou le filament touche le verre.
    vec2 bout = vec2(cos(courbe), sin(courbe)) * rayon;
    chaud = max(chaud, exp(-dot(p - bout, p - bout) * 2500.0) * poids);
  }

  // L'electrode centrale : une boule de lumiere.
  float electrode = exp(-r * r * 1800.0) + exp(-r * 22.0) * 0.5;

  // Le verre : un lisere a la peripherie, et une buee qui s'epaissit vers le
  // bord, comme un reflet sur une sphere.
  float verre = exp(-pow(abs(r - rayon) * 90.0, 2.0)) * 0.7;
  float buee = smoothstep(rayon, rayon - 0.02, r) * pow(clamp(r / rayon, 0.0, 1.0), 4.0) * 0.12;
  float halo = smoothstep(rayon + 0.25, rayon, r) * step(rayon, r) * 0.06;

  // Du fond vers la lueur, puis vers le coeur : chaque couche est fondue
  // dans la precedente. Les ajouter saturerait en blanc sur un theme clair.
  vec3 colour = uColorA;
  colour = mix(colour, uColorB, clamp(buee + halo + verre * 0.6 + lueur * 0.7, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(coeur * 0.95 + chaud * 0.9 + electrode * 0.8, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
