/**
 * Shader du mur de LED.
 *
 * ## L'idee mathematique
 *
 * Deux images superposees. La premiere est ce que le mur affiche : un
 * degrade lent, somme de quelques sinus du temps et de la position. Elle
 * n'est jamais lue au pixel — elle est echantillonnee au centre de chaque
 * pastille, si bien qu'une pastille est d'une seule couleur, comme une
 * vraie diode. C'est cet echantillonnage qui fait le mur : la meme image
 * lue en continu serait un simple degrade.
 *
 * La seconde est la pastille elle-meme : un carre arrondi lu par sa distance
 * signee, avec un espace autour ou le fond — le boitier — reste visible. Un
 * halo court deborde de la pastille sans atteindre ses voisines : une diode
 * eclaire un peu son entourage. Chaque pastille a une luminance un peu
 * inegale, tiree une fois, parce qu'un mur reel n'est jamais uniforme.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, entre les pastilles.
 * - `uColorB` — la premiere couleur du degrade affiche.
 * - `uColorC` — la seconde.
 * - `uPixels` — nombre de pastilles sur la hauteur.
 * - `uSpeed` — vitesse du degrade.
 * - `uGap` — espace entre les pastilles, en fraction de pastille.
 * - `uBloom` — poids du halo autour de chaque pastille.
 */
export const LED_WALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uPixels;
uniform float uSpeed;
uniform float uGap;
uniform float uBloom;

// Nombre pseudo-aleatoire, stable par pastille.
float hash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// Distance signee a un carre arrondi centre sur l'origine.
float roundedBox(vec2 point, float extent, float radius) {
  vec2 d = abs(point) - extent + radius;
  return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0) - radius;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float pixels = clamp(uPixels, 4.0, 120.0);
  vec2 p = vUv * vec2(aspect, 1.0) * pixels;

  // Un pixel d'ecran, en unites de pastille.
  float px = pixels / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  // L'image affichee, echantillonnee au centre de la pastille.
  vec2 c = (id + 0.5) / pixels;
  float t = uTime * uSpeed;
  float v = sin(c.x * 2.2 + t)
    + sin(c.y * 3.1 - t * 0.8)
    + sin((c.x + c.y) * 1.7 + t * 0.6)
    + sin(length(c - vec2(aspect * 0.5, 0.5)) * 5.0 - t);
  vec3 image = mix(uColorB, uColorC, smoothstep(0.15, 0.85, v * 0.125 + 0.5));

  // La pastille : un carre arrondi, et l'espace autour.
  float gap = clamp(uGap, 0.05, 0.6);
  float extent = 0.5 - gap * 0.5;
  float dist = roundedBox(f, extent, extent * 0.45);
  float led = 1.0 - smoothstep(-px, px, dist);

  // Le halo : il deborde de la pastille sans atteindre ses voisines.
  float bloom = exp(-max(dist, 0.0) * 6.0) * clamp(uBloom, 0.0, 1.0);

  // Une luminance inegale d'une pastille a l'autre, tiree une fois.
  float wear = 0.82 + 0.18 * hash(id);

  vec3 colour = mix(uColorA, image, (led + bloom * (1.0 - led)) * wear);

  gl_FragColor = vec4(colour, 1.0);
}
`
