/**
 * Shader de la forme organique.
 *
 * ## L'idee mathematique
 *
 * Une forme en coordonnees polaires : son rayon est un rayon moyen module
 * par trois sinus de l'angle, aux harmoniques 3, 5 et 7, chacun tournant a sa
 * propre vitesse. Trois harmoniques impaires suffisent : elles ne se
 * superposent jamais en un motif regulier, et la forme semble vivante sans
 * jamais paraitre geometrique. Un sinus lent du temps fait respirer le rayon
 * moyen.
 *
 * Le bord n'est pas une ligne : la distance signee est perturbee par un bruit
 * fin avant le seuil, ce qui frange le contour, et un halo decroit en
 * exponentielle de la distance au-dela. La frange et le halo partagent la
 * meme couleur, qui n'est pas celle du corps.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps de la forme.
 * - `uColorC` — la frange et le halo.
 * - `uSize` — rayon moyen, en hauteurs de cadre.
 * - `uSpeed` — vitesse de la respiration.
 * - `uWobble` — amplitude des harmoniques.
 * - `uFringe` — largeur de la frange, force du halo.
 * - `uDetail` — octaves du bruit de la frange.
 */
export const BLOB_MORPH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSize;
uniform float uSpeed;
uniform float uWobble;
uniform float uFringe;
uniform float uDetail;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float formeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float formeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = formeHash(cell);
  float b = formeHash(cell + vec2(1.0, 0.0));
  float c = formeHash(cell + vec2(0.0, 1.0));
  float d = formeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves, bornee a trois : la frange est fine, pas profonde.
float formeFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 3; i += 1) {
    if (i >= octaves) break;
    total += formeNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int detail = int(clamp(uDetail, 1.0, 3.0));

  float angle = atan(p.y, p.x);
  float dist = length(p);

  // Le contour : trois harmoniques impaires, chacune tournant a sa vitesse,
  // sur un rayon moyen qui respire.
  float harmoniques =
    0.5 * sin(3.0 * angle + t) +
    0.3 * sin(5.0 * angle - t * 1.3) +
    0.2 * sin(7.0 * angle + t * 0.7);
  float respiration = 1.0 + 0.06 * sin(t * 1.7);
  float rayon = uSize * respiration * (1.0 + uWobble * harmoniques);

  // La distance signee, perturbee par le bruit avant le seuil : c'est ce qui
  // frange le bord au lieu de le tracer.
  float frange = max(uFringe, 0.0);
  float bruit = formeFbm(p * 14.0 + vec2(t * 0.6, -t * 0.4), detail) - 0.5;
  float d = dist - rayon + bruit * 0.06 * frange;

  float corps = 1.0 - smoothstep(-0.006, 0.006, d);

  // Le halo : une exponentielle de la distance au-dela du bord, et des
  // filaments tires d'un bruit lu en polaire, qui s'echappent du bord.
  float halo = exp(-max(d, 0.0) * 18.0) * frange * 0.8;
  float filaments = pow(formeNoise(vec2(angle * 6.0, dist * 6.0 - t * 0.8)), 3.0);
  halo += filaments * exp(-max(d, 0.0) * 6.0) * frange * 0.5;

  // Le corps : plus sombre au bord, plus clair au coeur, comme un volume.
  float profondeur = smoothstep(0.0, rayon * 0.9, rayon - dist);
  vec3 matiere = mix(uColorB * 0.7, uColorB * 1.05, profondeur);
  // La frange interieure prend la couleur du halo, pour que le bord soit
  // continu de part et d'autre de la ligne.
  float lisiere = 1.0 - smoothstep(0.0, 0.05 * (0.5 + frange), -d);
  matiere = mix(matiere, uColorC, lisiere * 0.6);

  vec3 colour = mix(uColorA, uColorC, clamp(halo, 0.0, 1.0));
  colour = mix(colour, matiere, corps);

  gl_FragColor = vec4(colour, 1.0);
}
`
