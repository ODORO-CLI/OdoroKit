/**
 * Shader du circuit imprime.
 *
 * ## L'idee mathematique
 *
 * Un circuit est une grille de tuiles. Chaque tuile tire son type — un
 * trait droit, horizontal ou vertical, ou l'un des quatre coudes — et le
 * trait est la distance signee au segment qui va du centre de la tuile au
 * milieu de chacun de ses bords ouverts. Aucun chemin n'est construit :
 * deux tuiles voisines qui s'ouvrent l'une vers l'autre se raccordent
 * d'elles-memes, et deux qui ne s'ouvrent pas l'une vers l'autre laissent
 * une extremite de piste.
 *
 * Ces extremites sont les pastilles. Un bord est terminal si la tuile s'y
 * ouvre et pas sa voisine, ou l'inverse ; la pastille est un anneau au
 * milieu de ce bord, dessine par les deux tuiles depuis la meme condition
 * — chacune sa moitie, sans couture. C'est ce qui fait un circuit et non
 * un labyrinthe : les pistes finissent sur des pastilles.
 *
 * Les impulsions courent le long de l'axe de la tuile : une exponentielle
 * de la partie fractionnaire de la coordonnee le long de la piste, decalee
 * par le temps et par une graine propre a la rangee ou a la colonne, pour
 * que les pistes ne pulsent pas en choeur.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le substrat.
 * - `uColorB` — les pistes et les pastilles.
 * - `uColorC` — les impulsions.
 * - `uCells` — nombre de tuiles sur la hauteur.
 * - `uWidth` — epaisseur des pistes, en fraction de tuile.
 * - `uSpeed` — vitesse des impulsions.
 * - `uPulses` — part des pistes parcourues a un instant donne.
 */
export const CIRCUIT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uWidth;
uniform float uSpeed;
uniform float uPulses;

// Nombre pseudo-aleatoire, stable par tuile.
float circuitHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// Les bords ouverts d'une tuile : gauche, droite, haut, bas. Six types,
// deux traits droits et quatre coudes.
vec4 circuitOpen(vec2 cell) {
  float kind = floor(circuitHash(cell) * 6.0);
  if (kind < 0.5) return vec4(1.0, 1.0, 0.0, 0.0);
  if (kind < 1.5) return vec4(0.0, 0.0, 1.0, 1.0);
  if (kind < 2.5) return vec4(1.0, 0.0, 1.0, 0.0);
  if (kind < 3.5) return vec4(0.0, 1.0, 0.0, 1.0);
  if (kind < 4.5) return vec4(1.0, 0.0, 0.0, 1.0);
  return vec4(0.0, 1.0, 1.0, 0.0);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;

  // Un pixel, en unites de tuile.
  float px = cells / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  vec4 open = circuitOpen(id);

  // La distance au trait : le minimum sur les bords ouverts de la distance
  // au segment centre-bord. Un bord ferme est repousse a l'infini.
  float far = 10.0;
  float dLeft = mix(far, length(vec2(max(f.x, 0.0), f.y)), open.x);
  float dRight = mix(far, length(vec2(min(f.x, 0.0), f.y)), open.y);
  float dUp = mix(far, length(vec2(f.x, min(f.y, 0.0))), open.z);
  float dDown = mix(far, length(vec2(f.x, max(f.y, 0.0))), open.w);
  float trace = min(min(dLeft, dRight), min(dUp, dDown));

  // Les bords terminaux : ouverts d'un seul cote.
  float tLeft = abs(open.x - circuitOpen(id - vec2(1.0, 0.0)).y);
  float tRight = abs(open.y - circuitOpen(id + vec2(1.0, 0.0)).x);
  float tUp = abs(open.z - circuitOpen(id + vec2(0.0, 1.0)).w);
  float tDown = abs(open.w - circuitOpen(id - vec2(0.0, 1.0)).z);

  float pad = min(
    min(mix(far, length(f - vec2(-0.5, 0.0)), tLeft), mix(far, length(f - vec2(0.5, 0.0)), tRight)),
    min(mix(far, length(f - vec2(0.0, 0.5)), tUp), mix(far, length(f - vec2(0.0, -0.5)), tDown))
  );

  float width = clamp(uWidth, 0.02, 0.3);
  float line = 1.0 - smoothstep(width * 0.5 - px, width * 0.5 + px, trace);
  float ring = 1.0 - smoothstep(px, px * 2.5, abs(pad - width * 1.6));
  float hole = 1.0 - smoothstep(width * 0.6 - px, width * 0.6 + px, pad);

  // L'impulsion : le long de l'axe de la tuile, avec une graine par piste.
  float horizontal = max(open.x, open.y);
  float along = mix(p.y, p.x, horizontal);
  float seed = mix(circuitHash(vec2(id.x, 41.0)), circuitHash(vec2(43.0, id.y)), horizontal);
  float carried = step(1.0 - clamp(uPulses, 0.0, 1.0), circuitHash(vec2(seed, floor(uTime * 0.25 + seed))));
  float pulse = exp(-fract(along * 0.2 - uTime * uSpeed * 0.4 + seed) * 7.0) * carried;

  vec3 colour = mix(uColorA, uColorB, max(line, ring) * 0.9);
  colour = mix(colour, uColorA, hole * line);
  colour = mix(colour, uColorC, line * (1.0 - hole) * pulse);

  gl_FragColor = vec4(colour, 1.0);
}
`
