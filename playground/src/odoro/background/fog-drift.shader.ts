/**
 * Shader de la brume basse.
 *
 * ## L'idee mathematique
 *
 * Deux nappes de brume, chacune un bruit fractal etire en largeur : dense au
 * bas du cadre, dissoute au-dessus d'une crete que le bruit dessine. Les deux
 * plans glissent en sens contraires — c'est la parallaxe qui les separe a
 * l'oeil, plus surement que leur teinte. Le plan lointain monte plus haut
 * et porte une teinte froide ; le proche reste bas, plus dense, dans le
 * neutre du theme.
 *
 * La brume se pose par melange borne vers ses teintes : sur un fond clair,
 * elle grise ; sur un fond sombre, elle eclaircit. Dans les deux cas, elle
 * reste une brume et le texte reste lisible.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la nappe proche.
 * - `uColorC` — la nappe lointaine.
 * - `uSpeed` — vitesse de glissement.
 * - `uHeight` — hauteur de la brume, en fraction du cadre.
 * - `uDensity` — opacite maximale des nappes.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const FOG_DRIFT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHeight;
uniform float uDensity;
uniform float uOctaves;

float brumeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float brumeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = brumeHash(cell);
  float b = brumeHash(cell + vec2(1.0, 0.0));
  float c = brumeHash(cell + vec2(0.0, 1.0));
  float d = brumeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float brumeFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += brumeNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.1 + vec2(3.7, 1.3);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// Une nappe : dense au bas, dissoute au-dessus d'une crete bruitee. Le bruit
// est etire en largeur — une brume s'etale, elle ne monte pas en colonnes.
float brumeNappe(vec2 p, float t, float vitesse, float hauteur, float echelle, int octaves, float graine) {
  vec2 q = vec2(p.x * echelle + t * vitesse, p.y * echelle * 2.2 + graine);
  float n = brumeFbm(q, octaves);

  float crete = max(hauteur, 0.02) * (0.5 + 0.9 * n);
  float masse = 1.0 - smoothstep(crete * 0.25, crete, p.y);

  return masse * (0.6 + 0.4 * n);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float densite = clamp(uDensity, 0.0, 1.0);

  // Le lointain monte plus haut, plus fin et plus lent ; le proche, bas et
  // large, glisse en sens contraire.
  float loin = brumeNappe(p, t, 0.12, uHeight * 1.35, 1.7, octaves, 3.7);
  float pres = brumeNappe(p, t, -0.2, uHeight * 0.85, 2.6, octaves, 9.1);

  // Les bornes gardent l'encre lisible : meme a pleine densite, la nappe
  // proche ne prend que les trois quarts de sa teinte.
  vec3 colour = mix(uColorA, uColorC, clamp(loin, 0.0, 1.0) * 0.55 * densite);
  colour = mix(colour, uColorB, clamp(pres, 0.0, 1.0) * 0.75 * densite);

  gl_FragColor = vec4(colour, 1.0);
}
`
