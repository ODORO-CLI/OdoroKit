/**
 * Shader du tracking VHS.
 *
 * ## L'idee mathematique
 *
 * Une cassette mal alignee. L'image de fond est un signal doux — deux
 * ondes lentes — et tout le reste est ce que la bande lui fait.
 *
 * La bande de tracking roule lentement de bas en haut : dans sa hauteur,
 * chaque ligne d'ecran est decalee horizontalement d'un montant tire de son
 * rang et du palier de temps, et des stries claires y apparaissent — un
 * tirage par ligne, hache par paliers, sans quoi elles scintilleraient au
 * lieu de crepiter. Le profil de la bande est adouci a ses deux bords.
 *
 * Les sauts de couleur sont une lecture des deux teintes a deux positions
 * ecartees, en permanence un peu, et beaucoup pendant les rafales : un
 * tirage par palier decide si l'image entiere saute, tremble de quelques
 * pixels et double son ecart. Le bas de l'image porte la commutation des
 * tetes : quelques lignes toujours decalees et bruitees, comme sur tout
 * magnetoscope.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte du signal.
 * - `uColorC` — la seconde, et les stries de la bande.
 * - `uSpeed` — vitesse de la bande de tracking.
 * - `uBand` — hauteur de la bande, en fraction de l'image.
 * - `uSplit` — ecart des teintes.
 * - `uNoise` — quantite de stries dans la bande.
 */
export const VHS_TRACKING_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBand;
uniform float uSplit;
uniform float uNoise;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float vhsHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Le signal : deux ondes lentes, rendu entre zero et un pour chaque teinte.
vec2 vhsSignal(vec2 uv, float t) {
  float a = 0.5 + 0.5 * sin(uv.x * 2.4 + uv.y * 1.8 + t * 0.5);
  float b = 0.5 + 0.5 * sin(uv.y * 3.2 - t * 0.35 + sin(uv.x * 1.6 + t * 0.3) * 1.2);
  return vec2(a, a * b);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime;

  // Les paliers : un rapide pour le crepitement, un lent pour les rafales.
  float tick = floor(t * 24.0);
  float burstStep = floor(t * 3.0);
  float burst = step(0.82, vhsHash(vec2(burstStep, 2.0)));

  // La ligne d'ecran, par paire de pixels.
  float row = floor(vUv.y * uResolution.y * 0.5);

  // La bande de tracking : sa position roule, son profil est adouci.
  float band = clamp(uBand, 0.02, 0.5);
  float rel = fract(vUv.y - t * uSpeed * 0.08) / band;
  float inBand = step(rel, 1.0) * smoothstep(0.0, 0.25, rel) * smoothstep(1.0, 0.75, rel);

  // Le decalage des lignes : dans la bande, tire par ligne et par palier ;
  // partout, un tremblement pendant les rafales ; en bas, la commutation.
  float wobble = (vhsHash(vec2(row, tick)) - 0.5) * 0.12 * inBand;
  float shake = (vhsHash(vec2(tick, 9.0)) - 0.5) * 0.03 * burst;
  float headSwitch = step(vUv.y, 0.035);
  float switchShift = (vhsHash(vec2(row, floor(t * 12.0))) - 0.5) * 0.06 * headSwitch;

  vec2 uv = vec2(vUv.x * aspect + wobble + shake + switchShift, vUv.y);

  // Les deux teintes lues a deux positions ecartees : un peu toujours,
  // beaucoup en rafale.
  float split = uSplit * 0.01 * (1.0 + 2.0 * burst);
  float first = vhsSignal(uv + vec2(split, 0.0), t).x;
  float second = vhsSignal(uv - vec2(split, 0.0), t).y;

  vec3 colour = mix(uColorA, uColorB, first * 0.8);
  colour = mix(colour, uColorC, second * 0.7);

  // Les stries de la bande : par ligne et par palier, seuillees.
  float streak = step(1.0 - clamp(uNoise, 0.0, 1.0) * 0.6, vhsHash(vec2(row * 1.3, tick + 7.0)));
  float streakLength = vhsHash(vec2(row, tick + 3.0));
  float streakHere = streak * step(fract(vUv.x * 2.0 + streakLength), 0.35 + 0.5 * streakLength);
  colour = mix(colour, uColorC, streakHere * inBand * 0.85);

  // Le bruit de la commutation, et une ligne perdue de temps en temps.
  float switchNoise = step(0.55, vhsHash(vec2(row, floor(t * 12.0) + 1.0))) * headSwitch;
  float dropout = step(0.995, vhsHash(vec2(row, tick))) * step(vUv.x, vhsHash(vec2(tick, row)));
  colour = mix(colour, uColorA, switchNoise * 0.6);
  colour = mix(colour, uColorC, dropout * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
