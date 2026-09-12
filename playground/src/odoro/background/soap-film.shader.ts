/**
 * Shader du film de savon.
 *
 * ## L'idee mathematique
 *
 * Un film mince colore par interference : sa teinte depend de son epaisseur,
 * et fait un tour complet chaque fois que l'epaisseur croit d'une longueur
 * d'onde. Ici, l'epaisseur est un bruit fractal, et le tour de teinte est
 * une phase : les deux couleurs du film se melangent selon le sinus de la
 * phase, et un cosinus a la frequence double creuse les franges sombres qui
 * separent les bandes. Ce sont des tokens qui tournent, pas un spectre ecrit
 * en dur.
 *
 * Deux details font le savon plutot que la nappe abstraite. D'abord
 * l'ecoulement : le domaine du bruit glisse vers le haut au fil du temps, ce
 * qui fait descendre les franges comme le liquide draine vers le bas ; et
 * l'epaisseur croit avec la profondeur, si bien que les bandes se resserrent
 * en bas. Ensuite la transparence : la ou le film est trop mince pour
 * interferer, il ne renvoie rien, et c'est le fond qui apparait.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond, vu au travers du film.
 * - `uColorB` — la premiere teinte du film.
 * - `uColorC` — la seconde teinte du film.
 * - `uSpeed` — vitesse de derive des epaisseurs.
 * - `uDrain` — ecoulement vers le bas.
 * - `uScale` — echelle du champ d'epaisseur.
 * - `uBands` — tours de teinte sur toute l'epaisseur.
 * - `uOctaves` — detail du bruit, et donc son cout.
 */
export const SOAP_FILM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDrain;
uniform float uScale;
uniform float uBands;
uniform float uOctaves;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float filmHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float filmNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = filmHash(cell);
  float b = filmHash(cell + vec2(1.0, 0.0));
  float c = filmHash(cell + vec2(0.0, 1.0));
  float d = filmHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Somme d'octaves : chaque passe deux fois plus fine et deux fois plus faible.
float filmFbm(vec2 p, int octaves) {
  float total = 0.0;
  float amplitude = 0.5;
  float normalisation = 0.0;

  for (int i = 0; i < 5; i += 1) {
    if (i >= octaves) break;
    total += filmNoise(p) * amplitude;
    normalisation += amplitude;
    p *= 2.0;
    amplitude *= 0.5;
  }

  return total / max(normalisation, 0.0001);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  int octaves = int(clamp(uOctaves, 1.0, 5.0));
  float t = uTime * uSpeed;

  // L'epaisseur : un bruit dont le domaine monte, pour que les franges
  // descendent, plus une pente qui epaissit le film vers le bas.
  vec2 q = p * max(uScale, 0.1) + vec2(t * 0.3, t + uTime * uDrain * 0.25);
  float epaisseur = filmFbm(q, octaves);
  epaisseur = epaisseur * 0.75 + (1.0 - vUv.y) * 0.45 * (0.5 + uDrain);

  // La phase : un tour de teinte par bande. Le sinus melange les deux
  // couleurs ; le cosinus a frequence double creuse les franges sombres.
  float phase = epaisseur * uBands * 6.2831853;
  vec3 teinte = mix(uColorB, uColorC, 0.5 + 0.5 * sin(phase));
  float franges = 0.55 + 0.45 * cos(phase * 2.0 + 1.2);

  // La transparence : sous une epaisseur minimale, le film ne renvoie rien.
  float presence = smoothstep(0.12, 0.32, epaisseur);

  // Un reflet qui balaie en diagonale, comme une lumiere de fenetre.
  float balayage = sin((p.x + p.y) * 3.0 - uTime * 0.4);
  float reflet = pow(max(balayage, 0.0), 6.0) * 0.18;

  vec3 film = teinte * franges;
  vec3 colour = mix(uColorA, film, presence * 0.9);
  colour += (uColorB + uColorC) * 0.5 * reflet * presence;

  gl_FragColor = vec4(colour, 1.0);
}
`
