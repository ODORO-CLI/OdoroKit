/**
 * Shader du chrome liquide.
 *
 * ## L'idee mathematique
 *
 * Le chrome ne se peint pas : il reflechit. Ce qu'on voit d'une surface
 * chromee, c'est son environnement, replie par sa forme. Ici la forme est
 * un liquide — des sinus directionnels dans un domaine que deforme un
 * premier sinus, ce qui rend les vagues molles — et l'environnement est un
 * studio reduit a l'essentiel : un ciel clair, un sol sombre, une ligne
 * d'horizon dure entre les deux, et une boite a lumiere dans le ciel.
 *
 * La direction reflechie se calcule de la normale ; sa composante verticale
 * dit si le fragment regarde le ciel ou le sol. C'est ce basculement brutal
 * qui fait le chrome, et non un reflet doux : la ou l'iridescence lisse,
 * ici tout est marche.
 *
 * ## Le clair et le sombre
 *
 * Le ciel et le sol sont le fond et l'encre du theme, ranges dans le bon
 * ordre : le shader compare leurs luminances et prend le plus clair pour le
 * ciel. En theme clair, le chrome se dessine en encre sur le fond ; en theme
 * sombre, il luit. Aucune couleur n'est multipliee vers le noir : tout est
 * melange borne entre les tokens, et la lisiere d'horizon recoit une teinte
 * par addition.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — l'encre, le contraire du fond.
 * - `uColorC` — la teinte de la lisiere d'horizon.
 * - `uSpeed` — vitesse du liquide.
 * - `uScale` — echelle des vagues.
 * - `uContrast` — profondeur du sol dans le reflet.
 * - `uSheen` — force de la teinte a l'horizon.
 * - `uDetail` — nombre de vagues sommees, et donc leur cout.
 */
export const LIQUID_CHROME_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uContrast;
uniform float uSheen;
uniform float uDetail;

// Une vague directionnelle : la hauteur, et son gradient.
vec3 chromeVague(vec2 p, vec2 dir, float freq, float phase, float amp) {
  float arg = dot(p, dir) * freq + phase;
  return vec3(sin(arg) * amp, cos(arg) * amp * freq * dir);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y) * max(uScale, 0.2);
  float t = uTime * uSpeed;
  int vagues = int(clamp(uDetail, 1.0, 5.0));

  // Le liquide : le domaine est deforme avant les vagues, ce qui les rend
  // molles — des sinus droits feraient de la tole ondulee, pas du chrome.
  p += 0.25 * vec2(sin(p.y * 1.4 + t * 0.8), sin(p.x * 1.1 - t * 0.6));

  vec3 champ = chromeVague(p, normalize(vec2(1.0, 0.4)), 2.2, t * 1.3, 0.35);
  if (vagues >= 2) champ += chromeVague(p, normalize(vec2(-0.5, 1.0)), 3.1, -t * 1.0 + 0.7, 0.25);
  if (vagues >= 3) champ += chromeVague(p, normalize(vec2(0.8, -0.6)), 4.7, t * 1.6 + 2.4, 0.14);
  if (vagues >= 4) champ += chromeVague(p, normalize(vec2(0.1, 1.0)), 7.3, -t * 0.9 + 1.1, 0.07);
  if (vagues >= 5) champ += chromeVague(p, normalize(vec2(1.0, 1.0)), 11.0, t * 2.2, 0.03);

  vec3 n = normalize(vec3(-champ.yz, 1.0));

  // La direction reflechie d'une vue de face : seule sa composante
  // verticale compte pour un environnement fait de bandes horizontales.
  vec3 r = reflect(vec3(0.0, 0.0, -1.0), n);

  // Le ciel et le sol, dans le bon ordre quel que soit le theme.
  float clair = step(dot(uColorB, vec3(0.333)), dot(uColorA, vec3(0.333)));
  vec3 ciel = mix(uColorB, uColorA, clair);
  vec3 sol = mix(uColorA, uColorB, clair);

  // L'horizon : une marche, a peine adoucie. La boite a lumiere : une bande
  // dans le ciel, qui rend le reflet lisible comme un reflet de studio.
  float horizon = smoothstep(-0.04, 0.04, r.y + 0.1);
  float boite = smoothstep(0.42, 0.47, r.y) * smoothstep(0.72, 0.67, r.y);

  vec3 studio = mix(sol, ciel, horizon);
  studio = mix(studio, sol, boite * 0.35);
  vec3 colour = mix(uColorA, studio, clamp(uContrast, 0.0, 1.0));

  // La lisiere : une teinte le long de l'horizon et sur les bords rasants,
  // la ou le chrome reel prend la couleur de ce qui l'entoure.
  float lisiere = exp(-abs(r.y + 0.1) * 14.0);
  float rasant = pow(1.0 - max(n.z, 0.0), 2.0);
  colour = mix(colour, uColorC, clamp(lisiere * 0.7 + rasant * 0.5, 0.0, 1.0) * uSheen);

  // L'eclat : un reflet etroit, ajoute vers le ciel.
  vec3 lumiere = normalize(vec3(-0.4, 0.7, 0.6));
  vec3 h = normalize(lumiere + vec3(0.0, 0.0, 1.0));
  float eclat = pow(max(dot(n, h), 0.0), 60.0);
  colour = mix(colour, ciel, eclat * 0.9);

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
