/**
 * Le fichier `odoro.json` d'un projet.
 *
 * ## Pourquoi le projet garde une trace de ce qu'il a recu
 *
 * Les composants sont copies : une fois ecrits, rien ne les distingue du reste
 * du code. C'est le but. Mais cela retire aussi toute possibilite de repondre a
 * trois questions que l'on se pose forcement au bout de quelques mois : qu'est-
 * ce qui vient du registre, est-ce que je l'ai modifie depuis, et est-ce que la
 * version amont a bouge ?
 *
 * Un simple inventaire ne suffit pas pour la deuxieme. C'est pourquoi
 * l'empreinte de chaque fichier **tel qu'il a ete livre** est conservee : elle
 * seule permet a `odoro diff` de distinguer « vous avez retouche ce fichier »
 * de « le registre a change ». Sans elle, les deux cas se ressemblent
 * exactement.
 *
 * L'empreinte n'est pas une signature : elle ne protege de rien, elle ne fait
 * que dater. C'est un journal, pas un verrou.
 *
 * @module
 */

import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import * as z from 'zod/mini'

/** Nom du fichier de configuration, a la racine du projet. */
export const CONFIG_FILE = 'odoro.json'

/** Un fichier livre par le registre. */
const trackedFileSchema = z.object({
  /** Chemin dans le projet, relatif a sa racine, en barres obliques. */
  path: z.string().check(z.minLength(1)),
  /** Empreinte du contenu **tel qu'il a ete livre**. */
  hash: z.string().check(z.minLength(1)),
})

/** Une entree installee. */
const installedSchema = z.object({
  /** Date d'installation, en ISO 8601. */
  installedAt: z.string().check(z.minLength(1)),
  /** Fichiers ecrits par cette entree. */
  files: z.array(trackedFileSchema),
})

/** Emplacements d'ecriture, par categorie de registre. */
const aliasesSchema = z.object({
  /**
   * Prefixe d'import employe dans le code ecrit, sans barre finale.
   * Par exemple `@/components/odoro`.
   */
  import: z.string().check(z.minLength(1)),
  /**
   * Dossier correspondant sur le disque, relatif a la racine du projet.
   * Par exemple `src/components/odoro`.
   */
  directory: z.string().check(z.minLength(1)),
})

/** Forme du fichier `odoro.json`. */
const projectSchema = z.object({
  /** Version du format, pour que la CLI sache si elle sait lire. */
  version: z._default(z.literal(1), 1),
  /** Adresse du registre : une URL, ou un chemin local pour le developper. */
  registry: z.string().check(z.minLength(1)),
  /** Ou ecrire, et sous quel prefixe importer. */
  aliases: aliasesSchema,
  /** Ce qui a ete installe, indexe par identifiant de registre. */
  installed: z._default(z.record(z.string(), installedSchema), {}),
})

/** Configuration d'un projet consommant le registre. */
export type ProjectConfig = z.infer<typeof projectSchema>

/** Une entree installee, telle qu'elle est notee dans `odoro.json`. */
export type InstalledEntry = z.infer<typeof installedSchema>

/** Un fichier livre, avec son empreinte de livraison. */
export type TrackedFile = z.infer<typeof trackedFileSchema>

/**
 * Empreinte d'un contenu de fichier.
 *
 * Les fins de ligne sont normalisees avant le calcul : sous Windows, git peut
 * convertir a la lecture comme a l'ecriture, et une empreinte qui changerait
 * selon le systeme signalerait une modification qui n'a pas eu lieu.
 *
 * @example
 * fingerprint('const a = 1\n') // 'a1b2c3…'
 */
export function fingerprint(content: string): string {
  const normalised = content.replaceAll('\r\n', '\n')
  return createHash('sha256').update(normalised, 'utf8').digest('hex').slice(0, 16)
}

/** Chemin du fichier de configuration d'un projet. */
export function configPath(root: string): string {
  return join(root, CONFIG_FILE)
}

/** Ce que rend une lecture de configuration. */
export type LoadResult =
  | { readonly ok: true; readonly config: ProjectConfig }
  | {
      readonly ok: false
      readonly reason: 'absent' | 'invalide'
      readonly problems: string[]
    }

/**
 * Lit le `odoro.json` d'un projet.
 *
 * L'absence du fichier n'est pas traitee comme une erreur de meme nature qu'un
 * fichier corrompu : le premier cas se resout par `odoro init`, le second
 * demande une correction a la main. Les deux messages doivent donc differer.
 *
 * @example
 * const loaded = await loadProject(process.cwd())
 * if (!loaded.ok && loaded.reason === 'absent') console.error('Lancez `odoro init`.')
 */
export async function loadProject(root: string): Promise<LoadResult> {
  let raw: string
  try {
    raw = await readFile(configPath(root), 'utf8')
  } catch {
    return { ok: false, reason: 'absent', problems: [] }
  }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    return {
      ok: false,
      reason: 'invalide',
      problems: [`JSON illisible — ${(error as Error).message}`],
    }
  }

  const parsed = z.safeParse(projectSchema, value)
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'invalide',
      problems: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || CONFIG_FILE} : ${issue.message}`,
      ),
    }
  }

  return { ok: true, config: parsed.data }
}

/**
 * Ecrit le `odoro.json` d'un projet.
 *
 * Les entrees installees sont triees : sans cela, l'ordre depend de celui des
 * installations et chaque `odoro add` produirait un diff illisible dans le
 * suivi de version.
 *
 * @example
 * await saveProject(root, { ...config, installed })
 */
export async function saveProject(root: string, config: ProjectConfig): Promise<void> {
  const installed = Object.fromEntries(
    Object.entries(config.installed).sort(([a], [b]) => a.localeCompare(b)),
  )
  const ordered = { ...config, installed }
  await writeFile(configPath(root), `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
}
