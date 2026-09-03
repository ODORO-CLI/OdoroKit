/**
 * Shaders du globe.
 *
 * Trois programmes qui partagent deux blocs : la lumiere recue d'une direction,
 * et la position d'une direction le long de l'axe du balayage. Les partager
 * garantit que les points, la cage et les panneaux s'accordent — trois copies
 * du meme calcul divergent des qu'on en corrige une seule.
 *
 * ## Le defaut corrige au passage
 *
 * L'implementation d'origine ecrivait, dans le fragment de la cage :
 *
 *     float head = fract(vSeed + uTime * uShimmer)
 *
 * sans point-virgule. Le programme ne compilait donc pas, et WebGL ne leve rien
 * qu'on voie : la cage etait simplement absente. C'est le mode de defaillance
 * habituel d'un shader — il ne casse pas, il ne peint pas.
 *
 * @module
 */

/** Nombre de sources de couleur. Une quatrieme sature la surface. */
export const GLOBE_SOURCES = 3

/**
 * La lumiere qu'une direction recoit des sources, et sa proximite au pointeur.
 *
 * La proximite se mesure en **angle** et non en distance droite : l'angle
 * s'enroule correctement derriere la boule, la distance s'effondre aux poles.
 */
const SOURCE_GLSL = /* glsl */ `
#define SOURCES ${String(GLOBE_SOURCES)}
uniform vec3 uSource[SOURCES];
uniform vec3 uSourceColor[SOURCES];
uniform float uSpread;
uniform float uIntensity;
uniform float uWave;
uniform float uTime;
uniform vec3 uHoverDir;
uniform float uHover;
uniform float uHoverArc;

vec3 sourceLight(vec3 dir) {
  vec3 lit = vec3(0.0);
  for (int i = 0; i < SOURCES; i++) {
    float ang = acos(clamp(dot(dir, uSource[i]), -1.0, 1.0));
    float reach = smoothstep(uSpread, 0.0, ang);
    // La tache, plus un anneau qui en sort. Sans l'anneau, les sources sont
    // trois taches fixes qui se contentent de se deplacer.
    float ripple = 0.5 + 0.5 * sin(ang * 9.0 - uTime * uWave * 3.0);
    lit += uSourceColor[i] * reach * (0.55 + ripple * 0.75);
  }
  return lit * uIntensity;
}

float hoverNear(vec3 dir) {
  float ang = acos(clamp(dot(dir, uHoverDir), -1.0, 1.0));
  return smoothstep(uHoverArc, 0.0, ang) * uHover;
}
`

/**
 * L'axe du balayage, pris en espace **monde**.
 *
 * Pris en espace objet, il tournerait avec le globe : une boule qu'on fait
 * pivoter verrait sa bande balayer de travers.
 */
const SWEEP_GLSL = /* glsl */ `
uniform float uSweepAxis;

float sweepCoord(vec3 worldDir) {
  return dot(worldDir, vec3(cos(uSweepAxis), sin(uSweepAxis), 0.0));
}
`

/**
 * L'intensite de la bande en un point de l'axe.
 *
 * La tete va au-dela de plus ou moins un aux deux bouts : retournee exactement
 * a la silhouette, elle repartirait sur une image ou elle est encore visible,
 * et le balayage se lirait comme un rebond au lieu d'un passage.
 */
const BAND_GLSL = /* glsl */ `
uniform float uSweepWidth;
uniform float uSweepMix;

float sweepBand(float coord, float time, float rate) {
  float head = mix(1.3, -1.3, fract(time * rate * 0.5));
  float d = coord - head;
  return exp(-(d * d) / (uSweepWidth * uSweepWidth)) * uSweepMix;
}
`

/** Sommet des points : rayon, taille et couleur derives de la direction. */
export const GLOBE_POINT_VERTEX = /* glsl */ `
attribute vec3 aDir;
attribute float aSeed;

uniform float uRadius;
uniform float uDotSize;
uniform float uWobble;
uniform float uFlicker;
uniform float uViewHeight;

varying float vFacing;
varying float vLit;
varying vec3 vGlow;
varying float vSeed;
varying float vNear;
varying float vFlick;

${SOURCE_GLSL}

void main() {
  vec3 glow = sourceLight(aDir);
  vGlow = glow;
  vLit = min(1.0, max(max(glow.r, glow.g), glow.b));
  vSeed = aSeed;
  vNear = hoverNear(aDir);

  // Trois sinus de la direction du point, a des rythmes differents. Les
  // voisins partagent l'essentiel de l'argument et derivent donc ensemble :
  // cela se lit comme une coque qui respire, non comme des points qui
  // tremblent chacun pour soi.
  float w =
    sin(aDir.x * 4.1 + uTime * 1.7) *
    cos(aDir.y * 3.3 - uTime * 1.3) *
    sin(aDir.z * 3.9 + uTime * 0.9 + aSeed * 0.6);

  // Le scintillement est l'inverse : deux sinus a des rythmes tires de la
  // graine du point, si bien qu'aucun n'est en phase avec un autre.
  float rate = 1.4 + aSeed * 4.6;
  float f =
    sin(uTime * rate + aSeed * 61.0) * 0.6 +
    sin(uTime * rate * 1.7 + aSeed * 23.0) * 0.4;
  vFlick = 1.0 - uFlicker * (1.0 - (0.5 + 0.5 * f));

  float r = uRadius * (1.0 + w * uWobble + vLit * 0.03 + vNear * 0.02);
  vec4 mv = modelViewMatrix * vec4(aDir * r, 1.0);

  vec3 n = normalize((modelViewMatrix * vec4(aDir, 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));

  // Un diametre en unites monde converti en pixels du tampon de dessin : les
  // points gardent leur proportion a la boule quelle que soit la taille du
  // cadre ou la densite de l'ecran.
  float size = uDotSize
    * (1.0 + vLit * 0.5 + vNear * 0.6)
    * mix(1.0, vFlick, 0.35);
  gl_PointSize = max(size * (uViewHeight * projectionMatrix[1][1]) / (-2.0 * mv.z), 0.0);
  gl_Position = projectionMatrix * mv;
}
`

/** Fragment des points : un coeur net, un halo doux. */
export const GLOBE_POINT_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uDot;

varying float vFacing;
varying float vLit;
varying vec3 vGlow;
varying float vSeed;
varying float vNear;
varying float vFlick;

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  // Une seule attenuation donne soit un point dur, soit une tache. Le coeur
  // donne sa position au point, l'exponentielle lui donne son halo.
  float core = 1.0 - smoothstep(0.0, 0.45, d);
  float halo = exp(-d * d * 2.5);

  // La face opposee reste visible mais en retrait. La supprimer laisserait un
  // disque plat de points, sans interieur.
  float depth = mix(0.25, 1.0, smoothstep(-0.6, 0.65, vFacing));
  float grain = 0.7 + 0.3 * vSeed;

  vec3 col = uDot * grain + vGlow;
  float a = (core * 0.8 + halo * 0.35) * depth * vFlick * (0.85 + vLit * 0.9 + vNear * 0.8);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`

/** Sommet de la cage. */
export const GLOBE_CAGE_VERTEX = /* glsl */ `
attribute float aEdge;
attribute float aSeed;

varying float vFacing;
varying float vEdge;
varying float vSeed;
varying vec3 vGlow;
varying float vNear;
varying float vSweep;

${SOURCE_GLSL}
${SWEEP_GLSL}

void main() {
  vec3 dir = normalize(position);
  vEdge = aEdge;
  vSeed = aSeed;
  vGlow = sourceLight(dir);
  vNear = hoverNear(dir);
  vSweep = sweepCoord(normalize((modelMatrix * vec4(position, 1.0)).xyz));

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize((modelViewMatrix * vec4(dir, 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));
  gl_Position = projectionMatrix * mv;
}
`

/** Fragment de la cage. */
export const GLOBE_CAGE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uNet;
uniform vec3 uShimmerColor;
uniform float uNetGlow;
uniform float uShimmer;
uniform float uHoverGlow;
uniform float uEdgeMix;
// Redeclare ici : les blocs partages n'atteignent que le sommet, et un uniform
// non declare fait echouer le programme de fragment — ce qui se voit comme une
// cage absente, pas comme une erreur.
uniform float uTime;

varying float vFacing;
varying float vEdge;
varying float vSeed;
varying vec3 vGlow;
varying float vNear;
varying float vSweep;

${BAND_GLSL}

void main() {
  float depth = mix(0.32, 1.0, smoothstep(-0.9, 0.8, vFacing));

  // Style « arete » : une tete qui court le long de chaque arete, chacune a
  // son propre moment. Le point-virgule manquait ici dans l'original.
  float head = fract(vSeed + uTime * uShimmer);
  float run = smoothstep(0.3, 0.0, abs(vEdge - head)) * uEdgeMix;

  // Style « balayage » : une bande qui traverse toute la boule.
  float sweep = sweepBand(vSweep, uTime, uShimmer);

  // Et un scintillement lent, hors phase des deux : c'est lui qui garde la
  // cage vivante entre deux passages.
  float twinkle = 0.5 + 0.5 * sin(vSeed * 43.0 + uTime * uShimmer * 5.0);

  float spark = clamp(run * 1.1 + sweep * 1.2 + twinkle * 0.35, 0.0, 1.0);
  vec3 col = mix(uNet, uShimmerColor, spark) + vGlow * 0.6;

  float a = uNetGlow * depth * (0.4 + run * 1.5 + sweep * 1.9 + twinkle * 0.3);
  a += vNear * uHoverGlow * depth;
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`

/** Sommet des panneaux : la face s'allume d'un bloc, depuis son centre. */
export const GLOBE_PANEL_VERTEX = /* glsl */ `
attribute vec3 aFace;
attribute float aSeed;

varying float vFacing;
varying float vSeed;
varying float vNear;
varying vec3 vGlow;
varying float vSweep;

${SOURCE_GLSL}
${SWEEP_GLSL}

void main() {
  // Le centre de la face, et non ce sommet : le triangle entier s'allume alors
  // d'un bloc. Eclaire par sommet, il degrade, et la cage se lit comme une
  // boule lisse au lieu de plaques pliees.
  vec3 dir = normalize(aFace);
  vSeed = aSeed;
  vNear = hoverNear(dir);
  vGlow = sourceLight(dir);
  vSweep = sweepCoord(normalize((modelMatrix * vec4(aFace, 0.0)).xyz));

  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize((modelViewMatrix * vec4(dir, 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));
  gl_Position = projectionMatrix * mv;
}
`

/** Fragment des panneaux. */
export const GLOBE_PANEL_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uNet;
uniform vec3 uShimmerColor;
uniform float uFill;
uniform float uShimmer;
uniform float uEdgeMix;
uniform float uTime;

varying float vFacing;
varying float vSeed;
varying float vNear;
varying vec3 vGlow;
varying float vSweep;

${BAND_GLSL}

void main() {
  // Les panneaux de dos sont tenus tres bas. A egalite, la moitie arriere se
  // remplit aussi et le globe devient une boule pleine.
  float depth = mix(0.12, 1.0, smoothstep(-0.4, 0.7, vFacing));

  float pulse = (0.5 + 0.5 * sin(vSeed * 31.0 + uTime * uShimmer * 4.0)) * uEdgeMix;
  pulse = clamp(pulse + sweepBand(vSweep, uTime, uShimmer) * 1.2, 0.0, 1.0);

  vec3 col = mix(uNet, uShimmerColor, pulse * 0.7) + vGlow * 0.5;
  // Seul le pointeur remplit les panneaux : pointeur absent, ce dessin ne
  // coute rien de visible.
  float a = uFill * depth * vNear * (0.45 + pulse * 0.9);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`
