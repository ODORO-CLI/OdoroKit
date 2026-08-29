/**
 * Erreurs, et leur traduction en réponses HTTP.
 *
 * ## Le format
 *
 * Les réponses d'erreur suivent la RFC 9457, `application/problem+json` : un
 * `type`, un `title`, un `status`, un `detail`, et les extensions qu'on veut.
 * Ce n'est pas un choix esthétique — c'est un format que le client sait
 * discriminer sans convention maison, ce dont la phase 4 dépend.
 *
 * ## Ce qui ne doit jamais sortir
 *
 * Une erreur imprévue en production rend un identifiant de corrélation et
 * rien d'autre. Pas de trace d'exécution, pas de message de pilote SQL, pas de
 * nom de table, pas de nom de contrainte.
 *
 * La raison est concrète : un message d'ORM cite volontiers la requête, donc
 * la structure des tables, donc de quoi écrire une injection utile. Un nom de
 * contrainte violée dit qu'une adresse existe déjà — c'est une énumération de
 * comptes offerte par le gestionnaire d'erreurs, sans que personne ne l'ait
 * voulu.
 *
 * La trace complète va dans les journaux, sous le même identifiant. Celui qui
 * exploite la voit ; celui qui appelle ne voit que l'identifiant à citer.
 *
 * ## Pourquoi une hiérarchie plutôt qu'un code
 *
 * Une classe par famille se `catch` par type, se teste par `instanceof`, et
 * l'éditeur sait la suivre. Un champ `code: string` mène à des comparaisons de
 * chaînes disséminées, qu'aucun renommage ne rattrape.
 *
 * @module
 */

import type { NextFunction, Request, Response } from 'express'

/** Les familles d'erreurs que l'API distingue. */
export const ERROR_KINDS = [
  'VALIDATION',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMIT',
  'INTERNAL',
] as const

/** Famille d'une erreur, telle que le client la discrimine. */
export type ErrorKind = (typeof ERROR_KINDS)[number]

/** Statut HTTP de chaque famille. */
const STATUS: Readonly<Record<ErrorKind, number>> = {
  VALIDATION: 422,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  RATE_LIMIT: 429,
  INTERNAL: 500,
}

/** Une erreur de validation, champ par champ. */
export interface FieldError {
  /** Chemin du champ, en notation pointée : `adresse.ville`. */
  readonly field: string
  /** Message destiné à être affiché tel quel. */
  readonly message: string
}

/**
 * Le corps d'une réponse d'erreur, tel que le client le reçoit.
 *
 * Il est exporté parce que le client généré de la phase 4 en dérive ses types
 * d'erreur : c'est le contrat, pas un détail de sérialisation.
 */
export interface ProblemDocument {
  /** URI identifiant le type de problème. */
  readonly type: string
  /** Résumé court, stable pour un même `type`. */
  readonly title: string
  /** Statut HTTP, répété dans le corps comme la RFC le demande. */
  readonly status: number
  /** Description de cette occurrence. */
  readonly detail: string
  /** Famille, pour la discrimination côté client. */
  readonly kind: ErrorKind
  /** Identifiant de corrélation, présent sur toute réponse d'erreur. */
  readonly correlationId: string
  /** Erreurs par champ, sur une erreur de validation seulement. */
  readonly errors?: readonly FieldError[]
  /** Secondes à attendre, sur une limitation de débit seulement. */
  readonly retryAfter?: number
}

/**
 * Erreur destinée au client.
 *
 * Tout ce qui en hérite est **prévu** : son message est écrit pour être lu par
 * l'appelant, et traverse tel quel jusqu'en production. Ce qui n'en hérite pas
 * est imprévu, et ne traverse pas.
 */
export class ApiError extends Error {
  /** Type d'URI, dérivé de la famille. */
  readonly type: string

  constructor(
    readonly kind: ErrorKind,
    message: string,
    readonly options: {
      /** Erreurs par champ. */
      readonly errors?: readonly FieldError[]
      /** Secondes avant nouvelle tentative. */
      readonly retryAfter?: number
      /** Cause d'origine, journalisée, jamais transmise. */
      readonly cause?: unknown
    } = {},
  ) {
    super(message, options.cause === undefined ? {} : { cause: options.cause })
    this.name = new.target.name
    this.type = `https://odoro.dev/problems/${kind.toLowerCase().replace(/_/g, '-')}`
  }

  /** Statut HTTP correspondant. */
  get status(): number {
    return STATUS[this.kind]
  }
}

/** Entrée refusée par un schéma. */
export class ValidationError extends ApiError {
  constructor(errors: readonly FieldError[], message = 'La requete est invalide.') {
    super('VALIDATION', message, { errors })
  }
}

/** Aucune identité, ou identité expirée. */
export class UnauthorizedError extends ApiError {
  constructor(message = 'Authentification requise.') {
    super('UNAUTHORIZED', message)
  }
}

/**
 * Identité connue, droits insuffisants.
 *
 * À ne pas confondre avec {@link UnauthorizedError} : le client de la phase 4
 * déconnecte sur un 401 et n'agit pas sur un 403. Confondre les deux produit
 * une déconnexion à chaque écran interdit.
 */
export class ForbiddenError extends ApiError {
  constructor(message = 'Action non autorisee.') {
    super('FORBIDDEN', message)
  }
}

/** Ressource absente. */
export class NotFoundError extends ApiError {
  constructor(message = 'Ressource introuvable.') {
    super('NOT_FOUND', message)
  }
}

/** État incompatible : adresse déjà prise, version périmée. */
export class ConflictError extends ApiError {
  constructor(message = 'Conflit avec l etat courant.') {
    super('CONFLICT', message)
  }
}

/** Trop de tentatives. */
export class RateLimitError extends ApiError {
  constructor(retryAfter: number, message = 'Trop de tentatives.') {
    super('RATE_LIMIT', message, { retryAfter })
  }
}

/** Titres, stables pour un même type. */
const TITLES: Readonly<Record<ErrorKind, string>> = {
  VALIDATION: 'Requete invalide',
  UNAUTHORIZED: 'Authentification requise',
  FORBIDDEN: 'Acces refuse',
  NOT_FOUND: 'Introuvable',
  CONFLICT: 'Conflit',
  RATE_LIMIT: 'Trop de requetes',
  INTERNAL: 'Erreur interne',
}

/** Ce dont le gestionnaire a besoin. */
export interface ErrorHandlerOptions {
  /**
   * Laisse passer le message et la trace des erreurs imprévues.
   *
   * Vrai en développement seulement. Le défaut est faux : une inversion par
   * omission doit pencher du côté qui ne divulgue rien.
   */
  readonly exposeInternals?: boolean
  /** Journalise l'erreur avec son identifiant de corrélation. */
  readonly log: (entry: {
    readonly correlationId: string
    readonly error: unknown
    readonly expected: boolean
  }) => void
}

/**
 * Construit le gestionnaire d'erreurs.
 *
 * Il se place **en dernier**, après toutes les routes : Express reconnaît un
 * gestionnaire d'erreurs à ses quatre paramètres, et ne l'appelle que pour ce
 * qui a été passé à `next(error)` — ou, en Express 5, pour toute promesse
 * rejetée dans un handler.
 *
 * @example
 * app.use(createErrorHandler({ log: (e) => logger.error(e) }))
 */
export function createErrorHandler(options: ErrorHandlerOptions) {
  const { exposeInternals = false, log } = options

  return function errorHandler(
    error: unknown,
    request: Request,
    response: Response,
    next: NextFunction,
  ): void {
    // Une réponse déjà commencée ne peut plus devenir un document d'erreur :
    // les en-têtes sont partis. Express sait fermer la connexion proprement.
    if (response.headersSent) {
      next(error)
      return
    }

    const correlationId = readCorrelationId(request)
    const expected = error instanceof ApiError

    log({ correlationId, error, expected })

    const problem = expected
      ? describe(error, correlationId)
      : describeInternal(error, correlationId, exposeInternals)

    if (problem.retryAfter !== undefined) {
      response.setHeader('Retry-After', String(problem.retryAfter))
    }

    response.status(problem.status).type('application/problem+json').json(problem)
  }
}

/** Traduit une erreur prévue. */
function describe(error: ApiError, correlationId: string): ProblemDocument {
  return {
    type: error.type,
    title: TITLES[error.kind],
    status: error.status,
    detail: error.message,
    kind: error.kind,
    correlationId,
    ...(error.options.errors === undefined ? {} : { errors: error.options.errors }),
    ...(error.options.retryAfter === undefined
      ? {}
      : { retryAfter: error.options.retryAfter }),
  }
}

/**
 * Traduit une erreur imprévue.
 *
 * En production, `detail` ne contient que l'identifiant à citer. Le message
 * d'origine reste dans les journaux : il peut nommer une table, une contrainte
 * ou une requête, et chacun de ces trois renseigne un attaquant.
 */
function describeInternal(
  error: unknown,
  correlationId: string,
  exposeInternals: boolean,
): ProblemDocument {
  const detail = exposeInternals
    ? `${error instanceof Error ? error.message : String(error)} (${correlationId})`
    : `Une erreur interne est survenue. Citez l identifiant ${correlationId} au support.`

  return {
    type: 'https://odoro.dev/problems/internal',
    title: TITLES.INTERNAL,
    status: 500,
    detail,
    kind: 'INTERNAL',
    correlationId,
  }
}

/** En-tête portant l'identifiant de corrélation. */
export const CORRELATION_HEADER = 'x-request-id'

/** Lit l'identifiant posé par le middleware de journalisation. */
function readCorrelationId(request: Request): string {
  const header = request.get(CORRELATION_HEADER)
  return header ?? 'inconnu'
}

/**
 * Route non appariée.
 *
 * Placé après les routes et avant le gestionnaire d'erreurs : sans lui,
 * Express rend sa page HTML par défaut, qui n'est ni `problem+json` ni
 * discriminable par le client.
 */
export function notFoundHandler(
  _request: Request,
  _response: Response,
  next: NextFunction,
): void {
  next(new NotFoundError('Aucune route ne correspond a cette adresse.'))
}
