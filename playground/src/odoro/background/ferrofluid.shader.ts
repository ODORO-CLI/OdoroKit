/**
 * Shader du ferrofluide.
 *
 * ## L'idee mathematique
 *
 * Un ferrofluide sous un aimant se herisse de pics ranges en reseau
 * hexagonal. Le reseau vient de trois cosinus a cent vingt degres : leur
 * somme a ses maxima sur un pave hexagonal, sans qu'aucune cellule ne soit
 * calculee. Une puissance de cette somme fait les cones ; son exposant croit
 * avec la proximite de l'aimant, si bien que les bosses molles au loin
 * deviennent des aiguilles sous le pointeur.
 *
 * L'influence de l'aimant est une gaussienne de la distance au pointeur.
 * Elle fait deux choses : elle dresse les pics, et elle attire la flaque —
 * le bord du fluide, un seuil sur la meme gaussienne perturbe d'un bruit,
 * suit l'aimant.
 *
 * Le rendu est celui d'un relief : la hauteur est evaluee trois fois, et
 * son gradient sert de normale. Un fluide noir et brillant ne se voit que
 * par ses reflets, et c'est la normale qui les place.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le plateau, sous la flaque.
 * - `uColorB` — le fluide.
 * - `uColorC` — le reflet.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uSpikes` — nombre de pics par hauteur de cadre.
 * - `uReach` — portee de l'aimant.
 * - `uHeight` — hauteur des pics.
 * - `uGloss` — force du reflet.
 * - `uDetail` — bruit du bord de la flaque, 0 ou 1.
 */
export const FERROFLUID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpikes;
uniform float uReach;
uniform float uHeight;
uniform float uGloss;
uniform float uDetail;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float ferroHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float ferroNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = ferroHash(cell);
  float b = ferroHash(cell + vec2(1.0, 0.0));
  float c = ferroHash(cell + vec2(0.0, 1.0));
  float d = ferroHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Le reseau hexagonal : trois cosinus a cent vingt degres, ramenes sur
// [0, 1]. Leurs maxima communs sont les sommets d'un pave hexagonal.
float ferroReseau(vec2 p) {
  vec2 d0 = vec2(1.0, 0.0);
  vec2 d1 = vec2(-0.5, 0.8660254);
  vec2 d2 = vec2(-0.5, -0.8660254);
  float somme = cos(dot(p, d0)) + cos(dot(p, d1)) + cos(dot(p, d2));
  return clamp(somme / 3.0 * 0.5 + 0.5, 0.0, 1.0);
}

// Le relief : la flaque, et les pics qui s'y dressent.
float ferroRelief(vec2 p, vec2 m, float reach, float frequence, float t) {
  vec2 d = p - m;
  float influence = exp(-dot(d, d) / (reach * reach));

  // Le bord de la flaque : un seuil sur l'influence, perturbe d'un bruit
  // lent pour qu'il ne soit pas un cercle.
  float bord = influence + (ferroNoise(p * 6.0 + t * 0.2) - 0.5) * 0.12 * uDetail;
  float flaque = smoothstep(0.08, 0.3, bord);

  // Les pics : bosses molles loin de l'aimant, aiguilles dessous. Le reseau
  // tourne d'un rien avec le temps, pour que le fluide semble vivant.
  float angle = t * 0.05;
  vec2 q = mat2(cos(angle), -sin(angle), sin(angle), cos(angle)) * (p * frequence);
  float reseau = ferroReseau(q);
  float acuite = mix(1.5, 9.0, influence);
  float pics = pow(reseau, acuite) * influence * uHeight;

  return flaque * (0.12 + pics);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float reach = max(uReach, 0.02);
  float frequence = max(uSpikes, 1.0) * 3.6276;

  // Trois evaluations du relief : la valeur, et deux decalages pour le
  // gradient qui servira de normale.
  float e = 0.003;
  float h = ferroRelief(p, m, reach, frequence, uTime);
  float hx = ferroRelief(p + vec2(e, 0.0), m, reach, frequence, uTime);
  float hy = ferroRelief(p + vec2(0.0, e), m, reach, frequence, uTime);

  vec2 grad = vec2(hx - h, hy - h) / e;
  vec3 n = normalize(vec3(-grad * 0.12, 1.0));

  // Le masque de la flaque, relu sans les pics : la ou le relief est nul, il
  // n'y a pas de fluide, seulement le plateau.
  float fluide = smoothstep(0.0, 0.02, h);

  vec3 lumiere = normalize(vec3(-0.5, 0.6, 0.65));
  float diffus = max(dot(n, lumiere), 0.0);
  vec3 vue = vec3(0.0, 0.0, 1.0);
  vec3 moitie = normalize(lumiere + vue);
  float reflet = pow(max(dot(n, moitie), 0.0), 60.0) * uGloss;

  // Le fluide : sombre, un diffus discret, un reflet vif sur les aretes, et
  // un lisere la ou la surface se couche — c'est la que le noir brille.
  float lisiere = pow(1.0 - max(n.z, 0.0), 2.0);
  vec3 corps = uColorB * (0.35 + 0.35 * diffus);
  corps = mix(corps, uColorC, lisiere * 0.45);
  corps += uColorC * reflet;

  // Le plateau : une ombre douce sous la flaque, qui la decolle.
  vec2 dm = p - m;
  float ombre = exp(-dot(dm, dm) / (reach * reach * 2.5)) * 0.15;
  vec3 plateau = uColorA * (1.0 - ombre);

  gl_FragColor = vec4(mix(plateau, corps, fluide), 1.0);
}
`
