/**
 * Journalisation structurée, et expurgation.
 *
 * ## La liste d'expurgation s'écrit avant le premier incident
 *
 * Un journal recueille ce qu'on lui donne. Donnez-lui une requête entière, et
 * il enregistrera l'en-tête `authorization`, le cookie de session, le mot de
 * passe du corps — puis les expédiera vers un agrégateur, où ils resteront
 * indexés et consultables aussi longtemps que la rétention le permet.
 *
 * Le moment où l'on écrit cette liste décide de tout : après le premier
 * incident, il faut purger un historique, faire tourner tous les secrets
 * exposés, et prévenir. La liste est donc ici, complète, dès le premier
 * commit.
 *
 * Elle censure par **chemin**, ce que Pino fait nativement et efficacement. Un
 * filtrage écrit à la main s'oublie au premier journal ajouté ailleurs.
 *
 * ## L'identifiant de corrélation
 *
 * Une requête reçoit un identifiant, transmis en en-tête de réponse, présent
 * dans chaque ligne de journal qu'elle produit, et cité dans le document
 * d'erreur qu'elle rend. C'est ce qui permet de passer d'une capture d'écran
 * d'un utilisateur à la trace exacte, sans rien deviner.
 *
 * Il est propagé par `AsyncLocalStorage` plutôt que passé en paramètre : sinon
 * chaque fonction du chemin d'appel devrait le porter, y compris celles qui ne
 * journalisent pas.
 *
 * @module
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import { randomUUID } from 'node:crypto'
import { createRequire } from 'node:module'

import type { NextFunction, Request, Response } from 'express'
import { pino, type Logger as PinoLogger } from 'pino'

import { CORRELATION_HEADER } from './http/errors.js'

/**
 * Chemins censurés dans toute ligne de journal.
 *
 * Chacun a une raison d'être là, et aucun n'y est par excès de prudence :
 *
 * - **en-têtes d'autorisation et cookies** — un jeton de session journalisé
 *   est un jeton utilisable par quiconque lit les journaux ;
 * - **mots de passe, y compris l'ancien et la confirmation** — le formulaire
 *   de changement en porte trois, et deux seulement sont évidents ;
 * - **jetons de réinitialisation et de vérification** — à usage unique, donc
 *   utilisables par le premier qui les lit dans un journal ;
 * - **secrets et clés d'API** — les nôtres comme ceux que l'on nous confie ;
 * - **numéros de carte et cryptogrammes** — leur présence dans un journal
 *   suffit à faire sortir tout le système du périmètre conforme.
 */
export const REDACTED_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["set-cookie"]',
  'req.headers["proxy-authorization"]',
  'res.headers["set-cookie"]',

  'password',
  'newPassword',
  'oldPassword',
  'currentPassword',
  'passwordConfirmation',
  '*.password',
  '*.newPassword',
  '*.oldPassword',
  '*.currentPassword',

  'token',
  'accessToken',
  'refreshToken',
  'sessionToken',
  'resetToken',
  'verificationToken',
  '*.token',
  '*.accessToken',
  '*.refreshToken',
  '*.sessionToken',

  'secret',
  'apiKey',
  'privateKey',
  'clientSecret',
  '*.secret',
  '*.apiKey',
  '*.clientSecret',

  'cardNumber',
  'cvv',
  'cvc',
  '*.cardNumber',
  '*.cvv',
] as const

/** Le journal, tel que le reste du code le voit. */
export type Logger = PinoLogger

/** Options de {@link createLogger}. */
export interface LoggerOptions {
  /** Seuil de journalisation. */
  readonly level: string
  /**
   * Mise en forme lisible plutôt que JSON.
   *
   * Réservée au développement : le JSON est ce qu'un agrégateur sait indexer,
   * et la mise en forme lisible coûte un processus de transport.
   *
   * Le transport est une dépendance **optionnelle**. Absente, le journal
   * retombe sur le JSON plutôt que d'empêcher le démarrage — un serveur de
   * production laissé par erreur en `development` doit servir ses requêtes,
   * pas mourir sur une question de mise en forme.
   */
  readonly pretty?: boolean
  /** Nom du service, présent dans chaque ligne. */
  readonly name?: string
}

/**
 * Le transport de mise en forme est-il installé ?
 *
 * Pino résout la cible au moment de construire le journal, et lève si elle
 * manque. La question se pose donc avant, une fois, plutôt qu'en rattrapant
 * une exception dont on ne saurait pas si elle vient de là.
 */
function prettyAvailable(): boolean {
  try {
    createRequire(import.meta.url).resolve('pino-pretty')
    return true
  } catch {
    return false
  }
}

/** Ouvre un journal. */
export function createLogger(options: LoggerOptions): Logger {
  const { level, pretty = false, name = 'odoro' } = options
  const readable = pretty && prettyAvailable()

  return pino({
    name,
    level,
    redact: {
      paths: [...REDACTED_PATHS],
      censor: '[expurge]',
    },
    // Le niveau en toutes lettres plutôt qu'en nombre : un journal se relit
    // plus souvent qu'il ne se trie.
    formatters: { level: (label) => ({ level: label }) },
    timestamp: pino.stdTimeFunctions.isoTime,
    ...(readable
      ? { transport: { target: 'pino-pretty', options: { colorize: true } } }
      : {}),
  })
}

/** Ce que le contexte d'une requête porte. */
export interface RequestContext {
  /** Identifiant de corrélation. */
  readonly correlationId: string
  /** Journal enrichi de cet identifiant. */
  readonly logger: Logger
}

/**
 * Le contexte de la requête en cours.
 *
 * `AsyncLocalStorage` traverse les `await` et les rappels : une fonction
 * appelée à trois niveaux de profondeur y accède sans que les trois
 * intermédiaires aient à transporter quoi que ce soit.
 */
const storage = new AsyncLocalStorage<RequestContext>()

/**
 * Le contexte de la requête courante, s'il y en a une.
 *
 * Rend `undefined` hors requête — dans un travail de file, une tâche planifiée
 * ou un script. C'est voulu : ces chemins ont leur propre journal, et un
 * identifiant de requête y serait un mensonge.
 */
export function currentContext(): RequestContext | undefined {
  return storage.getStore()
}

/**
 * Le journal de la requête courante, ou celui fourni en repli.
 *
 * @example
 * log(fallback).info({ userId }, 'profil mis a jour')
 */
export function log(fallback: Logger): Logger {
  return storage.getStore()?.logger ?? fallback
}

/**
 * Middleware ouvrant le contexte d'une requête.
 *
 * Il doit être posé **avant** tout ce qui journalise, sans quoi les premières
 * lignes sortent sans identifiant — et ce sont souvent celles qui comptent.
 */
export function createRequestContext(logger: Logger) {
  return function requestContext(
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    // Un identifiant venu de l'amont est conservé : derrière un répartiteur ou
    // une passerelle, c'est lui qui relie notre trace à la sienne.
    const correlationId = request.get(CORRELATION_HEADER) ?? randomUUID()

    request.headers[CORRELATION_HEADER] = correlationId
    response.setHeader(CORRELATION_HEADER, correlationId)

    const child = logger.child({ correlationId })
    const started = process.hrtime.bigint()

    response.on('finish', () => {
      const elapsed = Number(process.hrtime.bigint() - started) / 1e6
      child.info(
        {
          method: request.method,
          // `route.path` plutot que l'URL : `/users/:id` se regroupe, alors
          // que `/users/8f2c…` produit une serie de un.
          path: request.route?.path ?? request.path,
          status: response.statusCode,
          durationMs: Math.round(elapsed * 100) / 100,
        },
        'requete',
      )
    })

    storage.run({ correlationId, logger: child }, next)
  }
}
