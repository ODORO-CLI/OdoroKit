/**
 * Shader des carres acides.
 *
 * ## L'idee mathematique
 *
 * Dans chaque cellule, des carres concentriques de taille decroissante, du
 * plus grand au plus petit. Chacun tourne autour du centre commun un peu
 * plus vite que celui qui l'enferme, et part avec un decalage angulaire
 * fixe sur lui : vus ensemble, ils forment une spirale carree qui semble
 * se visser sur elle-meme.
 *
 * Le fragment est peint par le plus petit carre qui le contient — la boucle
 * va du plus grand au plus petit et ecrase la couleur a chaque fois. Les
 * teintes alternent d'un carre a l'autre, et les cellules voisines tournent
 * en sens contraire : deux cellules cote a cote ne se lisent pas comme une
 * meme texture repetee.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB`, `uColorC` — les deux teintes alternees.
 * - `uSpeed` — vitesse de rotation du carre exterieur.
 * - `uRings` — nombre de carres imbriques, et donc le cout.
 * - `uDensity` — nombre de cellules sur la hauteur.
 * - `uTwist` — decalage angulaire entre deux carres voisins, en radians.
 */
export const ACID_SQUARES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRings;
uniform float uDensity;
uniform float uTwist;

vec2 acidRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  // Les cellules sont centrees sur le cadre : une seule cellule tient au
  // milieu, plusieurs se repartissent autour.
  vec2 p = (vec2(vUv.x * aspect, vUv.y) - vec2(aspect, 1.0) * 0.5) * scale;
  vec2 cell = floor(p + 0.5);
  vec2 local = p - cell;

  // Les cellules voisines tournent en sens contraire.
  float direction = mod(cell.x + cell.y, 2.0) < 0.5 ? 1.0 : -1.0;
  float t = uTime * uSpeed * direction;

  int rings = int(clamp(uRings, 1.0, 14.0));
  float px = scale / max(uResolution.y, 1.0) * 1.5;

  vec3 colour = uColorA;

  // Bornes constantes : la specification du langage l'exige ; la qualite
  // sort plus tot. Du plus grand au plus petit : le dernier qui contient le
  // fragment est celui qui le peint.
  for (int i = 0; i < 14; i += 1) {
    if (i >= rings) break;
    float fi = float(i);
    float size = 0.5 * (1.0 - fi / float(rings)) * 0.96;
    float angle = t * (1.0 + fi * 0.35) + fi * uTwist;

    vec2 q = acidRotate(local, angle);
    float d = max(abs(q.x), abs(q.y));

    float inside = 1.0 - smoothstep(size - px, size + px, d);
    vec3 tint = mod(fi, 2.0) < 0.5 ? uColorB : uColorC;
    // Le carre s'assombrit vers son bord : chaque anneau se lit en relief.
    float depth = 0.75 + 0.25 * smoothstep(size, size * 0.6, d);
    colour = mix(colour, tint * depth, inside);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
