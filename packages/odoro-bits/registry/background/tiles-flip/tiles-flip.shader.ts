/**
 * Shader des tuiles qui se retournent.
 *
 * ## L'idee mathematique
 *
 * Une tuile par cellule d'une grille, retournee autour de son axe vertical
 * d'un angle qui depend de la distance de la cellule au pointeur : un sinus
 * de cette distance moins le temps, sous une enveloppe qui s'eteint avec la
 * distance. Les tuiles proches se retournent en ondes concentriques ; les
 * lointaines restent a plat, face avant visible.
 *
 * Le retournement est feint sans camera : la largeur apparente de la tuile
 * est le cosinus de l'angle, la face visible est donnee par son signe, et
 * les deux bords verticaux s'ecartent en sens contraire d'une fraction du
 * sinus — une perspective d'un seul terme, mais l'oeil y voit une tuile qui
 * bascule. Une tuile vue par la tranche s'assombrit.
 *
 * C'est la cellule entiere qui est testee contre le pointeur, pas le
 * fragment : une tuile se retourne d'un bloc, elle ne se tord pas.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la face avant.
 * - `uColorC` — la face arriere.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uSpeed` — vitesse de propagation des ondes.
 * - `uDensity` — nombre de tuiles sur la hauteur.
 * - `uRadius` — portee des ondes, en hauteurs de cadre.
 */
export const TILES_FLIP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uDensity;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  // La distance du centre de la tuile au pointeur, en hauteurs de cadre.
  vec2 centre = (cell + 0.5) / scale;
  vec2 m = uPointer * vec2(aspect, 1.0);
  float dist = length(centre - m);

  // L'onde : un sinus qui s'eloigne du pointeur, eteint par la distance.
  float reach = max(uRadius, 0.05);
  float envelope = 1.0 - smoothstep(0.0, reach, dist);
  float wave = 0.5 - 0.5 * cos(dist * (18.0 / reach) - uTime * uSpeed * 5.0);
  float angle = wave * envelope * 3.1415927;

  float c = cos(angle);
  float s = sin(angle);

  // La largeur apparente est le cosinus ; les bords verticaux s'ecartent
  // en sens contraire d'une fraction du sinus.
  float halfWidth = 0.44 * abs(c);
  float lean = 0.16 * s * sign(local.x);
  float halfHeight = 0.44 * (1.0 + lean);

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float inX = 1.0 - smoothstep(halfWidth - px, halfWidth + px, abs(local.x));
  float inY = 1.0 - smoothstep(halfHeight - px, halfHeight + px, abs(local.y));
  float tile = inX * inY;

  // La face visible suit le signe du cosinus ; par la tranche, la tuile est
  // sombre.
  vec3 face = c >= 0.0 ? uColorB : uColorC;
  face *= 0.55 + 0.45 * abs(c);

  vec3 colour = mix(uColorA, face, tile);

  gl_FragColor = vec4(colour, 1.0);
}
`
