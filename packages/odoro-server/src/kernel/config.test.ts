/**
 * La configuration, et surtout ses refus.
 *
 * Ce qui compte ici n'est pas qu'une configuration valide soit acceptee — cela
 * va de soi. C'est qu'une configuration incomplete soit refusee **en
 * production**, que le rapport les montre **toutes**, et qu'aucun defaut de
 * developpement ne franchisse la frontiere.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { ConfigError, defaultPoolSize, loadConfig } from './config.js'

/** Un environnement de production minimal mais complet. */
const PRODUCTION = {
  NODE_ENV: 'production',
  DATABASE_URL: 'postgres://user:pass@localhost:5432/odoro',
  SESSION_SECRET: 'x'.repeat(32),
  APP_URL: 'https://exemple.fr',
}

describe('lecture', () => {
  it('convertit les tailles ecrites lisiblement', () => {
    const config = loadConfig(undefined, { ...PRODUCTION, BODY_LIMIT: '2mb' })
    expect(config.BODY_LIMIT).toBe(2 * 1024 * 1024)
  })

  it('convertit les durees ecrites lisiblement', () => {
    const config = loadConfig(undefined, { ...PRODUCTION, SHUTDOWN_TIMEOUT: '2m' })
    expect(config.SHUTDOWN_TIMEOUT).toBe(120_000)
  })

  it('applique les replis lisibles quand la variable est absente', () => {
    const config = loadConfig(undefined, PRODUCTION)
    expect(config.BODY_LIMIT).toBe(1024 * 1024)
    expect(config.SHUTDOWN_TIMEOUT).toBe(15_000)
  })

  it('decoupe les listes et ignore les espaces', () => {
    const config = loadConfig(undefined, {
      ...PRODUCTION,
      ALLOWED_ORIGINS: 'https://a.fr, https://b.fr ,',
    })
    expect(config.ALLOWED_ORIGINS).toEqual(['https://a.fr', 'https://b.fr'])
  })

  it('rend un objet gele', () => {
    const config = loadConfig(undefined, PRODUCTION)
    expect(Object.isFrozen(config)).toBe(true)
  })
})

describe('refus en production', () => {
  it('refuse une configuration vide', () => {
    expect(() => loadConfig(undefined, { NODE_ENV: 'production' })).toThrow(ConfigError)
  })

  it('rapporte tous les problemes d un coup', () => {
    // Le point de ce test : une variable par execution transformerait la mise
    // en service en une suite de redemarrages.
    try {
      loadConfig(undefined, { NODE_ENV: 'production' })
      expect.unreachable('la configuration aurait du etre refusee')
    } catch (error) {
      expect(error).toBeInstanceOf(ConfigError)
      const variables = (error as ConfigError).problems.map((p) => p.variable)
      expect(variables).toContain('SESSION_SECRET')
      expect(variables).toContain('APP_URL')
    }
  })

  it('exige une URL de base en production', () => {
    const problems = capture({ ...PRODUCTION, DATABASE_URL: '' })
    expect(problems).toEqual([
      {
        variable: 'DATABASE_URL',
        reason: expect.stringContaining('requise en production'),
      },
    ])
  })

  it('refuse une URL qui n est pas PostgreSQL', () => {
    // Il n'y a plus qu'un moteur. Une URL SQLite heritee d'un projet plus
    // ancien doit echouer au demarrage, pas au premier acces.
    const problems = capture({ ...PRODUCTION, DATABASE_URL: 'file:./storage/dev.db' })
    expect(problems[0]?.variable).toBe('DATABASE_URL')
    expect(problems[0]?.reason).toContain('postgres://')
  })

  it('n applique aucun defaut de developpement', () => {
    // Le defaut de developpement de SESSION_SECRET est une constante ecrite
    // dans le depot : la voir franchir en production serait la pire des fuites
    // silencieuses, puisque tout demarrerait normalement.
    const problems = capture({ NODE_ENV: 'production' })
    expect(problems.map((p) => p.variable)).toContain('SESSION_SECRET')
  })

  it('ne propose aucun defaut pour l URL de base', () => {
    // Ce qui remplacerait une base locale serait une URL distante, donc un
    // secret. Un secret n'a pas de valeur par defaut.
    const config = loadConfig(undefined, {})
    expect(config.DATABASE_URL).toBe('')
  })

  it('refuse un secret de session trop court', () => {
    const problems = capture({ ...PRODUCTION, SESSION_SECRET: 'trop-court' })
    expect(problems).toEqual([
      { variable: 'SESSION_SECRET', reason: 'au moins 32 caracteres' },
    ])
  })

  it('refuse une taille mal ecrite', () => {
    const problems = capture({ ...PRODUCTION, BODY_LIMIT: '2 megaoctets' })
    expect(problems[0]?.variable).toBe('BODY_LIMIT')
  })

  it('refuse une URL publique qui n en est pas une', () => {
    const problems = capture({ ...PRODUCTION, APP_URL: 'exemple.fr' })
    expect(problems[0]?.variable).toBe('APP_URL')
  })
})

describe('developpement', () => {
  it('comble les variables absentes', () => {
    const config = loadConfig(undefined, {})
    expect(config.NODE_ENV).toBe('development')
    expect(config.APP_URL).toBe('http://localhost:3001')
  })

  it('tolere une URL de base absente', () => {
    // Il n'y a pas de base locale : un projet fraichement echafaude n'a pas
    // encore d'URL. Le serveur demarre quand meme, et `/ready` repond 503 en
    // disant ce qui manque — refuser de demarrer ferait de la premiere
    // impression un echec, alors que l'interface est deja servie.
    const config = loadConfig(undefined, {})
    expect(config.DATABASE_URL).toBe('')
  })

  it('ne recouvre jamais une valeur fournie', () => {
    const config = loadConfig(undefined, { DATABASE_URL: 'postgres://local/db' })
    expect(config.DATABASE_URL).toBe('postgres://local/db')
  })
})

describe('extension par un module', () => {
  it('fusionne le schema du module', async () => {
    const { z } = await import('zod')
    const config = loadConfig(z.object({ SMTP_HOST: z.string().min(1) }), {
      ...PRODUCTION,
      SMTP_HOST: 'smtp.exemple.fr',
    })

    expect(config.SMTP_HOST).toBe('smtp.exemple.fr')
    // Le noyau reste present : l'extension ajoute, elle ne remplace pas.
    expect(config.PORT).toBe(3001)
  })

  it('refuse aussi ce que le module exige', async () => {
    const { z } = await import('zod')
    expect(() =>
      loadConfig(z.object({ SMTP_HOST: z.string().min(1) }), PRODUCTION),
    ).toThrow(/SMTP_HOST/)
  })
})

describe('taille de pool', () => {
  it('differe selon l environnement', () => {
    // Les contraintes ne sont pas les memes : une base locale et une instance
    // en developpement, plusieurs instances qui se partagent la limite du
    // serveur en production.
    expect(defaultPoolSize('test')).toBeLessThan(defaultPoolSize('development'))
    expect(defaultPoolSize('development')).toBeLessThan(defaultPoolSize('production'))
  })
})

/** Recueille les problemes d'une configuration attendue invalide. */
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
