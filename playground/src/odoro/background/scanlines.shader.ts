/**
 * Shader des lignes de balayage.
 *
 * ## L'idee mathematique
 *
 * Tout l'ecran cathodique tient dans des fonctions periodiques du seul axe
 * vertical : les lignes sont un sinus de y a haute frequence, la barre qui
 * roule est la partie fractionnaire de y decalee par le temps, et le grain
 * est un hachage du pixel rejoue par paliers de temps — discret, parce qu'un
 * tirage par image scintillerait au lieu de granuler. Une vignette referme le
 * tout.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond du tube.
 * - `uColorB` — la teinte du phosphore.
 * - `uColorC` — la teinte de la barre qui roule.
 * - `uSpeed` — vitesse de la barre.
 * - `uLines` — nombre de lignes sur la hauteur.
 * - `uFlicker` — part du grain anime.
 */
export const SCANLINES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uLines;
uniform float uFlicker;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float tubeHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float t = uTime;

  // Les lignes : un sinus de y, eleve au carre pour creuser les interlignes
  // sans durcir les cretes.
  float ligne = 0.5 + 0.5 * sin(vUv.y * max(uLines, 1.0) * 6.28318);
  ligne = 0.35 + 0.65 * ligne * ligne;

  // La barre qui roule : la partie fractionnaire de y decalee par le temps
  // fait boucler la descente sans aucun test.
  float roulement = fract(vUv.y + t * uSpeed * 0.2);
  float barre = smoothstep(0.0, 0.12, roulement) * smoothstep(0.30, 0.12, roulement);

  // Le grain : un hachage du pixel rejoue par paliers de temps. Discret —
  // le palier tient l'image quelques centiemes — parce qu'un tirage par
  // image scintille au lieu de granuler.
  float palier = floor(t * 18.0);
  float grain = (tubeHash(floor(vUv * uResolution * 0.5) + palier) - 0.5) * uFlicker * 0.35;

  vec3 colour = mix(uColorA, uColorB, ligne * (0.75 + grain));
  colour = mix(colour, uColorC, barre * 0.30);

  // Vignette : les coins d'un tube sont plus sombres que son centre.
  vec2 ecart = (vUv - 0.5) * vec2(aspect, 1.0);
  colour *= 1.0 - smoothstep(0.35, 0.85, length(ecart)) * 0.55;

  gl_FragColor = vec4(colour, 1.0);
}
`
