/**
 * Shader des rayons volumetriques.
 *
 * ## L'idee mathematique
 *
 * Un faisceau n'est visible que s'il traverse quelque chose : ici une brume
 * de bruit fractal qui derive. Le masque des rais est un bruit 1D de l'angle
 * autour du foyer, comme pour les rayons ; mais la lumiere qui atteint un
 * fragment est integree le long du rai — une marche a pas constants du
 * fragment vers le foyer, qui somme la brume traversee. Une brume epaisse en
 * amont eteint le rai ; une brume locale le diffuse. C'est ce qui distingue
 * ces rais des rayons plats : ils ont un volume, ils s'eteignent derriere un
 * banc de brume et s'allument dans le suivant.
 *
 * La lumiere se pose par melange borne vers ses teintes : la brume tient sur
 * un fond clair comme sur un fond sombre.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la lumiere des rais.
 * - `uColorC` — la teinte de la brume et du foyer.
 * - `uX`, `uY` — position du foyer, en fraction du cadre.
 * - `uCount` — nombre de rais sur le tour.
 * - `uStrength` — intensite de la lumiere.
 * - `uSamples` — nombre de pas de la marche, et donc le cout.
 */
export const VOLUMETRIC_RAYS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uCount;
uniform float uStrength;
uniform float uSamples;

float brumeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float brumeNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = brumeHash(cell);
  float b = brumeHash(cell + vec2(1.0, 0.0));
  float c = brumeHash(cell + vec2(0.0, 1.0));
  float d = brumeHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Deux octaves suffisent a la brume : elle est lue a chaque pas de la marche,
// et c'est la marche qui lisse.
float brume(vec2 p, float t) {
  vec2 q = p * 1.6 + vec2(t * 0.06, -t * 0.02);
  return brumeNoise(q) * 0.65 + brumeNoise(q * 2.1 + vec2(1.7, 4.3) + vec2(-t * 0.04, 0.0)) * 0.35;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 foyer = vec2(uX * aspect, uY);
  float t = uTime;
  int pas = int(clamp(uSamples, 2.0, 16.0));

  vec2 ecart = p - foyer;
  float rayon = length(ecart);
  float angle = atan(ecart.y, ecart.x);

  // Le masque angulaire : deux sinus de frequences entieres non multiples,
  // sans couture sur le tour, dont les phases derivent lentement.
  float f1 = max(floor(uCount), 2.0);
  float f2 = floor(f1 * 1.9) + 1.0;
  float rai = pow(0.5 + 0.5 * sin(angle * f1 + t * 0.12), 3.0) * 0.7
    + pow(0.5 + 0.5 * sin(angle * f2 - t * 0.09), 3.0) * 0.5;

  // La marche : du fragment vers le foyer, la brume traversee s'accumule.
  vec2 enjambee = -ecart / float(pas) * 0.9;
  vec2 s = p;
  float epaisseur = 0.0;
  for (int i = 0; i < 16; i += 1) {
    if (i >= pas) break;
    s += enjambee;
    epaisseur += brume(s, t);
  }
  epaisseur /= float(pas);

  // La transmission : une brume epaisse en amont eteint le rai. La borne
  // basse garde un peu de lumiere partout, sinon le cadre se coupe en deux.
  float transmission = 1.0 - smoothstep(0.35, 0.65, epaisseur) * 0.9;

  // La diffusion : c'est la brume locale qui rend le rai visible.
  float locale = brume(p, t);
  float diffusion = 0.2 + 0.8 * locale;

  float lumiere = rai * transmission * diffusion * exp(-rayon * 1.1) * max(uStrength, 0.0) * 1.3;
  float source = exp(-rayon * rayon * 7.0) * (0.5 + 0.2 * rai);

  vec3 colour = mix(uColorA, uColorC, clamp(locale * 0.22 + source * 0.6, 0.0, 1.0));
  colour = mix(colour, uColorB, clamp(lumiere, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
