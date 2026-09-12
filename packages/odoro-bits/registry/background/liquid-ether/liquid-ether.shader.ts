/**
 * Shader de l'ether liquide.
 *
 * ## L'idee mathematique
 *
 * Une advection sans simulation. Chaque deplacement du pointeur depose un
 * tourbillon : une position, une vitesse, une date. A chaque fragment, les
 * douze depots vivants se somment en un champ de deplacement — la vitesse de
 * chacun, ponderee par une gaussienne de la distance et une exponentielle de
 * l'age. Le bruit fractal est lu au point deplace par ce champ : la matiere
 * semble poussee la ou le pointeur est passe, et se relache quand les depots
 * vieillissent.
 *
 * La meme somme, sans la vitesse, donne une densite de trace : c'est elle
 * qui eclaire le sillage du pointeur, plus clair que la vapeur autour.
 *
 * Ce n'est pas un fluide au sens des equations : rien ne se conserve d'une
 * image a l'autre. Mais l'oeil ne voit qu'une vapeur qui suit la main, et
 * c'est ce qu'il fallait.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la vapeur.
 * - `uColorC` — la trace du pointeur.
 * - `uTrail` — douze depots (x, y, vx, vy), tampon circulaire.
 * - `uStamps` — date de chaque depot, dans le temps du moteur.
 * - `uSpeed` — vitesse de la derive sans pointeur.
 * - `uRadius` — rayon d'un depot.
 * - `uStrength` — force de la poussee.
 * - `uLife` — duree de vie d'un depot.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const LIQUID_ETHER_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec4 uTrail[12];
uniform float uStamps[12];
uniform float uSpeed;
uniform float uRadius;
uniform float uStrength;
uniform float uLife;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float etherHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float etherNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = etherHash(cell);
  float b = etherHash(cell + vec2(1.0, 0.0));
  float c = etherHash(cell + vec2(0.0, 1.0));
  float d = etherHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float etherFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += etherNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;
  float rayon = max(uRadius, 0.02);
  float vie = max(uLife, 0.1);

  vec2 poussee = vec2(0.0);
  float trace = 0.0;

  // Borne constante : la specification du langage l'exige, et douze depots
  // couvrent deja un geste entier — le treizieme serait deja eteint.
  for (int i = 0; i < 12; i += 1) {
    vec4 depot = uTrail[i];
    float age = uTime - uStamps[i];
    // Un depot date a -1000 a un age enorme : son enveloppe est nulle.
    float enveloppe = exp(-age / vie * 3.0) * step(0.0, age);

    vec2 d = p - depot.xy * vec2(aspect, 1.0);
    float poids = exp(-dot(d, d) / (rayon * rayon)) * enveloppe;

    poussee += depot.zw * vec2(aspect, 1.0) * poids;
    trace += poids;
  }

  // Le bruit est lu au point deplace : c'est l'advection. La derive lente
  // sans pointeur vit dans le meme domaine, pour que les deux se composent.
  vec2 q = p * 2.5 - poussee * uStrength * 0.35 + vec2(t * 0.6, t * 0.35);
  float densite = etherFbm(q, octaves);
  float voile = etherFbm(q * 2.1 + vec2(3.7, 1.9) - t * 0.4, octaves);

  // La vapeur : une rampe large, sans bord ; la trace la nourrit un peu.
  float vapeur = smoothstep(0.28, 0.82, densite * 0.7 + voile * 0.3 + trace * 0.2);

  vec3 colour = mix(uColorA, uColorB, vapeur);

  // Le sillage : plus clair la ou le pointeur vient de passer, et d'autant
  // plus que la vapeur y est dense — la lumiere a besoin de matiere.
  float sillage = clamp(trace, 0.0, 1.0);
  colour += uColorC * sillage * (0.25 + 0.55 * densite);

  gl_FragColor = vec4(colour, 1.0);
}
`
