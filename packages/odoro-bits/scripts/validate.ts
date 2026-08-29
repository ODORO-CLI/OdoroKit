/**
 * Validation du registre.
 *
 * Echoue si une entree est mal formee, si un fichier declare n'existe pas, si
 * une dependance de registre pointe dans le vide, ou si le graphe contient un
 * cycle.
 *
 * ## Pourquoi c'est un script et pas seulement un test
 *
 * Un test rend un rapport concu pour quelqu'un qui vient d'ecrire du code. Ce
 * script, lui, tourne aussi avant la publication, dans un contexte ou personne
 * ne lit la sortie tant qu'elle est verte. Elle est donc courte quand tout va
 * bien, et exhaustive quand ce n'est pas le cas.
 *
 * @module
 */

import { describeProblem, toCatalogue, validateCatalogue } from 'odoro/registry'

import { collectRegistry, displayPath, isMainModule } from './collect.js'
import { checkContract } from './contract.js'

/** Ce que rend une validation. */
export interface ValidationReport {
  /** Problemes trouves, dans l'ordre. Vide si le registre est sain. */
  readonly problems: readonly string[]
  /** Nombre d'entrees lues. Nul si la lecture elle-meme a echoue. */
  readonly count: number
}

/**
 * Valide un registre entier.
 *
 * @param root Racine du registre.
 *
 * @example
 * const report = await validateRegistry('registry')
 * if (report.problems.length > 0) process.exitCode = 1
 */
export async function validateRegistry(root: string): Promise<ValidationReport> {
  const collected = await collectRegistry(root)

  // Le graphe n'est resolu que si toutes les entrees sont lisibles : le
  // resoudre sur un catalogue incomplet inventerait des dependances
  // introuvables qui ne seraient que la consequence de la premiere erreur.
  if (!collected.ok) return { problems: collected.problems, count: 0 }

  const problems = validateCatalogue(toCatalogue(collected.entries)).map(describeProblem)

  // Le contrat de personnalisation est verifie apres le graphe : une entree
  // dont la dependance manque a de bonnes chances d'etre incomplete, et les
  // manquements au contrat qu'elle produirait seraient du bruit par-dessus la
  // vraie erreur.
  if (problems.length === 0) {
    for (const entry of collected.entries) {
      problems.push(...checkContract(entry, entry.sources).map((issue) => issue.message))
    }
  }

  return { problems, count: collected.entries.length }
}

/** Point d'entree du script. */
async function main(): Promise<void> {
  const root = process.argv[2] ?? 'registry'
  const { problems, count } = await validateRegistry(root)

  if (problems.length > 0) {
    console.error(`Registre invalide — ${problems.length} probleme(s) :\n`)
    for (const problem of problems) console.error(`  · ${problem}`)
    console.error('')
    process.exitCode = 1
    return
  }

  console.log(`Registre valide — ${count} entree(s) dans ${displayPath(root)}.`)
}

if (isMainModule(import.meta.url)) await main()
