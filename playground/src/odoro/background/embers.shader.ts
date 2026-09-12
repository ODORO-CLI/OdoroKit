/**
 * Shader des braises.
 *
 * ## L'idee mathematique
 *
 * Une braise par cellule d'une grille hachee, sur trois couches de
 * profondeur. La grille descend — chaque colonne a sa vitesse propre — donc
 * les braises montent, a des rythmes voisins mais jamais identiques. Chacune
 * se balance lateralement sur un sinus de phase hachee.
 *
 * Ce qui distingue une braise d'un flocon inverse, c'est qu'elle s'eteint :
 * sa lumiere est une fonction de sa hauteur dans le cadre, pleine en bas,
 * nulle avant le haut. Elle est calculee sur la position de la braise, pas
 * du fragment, pour qu'une braise s'eteigne d'un bloc et non par tranches.
 * Le scintillement est un sinus rapide de phase propre ; la teinte glisse du
 * corps a la pointe chaude quand la braise est a la fois basse et vive.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps des braises, et la lueur du sol.
 * - `uColorC` — la pointe chaude des braises vives.
 * - `uSpeed` — vitesse de la montee.
 * - `uDensity` — nombre de cellules sur la hauteur, pour la couche proche.
 * - `uGlow` — portee du halo doux autour de chaque braise.
 * - `uLayers` — nombre de couches evaluees, et donc le cout.
 */
export const EMBERS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uGlow;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float braiseHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule.
vec2 braiseHash2(vec2 p) {
  return vec2(braiseHash(p), braiseHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  vec3 colour = uColorA;

  // La lueur du foyer, en bas du cadre : d'ou viennent les braises.
  colour += uColorB * 0.10 * pow(1.0 - vUv.y, 3.0);

  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.55);
    float montee = 1.0 - depth * 0.3;

    vec2 p = uv * scale;

    // Une vitesse par colonne : deux braises voisines ne montent jamais de
    // concert, sans quoi la grille se lirait.
    float colonne = floor(p.x);
    float cadence = (0.7 + 0.6 * braiseHash(vec2(colonne, depth))) * montee;
    p.y -= t * cadence;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 voisine = cell + vec2(float(dx), float(dy));
        vec2 graine = braiseHash2(voisine + depth * 71.0);
        float exists = step(0.35, braiseHash(voisine + 5.0 + depth));

        float balancement = 0.3 * sin(t * 0.9 + graine.x * 6.28318 + voisine.y * 0.5);
        vec2 centre = voisine + vec2(0.5 + balancement, 0.5);

        // Hauteur de la braise dans le cadre : c'est elle qui l'eteint.
        float hauteur = (centre.y + t * cadence) / scale;
        float vie = pow(clamp(1.0 - hauteur, 0.0, 1.0), 1.4);

        float scintillement = 0.55 + 0.45 * sin(t * 6.0 * (0.6 + graine.y) + graine.x * 6.28318);

        float d = length(p - centre);
        float size = (0.05 + 0.06 * graine.y) * (1.0 - depth * 0.3);
        float noyau = exp(-d * d / (size * size));
        float halo = 0.25 * exp(-d * d / (size * size * max(uGlow, 0.1) * max(uGlow, 0.1) * 6.0));

        vec3 teinte = mix(uColorB, uColorC, scintillement * vie);
        colour += teinte * (noyau + halo) * vie * scintillement * exists * (1.0 - depth * 0.3);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
