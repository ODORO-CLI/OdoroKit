/**
 * Ink shader.
 *
 * ## The mathematical idea
 *
 * Each click spreads a disc of the next colour from the clicked point: its
 * radius is the age times the speed, its edge is softened by a feather, and
 * the most recent one lands on top of the others — the background therefore
 * changes colour in waves, cycling through the three colours of the palette.
 * Four clicks live at once: the fifth drives out the oldest, which has
 * already covered the frame.
 *
 * A start at -1000 is discarded explicitly: its radius would be enormous and
 * its colour undefined.
 *
 * ## Uniforms
 *
 * - `uTime` — time in seconds, supplied by the engine.
 * - `uResolution` — canvas size in pixels, supplied by the engine.
 * - `uColorA` — the first ink, and the starting colour of the background.
 * - `uColorB` — the second ink.
 * - `uColorC` — the third ink.
 * - `uClicks` — four clicks (x, y, start time, colour index).
 * - `uSpeed` — speed at which the discs spread.
 * - `uFeather` — width of the softened edge.
 */
export const INK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec4 uClicks[4];
uniform float uSpeed;
uniform float uFeather;

// The colour index cycles through the three inks of the palette.
vec3 inkColour(float index) {
  if (index < 0.5) return uColorA;
  if (index < 1.5) return uColorB;
  return uColorC;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float feather = max(uFeather, 0.005);
  vec3 colour = uColorA;

  // From the oldest to the most recent: index 0 sits at the head of the
  // buffer, so it is applied last — it is the one that covers the others.
  for (int i = 3; i >= 0; i -= 1) {
    vec4 click = uClicks[i];

    // Empty slot in the buffer: enormous radius and undefined colour, it is
    // discarded instead of being left to paint.
    if (click.z < -100.0) continue;

    vec2 centre = click.xy * vec2(aspect, 1.0);
    float age = max(uTime - click.z, 0.0);
    float radius = age * uSpeed;
    float d = length(p - centre);

    float alpha = 1.0 - smoothstep(radius - feather, radius + feather, d);
    vec3 ink = inkColour(click.w);

    // The advancing edge brightens a little: the wave can be seen going by.
    float rim = exp(-abs(d - radius) / feather) * 0.15;

    colour = mix(colour, ink * (1.0 + rim), alpha);
  }

  gl_FragColor = vec4(colour, 1.0);
}
`
