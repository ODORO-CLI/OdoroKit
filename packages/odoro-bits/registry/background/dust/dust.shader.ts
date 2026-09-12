/**
 * Shader de la poussiere.
 *
 * ## L'idee mathematique
 *
 * Deux choses : un rai et des grains. Le rai est une bande douce autour d'une
 * droite oblique passant par le centre, mesuree en distance signee a cette
 * droite ; il s'evase en s'eloignant de sa source et perd de sa force, comme
 * un faisceau qui entre par une fenetre. Un bruit de valeur lent le module,
 * pour qu'il ait la texture de l'air plutot que celle d'un aplat.
 *
 * Les grains sont haches par cellule sur trois couches, et derivent sur une
 * somme de sinus de frequences non multiples — une marche brownienne
 * approchee, sans etat a conserver. Ce qui fait la poussiere, c'est que les
 * grains ne se voient que dans le rai : leur lumiere est multipliee par
 * l'intensite du faisceau a leur position — celle du grain, pas celle du
 * fragment, pour qu'un grain entre dans la lumiere d'un bloc.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — l'ombre de la piece.
 * - `uColorB` — la teinte du rai.
 * - `uColorC` — les grains dans la lumiere.
 * - `uSpeed` — vitesse de la derive des grains.
 * - `uDensity` — nombre de cellules sur la hauteur, pour la couche proche.
 * - `uAngle` — inclinaison du rai, en degres.
 * - `uWidth` — demi-largeur du rai, en hauteurs de cadre.
 * - `uLayers` — nombre de couches evaluees, et donc le cout.
 */
export const DUST_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uDensity;
uniform float uAngle;
uniform float uWidth;
uniform float uLayers;

// Nombre pseudo-aleatoire : projection sur une direction arbitraire, sinus
// amplifie, partie fractionnaire.
float poussiereHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Deux nombres decorreles pour une meme cellule.
vec2 poussiereHash2(vec2 p) {
  return vec2(poussiereHash(p), poussiereHash(p + vec2(37.3, 17.7)));
}

// Bruit de valeur : interpolation lissee entre les quatre coins de la cellule.
float poussiereNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = poussiereHash(cell);
  float b = poussiereHash(cell + vec2(1.0, 0.0));
  float c = poussiereHash(cell + vec2(0.0, 1.0));
  float d = poussiereHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Intensite du rai en un point, en coordonnees centrees.
float rai(vec2 c, vec2 dir, vec2 nrm) {
  float across = dot(c, nrm);
  float along = dot(c, dir);

  // Le faisceau s'evase en s'eloignant de sa source, et s'affaiblit.
  float largeur = max(uWidth, 0.02) * (0.7 + 0.5 * smoothstep(-1.0, 1.0, along));
  float bande = 1.0 - smoothstep(largeur * 0.3, largeur, abs(across));
  float force = 0.55 + 0.45 * smoothstep(1.0, -0.6, along);

  return bande * force;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 uv = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(aspect, 1.0) * 0.5;
  float t = uTime * uSpeed;
  int layers = int(clamp(uLayers, 1.0, 3.0));

  float rad = radians(uAngle);
  vec2 dir = vec2(cos(rad), sin(rad));
  vec2 nrm = vec2(-dir.y, dir.x);

  // Le voile du rai : sa texture est un bruit lent, l'air qui bouge dedans.
  float voile = rai(uv - centre, dir, nrm);
  float air = 0.7 + 0.3 * poussiereNoise(uv * 3.0 + vec2(t * 0.06, -t * 0.03));
  vec3 colour = uColorA + uColorB * voile * air * 0.35;

  for (int layer = 0; layer < 3; layer += 1) {
    if (layer >= layers) break;
    float depth = float(layer);
    float scale = max(uDensity, 2.0) * (1.0 + depth * 0.6);

    // Les grains tombent a peine : l'air les porte plus qu'il ne les lache.
    vec2 drift = vec2(t * 0.015, t * 0.03) * (1.0 - depth * 0.25);
    vec2 p = uv * scale + drift;
    vec2 cell = floor(p);

    for (int dx = -1; dx <= 1; dx += 1) {
      for (int dy = -1; dy <= 1; dy += 1) {
        vec2 voisine = cell + vec2(float(dx), float(dy));
        vec2 graine = poussiereHash2(voisine + depth * 59.0);
        float exists = step(0.3, poussiereHash(voisine + 9.0 + depth));

        // Marche brownienne approchee : deux sinus par axe, frequences non
        // multiples, phases hachees.
        vec2 errance = 0.35 * vec2(
          sin(t * 0.31 + graine.x * 6.28318) + 0.5 * sin(t * 0.83 + graine.y * 4.0),
          cos(t * 0.27 + graine.y * 6.28318) + 0.5 * cos(t * 0.71 + graine.x * 5.0)
        );
        vec2 centreP = voisine + 0.5 + errance;

        // Le grain n'est visible que dans la lumiere : le rai est lu a sa
        // position, pas a celle du fragment.
        vec2 monde = (centreP - drift) / scale;
        float lumiere = mix(0.06, 1.0, rai(monde - centre, dir, nrm));

        float d = length(p - centreP);
        float size = (0.03 + 0.04 * graine.x) * (1.0 - depth * 0.3);
        float halo = exp(-d * d / (size * size));

        colour += uColorC * halo * lumiere * exists * (0.9 - depth * 0.3);
      }
    }
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
