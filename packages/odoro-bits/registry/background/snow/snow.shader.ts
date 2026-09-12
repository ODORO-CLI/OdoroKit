/**
 * Shader de la neige.
 *
 * ## L'idee mathematique
 *
 * Trois couches de flocons, un par cellule d'une grille hachee. La chute est
 * une translation verticale de la grille — les couches proches tombent plus
 * vite et plus gros, c'est la parallaxe — et chaque flocon derive
 * lateralement sur un sinus dont la phase est hachee : deux flocons voisins
 * ne se balancent jamais ensemble. Le flocon est un halo en exponentielle de
 * la distance, somme sur les neuf cellules voisines.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — la nuit d'hiver.
 * - `uColorB` — les flocons lointains, bleutes.
 * - `uColorC` — les flocons proches, blancs.
 * - `uSpeed` — vitesse de chute.
 * - `uDensity` — nombre de cellules sur le plus petit cote.
 * - `uDrift` — amplitude du balancement lateral.
 */
export const SNOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uDrift;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float neigeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule : le second est hache depuis
// un point decale, sans quoi x et y seraient lies.
vec2 neigeHash2(vec2 p) {
  return vec2(neigeHash(p), neigeHash(p + vec2(37.3, 17.7)));
}

// Une couche de flocons : la grille descend avec le temps, et chaque pixel
// somme les neuf cellules voisines — un halo depasse de sa cellule, et sans
// ce parcours il serait tranche a chaque bord de maille.
vec3 neigeCouche(vec2 uv, float aspect, float t, float profondeur, vec3 teinte, float eclat) {
  // Proche : moins de cellules, donc des flocons plus gros, et une chute plus
  // rapide. C'est la parallaxe qui fait lire la profondeur.
  float maille = max(uDensity, 2.0) * (1.6 - 0.4 * profondeur);
  float chute = t * (0.6 + 0.5 * profondeur);

  vec2 p = vec2(uv.x * aspect, uv.y + chute + profondeur * 3.17) * maille;
  vec2 cell = floor(p);
  vec3 somme = vec3(0.0);

  float portee = 0.012 + 0.01 * profondeur;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 voisine = cell + vec2(float(dx), float(dy));
      vec2 graine = neigeHash2(voisine);

      // La derive laterale : un sinus par flocon, a phase et frequence
      // hachees — deux voisins ne se balancent jamais a l'unisson.
      float balancement = uDrift * 0.4 * sin(t * (0.6 + graine.x * 0.8) + graine.y * 6.28318);

      vec2 centre = voisine + 0.5 + (graine - 0.5) * 0.6 + vec2(balancement, 0.0);
      vec2 ecart = p - centre;

      // Le flocon : un halo en exponentielle du carre de la distance, le
      // profil d'un point de lumiere adouci par l'air.
      float halo = exp(-dot(ecart, ecart) / portee);

      somme += teinte * halo * eclat * (0.5 + 0.5 * graine.x);
    }
  }

  return somme;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  colour += neigeCouche(vUv, aspect, t, 0.0, uColorB, 0.35);
  colour += neigeCouche(vUv, aspect, t, 1.0, mix(uColorB, uColorC, 0.5), 0.55);
  colour += neigeCouche(vUv, aspect, t, 2.0, uColorC, 0.8);

  gl_FragColor = vec4(colour, 1.0);
}
`
