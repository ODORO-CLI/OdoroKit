/**
 * Shader de la courbure cathodique.
 *
 * ## L'idee mathematique
 *
 * Un tube n'est pas plat : l'image est bombee vers le spectateur. Le
 * bombement se lit a l'envers — pour chaque pixel de l'ecran, on cherche
 * quel point de l'image plate y aboutit — et il se resume a une seule
 * formule : les coordonnees centrees sont etirees d'un facteur qui croit
 * avec le carre de leur distance au centre. Les coins de l'image sont tires
 * hors du cadre, et la silhouette de l'ecran devient un coussin.
 *
 * Le verre n'est pas parfait non plus. Il decompose la lumiere pres des
 * bords : les deux teintes de l'image sont lues a deux positions legerement
 * ecartees, d'autant plus que le pixel est loin du centre. Une grille
 * d'ouverture — des colonnes verticales fines, celles d'un tube a masque a
 * fentes — est posee par-dessus, et une vignette respire lentement. Elle
 * ramene vers le fond, elle n'assombrit pas : sur un theme clair, un tube
 * eteint est blanc, pas noir.
 *
 * L'image elle-meme est un signal lent : deux ondes, l'une qui monte,
 * l'autre qui derive en travers, meles par produit.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, le tube eteint.
 * - `uColorB` — la premiere teinte du signal.
 * - `uColorC` — la seconde.
 * - `uCurve` — bombement du tube.
 * - `uLines` — nombre de colonnes de la grille d'ouverture sur la largeur.
 * - `uAberration` — ecart des teintes pres des bords.
 * - `uSpeed` — vitesse du signal.
 */
export const CRT_WARP_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCurve;
uniform float uLines;
uniform float uAberration;
uniform float uSpeed;

// Le signal affiche : deux ondes lentes, l'une qui monte, l'autre qui
// derive en travers. Rendu entre zero et un pour chaque teinte.
vec2 crtSignal(vec2 uv, float t) {
  float rise = 0.5 + 0.5 * sin(uv.y * 5.0 - t * 0.9 + sin(uv.x * 3.0 + t * 0.4) * 0.8);
  float drift = 0.5 + 0.5 * sin(uv.x * 4.0 + t * 0.6 + uv.y * 2.5);
  return vec2(rise, rise * drift);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  // Le bombement : les coordonnees centrees, etirees avec le carre de leur
  // distance au centre. Les coins partent hors du cadre.
  vec2 centred = (vUv - 0.5) * 2.0;
  vec2 scaled = centred * vec2(aspect, 1.0);
  float r2 = dot(scaled, scaled) / (1.0 + aspect * aspect);
  vec2 warped = centred * (1.0 + uCurve * r2 * 2.0);
  vec2 uv = warped * 0.5 + 0.5;

  // La silhouette de l'ecran : ce qui tombe hors de l'image plate est le
  // tube eteint, avec un bord adouci d'un pixel ou deux.
  float px = 1.0 / max(uResolution.y, 1.0);
  float inset = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float screen = smoothstep(0.0, px * 3.0, inset);

  // Le verre decompose : chaque teinte est lue a sa propre position,
  // ecartee du centre en proportion de la distance.
  vec2 spread = centred * uAberration * 0.012;
  float rise = crtSignal(uv + spread, t).x;
  float drift = crtSignal(uv - spread, t).y;

  vec3 image = mix(uColorA, uColorB, rise * 0.75);
  image = mix(image, uColorC, drift * 0.7);

  // La grille d'ouverture : des colonnes fines, lues dans l'espace bombe
  // pour qu'elles se courbent avec l'image.
  float grille = 0.5 + 0.5 * sin(uv.x * max(uLines, 1.0) * 6.28318);
  image = mix(image, uColorA, (1.0 - grille * grille) * 0.22);

  // La vignette respire, et ramene vers le fond plutot que vers le noir.
  float breath = 0.5 + 0.08 * sin(uTime * 0.7);
  float edge = smoothstep(breath, breath + 0.7, r2 * 2.2);
  image = mix(image, uColorA, edge * 0.7);

  // Un reflet fige sur le verre, en haut a gauche.
  vec2 glare = scaled - vec2(-0.45 * aspect, 0.55);
  float shine = exp(-dot(glare, glare) * 3.0) * 0.14;
  image = mix(image, uColorC, shine);

  vec3 colour = mix(uColorA, image, screen);

  gl_FragColor = vec4(colour, 1.0);
}
`
