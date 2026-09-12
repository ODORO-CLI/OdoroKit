/**
 * Shaders de la maree : une nappe soulevee par une houle de bruit.
 *
 * ## L'idee
 *
 * Un plan dont chaque sommet monte de la valeur d'un bruit tridimensionnel lu
 * en (x, y, temps). Deux couches : une houle large, lente, et une ondulation
 * fine qui la traverse en biais — la seconde empeche la premiere de se lire
 * comme un drap qui respire.
 *
 * La normale vient de deux differences finies sur la hauteur : ce que le
 * relief fait a la lumiere, il le fait aussi aux reflets, et c'est la seule
 * chose qui donne du volume a une nappe sans texture.
 *
 * ## Pourquoi une brume
 *
 * Un plan fini a un bord, et un bord se voit. La couleur est fondue dans celle
 * du fond avec la distance : l'horizon disparait avant d'atteindre le bord de
 * la geometrie, et la nappe parait sans fin.
 *
 * Le bruit est fourni par le moteur (`NOISE_FUNCTIONS_3D`), prefixe au vertex.
 *
 * @module
 */

/** Vertex shader : houle, differences finies, normale. */
export const TIDE_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uSpeed;
uniform int uOctaves;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vHeight;

float tide(vec2 at) {
  vec3 field = vec3(at * uFrequency, uTime * uSpeed);
  float swell = odoroFbm3(field, uOctaves) - 0.5;
  // L'ondulation fine glisse en biais et bat plus vite : deux rythmes qui ne
  // se recouvrent jamais, donc jamais de respiration reguliere.
  vec3 fine = vec3(
    at * uFrequency * 3.0 + vec2(uTime * uSpeed * 0.6, uTime * uSpeed * 0.25),
    uTime * uSpeed * 1.7
  );
  float ripple = odoroNoise3(fine) - 0.5;
  return swell + ripple * 0.18;
}

void main() {
  float height = tide(position.xy) * uAmplitude;
  vec3 displaced = vec3(position.xy, height);

  // Normale d'un champ de hauteur z = h(x, y) : (-dh/dx, -dh/dy, 1), a un
  // facteur pres. Deux lectures voisines suffisent.
  float epsilon = 0.05;
  float alongX = tide(position.xy + vec2(epsilon, 0.0)) * uAmplitude;
  float alongY = tide(position.xy + vec2(0.0, epsilon)) * uAmplitude;
  vec3 normal = normalize(vec3(height - alongX, height - alongY, epsilon));

  vHeight = height / max(uAmplitude, 0.001);
  vNormal = normalize(normalMatrix * normal);

  vec4 viewPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader : couleur par hauteur, lumiere rasante, crete, brume. */
export const TIDE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uCrest;
uniform float uShine;

varying vec3 vNormal;
varying vec3 vViewPosition;
varying float vHeight;

void main() {
  vec3 normal = normalize(vNormal);
  vec3 view = normalize(-vViewPosition);

  // Les creux gardent la couleur du fond, les bosses prennent la teinte.
  float lift = smoothstep(-1.0, 1.0, vHeight);
  vec3 colour = mix(uDeep, uMid, lift);

  // Une lumiere rasante fixe, en espace vue : elle vient d'en haut a gauche
  // et effleure la nappe, ce qui souligne chaque crete.
  vec3 light = normalize(vec3(-0.4, 0.8, 0.6));
  float diffuse = max(dot(normal, light), 0.0);
  vec3 halfway = normalize(light + view);
  float specular = pow(max(dot(normal, halfway), 0.0), 48.0) * uShine;
  float fresnel = pow(1.0 - max(dot(normal, view), 0.0), 3.0);

  // Les bosses s eclairent d elles-memes : sans cette lueur, une nappe sombre
  // vue en rasant n est qu un relief gris.
  float glow = pow(lift, 3.0) * 0.35 * uShine;
  colour = colour * (0.45 + 0.65 * diffuse) + uCrest * (specular + fresnel * 0.35 * uShine + glow);

  // Brume : la nappe se fond dans le fond bien avant le bord du plan.
  float distance = length(vViewPosition);
  float fog = smoothstep(3.5, 11.0, distance);
  colour = mix(colour, uDeep, fog);

  gl_FragColor = vec4(colour, 1.0);
}
`
