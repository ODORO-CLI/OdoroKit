/**
 * Shader des lignes flottantes.
 *
 * ## L'idee mathematique
 *
 * Chaque ligne est un segment courbe pose dans un repere propre : un centre
 * qui derive sur deux sinus lents, une direction inclinee qui oscille, une
 * longueur finie. Dans ce repere, le fragment se projette sur l'axe du
 * segment — ce qui donne la position le long de la ligne — et sur sa normale
 * — ce qui donne la distance au trait, moins une flexion sinusoidale.
 *
 * Les extremites ne sont pas coupees : elles s'eteignent sur le dernier tiers
 * de la longueur. C'est ce qui fait flotter le segment au lieu de le poser.
 *
 * Les centres derivent chacun a leur vitesse et les inclinaisons different :
 * deux lignes finissent toujours par se croiser, et c'est le croisement — un
 * point plus lumineux la ou deux halos s'additionnent — qui donne la
 * profondeur.
 *
 * La distance au trait est divisee par la norme de sa pente, comme pour tout
 * y = f(x) : sans cela la flexion epaissirait le trait dans ses courbes.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le halo des lignes.
 * - `uColorC` — le coeur du trait.
 * - `uCount` — nombre de lignes, borne a dix.
 * - `uSpeed` — vitesse de la derive.
 * - `uLength` — longueur des segments, en hauteurs de cadre.
 * - `uGlow` — largeur du halo.
 */
export const FLOATING_LINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSpeed;
uniform float uLength;
uniform float uGlow;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float px = 1.0 / max(uResolution.y, 1.0);
  int count = int(clamp(uCount, 1.0, 10.0));

  float halo = 0.0;
  float core = 0.0;

  // Dix au plus : la borne est constante, la specification du langage
  // l'exige, et au-dela les croisements se brouillent.
  for (int i = 0; i < 10; i += 1) {
    if (i >= count) break;
    float index = float(i);

    // Le centre derive sur deux sinus de periodes differentes : la trajectoire
    // est une figure de Lissajous qui ne se referme pas a l'oeil.
    vec2 centre = vec2(
      aspect * (0.5 + sin(t * (0.21 + index * 0.017) + index * 2.1) * 0.42),
      0.5 + cos(t * (0.17 + index * 0.023) + index * 1.3) * 0.38
    );

    // L'inclinaison oscille autour d'une diagonale propre a la ligne.
    float angle = 0.4 + index * 0.65 + sin(t * 0.13 + index) * 0.35;
    vec2 dir = vec2(cos(angle), sin(angle));
    vec2 normal = vec2(-dir.y, dir.x);

    vec2 rel = p - centre;
    float along = dot(rel, dir);
    float across = dot(rel, normal);

    // Flexion : le segment n'est pas droit, il ondule doucement le long de
    // son axe, et la pente de cette ondulation normalise l'epaisseur.
    float bend = 0.05;
    float freq = 5.0 + index * 0.7;
    float wave = sin(along * freq + t * 1.4 + index);
    float slope = bend * freq * cos(along * freq + t * 1.4 + index);
    float d = abs(across - bend * wave) / sqrt(1.0 + slope * slope);

    // Les extremites s'eteignent sur le dernier tiers : le segment flotte.
    float demi = max(uLength, 0.1) * (0.7 + 0.3 * sin(index * 3.7));
    float ends = 1.0 - smoothstep(demi * 0.65, demi, abs(along));

    float thin = 1.0 - smoothstep(px * 0.6, px * 1.8, d);
    float glow = exp(-d / max(uGlow, 0.005));

    // Chaque ligne a sa propre intensite, qui respire lentement.
    float weight = 0.6 + 0.4 * sin(t * 0.5 + index * 1.9);

    halo += glow * ends * weight;
    core = max(core, thin * ends * weight);
  }

  vec3 colour = mix(uColorA, uColorB, clamp(halo, 0.0, 1.0) * 0.7);
  colour = mix(colour, uColorC, clamp(core, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
