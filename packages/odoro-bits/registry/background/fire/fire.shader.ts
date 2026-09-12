/**
 * Shader du feu.
 *
 * ## L'idee mathematique
 *
 * Un bruit fractal dont le domaine descend avec le temps — la matiere semble
 * monter — etire en hauteur pour donner des langues et non des boules, et
 * balance lateralement d'un sinus de la hauteur. La chaleur est ce bruit
 * moins une rampe de la hauteur : pleine au sol, elle se dissout en montant,
 * et c'est le bruit qui decide ou une langue monte plus haut que ses
 * voisines. Deux seuils doux de la chaleur donnent le corps et le coeur.
 *
 * Le temps n'entre que dans le deplacement du domaine : les flammes montent
 * en continu, elles ne clignotent pas. Distinct de la lave, aux metaballs
 * lentes, et des braises, qui sont des particules.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps des flammes.
 * - `uColorC` — leur coeur.
 * - `uSpeed` — vitesse de montee.
 * - `uHeight` — hauteur des flammes, en fraction du cadre.
 * - `uScale` — finesse des langues ; plus haut, plus fin.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const FIRE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHeight;
uniform float uScale;
uniform float uOctaves;

float feuHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float feuNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = feuHash(cell);
  float b = feuHash(cell + vec2(1.0, 0.0));
  float c = feuHash(cell + vec2(0.0, 1.0));
  float d = feuHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

float feuFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += feuNoise(p) * amplitude;
    normalisation += amplitude;
    p = p * 2.0 + vec2(5.1, 1.7);
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float echelle = max(uScale, 0.2);
  float hauteur = max(uHeight, 0.05);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));

  // Le domaine descend : la matiere monte. Etire en hauteur pour des
  // langues ; balance d'un sinus qui s'amplifie avec la hauteur.
  vec2 q = vec2(p.x * echelle, p.y * echelle * 0.6 - t * 1.2);
  q.x += 0.18 * sin(p.y * 4.0 - t * 2.0) * p.y;

  float bruit = feuFbm(q, octaves) * 0.7
    + feuFbm(q * 2.1 + vec2(3.3, -t * 0.6), octaves) * 0.3;

  // La chaleur : le bruit moins une rampe de la hauteur. Au sol, presque
  // tout brule ; a la hauteur reglee, seules les langues les plus hautes
  // survivent.
  float chaleur = clamp(bruit * 1.6 + 0.3 - vUv.y / hauteur * 1.3, 0.0, 1.0);

  float corps = smoothstep(0.05, 0.55, chaleur);
  float coeur = smoothstep(0.65, 1.0, chaleur);

  // La lueur au-dessus des flammes : la chaleur qui teinte l'air.
  float lueur = exp(-vUv.y / hauteur * 2.0) * 0.25 * (1.0 - corps);

  vec3 colour = mix(uColorA, uColorB, clamp(corps + lueur, 0.0, 1.0));
  colour = mix(colour, uColorC, coeur);

  gl_FragColor = vec4(colour, 1.0);
}
`
