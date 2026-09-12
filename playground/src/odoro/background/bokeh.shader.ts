/**
 * Shader du bokeh.
 *
 * ## L'idee mathematique
 *
 * Trois couches de disques flous, un disque par cellule d'une grille hachee.
 * La profondeur est simulee par la couche : plus elle est proche, plus ses
 * disques sont grands, flous et lents — c'est l'inverse d'une parallaxe de
 * paysage, parce qu'un objectif rend flou ce qui est hors du plan de nettete,
 * pas ce qui est loin. Le bord de chaque disque est un smoothstep dont la
 * largeur est le reglage de flou.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — l'obscurite du fond.
 * - `uColorB`, `uColorC` — les deux teintes de disques, reparties par graine.
 * - `uSpeed` — vitesse de derive laterale.
 * - `uDensity` — nombre de cellules sur le plus petit cote.
 * - `uBlur` — largeur du bord flou des disques.
 */
export const BOKEH_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uBlur;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float bokehHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule : le second est hache depuis
// un point decale, sans quoi x et y seraient lies.
vec2 bokehHash2(vec2 p) {
  return vec2(bokehHash(p), bokehHash(p + vec2(37.3, 17.7)));
}

// Une couche de disques : la grille est decalee lateralement par le temps,
// et chaque pixel somme les neuf cellules voisines — un disque depasse de sa
// cellule, et sans ce parcours il serait tranche a chaque bord de maille.
vec3 bokehCouche(vec2 uv, float aspect, float t, float profondeur, vec3 teinteA, vec3 teinteB) {
  // Plus la couche est proche, moins elle a de cellules : ses disques sont
  // plus grands, plus flous, plus lents — le rendu d'un objectif, pas d'un
  // paysage.
  float maille = max(uDensity, 1.0) * (1.0 - 0.26 * profondeur);
  float derive = t * (0.5 - 0.14 * profondeur) * (mod(profondeur, 2.0) * 2.0 - 1.0);

  vec2 p = vec2(uv.x * aspect + derive, uv.y + profondeur * 7.31) * maille;
  vec2 cell = floor(p);
  vec3 somme = vec3(0.0);

  float rayon = 0.22 + 0.14 * profondeur;
  float flou = clamp(uBlur, 0.05, 1.0) * (0.28 + 0.3 * profondeur);
  float voile = 0.55 - 0.12 * profondeur;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 voisine = cell + vec2(float(dx), float(dy));
      vec2 graine = bokehHash2(voisine);

      // Le disque flotte dans sa cellule, a un point hache : la grille ne se
      // lit plus comme une grille.
      vec2 centre = voisine + 0.5 + (graine - 0.5) * 0.6;
      float d = length(p - centre);

      // Le bord flou : un smoothstep dont la largeur est le reglage. C'est le
      // cercle de confusion d'un objectif, pas un degrade decoratif.
      float disque = smoothstep(rayon, rayon - max(flou * rayon, 0.02), d);

      // Certaines cellules restent vides : un bokeh plein a craquer se lit
      // comme une texture, pas comme des lumieres.
      float presence = step(0.35, bokehHash(voisine + 5.0));

      vec3 teinte = mix(teinteA, teinteB, bokehHash(voisine + 11.0));
      somme += teinte * disque * presence * voile;
    }
  }

  return somme;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;
  colour += bokehCouche(vUv, aspect, t, 0.0, uColorB, uColorC);
  colour += bokehCouche(vUv, aspect, t, 1.0, uColorB, uColorC);
  colour += bokehCouche(vUv, aspect, t, 2.0, uColorC, uColorB);

  gl_FragColor = vec4(colour, 1.0);
}
`
