/**
 * Shader de la triangulation.
 *
 * ## L'idee mathematique
 *
 * Une grille de cases, chacune coupee en deux par une diagonale. La
 * diagonale alterne d'une case a l'autre — en damier — sans quoi le pavage
 * aurait un sens dominant et les facettes formeraient des rayures. Le cote
 * de la diagonale ou tombe le fragment donne la facette ; un tirage stable
 * sur l'identifiant de la facette donne sa phase.
 *
 * L'eclairage compose deux mouvements : une lente respiration propre a
 * chaque facette, et un balayage diagonal qui traverse le pavage — comme un
 * reflet qui glisse sur un cristal. Le premier seul ferait un scintillement
 * sans direction ; le second seul, une simple vague. Ensemble, les facettes
 * semblent recevoir une lumiere qui bouge, et y repondre chacune a sa maniere.
 *
 * Les aretes sont lues par distance : a la diagonale, aux bords de la case.
 * Elles sont teintees vers le fond, pour se lire comme des joints, non comme
 * des traits.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, et les joints.
 * - `uColorB` — les facettes eclairees.
 * - `uColorC` — la teinte des facettes les plus vives.
 * - `uSize` — nombre de cases sur la hauteur.
 * - `uSpeed` — vitesse de l'eclairage.
 * - `uContrast` — ecart entre facettes sombres et claires.
 * - `uTint` — poids de la teinte sur les facettes les plus vives.
 */
export const TRIANGLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSize;
uniform float uSpeed;
uniform float uContrast;
uniform float uTint;

// Nombre pseudo-aleatoire, stable par facette.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float size = clamp(uSize, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * size;

  // Un pixel, en unites de case.
  float px = size / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p);

  // La diagonale alterne en damier : le pavage n'a pas de sens dominant.
  float flip = mod(id.x + id.y, 2.0);
  float diagonal = mix(f.x - f.y, f.x + f.y - 1.0, flip);
  float side = step(0.0, diagonal);
  vec2 facet = id * 2.0 + vec2(side, 0.0);
  float seed = hash(facet);

  // L'eclairage : une respiration propre a la facette, et un balayage
  // diagonal qui traverse le pavage.
  float own = 0.5 + 0.5 * sin(uTime * uSpeed * (0.4 + 0.6 * seed) + seed * 6.2832);
  float sweep = 0.5 + 0.5 * sin((id.x - id.y * 0.6) * 0.5 - uTime * uSpeed * 0.8);
  float light = mix(own, sweep, 0.45);

  // Les aretes : la diagonale et les bords de la case, un filet fin.
  float toDiagonal = abs(diagonal) * 0.7071;
  vec2 toEdge = min(f, 1.0 - f);
  float edge = min(toDiagonal, min(toEdge.x, toEdge.y));
  float joint = 1.0 - smoothstep(px * 0.3, px * 1.2, edge);

  float contrast = clamp(uContrast, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, (0.15 + 0.85 * light) * contrast);
  colour = mix(colour, uColorC, clamp(uTint, 0.0, 1.0) * pow(light, 4.0) * (0.4 + 0.6 * seed));
  colour = mix(colour, uColorA, joint * 0.6);

  gl_FragColor = vec4(colour, 1.0);
}
`
