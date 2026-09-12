/**
 * Shaders de l'hologramme.
 *
 * ## Pourquoi un programme a part
 *
 * Un materiau de ligne ordinaire a une couleur et une opacite, et rien
 * d'autre. Or un hologramme se reconnait a trois choses que la geometrie
 * ne porte pas : sa face arriere s'efface, une bande de balayage monte a
 * travers lui, et des stries fines le traversent en permanence. Les trois
 * sont des fonctions de la hauteur et de l'orientation du point — deux
 * valeurs que seul le sommet connait — donc un programme de sommet qui les
 * transmet, et un programme de fragment qui les combine.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes.
 * - `uLine` — la teinte des lignes.
 * - `uScan` — la teinte de la bande de balayage.
 * - `uScanPos` — hauteur de la bande, en unites de scene.
 * - `uFlick` — luminance du palier courant, entre zero et un.
 * - `uOpacity` — opacite de base des lignes.
 */
export const HOLOGRAM_VERTEX = /* glsl */ `
varying float vHeight;
varying float vFacing;

void main() {
  vHeight = position.y;

  // L'orientation par rapport a la camera : la normale d'une sphere est
  // sa position, et la face arriere s'efface d'apres elle.
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize((modelViewMatrix * vec4(normalize(position), 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));

  gl_Position = projectionMatrix * mv;
}
`

export const HOLOGRAM_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uLine;
uniform vec3 uScan;
uniform float uScanPos;
uniform float uFlick;
uniform float uOpacity;

varying float vHeight;
varying float vFacing;

void main() {
  // La face arriere reste visible mais en retrait : supprimee, la sphere
  // serait un disque ; a egalite, elle serait une boule pleine de lignes.
  float depth = mix(0.22, 1.0, smoothstep(-0.8, 0.8, vFacing));

  // La bande de balayage : une gaussienne de la hauteur autour de sa
  // position.
  float d = vHeight - uScanPos;
  float band = exp(-d * d * 40.0);

  // Les stries : un sinus fin de la hauteur qui descend lentement.
  float stripes = 0.7 + 0.3 * sin(vHeight * 70.0 + uTime * 5.0);

  vec3 colour = mix(uLine, uScan, band);
  float alpha = uOpacity * depth * stripes * uFlick * (0.6 + band * 1.4);
  if (alpha < 0.002) discard;

  gl_FragColor = vec4(colour, clamp(alpha, 0.0, 1.0));
}
`
