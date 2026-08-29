/**
 * Bruit tridimensionnel, pour les scenes 3D.
 *
 * ## Pourquoi une version separee du bruit plein ecran
 *
 * Le bruit du backend leger prend un point du plan : c'est tout ce dont a
 * besoin un effet qui couvre l'ecran. Deformer une sphere demande autre chose.
 *
 * On pourrait projeter la surface sur un plan — latitude et longitude — et
 * echantillonner le bruit plan. Le resultat porte alors deux defauts qu'aucun
 * reglage ne corrige : une couture la ou la longitude se referme, et un
 * ecrasement aux poles, la ou toute une bande de surface se replie sur un
 * point. Ils se voient immediatement sur un objet qui tourne.
 *
 * Le bruit tridimensionnel n'a ni couture ni pole : il est defini partout dans
 * l'espace, et la surface ne fait que le traverser.
 *
 * ## Ce que c'est
 *
 * Un bruit de valeur sur un reseau cubique. Une valeur pseudo-aleatoire par
 * sommet, une interpolation lissee entre les huit sommets de la maille, et une
 * somme d'octaves de frequences doublees.
 *
 * Ecrit depuis ses principes, comme le reste des shaders livres. Le multiplieur
 * du hachage est l'inverse de pi : une valeur irrationnelle decorrele les trois
 * coordonnees, la ou un nombre rond ferait apparaitre des alignements.
 *
 * @module
 */

/**
 * Fonctions de bruit tridimensionnel, a prefixer a un shader.
 *
 * @example
 * const vertex = `${NOISE_FUNCTIONS_3D}\n${MON_VERTEX}`
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

  // Interpolation lissee : la derivee s'annule aux sommets, ce qui supprime
  // les aretes visibles du reseau. Une interpolation lineaire les laisserait.
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

  // La borne de boucle est constante, et la sortie se fait par rupture : le
  // premier niveau de GLSL n'accepte pas une condition qui depend d'un
  // uniforme, et un shader qui ne compile pas chez la moitie des visiteurs
  // n'est pas un shader.
  for (int i = 0; i < 8; i += 1) {
    if (i >= octaves) break;
    sum += amplitude * odoroNoise3(point);
    // Un facteur legerement superieur a deux evite que les octaves ne se
    // realignent sur le meme reseau, ce qui produirait un motif repetitif.
    point *= 2.03;
    amplitude *= 0.5;
  }

  return sum;
}
`
