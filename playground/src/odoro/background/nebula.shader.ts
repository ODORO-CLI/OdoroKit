/**
 * Shader de la nebuleuse.
 *
 * ## L'idee mathematique
 *
 * Deux couches de bruit fractal qui derivent a des vitesses differentes, la
 * seconde lue en un point deja deplace par la premiere : c'est ce couplage qui
 * fait des nuages, la ou deux couches independantes ne feraient que deux
 * textures superposees. Une vignette assombrit les bords pour donner la
 * profondeur.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond profond.
 * - `uColorB` — la teinte des nuages.
 * - `uColorC` — la teinte des coeurs lumineux.
 * - `uSpeed` — vitesse de derive des deux couches.
 * - `uScale` — echelle du bruit ; plus haut, plus fin.
 * - `uDepth` — nombre d'octaves des deux couches, et donc leur cout.
 */
export const NEBULA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uDepth;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float nebulaHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float nebulaNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3 : derivee nulle aux extremites, donc pas d'arete visible.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = nebulaHash(cell);
  float b = nebulaHash(cell + vec2(1.0, 0.0));
  float c = nebulaHash(cell + vec2(0.0, 1.0));
  float d = nebulaHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float nebulaFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += nebulaNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDepth, 1.0, 6.0));

  // Premiere couche : les masses lentes, la charpente des nuages.
  float masse = nebulaFbm(p + vec2(t * 0.05, t * 0.02), octaves);

  // Seconde couche : plus fine, plus rapide, et lue en un point deplace par
  // la premiere. C'est ce couplage qui enroule les volutes ; deux couches
  // independantes ne feraient que se superposer.
  float volute = nebulaFbm(p * 1.7 + vec2(-t * 0.11, t * 0.07) + masse * 1.4, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.25, 0.85, masse));

  // Les coeurs lumineux n'apparaissent que la ou les deux couches se
  // renforcent : le produit reste bas presque partout, ce qui les rarefie.
  colour = mix(colour, uColorC, smoothstep(0.45, 0.95, masse * volute * 2.0));

  // Vignette : l'assombrissement des bords donne la profondeur, sans quoi la
  // nappe reste un papier peint.
  float ecart = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.35, 0.95, ecart) * 0.65;

  gl_FragColor = vec4(colour, 1.0);
}
`
