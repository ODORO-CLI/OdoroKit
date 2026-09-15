/**
 * The database question, and above all its refusals.
 *
 * No connection is opened during scaffolding: what is checked here is the shape
 * of the URL. The cases tested are those that pass an inspection by eye and
 * break afterwards — a forgotten database name, an `sslmode` disabled on a
 * remote database.
 *
 * @module
 */

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { assertEnvIgnored, checkDatabaseUrl, writeDatabaseUrl } from './database.js'

describe('shape of the URL', () => {
  it('accepts a complete URL', () => {
    expect(
      checkDatabaseUrl(
        'postgres://lea:secret@db.example.dev:5432/project?sslmode=require',
      ),
    ).toBeUndefined()
  })

  it('accepts the long form of the protocol', () => {
    expect(checkDatabaseUrl('postgresql://lea@host:5432/project')).toBeUndefined()
  })

  it('refuses an empty string', () => {
    expect(checkDatabaseUrl('   ')).toMatch(/cannot be empty/)
  })

  it('refuses another engine', () => {
    // There is only one left. A SQLite URL inherited from an older project must
    // fail here, not at the first access.
    expect(checkDatabaseUrl('file:./storage/dev.db')).toMatch(/postgres:\/\//)
    expect(checkDatabaseUrl('mysql://host:3306/project')).toMatch(/postgres:\/\//)
  })

  it('refuses a URL without a database name', () => {
    // Without a path, one connects to the default database of the role: that is
    // almost never what one wants, and it is only noticed once the tables have
    // been created elsewhere.
    expect(checkDatabaseUrl('postgres://lea@host:5432')).toMatch(/database name/)
    expect(checkDatabaseUrl('postgres://lea@host:5432/')).toMatch(/database name/)
  })

  it('refuses sslmode=disable on a remote database', () => {
    expect(
      checkDatabaseUrl('postgres://lea:secret@db.example.dev:5432/p?sslmode=disable'),
    ).toMatch(/in the clear/)
  })

  it('tolerates sslmode=disable on the machine itself', () => {
    // A database on `localhost` does not put its traffic on the network. The
    // base does not provide for one, but a local tunnel produces one.
    expect(
      checkDatabaseUrl('postgres://lea@localhost:5432/p?sslmode=disable'),
    ).toBeUndefined()
  })

  it('refuses what is not a URL', () => {
    expect(checkDatabaseUrl('postgres://')).toBeDefined()
  })
})

describe('writing into the .env', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'odoro-db-'))
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('starts from the example and sets the URL in it', async () => {
    await writeFile(
      join(directory, '.env.example'),
      '# comment\nDATABASE_URL=\nPORT=3001\n',
      'utf8',
    )

    await writeDatabaseUrl(directory, 'postgres://lea@host:5432/p')
    const content = await readFile(join(directory, '.env'), 'utf8')

    expect(content).toContain('DATABASE_URL=postgres://lea@host:5432/p')
    // The other variables follow: one does not rediscover them one by one.
    expect(content).toContain('PORT=3001')
    expect(content).toContain('# comment')
  })

  it('replaces an already present URL without duplicating the line', async () => {
    await writeFile(join(directory, '.env'), 'DATABASE_URL=postgres://old\n', 'utf8')

    await writeDatabaseUrl(directory, 'postgres://lea@host:5432/p')
    const content = await readFile(join(directory, '.env'), 'utf8')

    expect(content.match(/DATABASE_URL=/g)).toHaveLength(1)
    expect(content).toContain('postgres://lea@host:5432/p')
  })

  it('adds the line when the file has none', async () => {
    await writeFile(join(directory, '.env'), 'PORT=3001\n', 'utf8')

    await writeDatabaseUrl(directory, 'postgres://lea@host:5432/p')
    const content = await readFile(join(directory, '.env'), 'utf8')

    expect(content).toContain('PORT=3001')
    expect(content).toContain('DATABASE_URL=postgres://lea@host:5432/p')
  })
})

describe('the .env must not be versioned', () => {
  let directory: string

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'odoro-git-'))
  })

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true })
  })

  it('stays quiet when .env is ignored', async () => {
    await writeFile(join(directory, '.gitignore'), 'node_modules\n.env\n', 'utf8')
    expect(await assertEnvIgnored(directory)).toBeUndefined()
  })

  it('accepts the usual forms', async () => {
    await writeFile(join(directory, '.gitignore'), '.env*\n', 'utf8')
    expect(await assertEnvIgnored(directory)).toBeUndefined()
  })

  it('warns when it is not', async () => {
    // Once pushed, a secret is to be rotated, not removed from the history: the
    // warning must come before the first commit.
    await writeFile(join(directory, '.gitignore'), 'node_modules\n', 'utf8')
    expect(await assertEnvIgnored(directory)).toMatch(/versioned/)
  })

  it('warns when there is no .gitignore', async () => {
    expect(await assertEnvIgnored(directory)).toMatch(/No .gitignore/)
  })
})
