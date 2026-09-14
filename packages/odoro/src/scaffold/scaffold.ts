/**
 * Copie et adaptation d'un template vers le dossier du nouveau projet.
 *
 * @module
 */

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import {
  MODULES_PAR_DEFAUT,
  gardeLesRoutes,
  paquetsDe,
  variantesDe,
  type ModuleId,
} from './modules.js'
import { targetFileName, templatesRoot } from './utils.js'

/**
 * Le dossier des variantes, a la racine d'un gabarit.
 *
 * Il n'est jamais copie : ses fichiers sont poses **par-dessus** le projet une
 * fois le gabarit ecrit, et seulement ceux de la variante retenue. Le copier
 * livrerait les trois versions de `App.tsx` dans le projet genere.
 *
 * Le nom commence par un tiret bas comme les autres fichiers pointes du
 * gabarit, mais pour une raison differente : ici il signale au copieur qu'il
 * faut passer son chemin.
 */
const DOSSIER_VARIANTES = '_variantes'

/** Les paquets de la famille que le createur sait poser ou retirer. */
const PAQUETS_OPTIONNELS = ['@odoro-cli/libs', '@odoro-cli/icons', '@odoro-cli/engine']

/**
 * La version de la CLI qui tourne.
 *
 * Lue depuis son propre manifeste plutot que figee : une constante recopiee
 * serait juste le jour ou on l'ecrit, et fausse au premier changement de
 * version — c'est-a-dire des la publication suivante.
 *
 * ## Le chemin se cherche, il ne se compte pas
 *
 * `../../package.json` depuis `import.meta.url` est juste depuis les sources
 * et faux une fois empaquete : le module vit alors dans `dist/`, un niveau
 * plus haut. Le repli se declenchait donc systematiquement, et les projets
 * echafaudes recevaient `latest` — ce qui fonctionne aujourd'hui et
 * installerait une future version majeure demain.
 *
 * Le dossier des gabarits est a la racine du paquet, et `templatesRoot`
 * sait deja le trouver depuis les deux emplacements. Son parent est donc la
 * racine cherchee, sans compter de niveaux.
 */
function cliVersion(): string {
  try {
    const manifeste = join(dirname(templatesRoot()), 'package.json')
    const { version } = JSON.parse(readFileSync(manifeste, 'utf8')) as { version: string }
    return version
  } catch {
    // Un echafaudage doit aboutir meme si le manifeste est introuvable.
    // `latest` est plus honnete qu'une version inventee : npm resoudra ce qui
    // existe. Ce repli ne doit plus se declencher, et un essai le verifie.
    return 'latest'
  }
}

/** Ce qu'il faut faire d'un dossier cible deja occupe. */
export type OverwriteMode = 'ecraser' | 'fusionner'

/** Options de l'echafaudage. */
export interface ScaffoldOptions {
  /** Dossier de destination, absolu. */
  target: string
  /** Nom du template a copier. */
  template: string
  /** Nom du paquet ecrit dans le `package.json` genere. */
  packageName: string
  /** Conduite a tenir si le dossier cible n'est pas vide. */
  overwrite?: OverwriteMode
  /** Racine des templates. Injectable pour les tests. */
  root?: string
  /**
   * Version a poser sur les paquets Odoro du manifeste.
   *
   * Par defaut celle de la CLI qui echafaude — c'est ce qui garantit que le
   * projet genere demande exactement ce qui vient d'etre publie.
   */
  version?: string
  /**
   * Les modules retenus a la creation.
   *
   * La selection doit avoir ete passee par `resoudre` : l'echafaudeur applique
   * ce qu'on lui donne et ne corrige rien, pour qu'un refus soit explique la ou
   * il est decide plutot qu'ici, en silence.
   *
   * Par defaut, ceux que le catalogue coche.
   */
  modules?: readonly ModuleId[]
}

/** Resultat d'un echafaudage. */
export interface ScaffoldResult {
  /** Chemins relatifs des fichiers ecrits. */
  readonly files: readonly string[]
}

/** Copie recursivement un dossier de template, en renommant les fichiers pointes. */
async function copyDirectory(
  from: string,
  to: string,
  written: string[],
  prefix = '',
): Promise<void> {
  await mkdir(to, { recursive: true })

  for (const entry of await readdir(from, { withFileTypes: true })) {
    // A la racine du gabarit seulement : un projet a parfaitement le droit
    // d'avoir un dossier de ce nom plus bas dans son arborescence.
    if (prefix === '' && entry.name === DOSSIER_VARIANTES) continue

    const source = join(from, entry.name)
    const name = targetFileName(entry.name)
    const destination = join(to, name)
    const relativePath = prefix === '' ? name : `${prefix}/${name}`

    if (entry.isDirectory()) {
      await copyDirectory(source, destination, written, relativePath)
      continue
    }

    await copyFile(source, destination)
    written.push(relativePath)
  }
}

/** Les paquets de la famille, dont la version suit celle de la CLI. */
function isOdoroPackage(name: string): boolean {
  return name === 'odoro' || name.startsWith('@odoro-cli/')
}

/**
 * Aligne les paquets Odoro du manifeste sur une version donnee.
 *
 * ## Pourquoi ce n'est pas ecrit dans le gabarit
 *
 * Les gabarits portaient `^0.0.0`, la version d'avant la premiere publication.
 * Un caret sur `0.0.x` est le plus etroit de tous — `^0.0.0` ne correspond
 * qu'a `0.0.0` — donc **chaque projet echafaude echouait a l'installation**,
 * avec une erreur de resolution que personne n'aurait rattachee au gabarit.
 *
 * La version se **deduit** donc de celle de la CLI qui echafaude. Elle ne peut
 * plus deriver : c'est le meme paquet qui ecrit et qui sera installe.
 */
function alignOdoroVersions(
  manifest: Record<string, unknown>,
  version: string,
): Record<string, unknown> {
  const aligned = { ...manifest }

  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = aligned[field]
    if (typeof deps !== 'object' || deps === null) continue

    const next: Record<string, string> = {}
    for (const [name, range] of Object.entries(deps as Record<string, string>)) {
      next[name] = isOdoroPackage(name)
        ? version === 'latest'
          ? 'latest'
          : `^${version}`
        : range
    }
    aligned[field] = next
  }

  return aligned
}

/**
 * Ajuste les dependances du manifeste sur les modules retenus.
 *
 * Les gabarits declarent le cas complet ; ce qui n'a pas ete coche en est
 * **retire**, et ce qui l'a ete y est **ajoute** s'il manquait. Les deux sens
 * comptent : un gabarit ne peut pas porter d'avance toutes les combinaisons, et
 * n'en porter aucune obligerait a reecrire la liste entiere ici.
 *
 * `@odoro-cli/server` n'est jamais touche : il ne vient pas d'une case a
 * cocher mais du gabarit choisi, et le retirer laisserait un serveur sans son
 * socle.
 */
function ajusterModules(
  manifest: Record<string, unknown>,
  modules: readonly ModuleId[],
): Record<string, unknown> {
  const voulus = new Set(paquetsDe(modules))
  const deps = { ...((manifest['dependencies'] ?? {}) as Record<string, string>) }

  for (const paquet of PAQUETS_OPTIONNELS) {
    if (voulus.has(paquet)) deps[paquet] ??= 'latest'
    else delete deps[paquet]
  }

  // Les cles sont triees : sans cela l'ajout d'un paquet le poserait en fin de
  // liste, et deux projets aux memes modules auraient des manifestes differents.
  return {
    ...manifest,
    dependencies: Object.fromEntries(
      Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)),
    ),
  }
}

/**
 * Pose les fichiers d'une variante par-dessus le projet.
 *
 * Ils portent deja le chemin ou ils doivent atterrir — `src/App.tsx` pour le
 * gabarit simple, `client/src/App.tsx` pour celui du serveur — si bien qu'il
 * n'y a rien a traduire : on copie a l'identique.
 *
 * @throws {Error} Si la variante demandee n'existe pas dans le gabarit.
 */
async function poserVariante(
  source: string,
  target: string,
  nom: string,
): Promise<readonly string[]> {
  const racine = join(source, DOSSIER_VARIANTES, nom)
  if (!existsSync(racine)) {
    throw new Error(`[odoro] Variante de gabarit introuvable : "${nom}".`)
  }

  const poses: string[] = []
  await copyDirectory(racine, target, poses)
  return poses
}

/**
 * Reecrit le manifeste genere : le nom du projet, et les versions Odoro.
 *
 * La mise en forme du reste du fichier est preservee — les cles existent deja
 * dans le gabarit, et les reaffecter conserve leur position.
 */
async function renamePackage(
  target: string,
  packageName: string,
  version: string,
  modules: readonly ModuleId[],
): Promise<void> {
  const file = join(target, 'package.json')
  if (!existsSync(file)) return

  const manifest = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>
  // Les modules d'abord, les versions ensuite : un paquet qu'on vient
  // d'ajouter doit recevoir la version de la CLI comme les autres, plutot que
  // de rester sur le `latest` qui lui sert de valeur de depart.
  const ajuste = ajusterModules({ ...manifest, name: packageName }, modules)
  const renamed = alignOdoroVersions(ajuste, version)
  await writeFile(file, `${JSON.stringify(renamed, null, 2)}\n`, 'utf8')
}

/**
 * Copie un template vers le dossier cible et l'adapte au projet.
 *
 * @throws {Error} Si le template demande n'existe pas.
 *
 * @example
 * await scaffold({
 *   target: '/tmp/mon-site',
 *   template: 'react-ts',
 *   packageName: 'mon-site',
 * })
 */
export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const root = options.root ?? templatesRoot()
  const source = join(root, options.template)

  if (!existsSync(source)) {
    throw new Error(`[odoro] Template inconnu : "${options.template}".`)
  }

  if (options.overwrite === 'ecraser' && existsSync(options.target)) {
    // Le dossier lui-meme est conserve : l'utilisateur peut s'y trouver, et
    // le supprimer sous ses pieds laisserait son terminal dans un dossier mort.
    for (const entry of await readdir(options.target)) {
      if (entry === '.git') continue
      await rm(join(options.target, entry), { recursive: true, force: true })
    }
  }

  const modules = options.modules ?? MODULES_PAR_DEFAUT

  const files: string[] = []
  await copyDirectory(source, options.target, files)

  // `router.tsx` est le seul fichier qui nomme la dependance de routage.
  // Sans routeur il n'est importe par rien, et son propre import ne
  // resoudrait pas : il part avec.
  if (!gardeLesRoutes(modules)) {
    for (const fichier of ['src/router.tsx', 'client/src/router.tsx']) {
      await rm(join(options.target, fichier), { force: true })
    }
  }

  // Dans l'ordre rendu : une variante posee plus tard ecrase ce qu'une
  // precedente aurait ecrit au meme chemin.
  const poses: string[] = []
  for (const variante of variantesDe(modules)) {
    poses.push(...(await poserVariante(source, options.target, variante)))
  }

  await renamePackage(
    options.target,
    options.packageName,
    options.version ?? cliVersion(),
    modules,
  )

  // Ce que la variante a pose remplace un fichier deja compte : l'annoncer
  // deux fois gonflerait le nombre affiche a la fin de la creation.
  const retires = new Set(['src/router.tsx', 'client/src/router.tsx'])
  const listes = new Set([
    ...files.filter((f) => gardeLesRoutes(modules) || !retires.has(f)),
    ...poses,
  ])

  return { files: [...listes].sort() }
}
