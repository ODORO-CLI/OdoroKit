/**
 * Shader des cellules de Voronoi.
 *
 * ## L'idee mathematique
 *
 * Un germe par cellule d'une grille, deplace autour de son point d'attache
 * par deux sinus de phase propre. La premiere passe trouve, parmi les neuf
 * cellules voisines, le germe le plus proche du fragment.
 *
 * La seconde passe donne la distance exacte a l'arete : pour chaque autre
 * germe, la distance du fragment a la mediatrice entre lui et le germe le
 * plus proche, dont on garde le minimum. C'est ce qui distingue ce fond du
 * pavage cellulaire, qui approche l'arete par la difference des deux
 * premieres distances — une approximation qui s'epaissit dans les coins.
 * Ici, l'arete a la meme largeur partout, et un halo peut s'y accrocher.
 *
 * Chaque cellule porte une nuance tiree de son identifiant, et son germe
 * brille d'un point : le pavage se lit comme un vitrail, pas comme un bruit.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les aretes et les germes.
 * - `uColorC` — la teinte des cellules.
 * - `uSpeed` — vitesse de derive des germes.
 * - `uDensity` — nombre de cellules sur la hauteur.
 * - `uGlow` — portee du halo des aretes, en cellules.
 * - `uRange` — rayon de la seconde passe (1 ou 2), et donc le cout.
 */
export const VORONOI_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uGlow;
uniform float uRange;

// Deux nombres pseudo-aleatoires decorreles pour une cellule.
vec2 vorHash2(vec2 p) {
  return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453123);
}

// Position du germe d'une cellule, en derive autour de son point d'attache.
vec2 vorGerme(vec2 cell) {
  vec2 h = vorHash2(cell);
  return cell + 0.5 + 0.38 * sin(uTime * uSpeed + 6.2831853 * h);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uDensity, 1.0);
  vec2 n = floor(p);
  vec2 f = fract(p);

  // Premiere passe : le germe le plus proche parmi les neuf voisins.
  float md = 8.0;
  vec2 mr = vec2(0.0);
  vec2 mg = vec2(0.0);
  for (int j = -1; j <= 1; j += 1) {
    for (int i = -1; i <= 1; i += 1) {
      vec2 g = vec2(float(i), float(j));
      vec2 r = vorGerme(n + g) - n - f;
      float d = dot(r, r);
      if (d < md) {
        md = d;
        mr = r;
        mg = g;
      }
    }
  }

  // Seconde passe : distance exacte a l'arete, par les mediatrices. Bornes
  // constantes ; la qualite basse saute la couronne exterieure.
  float range = clamp(uRange, 1.0, 2.0) + 0.5;
  float edge = 8.0;
  for (int j = -2; j <= 2; j += 1) {
    for (int i = -2; i <= 2; i += 1) {
      if (abs(float(i)) > range || abs(float(j)) > range) continue;
      vec2 g = mg + vec2(float(i), float(j));
      vec2 r = vorGerme(n + g) - n - f;
      vec2 diff = r - mr;
      if (dot(diff, diff) > 0.00001) {
        edge = min(edge, dot(0.5 * (mr + r), normalize(diff)));
      }
    }
  }

  vec2 id = n + mg;
  vec2 tint = vorHash2(id + 7.3);

  // La cellule : une nuance propre, plus sombre vers l'arete.
  float depth = smoothstep(0.0, 0.5, edge);
  vec3 cell = mix(uColorA, uColorC, (0.18 + 0.3 * tint.x) * (0.6 + 0.4 * depth));

  // L'arete : un trait net et un halo qui s'en eloigne.
  float px = max(uDensity, 1.0) / max(uResolution.y, 1.0) * 1.5;
  float line = 1.0 - smoothstep(0.0, px * 2.0, edge);
  float halo = exp(-edge / max(uGlow, 0.005)) * 0.55;

  // Le germe : un point qui bat doucement, decale par cellule.
  float seed = exp(-dot(mr, mr) / 0.0025) * (0.6 + 0.4 * sin(uTime * 2.0 + tint.y * 6.2831853));

  vec3 colour = cell;
  colour += uColorB * (halo + seed * 0.8);
  colour = mix(colour, uColorB, line);

  gl_FragColor = vec4(colour, 1.0);
}
`
