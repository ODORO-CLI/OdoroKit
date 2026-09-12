/**
 * Shader de la lave.
 *
 * ## L'idee mathematique
 *
 * Des metaballs : chaque centre emet un champ en 1/d2, et c'est la somme des
 * champs qui est seuillee — deux gouttes qui s'approchent fusionnent donc
 * d'elles-memes, sans qu'aucun code ne les recolle. Les centres derivent sur
 * des sinus a periodes non multiples, pour que leurs orbites ne se referment
 * jamais exactement. Deux seuils doux etagent la couleur : le bord sombre, le
 * coeur clair.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — la roche froide du fond.
 * - `uColorB` — le bord des gouttes, encore sombre.
 * - `uColorC` — le coeur en fusion.
 * - `uSpeed` — vitesse de derive des centres.
 * - `uBlobs` — nombre de gouttes, donc de champs sommes.
 * - `uThreshold` — seuil du champ ; plus bas, plus de matiere.
 */
export const LAVA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uBlobs;
uniform float uThreshold;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float laveHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int gouttes = int(clamp(uBlobs, 2.0, 8.0));

  float champ = 0.0;

  for (int i = 0; i < 8; i += 1) {
    if (i >= gouttes) break;

    float graine = float(i) + 1.0;
    float ha = laveHash(graine);
    float hb = laveHash(graine + 17.0);

    // Deux sinus a periodes non multiples : l'orbite ne se referme jamais
    // exactement, donc aucune goutte ne repasse deux fois par le meme chemin.
    vec2 centre = vec2(0.5 * aspect, 0.5) + vec2(
      sin(t * (0.31 + ha * 0.47) + ha * 6.28318) * 0.34 * aspect,
      cos(t * (0.23 + hb * 0.41) + hb * 6.28318) * 0.38
    );

    // Champ en 1/d2 : c'est lui qui fait fusionner les gouttes proches, la
    // somme de deux champs depassant le seuil la ou chacun seul ne le peut.
    vec2 ecart = p - centre;
    float rayon = 0.016 + 0.014 * ha;
    champ += rayon / (dot(ecart, ecart) + 0.002);
  }

  float seuil = max(uThreshold, 0.1);

  // Deux paliers doux : le bord monte vers la teinte sombre bien avant le
  // seuil, le coeur clair n'apparait que nettement au-dela.
  float bord = smoothstep(seuil * 0.55, seuil, champ);
  float coeur = smoothstep(seuil, seuil * 1.9, champ);

  vec3 colour = mix(uColorA, uColorB, bord);
  colour = mix(colour, uColorC, coeur);

  gl_FragColor = vec4(colour, 1.0);
}
`
