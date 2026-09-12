/**
 * Shader des meches.
 *
 * ## L'idee mathematique
 *
 * Chaque meche est un x = f(y) ancre en bas du cadre : sa position
 * horizontale est celle de sa colonne, plus un balancement qui grandit avec
 * la hauteur — nul a la racine, plein a la pointe. C'est cette croissance
 * en puissance de y qui fait l'algue : la base tient, la pointe suit le
 * courant avec retard.
 *
 * Le retard vient du balancement lui-meme, un sinus dont la phase depend de
 * y : la pointe n'est pas au meme instant de l'oscillation que le milieu, et
 * la meche ondule au lieu de pencher.
 *
 * Le fragment ne connait que sa colonne et ses deux voisines : le balancement
 * est borne a une largeur de colonne. Chaque meche a une hauteur propre, une
 * epaisseur qui s'amincit vers la pointe, et la distance au trait est divisee
 * par la norme de la pente pour que l'amincissement soit le seul a jouer.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le corps des meches.
 * - `uColorC` — leur pointe.
 * - `uCount` — nombre de meches.
 * - `uSway` — amplitude du balancement, en largeurs de colonne.
 * - `uSpeed` — vitesse du courant.
 * - `uThickness` — epaisseur a la racine, en fraction de la largeur.
 */
export const STRANDS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCount;
uniform float uSway;
uniform float uSpeed;
uniform float uThickness;

// Nombre pseudo-aleatoire : sinus amplifie, partie fractionnaire.
float mecheHash(float n) {
  return fract(sin(n * 12.9898 + 78.233) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime * uSpeed;

  float count = clamp(uCount, 2.0, 40.0);
  float pitch = 1.0 / count;
  float sway = clamp(uSway, 0.0, 1.0) * pitch;

  float px = 1.0 / max(uResolution.x, 1.0);
  float column = floor(vUv.x * count);
  float y = vUv.y;

  // La racine tient, la pointe suit : le balancement croit en y^1.6.
  float profile = pow(y, 1.6);

  float body = 0.0;
  float tip = 0.0;

  for (int k = -1; k <= 1; k += 1) {
    float i = column + float(k);
    if (i < 0.0 || i >= count) continue;

    float seed = mecheHash(i);
    float phase = seed * 6.2831853;

    // Deux sinus dephases en y : la pointe n'est pas au meme instant de
    // l'oscillation que le milieu, donc la meche ondule au lieu de pencher.
    float wave = sin(y * 3.0 - t + phase) * 0.6 + sin(y * 7.0 - t * 1.4 + phase * 2.3) * 0.4;
    float x = (i + 0.5) * pitch + wave * sway * profile;

    // Derivee en y, pour normaliser l'epaisseur. L'aspect ramene la pente
    // dans le repere du pixel.
    float slope = (cos(y * 3.0 - t + phase) * 1.8 + cos(y * 7.0 - t * 1.4 + phase * 2.3) * 2.8)
      * sway * profile * aspect;

    // Chaque meche a sa hauteur, et s'eteint sur ses derniers centimetres.
    float height = 0.5 + seed * 0.45;
    float alive = 1.0 - smoothstep(height - 0.12, height, y);

    // L'epaisseur s'amincit vers la pointe, jamais sous un pixel.
    float thickness = max(uThickness * (1.0 - 0.75 * y / height), px);
    float d = abs(vUv.x - x) / sqrt(1.0 + slope * slope);
    float line = (1.0 - smoothstep(thickness - px, thickness + px, d)) * alive;

    body = max(body, line);
    tip = max(tip, line * smoothstep(height * 0.5, height, y));
  }

  // Le fond s'assombrit vers la racine, comme une eau plus profonde.
  vec3 colour = mix(uColorA, uColorB, (1.0 - y) * 0.12);
  colour = mix(colour, uColorB, body);
  colour = mix(colour, uColorC, tip * 0.85);

  gl_FragColor = vec4(colour, 1.0);
}
`
