/**
 * The configuration, and above all its refusals.
 *
 * What matters here is not that a valid configuration be accepted — that
 * goes without saying. It is that an incomplete configuration be refused **in
 * production**, that the report show them **all**, and that no development
 * default cross the border.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { ConfigError, defaultPoolSize, loadConfig } from './config.js'

/** A minimal but complete production environment. */
const PRODUCTION = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://user:pass@localhost:5432/odoro',
  SESSION_SECRET: 'x'.repeat(32),
  APP_URL: 'https://example.com',
}

describe('reading', () => {
  it('converts the sizes written readably', () => {
    const config = loadConfig(undefined, { ...PRODUCTION, BODY_LIMIT: '2mb' })
    expect(config.BODY_LIMIT).toBe(2 * 1024 * 1024)
  })

  it('converts the durations written readably', () => {
    const config = loadConfig(undefined, { ...PRODUCTION, SHUTDOWN_TIMEOUT: '2m' })
    expect(config.SHUTDOWN_TIMEOUT).toBe(120_000)
  })

  it('applies the readable fallbacks when the variable is absent', () => {
    const config = loadConfig(undefined, PRODUCTION)
    expect(config.BODY_LIMIT).toBe(1024 * 1024)
    expect(config.SHUTDOWN_TIMEOUT).toBe(15_000)
  })

  it('splits the lists and ignores the spaces', () => {
    const config = loadConfig(undefined, {
      ...PRODUCTION,
      ALLOWED_ORIGINS: 'https://a.com, https://b.com ,',
    })
    expect(config.ALLOWED_ORIGINS).toEqual(['https://a.com', 'https://b.com'])
  })

  it('gives a frozen object', () => {
    const config = loadConfig(undefined, PRODUCTION)
    expect(Object.isFrozen(config)).toBe(true)
  })
})

describe('refusal in production', () => {
  it('refuses an empty configuration', () => {
    expect(() => loadConfig(undefined, { NODE_ENV: 'production' })).toThrow(ConfigError)
  })

  it('reports every problem at once', () => {
    // The point of this test: one variable per run would turn going
    // live into a series of restarts.
    try {
      loadConfig(undefined, { NODE_ENV: 'production' })
      expect.unreachable('the configuration should have been refused')
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError)
      const variables = (error as ConfigError).problems.map((p) => p.variable)
      expect(variables).toContain('SESSION_SECRET')
      expect(variables).toContain('APP_URL')
    }
  })

  it('requires a database URL in production', () => {
    const problems = capture({ ...PRODUCTION, DATABASE_URL: '' })
    expect(problems).toEqual([
      {
        variable: 'DATABASE_URL',
        reason: expect.stringContaining('required in production'),
      },
    ])
  })

  it('refuses a URL that is not PostgreSQL', () => {
    // There is only one engine left. An SQLite URL inherited from an older
    // project must fail at startup, not on the first access.
    const problems = capture({ ...PRODUCTION, DATABASE_URL: 'file:./storage/dev.db' })
    expect(problems[0]?.variable).toBe('DATABASE_URL')
    expect(problems[0]?.reason).toContain('postgres://')
  })

  it('applies no development default', () => {
    // The development default of SESSION_SECRET is a constant written
    // in the repository: seeing it cross into production would be the worst of silent
    // leaks, since everything would start normally.
    const problems = capture({ NODE_ENV: 'production' })
    expect(problems.map((p) => p.variable)).toContain('SESSION_SECRET')
  })

  it('offers no default for the database URL', () => {
    // What would replace a local database would be a remote URL, therefore a
    // secret. A secret has no default value.
    const config = loadConfig(undefined, {})
    expect(config.DATABASE_URL).toBe('')
  })

  it('refuses a session secret that is too short', () => {
    const problems = capture({ ...PRODUCTION, SESSION_SECRET: 'too-short' })
    expect(problems).toEqual([
      { variable: 'SESSION_SECRET', reason: 'at least 32 characters' },
    ])
  })

  it('refuses a badly written size', () => {
    const problems = capture({ ...PRODUCTION, BODY_LIMIT: '2 megabytes' })
    expect(problems[0]?.variable).toBe('BODY_LIMIT')
  })

  it('refuses a public URL that is not one', () => {
    const problems = capture({ ...PRODUCTION, APP_URL: 'example.com' })
    expect(problems[0]?.variable).toBe('APP_URL')
  })
})

describe('development', () => {
  it('fills the absent variables', () => {
    const config = loadConfig(undefined, {})
    expect(config.NODE_ENV).toBe('development')
    expect(config.APP_URL).toBe('http://localhost:3001')
  })

  it('tolerates an absent database URL', () => {
    // There is no local database: a freshly scaffolded project does not have
    // a URL yet. The server starts anyway, and `/ready` answers 503
    // saying what is missing — refusing to start would make the first
    // impression a failure, while the interface is already served.
    const config = loadConfig(undefined, {})
    expect(config.DATABASE_URL).toBe('')
  })

  it('never overwrites a supplied value', () => {
    const config = loadConfig(undefined, { DATABASE_URL: 'postgres://local/db' })
    expect(config.DATABASE_URL).toBe('postgres://local/db')
  })
})

describe('extension by a module', () => {
  it('merges the schema of the module', async () => {
    const { z } = await import('zod')
    const config = loadConfig(z.object({ SMTP_HOST: z.string().min(1) }), {
      ...PRODUCTION,
      SMTP_HOST: 'smtp.example.com',
    })

    expect(config.SMTP_HOST).toBe('smtp.example.com')
    // The kernel stays present: the extension adds, it does not replace.
    expect(config.PORT).toBe(3001)
  })

  it('refuses as well what the module requires', async () => {
    const { z } = await import('zod')
    expect(() =>
      loadConfig(z.object({ SMTP_HOST: z.string().min(1) }), PRODUCTION),
    ).toThrow(/SMTP_HOST/)
  })
})

describe('pool size', () => {
  it('differs according to the environment', () => {
    // The constraints are not the same: a local database and one instance
    // in development, several instances sharing the limit of the
    // server in production.
    expect(defaultPoolSize('test')).toBeLessThan(defaultPoolSize('development'))
    expect(defaultPoolSize('development')).toBeLessThan(defaultPoolSize('production'))
  })
})

/** Collects the problems of a configuration expected to be invalid. */
function capture(
  source: NodeJS.ProcessEnv,
): readonly { variable: string; reason: string }[] {
  try {
    loadConfig(undefined, source)
    return []
  } catch (error) {
    return error instanceof ConfigError ? error.problems : []
  }
}
