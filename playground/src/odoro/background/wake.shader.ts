/**
 * Shader du sillage.
 *
 * ## L'idee mathematique
 *
 * Le curseur laisse une trainee : seize positions echantillonnees dans la
 * boucle du moteur, chacune un halo gaussien — exponentielle du carre de la
 * distance — dont l'intensite decroit en exponentielle de l'age. Les halos se
 * somment, et la somme sert deux fois : une premiere pour la teinte, une
 * seconde, plus exigeante, pour le coeur lumineux du trace le plus frais.
 *
 * Un depot a -1000 donne un age enorme, donc une intensite nulle : les
 * emplacements vides du tampon sont inertes d'office.
 *
 * ## Uniforms
 *
 * - `uTime` — temps en secondes, fourni par le moteur.
 * - `uResolution` — taille du canevas en pixels, fournie par le moteur.
 * - `uColorA` — le fond.
 * - `uColorB` — la trainee.
 * - `uColorC` — le coeur frais de la trainee.
 * - `uTrail` — seize depots (x, y, temps de depot), tampon circulaire.
 * - `uLife` — duree de vie d'un depot, en secondes.
 * - `uSize` — rayon des halos.
 */
export const WAKE_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform vec3 uTrail[16];
uniform float uLife;
uniform float uSize;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);

  float size = max(uSize, 0.005);
  float glow = 0.0;

  // Bornes constantes : la specification du langage l'exige, et seize depots
  // suffisent a dessiner une trainee continue au rythme d'un depot par 40 ms.
  for (int i = 0; i < 16; i += 1) {
    vec3 depot = uTrail[i];
    vec2 centre = depot.xy * vec2(aspect, 1.0);
    float age = uTime - depot.z;

    vec2 ecart = p - centre;
    float fade = exp(-max(age, 0.0) / max(uLife, 0.05));

    glow += exp(-dot(ecart, ecart) / (size * size)) * fade;
  }

  vec3 colour = mix(uColorA, uColorB, clamp(glow * 0.6, 0.0, 1.0));

  // Le coeur frais : seule une somme dense de halos jeunes atteint ce seuil,
  // donc l'eclat vit pres du curseur et s'eteint le long de la trainee.
  colour = mix(colour, uColorC, smoothstep(0.9, 1.8, glow) * 0.8);

  // Vignette discrete, pour que le noir ne soit pas un aplat.
  float ecartCadre = length((vUv - 0.5) * vec2(aspect, 1.0));
  colour *= 1.0 - smoothstep(0.55, 1.1, ecartCadre) * 0.3;

  gl_FragColor = vec4(colour, 1.0);
}
`
