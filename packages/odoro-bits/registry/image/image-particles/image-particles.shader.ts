/**
 * Shaders de l'image en particules.
 *
 * ## Tout se passe au sommet
 *
 * Chaque point porte sa place definitive — c'est son `position` — et un
 * tirage qui dit d'ou il vient. Le rassemblement n'est qu'un melange entre les
 * deux, pilote par un seul uniforme : aucune position n'est recalculee par le
 * processeur central, et l'animation entiere tient dans une interpolation.
 *
 * ## La taille des points est une projection, pas un nombre magique
 *
 * `gl_PointSize` s'exprime en pixels du tampon de dessin. La convertir depuis
 * une taille en unites de scene demande le facteur de projection — hauteur du
 * tampon divisee par deux fois la tangente du demi-champ — qui arrive en
 * uniforme. Sans lui, les points changeraient de taille apparente avec la
 * densite de pixels de l'ecran et avec la hauteur du cadre.
 *
 * @module
 */

/**
 * Sommet : disperse, rassemble, respire.
 *
 * La respiration ne commence qu'une fois l'image formee — elle est multipliee
 * par l'avancement du rassemblement. Sinon les points arriveraient deja en
 * train de bouger, et l'on ne verrait pas l'image se poser.
 */
export const IMAGE_PARTICLES_VERTEX = /* glsl */ `
attribute vec3 aTint;
attribute vec3 aSeed;

uniform float uTime;
uniform float uScatter;
uniform float uAssembly;
uniform float uCell;
uniform float uProjection;

varying vec3 vTint;

void main() {
  vTint = aTint;

  vec3 loose = position + aSeed * uScatter;
  vec3 place = mix(loose, position, uAssembly);

  float phase = uTime + aSeed.x * 6.2831853;
  place.z += sin(phase) * uScatter * 0.07 * uAssembly;

  vec4 seen = modelViewMatrix * vec4(place, 1.0);
  gl_PointSize = uCell * uProjection / max(-seen.z, 0.001);
  gl_Position = projectionMatrix * seen;
}
`

/**
 * Fragment : un disque, pas un carre.
 *
 * Un point carre se lit comme un pixel — donc comme un defaut d'affichage.
 * Le rejet des coins coute moins qu'une texture et ne demande aucun
 * telechargement.
 */
export const IMAGE_PARTICLES_FRAGMENT = /* glsl */ `
precision mediump float;

varying vec3 vTint;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  if (dot(offset, offset) > 0.25) discard;
  gl_FragColor = vec4(vTint, 1.0);
}
`
