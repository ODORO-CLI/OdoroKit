/**
 * Shader des feux d'artifice.
 *
 * ## L'idee mathematique
 *
 * Un bouquet est un point de depart, un age et une graine. Chaque etincelle
 * en part dans une direction repartie autour du cercle, a une vitesse hachee,
 * et sa position a l'instant t est analytique : la distance parcourue sous
 * une trainee proportionnelle a la vitesse est `v0 (1 - e^{-kt}) / k` — les
 * etincelles ralentissent d'elles-memes — et la gravite retire `g t^2 / 2` a
 * la hauteur. Rien n'est integre d'image en image : chaque fragment resout
 * l'etincelle la ou elle est.
 *
 * L'extinction est une exponentielle de l'age, modulee d'un scintillement
 * rapide de phase propre ; un eclair bref au point de depart marque
 * l'explosion elle-meme.
 *
 * Les bouquets vivent dans un tampon de six emplacements dates par l'horloge
 * du moteur — un depart a -1000 donne un age enorme, donc un bouquet inerte —
 * et un bouquet automatique, tire d'un compteur de periode, part tout seul a
 * un point hache : un ciel qui ne s'anime qu'au clic resterait vide dans la
 * plupart des pages.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le ciel.
 * - `uColorB`, `uColorC` — les deux teintes d'etincelles, melangees par bouquet.
 * - `uClicks` — six bouquets (x, y, temps de depart), tampon circulaire.
 * - `uSparks` — etincelles par bouquet, et donc le cout.
 * - `uGravity` — force de la retombee.
 * - `uDecay` — vitesse d'extinction des etincelles.
 * - `uAuto` — periode des bouquets automatiques, en secondes ; zero les coupe.
 */
export const FIREWORKS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[6];
uniform float uSparks;
uniform float uGravity;
uniform float uDecay;
uniform float uAuto;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float feuHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme graine.
vec2 feuHash2(vec2 p) {
  return vec2(feuHash(p), feuHash(p + vec2(37.3, 17.7)));
}

// Lumiere qu'un bouquet depose au point p, a l'age donne.
vec3 bouquet(vec2 p, vec2 origine, float age, float graine, int etincelles) {
  // Trop tot ou trop vieux : rien a calculer, et c'est le cas de tous les
  // emplacements vides du tampon.
  if (age < 0.0 || age > 6.0) return vec3(0.0);

  vec3 lumiere = vec3(0.0);
  float teinteBouquet = feuHash(vec2(graine, 3.1));
  float k = 1.6;

  // Bornes constantes : la specification du langage l'exige ; la qualite
  // sort plus tot.
  for (int j = 0; j < 48; j += 1) {
    if (j >= etincelles) break;
    float fj = float(j);
    vec2 h = feuHash2(vec2(fj, graine));

    // Directions reparties sur le cercle, chacune un peu decalee : un bouquet
    // regulier a l'air mecanique, un bouquet aleatoire a des trous.
    float angle = (fj + h.x * 0.8) / float(etincelles) * 6.28318;
    float v0 = 0.22 + 0.25 * h.y;

    float portee = v0 * (1.0 - exp(-k * age)) / k;
    vec2 pos = origine + vec2(cos(angle), sin(angle)) * portee;
    pos.y -= uGravity * age * age * 0.5;

    float d = length(p - pos);
    float size = 0.006 + 0.004 * h.y;
    float noyau = exp(-d * d / (size * size));
    float halo = 0.15 * exp(-d * d / (size * size * 12.0));

    float extinction = exp(-uDecay * age) * (0.75 + 0.25 * sin(age * 25.0 + h.x * 6.28318));
    extinction *= smoothstep(0.0, 0.05, age);

    vec3 teinte = mix(uColorB, uColorC, fract(teinteBouquet + h.y * 0.35));
    lumiere += teinte * (noyau + halo) * extinction;
  }

  // L'eclair de l'explosion : large, bref, au point de depart.
  float d0 = length(p - origine);
  lumiere += uColorC * exp(-d0 * d0 / 0.002) * exp(-age * 12.0) * 2.0;

  return lumiere;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int etincelles = int(clamp(uSparks, 4.0, 48.0));

  vec3 colour = uColorA;

  for (int i = 0; i < 6; i += 1) {
    vec3 clic = uClicks[i];
    vec2 origine = clic.xy * vec2(aspect, 1.0);
    colour += bouquet(p, origine, uTime - clic.z, clic.z * 7.3 + float(i), etincelles);
  }

  // Le bouquet automatique : un par periode, a un point hache du haut du cadre.
  if (uAuto > 0.0) {
    float periode = max(uAuto, 0.5);
    float index = floor(uTime / periode);
    float ageAuto = uTime - index * periode;
    vec2 origineAuto = vec2(0.2 + 0.6 * feuHash(vec2(index, 1.3)), 0.45 + 0.4 * feuHash(vec2(index, 9.1)));
    colour += bouquet(p, origineAuto * vec2(aspect, 1.0), ageAuto, index * 3.7, etincelles);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
