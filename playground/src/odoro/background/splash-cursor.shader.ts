/**
 * Shader des eclaboussures.
 *
 * ## L'idee mathematique
 *
 * Dix taches vivantes a la fois, chacune deposee par la boucle quand le
 * pointeur bouge. Une tache n'est pas un disque : son rayon est module par
 * deux harmoniques de l'angle polaire, dephasees par une graine tiree de sa
 * date de depot. Deux taches n'ont donc jamais le meme contour.
 *
 * Elle s'ouvre vite puis se stabilise — une exponentielle croissante — et
 * s'eteint lentement, en exponentielle decroissante de l'age. Les
 * contributions se somment, et la teinte est leur moyenne ponderee : deux
 * taches qui se recouvrent melangent leurs couleurs au lieu de se masquer,
 * ce qu'une peinture fraiche fait aussi.
 *
 * Un depot a -1000 donne un age enorme, donc une contribution nulle : les
 * emplacements vides du tampon sont inertes d'office.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte de peinture.
 * - `uColorC` — la seconde teinte de peinture.
 * - `uSplash` — dix depots (x, y, date de depot), tampon circulaire.
 * - `uLife` — duree de vie d une tache, en secondes.
 * - `uSize` — rayon d une tache, en hauteurs de cadre.
 * - `uLobes` — irregularite du contour, entre zero et un.
 */
export const SPLASH_CURSOR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uSplash[10];
uniform float uLife;
uniform float uSize;
uniform float uLobes;

// Graine d'une tache : sa date de depot suffit, elle est unique.
float splashSeed(float birth) {
  return fract(sin(birth * 78.233) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float amount = 0.0;
  vec3 tint = vec3(0.0);

  // Borne constante : la specification du langage l'exige, et dix taches
  // suffisent a couvrir un geste rapide sans laisser de trou.
  for (int i = 0; i < 10; i += 1) {
    vec3 blot = uSplash[i];
    vec2 d = p - blot.xy * vec2(aspect, 1.0);
    float age = max(uTime - blot.z, 0.0);
    float seed = splashSeed(blot.z);

    // Le contour : deux harmoniques basses de l'angle, dephasees par la
    // graine. Plus hautes, la tache tournerait a l'etoile.
    float angle = atan(d.y, d.x);
    float lobes = 1.0
      + uLobes * 0.22 * sin(angle * 3.0 + seed * 24.0)
      + uLobes * 0.10 * sin(angle * 7.0 - seed * 17.0);

    float grown = 1.0 - exp(-age * 5.0);
    float radius = max(uSize, 0.01) * lobes * grown;
    float fade = exp(-age / max(uLife, 0.05));

    float blob = (1.0 - smoothstep(radius * 0.45, radius, length(d))) * fade;

    amount += blob;
    tint += mix(uColorB, uColorC, fract(seed * 6.0)) * blob;
  }

  // Moyenne ponderee : la ou rien n'est depose, le quotient n'est jamais
  // evalue puisque le melange retombe entierement sur le fond.
  vec3 paint = tint / max(amount, 0.0001);
  vec3 colour = mix(uColorA, paint, clamp(amount, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
