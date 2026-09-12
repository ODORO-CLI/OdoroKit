/**
 * Shader des gouttes.
 *
 * ## L'idee mathematique
 *
 * Chaque goutte emet des anneaux amortis : un sinus de la distance a son
 * centre, retarde par le temps, multiplie par une exponentielle decroissante
 * de cette meme distance — sin(d.f - t).exp(-d.a). Les ondes se somment, et
 * la ou deux trains d'anneaux se croisent, ils interferent comme a la surface
 * d'une eau calme.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, l'eau au repos.
 * - `uColorB` — la teinte des cretes.
 * - `uColorC` — la teinte des creux.
 * - `uSpeed` — vitesse de propagation des anneaux.
 * - `uDrops` — nombre de gouttes, borne a douze.
 * - `uDecay` — amortissement : plus haut, plus les anneaux restent pres de
 *   leur centre.
 */
export const RIPPLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrops;
uniform float uDecay;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float goutteHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  float gouttes = clamp(uDrops, 1.0, 12.0);
  float onde = 0.0;

  for (int i = 0; i < 12; i += 1) {
    if (float(i) >= gouttes) break;

    // Le centre est tire du rang de la goutte : deterministe, donc stable
    // d'une image a l'autre — un tirage par image ne ferait que du bruit.
    float n = float(i);
    vec2 centre = vec2(goutteHash(vec2(n, 1.0)) * aspect, goutteHash(vec2(n, 7.0)));

    // L'anneau amorti : le sinus propage, l'exponentielle eteint. Le
    // dephasage par goutte les desynchronise, sans quoi toutes battraient
    // d'un meme coeur.
    float d = length(p - centre);
    onde += sin(d * 28.0 - t * 3.0 + n * 2.4) * exp(-d * max(uDecay, 0.1));
  }

  // La somme est ramenee autour de zero par goutte : l'amplitude ne doit pas
  // croitre avec leur nombre, seulement se peupler d'interferences.
  onde /= sqrt(gouttes);

  // Les cretes prennent une teinte, les creux l'autre : c'est le signe de
  // l'onde qui choisit, sa valeur absolue qui dose.
  vec3 colour = mix(uColorA, uColorB, smoothstep(0.0, 0.9, max(onde, 0.0)));
  colour = mix(colour, uColorC, smoothstep(0.0, 0.9, max(-onde, 0.0)));

  gl_FragColor = vec4(colour, 1.0);
}
`
