/**
 * Shader du radar.
 *
 * ## L'idee mathematique
 *
 * Un balayage : la difference entre l'angle du pixel et l'angle du temps,
 * repliee modulo 2pi, donne l'age du dernier passage — une exponentielle de
 * cet age fait la trainee qui suit le faisceau. Les anneaux de graduation sont
 * la partie fractionnaire du rayon, seuillee. Les echos s'allument quand le
 * faisceau passe sur leur angle et decroissent avec le meme age.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond de l'ecran.
 * - `uColorB` — la teinte des graduations et de la trainee.
 * - `uColorC` — la teinte du faisceau et des echos.
 * - `uSpeed` — vitesse de rotation du balayage.
 * - `uRings` — nombre d'anneaux de graduation.
 * - `uFade` — persistance de la trainee et des echos.
 * - `uEchos` — nombre d'echos allumes au passage.
 */
export const RADAR_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uRings;
uniform float uFade;
uniform float uEchos;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float radarHash(float p) {
  return fract(sin(p * 127.1) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 q = (vUv - 0.5) * vec2(aspect, 1.0) * 2.1;
  float rayon = length(q);
  float angle = atan(q.y, q.x);
  float t = uTime * uSpeed;

  // L'age du dernier passage : la difference d'angle au temps, repliee sur le
  // tour. Zero pile sous le faisceau, presque 2pi juste devant lui.
  float age = mod(t * 2.0 - angle, 6.28318);

  float persistance = max(uFade, 0.05);
  float trainee = exp(-age / persistance);
  float faisceau = smoothstep(0.12, 0.0, age);

  // Graduations : la partie fractionnaire du rayon, seuillee pres de ses deux
  // bords — une soustraction remplace n cercles dessines.
  float division = fract(rayon * max(uRings, 1.0));
  float ligne = smoothstep(0.045, 0.0, min(division, 1.0 - division)) * 0.35;

  // La lunette : tout s'eteint au-dela du cadran, en douceur.
  float cadran = 1.0 - smoothstep(0.92, 1.0, rayon);

  vec3 colour = uColorA + uColorB * (trainee * 0.4 + ligne) * cadran;

  // Les echos : chacun a un angle et un rayon haches, s'allume quand le
  // faisceau passe sur son angle, et decroit avec le meme age que la trainee.
  int nombre = int(clamp(uEchos, 0.0, 3.0));
  for (int i = 0; i < 3; i += 1) {
    if (i >= nombre) break;

    float graine = float(i) * 7.0 + 3.0;
    float echoAngle = radarHash(graine) * 6.28318;
    float echoRayon = 0.25 + 0.6 * radarHash(graine + 11.0);
    vec2 position = echoRayon * vec2(cos(echoAngle), sin(echoAngle));

    float echoAge = mod(t * 2.0 - echoAngle, 6.28318);
    float eclat = exp(-echoAge / (persistance * 0.6));

    vec2 ecart = q - position;
    float tache = exp(-dot(ecart, ecart) / 0.002);
    colour += uColorC * tache * eclat * cadran;
  }

  colour += uColorC * faisceau * trainee * cadran * 0.9;

  gl_FragColor = vec4(colour, 1.0);
}
`
