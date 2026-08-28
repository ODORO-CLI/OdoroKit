/**
 * Lecture et validation de l'environnement.
 *
 * La validation a lieu **au demarrage**, une seule fois. Un serveur qui
 * demarre avec une configuration incomplete finit toujours par tomber, mais
 * plus tard et moins clairement — souvent en production, sur une route peu
 * frequentee.
 *
 * @module
 */

/** Environnement d'execution reconnu. */
export type NodeEnv = 'development' | 'production' | 'test'

/** Configuration validee du serveur. */
export interface Env {
  /** Port d'ecoute. */
  readonly port: number
  /** Environnement d'execution. */
  readonly nodeEnv: NodeEnv
  /** Vrai en production. */
  readonly isProduction: boolean
  /** Origines autorisees. Vide signifie « toutes ». */
  readonly allowedOrigins: readonly string[]
}

/** Erreur decrivant tout ce qui manque, plutot que la premiere anomalie venue. */
export class EnvError extends Error {
  public constructor(problems: readonly string[]) {
    super(
      [
        "Configuration d'environnement invalide :",
        ...problems.map((problem) => `  - ${problem}`),
        '',
        'Voir .env.example pour les valeurs attendues.',
      ].join('\n'),
    )
    this.name = 'EnvError'
  }
}

/** Environnements d'execution acceptes. */
const NODE_ENVS: readonly NodeEnv[] = ['development', 'production', 'test']

/**
 * Lit et valide l'environnement.
 *
 * @throws {EnvError} Si une variable est absente ou invalide.
 *
 * @example
 * const env = readEnv(process.env)
 */
export function readEnv(source: NodeJS.ProcessEnv = process.env): Env {
  const problems: string[] = []

  const rawPort = source['PORT'] ?? '3001'
  const port = Number(rawPort)
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    problems.push(`PORT doit etre un entier entre 1 et 65535 (recu : "${rawPort}")`)
  }

  const rawEnv = source['NODE_ENV'] ?? 'development'
  if (!NODE_ENVS.includes(rawEnv as NodeEnv)) {
    problems.push(`NODE_ENV doit valoir ${NODE_ENVS.join(', ')} (recu : "${rawEnv}")`)
  }

  const allowedOrigins = (source['ALLOWED_ORIGINS'] ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter((origin) => origin !== '')

  if (problems.length > 0) throw new EnvError(problems)

  const nodeEnv = rawEnv as NodeEnv
  return { port, nodeEnv, isProduction: nodeEnv === 'production', allowedOrigins }
}
