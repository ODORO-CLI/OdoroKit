/**
 * Shaders of the globe.
 *
 * Three programs sharing two blocks: the light a direction receives, and the
 * position of a direction along the axis of the sweep. Sharing them guarantees
 * that the points, the cage and the panels agree — three copies of the same
 * computation diverge as soon as a single one of them is fixed.
 *
 * ## The defect fixed along the way
 *
 * The original implementation wrote, in the fragment of the cage:
 *
 *     float head = fract(vSeed + uTime * uShimmer)
 *
 * with no semicolon. The program therefore did not compile, and WebGL raises
 * nothing one can see: the cage was simply missing. This is the usual failure
 * mode of a shader — it does not break, it does not paint.
 *
 * @module
 */

/** Number of colour sources. A fourth one saturates the surface. */
export const GLOBE_SOURCES = 3

/**
 * The light a direction receives from the sources, and its nearness to the
 * pointer.
 *
 * Nearness is measured as an **angle** and not as a straight distance: the
 * angle wraps correctly behind the ball, the distance collapses at the poles.
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
    // The spot, plus a ring coming out of it. Without the ring, the sources
    // are three fixed spots that do nothing but move about.
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
 * The axis of the sweep, taken in **world** space.
 *
 * Taken in object space, it would turn with the globe: a ball being pivoted
 * would see its band sweep askew.
 */
const SWEEP_GLSL = /* glsl */ `
uniform float uSweepAxis;

float sweepCoord(vec3 worldDir) {
  return dot(worldDir, vec3(cos(uSweepAxis), sin(uSweepAxis), 0.0));
}
`

/**
 * The intensity of the band at a point of the axis.
 *
 * The head goes beyond plus or minus one at both ends: turned round exactly at
 * the silhouette, it would set off again on a frame where it is still visible,
 * and the sweep would read as a bounce instead of a passage.
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

/** Point vertex: radius, size and colour derived from the direction. */
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

  // Three sines of the direction of the point, at differing rates. Neighbours
  // share most of the argument and therefore drift together: this reads as a
  // shell that breathes, not as points trembling each on its own.
  float w =
    sin(aDir.x * 4.1 + uTime * 1.7) *
    cos(aDir.y * 3.3 - uTime * 1.3) *
    sin(aDir.z * 3.9 + uTime * 0.9 + aSeed * 0.6);

  // The flicker is the reverse: two sines at rates drawn from the seed of the
  // point, so that none of them is in phase with another.
  float rate = 1.4 + aSeed * 4.6;
  float f =
    sin(uTime * rate + aSeed * 61.0) * 0.6 +
    sin(uTime * rate * 1.7 + aSeed * 23.0) * 0.4;
  vFlick = 1.0 - uFlicker * (1.0 - (0.5 + 0.5 * f));

  float r = uRadius * (1.0 + w * uWobble + vLit * 0.03 + vNear * 0.02);
  vec4 mv = modelViewMatrix * vec4(aDir * r, 1.0);

  vec3 n = normalize((modelViewMatrix * vec4(aDir, 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));

  // A diameter in world units converted into pixels of the drawing buffer: the
  // points keep their proportion to the ball whatever the size of the frame or
  // the density of the screen.
  float size = uDotSize
    * (1.0 + vLit * 0.5 + vNear * 0.6)
    * mix(1.0, vFlick, 0.35);
  gl_PointSize = max(size * (uViewHeight * projectionMatrix[1][1]) / (-2.0 * mv.z), 0.0);
  gl_Position = projectionMatrix * mv;
}
`

/** Point fragment: a crisp core, a soft halo. */
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
  // A single falloff gives either a hard point or a blot. The core gives the
  // point its position, the exponential gives it its halo.
  float core = 1.0 - smoothstep(0.0, 0.45, d);
  float halo = exp(-d * d * 2.5);

  // The far side stays visible but held back. Removing it would leave a flat
  // disc of points, with no inside.
  float depth = mix(0.25, 1.0, smoothstep(-0.6, 0.65, vFacing));
  float grain = 0.7 + 0.3 * vSeed;

  vec3 col = uDot * grain + vGlow;
  float a = (core * 0.8 + halo * 0.35) * depth * vFlick * (0.85 + vLit * 0.9 + vNear * 0.8);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`

/** Cage vertex. */
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

/** Cage fragment. */
export const GLOBE_CAGE_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uNet;
uniform vec3 uShimmerColor;
uniform float uNetGlow;
uniform float uShimmer;
uniform float uHoverGlow;
uniform float uEdgeMix;
// Redeclared here: the shared blocks only reach the vertex, and an undeclared
// uniform makes the fragment program fail — which shows up as a missing cage,
// not as an error.
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

  // "edge" style: a head running along each edge, each one with a moment of
  // its own. The semicolon was missing right here in the original.
  float head = fract(vSeed + uTime * uShimmer);
  float run = smoothstep(0.3, 0.0, abs(vEdge - head)) * uEdgeMix;

  // "sweep" style: a band crossing the whole ball.
  float sweep = sweepBand(vSweep, uTime, uShimmer);

  // And a slow twinkle, out of phase with both: it is what keeps the cage
  // alive between two passes.
  float twinkle = 0.5 + 0.5 * sin(vSeed * 43.0 + uTime * uShimmer * 5.0);

  float spark = clamp(run * 1.1 + sweep * 1.2 + twinkle * 0.35, 0.0, 1.0);
  vec3 col = mix(uNet, uShimmerColor, spark) + vGlow * 0.6;

  float a = uNetGlow * depth * (0.4 + run * 1.5 + sweep * 1.9 + twinkle * 0.3);
  a += vNear * uHoverGlow * depth;
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`

/** Panel vertex: the face lights up as one block, from its centre. */
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
  // The centre of the face, and not this vertex: the whole triangle then
  // lights up as one block. Lit per vertex, it gradates, and the cage reads as
  // a smooth ball instead of folded plates.
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

/** Panel fragment. */
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
  // The panels at the back are held very low. At parity, the rear half fills
  // in as well and the globe becomes a solid ball.
  float depth = mix(0.12, 1.0, smoothstep(-0.4, 0.7, vFacing));

  float pulse = (0.5 + 0.5 * sin(vSeed * 31.0 + uTime * uShimmer * 4.0)) * uEdgeMix;
  pulse = clamp(pulse + sweepBand(vSweep, uTime, uShimmer) * 1.2, 0.0, 1.0);

  vec3 col = mix(uNet, uShimmerColor, pulse * 0.7) + vGlow * 0.5;
  // Only the pointer fills the panels: with no pointer, this draw costs
  // nothing visible.
  float a = uFill * depth * vNear * (0.45 + pulse * 0.9);
  if (a < 0.002) discard;
  gl_FragColor = vec4(col * a, a);
}
`
