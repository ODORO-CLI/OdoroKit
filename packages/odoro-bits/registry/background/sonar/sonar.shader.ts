/**
 * Shader du sonar.
 *
 * ## L'idee mathematique
 *
 * Des impulsions emises a intervalle regulier depuis un point, qui
 * s'elargissent et s'eteignent avec la distance. Une impulsion n'est pas un
 * sinus : c'est un front raide suivi d'une traine. La partie fractionnaire
 * de `distance x pas - temps x vitesse` avance vers l'exterieur quand le
 * temps passe ; elevee a une puissance, elle est vive juste avant de
 * retomber a zero — c'est le front, a l'exterieur de l'anneau — et sombre
 * juste apres — c'est la traine, a l'interieur.
 *
 * L'extinction avec la distance est une exponentielle : les anneaux proches
 * du centre sont pleins, les lointains s'effacent avant le bord du cadre.
 *
 * Le centre est le pointeur, amorti par le composant : quand il se deplace,
 * les anneaux deja emis ne se souviennent pas de leur origine — ils suivent.
 * C'est un choix : un sonar qui garde ses anneaux au vieux point serait
 * `click-waves`, et il existe deja.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les anneaux.
 * - `uColorC` — le front des impulsions.
 * - `uPointer` — position du centre, en coordonnees de texture.
 * - `uSpeed` — vitesse de propagation.
 * - `uSpacing` — anneaux par hauteur de cadre.
 * - `uFade` — vitesse d'extinction avec la distance.
 */
export const SONAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uSpacing;
uniform float uFade;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 centre = uPointer * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);

  float d = length(p - centre);
  float spacing = max(uSpacing, 0.5);

  // La phase avance vers l'exterieur ; sa puissance fait le front.
  float phase = fract(d * spacing - uTime * uSpeed);
  float pulse = pow(phase, 6.0);
  float front = pow(phase, 24.0);

  // Extinction avec la distance : les anneaux lointains s'effacent.
  float reach = exp(-d * uFade);

  // Les cercles de portee : fixes, fins, deux fois plus espaces que les
  // impulsions. Ils donnent l'echelle contre laquelle les anneaux avancent.
  float ring = abs(fract(d * spacing * 0.5 + 0.5) - 0.5) / (spacing * 0.5);
  float range = (1.0 - smoothstep(px * 0.5, px * 1.5, ring)) * reach * 0.35;

  // Le centre : un point, et un halo qui respire.
  float core = 1.0 - smoothstep(px * 2.0, px * 4.0, d);
  float halo = exp(-d * 18.0) * (0.5 + 0.2 * sin(uTime * 2.0));

  vec3 colour = mix(uColorA, uColorB, range + halo * 0.4);
  colour = mix(colour, uColorB, pulse * reach * 0.8);
  colour = mix(colour, uColorC, (front * reach + core) * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
