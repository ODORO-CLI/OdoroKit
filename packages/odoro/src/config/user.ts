/**
 * La configuration de l'utilisateur, et le jeton qu'elle contient.
 *
 * ## Pourquoi le jeton ne vit pas dans le projet
 *
 * Un jeton de plateforme donne acces a l'administration de tout un parc. Range
 * dans le projet, il finit versionne — pas par negligence, mais parce qu'un
 * `git add .` ne demande l'avis de personne, et qu'un fichier de configuration
 * ressemble a quelque chose qu'on versionne.
 *
 * Une fois pousse, un secret est a **faire tourner**, pas a retirer d'un
 * historique. Le jeton vit donc dans le dossier de configuration de
 * l'utilisateur, hors de tout depot.
 *
 * ## Les droits du fichier, et ce qu'on peut en promettre
 *
 * Sur un systeme de type Unix, le fichier est cree en `0600` : lisible par son
 * proprietaire seul. Sur Windows, les permissions POSIX n'ont pas d'equivalent
 * exact et `chmod` est sans effet reel — le dire plutot que de laisser croire
 * a une protection qui n'existe pas.
 *
 * ## Un fichier par machine, jamais synchronise
 *
 * Le chemin suit les conventions du systeme, ce qui le tient a l'ecart des
 * dossiers que les outils de synchronisation reprennent par defaut. Un jeton
 * qui se retrouve sur trois machines par un dossier partage a triple sa
 * surface d'exposition sans que personne ne l'ait decide.
 *
 * @module
 */

import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir, platform } from 'node:os'
import { dirname, join } from 'node:path'

/** Ce que la configuration utilisateur retient. */
export interface UserConfig {
  /** Jeton de la plateforme, par racine d'API. */
  readonly tokens?: Readonly<Record<string, string>>
  /** Racine employee par defaut. */
  readonly defaultApiUrl?: string
}

/**
 * Ou vit la configuration.
 *
 * `XDG_CONFIG_HOME` d'abord : c'est la variable qui permet a quelqu'un de
 * decider ou ses configurations vont, et l'ignorer reviendrait a lui imposer
 * un choix qu'il a explicitement fait autrement.
 */
export function configPath(env: NodeJS.ProcessEnv = processEnv()): string {
  const xdg = env['XDG_CONFIG_HOME']
  if (xdg !== undefined && xdg.length > 0) return join(xdg, 'odoro', 'config.json')

  if (platform() === 'win32') {
    const appData = env['APPDATA']
    if (appData !== undefined && appData.length > 0) {
      return join(appData, 'odoro', 'config.json')
    }
  }

  return join(homedir(), '.config', 'odoro', 'config.json')
}

/** Le seul acces au processus de ce module. */
function processEnv(): NodeJS.ProcessEnv {
  return process.env
}

/** Lit la configuration. Rend un objet vide si elle n'existe pas. */
export async function readUserConfig(path = configPath()): Promise<UserConfig> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as UserConfig
  } catch {
    // Absente, illisible ou corrompue : dans les trois cas, on repart d'une
    // configuration vide plutot que d'empecher toute commande de fonctionner.
    return {}
  }
}

/** Ce que l'ecriture rapporte. */
export interface WriteReport {
  readonly path: string
  /**
   * Les droits restrictifs ont-ils pu etre poses ?
   *
   * Faux sur Windows, ou l'equivalent n'existe pas. L'appelant doit le dire a
   * l'utilisateur plutot que de laisser croire a une protection absente.
   */
  readonly restricted: boolean
}

/** Ecrit la configuration, en la reservant a son proprietaire. */
export async function writeUserConfig(
  config: UserConfig,
  path = configPath(),
): Promise<WriteReport> {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(config, null, 2)}\n`, 'utf8')

  if (platform() === 'win32') return { path, restricted: false }

  try {
    await chmod(path, 0o600)
    return { path, restricted: true }
  } catch {
    return { path, restricted: false }
  }
}

/** Range un jeton pour une racine d'API. */
export async function storeToken(
  apiUrl: string,
  token: string,
  path = configPath(),
): Promise<WriteReport> {
  const current = await readUserConfig(path)

  return await writeUserConfig(
    {
      ...current,
      tokens: { ...current.tokens, [apiUrl]: token },
      defaultApiUrl: current.defaultApiUrl ?? apiUrl,
    },
    path,
  )
}

/**
 * Retrouve le jeton d'une racine.
 *
 * La variable d'environnement l'emporte : c'est ce qui permet a une
 * integration continue de fournir un jeton sans ecrire de fichier, et a
 * quelqu'un d'en employer un autre le temps d'une commande.
 */
export async function findToken(
  apiUrl: string,
  path = configPath(),
  env: NodeJS.ProcessEnv = processEnv(),
): Promise<string | undefined> {
  const fromEnv = env['ODORO_TOKEN']
  if (fromEnv !== undefined && fromEnv.length > 0) return fromEnv

  const config = await readUserConfig(path)
  return config.tokens?.[apiUrl]
}

/** Retire un jeton. */
export async function forgetToken(
  apiUrl: string,
  path = configPath(),
): Promise<WriteReport> {
  const current = await readUserConfig(path)
  const { [apiUrl]: _removed, ...rest } = current.tokens ?? {}

  return await writeUserConfig({ ...current, tokens: rest }, path)
}
