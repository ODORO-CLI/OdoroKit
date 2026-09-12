/**
 * Shader du marbre.
 *
 * ## L'idee mathematique
 *
 * Une deformation de domaine en trois etages : un bruit est lu la ou un
 * second bruit l'a deplace, lui-meme lu la ou un troisieme l'a deplace. Un
 * seul etage donne des volutes ; trois donnent les plis serres et les
 * torsions d'une pierre qui a coule avant de se figer.
 *
 * Les veines ne sont pas un palier du bruit : elles sont les lignes de
 * niveau d'un sinus du bruit deforme — la ou le sinus s'annule — affinees
 * par une puissance. C'est ce qui les rend fines et continues, la ou un
 * simple seuil donnerait des taches. Un second reseau, plus fin et plus
 * rare, porte l'accent.
 *
 * Le temps n'entre que dans le premier etage, tres lentement : le marbre
 * n'est pas cense bouger, seulement respirer assez pour qu'on ne le prenne
 * pas pour une image.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — la pierre.
 * - `uColorB` — les veines.
 * - `uColorC` — le filet d'accent.
 * - `uSpeed` — vitesse de la deformation.
 * - `uScale` — echelle du motif.
 * - `uVeins` — finesse des veines.
 * - `uOctaves` — octaves de chaque bruit, et donc le cout.
 */
export const MARBLE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uVeins;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float marbreHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float marbreNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = marbreHash(cell);
  float b = marbreHash(cell + vec2(1.0, 0.0));
  float c = marbreHash(cell + vec2(0.0, 1.0));
  float d = marbreHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float marbreFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += marbreNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // Les trois etages : chaque bruit deplace le domaine du suivant. Deux
  // composantes par etage, lues a des decalages differents, pour que le
  // deplacement ait une direction et pas seulement une amplitude.
  vec2 q = vec2(
    marbreFbm(p + vec2(t, 0.0), octaves),
    marbreFbm(p + vec2(5.2, 1.3) - t * 0.7, octaves)
  );
  vec2 r = vec2(
    marbreFbm(p + 4.0 * q + vec2(1.7, 9.2), octaves),
    marbreFbm(p + 4.0 * q + vec2(8.3, 2.8), octaves)
  );
  float v = marbreFbm(p + 4.0 * r, octaves);

  // Les veines : les zeros d'un sinus du bruit deforme, affines par une
  // puissance qui croit avec le reglage. La deformation par r ajoute les
  // torsions serrees qui font la difference avec des lignes ondulees.
  float finesse = mix(3.0, 14.0, clamp(uVeins, 0.0, 1.0));
  float onde = sin(v * 12.0 + r.x * 4.0);
  float veine = pow(1.0 - abs(onde), finesse);

  // Un reseau plus fin et plus rare, pour l'accent : sa frequence est plus
  // haute, et son seuil plus severe.
  float ondeFine = sin(v * 31.0 - r.y * 6.0 + q.x * 3.0);
  float filet = pow(1.0 - abs(ondeFine), finesse * 2.0) * smoothstep(0.45, 0.7, q.y);

  // La pierre : une marbrure douce dans la couleur du fond, pour qu'elle ne
  // soit pas un aplat entre les veines.
  vec3 pierre = uColorA * (1.0 - (q.x - 0.5) * 0.1);
  pierre = mix(pierre, uColorB, smoothstep(0.55, 0.9, r.y) * 0.18);

  vec3 colour = mix(pierre, uColorB, clamp(veine, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(filet, 0.0, 1.0) * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
