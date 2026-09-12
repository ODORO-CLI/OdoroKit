/**
 * Shader du reflet d'objectif.
 *
 * ## L'idee mathematique
 *
 * Une source ponctuelle au pointeur : un coeur gaussien net, un halo
 * exponentiel, et une strie anamorphique — etiree en largeur, mince en
 * hauteur — comme en laisse une lentille cylindrique. Les fantomes sont la
 * signature du reflet : des disques et des anneaux alignes sur la droite qui
 * joint la source au centre du cadre, chacun a une position et une taille
 * tirees de son indice, en teintes alternees. Un grand anneau d'iris ferme
 * la chaine du cote oppose a la source.
 *
 * Tout se pose par melange borne vers les teintes : sur un fond clair, le
 * reflet colore au lieu de blanchir.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte chaude : source, strie, fantomes pairs.
 * - `uColorC` — la teinte froide : fantomes impairs, anneau d'iris.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uIntensity` — intensite globale du reflet.
 * - `uGhosts` — nombre de fantomes le long de l'axe.
 * - `uStreak` — longueur de la strie anamorphique, en hauteurs de cadre.
 */
export const LENS_FLARE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uIntensity;
uniform float uGhosts;
uniform float uStreak;

// Un fantome : un disque doux et un anneau plus vif a son bord.
float fantome(vec2 p, vec2 centre, float rayon) {
  float d = length(p - centre);
  float disque = 1.0 - smoothstep(rayon * 0.6, rayon, d);
  float e = (d - rayon) / (rayon * 0.18);
  float anneau = exp(-e * e);
  return disque * 0.3 + anneau * 0.55;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 source = uPointer * vec2(aspect, 1.0);
  vec2 centre = vec2(aspect * 0.5, 0.5);
  int n = int(clamp(uGhosts, 0.0, 6.0));

  // Une respiration lente : un reflet parfaitement fixe a l'air peint.
  float souffle = 0.92 + 0.08 * sin(uTime * 1.3);
  float force = max(uIntensity, 0.0) * souffle;

  vec2 d = p - source;
  float r = length(d);

  // La source : coeur net, halo sans fin.
  float coeur = exp(-r * r * 140.0);
  float halo = exp(-r * 3.5) * 0.5;

  // La strie anamorphique : mince en hauteur, longue en largeur.
  float longueur = max(uStreak, 0.02);
  float strie = exp(-d.y * d.y * 4000.0) * exp(-abs(d.x) / longueur * 1.5) * 0.7;

  // Les fantomes : le long de l'axe source -> centre, de part et d'autre du
  // centre, en teintes alternees. Plus la source est proche du centre, plus
  // la chaine se resserre — comme dans une vraie lentille.
  vec2 axe = centre - source;
  float chauds = 0.0;
  float froids = 0.0;
  for (int i = 0; i < 6; i += 1) {
    if (i >= n) break;
    float k = -0.5 + float(i) * 0.45;
    float h = fract(float(i) * 0.618 + 0.13);
    vec2 g = centre + axe * k;
    float rayon = 0.025 + 0.045 * h;
    float valeur = fantome(p, g, rayon) * (0.5 + 0.5 * h);
    if (fract(float(i) * 0.5) < 0.25) {
      chauds += valeur;
    } else {
      froids += valeur;
    }
  }

  // L'anneau d'iris : grand, fin, a l'oppose de la source.
  vec2 iris = centre + axe * 1.1;
  float ei = (length(p - iris) - 0.32) / 0.018;
  float anneau = exp(-ei * ei) * 0.35;

  vec3 colour = mix(uColorA, uColorB, clamp((halo + strie + chauds * 0.6) * force, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp((froids * 0.6 + anneau) * force, 0.0, 1.0));

  // Le coeur : la teinte chaude pleine, puis un lavage vers la froide qui
  // fait le point blanc sans ecrire de blanc.
  colour = mix(colour, uColorB, clamp(coeur * force, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(coeur * force * 0.45, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
