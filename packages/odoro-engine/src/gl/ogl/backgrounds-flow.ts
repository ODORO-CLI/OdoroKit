/**
 * Shaders de fond : la famille des ecoulements.
 *
 * Quatre facons de faire couler de la couleur sans jamais deplacer de
 * geometrie. Le point commun : le fragment ne demande pas « qu'y a-t-il ici »
 * mais « ou serait ici si l'espace avait coule », et lit la couleur la-bas.
 *
 * Aucun de ces shaders n'est repris d'ailleurs. La mathematique de chacun est
 * expliquee la ou il se trouve — c'est la seule facon de pouvoir le modifier
 * plus tard sans le reinventer.
 *
 * @module
 */

import { NOISE_FUNCTIONS } from './shaders.js'

/**
 * Plasma : l'interference de quatre ondes.
 *
 * ## La technique
 *
 * C'est le plus ancien effet de l'histoire de la demo, et il tient en une
 * addition : quatre sinus d'orientations et de frequences differentes,
 * evalues au meme point. La ou ils se renforcent, la valeur monte ; la ou ils
 * s'opposent, elle descend. Le motif qui en resulte n'a aucune structure
 * propre — il n'est fait que de leurs battements.
 *
 * Le quatrieme sinus est evalue sur la **distance** au centre plutot que sur
 * une combinaison lineaire de x et y. C'est ce qui empeche la figure de rester
 * une grille de losanges : sans lui, les trois premieres ondes formeraient un
 * reseau parfaitement periodique, et l'oeil le verrait immediatement.
 *
 * La somme est ramenee dans `[0,1]` puis passee dans un cosinus, ce qui replie
 * l'echelle sur elle-meme : les teintes se succedent en boucle au lieu de
 * saturer aux extremites.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`.
 */
export const PLASMA_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  // Trois ondes directionnelles : chacune est une grille de bandes, leur
  // somme est un reseau. Les frequences ne sont pas multiples entre elles.
  float v = sin(p.x * 3.0 + t);
  v += sin(p.y * 2.3 - t * 0.8);
  v += sin((p.x + p.y) * 1.7 + t * 0.6);

  // La quatrieme est radiale : elle brise la periodicite du reseau, sans
  // quoi la figure resterait une grille de losanges reconnaissable.
  v += sin(length(p) * 2.9 - t * 1.3);

  // Repliement : le cosinus renvoie l'echelle sur elle-meme, donc les teintes
  // bouclent au lieu de saturer aux extremites de la somme.
  float k = 0.5 + 0.5 * cos(v * 1.2);

  vec3 colour = mix(uColorA, uColorB, k);
  colour = mix(colour, uColorC, 0.5 + 0.5 * sin(v * 0.8 + t * 0.4));

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Soie : un ecoulement obtenu en deplacant le domaine deux fois.
 *
 * ## Pourquoi deux passes et pas une
 *
 * Un bruit fractal seul donne des taches. Le meme bruit evalue en un point
 * **deja deplace** par un autre bruit donne des volutes : c'est le
 * deplacement de domaine, et l'aurore l'emploie deja une fois.
 *
 * Ici il est applique **deux fois**. La premiere passe cree des courants, la
 * seconde les enroule sur eux-memes. La difference se voit immediatement :
 * une passe produit un tissu froisse, deux produisent un tissu qui coule.
 * C'est aussi ce qui double le cout, d'ou la retrogradation par octaves.
 *
 * Le temps entre dans les deplacements, jamais dans la couleur finale : la
 * matiere se deforme au lieu de clignoter.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale`,
 * `uOctaves`.
 */
export const SILK_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uOctaves;

${NOISE_FUNCTIONS}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;
  int octaves = int(clamp(uOctaves, 1.0, 6.0));

  // Premiere passe : deux bruits decorreles par un decalage constant,
  // formant un champ de vecteurs. Il donne les courants.
  vec2 courant = vec2(
    odoroFbm(p + vec2(0.0, t), octaves),
    odoroFbm(p + vec2(5.2, 1.3 - t), octaves)
  );

  // Seconde passe : le meme champ, evalue la ou la premiere l'a envoye. Ce
  // sont ces courants appliques a eux-memes qui enroulent la matiere.
  vec2 repli = vec2(
    odoroFbm(p + 4.0 * courant + vec2(1.7, 9.2), octaves),
    odoroFbm(p + 4.0 * courant + vec2(8.3, 2.8), octaves)
  );

  float v = odoroFbm(p + 4.0 * repli, octaves);

  vec3 colour = mix(uColorA, uColorB, clamp(v * 1.6, 0.0, 1.0));

  // La longueur du repli marque les zones ou l'ecoulement s'est le plus
  // enroule : c'est la que la troisieme teinte apparait.
  colour = mix(colour, uColorC, clamp(length(repli) * 0.7, 0.0, 1.0));

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Caustiques : la lumiere au fond d'un bassin.
 *
 * ## La technique
 *
 * Une caustique est le lieu ou des rayons refractes se concentrent. La
 * simuler correctement demanderait de tracer ces rayons ; l'imiter demande
 * seulement de reproduire ce qui la caracterise a l'oeil — un reseau de
 * filaments clairs, mobiles, qui se croisent sans jamais se refermer.
 *
 * Le procede : on itere quelques fois un deplacement du point par le sinus de
 * ses propres coordonnees. Chaque passe replie l'espace un peu plus, et la
 * distance accumulee entre le point et son image forme naturellement des
 * lignes de concentration. C'est l'inverse d'un flou : au lieu de moyenner,
 * on accumule un minimum.
 *
 * L'exposant applique a la fin est ce qui separe un halo diffus d'un filament
 * net. En dessous de six, cela ressemble a du brouillard.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale`, `uIntensity`.
 */
export const CAUSTICS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uIntensity;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * max(uScale, 0.1);
  float t = uTime * uSpeed;

  vec2 courant = p;
  float accumulation = 1.0;

  // Cinq replis : au-dela, les filaments se croisent trop pour rester
  // lisibles ; en dessous de trois, le reseau reste une simple grille.
  for (int i = 1; i < 6; i += 1) {
    float n = float(i);
    courant += vec2(
      sin(courant.y * n + t + 0.3 * n) / n,
      cos(courant.x * n + t + 0.2 * n) / n
    );

    // Le minimum accumule : la valeur ne retient que le passage le plus
    // proche, ce qui dessine des lignes au lieu d'un degrade.
    accumulation = min(accumulation, length(courant - p) * 0.5);
  }

  // L'exposant transforme un halo en filament. En dessous de six, l'effet
  // ressemble a du brouillard plutot qu'a de la lumiere refractee.
  float lumiere = pow(clamp(1.0 - accumulation, 0.0, 1.0), 6.0) * max(uIntensity, 0.0);

  gl_FragColor = vec4(mix(uColorA, uColorB, clamp(lumiere, 0.0, 1.0)), 1.0);
}
`

/**
 * Vortex : l'espace tourne d'autant plus qu'on approche du centre.
 *
 * ## La technique
 *
 * En coordonnees polaires, un tourbillon n'est pas un mouvement mais une
 * addition : on ajoute a l'angle une quantite qui decroit avec le rayon.
 * Les points proches du centre tournent beaucoup, les points lointains
 * presque pas, et l'ensemble s'enroule en spirale.
 *
 * Le motif qu'on enroule est volontairement trivial — des secteurs
 * angulaires. Toute la richesse vient de la torsion, pas du motif : un motif
 * deja complexe deviendrait illisible une fois enroule.
 *
 * Le rayon est adouci par `1/(r+c)` plutot que par `1/r` : sans cette
 * constante, la torsion diverge au centre et le pixel central clignote a
 * chaque image.
 *
 * Uniformes : `uColorA`, `uColorB`, `uColorC`, `uSpeed`, `uScale` (nombre de
 * bras), `uTwist`.
 */
export const VORTEX_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uColorC;
uniform float uSpeed;
uniform float uScale;
uniform float uTwist;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);

  float rayon = length(p);
  float angle = atan(p.y, p.x);
  float t = uTime * uSpeed;

  // La constante au denominateur borne la torsion au centre : avec 1/r seul,
  // elle diverge et le pixel central clignote a chaque image.
  float torsion = uTwist / (rayon + 0.25);
  float enroule = angle + torsion + t;

  float bras = max(uScale, 1.0);
  float secteur = 0.5 + 0.5 * sin(enroule * bras);

  vec3 colour = mix(uColorA, uColorB, secteur);

  // Le coeur recoit la troisieme teinte : sans elle, la convergence des bras
  // produit une tache neutre au centre exact.
  colour = mix(colour, uColorC, smoothstep(0.35, 0.0, rayon));

  // Attenuation vers les bords : le cadre n'est pas rond, et sans elle les
  // coins montrent la limite du disque.
  colour *= smoothstep(0.95, 0.35, rayon) * 0.6 + 0.4;

  gl_FragColor = vec4(colour, 1.0);
}
`
