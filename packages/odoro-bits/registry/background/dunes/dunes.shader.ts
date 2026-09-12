/**
 * Shader des dunes.
 *
 * ## L'idee mathematique
 *
 * Des cretes superposees : n courbes horizon — un sinus charpente plus un
 * bruit de valeur qui casse sa regularite — empilees du haut vers le bas.
 * Chaque couche recouvre la precedente par un simple seuillage vertical, et
 * derive a sa propre vitesse : c'est la parallaxe qui donne la profondeur,
 * pas un degrade. Les couches basses sont plus claires, comme un sable qui
 * recoit la lumiere rasante.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le ciel.
 * - `uColorB` — la crete la plus lointaine.
 * - `uColorC` — la crete la plus proche, la plus claire.
 * - `uSpeed` — vitesse de derive des couches.
 * - `uLayers` — nombre de cretes empilees.
 * - `uAmplitude` — hauteur des ondulations.
 */
export const DUNES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uLayers;
uniform float uAmplitude;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float duneHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

// Bruit de valeur 1D : interpolation lissee entre deux tirages entiers.
float duneNoise(float p) {
  float cell = floor(p);
  float local = fract(p);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(duneHash(cell), duneHash(cell + 1.0), smoothed);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;
  int couches = int(clamp(uLayers, 2.0, 6.0));

  vec3 colour = uColorA;

  for (int i = 0; i < 6; i += 1) {
    if (i >= couches) break;

    float k = float(i) / max(float(couches) - 1.0, 1.0);

    // Chaque couche descend d'un cran et ralentit : les cretes proches
    // avancent moins que les lointaines, et ce desaccord est la parallaxe.
    float base = 0.78 - k * 0.55;
    float phase = t * (1.2 - 0.9 * k) + float(i) * 4.7;

    // Un sinus pour la charpente, un bruit pour casser sa regularite : le
    // sinus seul ferait une vague mecanique, le bruit seul un trait nerveux.
    float crete = base + uAmplitude * (
      sin(x * 2.1 + phase) * 0.5 +
      (duneNoise(x * 3.7 + phase * 0.6 + float(i) * 13.0) - 0.5) * 1.0
    );

    // Remplissage sous la courbe : la couche recouvre tout ce qui est
    // au-dessous d'elle, avec un bord adouci d'un demi-pour-cent d'ecran.
    float dessous = smoothstep(crete + 0.004, crete - 0.004, vUv.y);

    // Plus proche, plus clair : la teinte de couche va du lointain au rasant.
    vec3 teinte = mix(uColorB, uColorC, k);
    colour = mix(colour, teinte, dessous);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
