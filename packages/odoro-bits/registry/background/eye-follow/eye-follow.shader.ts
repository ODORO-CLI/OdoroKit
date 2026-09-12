/**
 * Shader des yeux qui suivent.
 *
 * ## L'idee mathematique
 *
 * Un oeil par cellule d'une grille. La forme de l'oeil n'est pas une ellipse
 * mais l'intersection de deux disques decales verticalement : c'est ce qui
 * lui donne ses deux coins pointus, qu'une ellipse n'a pas. En distance
 * signee, une intersection est un maximum — deux longueurs, un `max`, et la
 * forme est faite.
 *
 * Le regard est la direction de la cellule vers le pointeur, ecrasee :
 * beaucoup en abscisse, peu en ordonnee. Un iris qui se deplacerait autant
 * dans les deux sens sortirait de l'oeil par le haut avant d'en atteindre le
 * coin.
 *
 * Le clignement est un ecrasement du repere local en ordonnee, pas un volet
 * pose par-dessus : l'oeil se referme donc sur lui-meme, et sa paupiere n'a
 * pas a etre dessinee. Chaque oeil cligne a son propre rythme, tire de ses
 * coordonnees de cellule.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, et l eclat dans l iris.
 * - `uColorB` — le trait de l oeil et sa pupille.
 * - `uColorC` — l iris.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uEyes` — nombre d yeux sur la hauteur.
 * - `uGaze` — amplitude du regard, entre zero et un.
 * - `uBlink` — frequence des clignements. Zero les coupe.
 */
export const EYE_FOLLOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uEyes;
uniform float uGaze;
uniform float uBlink;

// Rythme propre a un oeil, stable d'une image a l'autre.
float eyeSeed(vec2 cell) {
  return fract(sin(dot(cell, vec2(12.9898, 78.233))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uEyes, 1.0, 10.0);
  vec2 p = uv * scale;
  vec2 cell = floor(p);
  vec2 local = fract(p) - 0.5;

  vec2 centre = (cell + 0.5) / scale;
  vec2 m = uPointer * vec2(aspect, 1.0);

  // Le regard : direction vers le pointeur, amplitude bornee et ecrasee.
  vec2 towards = m - centre;
  float span = length(towards);
  vec2 dir = span > 0.0001 ? towards / span : vec2(0.0, 0.0);
  float reach = min(span * 2.5, 1.0) * clamp(uGaze, 0.0, 1.0);
  vec2 look = vec2(dir.x * 0.20, dir.y * 0.07) * reach;

  // Le clignement : une impulsion etroite dans le cycle propre a l'oeil.
  float seed = eyeSeed(cell);
  float beat = fract(uTime * (0.10 + 0.09 * seed) * max(uBlink, 0.0) + seed);
  float lid = (beat - 0.5) * 26.0;
  float shut = exp(-lid * lid) * step(0.0001, uBlink);
  float open = max(1.0 - shut, 0.07);

  // Le repere de l'oeil, ecrase par la paupiere.
  vec2 q = vec2(local.x, local.y / open);

  // L'intersection de deux disques : un max de deux distances signees.
  float upper = length(q - vec2(0.0, 0.36)) - 0.55;
  float lower = length(q - vec2(0.0, -0.36)) - 0.55;
  float shape = max(upper, lower);

  float px = scale / max(uResolution.y, 1.0) * 1.6;
  float inside = 1.0 - smoothstep(0.0, px * 2.0, shape);
  float outline = 1.0 - smoothstep(px, px * 3.0, abs(shape));

  // L'iris, la pupille, et l'eclat decale vers le haut a gauche.
  float iris = 1.0 - smoothstep(0.0, px * 2.0, length(q - look) - 0.15);
  float pupil = 1.0 - smoothstep(0.0, px * 2.0, length(q - look) - 0.065);
  float spark =
    1.0 - smoothstep(0.0, px * 2.0, length(q - look - vec2(0.055, 0.055)) - 0.028);

  vec3 colour = uColorA;
  colour = mix(colour, mix(uColorA, uColorB, 0.07), inside);
  colour = mix(colour, uColorC, iris * inside);
  colour = mix(colour, uColorB, pupil * inside);
  colour = mix(colour, uColorA, spark * inside);
  colour = mix(colour, uColorB, outline * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
