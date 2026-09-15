/**
 * The user configuration, and the token it holds.
 *
 * ## Why the token does not live in the project
 *
 * A platform token grants access to the administration of a whole fleet. Stored
 * in the project, it ends up versioned — not through negligence, but because a
 * `git add .` asks nobody's opinion, and a configuration file looks like
 * something one versions.
 *
 * Once pushed, a secret is to be **rotated**, not removed from a history. The
 * token therefore lives in the configuration directory of the user, outside any
 * repository.
 *
 * ## The file permissions, and what can be promised about them
 *
 * On a Unix-like system, the file is created as `0600`: readable by its owner
 * alone. On Windows, POSIX permissions have no exact equivalent and `chmod` has
 * no real effect — better to say so than to let one believe in a protection
 * that does not exist.
 *
 * ## One file per machine, never synchronised
 *
 * The path follows the conventions of the system, which keeps it away from the
 * directories synchronisation tools pick up by default. A token that ends up on
 * three machines through a shared folder has tripled its exposure without
 * anybody having decided it.
 *
 * @module
 */

import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir, platform } from 'node:os'
import { dirname, join } from 'node:path'

/** What the user configuration keeps. */
export interface UserConfig {
  /** Platform token, per API root. */
  readonly tokens?: Readonly<Record<string, string>>
  /** Root used by default. */
  readonly defaultApiUrl?: string
}

/**
 * Where the configuration lives.
 *
 * `XDG_CONFIG_HOME` first: it is the variable that lets someone decide where
 * their configurations go, and ignoring it would amount to imposing a choice
 * they explicitly made otherwise.
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

/** The only access to the process from this module. */
function processEnv(): NodeJS.ProcessEnv {
  return process.env
}

/** Reads the configuration. Returns an empty object when it does not exist. */
export async function readUserConfig(path = configPath()): Promise<UserConfig> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as UserConfig
  } catch {
    // Absent, unreadable or corrupt: in all three cases, we start again from an
    // empty configuration rather than prevent every command from working.
    return {}
  }
}

/** What the write reports. */
export interface WriteReport {
  readonly path: string
  /**
   * Could the restrictive permissions be set?
   *
   * False on Windows, where the equivalent does not exist. The caller must say
   * so to the user rather than let them believe in an absent protection.
   */
  readonly restricted: boolean
}

/** Writes the configuration, reserving it to its owner. */
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

/** Stores a token for an API root. */
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
 * Finds the token of a root.
 *
 * The environment variable wins: that is what lets a continuous integration
 * provide a token without writing a file, and someone use another one for the
 * duration of a command.
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

/** Removes a token. */
export async function forgetToken(
  apiUrl: string,
  path = configPath(),
): Promise<WriteReport> {
  const current = await readUserConfig(path)
  const { [apiUrl]: _removed, ...rest } = current.tokens ?? {}

  return await writeUserConfig({ ...current, tokens: rest }, path)
}
