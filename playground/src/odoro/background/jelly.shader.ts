/**
 * Shaders de la gelee : une sphere qui tremble la ou on la touche.
 *
 * ## L'idee
 *
 * Chaque sommet est deplace le long de sa normale — sa position sur la
 * sphere unite — d'une hauteur qui somme trois choses par impact : un creux
 * bref a l'endroit du choc, une onde qui court sur la surface en s'amortissant,
 * et un balancement de toute la masse dans l'axe du coup. La distance a
 * l'impact est geodesique — l'angle entre les deux directions — pour que
 * l'onde soit ronde sur la sphere, pas ecrasee sur les cotes.
 *
 * Un bruit lent fait respirer la surface entre deux coups : une gelee
 * immobile n'est plus une gelee.
 *
 * ## La normale
 *
 * Elle est recalculee par differences finies sur la sphere : la hauteur est
 * evaluee en deux points voisins, dans le plan tangent, et le produit
 * vectoriel des deux ecarts donne la normale de la surface deplacee. Sans
 * cela, la lumiere ignorerait les ondes, et elles ne se verraient que sur le
 * contour.
 *
 * Le bruit est fourni par le moteur (`NOISE_FUNCTIONS_3D`), prefixe au
 * vertex.
 *
 * @module
 */

/** Vertex shader : impacts, respiration, normale par differences finies. */
export const JELLY_VERTEX = /* glsl */ `
uniform float uTime;
uniform vec4 uImpacts[4];
uniform float uWobble;
uniform float uStiffness;
uniform float uDamping;

varying vec3 vNormal;
varying vec3 vViewPosition;

const int IMPACTS = 4;

// Hauteur de la surface en une direction : respiration plus impacts.
float jellyHeight(vec3 n) {
  float total = (odoroNoise3(n * 1.6 + vec3(0.0, uTime * 0.35, 0.0)) - 0.5) * 0.35;

  for (int i = 0; i < IMPACTS; i += 1) {
    vec4 impact = uImpacts[i];
    float age = uTime - impact.w;
    if (age < 0.0) continue;
    float along = dot(n, impact.xyz);
    float angle = acos(clamp(along, -1.0, 1.0));
    float fade = exp(-age * uDamping);

    // Le creux du doigt, qui se relache vite.
    float dent = -exp(-angle * angle * 10.0) * exp(-age * 7.0) * 1.2;
    // L'onde qui court depuis l'impact, plus faible en s'eloignant.
    float onde = cos(angle * 5.0 - age * uStiffness) * exp(-angle * 0.8) * fade * 0.5;
    // Le balancement de toute la masse dans l'axe du coup.
    float masse = along * sin(age * uStiffness * 0.55) * fade * 0.35;

    total += dent + onde + masse;
  }

  return total;
}

vec3 jellyPoint(vec3 n) {
  return n * (1.0 + jellyHeight(n) * uWobble);
}

void main() {
  vec3 n = normalize(position);
  vec3 p = jellyPoint(n);

  // Deux tangentes, deux points voisins, une normale.
  vec3 helper = abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t1 = normalize(cross(n, helper));
  vec3 t2 = cross(n, t1);
  float eps = 0.02;
  vec3 p1 = jellyPoint(normalize(n + t1 * eps));
  vec3 p2 = jellyPoint(normalize(n + t2 * eps));
  vec3 normal = normalize(cross(p1 - p, p2 - p));

  vNormal = normalize(normalMatrix * normal);
  vec4 viewPosition = modelViewMatrix * vec4(p, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader : corps translucide, fresnel, deux reflets. */
export const JELLY_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uBody;
uniform vec3 uHighlight;

varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);

  // Le bord s'eclaircit : la lumiere traverse la gelee la ou elle est mince.
  float fresnel = pow(1.0 - facing, 2.5);

  vec3 light = normalize(vec3(-0.5, 0.9, 0.7));
  float diffuse = max(dot(normal, light), 0.0);
  float specular = pow(max(dot(normal, normalize(light + view)), 0.0), 90.0);

  // Un second reflet, plus large et plus bas : le rebond de la table.
  vec3 bounce = normalize(vec3(0.7, -0.3, 0.5));
  float rebond = pow(max(dot(normal, normalize(bounce + view)), 0.0), 30.0) * 0.3;

  vec3 colour = uBody * (0.55 + 0.45 * diffuse);
  colour = mix(colour, uHighlight, clamp(fresnel * 0.55 + specular + rebond, 0.0, 1.0));

  gl_FragColor = vec4(colour, 0.72 + fresnel * 0.28);
}
`
