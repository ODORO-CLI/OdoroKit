/**
 * Shader of the metallic paint.
 *
 * ## The mathematical idea
 *
 * The relief is not stored: it is a value noise read over a domain heavily
 * stretched along the abscissa, which gives streaks — the trace of the brush.
 * The normal follows from it by finite differences, two offset reads, with no
 * texture and no map.
 *
 * The lighting is an ordinary Blinn-Phong, except that the lamp is not in the
 * scene: it sits at the pointer, a little above the plane. Moving the cursor
 * therefore amounts to tilting the plate under a fixed lamp, and the highlight
 * sweeps the streaks in the direction they run.
 *
 * The flakes are a raster of randomly drawn dots, very fine, which light up
 * only where the highlight already carries: a flake is a tiny mirror, it does
 * not shine in the shade.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background, under the paint.
 * - `uColorB` — the metal.
 * - `uColorC` — the highlight and the flakes.
 * - `uPointer` — damped pointer position, in texture coordinates.
 * - `uRelief` — depth of the brushing streaks.
 * - `uSheen` — hardness of the highlight, between zero and one.
 * - `uFlakes` — density of the flakes, between zero and one.
 */
export const METALLIC_PAINT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec2 uPointer;
uniform float uRelief;
uniform float uSheen;
uniform float uFlakes;

float paintHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

// Value noise: smoothed interpolation between the four corners of the cell.
float paintNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 local = fract(p);
  vec2 smoothed = local * local * (3.0 - 2.0 * local);

  float a = paintHash(cell);
  float b = paintHash(cell + vec2(1.0, 0.0));
  float c = paintHash(cell + vec2(0.0, 1.0));
  float d = paintHash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, smoothed.x), mix(c, d, smoothed.x), smoothed.y);
}

// The relief of the brushing: two octaves read over a stretched domain. The
// stretch stays moderate — beyond that, the streaks fall below the pixel and
// read as nothing but a swarming.
float brushed(vec2 p, float drift) {
  vec2 stretched = p * vec2(5.0, 110.0) + vec2(drift, 0.0);
  return paintNoise(stretched) * 0.66 + paintNoise(stretched * 0.37) * 0.34;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  vec2 m = uPointer * vec2(aspect, 1.0);

  // The flow: the domain drifts very slowly, the plate is not frozen.
  float drift = uTime * 0.03;
  float e = 0.0016;

  float h = brushed(p, drift);
  float hx = brushed(p + vec2(e, 0.0), drift);
  float hy = brushed(p + vec2(0.0, e), drift);

  // The normal by finite differences: the slope of the relief, straightened.
  vec3 normal = normalize(vec3((h - hx) * uRelief, (h - hy) * uRelief, 1.0));

  // The lamp sits at the pointer, a little above the plane.
  vec3 light = normalize(vec3(m - p, 0.45));
  vec3 view = vec3(0.0, 0.0, 1.0);
  vec3 bisector = normalize(light + view);

  float diffuse = max(dot(normal, light), 0.0);
  float shine = pow(max(dot(normal, bisector), 0.0), mix(8.0, 55.0, clamp(uSheen, 0.0, 1.0)));

  // The wide halo: it is what says where the lamp is. The streaks alone would
  // not say it — they send back a little light everywhere.
  vec2 spread = (p - m) * vec2(0.7, 1.4);
  float halo = 1.0 - smoothstep(0.05, 0.75, length(spread));

  // The flakes: a coarse raster, lit only where the halo already carries. A
  // flake is a tiny mirror, not a lamp.
  vec2 grain = floor(p * 170.0);
  float flake = step(1.0 - 0.10 * clamp(uFlakes, 0.0, 1.0), paintHash(grain));

  // The metal stays close to the background: a plate covering the frame in a
  // mid grey makes everything laid over it illegible.
  vec3 colour = mix(uColorA, uColorB, 0.12 + 0.26 * diffuse + 0.30 * halo);
  colour += uColorC * (shine * halo * 0.7 + flake * halo * 0.9 + halo * halo * 0.20);

  gl_FragColor = vec4(colour, 1.0);
}
`
