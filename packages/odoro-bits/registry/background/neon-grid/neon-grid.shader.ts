/**
 * Shader de la grille neon.
 *
 * ## L'idee mathematique
 *
 * Sous l'horizon, le sol est projete en posant la profondeur egale a
 * l'inverse de la distance a l'horizon : les lignes verticales convergent,
 * les lignes de profondeur se resserrent, et un simple decalage du domaine
 * les fait defiler vers le spectateur.
 *
 * Les traits sont filtres analytiquement : la couverture d'un pixel est
 * l'integrale exacte du train d'impulsions sur l'empreinte du pixel, deduite
 * de la projection — sans derivee d'ecran. Pres de l'horizon, ou des dizaines
 * de cellules tiennent dans un pixel, la couverture tend vers sa moyenne au
 * lieu de moirer, et les coeurs s'effacent quand ils depassent leur cellule.
 *
 * Au-dessus, un soleil raye : un disque dont le bas est decoupe par des
 * fentes de plus en plus larges vers l'horizon, qui glissent. Une ligne
 * d'horizon en neon coud les deux moities.
 *
 * Distinct du quadrillage plat, qui derive sans perspective, et du tunnel,
 * qui est radial : ici la grille fuit vers un point de l'horizon.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le neon de la grille et de l'horizon.
 * - `uColorC` — le soleil.
 * - `uSpeed` — vitesse de defilement du sol.
 * - `uHorizon` — hauteur de l'horizon, en fraction du cadre.
 * - `uDensity` — nombre de lignes de profondeur visibles.
 * - `uGlow` — portee du halo des traits, en cellules de sol.
 */
export const NEON_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uHorizon;
uniform float uDensity;
uniform float uGlow;

// Couverture d'un train d'impulsions de largeur w, centrees sur les entiers,
// integree sur l'empreinte f du pixel. Une boite d'un pixel ne suffit pas
// quand la cellule approche le pixel — les deux frequences battent — donc,
// des que l'empreinte depasse un quart de cellule, la couverture glisse vers
// sa moyenne, qui est la largeur.
float trait(float x, float w, float f) {
  float largeur = clamp(w, 0.0, 1.0);
  float empreinte = max(f, 0.0001) * 1.5;
  float a = x + 0.5 - 0.5 * empreinte;
  float b = x + 0.5 + 0.5 * empreinte;
  float ia = floor(a) * largeur + clamp(fract(a) - 0.5 + 0.5 * largeur, 0.0, largeur);
  float ib = floor(b) * largeur + clamp(fract(b) - 0.5 + 0.5 * largeur, 0.0, largeur);
  return mix((ib - ia) / empreinte, largeur, smoothstep(0.25, 0.6, f));
}

// Le halo d'un trait : une exponentielle de la distance au trait, qui glisse
// elle aussi vers sa moyenne quand les cellules se resserrent sous le pixel.
float halo(float x, float g, float f) {
  float l = abs(fract(x) - 0.5);
  float moyenne = 2.0 * g * (1.0 - exp(-0.5 / g));
  return mix(exp(-l / g), moyenne, smoothstep(0.15, 0.5, f));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float horizon = clamp(uHorizon, 0.2, 0.8);
  float x = (vUv.x - 0.5) * aspect;
  float t = uTime * uSpeed;
  float px = 1.0 / max(uResolution.y, 1.0);
  float density = max(uDensity, 1.0) * 0.25;

  float sol = 0.0;
  float soleil = 0.0;
  float ciel = 0.0;

  if (vUv.y < horizon) {
    // Le sol : la profondeur est l'inverse de la distance a l'horizon.
    float depth = max(horizon - vUv.y, 0.0005);
    float xw = x / depth * density;
    float zw = 1.0 / depth * density + t * 2.0;

    // L'empreinte d'un pixel en cellules de sol : le gradient de la
    // projection. Les lignes verticales varient aussi avec la hauteur —
    // d'autant plus qu'on s'ecarte du point de fuite — d'ou le second terme.
    // Les coeurs font un pixel et demi a toute distance.
    float fx = px * density / depth * sqrt(1.0 + (x * x) / (depth * depth));
    float fz = px * density / (depth * depth);
    float wx = fx * 1.5;
    float wz = fz * 1.5;

    // Un coeur plus large qu'un tiers de sa cellule n'est plus un trait :
    // il s'efface, et seule la nappe reste pres de l'horizon.
    float coeurX = trait(xw, wx, fx) * (1.0 - smoothstep(0.2, 0.5, wx));
    float coeurZ = trait(zw, wz, fz) * (1.0 - smoothstep(0.2, 0.5, wz));

    float g = max(uGlow, 0.005);
    float halos = halo(xw, g, fx) + halo(zw, g, fz);

    float nappe = exp(-depth * 22.0) * 0.35;
    sol = max(coeurX, coeurZ) + halos * 0.35 + nappe;
  } else {
    // Le ciel : une teinte qui s'eteint en montant.
    float y = vUv.y - horizon;
    ciel = exp(-y * 5.0) * 0.25;

    // Le soleil : un disque au-dessus de l'horizon, decoupe en bas par des
    // fentes qui s'elargissent en descendant et glissent lentement. Meme au
    // ras de l'horizon, un filet de disque subsiste entre deux fentes : le
    // soleil se pose, il ne flotte pas.
    vec2 centre = vec2(0.0, 0.17);
    float rs = length(vec2(x, y) - centre);
    float rayon = 0.2;
    float disque = 1.0 - smoothstep(rayon, rayon + px * 3.0, rs);
    float seuil = mix(-0.85, 1.3, smoothstep(0.0, 0.3, y));
    float bandes = smoothstep(-0.12, 0.12, sin(y * 70.0 - t * 1.5) + seuil);
    float couronne = exp(-max(rs - rayon, 0.0) * 9.0) * 0.45;
    soleil = disque * bandes + couronne;
  }

  // L'horizon : une ligne de neon qui coud le sol au ciel.
  float ligne = exp(-abs(vUv.y - horizon) / 0.006) * 0.75;

  vec3 colour = mix(uColorA, uColorC, clamp(soleil, 0.0, 1.0));
  colour = mix(colour, uColorB, clamp(sol + ciel + ligne, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
