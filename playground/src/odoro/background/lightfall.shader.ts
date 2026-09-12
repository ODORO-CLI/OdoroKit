/**
 * Shader de la cascade de lumiere.
 *
 * ## L'idee mathematique
 *
 * Le cadre est decoupe en colonnes ; chacune porte une goutte de lumiere qui
 * tombe a sa propre cadence, tiree une fois de son indice. La goutte est une
 * gaussienne en largeur et, en hauteur, une tete nette suivie d'une trainee
 * exponentielle : c'est la trainee qui fait la chute, une goutte sans elle
 * n'est qu'un point qui descend. Trois profondeurs se superposent — plus
 * fines, plus lentes et plus pales en s'eloignant — sur un rideau de lumiere
 * qui descend du haut et frissonne d'un bruit lent.
 *
 * Toute la lumiere se pose par melange borne vers ses teintes : rien n'est
 * ajoute sans borne, rien n'est multiplie vers le noir.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le rideau.
 * - `uColorC` — les gouttes.
 * - `uSpeed` — vitesse de chute.
 * - `uDensity` — nombre de colonnes sur la hauteur du cadre.
 * - `uLength` — longueur des trainees, en hauteurs de cadre.
 * - `uLayers` — nombre de profondeurs superposees, et donc le cout.
 */
export const LIGHTFALL_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uLength;
uniform float uLayers;

float chuteHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur, pour le frisson du rideau.
float chuteNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = chuteHash(cell);
  float b = chuteHash(cell + vec2(1.0, 0.0));
  float c = chuteHash(cell + vec2(0.0, 1.0));
  float d = chuteHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Une profondeur de gouttes : une colonne par cellule, une goutte par colonne.
float chuteCouche(vec2 p, float t, float density, float longueur, float graine) {
  float x = p.x * density + graine;
  float colonne = floor(x);
  float lx = fract(x) - 0.5;

  float h1 = chuteHash(vec2(colonne, graine));
  float h2 = chuteHash(vec2(colonne + 3.1, graine * 1.7));

  // Une colonne sur trois reste vide : une cascade pleine serait un rideau.
  float active = step(0.33, h1);

  // La tete descend de haut en bas, boucle, a une cadence propre.
  float tete = 1.25 - fract(t * (0.5 + 0.7 * h2) + h1) * 1.6;
  float dy = p.y - tete;

  // La trainee au-dessus de la tete, coupee net en dessous.
  float trainee = exp(-max(dy, 0.0) / max(longueur, 0.01)) * smoothstep(-0.02, 0.0, dy);
  float pointe = exp(-dy * dy / 0.0008);

  float largeur = exp(-lx * lx * 40.0);

  return active * largeur * (trainee * 0.7 + pointe * 0.6) * (0.6 + 0.4 * h2);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;
  float density = max(uDensity, 1.0);
  int couches = int(clamp(uLayers, 1.0, 3.0));

  // Le rideau : la lumiere vient du haut et frissonne d'un bruit lent.
  float frisson = chuteNoise(vec2(p.x * 3.0 + t * 0.2, vUv.y * 2.0 - t * 0.35));
  float rideau = smoothstep(0.15, 1.0, vUv.y) * (0.45 + 0.55 * frisson);
  rideau += exp(-(1.0 - vUv.y) * 5.0) * 0.5;

  // Les profondeurs, de la plus proche a la plus lointaine : chacune plus
  // fine, plus lente et plus pale que la precedente.
  float gouttes = chuteCouche(p, t, density, uLength, 0.0);
  if (couches >= 2) {
    gouttes += 0.55 * chuteCouche(p, t * 0.7, density * 1.6, uLength * 0.7, 0.37);
  }
  if (couches >= 3) {
    gouttes += 0.3 * chuteCouche(p, t * 0.5, density * 2.4, uLength * 0.5, 0.71);
  }

  vec3 colour = mix(uColorA, uColorB, clamp(rideau, 0.0, 1.0) * 0.5);
  colour = mix(colour, uColorC, clamp(gouttes, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
