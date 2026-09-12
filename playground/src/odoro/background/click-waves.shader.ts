/**
 * Shader des ondes de clic.
 *
 * ## L'idee mathematique
 *
 * Chaque clic est une onde circulaire : un sinus de la distance moins l'age
 * fois la vitesse, sous une double enveloppe exponentielle — l'une eteint
 * l'onde avec le temps, l'autre avec la distance. Les huit ondes vivantes se
 * somment, et leur hauteur deplace la lecture d'un bruit leger : les anneaux
 * deforment quelque chose au lieu de flotter sur un aplat.
 *
 * Un depart a -1000 donne un age enorme, donc une enveloppe nulle : les
 * emplacements vides du tampon sont inertes d'office.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la texture de surface.
 * - `uColorC` — l'eclat des cretes.
 * - `uClicks` — huit clics (x, y, temps de depart), tampon circulaire.
 * - `uSpeed` — vitesse de propagation des anneaux.
 * - `uWidth` — largeur d'onde des anneaux.
 * - `uDecay` — vitesse d'extinction temporelle.
 */
export const CLICK_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uClicks[8];
uniform float uSpeed;
uniform float uWidth;
uniform float uDecay;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float waveHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float waveNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = waveHash(cell);
  float b = waveHash(cell + vec2(1.0, 0.0));
  float c = waveHash(cell + vec2(0.0, 1.0));
  float d = waveHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float width = max(uWidth, 0.02);
  float height = 0.0;

  // Bornes constantes : la specification du langage l'exige, et huit clics
  // vivants suffisent — le neuvieme aurait deja disparu.
  for (int i = 0; i < 8; i += 1) {
    vec3 clic = uClicks[i];
    vec2 centre = clic.xy * vec2(aspect, 1.0);
    float age = uTime - clic.z;
    float d = length(p - centre);

    // Le front est au rayon age x vitesse ; l'onde n'existe que derriere lui.
    float front = age * uSpeed;
    float behind = smoothstep(0.0, width, front - d);

    float wave = sin((d - front) * (6.2831853 / width));
    float envelope = exp(-uDecay * max(age, 0.0)) * exp(-d * 1.5);

    height += wave * envelope * behind;
  }

  // Le bruit est lu en un point deplace par la hauteur d'onde : c'est cette
  // refraction qui rend les anneaux visibles sur toute la surface.
  float grain = waveNoise(p * 3.0 + height * 0.8 + uTime * 0.03);

  vec3 colour = mix(uColorA, uColorB, grain * 0.45 + 0.1);

  // Les cretes s'eclairent, les creux s'assombrissent legerement.
  colour += uColorC * clamp(height, 0.0, 1.0) * 0.5;
  colour *= 1.0 - clamp(-height, 0.0, 1.0) * 0.25;

  gl_FragColor = vec4(colour, 1.0);
}
`
