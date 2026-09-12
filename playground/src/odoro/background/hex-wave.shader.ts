/**
 * Shader de la vague hexagonale.
 *
 * ## L'idee mathematique
 *
 * Un pavage hexagonal se lit avec deux grilles rectangulaires decalees
 * d'une demi-maille : pour chaque point, on prend celle des deux dont le
 * centre est le plus proche. Le centre retenu identifie l'alveole ; la
 * distance hexagonale au centre — le maximum entre la projection sur l'axe
 * incline et l'abscisse — vaut un demi sur les aretes, ce qui donne le
 * filet et l'interieur.
 *
 * La vague n'est pas evaluee au pixel : elle est evaluee au centre de
 * l'alveole. C'est ce qui fait que chaque alveole s'allume d'un bloc, comme
 * une touche, au lieu de laisser une onde continue la traverser. Un sinus
 * de la distance au pointeur, decale du temps, s'eloigne du pointeur ; une
 * exponentielle l'eteint avec la distance.
 *
 * Le centre est le pointeur, amorti par le composant.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les aretes.
 * - `uColorC` — les alveoles allumees.
 * - `uPointer` — position de la source, en coordonnees de texture.
 * - `uSize` — alveoles par hauteur de cadre.
 * - `uSpeed` — vitesse de la vague.
 * - `uSpacing` — vagues par hauteur de cadre.
 * - `uFade` — vitesse d'extinction avec la distance.
 */
export const HEX_WAVE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSize;
uniform float uSpeed;
uniform float uSpacing;
uniform float uFade;

// Pas du pavage : une maille de large, racine de trois de haut.
const vec2 HEX = vec2(1.0, 1.7320508);

// Distance hexagonale au centre : un demi sur les aretes.
float hexDist(vec2 p) {
  p = abs(p);
  return max(dot(p, normalize(HEX)), p.x);
}

// Coordonnees d'une alveole : le point local (xy) et le centre (zw).
vec4 hexCoords(vec2 p) {
  vec2 h = HEX * 0.5;
  vec2 a = mod(p, HEX) - h;
  vec2 b = mod(p - h, HEX) - h;
  vec2 local = dot(a, a) < dot(b, b) ? a : b;
  return vec4(local, p - local);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float size = clamp(uSize, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * size;
  vec2 centre = uPointer * vec2(aspect, 1.0) * size;

  // Un pixel, en unites de maille.
  float px = size / max(uResolution.y, 1.0);

  vec4 hex = hexCoords(p);
  float edge = hexDist(hex.xy);

  // La vague est evaluee au centre de l'alveole : elle s'allume d'un bloc.
  float d = length(hex.zw - centre) / size;
  float wave = 0.5 + 0.5 * sin(d * 6.2832 * max(uSpacing, 0.5) - uTime * uSpeed * 3.0);
  float reach = exp(-d * uFade);
  float lit = smoothstep(0.35, 0.95, wave) * reach;

  // L'alveole sous le pointeur reste pleine.
  float core = 1.0 - smoothstep(0.0, 0.12, d);

  // Les aretes : un filet fin ; l'interieur, legerement en retrait.
  float border = smoothstep(0.5 - px * 1.8, 0.5 - px * 0.4, edge);
  float fill = 1.0 - smoothstep(0.5 - px * 3.0, 0.5 - px * 1.8, edge);

  vec3 colour = mix(uColorA, uColorB, border * 0.9);
  colour = mix(colour, uColorC, fill * clamp(lit * 0.85 + core, 0.0, 1.0));
  colour = mix(colour, uColorC, border * lit * 0.5);

  gl_FragColor = vec4(colour, 1.0);
}
`
