/**
 * Shader du pave isometrique.
 *
 * ## L'idee mathematique
 *
 * Un cube vu en isometrie est un hexagone a sommet en haut, coupe en trois
 * losanges qui se rejoignent au centre : la face du dessus, la droite, la
 * gauche. Le pavage est donc une grille hexagonale — deux grilles
 * rectangulaires decalees d'une demi-maille, dont on garde la cellule la plus
 * proche — et la face se lit dans l'angle du fragment autour du centre de
 * l'hexagone.
 *
 * Les trois faces recoivent trois ombres fixes, comme sous une lumiere qui
 * vient d'en haut a gauche. C'est cette difference d'ombres qui fait le
 * relief : sans elle, le pavage est plat.
 *
 * L'allumage est un sinus de phase propre a chaque cube, seuille : une part
 * reglable des cubes est allumee a chaque instant, et ce ne sont jamais les
 * memes. Un tirage par image ne donnerait que du bruit.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — l'ombre des faces, melangee au fond.
 * - `uColorC` — l'allumage.
 * - `uSpeed` — vitesse de l'allumage.
 * - `uDensity` — nombre de cubes sur la hauteur.
 * - `uLit` — part des cubes allumes a un instant donne.
 */
export const ISOMETRIC_GRID_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uLit;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float isoHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Grille hexagonale a sommet en haut : coordonnees locales (xy) et
// identifiant de cellule (zw). Les deux grilles rectangulaires sont evaluees,
// la plus proche gagne.
vec4 isoHex(vec2 uv) {
  const vec2 s = vec2(1.0, 1.7320508);
  vec4 hc = floor(vec4(uv, uv - vec2(0.5, 1.0)) / s.xyxy) + 0.5;
  vec4 h = vec4(uv - hc.xy * s, uv - (hc.zw + 0.5) * s);
  return dot(h.xy, h.xy) < dot(h.zw, h.zw) ? vec4(h.xy, hc.xy) : vec4(h.zw, hc.zw + 0.5);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float scale = max(uDensity, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * scale;

  vec4 hex = isoHex(p);
  vec2 local = hex.xy;
  vec2 id = hex.zw;

  // La face se lit dans l'angle : dessus entre 30 et 150 degres, droite en
  // dessous de 30, gauche au-dela de 150.
  float angle = atan(local.y, local.x);
  float top = step(0.5235988, angle) * step(angle, 2.6179939);
  float right = step(angle, 0.5235988) * step(-1.5707963, angle);
  float left = 1.0 - top - right;

  float shade = top * 1.0 + right * 0.62 + left * 0.38;

  // L'arete de l'hexagone, en distance hexagonale : un filet sombre qui
  // separe les cubes.
  float hexDist = max(abs(local.x) * 0.8660254 + abs(local.y) * 0.5, abs(local.y));
  float px = scale / max(uResolution.y, 1.0) * 1.5;
  float edge = smoothstep(0.5 - px * 2.0, 0.5, hexDist);

  // Les trois aretes interieures, du centre vers les sommets a 30, 150 et
  // 270 degres : la distance a chaque demi-droite.
  float seam = 1.0;
  for (int i = 0; i < 3; i += 1) {
    float a = 0.5235988 + float(i) * 2.0943951;
    vec2 dir = vec2(cos(a), sin(a));
    float along = max(dot(local, dir), 0.0);
    seam = min(seam, length(local - dir * along));
  }
  float inner = smoothstep(px * 2.0, 0.0, seam);

  // Allumage : un sinus de phase propre, seuille par la part demandee.
  float phase = isoHash(id);
  float wave = 0.5 + 0.5 * sin(uTime * uSpeed * 2.0 + phase * 12.566);
  float lit = smoothstep(1.0 - uLit, 1.0 - uLit * 0.5, wave) * step(0.001, uLit);

  vec3 block = mix(uColorA, uColorB, 0.16 + 0.02 * phase) * (0.55 + 0.45 * shade);
  vec3 glow = uColorC * (0.55 + 0.45 * shade);
  vec3 colour = mix(block, glow, lit);

  colour = mix(colour, uColorA, edge * 0.7);
  colour = mix(colour, uColorA, inner * 0.35);

  gl_FragColor = vec4(colour, 1.0);
}
`
