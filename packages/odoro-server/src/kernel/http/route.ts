/**
 * Définition de route typée.
 *
 * ## Une seule déclaration, quatre consommateurs
 *
 * Une route déclare sa méthode, son chemin, sa garde, ses schémas d'entrée et
 * de sortie, et son handler. De cette déclaration dérivent :
 *
 * 1. le montage sur Express, avec validation avant le handler ;
 * 2. le typage du handler, sans annotation ;
 * 3. le client TypeScript du front ;
 * 4. la spécification OpenAPI, et la table de `odoro routes`.
 *
 * C'est la raison d'être de ce fichier : rien de ce qui précède ne doit être
 * écrit deux fois. Une documentation rédigée à la main dérive en trois
 * semaines ; un type recopié dérive au premier renommage.
 *
 * ## Pourquoi les schémas sont des données, pas des appels
 *
 * `input` et `output` sont des schémas Zod posés dans un objet, et non des
 * appels de méthode chaînés. La différence compte pour le générateur : un
 * objet se lit sans exécuter la route, alors qu'une chaîne d'appels demande
 * d'instrumenter l'exécution pour savoir ce qui a été déclaré.
 *
 * ## La garde est obligatoire
 *
 * `auth` n'a pas de valeur par défaut. Écrire une route oblige à décider si
 * elle est publique, et le dire. Un défaut à `'public'` ferait de l'oubli une
 * route ouverte ; un défaut à `'required'` ferait de l'oubli une route morte,
 * ce qui est moins grave mais reste un défaut silencieux.
 *
 * Le champ est donc requis, et `odoro routes` affiche la colonne — c'est le
 * seul moyen rapide de repérer une route mutative laissée publique.
 *
 * @module
 */

import type { z } from 'zod'

import type { Container } from '../container.js'

/** Méthodes HTTP acceptées. */
export const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const

/** Méthode d'une route. */
export type Method = (typeof METHODS)[number]

/** Ce qu'une route exige de l'appelant. */
export type AuthRequirement =
  /** Aucune identité requise. */
  | 'public'
  /** Une session valide est requise ; sinon 401. */
  | 'required'
  /** L'identité est lue si elle existe, sans être exigée. */
  | 'optional'

/** L'identité résolue par la garde. */
export interface Identity {
  /** Identifiant de l'utilisateur. */
  readonly id: string
  /** Identifiant de la session en cours. */
  readonly sessionId: string
  /**
   * Organisation courante, quand le contexte en désigne une.
   *
   * Elle vaut `undefined` tant qu'aucune organisation n'est sélectionnée. Les
   * politiques la reçoivent et décident : ce n'est pas au routeur de trancher
   * ce qu'une absence signifie.
   */
  readonly organizationId: string | undefined
}

/** Ce qu'un handler reçoit. */
export interface HandlerContext<Input, Services> {
  /** Entrée validée : corps, paramètres d'URL et chaîne de requête réunis. */
  readonly input: Input
  /**
   * L'identité.
   *
   * Non nulle quand `auth` vaut `'required'` — la garde a déjà refusé sinon.
   * Possiblement absente quand elle vaut `'optional'` ou `'public'`.
   */
  readonly user: Identity
  /** Le conteneur de la requête. */
  readonly c: Container<Services>
  /** Annulation, quand le client raccroche. */
  readonly signal: AbortSignal
}

/** Le même contexte, pour une route sans identité garantie. */
export interface OpenHandlerContext<Input, Services> extends Omit<
  HandlerContext<Input, Services>,
  'user'
> {
  readonly user: Identity | undefined
}

/**
 * Une route, telle qu'elle est déclarée.
 *
 * Le type est volontairement large ici — les paramètres précis vivent dans
 * {@link route}, qui les infère. Cette forme est celle que le montage, la CLI
 * et le générateur consomment.
 */
export interface RouteDefinition {
  /** Nom canonique, en notation pointée : `account.updateProfile`. */
  readonly name: string
  readonly method: Method
  /** Chemin Express, paramètres compris : `/account/:id`. */
  readonly path: string
  readonly auth: AuthRequirement
  /** Schéma d'entrée. Absent, la route n'accepte rien. */
  readonly input?: z.ZodType
  /** Schéma de sortie. Sert au typage du client et à la sérialisation. */
  readonly output?: z.ZodType
  /**
   * Politique appliquée, par nom.
   *
   * Purement déclaratif ici : c'est le module d'autorisation qui l'applique.
   * Le nom figure dans `odoro routes`, ce qui rend visible une route mutative
   * sans politique.
   */
  readonly policy?: string
  /** Résumé d'une ligne, repris dans OpenAPI. */
  readonly summary?: string
  /** Le traitement. */
  readonly handler: (context: never) => unknown
}

/** Ce que {@link route} accepte. */
export interface RouteOptions<
  Input extends z.ZodType | undefined,
  Output extends z.ZodType | undefined,
  Auth extends AuthRequirement,
  Services,
> {
  readonly name: string
  readonly method: Method
  readonly path: string
  readonly auth: Auth
  readonly input?: Input
  readonly output?: Output
  readonly policy?: string
  readonly summary?: string
  readonly handler: (
    context: Auth extends 'required'
      ? HandlerContext<InputOf<Input>, Services>
      : OpenHandlerContext<InputOf<Input>, Services>,
  ) => Promise<OutputOf<Output>> | OutputOf<Output>
}

/** Le type d'entrée d'une route, ou `undefined` si elle n'en déclare pas. */
type InputOf<Input> = Input extends z.ZodType ? z.infer<Input> : undefined

/** Le type de sortie d'une route. */
type OutputOf<Output> = Output extends z.ZodType ? z.infer<Output> : void

/**
 * Déclare une route.
 *
 * @example
 * export const updateProfile = route({
 *   name: 'account.updateProfile',
 *   method: 'PATCH',
 *   path: '/account/profile',
 *   auth: 'required',
 *   policy: 'account.update',
 *   input: z.object({ displayName: z.string().min(1).max(80) }),
 *   output: profileResource,
 *   handler: async ({ input, user, c }) =>
 *     c.get('accountService').updateProfile(user.id, input),
 * })
 */
export function route<
  Input extends z.ZodType | undefined,
  Output extends z.ZodType | undefined,
  Auth extends AuthRequirement,
  Services = Record<never, never>,
>(
  options: RouteOptions<Input, Output, Auth, Services>,
): RouteOptions<Input, Output, Auth, Services> {
  return options
}

/**
 * Ce qu'une route mutative doit avoir.
 *
 * Une route qui change l'état et n'exige ni identité ni politique est presque
 * toujours un oubli. Presque : un formulaire de contact, une inscription, une
 * demande de réinitialisation sont légitimement publics et mutatifs.
 *
 * Le noyau ne peut donc pas refuser ces routes — il les **signale**, et la
 * déclaration doit alors dire explicitement que c'est voulu.
 */
export const MUTATING_METHODS: readonly Method[] = ['POST', 'PUT', 'PATCH', 'DELETE']

/** Une route mutative laissée publique sans mention explicite. */
export interface OpenMutationWarning {
  readonly name: string
  readonly method: Method
  readonly path: string
}

/**
 * Repère les routes mutatives publiques.
 *
 * Alimente `odoro routes` et un test du noyau. Chercher ces routes à l'œil
 * dans le code ne fonctionne pas : elles ne se distinguent des autres que par
 * l'absence d'un champ.
 */
export function findOpenMutations(
  routes: readonly RouteDefinition[],
): readonly OpenMutationWarning[] {
  return routes
    .filter(
      (route) =>
        MUTATING_METHODS.includes(route.method) &&
        route.auth === 'public' &&
        route.policy === undefined,
    )
    .map(({ name, method, path }) => ({ name, method, path }))
}
