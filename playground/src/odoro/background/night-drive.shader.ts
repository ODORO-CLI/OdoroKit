/**
 * Shader de la route de nuit.
 *
 * ## L'idee mathematique
 *
 * Un sol en perspective sans camera ni matrice : sous la ligne d'horizon,
 * la profondeur vaut l'inverse de la distance a l'horizon, et l'abscisse
 * du monde est l'abscisse de l'ecran multipliee par cette profondeur. Les
 * bords de la route sont deux abscisses fixes du monde ; l'axe est une
 * ligne de tirets lue en partie fractionnaire de la profondeur, decalee du
 * temps pour defiler. L'epaisseur des traits est bornee en pixels d'ecran,
 * pas en unites du monde : sans cela ils disparaitraient bien avant
 * l'horizon.
 *
 * Les lampadaires sont une file bornee. Chaque lampe a une phase le long de
 * la route qui avance avec le temps ; sa profondeur en est une fonction
 * quadratique, pour qu'elle approche lentement de loin et file vite en
 * passant. Sa tete et sa base sont projetees de la meme maniere que le
 * sol ; un halo au niveau de la tete, un mat entre les deux, une flaque
 * aplatie au sol. Tout est melange vers la couleur de la lampe, jamais
 * additionne : une addition saturerait sur un fond clair et les lampes
 * disparaitraient en theme clair.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les lignes de la route, les mats, la lueur d'horizon.
 * - `uColorC` — les lampes.
 * - `uSpeed` — vitesse de la route.
 * - `uWidth` — demi-largeur de la route, en unites du monde.
 * - `uLamps` — nombre de lampadaires par cote, borne a douze.
 * - `uHeight` — hauteur des lampadaires, en unites du monde.
 */
export const NIGHT_DRIVE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uWidth;
uniform float uLamps;
uniform float uHeight;

const int MAX_LAMPS = 12;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  // L'horizon un peu au-dessus du centre ; sous lui, le sol en z = 1/y,
  // la camera a une unite du sol.
  float horizon = 0.12;
  float drop = horizon - p.y;
  float ground = step(0.0, drop);
  float z = 1.0 / max(drop, 0.001);
  float wx = p.x * z;

  // Les bords de la route et l'axe en tirets, dans le plan du sol. Leur
  // epaisseur est bornee en pixels d'ecran : sinon ils s'evanouissent.
  float halfWidth = max(uWidth, 0.2);
  float edges = 1.0 - smoothstep(px * 0.6, px * 1.8, abs(abs(wx) - halfWidth) / z);
  float dash = step(0.5, fract(z * 0.35 - t * 2.0));
  float axis = (1.0 - smoothstep(px * 0.5, px * 1.5, abs(wx) / z)) * dash;

  // Les lignes s'effacent en approchant de l'horizon.
  float fade = smoothstep(0.0, 0.1, drop);

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, (edges + axis * 0.8) * fade * ground * 0.85);

  // Le ciel : une lueur basse a l'horizon, celle d'une ville au loin.
  float sky = (1.0 - ground) * exp(-(p.y - horizon) * 9.0);
  colour = mix(colour, uColorB, sky * 0.18);

  // Les lampadaires : a intervalle regulier le long de la route, ils
  // avancent vers la camera et sortent du champ. La file est bornee.
  float lamps = clamp(uLamps, 1.0, float(MAX_LAMPS));
  for (int i = 0; i < MAX_LAMPS; i += 1) {
    if (float(i) >= lamps) break;

    // La phase avance ; la profondeur en est une fonction quadratique.
    float u = fract(float(i) / lamps + t * 0.12);
    float zi = 0.7 + 28.0 * (1.0 - u) * (1.0 - u);

    for (int s = 0; s < 2; s += 1) {
      float sideX = (float(s) * 2.0 - 1.0) * halfWidth * 1.25 / zi;
      vec2 head = vec2(sideX, horizon + uHeight / zi);
      vec2 base = vec2(sideX, horizon - 1.0 / zi);

      // Le mat : un trait entre la base et la tete.
      float onPole = step(base.y, p.y) * step(p.y, head.y);
      float pole = (1.0 - smoothstep(px * 0.4, px * 1.4, abs(p.x - sideX))) * onPole;
      colour = mix(colour, uColorB, pole * 0.7);

      // La lampe : un halo qui grossit en approchant, et sa flaque au sol,
      // aplatie par la perspective.
      float size = 0.015 + 0.25 / zi;
      float glow = exp(-length(p - head) / size);
      float pool = exp(-length((p - base) * vec2(1.0, 4.0)) / (size * 2.5)) * ground;
      colour = mix(colour, uColorC, clamp(glow * 0.9 + pool * 0.35, 0.0, 1.0));
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
