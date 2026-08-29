/**
 * Configuration : l'environnement, validé une fois, au démarrage.
 *
 * ## Pourquoi tout d'un coup
 *
 * Une configuration lue à l'usage échoue à la centième requête, sur la
 * variable que personne n'avait pensé à définir, dans un chemin de code rare.
 * Elle est donc lue **entièrement** au démarrage, et le processus refuse de
 * partir si quoi que ce soit manque.
 *
 * Le rapport d'erreur liste **toutes** les variables fautives d'un coup. Un
 * message par exécution transformerait la mise en service en une suite de
 * redémarrages, une variable à la fois.
 *
 * ## Pourquoi aucune valeur par défaut en production
 *
 * Une valeur par défaut silencieuse est une décision prise par le code à la
 * place de celui qui déploie. `SESSION_SECRET` qui retombe sur une constante,
 * `NODE_ENV` qui retombe sur `development`, `DATABASE_URL` qui pointe sur
 * localhost : chacune produit un système qui démarre, paraît sain, et se
 * comporte autrement que prévu.
 *
 * Les défauts existent donc pour le développement, et **seulement là**. En
 * production, ce qui n'est pas déclaré fait échouer le démarrage.
 *
 * ## `process.env` ne s'écrit qu'ici
 *
 * Une lecture de `process.env` ailleurs échappe à la validation, au typage, et
 * au rapport de démarrage. La règle ESLint `no-restricted-properties`, posée
 * sur ce paquet, la fait échouer partout sauf sur la ligne ci-dessous — qui la
 * désactive nommément, et reste le seul point de lecture du processus.
 *
 * @module
 */

import { z } from 'zod'

/** Environnements reconnus. */
export const ENVIRONMENTS = ['development', 'test', 'production'] as const

/** Environnement d'exécution. */
export type Environment = (typeof ENVIRONMENTS)[number]

/**
 * Une taille en octets, écrite comme un humain l'écrit.
 *
 * `2mb` plutôt que `2097152` : la seconde forme se relit mal et se saisit
 * encore plus mal, et une erreur d'un facteur mille y passe inaperçue.
 */
const byteSize = z
  .string()
  .regex(/^\d+(\.\d+)?\s*(b|kb|mb|gb)$/i, 'taille attendue, par exemple « 2mb »')
  .transform((value) => {
    const match = /^(\d+(?:\.\d+)?)\s*(b|kb|mb|gb)$/i.exec(value)
    const amount = Number(match?.[1] ?? 0)
    const unit = (match?.[2] ?? 'b').toLowerCase()
    const factor = { b: 1, kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3 }[unit] ?? 1
    return Math.round(amount * factor)
  })

/** Une durée en millisecondes, écrite comme un humain l'écrit. */
const duration = z
  .string()
  .regex(/^\d+(\.\d+)?\s*(ms|s|m|h|d)$/i, 'duree attendue, par exemple « 30s »')
  .transform((value) => {
    const match = /^(\d+(?:\.\d+)?)\s*(ms|s|m|h|d)$/i.exec(value)
    const amount = Number(match?.[1] ?? 0)
    const unit = (match?.[2] ?? 'ms').toLowerCase()
    const factor = { ms: 1, s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 1
    return Math.round(amount * factor)
  })

/** Une liste séparée par des virgules, vide si absente. */
const list = z
  .string()
  .transform((value) =>
    value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  )
  .pipe(z.array(z.string()))

/** Un booléen écrit en toutes lettres. */
const flag = z
  .enum(['true', 'false', '1', '0'])
  .transform((value) => value === 'true' || value === '1')

/**
 * Le schéma du noyau.
 *
 * Un module qui a besoin de ses propres variables les déclare dans son propre
 * schéma, fusionné ici par {@link defineConfig}. Le noyau ne connaît pas
 * `SMTP_HOST` ; le module `mail`, si.
 */
const kernelSchema = z.object({
  NODE_ENV: z.enum(ENVIRONMENTS).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3001),

  /**
   * L'URL de la base. PostgreSQL, et rien d'autre.
   *
   * Une seule variable plutôt que cinq : un hôte, un port, un nom de base et
   * des identifiants séparés se désynchronisent, et l'erreur qui en résulte
   * est un refus de connexion sans indication de laquelle des cinq est
   * fautive.
   *
   * Elle peut être **vide hors production**. Un projet fraîchement échafaudé
   * n'en a pas encore : le serveur démarre quand même, et `/ready` répond 503
   * en disant ce qui manque. Refuser de démarrer ferait de la première
   * impression un échec, alors que l'interface, elle, est déjà servie.
   *
   * En production, elle est exigée — voir {@link productionProblems}.
   */
  DATABASE_URL: z.string().default(''),

  /** Réplica de lecture, optionnel. Le routage vers lui reste explicite. */
  DATABASE_REPLICA_URL: z.string().min(1).optional(),

  /** Taille du pool. Le défaut dépend de l'environnement, voir plus bas. */
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(200).optional(),

  /**
   * Désactive TLS sur une connexion distante.
   *
   * Explicite, jamais implicite : le chiffrement d'une connexion distante ne
   * doit pas pouvoir disparaître par omission.
   */
  DATABASE_TLS_DISABLED: flag.default(false),

  /** Files d'attente et cache. Absente, le repli en mémoire s'applique. */
  REDIS_URL: z.string().min(1).optional(),

  /**
   * Secret de session, au moins trente-deux octets.
   *
   * Le minimum n'est pas décoratif : un secret court se retrouve par force
   * brute, et le jour où c'est arrivé, toutes les sessions émises depuis le
   * premier jour sont forgeables.
   */
  SESSION_SECRET: z.string().min(32, 'au moins 32 caracteres'),

  /** Origines autorisées. Jamais `*` avec identifiants — voir la phase 9. */
  ALLOWED_ORIGINS: list.default([]),

  /** URL publique du serveur, pour les liens des courriels. */
  APP_URL: z.string().url(),

  /** Plafond de la taille des corps de requête. */
  // `prefault` et non `default` : la valeur de repli est une chaine lisible,
  // qui doit traverser la conversion. `default` porte sur la sortie, et
  // rendrait ici un nombre attendu la ou l'on ecrit « 1mb ».
  BODY_LIMIT: byteSize.prefault('1mb'),

  /** Délai au-delà duquel l'arrêt propre cesse d'attendre les requêtes. */
  SHUTDOWN_TIMEOUT: duration.prefault('15s'),

  /** Niveau de journalisation. */
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
})

/** La configuration du noyau. */
export type KernelConfig = z.infer<typeof kernelSchema>

/**
 * Défauts propres au développement, refusés en production.
 *
 * `DATABASE_URL` n'y figure pas, et ne peut pas y figurer : il n'y a pas de
 * base locale. Ce qui la remplacerait serait une URL distante, c'est-à-dire un
 * secret — et un secret n'a pas de valeur par défaut.
 */
const DEVELOPMENT_DEFAULTS: Readonly<Record<string, string>> = {
  SESSION_SECRET: 'developpement-seulement-ne-jamais-employer-ailleurs',
  APP_URL: 'http://localhost:3001',
}

/**
 * Ce qui est tolérable en développement et refusé en production.
 *
 * Ces règles ne peuvent pas vivre dans le schéma : elles dépendent d'une autre
 * variable du même objet, et un schéma qui se référence lui-même rend le
 * rapport d'erreur illisible.
 */
function productionProblems(config: KernelConfig): readonly ConfigProblem[] {
  if (config.NODE_ENV !== 'production') return []

  const problems: ConfigProblem[] = []

  if (config.DATABASE_URL.trim().length === 0) {
    problems.push({
      variable: 'DATABASE_URL',
      reason: 'requise en production : postgres://utilisateur:motdepasse@hote:5432/base',
    })
  } else if (!/^postgres(ql)?:\/\//.test(config.DATABASE_URL)) {
    // La forme seulement : aucune connexion n'est ouverte ici. Une faute de
    // frappe dans le mot de passe se decouvre au premier acces, pas au
    // demarrage — c'est le prix d'un demarrage qui ne depend pas du reseau.
    problems.push({
      variable: 'DATABASE_URL',
      reason: 'doit commencer par postgres:// ou postgresql://',
    })
  }

  return problems
}

/** Un problème de configuration, tel qu'il est rapporté. */
export interface ConfigProblem {
  /** Nom de la variable. */
  readonly variable: string
  /** Ce qui ne va pas. */
  readonly reason: string
}

/** Levée quand la configuration est incomplète ou invalide. */
export class ConfigError extends Error {
  constructor(readonly problems: readonly ConfigProblem[]) {
    super(
      [
        `Configuration invalide — ${String(problems.length)} probleme(s) :`,
        '',
        ...problems.map(({ variable, reason }) => `  ${variable}  ${reason}`),
        '',
        'Voir .env.example pour la liste complete et commentee.',
      ].join('\n'),
    )
    this.name = 'ConfigError'
  }
}

/**
 * Lit et valide l'environnement.
 *
 * @param extra Schéma d'un module, fusionné au schéma du noyau.
 * @param source Environnement à lire. Injecté par les tests ; en production,
 *   c'est `process.env` et rien d'autre.
 *
 * @throws {ConfigError} Si une variable manque ou est invalide. Le message
 *   liste tous les problèmes, pas seulement le premier.
 *
 * @example
 * const config = loadConfig()
 * config.PORT      // number
 * config.BODY_LIMIT // number, en octets, depuis « 1mb »
 */
export function loadConfig<Extra extends z.ZodRawShape = Record<never, never>>(
  extra?: z.ZodObject<Extra>,
  // eslint-disable-next-line no-restricted-properties -- le seul point de lecture
  source: NodeJS.ProcessEnv = process.env,
): KernelConfig & z.infer<z.ZodObject<Extra>> {
  const schema = extra === undefined ? kernelSchema : kernelSchema.extend(extra.shape)

  const environment = source['NODE_ENV'] ?? 'development'
  const applied: Record<string, string | undefined> = { ...source }

  // Les defauts de developpement ne comblent que ce qui est absent, et
  // seulement hors production : en production, l'omission doit echouer.
  if (environment !== 'production') {
    for (const [key, value] of Object.entries(DEVELOPMENT_DEFAULTS)) {
      applied[key] ??= value
    }
  }

  const result = schema.safeParse(applied)

  if (result.success) {
    const extra = productionProblems(result.data as KernelConfig)
    if (extra.length === 0) return Object.freeze(result.data) as never
    throw new ConfigError(extra)
  }

  // Tous les problemes d'un coup : une variable par execution ferait de la
  // mise en service une suite de redemarrages.
  const problems = result.error.issues.map((issue) => ({
    variable: issue.path.map(String).join('.') || '(racine)',
    reason: issue.message,
  }))

  throw new ConfigError(problems)
}

/**
 * Taille de pool retenue, faute de réglage explicite.
 *
 * Les défauts diffèrent parce que les contraintes diffèrent : en
 * développement, une seule instance et une base locale ; en production,
 * plusieurs instances qui se partagent la limite du serveur, et un pool trop
 * large sature avant que la charge n'arrive.
 */
export function defaultPoolSize(environment: Environment): number {
  return { development: 5, test: 1, production: 10 }[environment]
}
