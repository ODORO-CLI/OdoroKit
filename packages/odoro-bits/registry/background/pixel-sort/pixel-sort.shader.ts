/**
 * Shader du tri de pixels.
 *
 * ## L'idee mathematique
 *
 * Le tri de pixels est un accident devenu style : dans une image, les
 * pixels de chaque colonne dont la luminance passe un seuil sont tries par
 * ordre croissant, et la colonne se change en degrade monotone. L'effet
 * reel demande de lire toute la colonne ; ici, il est simule sans aucune
 * lecture — chaque colonne de pixels porte des segments dont la position,
 * la longueur et le depart sont tires de leur rang. A l'interieur d'un
 * segment, la luminance croit lineairement du haut vers le bas : c'est le
 * degrade que produirait un tri. Un segment n'apparait que la ou l'image de
 * fond, lue a son origine, passe le seuil — les bandes sortent donc des
 * zones claires et coulent, comme dans l'effet d'origine.
 *
 * Les segments defilent vers le bas a une vitesse propre a leur colonne,
 * si bien que les bandes coulent a des rythmes inegaux.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte de l'image et le bas des bandes.
 * - `uColorC` — le haut des bandes.
 * - `uPixel` — largeur d'une colonne, en pixels physiques.
 * - `uDensity` — nombre de segments sur la hauteur d'une colonne.
 * - `uThreshold` — seuil de luminance au-dessus duquel une bande sort.
 * - `uSpeed` — vitesse d'ecoulement.
 */
export const PIXEL_SORT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPixel;
uniform float uDensity;
uniform float uThreshold;
uniform float uSpeed;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float sortHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float sortNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = sortHash(cell);
  float b = sortHash(cell + vec2(1.0, 0.0));
  float c = sortHash(cell + vec2(0.0, 1.0));
  float d = sortHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// L'image de fond : deux octaves de bruit en derive lente, entre zero et un.
float sortImage(vec2 uv, float t) {
  vec2 p = uv * 2.4 + vec2(t * 0.08, -t * 0.05);
  float value = sortNoise(p) + 0.5 * sortNoise(p * 2.3 + 7.0);
  return smoothstep(0.25, 1.1, value / 1.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float pixel = max(uPixel, 1.0);
  float t = uTime;

  // La colonne : tout ce qui suit se calcule au centre de sa largeur.
  float column = floor(gl_FragCoord.x / pixel);
  float x = (column + 0.5) * pixel / uResolution.x * aspect;

  float image = sortImage(vec2(vUv.x * aspect, vUv.y), t);

  // Les segments de la colonne, qui defilent vers le bas a une vitesse
  // propre a la colonne.
  float seed = sortHash(vec2(column, 3.0));
  float density = max(uDensity, 1.0);
  float run = (1.0 - vUv.y) * density + seed * 20.0 + t * uSpeed * (0.3 + 0.7 * seed);
  float segment = floor(run);
  float local = fract(run);

  // Longueur du segment, et son origine : la bande ne sort que si l'image
  // y est assez claire.
  float span = mix(0.2, 0.95, sortHash(vec2(column, segment)));
  float originY = 1.0 - (segment - seed * 20.0 - t * uSpeed * (0.3 + 0.7 * seed)) / density;
  float origin = sortImage(vec2(x, fract(originY)), t);
  float gate = step(clamp(uThreshold, 0.0, 1.0), origin);

  float inside = step(local, span) * gate;

  // Le degrade du tri : la luminance croit du haut vers le bas du segment.
  float sorted = local / span;

  vec3 base = mix(uColorA, uColorB, image * 0.85);
  vec3 band = mix(uColorC, uColorB, sorted);
  band = mix(band, uColorA, sorted * sorted * 0.5);

  vec3 colour = mix(base, band, inside);

  gl_FragColor = vec4(colour, 1.0);
}
`
