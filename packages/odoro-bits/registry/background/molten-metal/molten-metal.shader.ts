/**
 * Shader du metal en fusion.
 *
 * ## L'idee mathematique
 *
 * Un bain de metal chaud : une croute qui se fend, et sous elle une matiere
 * qui rougeoie. Le champ de chaleur est un bruit fractal a deplacement de
 * domaine — deux passes, pour que les coulees s'enroulent au lieu de
 * derouler des nappes — et il derive tres lentement, comme un liquide lourd.
 *
 * La couleur est une rampe a trois arrets : le fond pour la croute, une
 * teinte chaude pour le metal, une teinte claire pour le coeur du bain. Les
 * veines sont les lignes de niveau du champ, la ou la croute se fend et
 * laisse voir la chaleur. Le relief vient de deux lectures decalees du
 * champ, qui donnent une normale ; un eclairage rasant en fait une pate.
 *
 * Sur un fond clair, le bain garde ses teintes chaudes : la croute est le
 * fond lui-meme, jamais le fond assombri.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, la croute.
 * - `uColorB` — le metal chaud.
 * - `uColorC` — le coeur du bain, et les veines.
 * - `uSpeed` — vitesse de la coulee.
 * - `uScale` — echelle du champ ; plus haut, plus fin.
 * - `uHeat` — part du bain qui est en fusion.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const MOLTEN_METAL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uHeat;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float metalHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float metalNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = metalHash(cell);
  float b = metalHash(cell + vec2(1.0, 0.0));
  float c = metalHash(cell + vec2(0.0, 1.0));
  float d = metalHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float metalFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += metalNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

// Le champ de chaleur : deux deplacements de domaine, puis le bruit.
float metalChaleur(vec2 p, float t, int octaves) {
  vec2 q = vec2(
    metalFbm(p + vec2(t, 0.0), octaves),
    metalFbm(p + vec2(5.2, 1.3) - t * 0.7, octaves)
  );
  vec2 r = vec2(
    metalFbm(p + q * 2.0 + vec2(1.7, 9.2) + t * 0.4, octaves),
    metalFbm(p + q * 2.0 + vec2(8.3, 2.8) - t * 0.3, octaves)
  );
  return metalFbm(p + r * 1.8, octaves);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // Trois lectures du champ : la valeur, et deux decalages pour le relief.
  float e = 0.02;
  float chaleur = metalChaleur(p, t, octaves);
  float cx = metalChaleur(p + vec2(e, 0.0), t, octaves);
  float cy = metalChaleur(p + vec2(0.0, e), t, octaves);

  // Un battement lent : le bain respire.
  chaleur += 0.05 * sin(uTime * 1.5 + chaleur * 8.0);

  // La rampe : la croute, puis le metal, puis le coeur. La chaleur reglee
  // deplace les seuils, et donc la part du bain qui est en fusion.
  float fusion = clamp(uHeat, 0.0, 1.0);
  float metal = smoothstep(0.68 - fusion * 0.25, 0.86 - fusion * 0.2, chaleur);
  float coeur = smoothstep(0.8 - fusion * 0.15, 0.98 - fusion * 0.1, chaleur);

  // Les veines : les lignes de niveau du champ, la ou la croute se fend.
  float veine = 1.0 - smoothstep(0.0, 0.025, abs(chaleur - (0.62 - fusion * 0.2)));
  veine *= 1.0 - metal;

  // Le relief : le gradient du champ pour normale, une lumiere rasante.
  vec3 n = normalize(vec3(-(cx - chaleur), -(cy - chaleur), e * 1.5));
  vec3 lumiere = normalize(vec3(-0.6, 0.5, 0.5));
  float diffus = max(dot(n, lumiere), 0.0);
  vec3 h = normalize(lumiere + vec3(0.0, 0.0, 1.0));
  float reflet = pow(max(dot(n, h), 0.0), 24.0);

  vec3 colour = mix(uColorA, uColorB, metal * (0.7 + 0.3 * diffus));
  colour = mix(colour, uColorC, coeur * (0.6 + 0.4 * diffus));
  colour = mix(colour, uColorC, veine * 0.7);

  // L'eclat : le coeur rayonne, et la pate accroche la lumiere.
  colour += uColorC * coeur * coeur * 0.3;
  colour += uColorB * veine * 0.2;
  colour += mix(uColorB, uColorC, 0.5) * reflet * metal * 0.25;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
