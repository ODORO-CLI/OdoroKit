/**
 * Shader du flux de donnees.
 *
 * ## L'idee mathematique
 *
 * L'ecran est decoupe en couloirs horizontaux. Chaque couloir a son sens,
 * sa vitesse et son depart, tires de son rang ; sa coordonnee le long du
 * couloir est decalee par le temps, et sa partie entiere numerote des cases
 * dont chacune tire la longueur de son segment — ou son absence. Un
 * segment est un rectangle aux bouts arrondis, et sa tete — le bout qui
 * avance — est relevee par une exponentielle de la distance au front.
 *
 * Rien ne se croise, rien ne se suit : les couloirs sont independants, et
 * c'est ce qui lit comme un trafic — des paquets qui passent, pas une
 * vague.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les segments.
 * - `uColorC` — leur tete.
 * - `uLanes` — nombre de couloirs sur la hauteur.
 * - `uSpeed` — vitesse moyenne du defilement.
 * - `uDensity` — nombre de cases par unite de largeur.
 * - `uThickness` — epaisseur des segments, en fraction de couloir.
 */
export const DATA_STREAM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uLanes;
uniform float uSpeed;
uniform float uDensity;
uniform float uThickness;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float streamHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float lanes = clamp(uLanes, 2.0, 80.0);

  // Le couloir : son rang, et la position dans sa hauteur.
  float lane = floor(vUv.y * lanes);
  float across = abs(fract(vUv.y * lanes) - 0.5);

  // Un pixel, en unites de couloir et en unites de case.
  float pxLane = lanes / max(uResolution.y, 1.0);
  float density = max(uDensity, 0.5);
  float pxCase = density / max(uResolution.x, 1.0) * aspect;

  // Le sens, la vitesse et le depart du couloir.
  float seed = streamHash(vec2(lane, 11.0));
  float direction = sign(seed - 0.5);
  float rate = uSpeed * (0.4 + 1.2 * streamHash(vec2(lane, 23.0)));
  float run = vUv.x * aspect * density - direction * uTime * rate + seed * 50.0;

  // La case, et son segment : longueur tiree, ou absence.
  float slot = floor(run);
  float local = fract(run);
  float present = step(0.3, streamHash(vec2(slot, lane)));
  float span = mix(0.15, 0.85, streamHash(vec2(slot * 1.7, lane + 3.0)));

  // Le rectangle : bouts adoucis d'un pixel, hauteur selon l'epaisseur.
  float thickness = clamp(uThickness, 0.1, 0.9) * 0.5;
  float ends = smoothstep(0.0, pxCase * 2.0, local) * smoothstep(0.0, pxCase * 2.0, span - local);
  float body = (1.0 - smoothstep(thickness - pxLane, thickness + pxLane, across)) * step(local, span) * ends * present;

  // La tete : le bout qui avance, releve sur une courte distance.
  float front = mix(local, span - local, step(0.0, direction));
  float head = exp(-front * 10.0);

  // Une luminance inegale d'un segment a l'autre.
  float shade = 0.55 + 0.45 * streamHash(vec2(slot, lane * 2.3));

  vec3 colour = mix(uColorA, uColorB, body * shade);
  colour = mix(colour, uColorC, body * head);

  gl_FragColor = vec4(colour, 1.0);
}
`
