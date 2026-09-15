/**
 * Crystal shaders: flat facets and a feigned refraction.
 *
 * ## The idea
 *
 * A real crystal refracts what lies behind it. Here there is nothing behind
 * — no environment, no texture — and that is deliberate: an environment has
 * to be downloaded, prepared, and it weighs. Instead, the refracted
 * direction serves as an index into a vertical gradient between two hues: a
 * facet that bends the gaze upwards takes one, downwards the other. Since
 * every facet is flat, every facet has its own colour, and the crystal
 * reads through its edges.
 *
 * The dispersion is feigned the same way: three refractive indices, one per
 * channel, and the colours part into a rim along the edges.
 *
 * ## Two passes
 *
 * The back faces are drawn first, darker, then the front faces over the top:
 * that is the crystal's depth, what one sees of itself through itself. The
 * fragment receives `uBack` so as to know which of the two it is drawing,
 * because the back faces are flipped by the renderer and believe themselves
 * to be facing forwards.
 *
 * @module
 */

/** Vertex shader: facet normal and position in view space. */
export const CRYSTAL_VERTEX = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  vViewPosition = viewPosition.xyz;
  gl_Position = projectionMatrix * viewPosition;
}
`

/** Fragment shader: feigned refraction, dispersion, fresnel, two highlights. */
export const CRYSTAL_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uDispersion;
uniform float uBack;

varying vec3 vNormal;
varying vec3 vViewPosition;

// The gradient the refraction "sees": from one hue below to the other above.
vec3 crystalGradient(float t) {
  return mix(uColorA, uColorB, smoothstep(-0.7, 0.8, t));
}

void main() {
  // The back faces are flipped by the engine: their normal looks inwards,
  // and the fresnel would take them all for edges.
  vec3 normal = normalize(vNormal) * (1.0 - 2.0 * uBack);
  vec3 view = normalize(-vViewPosition);
  float facing = max(dot(normal, view), 0.0);
  float fresnel = pow(1.0 - facing, 3.0);

  // Three indices, three directions, one colour per channel.
  float eta = 1.0 / 1.45;
  float spread = uDispersion * 0.07;
  vec3 red = refract(-view, normal, eta - spread);
  vec3 green = refract(-view, normal, eta);
  vec3 blue = refract(-view, normal, eta + spread);
  vec3 refracted = vec3(
    crystalGradient(red.y + red.x * 0.35).r,
    crystalGradient(green.y + green.x * 0.35).g,
    crystalGradient(blue.y + blue.x * 0.35).b
  );

  vec3 light = normalize(vec3(0.5, 0.8, 0.6));
  float diffuse = max(dot(normal, light), 0.0);
  float specular = pow(max(dot(normal, normalize(light + view)), 0.0), 80.0);

  // A second highlight, low and to the left: the bounce off the floor, broader.
  vec3 bounce = normalize(vec3(-0.7, -0.2, 0.4));
  float bounceSpecular = pow(max(dot(normal, normalize(bounce + view)), 0.0), 40.0) * 0.4;

  // The ambient share is high: a dark crystal on a dark background is no
  // more than a silhouette, and it is by its facets that it must read.
  vec3 colour = refracted * (0.55 + 0.55 * diffuse) + uColorB * (specular + bounceSpecular + fresnel * 0.4);

  // The back faces, seen through, are more discreet.
  float alpha = (0.55 + 0.45 * fresnel + specular * 0.5) * mix(1.0, 0.55, uBack);

  gl_FragColor = vec4(colour, clamp(alpha, 0.0, 1.0));
}
`
