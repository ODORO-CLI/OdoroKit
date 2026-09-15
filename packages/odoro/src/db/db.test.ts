/**
 * The database commands: the token, and what happens without the SDK.
 *
 * Two things matter here. A token stored in the project would end up versioned,
 * and a pushed secret is to be rotated rather than removed from a history. And
 * a command whose package is missing must say what to install — not fail on a
 * trace nobody connects to an absent install.
 *
 * @module
 */

import { mkdtemp, readFile, rm, stat, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import {
  configPath,
  findToken,
  forgetToken,
  readUserConfig,
  storeToken,
  writeUserConfig,
} from '../config/user.js'
import { SDK_PACKAGE, loadSdk } from './sdk.js'

let directory: string
let file: string

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'odoro-conf-'))
  file = join(directory, 'config.json')
})

afterEach(async () => {
  await rm(directory, { recursive: true, force: true })
})

describe('location of the configuration', () => {
  it('follows XDG_CONFIG_HOME when it is set', () => {
    // It is the variable through which someone decides where their
    // configurations go: ignoring it would amount to imposing a choice they
    // explicitly made otherwise.
    const path = configPath({ XDG_CONFIG_HOME: '/tmp/conf' })
    expect(path.replace(/\\/g, '/')).toBe('/tmp/conf/odoro/config.json')
  })

  it('stays outside any repository', () => {
    // A configuration file in the project looks like something one versions,
    // and a `git add .` asks nobody's opinion.
    const path = configPath({})
    expect(path).not.toContain(process.cwd())
  })
})

describe('token', () => {
  it('is stored and read back', async () => {
    await storeToken('https://api.example.dev', 'odk_live_abc_secret', file)
    expect(await findToken('https://api.example.dev', file, {})).toBe(
      'odk_live_abc_secret',
    )
  })

  it('keeps the roots apart', async () => {
    await storeToken('https://a.dev', 'odk_live_a_x', file)
    await storeToken('https://b.dev', 'odk_live_b_y', file)

    expect(await findToken('https://a.dev', file, {})).toBe('odk_live_a_x')
    expect(await findToken('https://b.dev', file, {})).toBe('odk_live_b_y')
  })

  it('lets the environment variable win', async () => {
    // Which lets a continuous integration provide a token without writing a
    // file, and someone use another one for the duration of a command.
    await storeToken('https://api.example.dev', 'odk_live_stored', file)

    expect(
      await findToken('https://api.example.dev', file, { ODORO_TOKEN: 'odk_live_env' }),
    ).toBe('odk_live_env')
  })

  it('is forgotten', async () => {
    await storeToken('https://api.example.dev', 'odk_live_abc_secret', file)
    await forgetToken('https://api.example.dev', file)

    expect(await findToken('https://api.example.dev', file, {})).toBeUndefined()
  })

  it('reserves the file to its owner', async () => {
    const report = await writeUserConfig({ tokens: { a: 'b' } }, file)

    if (report.restricted) {
      const mode = (await stat(file)).mode & 0o777
      expect(mode).toBe(0o600)
    } else {
      // On Windows, the POSIX equivalent does not exist. The report must say so
      // rather than let one believe in an absent protection.
      expect(process.platform).toBe('win32')
    }
  })

  it('starts again from an empty configuration when the file is corrupt', async () => {
    // An unreadable configuration must not prevent every command from working:
    // we replace it, we do not stop at it.
    await writeFile(file, '{ this is not json', 'utf8')
    expect(await readUserConfig(file)).toEqual({})
  })

  it('keeps what was already stored', async () => {
    await writeUserConfig({ defaultApiUrl: 'https://a.dev' }, file)
    await storeToken('https://b.dev', 'odk_live_x', file)

    const config = await readUserConfig(file)
    expect(config.defaultApiUrl).toBe('https://a.dev')
    expect(config.tokens?.['https://b.dev']).toBe('odk_live_x')
  })

  it('writes the token nowhere else', async () => {
    await storeToken('https://api.example.dev', 'odk_live_very_secret', file)

    const content = await readFile(file, 'utf8')
    expect(content).toContain('odk_live_very_secret')

    // And above all: nothing in the working directory.
    const inTheProject = await readFile(join(process.cwd(), 'package.json'), 'utf8')
    expect(inTheProject).not.toContain('odk_live_very_secret')
  })
})

describe('loading of the SDK', () => {
  it('explains what to install rather than failing', async () => {
    // The package is deliberately absent from this repository: the
    // communication between the two repositories goes through the published
    // package, in a single direction. The degraded path is therefore the path
    // under test.
    const load = await loadSdk()

    expect(load.ok).toBe(false)
    if (!load.ok) {
      expect(load.reason).toContain(SDK_PACKAGE)
      expect(load.reason).toContain('npm install')
      // And a reason, not only an instruction.
      expect(load.reason).toContain('downloaded on every')
    }
  })
})
