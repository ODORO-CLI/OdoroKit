/**
 * Shader du halo qui pulse.
 *
 * ## L'idee mathematique
 *
 * Un coeur gaussien qui respire au rythme d'une periode reglable, et des
 * anneaux emis a ce meme rythme : chacun est une gaussienne de la distance
 * au centre, dont le rayon croit avec sa phase, qui s'elargit et palit en
 * s'eloignant. Les anneaux se repartissent uniformement sur la periode, si
 * bien que l'emission est reguliere, jamais en rafale.
 *
 * Distinct du sonar, dont les fronts sont raides, suivent le pointeur et
 * laissent une traine sombre : ici tout est doux, lent, et pose par melange
 * borne vers les teintes.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les anneaux et le halo.
 * - `uColorC` — le coeur.
 * - `uX`, `uY` — position du centre, en fraction du cadre.
 * - `uPeriod` — periode du rythme, en secondes.
 * - `uRings` — nombre d'anneaux en vol.
 * - `uSize` — portee des anneaux, en hauteurs de cadre.
 */
export const HALO_PULSE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uPeriod;
uniform float uRings;
uniform float uSize;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(uX * aspect, uY);
  float r = length(p - centre);

  float periode = max(uPeriod, 0.5);
  float portee = max(uSize, 0.1);
  int n = int(clamp(uRings, 1.0, 6.0));

  // Les anneaux : chacun decale d'une fraction de la periode, pour une
  // emission reguliere. Le rayon croit avec la phase ; la largeur aussi,
  // et l'intensite tombe au carre — un anneau meurt avant sa portee.
  float anneaux = 0.0;
  for (int i = 0; i < 6; i += 1) {
    if (i >= n) break;
    float phase = fract(uTime / periode + float(i) / float(n));
    float rayon = phase * portee;
    float largeur = 0.012 + 0.06 * phase;
    float e = (r - rayon) / largeur;
    float vie = 1.0 - phase;
    anneaux += exp(-e * e) * vie * vie;
  }

  // Le coeur respire au meme rythme : il grossit a l'emission.
  float souffle = 0.5 + 0.5 * sin(uTime / periode * 6.2831853);
  float coeur = exp(-r * r / (0.012 + 0.012 * souffle));
  float halo = exp(-r * (7.0 - 2.5 * souffle)) * 0.5;

  vec3 colour = mix(uColorA, uColorB, clamp(anneaux * 0.8 + halo * 0.6, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(coeur * (0.7 + 0.3 * souffle), 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
