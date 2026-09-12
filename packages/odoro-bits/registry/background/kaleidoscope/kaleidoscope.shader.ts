/**
 * Shader du kaleidoscope.
 *
 * ## L'idee mathematique
 *
 * Un repliement angulaire : l'angle du pixel est ramene modulo 2pi/n, puis
 * reflechi par rapport au milieu du secteur. Tous les pixels d'un secteur
 * lisent donc le meme domaine, et n'importe quel motif — ici un bruit fractal
 * anime — devient symetrique sans qu'aucune symetrie ne soit dessinee. Une
 * rotation lente de l'angle avant repliement fait tourner l'ensemble.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte des nappes.
 * - `uColorC` — la teinte des rehauts.
 * - `uSpeed` — vitesse de rotation et de derive du bruit.
 * - `uSegments` — nombre de secteurs du repliement.
 * - `uScale` — echelle du bruit ; plus haut, plus fin.
 * - `uDetail` — nombre d'octaves du bruit, et donc son cout.
 */
export const KALEIDOSCOPE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uSegments;
uniform float uScale;
uniform float uDetail;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float kaleidoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float kaleidoNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = kaleidoHash(cell);
  float b = kaleidoHash(cell + vec2(1.0, 0.0));
  float c = kaleidoHash(cell + vec2(0.0, 1.0));
  float d = kaleidoHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float kaleidoFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 6; i += 1) {
    if (i >= octaves) break;
    total += kaleidoNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 q = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uDetail, 1.0, 6.0));

  float rayon = length(q);
  float angle = atan(q.y, q.x) + t * 0.4;

  // Repliement : modulo pour ramener dans un secteur, valeur absolue autour
  // du milieu pour le miroir. C'est cette reflexion qui fait le kaleidoscope,
  // le modulo seul ne donnerait qu'une repetition, pas une symetrie.
  float secteur = 6.28318 / max(uSegments, 3.0);
  angle = mod(angle, secteur);
  angle = abs(angle - secteur * 0.5);

  // Retour en cartesien : tous les secteurs lisent le meme domaine.
  vec2 domaine = vec2(cos(angle), sin(angle)) * rayon * max(uScale, 0.2);

  float nappe = kaleidoFbm(domaine + vec2(t * 0.3, -t * 0.2), octaves);

  // Seconde lecture, decalee par la premiere : les rehauts s'enroulent au
  // lieu de flotter au-dessus des nappes.
  float rehaut = kaleidoFbm(domaine * 1.7 + nappe * 1.2 - t * 0.15, octaves);

  vec3 colour = mix(uColorA, uColorB, smoothstep(0.3, 0.75, nappe));
  colour = mix(colour, uColorC, smoothstep(0.55, 0.9, rehaut) * 0.8);

  gl_FragColor = vec4(colour, 1.0);
}
`
