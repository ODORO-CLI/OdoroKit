/**
 * Shaders de fond : la famille des semis.
 *
 * Quatre motifs faits de nombreux petits elements — etoiles, gouttes, fils,
 * bulles. Aucun n'existe en tant qu'objet : chacun est retrouve par le
 * fragment a partir de sa position, grace au meme principe que les pavages.
 * C'est ce qui permet d'en afficher des milliers sans en declarer un seul.
 *
 * Aucun de ces shaders n'est repris d'ailleurs.
 *
 * @module
 */

/**
 * Etoiles : un semis a plusieurs profondeurs.
 *
 * ## Comment mille etoiles tiennent en neuf lignes
 *
 * L'espace est replie sur une grille, chaque cellule contient au plus une
 * etoile, et sa position dans la cellule est tiree de l'identifiant de la
 * cellule. Le fragment n'a donc jamais a parcourir une liste : il regarde
 * dans quelle cellule il se trouve, et calcule la seule etoile qui puisse y
 * etre.
 *
 * ## La profondeur
 *
 * Trois couches de densites differentes defilent a trois vitesses. C'est du
 * parallaxe au sens strict : ce qui est loin bouge peu. Une seule couche
 * donnerait un semis plat, immediatement reconnaissable comme une texture qui
 * glisse.
 *
 * Le scintillement n'est pas aleatoire par image — cela produirait du bruit.
 * C'est un sinus dont la phase est tiree de l'etoile : chacune scintille a son
 * rythme, et de facon reproductible.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (densite),
 * `uTwinkle`.
 */
export const STARS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uTwinkle;

vec3 odoroTirage(vec2 cellule) {
  float a = fract(sin(dot(cellule, vec2(127.1, 311.7))) * 43758.5453);
  float b = fract(sin(dot(cellule, vec2(269.5, 183.3))) * 43758.5453);
  float c = fract(sin(dot(cellule, vec2(419.2, 371.9))) * 43758.5453);
  return vec3(a, b, c);
}

// Une couche : une grille, une etoile par cellule, aucune liste a parcourir.
float odoroCouche(vec2 p, float densite, float t, float scintillement) {
  vec2 grille = p * densite;
  vec2 cellule = floor(grille);
  vec2 local = fract(grille);

  vec3 tirage = odoroTirage(cellule);

  // Les deux tiers des cellules restent vides : une etoile par cellule
  // donnerait une grille parfaitement reguliere, que l'oeil reconnait.
  if (tirage.z > 0.34) return 0.0;

  float d = length(local - tirage.xy);

  // Le scintillement est un sinus de phase tiree de l'etoile : chacune a son
  // rythme, et il est reproductible d'une image a l'autre.
  float eclat = 1.0 - scintillement * (0.5 + 0.5 * sin(t * 3.0 + tirage.z * 62.8));

  return smoothstep(0.06, 0.0, d) * eclat;
}

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = vUv * vec2(aspect, 1.0);
  float t = uTime * uSpeed;
  float densite = max(uScale, 1.0);
  float scintillement = clamp(uTwinkle, 0.0, 1.0);

  // Trois profondeurs, trois vitesses : ce qui est loin bouge peu. Une seule
  // couche se lirait comme une texture qui glisse.
  float lumiere = odoroCouche(p + vec2(t * 0.010, 0.0), densite, t, scintillement) * 1.0;
  lumiere += odoroCouche(p + vec2(t * 0.025, 0.0), densite * 1.7, t, scintillement) * 0.7;
  lumiere += odoroCouche(p + vec2(t * 0.050, 0.0), densite * 2.6, t, scintillement) * 0.4;

  gl_FragColor = vec4(mix(uColorA, uColorB, clamp(lumiere, 0.0, 1.0)), 1.0);
}
`

/**
 * Pluie : des trainees verticales de longueurs inegales.
 *
 * ## La technique
 *
 * L'espace est decoupe en colonnes. Chaque colonne recoit une vitesse et une
 * phase tirees de son indice, puis defile independamment : c'est ce decalage
 * qui empeche la pluie de tomber en rangs.
 *
 * Une goutte est un segment, pas un point. On la dessine en attenuant
 * progressivement vers le haut a partir de sa tete — la trainee est donc
 * gratuite, elle n'est qu'une fonction de la distance a la tete.
 *
 * ## Pourquoi la colonne est repliee, pas la goutte
 *
 * Replier la coordonnee verticale de la colonne entiere fait qu'une goutte
 * sortie par le bas rentre par le haut sans discontinuite. Deplacer une
 * goutte demanderait de la faire exister comme objet, et de gerer sa
 * disparition.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (colonnes),
 * `uLength`.
 */
export const RAIN_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uLength;

float odoroHash1(float x) {
  return fract(sin(x * 127.1) * 43758.5453);
}

void main() {
  vec2 p = vUv;
  float t = uTime * uSpeed;

  float colonnes = max(uScale, 1.0);
  float indice = floor(p.x * colonnes);
  float dans = fract(p.x * colonnes);

  float tirage = odoroHash1(indice);

  // Vitesse et phase propres a la colonne : sans ce decalage, la pluie
  // tomberait en rangs parfaitement alignes.
  float vitesse = 0.6 + tirage * 1.4;
  float tete = fract(tirage + t * vitesse);

  // La coordonnee est repliee sur la colonne entiere : une goutte sortie par
  // le bas rentre par le haut sans qu'on ait a la faire disparaitre.
  float distance = fract(p.y + tete);

  // La trainee n'est qu'une fonction de la distance a la tete : aucun segment
  // n'est dessine, seule l'attenuation le suggere.
  float trainee = smoothstep(max(uLength, 0.01), 0.0, distance);

  // Largeur du filet : le meme adoucissement de chaque cote de la colonne.
  float filet = smoothstep(0.5, 0.15, abs(dans - 0.5));

  gl_FragColor = vec4(mix(uColorA, uColorB, trainee * filet), 1.0);
}
`

/**
 * Fils : un faisceau de courbes fines.
 *
 * ## Comment tracer une courbe sans la tracer
 *
 * Un fragment ne peut pas suivre un trace ; il peut en revanche mesurer sa
 * distance a une courbe dont il connait l'equation. Ici chaque fil est un
 * `y = f(x)`, et le fragment compare son propre `y` a celui du fil. Proche,
 * il s'allume ; loin, il reste eteint.
 *
 * ## La correction de pente
 *
 * Sans elle, un fil parait epais la ou il est plat et fin la ou il monte : la
 * distance verticale n'est pas la distance a la courbe. Diviser par la racine
 * de `1 + f'(x)²` corrige exactement cet ecart — c'est la meme division qui
 * apparait dans la distance d'un point a une droite.
 *
 * Sans cette correction, l'effet ressemble a une erreur d'anticrenelage. Avec
 * elle, l'epaisseur est constante sur toute la longueur du fil.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (nombre de fils),
 * `uThickness`.
 */
export const THREADS_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uThickness;

void main() {
  vec2 p = vUv;
  float t = uTime * uSpeed;
  float fils = max(uScale, 1.0);
  float epaisseur = max(uThickness, 0.0005);

  vec3 colour = uColorA;

  for (int i = 0; i < 12; i += 1) {
    if (float(i) >= fils) break;

    float k = float(i) / fils;
    float phase = t + k * 6.28318;

    // Deux sinus de frequences non multiples : le fil ne se repete pas a
    // l'oeil sur la largeur du cadre.
    float y = 0.5
      + 0.18 * sin(p.x * 4.0 + phase)
      + 0.07 * sin(p.x * 9.3 - phase * 1.7)
      + (k - 0.5) * 0.7;

    // La derivee de la meme expression : elle sert a corriger l'epaisseur.
    float pente = 0.18 * 4.0 * cos(p.x * 4.0 + phase)
      - 0.07 * 9.3 * cos(p.x * 9.3 - phase * 1.7);

    // Distance a la courbe, et non distance verticale : sans cette division
    // le fil paraitrait epais la ou il est plat et fin la ou il monte.
    float d = abs(p.y - y) / sqrt(1.0 + pente * pente);

    colour = mix(colour, uColorB, smoothstep(epaisseur, 0.0, d));
  }

  gl_FragColor = vec4(colour, 1.0);
}
`

/**
 * Bulles : des disques qui montent et se fondent entre eux.
 *
 * ## La fusion
 *
 * Deux disques dessines cote a cote restent deux disques. Additionner des
 * champs qui decroissent avec la distance, puis seuiller la somme, les fait
 * fusionner des qu'ils se rapprochent : c'est le principe des surfaces
 * implicites, et le seul moyen d'obtenir cette jonction en col sans decrire
 * de geometrie.
 *
 * Le champ employe est `r²/d²`, qui vaut un sur le bord du disque et decroit
 * ensuite. La somme est comparee a un, si bien qu'un disque isole retrouve
 * exactement sa taille nominale — ce qui ne serait pas le cas avec un champ
 * gaussien.
 *
 * ## La remontee
 *
 * Chaque bulle a sa propre vitesse, et sa hauteur est repliee sur `[0,1]` :
 * elle reapparait en bas des qu'elle sort en haut, sans discontinuite. Sa
 * derive horizontale est un sinus de phase propre — sans elle, les bulles
 * monteraient sur des rails.
 *
 * Uniformes : `uColorA`, `uColorB`, `uSpeed`, `uScale` (nombre), `uRadius`.
 */
export const BUBBLES_FRAGMENT = /* glsl */ `
precision highp float;

varying vec2 vUv;

uniform float uTime;
uniform vec2 uResolution;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uSpeed;
uniform float uScale;
uniform float uRadius;

void main() {
  float aspect = uResolution.x / max(uResolution.y, 1.0);
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  float t = uTime * uSpeed;

  float nombre = max(uScale, 1.0);
  float rayon = max(uRadius, 0.001);
  float champ = 0.0;

  for (int i = 0; i < 16; i += 1) {
    if (float(i) >= nombre) break;

    float k = float(i);
    float tirage = fract(sin(k * 127.1) * 43758.5453);
    float autre = fract(sin(k * 311.7) * 43758.5453);

    // La hauteur est repliee : la bulle reapparait en bas des qu'elle sort en
    // haut, sans qu'on ait a la creer ni a la detruire.
    float y = fract(tirage + t * (0.3 + autre * 0.7)) - 0.5;
    float x = (tirage - 0.5) * aspect + 0.08 * sin(t * 1.3 + autre * 6.28318);

    float taille = rayon * (0.5 + autre);
    vec2 ecart = p - vec2(x, y);

    // r2/d2 : vaut un sur le bord, decroit ensuite. Compare a un, un disque
    // isole retrouve exactement sa taille nominale.
    champ += (taille * taille) / max(dot(ecart, ecart), 0.0001);
  }

  // Le seuil sur la somme, et non sur chaque disque : c'est la que deux
  // bulles proches fusionnent en formant un col.
  float forme = smoothstep(0.85, 1.15, champ);

  gl_FragColor = vec4(mix(uColorA, uColorB, forme), 1.0);
}
`
