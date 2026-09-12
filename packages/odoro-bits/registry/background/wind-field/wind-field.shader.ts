/**
 * Shader du champ de vent.
 *
 * ## L'idee mathematique
 *
 * Une grille de cellules, et dans chacune un trait court : sa direction est
 * celle du vent en ce point, sa longueur la force du vent. Le vent est un
 * cap dominant devie par un bruit lent, et sa force un second bruit que des
 * rafales traversent — des bandes qui balaient le cadre dans le sens du cap.
 * C'est le releve d'une station meteo, trait par trait, mis en mouvement.
 *
 * Un trait long deborde de sa cellule ; chaque fragment evalue donc les neuf
 * cellules qui l'entourent, a bornes constantes, pour qu'aucun trait ne soit
 * rogne au bord de la sienne. Le trait est une capsule effilee : plus fine a
 * l'arriere, plus large a l'avant, ce qui donne le sens sans fleche.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — les traits au calme.
 * - `uColorC` — les traits dans la rafale.
 * - `uCells` — nombre de cellules par hauteur de cadre.
 * - `uScale` — frequence du bruit, donc la taille des tourbillons.
 * - `uSpeed` — vitesse d'evolution du vent et de passage des rafales.
 * - `uGusts` — force des rafales.
 */
export const WIND_FIELD_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uScale;
uniform float uSpeed;
uniform float uGusts;

float ventHash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float ventNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);
  float a = ventHash(cell);
  float b = ventHash(cell + vec2(1.0, 0.0));
  float c = ventHash(cell + vec2(0.0, 1.0));
  float d = ventHash(cell + vec2(1.0, 1.0));
  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// Distance a une capsule effilee entre a et b : le rayon croit de l'arriere
// vers l'avant.
float ventCapsule(vec2 p, vec2 a, vec2 b, float arriere, float avant) {
  vec2 ab = b - a;
  float h = clamp(dot(p - a, ab) / max(dot(ab, ab), 0.000001), 0.0, 1.0);
  return length(p - a - ab * h) - mix(arriere, avant, h);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  float pixel = 1.0 / max(uResolution.y, 1.0);

  float cells = max(uCells, 4.0);
  float taille = 1.0 / cells;
  vec2 base = floor(p * cells);
  float t = uTime * uSpeed;

  // Le cap dominant tourne tres lentement : le vent ne vient jamais tout a
  // fait du meme cote.
  float cap = 0.3 + sin(t * 0.07) * 0.5;
  vec2 sens = vec2(cos(cap), sin(cap));

  float trait = 0.0;
  float force = 0.0;

  for (int dx = -1; dx <= 1; dx += 1) {
    for (int dy = -1; dy <= 1; dy += 1) {
      vec2 cell = base + vec2(float(dx), float(dy));
      vec2 centre = (cell + 0.5) * taille;

      // La direction : le cap, devie par un bruit lent lu au centre de la
      // cellule. La force : un second bruit, plus la rafale qui passe.
      float deviation = (ventNoise(centre * uScale + vec2(t * 0.12, -t * 0.08)) - 0.5) * 3.0;
      vec2 direction = vec2(cos(cap + deviation), sin(cap + deviation));

      float souffle = ventNoise(centre * uScale * 0.6 + vec2(-t * 0.1, t * 0.06) + 40.0);
      // La rafale : une bande qui avance dans le sens du cap, a laquelle un
      // bruit donne des bords dechiquetes.
      float along = dot(centre, sens) - t * 0.35;
      float rafale = pow(0.5 + 0.5 * sin(along * 3.5 + ventNoise(centre * 4.0 + t * 0.3) * 2.0), 6.0) * uGusts;
      float vigueur = clamp(0.25 + souffle * 0.6 + rafale, 0.0, 1.4);

      // Le trait, centre sur la cellule, oriente et proportionne au vent.
      float longueur = taille * (0.25 + vigueur * 0.55);
      vec2 a = centre - direction * longueur * 0.5;
      vec2 b = centre + direction * longueur * 0.5;
      float d = ventCapsule(p, a, b, pixel * 0.5, pixel * (1.0 + vigueur * 0.9));
      float couverture = 1.0 - smoothstep(-pixel * 0.5, pixel * 0.7, d);

      trait = max(trait, couverture);
      force = max(force, couverture * rafale);
    }
  }

  vec3 colour = uColorA;
  colour = mix(colour, uColorB, trait * 0.8);
  // Dans la rafale, les traits changent de teinte : le passage du vent se
  // voit par la couleur autant que par la longueur.
  colour = mix(colour, uColorC, clamp(force * 1.8, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`
