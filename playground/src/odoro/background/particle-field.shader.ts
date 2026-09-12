/**
 * Shader du champ de particules.
 *
 * ## L'idee mathematique
 *
 * Une particule par cellule d'une grille hachee, sur deux couches d'echelle
 * differente pour la profondeur. Chaque couche glisse dans une direction
 * propre, et chaque particule orbite doucement autour de son point d'attache
 * sur deux sinus de frequences non multiples : la derive ne se repete jamais
 * a l'oeil.
 *
 * Au repos, les particules sont eteintes aux trois quarts. L'eclat vient du
 * pointeur : une fenetre douce autour de sa position amortie rend a chaque
 * particule qu'elle couvre sa pleine lumiere, et la tire vers la teinte
 * d'eclat. C'est la position de la particule qui est testee, pas celle du
 * fragment — l'eclat s'allume par particule entiere, il ne decoupe pas un
 * disque net dans le champ.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les particules au repos.
 * - `uColorC` — l'eclat sous le pointeur.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uSpeed` — vitesse de la derive.
 * - `uDensity` — nombre de cellules sur la hauteur, pour la couche proche.
 * - `uRadius` — rayon de l'eclat, en hauteurs de cadre.
 * - `uLayers` — nombre de couches evaluees, et donc le cout.
 */
export const PARTICLE_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uDensity;
uniform float uRadius;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float champHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule.
vec2 champHash2(vec2 p) {
  return vec2(champHash(p), champHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 m = uPointer * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 2.0));

  vec3 colour = uColorA;

  // Deux couches : la proche est plus lache et plus grosse, la lointaine plus
  // serree et plus fine. Bornes constantes, sortie anticipee par la qualite.
  for (int layer = 0; layer < 2; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.8);

    // Chaque couche derive dans sa propre direction, la lointaine plus lentement.
    vec2 drift = vec2(0.07 - depth * 0.05, 0.04 + depth * 0.02) * t;
    vec2 p = uv * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 voisine = cell + vec2(float(dx), float(dy));
        vec2 graine = champHash2(voisine + depth * 53.0);

        vec2 centre = voisine + 0.5
          + 0.32 * vec2(sin(t * 0.61 + graine.x * 6.28318), cos(t * 0.47 + graine.y * 6.28318));

        // La position de la particule en coordonnees de cadre, pour la
        // comparer au pointeur : l'eclat s'allume par particule entiere.
        vec2 world = (centre - drift) / scale;
        float boost = 1.0 - smoothstep(0.0, max(uRadius, 0.01), length(world - m));

        float d = length(p - centre);
        float size = (0.05 + 0.05 * graine.x) * (1.0 - depth * 0.4);
        float halo = exp(-d * d / (size * size));

        // Au repos, un quart de la lumiere ; sous le pointeur, tout.
        float lumiere = mix(0.25, 1.4, boost) * (1.0 - depth * 0.35);
        vec3 teinte = mix(uColorB, uColorC, boost);
        colour += teinte * halo * lumiere;
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
