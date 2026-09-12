/**
 * Shader des lignes en houle.
 *
 * ## L'idee mathematique
 *
 * Le cadre est decoupe en bandes horizontales, une ligne par bande. Chaque
 * ligne est un y = f(x) : la somme de deux sinus non harmoniques, dephases
 * selon l'indice de la bande. Le dephasage est ce qui fait la figure : a un
 * instant donne, les cretes des lignes voisines ne sont pas alignees, et
 * l'oeil lit une nappe diagonale qui glisse alors que chaque ligne ne fait
 * que monter et descendre.
 *
 * Le fragment ne connait que sa bande et ses deux voisines : l'amplitude est
 * exprimee en hauteurs de bande et bornee a une, donc une ligne ne s'eloigne
 * jamais de plus d'une bande de son axe. Trois evaluations par fragment,
 * quel que soit le nombre de lignes.
 *
 * La distance a la ligne est divisee par la norme de sa pente : sans cela,
 * le trait s'epaissit la ou il est plat et s'amincit la ou il monte.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — l'encre des lignes.
 * - `uColorC` — l'eclat des cretes.
 * - `uCount` — nombre de lignes.
 * - `uAmplitude` — hauteur de la houle, en hauteurs de bande.
 * - `uSpeed` — vitesse de la houle.
 * - `uThickness` — epaisseur du trait, en fraction de la hauteur.
 */
export const LINE_WAVES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uAmplitude;
uniform float uSpeed;
uniform float uThickness;

// Deux sinus non harmoniques : le rapport 4/9 ne retombe jamais en phase
// dans le cadre, donc la houle ne se repete pas a l'oeil.
float houle(float x, float t, float phase) {
  return sin(x * 4.0 - t + phase) * 0.7 + sin(x * 9.0 + t * 0.6 - phase * 1.7) * 0.3;
}

// Derivee de la houle par rapport a x, pour normaliser l'epaisseur.
float pente(float x, float t, float phase) {
  return cos(x * 4.0 - t + phase) * 2.8 + cos(x * 9.0 + t * 0.6 - phase * 1.7) * 2.7;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float x = vUv.x * aspect;
  float t = uTime * uSpeed;

  float count = clamp(uCount, 2.0, 48.0);
  float pitch = 1.0 / count;
  float amplitude = clamp(uAmplitude, 0.0, 1.0) * pitch;

  float px = 1.0 / max(uResolution.y, 1.0);
  float thickness = max(uThickness, px);

  float band = floor(vUv.y * count);
  float ink = 0.0;
  float crest = 0.0;

  // La bande du fragment et ses deux voisines : l'amplitude est bornee a une
  // hauteur de bande, une ligne ne va jamais plus loin.
  for (int k = -1; k <= 1; k += 1) {
    float i = band + float(k);
    if (i < 0.0 || i >= count) continue;

    float phase = i * 0.55;
    float wave = houle(x, t, phase);
    float centre = (i + 0.5) * pitch + wave * amplitude;

    // La pente est en unites de cadre : l'amplitude y entre, l'aspect aussi.
    float slope = pente(x, t, phase) * amplitude * aspect;
    float d = abs(vUv.y - centre) / sqrt(1.0 + slope * slope);

    float line = 1.0 - smoothstep(thickness - px, thickness + px, d);
    ink = max(ink, line);
    // La crete : la ou la houle est au plus haut, le trait s'eclaire.
    crest = max(crest, line * smoothstep(0.3, 1.0, wave));
  }

  vec3 colour = mix(uColorA, uColorB, ink * 0.85);
  colour = mix(colour, uColorC, crest * 0.9);

  gl_FragColor = vec4(colour, 1.0);
}
`
