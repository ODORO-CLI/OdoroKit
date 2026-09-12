/**
 * Shaders de la sphere de points.
 *
 * ## L'idee
 *
 * Chaque point est un sommet sur une sphere unite. Le vertex shader le
 * souleve le long de sa normale — qui est sa position — d'une bosse centree
 * sur la direction du pointeur, plus une respiration de bruit. La bosse est
 * une fonction du cosinus de l'angle entre le point et le pointeur : nulle
 * loin, maximale sous lui, et son etendue est un reglage.
 *
 * Le fragment dessine un disque doux dans le point, teinte selon le
 * soulevement, et attenue l'hemisphere arriere : sans cette attenuation, les
 * deux faces de la sphere se superposent en un disque plat.
 *
 * Le bruit est fourni par le moteur (`NOISE_FUNCTIONS_3D`), prefixe au
 * vertex.
 *
 * @module
 */

/** Vertex shader : bosse sous le pointeur, respiration, taille par la profondeur. */
export const PARTICLE_SPHERE_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec3 uPointer;
uniform float uPull;
uniform float uReach;
uniform float uSize;
uniform float uPixelRatio;

varying float vLift;
varying float vFacing;

void main() {
  vec3 normal = normalize(position);

  // La bosse : proche de 1 sous le pointeur, nulle au-dela de la portee.
  float proximity = dot(normal, uPointer);
  float bump = smoothstep(1.0 - uReach, 1.0, proximity);
  bump = bump * bump * (3.0 - 2.0 * bump);

  // La respiration : un bruit lent qui fait onduler toute la surface.
  float breathe = odoroNoise3(normal * 2.2 + vec3(0.0, uTime * 0.3, 0.0)) - 0.5;

  float lift = bump * uPull + breathe * 0.1;
  vec3 displaced = normal * (1.0 + lift);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vec3 viewNormal = normalize(normalMatrix * normal);

  vLift = bump;
  vFacing = viewNormal.z;

  // La taille suit la profondeur, et les points souleves grossissent.
  gl_PointSize = uSize * uPixelRatio * (1.0 + bump * 1.4) * (3.2 / max(-viewPosition.z, 0.5));
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader : disque doux, teinte par soulevement, arriere attenue. */
export const PARTICLE_SPHERE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;

varying float vLift;
varying float vFacing;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = 1.0 - smoothstep(0.2, 0.5, d);
  if (disc <= 0.001) discard;

  // L'arriere de la sphere est plus sombre : c'est ce qui la fait ronde.
  float depth = mix(0.3, 1.0, smoothstep(-1.0, 0.6, vFacing));

  vec3 colour = mix(uColorA, uColorB, vLift);
  gl_FragColor = vec4(colour, disc * depth * 0.9);
}
`
