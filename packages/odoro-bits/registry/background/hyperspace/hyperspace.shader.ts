/**
 * Shader de l'hyperespace.
 *
 * ## L'idee mathematique
 *
 * Le cadre est lu en coordonnees polaires depuis son centre, le point de fuite.
 * L'angle decoupe le plan en rayons ; le long de chaque rayon, la distance est
 * lue en logarithme : une cellule de longueur constante dans ce domaine est
 * minuscule pres du centre et large au bord, ce qui est exactement la
 * perspective d'un objet qui fonce vers la camera. Le temps translate ce
 * domaine vers l'exterieur, et chaque cellule hachee porte ou non une etoile.
 *
 * La trainee est une rampe le long de la cellule : tete nette a l'avant, queue
 * qui s'eteint derriere, d'une longueur qui croit avec la vitesse — a l'arret
 * on verrait des points, a pleine vitesse des traits. L'epaisseur est mesuree
 * en distance reelle au rayon, pas en angle, pour que le trait reste aussi fin
 * pres du centre qu'au bord.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps des trainees.
 * - `uColorC` — la tete chaude des trainees.
 * - `uSpeed` — vitesse du defilement vers la camera.
 * - `uDensity` — nombre de rayons sur un tour, pour la couche proche.
 * - `uStretch` — allongement des trainees, en plus de celui que donne la vitesse.
 * - `uLayers` — nombre de couches evaluees, et donc le cout.
 */
export const HYPERSPACE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uStretch;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float hyperHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = (vUv - 0.5) * vec2(aspect, 1.0);
  float r = length(uv);
  float a = atan(uv.y, uv.x);
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  vec3 colour = uColorA;

  // La longueur de trainee suit la vitesse : c'est ce qui fait lire le
  // defilement comme une acceleration plutot que comme une pluie de points.
  float len = clamp(0.12 + uStretch * uSpeed * 0.35, 0.05, 0.95);

  // Trois couches de rayons, decalees en angle et en cadence : sans elles,
  // les etoiles d'un meme rayon sortiraient toutes du meme trou.
  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float n = max(uDensity, 8.0) * (1.0 + depth * 0.5);

    float ang = (a + depth * 1.7) / 6.28318 * n;
    float ray = floor(ang);

    // Ecart au rayon en distance reelle : angle residuel fois rayon. Le trait
    // garde ainsi la meme finesse a toute distance du centre.
    float lateral = (fract(ang) - 0.5) * (6.28318 / n) * r;

    // Distance en logarithme, translatee par le temps : la cellule fuit vers
    // l'exterieur en accelerant, comme le veut la perspective.
    float z = log(max(r, 0.01)) * 3.0 - t * (1.0 + depth * 0.35) + hyperHash(vec2(ray, 3.7 + depth)) * 97.0;
    float id = floor(z);
    float f = fract(z);
    float seed = hyperHash(vec2(ray, id) + depth * 31.0);

    // Une cellule sur deux environ porte une etoile.
    float exists = step(0.5, seed);

    // Tete nette a l'avant de la cellule, queue qui s'eteint derriere.
    float along = smoothstep(1.0 - len, 1.0, f) * (1.0 - smoothstep(0.97, 1.0, f));

    float width = 0.0025 + 0.002 * seed;
    float across = exp(-lateral * lateral / (width * width));

    // Pres du point de fuite les etoiles sont encore loin : invisibles.
    float approche = smoothstep(0.03, 0.5, r);

    float bright = exists * along * across * approche * (1.0 - depth * 0.3);
    vec3 teinte = mix(uColorB, uColorC, smoothstep(0.85, 1.0, f));
    colour += teinte * bright;
  }

  // Une lueur faible au point de fuite : la ou tout converge.
  colour += uColorB * 0.12 * exp(-r * r / 0.02);

  gl_FragColor = vec4(colour, 1.0);
}
`
