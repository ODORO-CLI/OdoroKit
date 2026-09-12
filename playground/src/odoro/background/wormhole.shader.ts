/**
 * Shader du vortex torsade.
 *
 * ## L'idee mathematique
 *
 * La meme perspective que le tunnel — la profondeur vaut l'inverse du rayon
 * — mais rien d'autre en commun. L'angle est tordu avec la profondeur :
 * plus un point est loin, plus il est tourne, si bien que les aretes du
 * couloir s'enroulent en helice au lieu de fuir droit vers le centre. Le
 * tout pivote en plus avec le temps, et le point de fuite se promene en
 * lente ellipse : le couloir est courbe, pas rectiligne.
 *
 * Les parois portent six aretes, lues en cosinus de l'angle tordu, et des
 * bandes de profondeur qui avancent. La teinte n'est pas fixe : elle tourne
 * autour de la paroi avec l'angle tordu et la profondeur, d'une couleur a
 * l'autre. L'eclat suit les aretes, la ou une bande les croise.
 *
 * Le point de fuite est eteint avant qu'il ne batte avec la grille de
 * pixels : ce n'est pas decoratif.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la premiere teinte des parois.
 * - `uColorC` — la seconde teinte, et l'eclat des aretes.
 * - `uSpeed` — vitesse d'avancee.
 * - `uTwist` — torsion des aretes avec la profondeur.
 * - `uSpin` — vitesse de rotation de l'ensemble.
 * - `uRings` — densite des bandes de profondeur.
 */
export const WORMHOLE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uTwist;
uniform float uSpin;
uniform float uRings;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.0;

  // Le point de fuite se promene : le couloir est courbe, pas rectiligne.
  p -= 0.22 * vec2(sin(uTime * 0.6), cos(uTime * 0.45));

  float r = length(p);
  float angle = atan(p.y, p.x);
  float z = 1.0 / max(r, 0.01);
  float t = uTime * uSpeed;

  // La torsion : l'angle tourne avec la profondeur ; le tout pivote.
  float twisted = angle + z * uTwist * 0.25 + uTime * uSpin;

  // La profondeur avance ; les bandes y sont lues en sinus.
  float depth = z * max(uRings, 1.0) * 0.25 - t * 3.0;

  // Les parois : six aretes torsadees, et des bandes qui avancent.
  float ribs = 0.5 + 0.5 * cos(twisted * 6.0);
  float band = smoothstep(0.25, 0.75, 0.5 + 0.5 * sin(depth));

  // La teinte tourne autour de la paroi ; l'eclat suit les aretes.
  float hue = 0.5 + 0.5 * sin(twisted * 3.0 + depth * 0.5);
  float glint = pow(ribs, 6.0) * band;

  // Le point de fuite est eteint avant qu'il ne batte avec les pixels.
  float far = smoothstep(0.03, 0.35, r);

  vec3 wall = mix(uColorB, uColorC, hue);
  vec3 colour = mix(uColorA, wall, (0.25 + 0.75 * band) * far * (0.5 + 0.5 * ribs));
  colour = mix(colour, uColorC, glint * far * 0.7);

  gl_FragColor = vec4(colour, 1.0);
}
`
