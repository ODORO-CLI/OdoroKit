/**
 * Shader du voile sombre.
 *
 * ## L'idee mathematique
 *
 * Deux gaussiennes lentes font une lueur dans le bas du cadre. Par-dessus,
 * un bruit fractal deforme par lui-meme — deux lectures servent de
 * deplacement a une troisieme — dessine une etoffe dont les plis derivent ;
 * une onde lente la fait onduler. La lueur ne passe que par les trouees du
 * voile, et le voile lui-meme n'est pas un assombrissement : c'est un
 * melange borne vers sa teinte profonde, qui reste lisible sur un fond clair
 * comme sur un fond sombre.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la lueur sous le voile.
 * - `uColorC` — la teinte profonde du voile.
 * - `uSpeed` — vitesse de derive du voile.
 * - `uScale` — echelle des plis ; plus haut, plus fin.
 * - `uOpacity` — epaisseur du voile ; a zero, seule la lueur reste.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const DARK_VEIL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOpacity;
uniform float uOctaves;

float voileHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float voileNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = voileHash(cell);
  float b = voileHash(cell + vec2(1.0, 0.0));
  float c = voileHash(cell + vec2(0.0, 1.0));
  float d = voileHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves bornee : la qualite basse s'arrete plus tot.
float voileFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += voileNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 5.0));

  // La lueur : deux foyers gaussiens qui errent lentement dans le bas.
  vec2 f1 = vec2(aspect * (0.35 + 0.1 * sin(t * 0.37)), 0.25 + 0.08 * sin(t * 0.23));
  vec2 f2 = vec2(aspect * (0.68 + 0.1 * cos(t * 0.29)), 0.42 + 0.1 * cos(t * 0.41));
  vec2 d1 = p - f1;
  vec2 d2 = p - f2;
  float lueur = clamp(exp(-dot(d1, d1) * 3.5) + 0.8 * exp(-dot(d2, d2) * 4.5), 0.0, 1.0);

  // Le voile : le domaine ondule d'abord — une onde lente le plisse — puis
  // le bruit se deforme par lui-meme, ce qui donne des plis d'etoffe et non
  // des taches rondes.
  vec2 q = p * max(uScale, 0.1);
  q.y += 0.12 * sin(q.x * 1.5 + t * 0.8);
  vec2 warp = vec2(
    voileFbm(q + vec2(t * 0.15, 0.0), octaves),
    voileFbm(q + vec2(5.2, 1.3) - vec2(0.0, t * 0.1), octaves)
  );
  float densite = voileFbm(q + 1.6 * warp, octaves);
  float voile = smoothstep(0.35, 0.75, densite) * clamp(uOpacity, 0.0, 1.0);

  // La lueur ne passe que par les trouees.
  vec3 colour = mix(uColorA, uColorB, lueur * (1.0 - voile) * 0.7);

  // Le voile : un melange borne vers sa teinte, jamais une multiplication
  // vers le noir — sur un fond clair, il reste une etoffe, pas un trou.
  colour = mix(colour, uColorC, voile * 0.5);

  // La frange : la lueur accroche le bord des plis.
  float bord = smoothstep(0.3, 0.45, densite) * (1.0 - smoothstep(0.45, 0.6, densite));
  colour = mix(colour, uColorB, bord * lueur * 0.35);

  gl_FragColor = vec4(colour, 1.0);
}
`
