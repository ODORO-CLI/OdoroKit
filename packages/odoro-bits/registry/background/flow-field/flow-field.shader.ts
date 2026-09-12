/**
 * Shader du champ de flux.
 *
 * ## L'idee mathematique
 *
 * Un champ de vitesse sans divergence — le gradient tourne d'un quart de tour
 * d'un bruit de valeur — et des particules qui le suivent. Aucune simulation :
 * chaque fragment remonte le champ a contre-courant, pas a pas, et regarde si
 * une graine vit en amont. Une graine est une cellule d'une grille dont le
 * hachage passe un seuil ; sa particule nait a la graine, avance d'un pas par
 * unite d'age, et traine derriere elle une queue qui s'eteint.
 *
 * Remonter le champ depuis le fragment donne le meme chemin que le descendre
 * depuis la graine, a l'erreur d'integration pres : c'est ce qui permet de
 * dessiner la trajectoire sans jamais la stocker.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la trainee.
 * - `uColorC` — la tete de la particule.
 * - `uScale` — frequence du bruit, donc la taille des tourbillons.
 * - `uSpeed` — vitesse des particules.
 * - `uDensity` — part des cellules qui portent une graine.
 * - `uTrail` — longueur de la queue, en pas.
 * - `uSteps` — nombre de pas remontes par fragment, donc la portee.
 */
export const FLOW_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uScale;
uniform float uSpeed;
uniform float uDensity;
uniform float uTrail;
uniform float uSteps;

// Plafond des pas remontes : la boucle est bornee par une constante, le
// reglage ne fait que la raccourcir.
const int MAX_STEPS = 24;

// Pas d'integration, en hauteurs de cadre.
const float STEP = 0.011;

// Taille des cellules de graines : un peu plus large que le pas, pour qu'un
// chemin ne saute jamais une cellule qu'il traverse.
const float CELLS = 44.0;

// Projection sur une direction arbitraire, sinus amplifie, partie
// fractionnaire. Le hachage par produit des coordonnees, plus court, laisse
// des traces en diagonale que le champ aligne en un rail de particules.
float fluxHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur 2D, interpolation lissee entre quatre tirages.
float fluxNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);
  float a = fluxHash(cell);
  float b = fluxHash(cell + vec2(1.0, 0.0));
  float c = fluxHash(cell + vec2(0.0, 1.0));
  float d = fluxHash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Le champ : gradient du bruit tourne d'un quart de tour. Un tel champ n'a
// pas de divergence, donc les particules ne s'accumulent ni ne se vident
// nulle part — elles tournent.
vec2 fluxChamp(vec2 p) {
  vec2 derive = vec2(uTime * 0.05, -uTime * 0.035);
  vec2 q = p * uScale + derive;
  float e = 0.03;
  float centre = fluxNoise(q);
  float droite = fluxNoise(q + vec2(e, 0.0));
  float haut = fluxNoise(q + vec2(0.0, e));
  vec2 gradient = vec2(droite - centre, haut - centre) / e;
  vec2 champ = vec2(gradient.y, -gradient.x);
  return champ / max(length(champ), 0.25);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  int steps = int(clamp(uSteps, 2.0, float(MAX_STEPS)));
  float portee = float(steps) + uTrail;

  vec2 q = p;
  float queue = 0.0;
  float tete = 0.0;

  for (int i = 0; i < MAX_STEPS; i += 1) {
    if (i >= steps) break;
    vec2 direction = fluxChamp(q);
    q -= direction * STEP;

    vec2 cell = floor(q * CELLS);
    float tirage = fluxHash(cell);
    if (tirage > uDensity) continue;

    // La graine est un point precis de sa cellule ; la trace n'est allumee
    // qu'a l'ecart perpendiculaire pres, sinon toute la cellule s'allumerait
    // en ruban.
    vec2 graine = (cell + 0.5 + (vec2(fluxHash(cell + 3.1), fluxHash(cell + 7.7)) - 0.5) * 0.8) / CELLS;
    vec2 ecart = q - graine;
    float perpendiculaire = abs(ecart.x * direction.y - ecart.y * direction.x);
    float profil = exp(-perpendiculaire * perpendiculaire * 60000.0);

    // L'age de la particule avance avec le temps ; sa tete est a "age" pas de
    // la graine, et le fragment est a "i" pas : la difference dit ou l'on est
    // sur la queue.
    float phase = fract(uTime * uSpeed * 0.28 + fluxHash(cell + 11.3));
    float age = phase * portee;
    float derriere = age - float(i);
    float vivant = step(0.0, derriere) * (1.0 - smoothstep(0.0, uTrail, derriere));

    queue = max(queue, vivant * profil);
    tete = max(tete, vivant * profil * exp(-derriere * 1.6));
  }

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, queue * 0.85);
  colour += uColorC * tete * 0.9;

  // Vignette discrete, pour que la nappe ne soit pas un papier peint.
  float bord = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour = mix(colour, uColorA, smoothstep(0.55, 1.1, bord) * 0.3);

  gl_FragColor = vec4(colour, 1.0);
}
`
