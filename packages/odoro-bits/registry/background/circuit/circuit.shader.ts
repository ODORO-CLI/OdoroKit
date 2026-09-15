/**
 * Printed circuit shader.
 *
 * ## The mathematical idea
 *
 * A circuit is a grid of tiles. Each tile draws its type — a straight
 * stroke, horizontal or vertical, or one of the four elbows — and the
 * stroke is the signed distance to the segment running from the tile's
 * centre to the middle of each of its open edges. No path is built: two
 * neighbouring tiles that open towards each other join up on their own,
 * and two that do not open towards each other leave behind a trace
 * end.
 *
 * Those ends are the pads. An edge is terminal if the tile opens onto it
 * and its neighbour does not, or the reverse; the pad is a ring at the
 * middle of that edge, drawn by both tiles from the same condition — each
 * its own half, seamlessly. That is what makes a circuit and not a maze:
 * the traces end on pads.
 *
 * The pulses run along the tile's axis: an exponential of the fractional
 * part of the coordinate along the trace, shifted by time and by a seed
 * belonging to the row or the column, so that the traces do not pulse in
 * chorus.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the substrate.
 * - `uColorB` — the traces and the pads.
 * - `uColorC` — the pulses.
 * - `uCells` — number of tiles across the height.
 * - `uWidth` — trace thickness, as a fraction of a tile.
 * - `uSpeed` — pulse speed.
 * - `uPulses` — share of the traces lit at any given instant.
 */
export const CIRCUIT_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uCells;
uniform float uWidth;
uniform float uSpeed;
uniform float uPulses;

// Pseudo-random number, stable per tile.
float circuitHash(vec2 cell) {
  return fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
}

// A tile's open edges: left, right, top, bottom. Six types, two straight
// strokes and four elbows.
vec4 circuitOpen(vec2 cell) {
  float kind = floor(circuitHash(cell) * 6.0);
  if (kind < 0.5) return vec4(1.0, 1.0, 0.0, 0.0);
  if (kind < 1.5) return vec4(0.0, 0.0, 1.0, 1.0);
  if (kind < 2.5) return vec4(1.0, 0.0, 1.0, 0.0);
  if (kind < 3.5) return vec4(0.0, 1.0, 0.0, 1.0);
  if (kind < 4.5) return vec4(1.0, 0.0, 0.0, 1.0);
  return vec4(0.0, 1.0, 1.0, 0.0);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float cells = clamp(uCells, 2.0, 40.0);
  vec2 p = vUv * vec2(aspect, 1.0) * cells;

  // One pixel, in tile units.
  float px = cells / max(uResolution.y, 1.0);

  vec2 id = floor(p);
  vec2 f = fract(p) - 0.5;

  vec4 open = circuitOpen(id);

  // The distance to the stroke: the minimum, over the open edges, of the
  // distance to the centre-edge segment. A closed edge is pushed to infinity.
  float far = 10.0;
  float dLeft = mix(far, length(vec2(max(f.x, 0.0), f.y)), open.x);
  float dRight = mix(far, length(vec2(min(f.x, 0.0), f.y)), open.y);
  float dUp = mix(far, length(vec2(f.x, min(f.y, 0.0))), open.z);
  float dDown = mix(far, length(vec2(f.x, max(f.y, 0.0))), open.w);
  float trace = min(min(dLeft, dRight), min(dUp, dDown));

  // The terminal edges: open on one side only.
  float tLeft = abs(open.x - circuitOpen(id - vec2(1.0, 0.0)).y);
  float tRight = abs(open.y - circuitOpen(id + vec2(1.0, 0.0)).x);
  float tUp = abs(open.z - circuitOpen(id + vec2(0.0, 1.0)).w);
  float tDown = abs(open.w - circuitOpen(id - vec2(0.0, 1.0)).z);

  float pad = min(
    min(mix(far, length(f - vec2(-0.5, 0.0)), tLeft), mix(far, length(f - vec2(0.5, 0.0)), tRight)),
    min(mix(far, length(f - vec2(0.0, 0.5)), tUp), mix(far, length(f - vec2(0.0, -0.5)), tDown))
  );

  float width = clamp(uWidth, 0.02, 0.3);
  float line = 1.0 - smoothstep(width * 0.5 - px, width * 0.5 + px, trace);
  float ring = 1.0 - smoothstep(px, px * 2.5, abs(pad - width * 1.6));
  float hole = 1.0 - smoothstep(width * 0.6 - px, width * 0.6 + px, pad);

  // The pulse: along the tile's axis, with one seed per trace.
  float horizontal = max(open.x, open.y);
  float along = mix(p.y, p.x, horizontal);
  float seed = mix(circuitHash(vec2(id.x, 41.0)), circuitHash(vec2(43.0, id.y)), horizontal);
  float carried = step(1.0 - clamp(uPulses, 0.0, 1.0), circuitHash(vec2(seed, floor(uTime * 0.25 + seed))));
  float pulse = exp(-fract(along * 0.2 - uTime * uSpeed * 0.4 + seed) * 7.0) * carried;

  vec3 colour = mix(uColorA, uColorB, max(line, ring) * 0.9);
  colour = mix(colour, uColorA, hole * line);
  colour = mix(colour, uColorC, line * (1.0 - hole) * pulse);

  gl_FragColor = vec4(colour, 1.0);
}
`
