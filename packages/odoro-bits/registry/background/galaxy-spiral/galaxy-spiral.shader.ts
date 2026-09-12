/**
 * Shader de la galaxie spirale.
 *
 * ## L'idee mathematique
 *
 * Le plan est lu en polaire depuis le centre, puis tordu : l'angle est
 * augmente du logarithme du rayon fois une torsion. Dans ce domaine, une
 * droite radiale devient une spirale logarithmique — la forme des bras
 * observes — et un cosinus de l'angle tordu, eleve a une puissance, donne
 * les bras eux-memes : brillants sur la crete, presque vides entre deux.
 *
 * Les points sont haches par cellule dans ce domaine tordu, mais leur halo
 * est mesure en distance reelle apres retour au plan : un disque reste un
 * disque, la ou une distance mesuree dans le domaine polaire donnerait des
 * points de plus en plus etires vers le bord. Le domaine angulaire est
 * periodique par construction — les cellules sont prises modulo leur nombre —
 * pour que la couture de l'arc-tangente ne se voie jamais.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les points des bras.
 * - `uColorC` — le coeur et les points proches du coeur.
 * - `uSpeed` — vitesse de la rotation.
 * - `uArms` — nombre de bras.
 * - `uTwist` — torsion des bras ; plus haut, plus enroules.
 * - `uDensity` — nombre de cellules radiales.
 * - `uLayers` — nombre de couches evaluees, et donc le cout.
 */
export const GALAXY_SPIRAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uArms;
uniform float uTwist;
uniform float uDensity;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float galaxieHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule.
vec2 galaxieHash2(vec2 p) {
  return vec2(galaxieHash(p), galaxieHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  // La rotation d'ensemble : lente, et c'est le plan qui tourne, pas les
  // points un a un — un seul cosinus pour toute l'image.
  float c = cos(t * 0.12);
  float s = sin(t * 0.12);
  vec2 v = mat2(c, -s, s, c) * uv;

  float r = length(v);
  float a = atan(v.y, v.x);
  float arms = max(floor(uArms + 0.5), 1.0);
  int layers = int(clamp(uLayers, 1.0, 2.0));

  vec3 colour = uColorA;

  for (int layer = 0; layer < 2; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 4.0) * (1.0 + depth * 0.9);

    // Nombre entier de cellules angulaires : c'est ce qui rend le domaine
    // periodique et efface la couture de l'arc-tangente.
    float K = floor(scale * 1.2);

    float phi = a + uTwist * log(max(r, 0.02));
    vec2 q = vec2(r * scale, phi / 6.28318 * K);
    vec2 cell = floor(q);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 voisine = cell + vec2(float(dx), float(dy));
        vec2 cle = vec2(voisine.x, mod(voisine.y, K)) + depth * 47.0;
        vec2 graine = galaxieHash2(cle);
        float exists = step(0.3, galaxieHash(cle + 5.0));

        // Position dans le domaine tordu, avec une derive lente propre.
        vec2 centreQ = voisine + 0.5
          + 0.36 * vec2(sin(t * 0.4 + graine.x * 6.28318), cos(t * 0.33 + graine.y * 6.28318));

        // Retour au plan : c'est la que le halo est mesure, en distance reelle.
        float r0 = centreQ.x / scale;
        float phi0 = centreQ.y / K * 6.28318;
        float a0 = phi0 - uTwist * log(max(r0, 0.02));
        vec2 xy0 = r0 * vec2(cos(a0), sin(a0));

        float d = length(v - xy0);
        float size = (0.004 + 0.006 * graine.x) * (1.0 - depth * 0.35);
        float halo = exp(-d * d / (size * size));

        // Les bras : une crete par bras, vide entre deux.
        float bras = mix(0.06, 1.0, pow(0.5 + 0.5 * cos(phi0 * arms), 3.0));

        // La densite decroit avec le rayon, et le scintillement est propre.
        float chute = exp(-r0 * 2.2);
        float eclat = 0.7 + 0.3 * sin(t * 2.0 + graine.y * 6.28318);

        vec3 teinte = mix(uColorB, uColorC, smoothstep(0.35, 0.0, r0));
        colour += teinte * halo * bras * chute * eclat * exists * (1.0 - depth * 0.3);
      }
    }
  }

  // Le coeur : un noyau serre et un halo plus large, tous deux au centre.
  colour += uColorC * exp(-r * r / 0.006) * 0.9;
  colour += uColorB * exp(-r * r / 0.05) * 0.3;

  gl_FragColor = vec4(colour, 1.0);
}
`
