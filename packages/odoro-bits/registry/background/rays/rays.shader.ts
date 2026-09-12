/**
 * Shader des rayons.
 *
 * ## L'idee mathematique
 *
 * Des rayons crepusculaires radiaux : l'intensite est un bruit 1D de l'angle
 * autour d'un point reglable — ici trois sinus de frequences entieres non
 * multiples, donc periodiques sur le tour complet et sans couture a l'angle
 * zero. Une puissance resserre ou adoucit les rais, une exponentielle de la
 * distance les eteint en s'eloignant du point, et des phases lentes font le
 * scintillement.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la teinte des rayons.
 * - `uColorC` — la teinte du foyer.
 * - `uX`, `uY` — position du point d'emission, en fraction du cadre.
 * - `uCount` — nombre de rayons sur le tour.
 * - `uSoftness` — douceur des rais ; bas, ils sont fins et durs.
 * - `uDetail` — nombre d'harmoniques du bruit angulaire, et donc son cout.
 */
export const RAYS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uCount;
uniform float uSoftness;
uniform float uDetail;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 foyer = vec2(uX * aspect, uY);

  vec2 ecart = p - foyer;
  float rayon = length(ecart);
  float angle = atan(ecart.y, ecart.x);
  float t = uTime;

  // Les frequences sont des entiers deduits du nombre de rayons : une
  // frequence non entiere laisserait une couture visible a l'angle zero, la
  // ou le tour se referme.
  float f1 = max(floor(uCount), 2.0);
  float f2 = floor(f1 * 1.7) + 1.0;
  float f3 = floor(f1 * 2.6) + 2.0;
  int harmoniques = int(clamp(uDetail, 1.0, 3.0));

  // Trois sinus de frequences non multiples : un bruit 1D periodique de
  // l'angle, qui ne se remet jamais en phase. Les phases derivent lentement,
  // chacune a sa vitesse : c'est le scintillement.
  float faisceau = 0.5 + 0.5 * sin(angle * f1 + t * 0.21);
  if (harmoniques >= 2) {
    faisceau = faisceau * 0.65 + (0.5 + 0.5 * sin(angle * f2 - t * 0.17)) * 0.35;
  }
  if (harmoniques >= 3) {
    faisceau = faisceau * 0.75 + (0.5 + 0.5 * sin(angle * f3 + t * 0.13)) * 0.25;
  }

  // La puissance sculpte le profil : exposant haut, rais fins sur fond noir ;
  // exposant bas, voile continu. C'est le reglage de douceur.
  float profil = pow(faisceau, mix(7.0, 1.6, clamp(uSoftness, 0.0, 1.0)));

  // L'exponentielle de la distance eteint les rais loin du foyer : la lumiere
  // ne decroit pas lineairement, et l'oeil le sait.
  float attenuation = exp(-rayon * 1.6);

  vec3 colour = uColorA
    + uColorB * profil * attenuation
    + uColorC * exp(-rayon * rayon * 9.0) * (0.5 + 0.3 * profil);

  gl_FragColor = vec4(colour, 1.0);
}
`
