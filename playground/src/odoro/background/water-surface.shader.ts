/**
 * Shaders de la surface d'eau : des vagues de Gerstner et un reflet rasant.
 *
 * ## L'idee
 *
 * Quatre vagues de Gerstner, chacune deux fois plus courte et plus faible que
 * la precedente, dans des directions qui ne sont pas alignees. Une vague de
 * Gerstner ne souleve pas seulement le point : elle le deplace aussi vers la
 * crete, ce qui pince les cretes et elargit les creux — c'est ce pincement
 * qui distingue l'eau d'un drap qui ondule. La normale est analytique, somme
 * des derivees de chaque vague.
 *
 * Dans le fragment, un bruit tridimensionnel fin perturbe la normale : ce
 * sont les ridules que le vent souleve, trop petites pour la geometrie, et
 * ce sont elles qui font scintiller le soleil.
 *
 * ## Pourquoi un fresnel
 *
 * L'eau ne reflete le ciel qu'en rasant : vue de face, on voit a travers ;
 * vue au ras, c'est un miroir. La teinte passe de la couleur de l'eau a celle
 * du ciel selon l'angle de vue, et c'est cette transition, plus qu'aucun
 * reflet, qui fait lire la surface comme de l'eau.
 *
 * Le bruit est fourni par le moteur (`NOISE_FUNCTIONS_3D`), prefixe au
 * fragment.
 *
 * @module
 */

/** Vertex shader : vagues de Gerstner, normale analytique, repere tangent. */
export const WATER_SURFACE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uWavelength;
uniform float uChop;
uniform float uSpeed;

varying vec3 vNormal;
varying vec3 vTangentX;
varying vec3 vTangentY;
varying vec3 vViewPosition;
varying vec2 vPlane;

const int WAVES = 4;
const float TAU = 6.28318530718;

void main() {
  vec2 at = position.xy;
  vec3 displaced = vec3(at, 0.0);
  vec3 normal = vec3(0.0, 0.0, 1.0);

  float longueur = uWavelength;
  float amplitude = uAmplitude;

  for (int i = 0; i < WAVES; i += 1) {
    // Des directions qui ne se repetent pas : l'angle avance d'un pas
    // irrationnel, donc aucune vague n'est parallele a une autre.
    float angle = 0.4 + float(i) * 1.9;
    vec2 direction = vec2(cos(angle), sin(angle));
    float k = TAU / max(longueur, 0.05);
    // Relation de dispersion en eau profonde : les longues vagues vont plus
    // vite que les courtes.
    float pulsation = sqrt(9.8 * k) * uSpeed;
    float phase = k * dot(direction, at) - pulsation * uTime;

    // Le pincement : le point glisse vers la crete. Reparti sur les vagues
    // pour que la somme ne fasse jamais boucler la surface.
    float pince = uChop * 0.85 / float(WAVES);
    float cosinus = cos(phase);
    float sinus = sin(phase);

    displaced.xy += direction * (pince / k) * cosinus;
    displaced.z += amplitude * sinus;

    normal.xy -= direction * k * amplitude * cosinus;
    normal.z -= pince * sinus;

    longueur *= 0.55;
    amplitude *= 0.6;
  }

  vPlane = at;
  vNormal = normalize(normalMatrix * normalize(normal));
  vTangentX = normalize(normalMatrix * vec3(1.0, 0.0, 0.0));
  vTangentY = normalize(normalMatrix * vec3(0.0, 1.0, 0.0));

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader : ridules, fresnel, soleil, brume. */
export const WATER_SURFACE_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uDeep;
uniform vec3 uWater;
uniform vec3 uSky;
uniform float uSun;

varying vec3 vNormal;
varying vec3 vTangentX;
varying vec3 vTangentY;
varying vec3 vViewPosition;
varying vec2 vPlane;

void main() {
  // Les ridules : le gradient d'un bruit fin, applique dans le repere
  // tangent de la surface. Elles s'estompent au loin, ou elles ne feraient
  // que du bruit de pixels.
  float distance = length(vViewPosition);
  float fin = 1.0 - smoothstep(2.0, 9.0, distance);
  float e = 0.06;
  vec3 q = vec3(vPlane * 5.0, uTime * 0.45);
  float n0 = odoroNoise3(q);
  float nx = odoroNoise3(q + vec3(e, 0.0, 0.0));
  float ny = odoroNoise3(q + vec3(0.0, e, 0.0));
  vec3 normal = normalize(
    vNormal + (vTangentX * (n0 - nx) + vTangentY * (n0 - ny)) * 3.0 * fin
  );

  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);

  // Fresnel : de face l'eau, au ras le ciel.
  float fresnel = 0.04 + 0.96 * pow(1.0 - facing, 4.0);
  vec3 colour = mix(uWater, uSky, fresnel);

  // Le soleil, bas devant : un eclat etroit, et un scintillement plus
  // large que les ridules brisent en paillettes.
  vec3 sun = normalize(vec3(0.3, 0.4, -1.0));
  vec3 halfway = normalize(sun + view);
  float alignement = max(dot(normal, halfway), 0.0);
  float eclat = pow(alignement, 240.0) * 2.2;
  float paillettes = pow(alignement, 36.0) * 0.4;
  float diffuse = 0.75 + 0.25 * max(dot(normal, sun), 0.0);

  colour = colour * diffuse + uSky * (eclat + paillettes) * uSun;

  // Brume : la surface se fond dans le fond bien avant le bord du plan.
  float fog = smoothstep(4.0, 13.0, distance);
  colour = mix(colour, uDeep, fog);

  gl_FragColor = vec4(colour, 1.0);
}
`
