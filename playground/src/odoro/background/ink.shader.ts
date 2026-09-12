/**
 * Shader de l'encre.
 *
 * ## L'idee mathematique
 *
 * Chaque clic fait s'etendre un disque de la couleur suivante depuis le point
 * clique : son rayon vaut l'age fois la vitesse, son bord est adouci d'un
 * feather, et le plus recent se pose par-dessus les autres — le fond change
 * donc de couleur par vagues, en cyclant sur les trois couleurs de la palette.
 * Quatre clics vivent a la fois : le cinquieme chasse le plus ancien, qui a
 * deja recouvert le cadre.
 *
 * Un depart a -1000 est ecarte explicitement : son rayon serait enorme et sa
 * couleur indefinie.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — premiere encre, et couleur de depart du fond.
 * - `uColorB` — deuxieme encre.
 * - `uColorC` — troisieme encre.
 * - `uClicks` — quatre clics (x, y, temps de depart, index de couleur).
 * - `uSpeed` — vitesse d'extension des disques.
 * - `uFeather` — largeur du bord adouci.
 */
export const INK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec4 uClicks[4];
uniform float uSpeed;
uniform float uFeather;

// L'index de couleur cycle sur les trois encres de la palette.
vec3 inkColour(float index) {
  if (index < 0.5) return uColorA;
  if (index < 1.5) return uColorB;
  return uColorC;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float feather = max(uFeather, 0.005);
  vec3 colour = uColorA;

  // Du plus ancien au plus recent : l'index 0 est en tete du tampon, donc le
  // dernier applique — c'est lui qui recouvre les autres.
  for (int i = 3; i >= 0; i -= 1) {
    vec4 clic = uClicks[i];

    // Emplacement vide du tampon : rayon enorme et couleur indefinie, on
    // l'ecarte au lieu de le laisser peindre.
    if (clic.z < -100.0) continue;

    vec2 centre = clic.xy * vec2(aspect, 1.0);
    float age = max(uTime - clic.z, 0.0);
    float radius = age * uSpeed;
    float d = length(p - centre);

    float alpha = 1.0 - smoothstep(radius - feather, radius + feather, d);
    vec3 encre = inkColour(clic.w);

    // Le bord qui avance s'eclaire un peu : la vague se voit passer.
    float rim = exp(-abs(d - radius) / feather) * 0.15;

    colour = mix(colour, encre * (1.0 + rim), alpha);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
