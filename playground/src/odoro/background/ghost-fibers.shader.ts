/**
 * Shader des fibres fantomes.
 *
 * ## L'idee mathematique
 *
 * Douze fibres, chacune une courbe `y = base + amplitude x sin(x x frequence
 * + phase)` dont la graine fixe l'amplitude, la frequence et la derive. Le
 * fragment ne parcourt pas la courbe : il compare son ordonnee a celle de la
 * fibre au meme abscisse, ce qui suffit tant que les fibres restent proches
 * de l'horizontale.
 *
 * L'attraction est une interpolation, pas une force : au droit du pointeur,
 * l'ordonnee de la fibre est tiree vers la sienne d'une fraction qui vaut une
 * gaussienne de l'ecart en abscisse. La fibre se pince donc autour du curseur
 * et retrouve son trace plus loin, sans discontinuite.
 *
 * Chaque fibre est peinte deux fois : un coeur tres fin, et une brume large
 * qui la double. C'est ce doublet qui la rend fantome — un trait seul serait
 * un cheveu, une brume seule un nuage.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les fibres au repos.
 * - `uColorC` — les fibres tirees vers le pointeur.
 * - `uPointer` — position amortie du pointeur, en coordonnees de texture.
 * - `uFibers` — nombre de fibres, borne a douze.
 * - `uBend` — force de l attraction, entre zero et un.
 * - `uSpeed` — vitesse de derive des fibres.
 */
export const GHOST_FIBERS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uFibers;
uniform float uBend;
uniform float uSpeed;

// Graine d'une fibre, stable d'une image a l'autre.
float fiberSeed(float index) {
  return fract(sin(index * 91.37) * 47453.19);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  float count = clamp(uFibers, 1.0, 12.0);
  float veil = 0.0;
  float pulled = 0.0;

  // Borne constante : la specification du langage l'exige. Les fibres au
  // dela du reglage sont annulees par un masque plutot que par une sortie
  // de boucle, que les anciennes plateformes refusent.
  for (int i = 0; i < 12; i += 1) {
    float index = float(i);
    float used = step(index, count - 0.5);

    float seed = fiberSeed(index + 1.0);
    float base = (index + 0.5) / count;
    float amplitude = 0.04 + seed * 0.10;
    float frequency = 1.6 + seed * 3.4;
    float phase = seed * 6.2831853 + uTime * uSpeed * (0.4 + seed * 0.7);

    float y = base + amplitude * sin(p.x * frequency + phase);

    // La prise du pointeur : une gaussienne de l'ecart en abscisse.
    float dx = (p.x - m.x) / (0.32 * aspect);
    float grip = exp(-dx * dx) * clamp(uBend, 0.0, 1.0);
    y = mix(y, m.y, grip * 0.9);

    float d = p.y - y;
    float core = exp(-d * d * 9000.0);
    float haze = exp(-d * d * 260.0);
    float strand = used * (core * 0.85 + haze * 0.30);

    veil += strand;
    pulled += strand * grip;
  }

  vec3 colour = mix(uColorA, uColorB, clamp(veil, 0.0, 1.0));
  colour = mix(colour, uColorC, clamp(pulled, 0.0, 1.0) * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
