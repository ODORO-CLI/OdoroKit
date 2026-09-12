/**
 * Shader du champ electrique : une echelle de Jacob.
 *
 * ## L'idee mathematique
 *
 * Deux electrodes qui s'ecartent vers le haut, et un arc qui les relie. L'arc
 * nait en bas, la ou les electrodes sont proches, et monte porte par l'air
 * qu'il chauffe ; en haut, l'ecart devient trop grand, l'arc se rompt et un
 * nouveau s'amorce en bas. Le chemin de l'arc est une hauteur deplacee par un
 * bruit multi-octave lu le long de l'axe horizontal, rehache une trentaine de
 * fois par seconde : c'est ce rehachage qui fait le crepitement, pas un
 * mouvement continu.
 *
 * Deux images fantomes suivent l'arc un peu plus bas, plus faibles : l'air
 * ionise garde quelques instants la trace du chemin que l'arc vient de
 * quitter.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la lueur de l'arc et les electrodes.
 * - `uColorC` — le trait de l'arc lui-meme.
 * - `uSpeed` — montees par seconde.
 * - `uJitter` — amplitude du deplacement du chemin.
 * - `uGlow` — portee de la lueur autour du trait.
 * - `uBranches` — octaves du deplacement, donc la brisure du chemin.
 */
export const ELECTRIC_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uJitter;
uniform float uGlow;
uniform float uBranches;

// Cadence du rehachage du chemin, en images par seconde.
const float CREPITEMENT = 28.0;

// Nombre d'images fantomes derriere l'arc.
const int FANTOMES = 2;

float arcHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

float arcNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(arcHash(cell), arcHash(cell + 1.0), smoothed);
}

// Deplacement vertical du chemin le long de x : des octaves de plus en plus
// fines, chacune plus faible. La graine change a chaque rehachage.
float arcChemin(float x, float graine, int octaves) {
  float total = 0.0;
  float amplitude = 0.09;
  float frequence = 3.0;
  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += (arcNoise(x * frequence + graine * 91.0) - 0.5) * amplitude;
    frequence *= 2.2;
    amplitude *= 0.5;
  }
  return total;
}

// Demi-ecart des electrodes a une hauteur donnee : elles divergent.
float arcEcart(float y) {
  return 0.06 + y * 0.34;
}

// Lueur et trait d'un arc a la hauteur "base", d'intensite donnee : deux
// couvertures entre 0 et 1, que le compositeur fond dans le fond. Ajouter
// les couleurs au lieu de les fondre saturerait en blanc sur un theme clair.
vec2 arcRendu(vec2 p, float base, float graine, float intensite, int octaves, float phase) {
  float demi = arcEcart(base);
  // Le chemin ne vit qu'entre les electrodes : hors de leur ecart, rien.
  float dedans = smoothstep(demi + 0.02, demi - 0.01, abs(p.x));
  // Le deplacement est nul aux electrodes, maximal au milieu : l'arc est
  // accroche a ses deux bouts.
  float accroche = 1.0 - pow(abs(p.x) / max(demi, 0.001), 2.0);
  float chemin = base + arcChemin(p.x / max(demi, 0.05), graine, octaves) * uJitter * (0.6 + demi * 2.5) * accroche;

  float ecart = abs(p.y - chemin);
  float trait = exp(-ecart * 260.0);
  float lueur = exp(-ecart * ecart / max(uGlow * uGlow * 0.02, 0.0005));

  // Vers la rupture, l'arc s'effile et s'eteint par a-coups.
  float agonie = smoothstep(1.0, 0.82, phase);
  float vie = intensite * dedans * mix(0.35, 1.0, agonie);

  return vec2(lueur * vie * 0.8, trait * vie);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2((vUv.x - 0.5) * aspect, vUv.y);
  int octaves = int(clamp(uBranches, 1.0, 5.0));

  float cadence = max(uSpeed, 0.02);
  float cycle = floor(uTime * cadence);
  float phase = fract(uTime * cadence);

  // L'arc accelere en montant : l'air chaud le porte de plus en plus vite.
  float hauteur = 0.06 + pow(phase, 1.35) * 0.86;

  // Le rehachage : une graine par image de crepitement, et par cycle.
  float image = floor(uTime * CREPITEMENT);
  float graine = arcHash(image + cycle * 977.0);
  float scintillement = 0.7 + 0.3 * arcHash(image * 3.7 + cycle);

  // Les electrodes : deux traits qui divergent, eclaires par l'arc au
  // passage.
  float demi = arcEcart(vUv.y);
  float electrode = exp(-abs(abs(p.x) - demi) * 320.0);
  float chauffe = exp(-abs(vUv.y - hauteur) * 9.0) * scintillement;

  // L'arc, puis ses fantomes un peu plus bas et plus faibles : les
  // couvertures se combinent par le maximum, pas par la somme.
  vec2 arc = arcRendu(p, hauteur, graine, scintillement, octaves, phase);
  for (int i = 1; i <= FANTOMES; i += 1) {
    float recul = float(i) * 0.028;
    float ancienne = arcHash(image - float(i) * 3.0 + cycle * 977.0);
    vec2 fantome = arcRendu(p, hauteur - recul, ancienne, 0.35 / float(i), octaves, phase) * step(recul, hauteur - 0.03);
    arc = max(arc, fantome);
  }

  // Une lueur montante : l'air au-dessus de l'arc est deja chaud.
  float air = exp(-max(vUv.y - hauteur, 0.0) * 6.0) * exp(-abs(p.x) * 4.0) * step(hauteur, vUv.y);

  // Du fond vers la lueur, puis vers le trait : chaque couche est fondue
  // dans la precedente, ce qui tient sur un theme clair comme sur un sombre.
  float lueur = clamp(air * 0.1 * scintillement + electrode * (0.25 + chauffe * 0.7) + arc.x, 0.0, 1.0);
  vec3 colour = mix(uColorA, uColorB, lueur);
  colour = mix(colour, uColorC, clamp(arc.y, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
