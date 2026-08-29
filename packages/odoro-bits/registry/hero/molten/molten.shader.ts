/**
 * Shaders de Molten.
 *
 * ## Ce que la scene calcule
 *
 * Une sphere subdivisee, deplacee le long de ses normales par une somme
 * d'octaves de bruit tridimensionnel. Le champ de bruit se translate dans le
 * temps plutot que de tourner : la masse semble alors respirer sur place, au
 * lieu de defiler.
 *
 * ## Pourquoi la normale est recalculee
 *
 * Deplacer les sommets change la forme, mais pas les normales fournies avec la
 * geometrie : l'eclairage resterait celui d'une sphere lisse, ce qui annule
 * visuellement toute la deformation. Les recalculer exactement demanderait la
 * derivee du champ de bruit.
 *
 * On l'approche par differences finies — trois evaluations de plus autour du
 * point, dont on tire deux tangentes. C'est plus cher, et c'est la depense qui
 * fait la difference entre une sphere bosselee et une masse qui a du relief.
 *
 * ## Ce que le fragment fait
 *
 * Deux couleurs, prises dans la palette : le coeur pour les creux, la croute
 * pour les reliefs. Un terme de Fresnel — la lumiere rase les bords — ajoute
 * le halo qui donne l'impression de matiere chaude. Aucune texture, aucun
 * fichier : tout est calcule.
 *
 * @module
 */

/**
 * Vertex shader.
 *
 * Le bruit est prefixe a la compilation : les fonctions viennent du moteur, et
 * les recopier ici en ferait une seconde version a maintenir.
 */
export const MOLTEN_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform int uOctaves;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vRelief;

/**
 * Champ de deplacement en un point de la sphere unite.
 *
 * Le nom de la variable evite le mot reserve du langage qui designe un
 * echantillon : la compilation du shader echouerait, sans que rien, cote
 * TypeScript, ne le signale.
 */
float molten(vec3 direction) {
  vec3 field = direction * uFrequency + vec3(0.0, 0.0, uTime * uSpeed);
  return odoroFbm3(field, uOctaves) - 0.5;
}

void main() {
  vec3 direction = normalize(position);
  float relief = molten(direction);
  vec3 displaced = position + direction * relief * uAmplitude;

  // Normale approchee par differences finies. Deux tangentes suffisent : la
  // normale est leur produit vectoriel.
  vec3 up = abs(direction.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 tangent = normalize(cross(up, direction));
  vec3 bitangent = cross(direction, tangent);

  // Nomme epsilon plutot que step : ce dernier masquerait la fonction native
  // du meme nom, ce qui est legal et deroutant.
  float epsilon = 0.02;
  vec3 nearTangent = normalize(direction + tangent * epsilon);
  vec3 nearBitangent = normalize(direction + bitangent * epsilon);

  vec3 pointHere = displaced;
  vec3 pointTangent =
    nearTangent + nearTangent * molten(nearTangent) * uAmplitude;
  vec3 pointBitangent =
    nearBitangent + nearBitangent * molten(nearBitangent) * uAmplitude;

  vec3 normal = normalize(
    cross(pointTangent - pointHere, pointBitangent - pointHere)
  );
  // Le produit vectoriel peut sortir retourne selon l'ordre des tangentes :
  // on le realigne sur la direction sortante plutot que d'esperer le bon sens.
  normal *= sign(dot(normal, direction));

  vRelief = relief;
  vNormal = normalize(normalMatrix * normal);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader. */
export const MOLTEN_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uCore;
uniform vec3 uCrust;
uniform float uGlow;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vRelief;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 toEye = normalize(-vViewPosition);

  // Fresnel : la lumiere rase les bords vus de profil. L'exposant trois est
  // une approximation courante de la loi de Schlick, assez juste pour un halo.
  float facing = max(dot(normal, toEye), 0.0);
  float rim = pow(1.0 - facing, 3.0);

  // Un eclairage diffus minimal suffit a lire le relief : la matiere est
  // emissive, elle n'a pas de source a refleter.
  float diffuse = 0.35 + 0.65 * facing;

  vec3 base = mix(uCore, uCrust, smoothstep(-0.25, 0.3, vRelief));
  vec3 colour = base * diffuse + uCore * rim * uGlow;

  gl_FragColor = vec4(colour, 1.0);
}
`
