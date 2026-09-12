/**
 * Shader de la nappe d'essence.
 *
 * ## L'idee mathematique
 *
 * Comme le film de savon, une couleur par interference : la teinte tourne
 * avec l'epaisseur. Mais une nappe d'essence est mince, tordue et posee sur
 * une eau sombre — trois differences qui changent tout le rendu.
 *
 * Mince : les franges sont bien plus serrees, et un cosinus a frequence
 * triple les separe de franges sombres nettes. Tordue : l'epaisseur est lue
 * dans un domaine deja deforme par un premier bruit, ce qui enroule les
 * franges en volutes au lieu de les etaler en bandes. Posee sur l'eau : un
 * troisieme bruit decoupe l'etendue de la nappe, et entre ses lobes, l'eau
 * ondule sous un reflet raye.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — l'eau.
 * - `uColorB` — la premiere teinte des franges.
 * - `uColorC` — la seconde teinte des franges.
 * - `uSpeed` — vitesse de derive de la nappe.
 * - `uScale` — echelle du bruit.
 * - `uFringes` — densite des franges.
 * - `uRipple` — force des reflets de l'eau.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const OIL_SLICK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uFringes;
uniform float uRipple;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float nappeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float nappeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = nappeHash(cell);
  float b = nappeHash(cell + vec2(1.0, 0.0));
  float c = nappeHash(cell + vec2(0.0, 1.0));
  float d = nappeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float nappeFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += nappeNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // La torsion : un premier bruit deforme le domaine du second, et c'est ce
  // qui enroule les franges en volutes.
  vec2 torsion = vec2(
    nappeFbm(p + vec2(t, -t * 0.6), octaves),
    nappeFbm(p + vec2(3.1, 7.4) + t * 0.8, octaves)
  );
  float epaisseur = nappeFbm(p * 1.7 + torsion * 2.6 - vec2(t * 0.3, 0.0), octaves);

  // Les franges : un tour de teinte par unite, serre ; le cosinus a
  // frequence triple les separe de bandes sombres nettes.
  float phase = epaisseur * uFringes * 6.2831853;
  vec3 teinte = mix(uColorB, uColorC, 0.5 + 0.5 * sin(phase));
  float bandes = 0.35 + 0.65 * pow(0.5 + 0.5 * cos(phase * 3.0), 0.6);
  vec3 irise = teinte * bandes;

  // L'etendue : un troisieme bruit, a grande echelle, decoupe les lobes de
  // la nappe. Son bord est doux — l'essence s'etale, elle ne se decoupe pas.
  float etendue = nappeFbm(p * 0.45 + vec2(t * 0.5, t * 0.2) + 11.0, octaves);
  float nappe = smoothstep(0.38, 0.6, etendue);

  // L'eau : sombre, rayee d'un reflet qui ondule, entre les lobes.
  float onde = sin((p.x * 1.4 + p.y * 0.9) * 6.0 + uTime * 1.2 + torsion.x * 4.0);
  float reflet = pow(max(onde, 0.0), 8.0) * uRipple;
  vec3 eau = uColorA + mix(uColorB, uColorC, 0.5) * reflet * 0.35;

  // Sur le bord de la nappe, la ou elle s'amincit, les franges s'accelerent :
  // un peu de la teinte deborde sur l'eau, comme le halo d'une vraie nappe.
  float lisiere = smoothstep(0.3, 0.38, etendue) * (1.0 - nappe);
  eau = mix(eau, irise * 0.5, lisiere * 0.6);

  gl_FragColor = vec4(mix(eau, irise, nappe), 1.0);
}
`
