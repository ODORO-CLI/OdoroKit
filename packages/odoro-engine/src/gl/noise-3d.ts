/**
 * Three-dimensional noise, for 3D scenes.
 *
 * ## Why a version separate from the fullscreen noise
 *
 * The noise of the light backend takes a point of the plane: that is all a
 * fullscreen effect needs. Deforming a sphere calls for something else.
 *
 * One could project the surface onto a plane — latitude and longitude — and
 * sample the planar noise. The result then carries two flaws that no setting
 * corrects: a seam where the longitude closes back on itself, and a squashing
 * at the poles, where a whole band of surface folds onto a point. They are
 * immediately visible on a rotating object.
 *
 * Three-dimensional noise has neither seam nor pole: it is defined everywhere
 * in space, and the surface merely passes through it.
 *
 * ## What it is
 *
 * Value noise on a cubic lattice. One pseudo-random value per vertex, a
 * smoothed interpolation between the eight vertices of the cell, and a sum of
 * octaves at doubled frequencies.
 *
 * Written from first principles, like the rest of the shipped shaders. The
 * hash multiplier is the inverse of pi: an irrational value decorrelates the
 * three coordinates, where a round number would make alignments appear.
 *
 * @module
 */

/**
 * Three-dimensional noise functions, to prefix to a shader.
 *
 * @example
 * const vertex = `${NOISE_FUNCTIONS_3D}\n${MY_VERTEX}`
 */
export const NOISE_FUNCTIONS_3D = /* glsl */ `
float odoroHash3(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float odoroNoise3(vec3 p) {
  vec3 cell = floor(p);
  vec3 local = fract(p);

  // Smoothed interpolation: the derivative vanishes at the vertices, which
  // removes the visible edges of the lattice. A linear interpolation would
  // leave them.
  vec3 weight = local * local * (3.0 - 2.0 * local);

  float c000 = odoroHash3(cell + vec3(0.0, 0.0, 0.0));
  float c100 = odoroHash3(cell + vec3(1.0, 0.0, 0.0));
  float c010 = odoroHash3(cell + vec3(0.0, 1.0, 0.0));
  float c110 = odoroHash3(cell + vec3(1.0, 1.0, 0.0));
  float c001 = odoroHash3(cell + vec3(0.0, 0.0, 1.0));
  float c101 = odoroHash3(cell + vec3(1.0, 0.0, 1.0));
  float c011 = odoroHash3(cell + vec3(0.0, 1.0, 1.0));
  float c111 = odoroHash3(cell + vec3(1.0, 1.0, 1.0));

  return mix(
    mix(mix(c000, c100, weight.x), mix(c010, c110, weight.x), weight.y),
    mix(mix(c001, c101, weight.x), mix(c011, c111, weight.x), weight.y),
    weight.z
  );
}

float odoroFbm3(vec3 p, int octaves) {
  float sum = 0.0;
  float amplitude = 0.5;
  vec3 point = p;

  // The loop bound is constant, and the exit is done by break: the first level
  // of GLSL does not accept a condition that depends on a uniform, and a shader
  // that does not compile for half the visitors is not a shader.
  for (int i = 0; i < 8; i += 1) {
    if (i >= octaves) break;
    sum += amplitude * odoroNoise3(point);
    // A factor slightly greater than two keeps the octaves from realigning on
    // the same lattice, which would produce a repetitive pattern.
    point *= 2.03;
    amplitude *= 0.5;
  }

  return sum;
}
`
