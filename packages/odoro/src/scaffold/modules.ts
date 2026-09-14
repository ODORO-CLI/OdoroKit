/**
 * Ce que le createur propose de mettre dans le projet.
 *
 * ## Pourquoi un catalogue, et pas une liste de paquets
 *
 * Les trois choses qu'on veut cocher ne sont pas de meme nature, et une liste
 * de paquets mentirait sur deux d'entre elles :
 *
 * - **les bibliotheques** et **le moteur** sont bien des paquets npm ;
 * - **le routeur** n'en est pas un. Il vit dans `@odoro-cli/libs/router`, un
 *   sous-chemin des bibliotheques. Le cocher n'installe donc rien de plus :
 *   il **cable** le routeur dans l'application generee, et le decocher rend
 *   une application d'une seule page ;
 * - **le registre** n'en est pas un non plus. Ses entrees sont copiees dans le
 *   projet par `odoro add`, une par une, et aucun paquet ne porte son nom.
 *   Le cocher ecrit `odoro.json` — destination, prefixe d'import, adresse du
 *   registre — et entraine le moteur, que 455 de ses 461 entrees importent.
 *
 * Chaque entree porte donc ce qu'elle fait vraiment, et le createur s'en sert
 * plutot que de deviner.
 *
 * ## Pourquoi les libelles sont en anglais
 *
 * Le code et les commentaires de ce depot sont en francais ; ce que voit la
 * personne qui cree un projet ne l'est pas. `npm create odoro` s'execute chez
 * n'importe qui, et l'anglais est la langue par defaut d'un outil de ligne de
 * commande publie sur npm.
 *
 * ## Une case qui ne peut pas etre decochee est une case qui ment
 *
 * Les bibliotheques sont cochees par defaut, et on peut les decocher pour de
 * bon : le projet part alors sans feuille de style Odoro, sans classes `o-*`
 * et sans routeur — une base React nue, avec du CSS ordinaire. C'est un choix
 * legitime pour qui apporte son propre systeme de style, et il valait mieux le
 * rendre vrai que d'afficher une case verrouillee.
 *
 * Les deux contraintes sont de bon sens : sans les bibliotheques il n'y a pas
 * de routeur, puisque c'est la qu'il vit ; et le registre entraine le moteur,
 * faute de quoi presque aucune de ses entrees ne compilerait. `resoudre` s'en
 * charge, et le dit plutot que de corriger en silence.
 *
 * @module
 */

/** Un module proposable a la creation. */
export type ModuleId = 'libs' | 'router' | 'icons' | 'engine' | 'registre'

/** Ce qu'on sait d'un module. */
export interface Module {
  readonly id: ModuleId
  /** Libelle affiche dans la liste. En anglais : voir l'en-tete du module. */
  readonly label: string
  /** Precision affichee en gris, a droite du libelle. En anglais de meme. */
  readonly hint: string
  /** Coche a l'ouverture de la liste. */
  readonly defaut: boolean
  /**
   * Le paquet npm a ajouter aux dependances, s'il y en a un.
   *
   * Absent pour `router` et `registre` : voir l'en-tete du module.
   */
  readonly paquet?: string
}

/**
 * Le catalogue, dans l'ordre d'affichage.
 *
 * L'ordre n'est pas alphabetique mais va du socle au supplement : ce qu'on
 * decoche rarement d'abord, ce qu'on ajoute a l'occasion ensuite.
 */
export const MODULES: readonly Module[] = [
  {
    id: 'libs',
    label: 'Libraries',
    hint: 'styles, tokens, UI and motion',
    defaut: true,
    paquet: '@odoro-cli/libs',
  },
  {
    id: 'router',
    label: 'Router',
    hint: 'ships with the libraries — wires up the pages',
    defaut: true,
  },
  {
    id: 'icons',
    label: 'Icons',
    hint: 'five families, imported one by one',
    defaut: true,
    paquet: '@odoro-cli/icons',
  },
  {
    id: 'engine',
    label: 'Engine',
    hint: 'WebGL, surfaces and motion policy',
    defaut: false,
    paquet: '@odoro-cli/engine',
  },
  {
    id: 'registre',
    label: 'Component registry',
    hint: 'copied by `odoro add` — pulls in the engine',
    defaut: false,
  },
]

/** Les identifiants connus, pour valider une saisie. */
export const MODULE_IDS: readonly ModuleId[] = MODULES.map((m) => m.id)

/** Ceux qui sont coches a l'ouverture de la liste. */
export const MODULES_PAR_DEFAUT: readonly ModuleId[] = MODULES.filter(
  (m) => m.defaut,
).map((m) => m.id)

/** Ce que `resoudre` a du corriger dans une selection. */
export interface Resolution {
  /** La selection effectivement retenue. */
  readonly modules: readonly ModuleId[]
  /**
   * Ce qui a ete retire ou ajoute, et pourquoi.
   *
   * Vide quand la selection etait deja coherente. Le createur l'affiche plutot
   * que de corriger en silence : une case cochee qui ne produit rien, ou un
   * paquet apparu sans explication, sont plus deroutants qu'une phrase.
   */
  readonly avertissements: readonly string[]
}

/**
 * Rend la selection coherente, et dit ce qu'elle a change.
 *
 * Deux regles : le routeur vit dans les bibliotheques, donc il ne survit pas a
 * leur retrait ; le registre a besoin du moteur, donc il l'entraine.
 *
 * @example
 * resoudre(['router', 'icons'])
 * // { modules: ['icons'], avertissements: ['Le routeur vient des...'] }
 */
export function resoudre(selection: readonly ModuleId[]): Resolution {
  const choisis = new Set(selection)
  const avertissements: string[] = []

  if (choisis.has('router') && !choisis.has('libs')) {
    choisis.delete('router')
    avertissements.push(
      'The router lives in the libraries (@odoro-cli/libs/router) — without them it is dropped.',
    )
  }

  // 455 des 461 entrees du registre importent le moteur. Configurer le
  // registre sans lui livrerait un catalogue dont presque rien ne compile :
  // `odoro add` ecrirait les fichiers, et le projet echouerait sur un module
  // introuvable. Mieux vaut l'ajouter et le dire.
  if (choisis.has('registre') && !choisis.has('engine')) {
    choisis.add('engine')
    avertissements.push(
      'Almost every registry entry imports @odoro-cli/engine, so the engine was added.',
    )
  }

  // L'ordre du catalogue plutot que celui de la saisie : deux selections
  // identiques doivent produire le meme projet, et le meme manifeste.
  return { modules: MODULE_IDS.filter((id) => choisis.has(id)), avertissements }
}

/**
 * Les paquets a inscrire dans les dependances, pour une selection donnee.
 *
 * @example
 * paquetsDe(['libs', 'router', 'icons']) // ['@odoro-cli/libs', '@odoro-cli/icons']
 */
export function paquetsDe(modules: readonly ModuleId[]): readonly string[] {
  const choisis = new Set(modules)
  return MODULES.filter((m) => m.paquet !== undefined && choisis.has(m.id)).map(
    (m) => m.paquet as string,
  )
}

/**
 * Les variantes a poser par-dessus le gabarit, dans l'ordre.
 *
 * ## Trois axes, et non une combinatoire
 *
 * La page d'accueil est la meme quoi qu'on coche : meme dessin, meme
 * typographie, memes sections. Ce qui change tient en trois endroits, et chacun
 * a sa variante :
 *
 * - **sans bibliotheques**, tout est rendu en CSS ordinaire — le dessin tient,
 *   les classes `o-*` disparaissent. Le routeur y est deja absent, `resoudre`
 *   l'ayant retire ;
 * - **sans routeur**, l'application n'a qu'une page et compose les sections
 *   elle-meme ;
 * - **avec le moteur**, le fond decoratif devient une surface WebGL animee au
 *   lieu d'un degrade. Il ne remplace qu'un fichier, `sections/Fond.tsx` : le
 *   reste de la page ne sait pas d'ou vient son fond.
 *
 * L'ordre compte : le fond du moteur est pose en dernier, donc il gagne sur
 * celui qu'une variante precedente aurait ecrit.
 *
 * @example
 * variantesDe(['libs', 'router'])                    // []
 * variantesDe(['libs', 'router', 'engine'])          // ['avec-moteur']
 * variantesDe(['libs', 'icons'])                     // ['sans-routeur']
 * variantesDe(['icons', 'engine'])                   // ['sans-libs', 'avec-moteur']
 */
export function variantesDe(modules: readonly ModuleId[]): readonly string[] {
  const choisis = new Set(modules)
  const variantes: string[] = []

  if (!choisis.has('libs')) variantes.push('sans-libs')
  else if (!choisis.has('router')) variantes.push('sans-routeur')

  if (choisis.has('engine')) variantes.push('avec-moteur')

  return variantes
}

/**
 * Les pages generees sont-elles decoupees par route ?
 *
 * Sans routeur il n'y a qu'une page, et le dossier `routes/` du gabarit n'a
 * plus de sens : le laisser livrerait des fichiers que rien n'importe, et dont
 * les imports ne resoudraient meme pas.
 *
 * @example
 * gardeLesRoutes(['libs', 'router']) // true
 */
export function gardeLesRoutes(modules: readonly ModuleId[]): boolean {
  return modules.includes('router')
}

/**
 * Traduit une valeur de `--modules` en identifiants.
 *
 * @returns Les identifiants, ou le motif du refus.
 *
 * @example
 * lireModules('libs,router') // { modules: ['libs', 'router'] }
 * lireModules('none')        // { modules: [] }
 * lireModules('')            // { modules: [] }
 */
export function lireModules(
  valeur: string,
): { modules: readonly ModuleId[]; erreur?: undefined } | { erreur: string } {
  const brut = valeur
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '')

  // `--modules=` sans rien, ou `--modules=none` : une application nue, ce qui
  // est un choix valide et non une saisie vide a corriger. `aucun` reste
  // accepte : il a ete documente, et le retirer casserait les scripts ecrits
  // depuis.
  if (brut.length === 1 && (brut[0] === 'none' || brut[0] === 'aucun')) {
    return { modules: [] }
  }

  const inconnu = brut.find((part) => !MODULE_IDS.includes(part as ModuleId))
  if (inconnu !== undefined) {
    return {
      erreur: `Unknown module: "${inconnu}". Available: ${MODULE_IDS.join(', ')}, or "none".`,
    }
  }

  return { modules: brut as ModuleId[] }
}
