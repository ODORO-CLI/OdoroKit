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
 * ## Un contrat, pas un import
 *
 * Le moteur ne sait du generateur qu'une chose : il rend les utilitaires
 * correspondant a un ensemble de classes. Tout paquet qui expose cette fonction
 * sous ce nom fait l'affaire — la bibliotheque maison n'est qu'un fournisseur
 * parmi d'autres possibles.
 *
 * @module
 */

import { createRequire } from 'node:module'
import { join } from 'node:path'
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

/** Le paquet consulte, et l'export attendu. */
const FOURNISSEUR = '@odoro-cli/libs/generateur'

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
    // `createRequire` sur un chemin du projet : c'est la seule facon de
    // resoudre comme le ferait le projet lui-meme, y compris a travers les
    // liens de pnpm.
    const exiger = createRequire(join(root, 'package.json'))
    const chemin = exiger.resolve(FOURNISSEUR)

    const module_ = (await import(pathToFileURL(chemin).href)) as Partial<FournisseurCss>

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
