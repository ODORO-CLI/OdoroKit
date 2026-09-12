/**
 * Shader des couches de nuages.
 *
 * ## L'idee mathematique
 *
 * Trois couches de bruit fractal, seuillees par la couverture pour donner
 * des masses aux bords nets, derivent chacune a sa vitesse et a son echelle :
 * la lointaine, fine et lente ; la proche, large et rapide. C'est la
 * parallaxe qui fait la profondeur, pas une camera.
 *
 * Chaque couche est eclairee par une seconde lecture du bruit, decalee vers
 * la lumiere : la ou la densite decroit dans cette direction, la masse est
 * exposee et s'eclaire ; la ou elle croit, elle est dans l'ombre de sa
 * voisine. Un nuage ainsi lu a un dessus clair et un dessous sombre, ce
 * qu'un bruit seul ne donne pas.
 *
 * Distinct de la fumee, advectee par un rotationnel, et de la nebuleuse,
 * assombrie aux bords : ici des masses opaques, empilees, eclairees.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps des nuages, dans l'ombre.
 * - `uColorC` — leurs sommets eclaires.
 * - `uSpeed` — vitesse de derive de la couche proche.
 * - `uScale` — echelle des masses ; plus haut, plus fin.
 * - `uCoverage` — couverture du ciel, de zero a un.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const CLOUD_LAYER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uCoverage;
uniform float uOctaves;

float nuageHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float nuageNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = nuageHash(cell);
  float b = nuageHash(cell + vec2(1.0, 0.0));
  float c = nuageHash(cell + vec2(0.0, 1.0));
  float d = nuageHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float nuageFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += nuageNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.03 + vec2(1.7, 9.2);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// Une couche : la masse, et sa lumiere. Le decalage vers la lumiere est en
// unites de bruit, donc la meme fraction de nuage a toute echelle.
vec2 nuageCouche(vec2 q, float couverture, int octaves) {
  float densite = nuageFbm(q, octaves);
  float exposee = nuageFbm(q + vec2(-0.12, 0.12), octaves);

  float seuil = 1.0 - clamp(couverture, 0.0, 1.0) * 0.9;
  float masse = smoothstep(seuil - 0.12, seuil + 0.22, densite);

  // La densite decroit vers la lumiere : le sommet est expose.
  float lumiere = clamp((densite - exposee) * 6.0 + 0.35, 0.0, 1.0);

  return vec2(masse, lumiere);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float echelle = max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  vec3 colour = uColorA;

  // De la plus lointaine a la plus proche : chaque couche recouvre les
  // precedentes, plus large, plus rapide et plus opaque.
  vec2 loin = nuageCouche(p * echelle * 1.8 + vec2(t * 0.35, 3.1), uCoverage * 0.85, octaves);
  colour = mix(colour, mix(uColorB, uColorC, loin.y), loin.x * 0.5);

  vec2 milieu = nuageCouche(p * echelle * 1.1 + vec2(t * 0.65, 7.7), uCoverage, octaves);
  colour = mix(colour, mix(uColorB, uColorC, milieu.y), milieu.x * 0.75);

  vec2 pres = nuageCouche(p * echelle * 0.65 + vec2(t, 12.3), uCoverage, octaves);
  colour = mix(colour, mix(uColorB, uColorC, pres.y), pres.x * 0.92);

  gl_FragColor = vec4(colour, 1.0);
}
`
