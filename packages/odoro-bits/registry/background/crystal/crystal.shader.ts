/**
 * Shaders du cristal : des facettes plates et une refraction feinte.
 *
 * ## L'idee
 *
 * Un vrai cristal refracte ce qu'il y a derriere lui. Ici il n'y a rien
 * derriere — pas d'environnement, pas de texture — et c'est voulu : un
 * environnement se telecharge, se prepare, et pese. A la place, la direction
 * refractee sert d'indice dans un degrade vertical entre deux teintes : une
 * facette qui devie le regard vers le haut prend l'une, vers le bas l'autre.
 * Comme chaque facette est plate, chaque facette a sa couleur propre, et le
 * cristal se lit par ses aretes.
 *
 * La dispersion est feinte de la meme facon : trois indices de refraction,
 * un par canal, et les couleurs se separent d'un liseret sur les aretes.
 *
 * ## Deux passes
 *
 * Les faces arriere sont dessinees d'abord, plus sombres, puis les faces
 * avant par-dessus : c'est la profondeur du cristal, ce qu'on voit a travers
 * lui de lui-meme. Le fragment recoit `uBack` pour savoir laquelle des deux
 * il dessine, parce que les faces arriere sont retournees par le moteur de
 * rendu et se croient de face.
 *
 * @module
 */

/** Vertex shader : normale de facette et position en espace vue. */
export const CRYSTAL_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader : refraction feinte, dispersion, fresnel, deux reflets. */
export const CRYSTAL_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDispersion;
uniform float uBack;

varying vec3 vNormal;
varying vec3 vViewPosition;

// Le degrade que la refraction "voit" : d'une teinte en bas a l'autre en haut.
vec3 crystalGradient(float t) {
  return mix(uColorA, uColorB, smoothstep(-0.7, 0.8, t));
}

void main() {
  // Les faces arriere sont retournees par le moteur : leur normale regarde
  // vers l'interieur, et le fresnel les prendrait toutes pour des aretes.
  vec3 normal = normalize(vNormal) * (1.0 - 2.0 * uBack);
  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);
  float fresnel = pow(1.0 - facing, 3.0);

  // Trois indices, trois directions, une couleur par canal.
  float eta = 1.0 / 1.45;
  float spread = uDispersion * 0.07;
  vec3 red = refract(-view, normal, eta - spread);
  vec3 green = refract(-view, normal, eta);
  vec3 blue = refract(-view, normal, eta + spread);
  vec3 refracted = vec3(
    crystalGradient(red.y + red.x * 0.35).r,
    crystalGradient(green.y + green.x * 0.35).g,
    crystalGradient(blue.y + blue.x * 0.35).b
  );

  vec3 light = normalize(vec3(0.5, 0.8, 0.6));
  float diffuse = max(dot(normal, light), 0.0);
  float specular = pow(max(dot(normal, normalize(light + view)), 0.0), 80.0);

  // Un second reflet, bas et a gauche : le rebond du sol, plus large.
  vec3 bounce = normalize(vec3(-0.7, -0.2, 0.4));
  float rebond = pow(max(dot(normal, normalize(bounce + view)), 0.0), 40.0) * 0.4;

  // La part ambiante est haute : un cristal sombre sur un fond sombre n'est
  // plus qu'une silhouette, et c'est par ses facettes qu'il doit se lire.
  vec3 colour = refracted * (0.55 + 0.55 * diffuse) + uColorB * (specular + rebond + fresnel * 0.4);

  // Les faces arriere, vues a travers, sont plus discretes.
  float alpha = (0.55 + 0.45 * fresnel + specular * 0.5) * mix(1.0, 0.55, uBack);

  gl_FragColor = vec4(colour, clamp(alpha, 0.0, 1.0));
}
`
