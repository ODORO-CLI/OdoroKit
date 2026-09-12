/**
 * Shader de l'oscilloscope.
 *
 * ## L'idee mathematique
 *
 * Un oscilloscope ne dessine pas une courbe : un spot balaie l'ecran de
 * gauche a droite, et le phosphore garde la trace de son passage en
 * s'eteignant. Le fragment reconstruit donc l'age de son propre pixel : le
 * spot est a l'abscisse `fract(t)` du balayage courant, et un fragment a
 * gauche de lui a ete eclaire dans ce balayage, un fragment a droite dans le
 * precedent. L'age est la difference des deux instants, et l'intensite son
 * exponentielle decroissante — c'est la remanence.
 *
 * Le signal est fige par balayage : ses phases dependent du numero de
 * balayage, pas du temps continu. Sans cela la trace ondulerait derriere le
 * spot, ce qu'aucun phosphore ne fait.
 *
 * La distance a la trace est divisee par la norme de sa pente, comme pour
 * tout y = f(x). Une graticule fixe, en dessous, donne l'echelle.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la graticule.
 * - `uColorC` — le phosphore.
 * - `uSpeed` — balayages par seconde.
 * - `uDecay` — vitesse d'extinction du phosphore.
 * - `uFrequency` — periodes du signal dans le cadre.
 * - `uAmplitude` — hauteur du signal, en fraction du cadre.
 */
export const OSCILLOSCOPE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDecay;
uniform float uFrequency;
uniform float uAmplitude;

// Le signal du balayage n : trois sinus dont les phases dependent de n.
float signal(float x, float n) {
  float w = uFrequency * 6.2831853;
  return sin(x * w + n * 0.4) * 0.6
    + sin(x * w * 2.3 + n * 0.9) * 0.25
    + sin(x * w * 0.5 + n * 1.7) * 0.15;
}

// Derivee du signal par rapport a x, pour normaliser l'epaisseur.
float pente(float x, float n) {
  float w = uFrequency * 6.2831853;
  return cos(x * w + n * 0.4) * 0.6 * w
    + cos(x * w * 2.3 + n * 0.9) * 0.25 * w * 2.3
    + cos(x * w * 0.5 + n * 1.7) * 0.15 * w * 0.5;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float px = 1.0 / max(uResolution.y, 1.0);
  float x = vUv.x;

  // Le balayage courant et la position du spot.
  float speed = max(uSpeed, 0.01);
  float sweeps = uTime * speed;
  float current = floor(sweeps);
  float spot = fract(sweeps);

  // Ce fragment a ete eclaire dans ce balayage s'il est derriere le spot,
  // dans le precedent sinon. L'age en decoule.
  float behind = step(x, spot);
  float n = current - (1.0 - behind);
  float lit = (n + x) / speed;
  float age = uTime - lit;

  float y = 0.5 + signal(x, n) * uAmplitude;
  float slope = pente(x, n) * uAmplitude / aspect;
  float d = abs(vUv.y - y) / sqrt(1.0 + slope * slope);

  float persistence = exp(-age * uDecay);
  float core = 1.0 - smoothstep(px * 0.8, px * 2.2, d);
  float glow = exp(-d * 90.0);
  float trace = (core + glow * 0.6) * persistence;

  // Le spot lui-meme : un point plus vif la ou le balayage en est.
  float head = exp(-length(vec2((x - spot) * aspect, vUv.y - y)) * 60.0);

  // La graticule : dix divisions en largeur, huit en hauteur.
  vec2 cell = abs(fract(vUv * vec2(10.0, 8.0) + 0.5) - 0.5);
  vec2 cellPx = cell / vec2(10.0, 8.0) * uResolution;
  float rule = 1.0 - smoothstep(0.5, 1.5, min(cellPx.x, cellPx.y));
  float axes = 1.0 - smoothstep(px, px * 2.0, min(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));

  vec3 colour = mix(uColorA, uColorB, rule * 0.35 + axes * 0.5);
  colour = mix(colour, uColorC, clamp(trace, 0.0, 1.0));
  colour += uColorC * head * 0.8;

  gl_FragColor = vec4(colour, 1.0);
}
`
