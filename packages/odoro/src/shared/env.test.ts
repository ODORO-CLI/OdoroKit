import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { parseEnv, loadEnv, clientEnv, envFilesFor } from './env.js'

describe('parseEnv', () => {
  it('reads a simple assignment', () => {
    expect(parseEnv('ODORO_API=https://example.dev')).toEqual({
      ODORO_API: 'https://example.dev',
    })
  })

  it('ignores comments and empty lines', () => {
    expect(parseEnv('# a word\n\nA=1\n')).toEqual({ A: '1' })
  })

  it('accepts the "export" form that files shared with a shell carry', () => {
    expect(parseEnv('export A=1')).toEqual({ A: '1' })
  })

  it('cuts an end-of-line comment', () => {
    expect(parseEnv('A=value # not this')).toEqual({ A: 'value' })
  })

  it('keeps a hash glued to the value: that is not a comment', () => {
    expect(parseEnv('COLOR=#3b82f6')).toEqual({ COLOR: '#3b82f6' })
  })

  it('strips double quotes and interprets escapes', () => {
    // The file holds the two characters backslash and n; the value read must
    // carry a real newline.
    expect(parseEnv(String.raw`A="first\nsecond"`)).toEqual({
      A: 'first\nsecond',
    })
  })

  it('reads a value spread over several lines', () => {
    // That is the shape of a private key. Stopping at the first newline would
    // not keep a quarter of it, without reporting anything.
    const file = ['KEY="-----BEGIN-----', 'abcdef', '-----END-----"', 'AFTER=1'].join(
      '\n',
    )

    expect(parseEnv(file)).toEqual({
      KEY: '-----BEGIN-----\nabcdef\n-----END-----',
      AFTER: '1',
    })
  })

  it('never leaves the opening quote in the value', () => {
    expect(parseEnv('A="never closed')).toEqual({ A: 'never closed' })
  })

  it('takes a single-quoted value literally', () => {
    // That is the only way to write a password containing a dollar sign.
    expect(parseEnv("WORD='a$b#c'")).toEqual({ WORD: 'a$b#c' })
  })

  it('accepts an empty value', () => {
    expect(parseEnv('A=')).toEqual({ A: '' })
  })

  it('does not keep a line without an equals sign', () => {
    expect(parseEnv('this is not an assignment')).toEqual({})
  })

  it('keeps equals signs inside the value', () => {
    expect(parseEnv('TOKEN=a=b=c')).toEqual({ TOKEN: 'a=b=c' })
  })
})

describe('envFilesFor', () => {
  it('orders from least to most priority', () => {
    expect(envFilesFor('production')).toEqual([
      '.env',
      '.env.local',
      '.env.production',
      '.env.production.local',
    ])
  })
})

describe('loadEnv', () => {
  let directory: string
  const witnesses = ['ODORO_ALREADY', 'ODORO_X', 'SERVER_X', 'HOST']

  beforeEach(() => {
    directory = mkdtempSync(join(tmpdir(), 'odoro-env-'))
    for (const key of witnesses) delete process.env[key]
  })

  afterEach(() => {
    rmSync(directory, { recursive: true, force: true })
    for (const key of witnesses) delete process.env[key]
  })

  const write = (name: string, content: string): void => {
    writeFileSync(join(directory, name), content, 'utf8')
  }

  it('returns nothing when no file exists', async () => {
    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.files).toEqual([])
    expect(env.client).toEqual({})
  })

  it('the mode file wins over the common file', async () => {
    write('.env', 'ODORO_X=common')
    write('.env.production', 'ODORO_X=production')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client['ODORO_X']).toBe('production')
  })

  it('does not read the file of another mode', async () => {
    write('.env.production', 'ODORO_X=production')

    const env = await loadEnv(directory, 'development', 'ODORO_')
    expect(env.client['ODORO_X']).toBeUndefined()
  })

  it('only exposes to the client what carries the prefix', async () => {
    write('.env', 'ODORO_X=seen\nSERVER_X=hidden')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client).toEqual({ ODORO_X: 'seen' })
    // The rest stays readable by the command, on the machine.
    expect(env.all['SERVER_X']).toBe('hidden')
  })

  it('never overwrites a variable already set in the environment', async () => {
    // This is the rule that makes a deployment predictable: a `.env` versioned
    // by mistake must not take precedence over what the host injects.
    process.env['ODORO_ALREADY'] = 'from-the-host'
    write('.env', 'ODORO_ALREADY=from-the-file')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client['ODORO_ALREADY']).toBe('from-the-host')
  })

  it('exposes a prefixed variable coming from the environment alone', async () => {
    process.env['ODORO_ALREADY'] = 'continuous-integration'

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client['ODORO_ALREADY']).toBe('continuous-integration')
  })

  it('expands a reference to another variable', async () => {
    write('.env', 'HOST=https://example.dev\nODORO_X=${HOST}/v1')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client['ODORO_X']).toBe('https://example.dev/v1')
  })

  it('does not expand a single-quoted value', async () => {
    // A password containing a dollar sign must survive loading: that is the
    // whole point of this form.
    write('.env', "SERVER_X='pass$w$ord'")

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.all['SERVER_X']).toBe('pass$w$ord')
  })

  it('expands against the final value, not against the common file', async () => {
    write('.env', 'HOST=https://staging.dev\nODORO_X=$HOST/v1')
    write('.env.production', 'HOST=https://example.dev')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.client['ODORO_X']).toBe('https://example.dev/v1')
  })

  it('names the files read, in order', async () => {
    write('.env', 'A=1')
    write('.env.production', 'B=2')

    const env = await loadEnv(directory, 'production', 'ODORO_')
    expect(env.files).toEqual(['.env', '.env.production'])
  })
})

describe('clientEnv', () => {
  it('sets the mode and the two flags', () => {
    expect(clientEnv({}, 'development', '/')).toEqual({
      MODE: 'development',
      DEV: true,
      PROD: false,
      BASE_URL: '/',
    })
  })

  it('treats a named mode as production', () => {
    // A `staging` mode builds as production and must behave like it: only
    // `development` is a development mode.
    const env = clientEnv({}, 'staging', '/')
    expect(env['DEV']).toBe(false)
    expect(env['PROD']).toBe(true)
    expect(env['MODE']).toBe('staging')
  })
})
