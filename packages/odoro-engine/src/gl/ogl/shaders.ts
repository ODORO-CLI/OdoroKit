/**
 * Fragments de shader ecrits depuis leurs principes.
 *
 * Chaque fonction porte l'explication de la technique employee et de ses
 * parametres. Rien n'est repris d'une implementation trouvee en ligne : les
 * shaders publies le sont souvent sous des licences restrictives, et la
 * mathematique sous-jacente est de toute facon plus courte a redemontrer qu'a
 * verifier juridiquement.
 *
 * @module
 */

/**
 * Sommet d'un triangle couvrant l'ecran.
 *
 * Un triangle unique plutot que deux : la diagonale d'un quadrilatere fait
 * traiter deux fois les fragments qui la bordent, et un triangle qui deborde
 * de l'ecran n'a pas cette couture.
 */
export const FULLSCREEN_VERTEX = /* glsl */ `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

/**
 * Bruit de valeur et somme d'octaves.
 *
 * ## Le principe
 *
 * Un bruit de valeur associe un nombre pseudo-aleatoire a chaque point d'une
 * grille entiere, puis interpole entre les quatre coins de la cellule ou l'on
 * se trouve. L'interpolation n'est pas lineaire mais lissee par le polynome
 * `3t² - 2t³`, dont la derivee s'annule aux deux extremites : sans cela, les
 * aretes de la grille resteraient visibles sous forme de croisillons.
 *
 * Le nombre pseudo-aleatoire vient d'une fonction de hachage : on projette le
 * point sur une direction arbitraire, on prend le sinus, on le multiplie par
 * un grand nombre et on n'en garde que la partie fractionnaire. Ce n'est pas
 * du hasard, mais c'est deterministe, continu par morceaux et sans motif
 * perceptible — ce qui suffit.
 *
 * ## La somme d'octaves
 *
 * Un seul bruit est trop regulier. On en superpose plusieurs, chacun deux fois
 * plus fin et deux fois moins fort que le precedent. Le resultat presente le
 * meme aspect a toutes les echelles, ce qui est precisement l'aspect des
 * choses naturelles — nuages, relief, veines.
 *
 * Le nombre d'octaves est le levier de cout : chacune double le travail.
 */
export const NOISE_FUNCTIONS = /* glsl */ `
// Nombre pseudo-aleatoire, deterministe et sans motif perceptible.
float odoroHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float odoroNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);

  // 3t2 - 2t3 : derivee nulle aux extremites, donc pas d'arete visible.
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = odoroHash(cell);
  float b = odoroHash(cell + vec2(1.0, 0.0));
  float c = odoroHash(cell + vec2(0.0, 1.0));
  float d = odoroHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float odoroFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 8; i++) {
    if (i >= octaves) break;
    total += odoroNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}
`

/**
 * Aurore : nappes de couleur lentement deformees.
 *
 * ## La technique
 *
 * Le point echantillonne n'est pas la coordonnee du fragment, mais cette
 * coordonnee **deplacee par un premier bruit**. Deformer le domaine plutot que
 * la valeur produit des volutes et des replis, la ou une simple somme
 * d'octaves ne donnerait que des taches. C'est le meme principe qu'une carte
 * de distorsion, applique en amont plutot qu'en aval.
 *
 * Le temps entre dans le deplacement, pas dans la couleur : la nappe se
 * deforme au lieu de clignoter.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes.
 * - `uResolution` — taille en pixels, pour corriger le rapport de forme.
 * - `uColorA`, `uColorB`, `uColorC` — les trois teintes melangees.
 * - `uSpeed` — vitesse de deformation.
 * - `uScale` — echelle du motif ; plus grand, plus fin.
 * - `uOctaves` — detail, et donc cout.
 */
export const AURORA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOctaves;

${NOISE_FUNCTIONS}

void main() {
  // Correction du rapport de forme : sans elle, le motif s'etire avec la
  // fenetre au lieu de conserver ses proportions.
  vec2 p = vUv;
  p.x *= uResolution.x / max(uResolution.y, 1.0);
  p *= uScale;

  float t = uTime * uSpeed;
  int octaves = int(uOctaves);

  // Deplacement du domaine : c'est lui qui produit les replis.
  vec2 offset = vec2(
    odoroFbm(p + vec2(0.0, t), octaves),
    odoroFbm(p + vec2(t * 0.7, 5.2), octaves)
  );

  float field = odoroFbm(p + offset * 2.0, octaves);

  // Deux melanges successifs plutot qu'un : la teinte centrale apparait au
  // milieu de la plage au lieu d'etre ecrasee aux extremites.
  vec3 color = mix(uColorA, uColorB, smoothstep(0.25, 0.75, field));
  color = mix(color, uColorC, smoothstep(0.55, 1.0, field));

  gl_FragColor = vec4(color, 1.0);
}
`

/**
 * Grille en perspective, avec attenuation vers l'horizon.
 *
 * ## La technique
 *
 * Les lignes ne sont pas dessinees : elles sont **deduites** de la position.
 * On prend la partie fractionnaire de la coordonnee mise a l'echelle, et l'on
 * regarde sa distance au bord de la cellule. Une ligne est simplement
 * l'endroit ou cette distance est faible.
 *
 * L'epaisseur est calculee a partir de la derivee de la coordonnee — `fwidth`
 * — plutot que fixee en unites du monde. C'est ce qui donne des lignes d'une
 * epaisseur constante a l'ecran quelle que soit la perspective, et sans
 * scintillement au loin : sans cette correction, les lignes lointaines
 * passeraient sous la taille d'un pixel et clignoteraient au moindre mouvement.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes.
 * - `uResolution` — taille en pixels.
 * - `uColorLine`, `uColorBackground` — teintes des lignes et du fond.
 * - `uSpeed` — vitesse de defilement vers l'observateur.
 * - `uDensity` — nombre de cellules visibles.
 */
export const GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorLine;
uniform vec3 uColorBackground;
uniform float uSpeed;
uniform float uDensity;

void main() {
  // Origine au centre, axe vertical vers le haut.
  vec2 p = vUv * 2.0 - 1.0;
  p.x *= uResolution.x / max(uResolution.y, 1.0);

  // Sous l'horizon uniquement : au-dessus, le fond seul.
  float horizon = 0.0;
  if (p.y >= horizon) {
    gl_FragColor = vec4(uColorBackground, 1.0);
    return;
  }

  // Projection : plus on approche de l'horizon, plus le sol s'eloigne.
  float depth = 1.0 / max(horizon - p.y, 0.0001);
  vec2 plane = vec2(p.x * depth, depth + uTime * uSpeed) * uDensity;

  // Distance au bord de cellule, dans les deux directions.
  vec2 edge = abs(fract(plane) - 0.5);

  // Epaisseur en pixels plutot qu'en unites du monde : sans cela, les lignes
  // lointaines passeraient sous le pixel et scintilleraient.
  vec2 width = fwidth(plane);
  vec2 line = smoothstep(width * 1.5, vec2(0.0), edge);
  float strength = max(line.x, line.y);

  // Attenuation vers l'horizon : ce qui est loin doit s'effacer.
  strength *= smoothstep(0.0, 0.35, -p.y);

  gl_FragColor = vec4(mix(uColorBackground, uColorLine, strength), 1.0);
}
`
