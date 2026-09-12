/**
 * Shader de l'explosion de pixels.
 *
 * ## L'idee mathematique
 *
 * Le cadre est une trame de pixels carres, et tout ce qui s'y dessine est
 * aligne dessus : le fragment ne connait que la cellule de trame qu'il
 * occupe. Une gerbe est un point de depart, un age et une graine ; chacun de
 * ses pixels part dans une direction hachee, ralentit d'une trainee et
 * retombe sous la gravite — position analytique, rien n'est integre d'image
 * en image. Le pixel est allume si sa cellule de trame est celle du
 * fragment : pas de halo, pas de disque, un carre franc qui saute de case en
 * case.
 *
 * L'explosion elle-meme est un carre plein qui s'elargit d'une case par
 * instant et s'eteint aussitot. Un pixel qui touche le bas du cadre s'y
 * arrete un instant avant de disparaitre : c'est ce qui fait la retombee.
 *
 * Les gerbes vivent dans un tampon de cinq emplacements dates par l'horloge
 * du moteur — un depart a -1000 donne un age enorme, donc une gerbe inerte —
 * et une gerbe automatique part toute seule a un point hache.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB`, `uColorC` — les deux teintes de pixels, melangees par gerbe.
 * - `uClicks` — cinq gerbes (x, y, temps de depart), tampon circulaire.
 * - `uPixels` — pixels de la trame sur la hauteur.
 * - `uCount` — pixels par gerbe, et donc le cout.
 * - `uGravity` — force de la retombee.
 * - `uAuto` — periode des gerbes automatiques, en secondes ; zero les coupe.
 */
export const PIXEL_BLAST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[5];
uniform float uPixels;
uniform float uCount;
uniform float uGravity;
uniform float uAuto;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float blastHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme graine.
vec2 blastHash2(vec2 p) {
  return vec2(blastHash(p), blastHash(p + vec2(37.3, 17.7)));
}

// Lumiere qu'une gerbe depose dans la cellule de trame donnee, a l'age donne.
vec3 gerbe(vec2 cell, vec2 origine, float age, float graine, int pixels, float trame) {
  if (age < 0.0 || age > 4.0) return vec3(0.0);

  vec3 lumiere = vec3(0.0);
  float teinte = blastHash(vec2(graine, 3.1));
  float k = 1.4;
  float portee = (1.0 - exp(-k * age)) / k;
  float chute = uGravity * age * age * 0.5;
  float sol = 0.5 / trame;

  // Bornes constantes : la specification du langage l'exige ; la qualite
  // sort plus tot.
  for (int j = 0; j < 32; j += 1) {
    if (j >= pixels) break;
    float fj = float(j);
    vec2 h = blastHash2(vec2(fj, graine));

    float angle = (fj + h.x * 0.9) / float(pixels) * 6.2831853;
    float v0 = 0.25 + 0.3 * h.y;

    vec2 pos = origine + vec2(cos(angle), sin(angle)) * v0 * portee;
    pos.y -= chute;

    // Le pixel s'arrete au sol, puis s'eteint : la retombee se voit.
    float posed = step(pos.y, sol);
    pos.y = max(pos.y, sol);

    vec2 pc = floor(pos * trame);
    float hit = step(abs(pc.x - cell.x), 0.5) * step(abs(pc.y - cell.y), 0.5);

    float vie = exp(-age * (0.9 + 0.6 * h.x)) * (1.0 - posed * min(age, 1.0) * 0.6);
    vec3 couleur = mix(uColorB, uColorC, fract(teinte + h.y * 0.4));
    lumiere += couleur * hit * vie;
  }

  // L'explosion : un carre plein qui s'elargit d'une case par instant.
  vec2 oc = floor(origine * trame);
  float rayon = floor(age * 18.0);
  float carre = step(max(abs(cell.x - oc.x), abs(cell.y - oc.y)), rayon) * exp(-age * 9.0);
  lumiere += uColorC * carre;

  return lumiere;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float trame = max(uPixels, 4.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 cell = floor(p * trame);
  int pixels = int(clamp(uCount, 4.0, 32.0));

  // La trame au repos : un damier a peine visible, pour que les pixels aient
  // une grille sur laquelle tomber.
  float damier = mod(cell.x + cell.y, 2.0);
  vec3 colour = mix(uColorA, uColorB, 0.025 + 0.02 * damier);

  for (int i = 0; i < 5; i += 1) {
    vec3 clic = uClicks[i];
    vec2 origine = clic.xy * vec2(aspect, 1.0);
    colour += gerbe(cell, origine, uTime - clic.z, clic.z * 7.3 + float(i), pixels, trame);
  }

  // La gerbe automatique : une par periode, a un point hache du cadre.
  if (uAuto > 0.0) {
    float periode = max(uAuto, 0.5);
    float index = floor(uTime / periode);
    float ageAuto = uTime - index * periode;
    vec2 origineAuto = vec2(0.15 + 0.7 * blastHash(vec2(index, 1.3)), 0.35 + 0.5 * blastHash(vec2(index, 9.1)));
    colour += gerbe(cell, origineAuto * vec2(aspect, 1.0), ageAuto, index * 3.7, pixels, trame);
  }

  gl_FragColor = vec4(min(colour, vec3(1.0)), 1.0);
}
`
