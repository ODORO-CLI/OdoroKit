/**
 * Shader du sismographe.
 *
 * ## L'idee mathematique
 *
 * Le papier defile vers la gauche ; les stylets sont fixes. Un fragment a
 * l'abscisse x porte donc ce qu'un stylet y a ecrit a un instant passe, et
 * cet instant se calcule : le point de papier sous le fragment etait sous
 * le stylet il y a `(xStylet - x) / vitesse` secondes. Un clic pose un stylet
 * a son abscisse ; la secousse qu'il ecrit est un sinus amorti du temps
 * ecoule depuis le clic, et elle ne peut exister que sur le papier deja
 * passe sous ce stylet — entre le point du clic et la longueur de papier
 * defilee depuis.
 *
 * Chaque trace est confinee a sa bande horizontale : la secousse est ponderee
 * par la distance verticale entre la trace et le clic, en gaussienne, et son
 * amplitude est bornee a une demi-bande. Le fragment n'evalue donc que sa
 * propre trace, et les huit clics vivants.
 *
 * La pente de la trace est obtenue par difference finie plutot que par
 * derivation analytique : la somme de huit sinus amortis fenetres se derive
 * mal, et deux evaluations de plus coutent moins qu'une formule fausse.
 *
 * Un clic a -1000 a un age enorme : sa secousse est eteinte d'office.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le papier.
 * - `uColorB` — l'encre des traces.
 * - `uColorC` — l'encre fraiche d'une secousse.
 * - `uClicks` — huit clics (x, y, temps de depart), tampon circulaire.
 * - `uTraces` — nombre de traces.
 * - `uScroll` — vitesse du papier, en largeurs de cadre par seconde.
 * - `uDecay` — vitesse d'amortissement des secousses.
 * - `uAmplitude` — force des secousses, en demi-bandes.
 */
export const SEISMOGRAPH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[8];
uniform float uTraces;
uniform float uScroll;
uniform float uDecay;
uniform float uAmplitude;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float sismoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur a une dimension le long du papier, par trace.
float sismoNoise(float u, float row) {
  float cell = floor(u);
  float local = fract(u);
  float smoothed = local * local * (3.0 - 2.0 * local);
  return mix(sismoHash(vec2(cell, row)), sismoHash(vec2(cell + 1.0, row)), smoothed);
}

// La secousse ecrite sur le papier a l'abscisse x, pour la trace donnee.
// Rend un deplacement en fraction de demi-bande, et la fraicheur de l'encre.
vec2 secousse(float x, float centre, float traces) {
  float shake = 0.0;
  float fresh = 0.0;

  // Bornes constantes : la specification du langage l'exige, et huit
  // secousses vivantes suffisent — la neuvieme serait deja sortie du cadre.
  for (int i = 0; i < 8; i += 1) {
    vec3 clic = uClicks[i];
    float age = uTime - clic.z;

    // Le temps ecoule depuis le clic quand ce point de papier etait sous le
    // stylet : negatif a droite du stylet (pas encore ecrit), superieur a
    // l'age a gauche de la longueur defilee (ecrit avant le clic).
    float tau = age + (x - clic.x) / max(uScroll, 0.001);
    float written = step(0.0, tau) * step(tau, age);

    // Un sinus amorti, dont la frequence baisse avec le temps comme une
    // replique s'assourdit.
    float envelope = exp(-uDecay * max(tau, 0.0));
    float wave = sin(tau * (28.0 - 12.0 * clamp(tau, 0.0, 1.0)));

    // La trace ne tremble que si le clic est a sa hauteur.
    float reach = exp(-pow((centre - clic.y) * traces * 0.8, 2.0));

    shake += wave * envelope * written * reach;
    fresh = max(fresh, envelope * written * reach);
  }

  return vec2(shake, fresh);
}

// L'ordonnee de la trace a l'abscisse x : son axe, le tremblement de fond du
// papier, la secousse.
float trace(float x, float index, float traces, float pitch) {
  float centre = (index + 0.5) * pitch;

  // Le papier en coordonnees propres : ce qui y est ecrit defile avec lui.
  float paper = x + uTime * uScroll;
  float jitter = (sismoNoise(paper * 60.0, index) - 0.5) * pitch * 0.12;

  float shake = clamp(secousse(x, centre, traces).x * uAmplitude, -1.0, 1.0);
  return centre + jitter + shake * pitch * 0.45;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float traces = clamp(uTraces, 1.0, 8.0);
  float pitch = 1.0 / traces;
  float index = floor(vUv.y * traces);
  float px = 1.0 / max(uResolution.y, 1.0);

  // Pente par difference finie, deux lectures de part et d'autre.
  float e = 1.5 / max(uResolution.x, 1.0);
  float y = trace(vUv.x, index, traces, pitch);
  float slope = (trace(vUv.x + e, index, traces, pitch) - trace(vUv.x - e, index, traces, pitch))
    / (2.0 * e * aspect);
  float d = abs(vUv.y - y) / sqrt(1.0 + slope * slope);

  float ink = 1.0 - smoothstep(px * 0.7, px * 1.9, d);
  float fresh = secousse(vUv.x, (index + 0.5) * pitch, traces).y;

  // Le papier : une regle fine par bande, et des graduations qui defilent.
  float rule = 1.0 - smoothstep(px * 0.5, px * 1.5, abs(fract(vUv.y * traces + 0.5) - 0.5) * pitch);
  float paper = vUv.x + uTime * uScroll;
  float tick = 1.0 - smoothstep(0.0, 1.5 / max(uResolution.x, 1.0), abs(fract(paper * 20.0 + 0.5) - 0.5) / 20.0);

  vec3 colour = mix(uColorA, uColorB, rule * 0.12 + tick * 0.06);
  colour = mix(colour, uColorB, ink * 0.9);
  colour = mix(colour, uColorC, ink * fresh);

  gl_FragColor = vec4(colour, 1.0);
}
`
