/**
 * Shader des volutes de fumee.
 *
 * ## L'idee mathematique
 *
 * Un bruit fractal advecte par un rotationnel approche : quatre lectures du
 * bruit autour du point donnent son gradient par differences finies, et le
 * gradient tourne d'un quart de tour est un champ sans divergence — un
 * ecoulement qui tourbillonne sans jamais se compresser. La montee lente vient
 * d'un simple decalage du domaine vers le bas au fil du temps.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte du corps de la fumee.
 * - `uColorC` — la teinte des cretes les plus denses.
 * - `uSpeed` — vitesse du tourbillon.
 * - `uScale` — echelle du motif ; plus haut, plus fin.
 * - `uLift` — vitesse de la montee.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const SMOKE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uLift;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float fumeeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float fumeeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3 : derivee nulle aux extremites, donc pas d'arete visible.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = fumeeHash(cell);
  float b = fumeeHash(cell + vec2(1.0, 0.0));
  float c = fumeeHash(cell + vec2(0.0, 1.0));
  float d = fumeeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float fumeeFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += fumeeNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  // La montee : le domaine glisse vers le bas, donc la matiere semble monter.
  vec2 p = vec2(vUv.x * aspect, vUv.y - uTime * uLift * 0.1) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // Rotationnel approche : le gradient du bruit par differences finies —
  // deux paires de lectures decalees — tourne d'un quart de tour. Un champ
  // ainsi construit est sans divergence : il tourbillonne sans compresser.
  float e = 0.35;
  float gx = fumeeFbm(p + vec2(e, 0.0), octaves) - fumeeFbm(p - vec2(e, 0.0), octaves);
  float gy = fumeeFbm(p + vec2(0.0, e), octaves) - fumeeFbm(p - vec2(0.0, e), octaves);
  vec2 curl = vec2(gy, -gx);

  // La matiere est le meme bruit, lu la ou le rotationnel l'a poussee. Le
  // temps n'entre que dans le deplacement : la fumee se deforme, elle ne
  // clignote pas.
  float densite = fumeeFbm(p + curl * (1.2 + 0.6 * sin(t * 0.5)) + vec2(t * 0.08, 0.0), octaves);

  // Contraste doux : la rampe est large, la fumee n'a pas de bord franc.
  float corps = smoothstep(0.30, 0.80, densite);

  vec3 colour = mix(uColorA, uColorB, corps);
  colour = mix(colour, uColorC, smoothstep(0.62, 0.95, densite) * 0.6);

  gl_FragColor = vec4(colour, 1.0);
}
`
