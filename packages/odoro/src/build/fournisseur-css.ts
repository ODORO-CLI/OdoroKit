/**
 * Le fournisseur de feuille de style du projet.
 *
 * ## Pourquoi le moteur ne depend pas de la bibliotheque
 *
 * `odoro` est un outil de compilation ; `@odoro-cli/libs` est une bibliotheque
 * d'interface. Faire dependre le premier de la seconde inverserait la relation
 * — on ne peut plus compiler un projet qui n'emploie pas la bibliotheque sans
 * l'installer quand meme — et creerait un cycle des que la bibliotheque
 * voudrait se compiler avec le moteur.
 *
 * Le moteur cherche donc le generateur **dans les dependances du projet**, et
 * s'en passe s'il n'y est pas. Un projet sans bibliotheque compile comme avant ;
 * un projet avec elle obtient une feuille taillee a sa mesure.
 *
 * ## Pourquoi la resolution est ecrite a la main
 *
 * La facon evidente — `createRequire(...).resolve('@odoro-cli/libs/generateur')`
 * — echoue, et il a fallu un vrai deploiement pour s'en apercevoir : elle
 * applique la resolution **CommonJS**, qui cherche une condition `require` dans
 * le champ `exports`. Un paquet purement ESM n'en declare pas, et l'appel leve
 * `ERR_PACKAGE_PATH_NOT_EXPORTED` — c'est-a-dire exactement le meme symptome
 * qu'un paquet absent. Le moteur retombait donc silencieusement sur l'elagage,
 * en croyant qu'aucun generateur n'etait installe.
 *
 * `import.meta.resolve` ne convient pas davantage : sa forme a deux arguments,
 * seule capable de resoudre depuis un autre dossier que celui de l'appelant,
 * n'est pas stable.
 *
 * On resout donc le `package.json` du paquet — toujours exporte, et sans
 * condition — puis on lit son champ `exports` soi-meme.
 *
 * ## Un contrat, pas un import
 *
 * Le moteur ne sait du generateur qu'une chose : il rend les utilitaires
 * correspondant a un ensemble de classes. Tout paquet qui expose cette fonction
 * sous ce nom fait l'affaire.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** Ce que le moteur attend d'un fournisseur de feuille. */
export interface FournisseurCss {
  /**
   * Les regles correspondant a ces classes, **sans** variables ni preflight.
   *
   * Sans base, parce que le paquet CSS produit la porte deja : elle est arrivee
   * par l'import de l'application. La rajouter la dupliquerait.
   */
  renderUtilitairesPour(classes: ReadonlySet<string>): string
}

/** Le paquet consulte, et le sous-chemin attendu. */
const PAQUET = '@odoro-cli/libs'
const SOUS_CHEMIN = './generateur'

/** Ce qu'un champ `exports` peut contenir pour une entree. */
type Entree = string | { readonly import?: string; readonly default?: string }

/**
 * Le fichier ESM derriere une entree du champ `exports`.
 *
 * On ne reimplemente pas la resolution complete de Node — conditions
 * imbriquees, motifs, replis. On lit le cas simple, et on renonce sur tout le
 * reste : renoncer fait retomber sur l'elagage, ce qui marche, la ou une
 * resolution approximative pointerait vers le mauvais fichier.
 */
function fichierDe(entree: Entree | undefined): string | undefined {
  if (entree === undefined) return undefined
  if (typeof entree === 'string') return entree
  return entree.import ?? entree.default
}

/**
 * Cherche le generateur dans les dependances du projet.
 *
 * @param root Racine du projet compile — c'est **la** que la resolution doit
 *   partir, et non du dossier du moteur : celui-ci peut etre installe
 *   globalement, ou lie depuis un autre depot, et resoudre depuis chez lui
 *   trouverait sa propre version plutot que celle du projet.
 *
 * @returns Le fournisseur, ou `undefined` s'il n'est pas installe — ce qui
 *   n'est pas une erreur : le moteur retombe alors sur l'elagage.
 *
 * @example
 * const fournisseur = await fournisseurDe(config.root)
 */
export async function fournisseurDe(root: string): Promise<FournisseurCss | undefined> {
  try {
    // `package.json` est exporte par tous les paquets, sans condition : c'est
    // le seul sous-chemin dont la resolution CommonJS aboutit a coup sur.
    const exiger = createRequire(join(root, 'package.json'))
    const manifeste = exiger.resolve(`${PAQUET}/package.json`)
    const dossier = dirname(manifeste)

    const contenu = JSON.parse(await readFile(manifeste, 'utf8')) as {
      readonly exports?: Readonly<Record<string, Entree>>
    }

    const relatif = fichierDe(contenu.exports?.[SOUS_CHEMIN])
    if (relatif === undefined) return undefined

    const module_ = (await import(
      pathToFileURL(resolve(dossier, relatif)).href
    )) as Partial<FournisseurCss>

    // Present mais sans la fonction attendue : c'est une version trop
    // ancienne. On le traite comme une absence, et l'elagage prend le relais —
    // plutot que de lever et de casser une compilation qui marchait hier.
    if (typeof module_.renderUtilitairesPour !== 'function') return undefined

    return { renderUtilitairesPour: module_.renderUtilitairesPour }
  } catch {
    // Absent, non resoluble, ou illisible. Aucune de ces situations n'est une
    // erreur de compilation : le projet n'emploie simplement pas ce systeme de
    // style.
    return undefined
  }
}
