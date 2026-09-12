/**
 * Shader des rubans.
 *
 * ## L'idee mathematique
 *
 * Chaque ruban est une sinusoide horizontale a sa propre phase, et sa lumiere
 * est une exponentielle de la distance verticale a son axe : loin du ruban la
 * contribution s'eteint, pres de lui elle sature doucement. Les rubans se
 * somment, si bien que leurs croisements s'eclaircissent d'eux-memes.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB`, `uColorC` — les deux teintes entre lesquelles les rubans sont
 *   etages, du bas vers le haut.
 * - `uSpeed` — vitesse de l'ondulation.
 * - `uCount` — nombre de rubans, borne a dix.
 * - `uAmplitude` — hauteur de l'ondulation, en fraction du cadre.
 */
export const RIBBONS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uCount;
uniform float uAmplitude;

// Trois sinus de frequences non multiples : ils ne se remettent jamais en
// phase, donc l'ondulation ne se lit pas comme un motif mecanique.
float rubanOnde(float x, float phase) {
  return sin(x * 1.0 + phase) * 0.55
    + sin(x * 2.1 + phase * 1.7) * 0.30
    + sin(x * 3.7 + phase * 0.6) * 0.15;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect * 4.0;
  float t = uTime * uSpeed;

  float rubans = clamp(uCount, 1.0, 10.0);
  vec3 colour = uColorA;

  for (int i = 0; i < 10; i += 1) {
    if (float(i) >= rubans) break;

    float k = (float(i) + 0.5) / rubans;

    // Le dephasage vertical : chaque ruban recoit une phase liee a son rang,
    // sans quoi tous onduleraient d'un seul bloc.
    float axe = k + uAmplitude * rubanOnde(x, t + k * 6.28318);

    // Attenuation par distance a l'axe : une exponentielle, le profil d'une
    // lueur, la ou un simple seuil ferait des bandes plates.
    float ecart = abs(vUv.y - axe);
    float lueur = exp(-ecart * ecart * 2400.0) + exp(-ecart * ecart * 220.0) * 0.35;

    vec3 teinte = mix(uColorB, uColorC, k);
    colour += teinte * lueur * (0.35 + 0.65 * k);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
