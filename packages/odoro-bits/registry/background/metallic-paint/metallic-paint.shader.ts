/**
 * Shader de la peinture metallique.
 *
 * ## L'idee mathematique
 *
 * Le relief n'est pas stocke : c'est un bruit de valeur lu sur un domaine
 * tres etire en abscisse, ce qui donne des stries — la trace du pinceau. La
 * normale s'en deduit par differences finies, deux lectures decalees, sans
 * texture ni carte.
 *
 * L'eclairage est un Blinn-Phong ordinaire, a ceci pres que la lampe n'est
 * pas dans la scene : elle est au pointeur, un peu au-dessus du plan. Bouger
 * le curseur revient donc a incliner la plaque sous une lampe fixe, et le
 * reflet balaie les stries dans le sens ou elles courent.
 *
 * Les paillettes sont une trame de points tires au hasard, tres fine, qui ne
 * s'allument que la ou le reflet porte deja : une paillette est un miroir
 * minuscule, elle ne brille pas dans l'ombre.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, sous la peinture.
 * - `uColorB` — le metal.
 * - `uColorC` — le reflet et les paillettes.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uRelief` — profondeur des stries de brossage.
 * - `uSheen` — durete du reflet, entre zero et un.
 * - `uFlakes` — densite des paillettes, entre zero et un.
 */
export const METALLIC_PAINT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uRelief;
uniform float uSheen;
uniform float uFlakes;

float paintHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float paintNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = paintHash(cell);
  float b = paintHash(cell + vec2(1.0, 0.0));
  float c = paintHash(cell + vec2(0.0, 1.0));
  float d = paintHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Le relief du brossage : deux octaves lus sur un domaine etire. L'etirement
// reste modere — au dela, les stries passent sous le pixel et ne se lisent
// plus que comme un fourmillement.
float brushed(vec2 p, float drift) {
  vec2 stretched = p * vec2(5.0, 110.0) + vec2(drift, 0.0);
  return paintNoise(stretched) * 0.66 + paintNoise(stretched * 0.37) * 0.34;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  // La coulee : le domaine derive tres lentement, la plaque n'est pas figee.
  float drift = uTime * 0.03;
  float e = 0.0016;

  float h = brushed(p, drift);
  float hx = brushed(p + vec2(e, 0.0), drift);
  float hy = brushed(p + vec2(0.0, e), drift);

  // La normale par differences finies : la pente du relief, redressee.
  vec3 normal = normalize(vec3((h - hx) * uRelief, (h - hy) * uRelief, 1.0));

  // La lampe est au pointeur, un peu au-dessus du plan.
  vec3 light = normalize(vec3(m - p, 0.45));
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 bisector = normalize(light + view);

  float diffuse = max(dot(normal, light), 0.0);
  float shine = pow(max(dot(normal, bisector), 0.0), mix(8.0, 55.0, clamp(uSheen, 0.0, 1.0)));

  // Le halo large : c'est lui qui dit ou est la lampe. Les stries seules ne
  // le diraient pas — elles renvoient partout un peu de lumiere.
  vec2 spread = (p - m) * vec2(0.7, 1.4);
  float halo = 1.0 - smoothstep(0.05, 0.75, length(spread));

  // Les paillettes : une trame grossiere, allumee seulement la ou le halo
  // porte deja. Une paillette est un miroir minuscule, pas une lampe.
  vec2 grain = floor(p * 170.0);
  float flake = step(1.0 - 0.10 * clamp(uFlakes, 0.0, 1.0), paintHash(grain));

  // Le metal reste proche du fond : une plaque qui couvre le cadre d'un gris
  // moyen rend illisible tout ce qu'on pose dessus.
  vec3 colour = mix(uColorA, uColorB, 0.12 + 0.26 * diffuse + 0.30 * halo);
  colour += uColorC * (shine * halo * 0.7 + flake * halo * 0.9 + halo * halo * 0.20);

  gl_FragColor = vec4(colour, 1.0);
}
`
