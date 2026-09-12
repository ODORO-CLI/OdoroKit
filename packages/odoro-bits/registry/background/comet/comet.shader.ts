/**
 * Shader de la comete.
 *
 * ## L'idee mathematique
 *
 * Une tete en halo gaussien a la position amortie du pointeur, et une queue
 * etiree a l'oppose de la vitesse de rattrapage : la position relative du
 * fragment est projetee sur la direction du mouvement, la queue est une
 * gaussienne transversale qui s'affine et s'eteint le long de cette
 * projection. Quand la comete a rattrape le pointeur, la vitesse s'annule et
 * la queue disparait d'elle-meme. Un scintillement leger anime la tete.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le ciel.
 * - `uColorB` — la queue.
 * - `uColorC` — la tete.
 * - `uPointer` — position amortie de la comete, en coordonnees de texture.
 * - `uVelocity` — vitesse de rattrapage, en coordonnees de texture par seconde.
 * - `uSize` — rayon de la tete.
 * - `uTail` — longueur de la queue.
 */
export const COMET_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform vec2 uVelocity;
uniform float uSize;
uniform float uTail;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float cometHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);
  vec2 vel = uVelocity * vec2(aspect, 1.0);

  float size = max(uSize, 0.01);
  float speed = length(vel);
  vec2 dir = vel / max(speed, 0.0001);

  vec2 rel = p - m;
  float d2 = dot(rel, rel);

  // La tete : un halo gaussien, avec un scintillement leger — un battement
  // lent module un grain rapide, jamais assez pour eteindre la tete.
  float flicker = 0.9 + 0.1 * sin(uTime * 9.0 + cometHash(floor(vUv * 64.0)) * 6.2831);
  float head = exp(-d2 / (size * size)) * flicker;

  // La queue : derriere la tete, a l'oppose du mouvement. La projection sur
  // la direction donne la position le long de la queue, la composante
  // transverse la distance a son axe.
  float along = dot(rel, -dir);
  float across = dot(rel, vec2(-dir.y, dir.x));

  // La longueur suit la vitesse de rattrapage : comete arretee, queue nulle.
  float tailLength = uTail * clamp(speed * 0.8, 0.0, 1.0);
  float fall = clamp(1.0 - along / max(tailLength, 0.001), 0.0, 1.0);

  // La queue s'affine en s'eloignant de la tete.
  float sigma = size * (0.25 + 0.75 * fall);
  float tail = exp(-(across * across) / (sigma * sigma)) * fall * fall * step(0.0, along);

  // Un fond de poussiere d'etoiles fixe, tres discret, pour que le ciel ne
  // soit pas un aplat.
  vec2 cell = floor(vUv * vec2(aspect, 1.0) * 60.0);
  float star = step(0.995, cometHash(cell)) * (0.3 + 0.7 * cometHash(cell + 11.0));

  vec3 colour = uColorA;
  float ecart = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.4, 1.0, ecart) * 0.4;

  colour += uColorB * star * 0.35;
  colour += uColorB * tail * 0.8;
  colour += uColorC * head * 1.2;

  gl_FragColor = vec4(colour, 1.0);
}
`
