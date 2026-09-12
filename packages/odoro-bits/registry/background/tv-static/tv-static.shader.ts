/**
 * Shader des parasites.
 *
 * ## L'idee mathematique
 *
 * De la neige televisuelle : un bruit blanc par cellule d'ecran, hache par
 * paliers de temps — un tirage par palier et non par image, sans quoi le
 * scintillement serait insoutenable a soixante images par seconde. Des bandes
 * sombres defilent lentement a la verticale, comme une synchronisation qui
 * derive, et un dosage de teinte tire le gris vers la couleur du tube.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le noir du tube.
 * - `uColorB` — la teinte vers laquelle le gris est tire.
 * - `uColorC` — le blanc du grain.
 * - `uFps` — cadence des paliers de tirage.
 * - `uBanding` — profondeur des bandes sombres.
 * - `uTint` — dosage de la teinte ; zero, l'image reste grise.
 */
export const TV_STATIC_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uFps;
uniform float uBanding;
uniform float uTint;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float parasiteHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  // Le temps est hache en paliers : un tirage par palier, pas par image. La
  // graine change entierement d'un palier a l'autre, mais reste figee entre
  // deux — c'est ce qui donne le grain d'un tube, pas d'un stroboscope.
  float cadence = max(uFps, 1.0);
  float palier = floor(uTime * cadence);

  // Un grain de deux pixels d'ecran : plus fin, il disparaitrait dans le
  // filtrage ; plus gros, il deviendrait une mosaique.
  vec2 cellule = floor(vUv * uResolution * 0.5);
  float grain = parasiteHash(cellule + vec2(palier * 57.0, palier * 113.0));

  // Les bandes sombres : deux sinus de frequences non multiples qui defilent
  // lentement vers le bas, comme une synchronisation verticale qui derive.
  float defile = vUv.y + uTime * 0.06;
  float bande = 1.0 - clamp(uBanding, 0.0, 1.0) * (
    0.32 * (0.5 + 0.5 * sin(defile * 18.8496)) +
    0.18 * (0.5 + 0.5 * sin(defile * 43.9823))
  );

  float valeur = grain * bande;

  // Le gris d'abord, la teinte ensuite : la desaturation est le repos du
  // reglage, la couleur du tube son extreme.
  vec3 gris = mix(uColorA, uColorC, valeur);
  vec3 teinte = mix(uColorA, uColorB, valeur);
  vec3 colour = mix(gris, teinte, clamp(uTint, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
