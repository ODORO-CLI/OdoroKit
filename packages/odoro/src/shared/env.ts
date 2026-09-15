/**
 * Loading of the environment files.
 *
 * ## Why this is written here rather than imported
 *
 * Parsing a `.env` file fits in about a hundred lines. The binary is downloaded
 * on every project creation: adding a dependency for that job would cost more
 * than writing it.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

/**
 * An assignment line, as an environment file writes it.
 *
 * The name accepts the `export KEY=` form: files shared with a shell often
 * carry it, and refusing it would break a line that works elsewhere.
 */
const LINE = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/

/** A reference to another variable, inside a value. */
const REFERENCE = /\$\{([A-Za-z_][A-Za-z0-9_]*)\}|\$([A-Za-z_][A-Za-z0-9_]*)/g

/** What reading a file produced. */
export interface ParsedEnv {
  /** The assignments, in file order. */
  readonly values: Record<string, string>
  /**
   * The keys whose value was between single quotes.
   *
   * They escape expansion: that is all this form promises, and it is what makes
   * it usable for a secret containing a `$`.
   */
  readonly literals: ReadonlySet<string>
}

/**
 * Reads the content of an environment file.
 *
 * ## The quotes, and what they change
 *
 * Between double quotes, the value interprets escapes — `\n`, `\t` — and
 * references to other variables. Between single quotes, it is taken literally:
 * that is the only way to write a password containing a `$`. Without quotes, it
 * stops at the first `#` preceded by a space, which opens a comment.
 *
 * ## Values spanning several lines
 *
 * A value opened by a quote runs until the closing quote, even several lines
 * below. That is the shape private keys have, and stopping at the first newline
 * would not have kept a quarter of one — without reporting anything, since the
 * rest of the file keeps parsing.
 *
 * @param text Raw content of the file.
 *
 * @example
 * parseEnvDetailed('ODORO_API=https://api.odoro.dev # prod').values
 * // { ODORO_API: 'https://api.odoro.dev' }
 */
export function parseEnvDetailed(text: string): ParsedEnv {
  const values: Record<string, string> = {}
  const literals = new Set<string>()
  const lines = text.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index]
    if (line === undefined) continue
    if (line.trim() === '' || line.trimStart().startsWith('#')) continue

    const found = LINE.exec(line)
    const key = found?.[1]
    if (key === undefined) continue

    const raw = (found?.[2] ?? '').trim()
    const quote = raw[0]

    if (quote !== '"' && quote !== "'" && quote !== '`') {
      const comment = raw.search(/\s#/)
      values[key] = comment === -1 ? raw : raw.slice(0, comment).trimEnd()
      continue
    }

    let body = raw.slice(1)

    // A single-line value closes on itself; otherwise we keep reading until the
    // closing quote, or until the end of the file.
    while (body.length === 0 || !body.endsWith(quote)) {
      const next = lines[index + 1]
      if (next === undefined) break
      index += 1
      body = `${body}\n${next}`
    }

    const content = body.endsWith(quote) ? body.slice(0, -1) : body

    if (quote === "'") {
      values[key] = content
      literals.add(key)
      continue
    }

    values[key] = content
      .replace(/\\n/g, '\n')
      .replace(/\\r/g, '\r')
      .replace(/\\t/g, '\t')
      .replace(/\\"/g, '"')
      .replace(/\\\\/g, '\\')
  }

  return { values, literals }
}

/**
 * Reads the content of an environment file.
 *
 * @param text Raw content of the file.
 * @returns The assignments, in file order.
 *
 * @example
 * parseEnv('ODORO_API=https://api.odoro.dev # prod')
 * // { ODORO_API: 'https://api.odoro.dev' }
 */
export function parseEnv(text: string): Record<string, string> {
  return parseEnvDetailed(text).values
}

/**
 * Replaces the `$OTHER` and `${OTHER}` references by their value.
 *
 * Where the value comes from matters little: a variable already present in the
 * process environment is a valid reference, and it is even the common case —
 * `ODORO_API=$HOST/v1` on a deployment server.
 *
 * @param literals The keys to leave untouched.
 */
function expand(
  values: Record<string, string>,
  environment: Record<string, string | undefined>,
  literals: ReadonlySet<string>,
): Record<string, string> {
  const rendered: Record<string, string> = {}

  for (const [key, value] of Object.entries(values)) {
    if (literals.has(key)) {
      rendered[key] = value
      continue
    }

    rendered[key] = value.replace(REFERENCE, (whole, braced?: string, bare?: string) => {
      const name = braced ?? bare
      if (name === undefined) return whole
      return rendered[name] ?? values[name] ?? environment[name] ?? ''
    })
  }

  return rendered
}

/**
 * The files read, from least to most priority.
 *
 * `.env` carries what holds everywhere and is versioned; `.env.local` what is
 * specific to the machine and is never versioned; the two per-mode variants
 * come next, in the same order.
 */
export function envFilesFor(mode: string): string[] {
  return ['.env', '.env.local', `.env.${mode}`, `.env.${mode}.local`]
}

/** What loading produced. */
export interface LoadedEnv {
  /** Every value read, prefixed or not. */
  readonly all: Record<string, string>
  /** The only values exposed to the client, the prefixed ones. */
  readonly client: Record<string, string>
  /** The files actually read, in order. */
  readonly files: readonly string[]
}

/**
 * Loads the environment files of a project.
 *
 * ## What wins, and why
 *
 * A variable already present in the process environment is **never** overwritten
 * by a file. That is the only rule that makes a deployment predictable: a `.env`
 * versioned by mistake must not take precedence over the value the host
 * injects.
 *
 * ## What goes to the browser
 *
 * The prefix alone. A variable without the prefix stays readable by the command
 * — a database token, a server API key — and does not leave the machine:
 * everything that enters `import.meta.env` ends up in clear text in the
 * published bundle, and nothing catches it afterwards.
 *
 * @param directory Directory where the files are looked up.
 * @param mode Build mode (`development`, `production`, or your own).
 * @param prefix Prefix of the variables exposed to the client.
 *
 * @example
 * const env = await loadEnv('/project', 'production', 'ODORO_')
 * env.client // { ODORO_API: 'https://api.odoro.dev' }
 */
export async function loadEnv(
  directory: string,
  mode: string,
  prefix: string,
): Promise<LoadedEnv> {
  const stacked: Record<string, string> = {}
  const literals = new Set<string>()
  const files: string[] = []

  for (const name of envFilesFor(mode)) {
    const path = join(directory, name)
    if (!existsSync(path)) continue
    files.push(name)

    const read = parseEnvDetailed(await readFile(path, 'utf8'))
    Object.assign(stacked, read.values)

    // A file with more priority also decides the form: a value rewritten
    // without single quotes becomes expandable again.
    for (const key of Object.keys(read.values)) {
      if (read.literals.has(key)) literals.add(key)
      else literals.delete(key)
    }
  }

  const all = expand(stacked, process.env, literals)

  // The process environment passes over the top again: it has the last word.
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && key in all) all[key] = value
  }

  const client: Record<string, string> = {}
  for (const [key, value] of Object.entries(all)) {
    if (key.startsWith(prefix)) client[key] = value
  }
  // A prefixed variable set directly in the environment — the continuous
  // integration case — counts as much as a line in a file.
  for (const [key, value] of Object.entries(process.env)) {
    if (value !== undefined && key.startsWith(prefix)) client[key] = value
  }

  return { all, client, files }
}

/**
 * Assembles the values the client code reads in `import.meta.env`.
 *
 * @example
 * clientEnv({ ODORO_API: 'x' }, 'production', '/')
 * // { MODE: 'production', DEV: false, PROD: true, BASE_URL: '/', ODORO_API: 'x' }
 */
export function clientEnv(
  variables: Readonly<Record<string, string>>,
  mode: string,
  base: string,
): Record<string, string | boolean> {
  return {
    MODE: mode,
    // `DEV` and `PROD` cannot be deduced from the mode name alone: a `staging`
    // mode builds as production and must behave like it.
    DEV: mode === 'development',
    PROD: mode !== 'development',
    BASE_URL: base,
    ...variables,
  }
}
