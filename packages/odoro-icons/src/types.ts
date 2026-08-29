/**
 * Le contrat d'une icone.
 *
 * ## Pourquoi une donnee et non un composant par icone
 *
 * Un composant par icone est la solution la plus repandue, et la plus couteuse
 * : onze mille composants, c'est onze mille fermetures, onze mille entrees
 * dans le graphe du bundler, et un temps de compilation qui se mesure en
 * dizaines de secondes meme quand on n'en emploie que trois.
 *
 * Une icone est ici une **donnee** : sa boite, son mode, ses noeuds. Un seul
 * composant les rend toutes. L'elagage fonctionne aussi bien — un export
 * constant non reference disparait exactement comme un composant non
 * reference — et le cout de compilation s'effondre.
 *
 * @module
 */

/** Un noeud du trace : une balise SVG et ses attributs. */
export type IconNode = readonly [string, Readonly<Record<string, string>>]

/** Une icone. */
export interface IconData {
  /**
   * Boite du dessin, telle que le jeu d'origine la definit.
   *
   * Elle n'est pas ramenee a une grille commune : redessiner un trace pour le
   * faire tenir ailleurs, c'est le deformer. La taille demandee vaut pour
   * toutes les icones, quelle que soit leur boite.
   */
  readonly box: string
  /**
   * Mode de rendu.
   *
   * - `trait` — le trace est une ligne : la couleur va au contour, le
   *   remplissage reste vide.
   * - `plein` — le trace est une surface : la couleur va au remplissage.
   *
   * Confondre les deux ne produit pas une icone laide mais une icone
   * invisible, ou une tache noire.
   */
  readonly mode: 'trait' | 'plein'
  /** Epaisseur du trait, dans les unites de la boite. Absente en mode plein. */
  readonly stroke?: number
  /** Noeuds du trace. */
  readonly nodes: readonly IconNode[]
}

/** Ce qu'un module de jeu declare sur lui-meme. */
export interface PackInfo {
  /** Nom du sous-module. */
  readonly module: string
  /** Intitule affiche. */
  readonly title: string
  /** Une phrase sur le caractere du dessin. */
  readonly summary: string
  /** Mode de rendu commun a tout le jeu. */
  readonly mode: 'trait' | 'plein'
  /** Epaisseur du trait, si le jeu est au trait. */
  readonly stroke?: number
  /** Nombre d'icones. */
  readonly count: number
}
