/**
 * Ecriture transactionnelle des fichiers d'un composant.
 *
 * ## Pourquoi tout ou rien
 *
 * Une installation ecrit plusieurs fichiers, parfois pour plusieurs entrees a
 * la fois. Si la troisieme ecriture echoue — disque plein, permission refusee,
 * interruption — une ecriture naive laisse un projet a moitie servi : deux
 * fichiers presents, un manquant, et rien pour dire lesquels. L'utilisateur ne
 * peut ni continuer ni revenir en arriere, parce qu'il ne sait pas ce qui a ete
 * touche.
 *
 * L'ecriture se fait donc en deux temps. D'abord chaque fichier est ecrit a
 * cote de sa destination, sous un nom temporaire ; a ce stade, rien
 * d'observable n'a change. Ensuite seulement les fichiers sont mis en place,
 * par renommage. Si quoi que ce soit echoue avant la mise en place, les
 * temporaires sont effaces et le projet est exactement dans l'etat ou on l'a
 * trouve.
 *
 * ## Ce que cette garantie ne couvre pas
 *
 * Le renommage lui-meme n'est pas atomique **entre plusieurs fichiers** : le
 * systeme n'offre rien de tel. Si le second renommage echoue, le premier a
 * deja eu lieu. Les contenus precedents sont donc gardes en memoire et remis en
 * place — ce qui reste une reparation, pas une transaction.
 *
 * C'est acceptable ici : le renommage d'un fichier deja ecrit sur le meme
 * volume echoue tres rarement, alors que l'ecriture elle-meme — celle qui
 * remplit le disque et rencontre les permissions — est integralement couverte.
 * Le compromis est nomme plutot que sous-entendu.
 *
 * @module
 */

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** Ce qu'il adviendra d'un fichier. */
export type FileAction = 'creation' | 'remplacement' | 'inchange'

/** Une ecriture prevue. */
export interface PlannedWrite {
  /** Chemin dans le projet, relatif a sa racine, en barres obliques. */
  readonly path: string
  /** Contenu a ecrire. */
  readonly content: string
  /** Ce que l'ecriture va faire. */
  readonly action: FileAction
  /** Identifiant de l'entree de registre a l'origine de ce fichier. */
  readonly owner: string
}

/**
 * Prepare une ecriture en la comparant a ce qui est deja sur le disque.
 *
 * Un fichier dont le contenu est identique est marque `inchange` plutot que
 * `remplacement` : le reecrire changerait sa date de modification, ce que les
 * outils de compilation surveillent, pour un resultat rigoureusement identique.
 *
 * @example
 * const write = await planWrite(root, 'src/odoro/hooks/usePoster.ts', source, 'hooks/use-poster')
 */
export async function planWrite(
  root: string,
  path: string,
  content: string,
  owner: string,
): Promise<PlannedWrite> {
  let existing: string | null = null
  try {
    existing = await readFile(join(root, path), 'utf8')
  } catch {
    existing = null
  }

  const action: FileAction =
    existing === null
      ? 'creation'
      : existing.replaceAll('\r\n', '\n') === content.replaceAll('\r\n', '\n')
        ? 'inchange'
        : 'remplacement'

  return { path, content, action, owner }
}

/** Ce qu'a fait une application de plan. */
export interface ApplyReport {
  /** Fichiers reellement ecrits. */
  readonly written: readonly string[]
  /** Fichiers laisses tels quels parce qu'identiques. */
  readonly skipped: readonly string[]
}

/** Suffixe des fichiers temporaires. */
const PENDING = '.odoro-en-cours'

/**
 * Applique un plan d'ecriture, entierement ou pas du tout.
 *
 * @param root Racine du projet.
 * @param plan Ecritures prevues. Celles marquees `inchange` sont ignorees.
 *
 * @throws Si l'ecriture echoue. Le projet est alors laisse dans son etat
 * initial, et l'erreur d'origine est propagee telle quelle : la masquer
 * derriere un message generique retirerait la seule information utile.
 *
 * @example
 * const report = await applyPlan(root, plan)
 */
export async function applyPlan(
  root: string,
  plan: readonly PlannedWrite[],
): Promise<ApplyReport> {
  const todo = plan.filter((entry) => entry.action !== 'inchange')
  const skipped = plan.filter((entry) => entry.action === 'inchange').map((e) => e.path)

  /** Temporaires ecrits, a effacer si la premiere phase echoue. */
  const pending: string[] = []
  /** Contenus precedents, pour reparer si la mise en place echoue. */
  const previous = new Map<string, string | null>()

  try {
    // Premiere phase : tout ecrire a cote. Rien d'observable ne change.
    for (const entry of todo) {
      const target = join(root, entry.path)
      await mkdir(dirname(target), { recursive: true })

      if (entry.action === 'remplacement') {
        previous.set(entry.path, await readFile(target, 'utf8'))
      } else {
        previous.set(entry.path, null)
      }

      const temporary = `${target}${PENDING}`
      await writeFile(temporary, entry.content, 'utf8')
      pending.push(temporary)
    }
  } catch (cause) {
    await Promise.all(pending.map((file) => rm(file, { force: true })))
    throw cause
  }

  const placed: string[] = []
  try {
    // Seconde phase : mise en place.
    for (const entry of todo) {
      const target = join(root, entry.path)
      await rename(`${target}${PENDING}`, target)
      placed.push(entry.path)
    }
  } catch (cause) {
    await restore(root, placed, previous)
    await Promise.all(pending.map((file) => rm(file, { force: true })))
    throw cause
  }

  return { written: todo.map((entry) => entry.path), skipped }
}

/**
 * Remet les fichiers deja places dans leur etat precedent.
 *
 * Les echecs de reparation sont ignores volontairement : on est deja dans le
 * chemin d'erreur, et masquer la cause initiale derriere une erreur de
 * nettoyage rendrait le probleme reel introuvable.
 */
async function restore(
  root: string,
  placed: readonly string[],
  previous: ReadonlyMap<string, string | null>,
): Promise<void> {
  for (const path of placed) {
    const target = join(root, path)
    const before = previous.get(path)
    try {
      if (before === null || before === undefined) {
        await rm(target, { force: true })
      } else {
        await writeFile(target, before, 'utf8')
      }
    } catch {
      // Voir la note ci-dessus.
    }
  }
}
