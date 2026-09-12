/**
 * Shader du prisme.
 *
 * ## L'idee mathematique
 *
 * Trois pieces, dans l'ordre ou la lumiere les traverse. Un faisceau entrant :
 * la distance a un segment, avec un coeur gaussien et une aureole. Un prisme :
 * un triangle equilateral par sa distance signee, dont seule l'arete brille.
 * Une dispersion : un eventail d'angles a la sortie, ou la teinte tourne d'un
 * token a l'autre selon la position dans l'eventail — un spectre entre deux
 * couleurs du projet, pas un arc-en-ciel ecrit en dur — et ou un cosinus
 * dessine des raies, comme les raies d'un vrai spectre.
 *
 * L'ouverture de l'eventail respire lentement, et un scintillement glisse
 * le long des rais, pour que la scene ne soit pas une image fixe.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — le debut du spectre.
 * - `uColorC` — la fin du spectre.
 * - `uX`, `uY` — position du prisme, en fraction du cadre.
 * - `uSpread` — ouverture de l'eventail, en radians.
 * - `uBands` — nombre de raies dans le spectre.
 * - `uSpeed` — vitesse de la respiration et du scintillement.
 * - `uDetail` — pieces dessinees : 1 l'eventail seul, 3 tout.
 */
export const PRISM_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uX;
uniform float uY;
uniform float uSpread;
uniform float uBands;
uniform float uSpeed;
uniform float uDetail;

// Distance a un segment.
float prismeSegment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

// Distance signee a un triangle equilateral de demi-cote donne, pointe en
// haut : negative dedans, positive dehors.
float prismeTriangle(vec2 p, float cote) {
  const float k = 1.7320508;
  p.x = abs(p.x) - cote;
  p.y = p.y + cote / k;
  if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) * 0.5;
  p.x -= clamp(p.x, -2.0 * cote, 0.0);
  return -length(p) * sign(p.y);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vec2(vUv.x * aspect, vUv.y);
  vec2 centre = vec2(uX * aspect, uY);
  float t = uTime * uSpeed;
  int pieces = int(clamp(uDetail, 1.0, 3.0));

  float cote = 0.13;
  vec2 entree = centre + vec2(-cote * 0.55, cote * 0.1);
  vec2 sortie = centre + vec2(cote * 0.55, -cote * 0.05);
  vec3 blanc = mix(uColorB, uColorC, 0.5);

  vec3 colour = uColorA;

  // Le faisceau entrant : il vient de la gauche, en descendant un peu.
  if (pieces >= 2) {
    float d = prismeSegment(p, vec2(-1.0, uY + 0.45), entree);
    float coeur = exp(-(d * d) / 0.00004);
    float aureole = exp(-d / 0.035) * 0.35;
    colour = mix(colour, blanc, clamp(aureole + coeur, 0.0, 1.0));
    colour += blanc * coeur * 0.3;
  }

  // Le prisme : l'interieur a peine teinte, l'arete qui brille.
  if (pieces >= 3) {
    float sd = prismeTriangle(p - centre, cote);
    float interieur = 1.0 - smoothstep(-0.004, 0.004, sd);
    float arete = exp(-abs(sd) / 0.004);
    colour = mix(colour, blanc, interieur * 0.08);
    colour = mix(colour, uColorC, arete * 0.6);
  }

  // L'eventail : l'angle depuis la sortie, rapporte a l'ouverture.
  vec2 ecart = p - sortie;
  float rayon = length(ecart);
  float angle = atan(ecart.y, ecart.x);
  float ouverture = max(uSpread, 0.05) * (1.0 + 0.12 * sin(t * 0.7));
  float bas = -0.12 - ouverture * 0.5;
  float frac = (angle - bas) / ouverture;

  float dedans = smoothstep(-0.03, 0.06, frac) * smoothstep(1.03, 0.94, frac);
  float devant = smoothstep(0.0, 0.03, ecart.x);
  float attenuation = exp(-rayon * 1.1);
  float scintillement = 0.85 + 0.15 * sin(rayon * 24.0 - t * 3.0 + frac * 6.0);

  // Le spectre : la teinte tourne d'un token a l'autre ; le cosinus dessine
  // les raies qui le rendent lisible comme un spectre.
  vec3 teinte = mix(uColorB, uColorC, clamp(frac, 0.0, 1.0));
  float raies = 0.6 + 0.4 * cos(frac * uBands * 6.2831853);

  float eventail = dedans * devant * attenuation * raies * scintillement;
  colour = mix(colour, teinte, clamp(eventail, 0.0, 1.0));
  colour += teinte * eventail * 0.2;

  gl_FragColor = vec4(clamp(colour, 0.0, 1.0), 1.0);
}
`
