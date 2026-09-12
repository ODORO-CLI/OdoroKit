/**
 * Shader des lucioles.
 *
 * ## L'idee mathematique
 *
 * Une luciole par cellule d'une grille, sa position tiree du hachage de la
 * cellule, son clignotement un sinus de phase propre — jamais un tirage par
 * image, qui ne produirait que du bruit. Le halo est une exponentielle
 * decroissante de la distance, sommee sur les neuf cellules voisines pour
 * qu'il traverse les bords de sa cellule.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond nocturne.
 * - `uColorB`, `uColorC` — les deux teintes de lucioles, reparties par graine.
 * - `uSpeed` — cadence du clignotement et de la derive.
 * - `uDensity` — nombre de cellules sur le plus petit cote.
 * - `uGlow` — portee du halo.
 */
export const FIREFLIES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uGlow;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float lucioleHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule : le second est hache depuis
// un point decale, sans quoi x et y seraient lies.
vec2 lucioleHash2(vec2 p) {
  return vec2(lucioleHash(p), lucioleHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uDensity, 1.0);
  float t = uTime * uSpeed;

  vec2 cell = floor(p);
  vec3 colour = uColorA;

  // Les neuf cellules voisines : un halo depasse de sa cellule, et sans ce
  // parcours il serait tranche net a chaque bord de maille.
  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 voisine = cell + vec2(float(dx), float(dy));
      vec2 graine = lucioleHash2(voisine);

      // La luciole derive doucement autour de son point d'attache : deux
      // sinus de frequences non multiples, pour que l'orbite ne se referme
      // jamais exactement.
      vec2 centre = voisine + 0.5
        + 0.28 * vec2(sin(t * 0.7 + graine.x * 6.28318), cos(t * 0.53 + graine.y * 6.28318));

      // Chaque luciole clignote a sa propre phase : la moitie negative du
      // sinus est ecrasee, pour des eclats brefs separes de vraies nuits.
      float phase = graine.x * 6.28318;
      float eclat = pow(max(sin(t * 1.6 + phase), 0.0), 3.0);

      // Halo : une exponentielle de la distance, le profil d'une source
      // ponctuelle vue a travers l'air.
      float d = length(p - centre);
      float halo = exp(-d * d / max(uGlow * uGlow * 0.18, 0.0005)) * eclat;

      vec3 teinte = mix(uColorB, uColorC, lucioleHash(voisine + 11.0));
      colour += teinte * halo;
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
