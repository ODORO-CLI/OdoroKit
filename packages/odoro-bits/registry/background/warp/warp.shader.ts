/**
 * Shader de l'hyperespace.
 *
 * ## L'idee mathematique
 *
 * En polaires, une etoile qui fonce vers l'observateur ne bouge que sur le
 * rayon : son cap angulaire est fixe. La grille est donc posee sur (angle,
 * 1/r) — l'inverse du rayon fait la perspective — et le temps ne fait que
 * glisser la coordonnee radiale. L'etirement est une queue de puissance le
 * long de cette meme coordonnee, et trois grilles decalees font les trois
 * profondeurs.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte des etoiles proches.
 * - `uColorC` — la teinte des etoiles lointaines.
 * - `uSpeed` — vitesse du defilement radial.
 * - `uDensity` — nombre de couloirs angulaires de la premiere couche.
 * - `uStretch` — longueur des trainees, de 0 a 1.
 * - `uLayers` — nombre de couches de profondeur, de 1 a 3.
 */
export const WARP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uStretch;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float warpHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float r = length(p);
  float a = atan(p.y, p.x) / 6.28318 + 0.5;
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  float couches = clamp(uLayers, 1.0, 3.0);

  for (int i = 0; i < 3; i += 1) {
    if (float(i) >= couches) break;

    float profondeur = float(i);

    // Chaque couche a son propre nombre de couloirs, entier pour que le
    // hachage se recolle a la couture angulaire, et sa propre vitesse : les
    // couches proches defilent plus vite, c'est toute la parallaxe.
    float couloirs = floor(max(uDensity, 4.0)) + profondeur * 7.0;
    float vitesse = 1.0 - profondeur * 0.35;

    // La perspective : 1/r envoie le bord de l'ecran pres de zero et le
    // centre a l'infini. Avancer, c'est glisser cette coordonnee.
    float sx = a * couloirs;
    float q = (0.35 / (r + 0.08) - t * vitesse) * 3.0;

    vec2 cell = vec2(mod(floor(sx), couloirs), floor(q));
    float graine = warpHash(cell + profondeur * 13.0);

    // Un couloir sur quatre environ porte une etoile : le seuil rarefie.
    float presence = step(0.72, graine);

    // Trait fin en angle, queue de puissance le long du rayon : l'exposant
    // decroit avec l'etirement, donc la trainee s'allonge.
    float fx = fract(sx) - 0.35 - 0.3 * warpHash(cell + 5.0);
    float largeur = exp(-fx * fx * 320.0);
    float trainee = pow(1.0 - fract(q), 1.0 / max(uStretch * (0.4 + 0.6 * min(uSpeed, 1.5)), 0.03));

    // Les etoiles naissent hors du centre : au point de fuite exact, tout se
    // superpose et ne ferait qu'un pixel qui gresille.
    float naissance = smoothstep(0.04, 0.35, r);

    vec3 teinte = mix(uColorB, uColorC, profondeur * 0.5);
    colour += teinte * presence * largeur * trainee * naissance * (1.0 - profondeur * 0.3);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
