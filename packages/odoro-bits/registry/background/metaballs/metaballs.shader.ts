/**
 * Shader des metaballs.
 *
 * ## L'idee mathematique
 *
 * Chaque boule emet un champ en r2/d2 ; la somme des champs est seuillee par
 * un smoothstep etroit, si bien que deux boules qui s'approchent se rejoignent
 * par un col avant de fusionner — sans qu'aucun code ne les recolle.
 *
 * Ce qui distingue ce fond d'un simple seuillage, c'est l'eclairage : le
 * gradient du champ, obtenu par deux lectures decalees, sert de normale. Une
 * lumiere fixe donne alors un diffus et un reflet, et la matiere passe de
 * l'aplat au gel. Le cout est de trois sommes au lieu d'une, ce qui reste
 * borne par le nombre de boules.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte du gel.
 * - `uColorC` — le reflet.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uSpeed` — vitesse de derive des boules.
 * - `uCount` — nombre de boules libres.
 * - `uThreshold` — seuil du champ.
 * - `uGloss` — force du reflet.
 */
export const METABALLS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uCount;
uniform float uThreshold;
uniform float uGloss;

// Nombre pseudo-aleatoire d'un indice : sinus amplifie, partie fractionnaire.
float boulesHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Centre de la boule i : une courbe de Lissajous a periodes tirees de
// l'indice, jamais multiples entre elles, pour que l'orbite ne se referme pas.
vec2 boulesCentre(float i, float t, float aspect) {
  float h1 = boulesHash(i + 1.0);
  float h2 = boulesHash(i + 11.0);
  float h3 = boulesHash(i + 23.0);
  vec2 c = vec2(
    0.5 + 0.38 * sin(t * (0.4 + h1 * 0.5) + h2 * 6.2831),
    0.5 + 0.34 * cos(t * (0.3 + h3 * 0.6) + h1 * 6.2831)
  );
  return c * vec2(aspect, 1.0);
}

// Somme des champs : les boules libres, puis celle du pointeur.
float boulesChamp(vec2 p, float t, float aspect, int count, vec2 m) {
  float total = 0.0;

  // Borne constante : la specification du langage l'exige. Douze boules
  // suffisent ; au-dela, elles se recouvrent et le motif se perd.
  for (int i = 0; i < 12; i += 1) {
    if (i >= count) break;
    float fi = float(i);
    vec2 c = boulesCentre(fi, t, aspect);
    float r = 0.09 + 0.07 * boulesHash(fi + 41.0);
    vec2 d = p - c;
    total += r * r / max(dot(d, d), 0.0001);
  }

  vec2 dm = p - m;
  total += 0.02 / max(dot(dm, dm), 0.0001);

  return total;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int count = int(clamp(uCount, 1.0, 12.0));

  // Trois lectures du champ : la valeur, et deux decalages pour le gradient.
  float e = 0.004;
  float f = boulesChamp(p, t, aspect, count, m);
  float fx = boulesChamp(p + vec2(e, 0.0), t, aspect, count, m);
  float fy = boulesChamp(p + vec2(0.0, e), t, aspect, count, m);

  // La matiere : un seuil etroit, pour un bord net mais sans crenelage.
  float seuil = max(uThreshold, 0.1);
  float corps = smoothstep(seuil - 0.12, seuil + 0.12, f);

  // La normale : le gradient du champ ecrase, releve d'une composante
  // verticale. Pres du bord, le gradient domine et la surface se couche ; au
  // coeur, elle regarde la camera. C'est ce qui bombe les boules.
  vec2 grad = vec2(fx - f, fy - f) / e;
  vec3 n = normalize(vec3(-grad * 0.06, 1.0));

  vec3 lumiere = normalize(vec3(-0.45, 0.55, 0.7));
  float diffus = max(dot(n, lumiere), 0.0);
  vec3 vue = vec3(0.0, 0.0, 1.0);
  vec3 h = normalize(lumiere + vue);
  float reflet = pow(max(dot(n, h), 0.0), 40.0) * uGloss;

  // Le bord : la ou la normale se couche, une lisiere plus claire, comme sur
  // un gel translucide vu de face.
  float lisiere = pow(1.0 - max(n.z, 0.0), 1.5) * 0.5;

  vec3 gel = uColorB * (0.55 + 0.45 * diffus);
  gel = mix(gel, uColorC, lisiere);
  gel += uColorC * reflet;

  // Une ombre douce sous les boules, qui les decolle du fond.
  float ombre = smoothstep(seuil * 0.45, seuil, f) * 0.18;
  vec3 fond = uColorA * (1.0 - ombre);

  gl_FragColor = vec4(mix(fond, gel, corps), 1.0);
}
`
