/**
 * Shader du sable qui coule.
 *
 * ## L'idee mathematique
 *
 * Le sable n'est pas une nappe : c'est une grille de grains. Chaque cellule
 * d'une grille fine tire au sort un grain, place a un endroit hache de la
 * cellule ; pour faire couler un filet, il suffit de faire defiler la grille
 * vers le bas, chaque filet a sa propre vitesse. La densite des grains suit
 * la distance a l'axe du filet, si bien que ses bords sont effiloches, grain
 * par grain, plutot que coupes net.
 *
 * En bas, un tas : un profil de hauteur fait de bosses sous chaque filet,
 * rempli de la meme grille, mais immobile. Les grains qui tombent
 * disparaissent a la surface du tas, et un peu de poussiere s'y souleve.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le sable.
 * - `uColorC` — les grains clairs, qui accrochent la lumiere.
 * - `uStreams` — nombre de filets.
 * - `uGrain` — nombre de grains par hauteur de cadre.
 * - `uSpeed` — vitesse de chute.
 * - `uHeap` — hauteur du tas, en hauteurs de cadre.
 */
export const SAND_FLOW_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uStreams;
uniform float uGrain;
uniform float uSpeed;
uniform float uHeap;

// Plafond des filets : la boucle est bornee par une constante.
const int MAX_STREAMS = 6;

float sableHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float sableHash2(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float sableNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(sableHash(cell), sableHash(cell + 1.0), smoothed);
}

// Un grain dans sa cellule : present si le tirage passe le seuil, dessine en
// disque a un endroit hache de la cellule. Rend 0 ou la couverture du disque.
float sableGrain(vec2 q, float seuil, float rayon, float pixel) {
  vec2 cell = floor(q);
  float tirage = sableHash2(cell);
  if (tirage > seuil) return 0.0;
  vec2 centre = cell + 0.5 + (vec2(sableHash2(cell + 3.7), sableHash2(cell + 9.1)) - 0.5) * 0.5;
  float d = length(q - centre);
  return 1.0 - smoothstep(rayon - pixel, rayon + pixel, d);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float grain = max(uGrain, 20.0);
  // Un pixel, en cellules de grain : sert au lissage des disques.
  float pixel = grain / max(uResolution.y, 1.0);
  int total = int(clamp(uStreams, 1.0, float(MAX_STREAMS)));

  // Le filet le plus proche : sa distance, sa vitesse et son point de chute.
  float proche = 10.0;
  float vitesse = 1.0;
  float largeur = 0.02;
  float indiceProche = 0.0;
  float tas = 0.0;

  for (int i = 0; i < MAX_STREAMS; i += 1) {
    if (i >= total) break;
    float indice = float(i);
    float graine = sableHash(indice * 5.3 + 1.1);
    // Les filets se repartissent sur la largeur, un peu decales au hasard.
    float base = (indice + 0.5) / float(total) * aspect + (graine - 0.5) * 0.12 * aspect / float(total);
    // Un filet ondule a peine : le sable tombe droit, a un souffle pres.
    float axe = base + (sableNoise(vUv.y * 2.5 + uTime * 0.35 + graine * 30.0) - 0.5) * 0.03;
    float ecart = abs(p.x - axe);
    if (ecart < proche) {
      proche = ecart;
      vitesse = 0.75 + graine * 0.5;
      largeur = 0.014 + sableHash(indice * 2.9) * 0.016;
      indiceProche = indice;
    }
    // Chaque filet eleve une bosse sous lui.
    float bosse = exp(-pow((p.x - base) / (0.09 + graine * 0.05), 2.0));
    tas += bosse;
  }

  // Le profil du tas : une base plate, des bosses, un grain de surface.
  float hauteur = uHeap * (0.35 + 0.65 * min(tas, 1.3) / 1.3)
    + (sableNoise(p.x * 18.0) - 0.5) * 0.012;
  float dansTas = step(vUv.y, hauteur);

  vec3 colour = uColorA;

  // Le filet qui tombe : la grille defile vers le bas a la vitesse du
  // filet, et la densite s'effiloche avec la distance a l'axe.
  float densite = 0.6 * smoothstep(largeur, largeur * 0.25, proche);
  vec2 chute = vec2(p.x, vUv.y + uTime * uSpeed * vitesse * 0.9 + indiceProche * 3.7) * grain;
  float grainChute = sableGrain(chute, densite, 0.36, pixel) * (1.0 - dansTas);
  // Une ombre douce le long du filet : il reste visible entre deux grains.
  float voile = smoothstep(largeur * 1.5, 0.0, proche) * 0.1 * (1.0 - dansTas);

  // Le tas : la meme grille, immobile, plus dense, dont la surface s'ouvre
  // grain par grain.
  float surface = smoothstep(0.0, 0.015, hauteur - vUv.y);
  vec2 repos = p * grain * 1.15 + 17.0;
  float grainTas = sableGrain(repos, 0.45 + 0.4 * surface, 0.4, pixel) * dansTas;
  float ombreTas = dansTas * (0.35 + 0.35 * surface);

  // La poussiere au point de chute : un souffle qui palpite.
  float palpite = 0.6 + 0.4 * sableNoise(uTime * 6.0 + indiceProche * 11.0);
  float poussiere = exp(-pow(proche / 0.05, 2.0)) * exp(-max(vUv.y - hauteur, 0.0) * 30.0)
    * (1.0 - dansTas) * 0.18 * palpite;

  // Les grains clairs sont tires au sort parmi les grains, chacun d'apres
  // sa propre cellule : un grain qui tombe garde sa teinte en tombant.
  vec2 cellule = grainChute > grainTas ? floor(chute) : floor(repos);
  float clair = step(0.78, sableHash2(cellule + 2.0));

  colour = mix(colour, uColorB, clamp(voile + ombreTas + poussiere, 0.0, 1.0));
  float grains = max(grainChute, grainTas);
  colour = mix(colour, mix(uColorB, uColorC, clair), grains * 0.95);

  gl_FragColor = vec4(colour, 1.0);
}
`
