/**
 * Shader de la lampe a lave.
 *
 * ## L'idee mathematique
 *
 * Des surfaces implicites, comme les metaballs, mais contraintes par la
 * lampe : la distance est etiree verticalement, si bien qu'une goutte est un
 * ovale qui s'allonge en montant ; les centres n'ont qu'un mouvement vertical
 * lent, tire d'un sinus a periode propre, et un leger balancement lateral.
 *
 * Une reserve de cire occupe le bas de la colonne : c'est un champ de plus,
 * qui ne depend que de la hauteur et d'un bruit lent. Une goutte qui descend
 * s'y fond sans coupure, et une goutte qui nait en sort — c'est ce qui rend
 * le cycle credible.
 *
 * La couleur n'est pas un palier du champ : chaque goutte porte la sienne,
 * tiree de sa hauteur — chaude en bas, refroidie en haut — et la ou deux
 * gouttes se rejoignent, c'est la moyenne ponderee des champs qui decide.
 * Deux couleurs se melangent donc dans la matiere elle-meme, pas sur ses
 * bords.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, le verre.
 * - `uColorB` — la cire chaude, en bas.
 * - `uColorC` — la cire refroidie, en haut.
 * - `uSpeed` — vitesse de la montee.
 * - `uDrops` — nombre de gouttes.
 * - `uStretch` — etirement vertical des gouttes.
 * - `uGlow` — lueur de la chauffe, en bas.
 */
export const LAVA_LAMP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrops;
uniform float uStretch;
uniform float uGlow;

// Nombre pseudo-aleatoire d'un indice : sinus amplifie, partie fractionnaire.
float lampeHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Nombre pseudo-aleatoire d'un point : projection sur une direction
// arbitraire, sinus amplifie, partie fractionnaire.
float lampeHash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float lampeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = lampeHash2(cell);
  float b = lampeHash2(cell + vec2(1.0, 0.0));
  float c = lampeHash2(cell + vec2(0.0, 1.0));
  float d = lampeHash2(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int drops = int(clamp(uDrops, 1.0, 8.0));
  float stretch = max(uStretch, 1.0);

  float champ = 0.0;
  vec3 teinte = vec3(0.0);

  // Borne constante : la specification du langage l'exige. Huit gouttes
  // remplissent deja la colonne.
  for (int i = 0; i < 8; i += 1) {
    if (i >= drops) break;
    float fi = float(i);
    float h1 = lampeHash(fi + 3.0);
    float h2 = lampeHash(fi + 17.0);
    float h3 = lampeHash(fi + 29.0);

    // La hauteur : un sinus lent a periode propre, borne pour que la goutte
    // parte de la reserve et n'atteigne jamais tout a fait le haut. Le
    // balancement lateral est plus lent encore, et bien plus faible.
    float y = 0.12 + 0.72 * (0.5 + 0.5 * sin(t * (0.6 + h1 * 0.5) + h2 * 6.2831));
    float x = (0.18 + 0.64 * h3 + 0.05 * sin(t * 0.7 + h1 * 6.2831)) * aspect;

    // L'ovale : la distance verticale est divisee par l'etirement, et une
    // goutte qui monte s'allonge un peu plus — la cire chaude est plus fluide.
    float allonge = stretch * (1.0 + 0.25 * (y - 0.4));
    vec2 d = (p - vec2(x, y)) * vec2(1.0, 1.0 / allonge);
    float r = 0.07 + 0.05 * h2;
    float poids = r * r / max(dot(d, d), 0.0001);

    champ += poids;
    // La goutte porte sa couleur : chaude en bas, refroidie en haut.
    teinte += mix(uColorB, uColorC, smoothstep(0.15, 0.85, y)) * poids;
  }

  // La reserve : un champ qui ne depend que de la hauteur, dont la surface
  // ondule d'un bruit lent. Une goutte qui s'y pose s'y fond sans coupure.
  float surface = 0.16 + 0.03 * lampeNoise(vec2(p.x * 4.0 + t * 0.6, t * 0.4));
  float reserve = 0.012 / max((p.y - surface) * (p.y - surface), 0.0001);
  reserve *= step(surface, p.y);
  float niveau = smoothstep(surface + 0.02, surface - 0.04, p.y);
  champ += reserve + niveau * 4.0;
  teinte += uColorB * (reserve + niveau * 4.0);

  // La matiere : un seuil doux — la cire n'a pas de bord franc — et sa couleur
  // moyenne, ponderee par les champs qui la composent.
  float corps = smoothstep(0.75, 1.35, champ);
  vec3 cire = teinte / max(champ, 0.0001);

  // Un relief simple : la cire est plus sombre sur ses bords, plus claire au
  // coeur, ce qui donne du volume sans normale.
  float coeur = smoothstep(1.2, 3.5, champ);
  cire = mix(cire * 0.78, cire * 1.08, coeur);

  // La chauffe : une lueur qui monte du bas, en cloche horizontale.
  float cloche = 1.0 - smoothstep(0.0, aspect * 0.6, abs(p.x - aspect * 0.5));
  float chauffe = pow(1.0 - vUv.y, 3.0) * cloche * uGlow;

  vec3 fond = mix(uColorA, uColorB, chauffe * 0.55);

  gl_FragColor = vec4(mix(fond, cire, corps), 1.0);
}
`
