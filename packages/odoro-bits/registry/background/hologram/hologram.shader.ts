/**
 * Hologram shaders.
 *
 * ## Why a program of its own
 *
 * An ordinary line material has a colour and an opacity, and nothing else.
 * Yet a hologram is recognised by three things the geometry does not carry:
 * its back face fades out, a scan band travels up through it, and fine
 * stripes cross it at all times. All three are functions of the height and
 * of the orientation of the point — two values only the vertex knows —
 * hence a vertex program that passes them on, and a fragment program that
 * combines them.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds.
 * - `uLine` — the hue of the lines.
 * - `uScan` — the hue of the scan band.
 * - `uScanPos` — height of the band, in scene units.
 * - `uFlick` — luminance of the current step, between zero and one.
 * - `uOpacity` — base opacity of the lines.
 */
export const HOLOGRAM_VERTEX = /* glsl */ `
varying float vHeight;
varying float vFacing;

void main() {
  vHeight = position.y;

  // The orientation relative to the camera: the normal of a sphere is
  // its position, and the back face fades out from it.
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vec3 n = normalize((modelViewMatrix * vec4(normalize(position), 0.0)).xyz);
  vFacing = dot(n, normalize(-mv.xyz));

  gl_Position = projectionMatrix * mv;
}
`

export const HOLOGRAM_FRAGMENT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform vec3 uLine;
uniform vec3 uScan;
uniform float uScanPos;
uniform float uFlick;
uniform float uOpacity;

varying float vHeight;
varying float vFacing;

void main() {
  // The back face stays visible but set back: culled, the sphere would be
  // a disc; at parity, it would be a ball packed full of lines.
  float depth = mix(0.22, 1.0, smoothstep(-0.8, 0.8, vFacing));

  // The scan band: a gaussian of the height around its position.
  float d = vHeight - uScanPos;
  float band = exp(-d * d * 40.0);

  // The stripes: a fine sine of the height drifting slowly down.
  float stripes = 0.7 + 0.3 * sin(vHeight * 70.0 + uTime * 5.0);

  vec3 colour = mix(uLine, uScan, band);
  float alpha = uOpacity * depth * stripes * uFlick * (0.6 + band * 1.4);
  if (alpha < 0.002) discard;

  gl_FragColor = vec4(colour, clamp(alpha, 0.0, 1.0));
}
`
