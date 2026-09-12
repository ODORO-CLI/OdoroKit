/**
 * Shader du pollen.
 *
 * ## L'idee mathematique
 *
 * Deux plans, et c'est tout ce qui fait la profondeur. Le plan lointain est
 * un semis serre de petits grains nets : un disque a bord doux. Le plan
 * proche est un semis lache de gros grains flous : une gaussienne large et
 * pale, ce que donne un objet hors du plan de mise au point. Les deux
 * derivent lentement, le proche un peu plus vite que le lointain.
 *
 * Le pointeur decale les deux plans en sens inverse de son mouvement, le
 * proche davantage que le lointain : c'est la parallaxe, et c'est elle qui
 * fait lire les deux plans comme deux distances plutot que comme deux
 * tailles.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les grains lointains, nets.
 * - `uColorC` — les grains proches, flous.
 * - `uPointer` — position amortie du pointeur, centree, bornee a [-1, 1].
 * - `uSpeed` — vitesse de la derive.
 * - `uDensity` — nombre de cellules sur la hauteur du plan lointain.
 * - `uBlur` — flou du plan proche.
 * - `uParallax` — amplitude du decalage sous le pointeur.
 * - `uSpread` — rayon de cellules parcouru autour de la cellule courante ;
 *   zero en qualite basse, ou un grain ne deborde plus de sa cellule.
 */
export const POLLEN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uSpeed;
uniform float uDensity;
uniform float uBlur;
uniform float uParallax;
uniform float uSpread;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float pollenHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule.
vec2 pollenHash2(vec2 p) {
  return vec2(pollenHash(p), pollenHash(p + vec2(37.3, 17.7)));
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  float t = uTime * uSpeed;

  vec3 colour = uColorA;

  // Plan 0 : lointain, net. Plan 1 : proche, flou.
  for (int plane = 0; plane < 2; plane += 1) {
    float proche = float(plane);
    float scale = max(uDensity, 2.0) * (1.0 - proche * 0.55);

    // Le proche se decale plus que le lointain : c'est toute la parallaxe.
    vec2 decalage = uPointer * uParallax * (0.02 + proche * 0.06);

    // Le pollen tombe a peine et derive de cote ; le proche va plus vite.
    vec2 drift = vec2(t * (0.03 + proche * 0.05), -t * (0.02 + proche * 0.04));
    vec2 p = (uv + decalage) * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        // En qualite basse, seule la cellule courante est lue.
        if (abs(float(dx)) > uSpread || abs(float(dy)) > uSpread) continue;

        vec2 voisine = cell + vec2(float(dx), float(dy));
        vec2 graine = pollenHash2(voisine + proche * 83.0);
        float exists = step(0.25, pollenHash(voisine + 7.0 + proche * 9.0));

        vec2 centre = voisine + 0.5
          + 0.3 * vec2(sin(t * 0.5 + graine.x * 6.28318), cos(t * 0.4 + graine.y * 6.28318));

        float d = length(p - centre);
        float size = (0.06 + 0.05 * graine.x) * (1.0 + proche * (1.5 + uBlur * 2.0));

        // Net : un disque a bord doux. Flou : une gaussienne large et pale,
        // d'autant plus pale que le flou est fort — la lumiere s'etale.
        float net = 1.0 - smoothstep(size * 0.6, size, d);
        float flou = exp(-d * d / (size * size)) * 0.6 / (1.0 + uBlur);
        float forme = mix(net, flou, proche);

        colour += mix(uColorB, uColorC, proche) * forme * exists * (0.8 - proche * 0.25);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
