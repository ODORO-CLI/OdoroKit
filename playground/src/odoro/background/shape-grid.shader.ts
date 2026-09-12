/**
 * Shader de la grille de formes.
 *
 * ## L'idee mathematique
 *
 * Une forme par cellule, choisie parmi trois par un hachage de la cellule :
 * un disque, un carre, un triangle equilateral. Chacune est un champ de
 * distance signe, ce qui donne un bord net a n'importe quelle taille et un
 * anti-crenelage d'un seul `smoothstep`.
 *
 * Chaque forme tourne a sa propre vitesse, dans son propre sens, et respire
 * d'un sinus de phase propre : deux formes voisines ne sont jamais en
 * phase, et la grille ne se lit pas comme une texture qui tourne d'un bloc.
 * La teinte se place entre les deux couleurs selon un second hachage.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB`, `uColorC` — les deux teintes entre lesquelles chaque forme se place.
 * - `uSpeed` — vitesse de rotation moyenne.
 * - `uDensity` — nombre de cellules sur la hauteur.
 * - `uSize` — rayon des formes, en fraction de la cellule.
 */
export const SHAPE_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uSize;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float shapeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

vec2 shapeRotate(vec2 p, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}

// Triangle equilateral centre, de rayon r.
float shapeTriangle(vec2 p, float r) {
  const float k = 1.7320508;
  p.x = abs(p.x) - r;
  p.y = p.y + r / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
  p.x -= clamp(p.x, -2.0 * r, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  float h1 = shapeHash(cell);
  float h2 = shapeHash(cell + vec2(37.3, 17.7));
  float h3 = shapeHash(cell + vec2(91.1, 53.9));

  // Sens et vitesse propres, phase propre : rien ne tourne d'un bloc.
  float direction = h2 < 0.5 ? -1.0 : 1.0;
  float angle = uTime * uSpeed * direction * (0.6 + 0.8 * h3) + h1 * 6.2831853;
  float breath = 0.85 + 0.15 * sin(uTime * 1.3 + h2 * 6.2831853);
  float r = max(uSize, 0.02) * breath;

  vec2 q = shapeRotate(local, angle);

  float kind = floor(h1 * 3.0);
  float d;
  if (kind < 1.0) {
    d = length(q) - r;
  } else if (kind < 2.0) {
    d = max(abs(q.x), abs(q.y)) - r * 0.85;
  } else {
    d = shapeTriangle(q, r * 1.1);
  }

  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float fill = 1.0 - smoothstep(-px, px, d);

  vec3 tint = mix(uColorB, uColorC, h3);
  vec3 colour = mix(uColorA, tint, fill);

  gl_FragColor = vec4(colour, 1.0);
}
`
