/**
 * Data stream shader.
 *
 * ## The mathematical idea
 *
 * The screen is cut into horizontal lanes. Each lane has its direction, its
 * speed and its start, drawn from its rank; its coordinate along the lane
 * is shifted by time, and the integer part numbers slots, each of which
 * draws the length of its segment — or its absence. A segment is a
 * rectangle with rounded ends, and its head — the leading end — is raised
 * by an exponential of the distance to the front.
 *
 * Nothing crosses, nothing follows: the lanes are independent, and that is
 * what reads as traffic — packets going past, not a
 * wave.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the background.
 * - `uColorB` — the segments.
 * - `uColorC` — their head.
 * - `uLanes` — number of lanes across the height.
 * - `uSpeed` — average scrolling speed.
 * - `uDensity` — number of slots per unit of width.
 * - `uThickness` — thickness of the segments, as a fraction of a lane.
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

// Pseudo-random number: projection onto an arbitrary direction, amplified
// sine, fractional part.
float streamHash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  float lanes = clamp(uLanes, 2.0, 80.0);

  // The lane: its rank, and the position across its height.
  float lane = floor(vUv.y * lanes);
  float across = abs(fract(vUv.y * lanes) - 0.5);

  // One pixel, in lane units and in slot units.
  float pxLane = lanes / max(uResolution.y, 1.0);
  float density = max(uDensity, 0.5);
  float pxCase = density / max(uResolution.x, 1.0) * aspect;

  // The lane's direction, speed and start.
  float seed = streamHash(vec2(lane, 11.0));
  float direction = sign(seed - 0.5);
  float rate = uSpeed * (0.4 + 1.2 * streamHash(vec2(lane, 23.0)));
  float run = vUv.x * aspect * density - direction * uTime * rate + seed * 50.0;

  // The slot, and its segment: a drawn length, or an absence.
  float slot = floor(run);
  float local = fract(run);
  float present = step(0.3, streamHash(vec2(slot, lane)));
  float span = mix(0.15, 0.85, streamHash(vec2(slot * 1.7, lane + 3.0)));

  // The rectangle: ends softened by one pixel, height from the thickness.
  float thickness = clamp(uThickness, 0.1, 0.9) * 0.5;
  float ends = smoothstep(0.0, pxCase * 2.0, local) * smoothstep(0.0, pxCase * 2.0, span - local);
  float body = (1.0 - smoothstep(thickness - pxLane, thickness + pxLane, across)) * step(local, span) * ends * present;

  // The head: the leading end, raised over a short distance.
  float front = mix(local, span - local, step(0.0, direction));
  float head = exp(-front * 10.0);

  // An uneven luminance from one segment to the next.
  float shade = 0.55 + 0.45 * streamHash(vec2(slot, lane * 2.3));

  vec3 colour = mix(uColorA, uColorB, body * shade);
  colour = mix(colour, uColorC, body * head);

  gl_FragColor = vec4(colour, 1.0);
}
`
