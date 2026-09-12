/**
 * Shader de la trainee de pixels.
 *
 * ## L'idee mathematique
 *
 * Le fragment ne se demande jamais s'il est eclaire : c'est **le centre de
 * son pixel** qui est teste contre les quatorze depots du tampon. Toute la
 * cellule recoit donc la meme valeur, et la trainee sort crenelee au lieu
 * de sortir floue — ce qui est exactement la difference entre une trainee
 * de pixels et une trainee lumineuse.
 *
 * L'extinction n'est pas continue non plus : la valeur retenue est arrondie
 * au palier superieur d'une echelle reglable. Un pixel d'ecran descend d'un
 * cran, il ne se fane pas.
 *
 * Un depot a -1000 donne un age enorme, donc une contribution nulle : les
 * emplacements vides du tampon sont inertes d'office.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les pixels froids, en fin de trainee.
 * - `uColorC` — les pixels frais, sous le curseur.
 * - `uTrail` — quatorze depots (x, y, date de depot), tampon circulaire.
 * - `uPixel` — nombre de pixels sur la hauteur.
 * - `uLife` — duree de vie d un pixel allume, en secondes.
 * - `uLevels` — nombre de paliers d extinction.
 */
export const PIXEL_TRAIL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uTrail[14];
uniform float uPixel;
uniform float uLife;
uniform float uLevels;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);

  float scale = clamp(uPixel, 6.0, 90.0);
  vec2 cell = floor(uv * scale);
  vec2 local = fract(uv * scale) - 0.5;

  // Le centre du pixel, et le rayon dans lequel un depot l'allume : un peu
  // plus d'une demi-cellule, pour qu'un geste rapide ne laisse pas de trou.
  vec2 centre = (cell + 0.5) / scale;
  float reach = 0.85 / scale;

  float best = 0.0;

  // Borne constante : la specification du langage l'exige.
  for (int i = 0; i < 14; i += 1) {
    vec3 depot = uTrail[i];
    vec2 d = abs(centre - depot.xy * vec2(aspect, 1.0));
    float age = max(uTime - depot.z, 0.0);

    float touched = step(max(d.x, d.y), reach);
    float alive = clamp(1.0 - age / max(uLife, 0.05), 0.0, 1.0);
    best = max(best, touched * alive);
  }

  // L'extinction par paliers : l'arrondi superieur garde le premier cran
  // entier tant que le pixel n'est pas eteint pour de bon.
  float levels = max(floor(uLevels), 1.0);
  float steps = ceil(best * levels) / levels;

  // La fraicheur decroit plus vite que la valeur : la teinte vive reste
  // pres du curseur, la trainee retombe sur la teinte froide.
  float fresh = best * best * best;

  // Un filet de fond entre les pixels : sans lui, deux pixels voisins
  // allumes forment un aplat et la trame disparait.
  float gap = smoothstep(0.0, 0.06, 0.5 - max(abs(local.x), abs(local.y)) - 0.03);

  vec3 lit = mix(uColorB, uColorC, fresh);
  vec3 colour = mix(uColorA, lit, steps * gap);

  gl_FragColor = vec4(colour, 1.0);
}
`
