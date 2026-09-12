/**
 * Shader de l'iridescence.
 *
 * ## L'idee mathematique
 *
 * Une nacre : une surface qui ondule doucement, et dont la teinte depend de
 * l'angle sous lequel on la regarde. La surface est une somme de sinus
 * directionnels a grande longueur d'onde, dont le gradient se calcule a la
 * main — pas de lecture decalee, la derivee d'un sinus est connue. Le
 * gradient donne une normale ; l'inclinaison de la normale et la hauteur
 * donnent une phase, et la phase fait tourner la teinte entre deux tokens.
 *
 * Ce qui fait la nacre plutot que le film de savon ou la nappe d'essence :
 * tout est doux. Les bandes sont larges, le melange est un cosinus sans
 * franges sombres, et la lumiere est un reflet large et un reflet etroit
 * poses par addition bornee, jamais par assombrissement. Sur un fond clair,
 * la nappe reste pastel ; sur un fond sombre, elle luit.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte de la nacre.
 * - `uColorC` — la seconde teinte, et le reflet.
 * - `uSpeed` — vitesse de l'ondulation.
 * - `uScale` — echelle des ondes ; plus haut, plus serre.
 * - `uShimmer` — force des reflets.
 * - `uBands` — tours de teinte sur toute la hauteur de la surface.
 * - `uDetail` — nombre d'ondes sommees, et donc leur cout.
 */
export const IRIDESCENCE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uShimmer;
uniform float uBands;
uniform float uDetail;

// Une onde directionnelle : la hauteur, et son gradient dans le meme calcul.
vec3 nacreOnde(vec2 p, vec2 dir, float freq, float phase, float amp) {
  float arg = dot(p, dir) * freq + phase;
  return vec3(sin(arg) * amp, cos(arg) * amp * freq * dir);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  float t = uTime * uSpeed;
  int ondes = int(clamp(uDetail, 1.0, 4.0));

  // La surface : jusqu'a quatre ondes, aux directions et frequences non
  // alignees pour que le motif ne se repete pas.
  vec3 champ = nacreOnde(p, normalize(vec2(1.0, 0.6)), 1.8, t * 0.9, 0.5);
  if (ondes >= 2) champ += nacreOnde(p, normalize(vec2(-0.4, 1.0)), 2.6, -t * 0.7 + 1.3, 0.3);
  if (ondes >= 3) champ += nacreOnde(p, normalize(vec2(0.9, -0.3)), 3.9, t * 1.1 + 2.1, 0.15);
  if (ondes >= 4) champ += nacreOnde(p, normalize(vec2(0.2, 0.9)), 6.1, -t * 0.5 + 0.4, 0.07);

  float hauteur = champ.x;
  vec3 n = normalize(vec3(-champ.yz * 0.8, 1.0));

  // La teinte : une phase faite de la hauteur et de l'inclinaison. Le
  // cosinus tourne entre les deux tokens sans jamais creuser de frange.
  float phase = hauteur * uBands * 3.14159 + n.x * 3.0 + n.y * 1.5 + t * 0.3;
  vec3 teinte = mix(uColorB, uColorC, 0.5 + 0.5 * cos(phase));

  // La presence : la nacre couvre tout, mais plus dense sur les cretes.
  float presence = 0.32 + 0.38 * smoothstep(-0.8, 0.8, hauteur);

  // La lumiere : un reflet large et un reflet etroit, d'une lampe fixe.
  vec3 lumiere = normalize(vec3(-0.5, 0.6, 0.65));
  vec3 h = normalize(lumiere + vec3(0.0, 0.0, 1.0));
  float specular = max(dot(n, h), 0.0);
  float large = pow(specular, 6.0) * 0.25;
  float etroit = pow(specular, 40.0) * 0.5;

  // Un balayage lent en diagonale, comme un reflet de fenetre qui passe.
  float balayage = pow(max(sin((p.x + p.y) * 1.2 - uTime * 0.25), 0.0), 8.0) * 0.2;

  vec3 colour = mix(uColorA, teinte, presence);
  colour += mix(uColorB, uColorC, 0.5) * large * uShimmer;
  colour += uColorC * (etroit + balayage) * uShimmer;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
