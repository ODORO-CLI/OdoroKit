/**
 * Shader de l'aquarelle.
 *
 * ## L'idee mathematique
 *
 * Chaque tache vit un cycle : elle s'etale — son rayon croit vite puis
 * ralentit, comme l'eau qui gagne le papier —, elle seche, et elle s'efface
 * pour renaitre ailleurs. Le cycle est une phase tiree de l'indice, si bien
 * que les taches ne sont jamais synchrones.
 *
 * Deux details font l'aquarelle plutot que le disque colore. Le bord n'est
 * pas rond : la distance au centre est perturbee par un bruit fractal, ce
 * qui le dechiquete comme l'eau qui suit les fibres. Et le pigment n'est pas
 * uniforme : en sechant, il migre vers le bord et y forme le lisere sombre
 * caracteristique — un anneau dont l'intensite croit avec l'avancement du
 * cycle.
 *
 * Les taches se composent comme des lavis : chacune melange sa couleur au
 * resultat precedent et l'assombrit un peu, ce qui donne l'accumulation
 * des couches la ou elles se recouvrent.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le papier.
 * - `uColorB` — le premier pigment.
 * - `uColorC` — le second pigment.
 * - `uSpeed` — vitesse du cycle.
 * - `uBlots` — nombre de taches vivantes.
 * - `uBleed` — frange du bord.
 * - `uGrain` — grain du papier.
 */
export const WATERCOLOR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBlots;
uniform float uBleed;
uniform float uGrain;

// Nombre pseudo-aleatoire d'un indice : sinus amplifie, partie fractionnaire.
float lavisHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Nombre pseudo-aleatoire d'un point : projection sur une direction
// arbitraire, sinus amplifie, partie fractionnaire.
float lavisHash2(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float lavisNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = lavisHash2(cell);
  float b = lavisHash2(cell + vec2(1.0, 0.0));
  float c = lavisHash2(cell + vec2(0.0, 1.0));
  float d = lavisHash2(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme de trois octaves : assez pour dechiqueter un bord, pas plus.
float lavisFbm(vec2 p) {
  float total = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 3; i += 1) {
    total += lavisNoise(p) * amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }
  return total / 0.875;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int blots = int(clamp(uBlots, 1.0, 10.0));
  float t = uTime * uSpeed;

  // Le papier : un grain fin, dans la couleur du fond, un peu plus sombre
  // dans les creux des fibres.
  float fibres = lavisNoise(p * 90.0) * 0.6 + lavisNoise(p * 220.0) * 0.4;
  vec3 colour = uColorA * (1.0 - (fibres - 0.5) * 0.12 * uGrain);

  // Borne constante : la specification du langage l'exige. Dix taches
  // couvrent deja le papier.
  for (int i = 0; i < 10; i += 1) {
    if (i >= blots) break;
    float fi = float(i);
    float h1 = lavisHash(fi + 5.0);
    float h2 = lavisHash(fi + 19.0);
    float h3 = lavisHash(fi + 37.0);

    // Le cycle : une phase propre, et un numero de cycle qui deplace la
    // tache a chaque renaissance, pour qu'elle ne retombe pas au meme endroit.
    float cycle = (t + h1 * 7.0) / 7.0;
    float tour = floor(cycle);
    float phase = fract(cycle);
    vec2 centre = vec2(
      (0.15 + 0.7 * lavisHash(fi * 3.0 + tour + 1.0)) * aspect,
      0.15 + 0.7 * lavisHash(fi * 5.0 + tour + 2.0)
    );

    // L'etalement : rapide au debut, puis freine — l'eau gagne le papier
    // vite, puis s'y epuise.
    float rayonMax = 0.14 + 0.12 * h2;
    float etalement = 1.0 - pow(1.0 - min(phase / 0.5, 1.0), 3.0);
    float rayon = rayonMax * etalement;

    // Le bord dechiquete : le bruit suit les fibres, il est fixe dans le
    // plan et propre a la tache.
    float frange = lavisFbm(p * 7.0 + vec2(h3 * 40.0, tour * 3.0)) - 0.5;
    float d = length(p - centre) + frange * 0.09 * uBleed;

    float couverture = 1.0 - smoothstep(rayon - 0.015, rayon + 0.005, d);

    // Le sechage : le pigment migre vers le bord a mesure que la phase
    // avance, et le coeur s'eclaircit d'autant.
    float sechage = smoothstep(0.2, 0.75, phase);
    float lisere = smoothstep(rayon - 0.07, rayon - 0.01, d) * couverture;
    float densite = couverture * (0.5 - 0.2 * sechage) + lisere * (0.25 + 0.45 * sechage);

    // L'effacement, a la fin du cycle, puis le retour a zero au debut.
    float vie = (1.0 - smoothstep(0.8, 1.0, phase)) * smoothstep(0.0, 0.04, phase);
    float poids = clamp(densite * vie, 0.0, 1.0);

    // Les pigments alternent d'une tache a l'autre.
    vec3 pigment = mod(fi, 2.0) < 0.5 ? uColorB : uColorC;

    // Un lavis se pose sur le precedent : melange, et leger assombrissement
    // la ou les couches s'accumulent.
    colour = mix(colour, pigment, poids * 0.85);
    colour *= 1.0 - poids * 0.12;
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
