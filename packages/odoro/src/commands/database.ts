/**
 * The database question, asked during scaffolding.
 *
 * ## Why it is asked here
 *
 * A server project without a database does nothing. Asking the question at
 * creation time avoids the moment when one discovers, at the first `npm run
 * dev`, that a step remains — and goes looking for it in a README.
 *
 * ## PostgreSQL, hosted, and nothing else
 *
 * There is no local database. The URL therefore always points at something
 * reachable over the network: a database provisioned by the platform, or the
 * one of the project.
 *
 * ## The "existing URL" path is not a degraded mode
 *
 * It is first class, and tested at the same level. A base that only works with
 * our own infrastructure is a trap for those who use it: the day we disappear,
 * or change our pricing, or change provider, their projects must keep running.
 *
 * ## No connection is opened
 *
 * Only the **shape** of the URL is checked. Opening a connection would require
 * a PostgreSQL driver in the CLI, which is downloaded on every `npm create` and
 * whose weight counts; and it would make the creation of a project depend on
 * the state of the network. A typo in the password is therefore discovered at
 * the first start, where `/api/ready` reports it.
 *
 * @module
 */

import { appendFile, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

/** What the user chooses. */
export type DatabaseChoice = 'provider' | 'url' | 'later'

/** What the question returns. */
export interface DatabaseOutcome {
  readonly choice: DatabaseChoice
  /** URL kept, absent when it was put off until later. */
  readonly url?: string
  /** Message to show at the end of the creation. */
  readonly note: string
}

/**
 * Checks the shape of a PostgreSQL URL.
 *
 * @returns `undefined` when it is fine, otherwise what is wrong.
 */
export function checkDatabaseUrl(value: string): string | undefined {
  const url = value.trim()
  if (url.length === 0) return 'The URL cannot be empty.'

  if (!/^postgres(ql)?:\/\//i.test(url)) {
    return 'A PostgreSQL URL starts with postgres:// or postgresql://'
  }

  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return 'This string is not a valid URL.'
  }

  if (parsed.hostname.length === 0) return 'No host in this URL.'

  // The path carries the name of the database: `postgres://host:5432` with
  // nothing behind connects to the default database of the role, which is
  // almost never what one wants and is only noticed once the tables are
  // elsewhere.
  if (parsed.pathname.replace(/^\//, '').length === 0) {
    return 'No database name: add it after the port, for example /my_project'
  }

  if (
    !/^(localhost|127\.0\.0\.1|\[::1\])$/i.test(parsed.hostname) &&
    parsed.searchParams.get('sslmode') === 'disable'
  ) {
    return 'sslmode=disable on a remote database: the traffic would go in the clear.'
  }

  return undefined
}

/**
 * Writes the URL into the `.env` of the project, creating the file when needed.
 *
 * The file is never versioned: {@link assertEnvIgnored} checks it.
 */
export async function writeDatabaseUrl(target: string, url: string): Promise<void> {
  const path = join(target, '.env')
  const line = `DATABASE_URL=${url}\n`

  if (!existsSync(path)) {
    const example = join(target, '.env.example')
    // The `.env` starts from the example: every commented variable is in there,
    // and one does not discover the others one by one.
    const base = existsSync(example) ? await readFile(example, 'utf8') : ''
    await writeFile(path, base.replace(/^DATABASE_URL=.*$/m, line.trimEnd()), 'utf8')
    if (!base.includes('DATABASE_URL=')) await appendFile(path, line, 'utf8')
    return
  }

  const current = await readFile(path, 'utf8')
  await writeFile(
    path,
    current.includes('DATABASE_URL=')
      ? current.replace(/^DATABASE_URL=.*$/m, line.trimEnd())
      : current + line,
    'utf8',
  )
}

/**
 * Checks that the `.env` really is ignored by git.
 *
 * A versioned `.env` is a credential leak that happens through oversight, and
 * that cannot be caught up with: once pushed, the secret is to be rotated, not
 * removed from the history.
 *
 * @returns A warning, or `undefined` when all is well.
 */
export async function assertEnvIgnored(target: string): Promise<string | undefined> {
  const path = join(target, '.gitignore')
  if (!existsSync(path)) {
    return 'No .gitignore: the .env file risks being versioned.'
  }

  const content = await readFile(path, 'utf8')
  const ignored = content
    .split('\n')
    .map((line) => line.trim())
    .some((line) => line === '.env' || line === '.env*' || line === '*.env')

  return ignored
    ? undefined
    : '.env does not appear in the .gitignore: your credentials risk being versioned.'
}

/** What the platform will say once it exists. */
export const PROVIDER_PENDING = [
  'Provisioning goes through @odoro-cli/cloud-sdk, installed separately:',
  '',
  '  npm install --save-dev @odoro-cli/cloud-sdk',
  '  odoro db:login',
  '  odoro db:create --env production',
  '',
  'It does not ship with odoro: this binary is downloaded on every project ' +
    'creation, and most projects use their own database.',
].join('\n')
