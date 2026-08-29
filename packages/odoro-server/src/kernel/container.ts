/**
 * Conteneur de services typé.
 *
 * ## La promesse, et comment elle est tenue
 *
 * `c.get('mailer')` doit rendre le type exact de ce qui a été enregistré sous
 * cette clé, sans annotation. Une clé inconnue doit être une erreur de
 * compilation, pas une valeur `undefined` découverte en production.
 *
 * Un conteneur classique — une `Map<string, unknown>` avec un `get<T>()`
 * générique — ne tient aucune des deux promesses : le type est fourni par
 * l'appelant, donc il ment dès qu'il se trompe, et n'importe quelle chaîne
 * passe.
 *
 * La technique employée ici est l'**accumulation de type par le retour**.
 * Chaque `register` rend un conteneur dont le paramètre de type contient une
 * clé de plus, associée au type de retour de la fabrique. Le type se construit
 * donc à mesure que les enregistrements s'écrivent, et TypeScript l'infère
 * seul.
 *
 * ```ts
 * const c = createContainer()
 *   .register('logger', () => createLogger())
 *   .register('mailer', (c) => createMailer(c.get('logger')))
 * // c : Container<{ logger: Logger; mailer: Mailer }>
 * ```
 *
 * La conséquence est une contrainte d'écriture : **l'ordre compte**. Une
 * fabrique ne peut lire que des clés déjà enregistrées, puisque celles qui
 * viennent après n'existent pas encore dans le type. C'est une gêne réelle, et
 * c'est aussi ce qui rend les cycles impossibles à écrire — un cycle de
 * dépendances devient une erreur de compilation plutôt qu'un dépassement de
 * pile au démarrage.
 *
 * ## La dépendance captive, et pourquoi elle est interdite
 *
 * Un singleton qui lirait un service par requête capturerait celui de la
 * **première** requête, et le garderait pour toutes les suivantes. Le
 * programme continue de fonctionner, écrit dans le mauvais journal, sous le
 * mauvais identifiant de corrélation, avec la mauvaise transaction. Aucune
 * erreur ne remonte, et le défaut ne se voit qu'en lisant des traces qui n'ont
 * pas de sens.
 *
 * Le conteneur refuse donc cette lecture, en nommant les deux services. La
 * restriction porte sur le **résolveur** confié à la fabrique, et non sur un
 * moment de la construction : une première version surveillait la pile des
 * constructions en cours, et ne voyait donc que la capture immédiate. Or le
 * cas courant est différé — `() => c.get('trace')` dans une fermeture s'évalue
 * bien après que la fabrique a rendu la main, quand la pile est vide.
 *
 * Un résolveur restreint attrape les deux, puisqu'il reste restreint aussi
 * longtemps que la fermeture le retient.
 *
 * Ce qu'il faut faire à la place : passer la valeur en paramètre d'appel, ou
 * la faire circuler par `AsyncLocalStorage` — c'est déjà ainsi que le client
 * transactionnel voyage.
 *
 * ## Pourquoi aucun décorateur
 *
 * L'injection par décorateurs et métadonnées de réflexion demande
 * `emitDecoratorMetadata`, ne fonctionne pas sur les types structurels, et
 * résout par nom de classe à l'exécution. Le premier renommage silencieux
 * casse la résolution sans que rien ne compile en erreur. Ici, tout ce qui
 * relie un service à un autre est une expression ordinaire que l'éditeur sait
 * suivre.
 *
 * @module
 */

/** Ce qu'une fabrique reçoit : le conteneur tel qu'il est à cet instant. */
export interface Resolver<Services> {
  /** Rend le service enregistré sous cette clé. */
  get: <Key extends keyof Services>(key: Key) => Services[Key]
}

/** Fabrique un service à partir de ceux déjà enregistrés. */
export type Factory<Services, Value> = (resolver: Resolver<Services>) => Value

/** Portée d'un service. */
export type Scope = 'singleton' | 'request'

/**
 * Conteneur immuable en type, mutable en valeur.
 *
 * `register` rend un conteneur au type élargi. L'objet sous-jacent est le
 * même : ce sont les types qui s'accumulent, pas les allocations.
 */
export interface Container<Services = Record<never, never>> extends Resolver<Services> {
  /**
   * Enregistre un service.
   *
   * @param key Clé, littérale, qui devient une propriété du type.
   * @param factory Fabrique, appelée au plus une fois en portée singleton.
   * @param scope `singleton` par défaut ; `request` reconstruit le service à
   *   chaque requête, dans le conteneur enfant qu'elle ouvre.
   */
  register: <Key extends string, Value>(
    key: Key extends keyof Services ? never : Key,
    factory: Factory<Services, Value>,
    scope?: Scope,
  ) => Container<Services & { readonly [K in Key]: Value }>

  /**
   * Ouvre un conteneur enfant, pour la durée d'une requête.
   *
   * Les services `singleton` sont partagés avec le parent — c'est ce que
   * signifie « singleton ». Les services `request` sont reconstruits, et
   * n'existent que le temps de l'enfant.
   */
  scope: () => Container<Services>

  /** Les clés enregistrées, pour le diagnostic et la CLI. */
  keys: () => readonly string[]

  /**
   * Libère les services de cette portée ayant déclaré un `dispose`.
   *
   * Appelé à la fin d'une requête pour un conteneur enfant, et à l'arrêt du
   * processus pour la racine.
   */
  dispose: () => Promise<void>
}

/** Ce qu'un service peut exposer pour être libéré proprement. */
interface Disposable {
  dispose: () => void | Promise<void>
}

/** Un service est-il libérable ? */
function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dispose' in value &&
    typeof (value as Disposable).dispose === 'function'
  )
}

/** Enregistrement interne. */
interface Entry {
  readonly factory: Factory<Record<string, unknown>, unknown>
  readonly scope: Scope
}

/** Une construction en cours, pour le diagnostic des cycles et des captives. */
interface Building {
  readonly key: string
  readonly scope: Scope
}

/** État partagé entre un conteneur et ses enfants. */
interface State {
  readonly entries: Map<string, Entry>
  readonly instances: Map<string, unknown>
  /**
   * Pile des constructions en cours, portée par la racine seule.
   *
   * Elle traverse les portées : c'est ce qui permet de voir qu'un singleton en
   * cours de construction demande un service par requête.
   */
  readonly building: Building[]
  readonly parent: State | undefined
}

/** La racine d'une chaîne de portées. */
function rootOf(state: State): State {
  let current = state
  while (current.parent !== undefined) current = current.parent
  return current
}

/**
 * Trouve l'enregistrement d'une clé, en remontant vers la racine.
 *
 * Un enfant ne redéclare rien : il hérite de la table du parent et ne diffère
 * que par ses instances.
 */
function lookup(state: State, key: string): Entry | undefined {
  return state.entries.get(key) ?? (state.parent && lookup(state.parent, key))
}

/**
 * Le conteneur où une instance doit vivre.
 *
 * Un singleton résolu depuis un enfant est construit **dans la racine** : sans
 * cela, chaque requête en obtiendrait un exemplaire, ce qui n'est plus un
 * singleton mais un service par requête portant le mauvais nom.
 */
function home(state: State, scope: Scope): State {
  return scope === 'request' ? state : rootOf(state)
}

/** Construit le conteneur autour d'un état. */
function build<Services>(state: State): Container<Services> {
  /**
   * Le résolveur confié à une fabrique.
   *
   * Un singleton en reçoit un restreint, qui refuse les services par requête —
   * pour toujours, et pas seulement pendant sa construction. C'est ce qui
   * attrape la capture différée : la fermeture garde ce résolveur-là.
   */
  const resolverFor = (
    ownerKey: string,
    ownerScope: Scope,
  ): Resolver<Record<string, unknown>> => {
    if (ownerScope !== 'singleton') {
      return container as Resolver<Record<string, unknown>>
    }

    return {
      get: (key) => {
        const name = String(key)
        if (lookup(state, name)?.scope === 'request') {
          throw new Error(
            `Dependance captive : le singleton "${ownerKey}" demande "${name}", ` +
              `qui vit le temps d'une requete. Il capturerait la premiere ` +
              `requete et la garderait pour toutes les suivantes. Passez la ` +
              `valeur en parametre d'appel, ou faites-la circuler par ` +
              `AsyncLocalStorage.`,
          )
        }
        return resolve(name)
      },
    }
  }

  const resolve = (key: string): unknown => {
    const entry = lookup(state, key)
    if (entry === undefined) {
      // Le type interdit déjà ce cas ; il reste atteignable depuis du
      // JavaScript non typé, et un message clair vaut mieux qu'`undefined`.
      throw new Error(
        `Service inconnu : "${key}". Enregistres : ${[...allKeys(state)].join(', ')}`,
      )
    }

    const owner = home(state, entry.scope)
    const cached = owner.instances.get(key)
    if (cached !== undefined) return cached

    // La pile vit dans la racine : elle doit traverser les portées pour voir
    // qu'un singleton demande un service par requête.
    const stack = rootOf(state).building

    if (stack.some((frame) => frame.key === key)) {
      throw new Error(
        `Cycle de dependances sur "${key}" : ${[...stack.map((f) => f.key), key].join(' -> ')}`,
      )
    }

    stack.push({ key, scope: entry.scope })
    try {
      const value = entry.factory(resolverFor(key, entry.scope))
      owner.instances.set(key, value)
      return value
    } finally {
      stack.pop()
    }
  }

  const container: Container<Services> = {
    get: (key) => resolve(String(key)) as Services[typeof key],

    register: (key, factory, scope = 'singleton') => {
      const name = String(key)
      if (state.entries.has(name)) {
        throw new Error(`Service deja enregistre : "${name}"`)
      }
      state.entries.set(name, {
        factory: factory as Factory<Record<string, unknown>, unknown>,
        scope,
      })
      // Le même objet, élargi en type seulement : `register` ne copie rien.
      return container as never
    },

    scope: () =>
      build<Services>({
        entries: new Map(),
        instances: new Map(),
        // La pile de construction est celle de la racine ; ce tableau n'est
        // jamais lu, il satisfait la forme de l'etat.
        building: [],
        parent: state,
      }),

    keys: () => [...allKeys(state)],

    dispose: async () => {
      // Ordre inverse de construction : un service libère ses dépendances
      // après lui, jamais avant.
      const values = [...state.instances.values()].reverse()
      state.instances.clear()
      for (const value of values) {
        if (isDisposable(value)) await value.dispose()
      }
    },
  }

  return container
}

/** Toutes les clés visibles depuis un état, la racine comprise. */
function allKeys(state: State): Set<string> {
  const keys = new Set<string>()
  let current: State | undefined = state
  while (current !== undefined) {
    for (const key of current.entries.keys()) keys.add(key)
    current = current.parent
  }
  return keys
}

/**
 * Ouvre un conteneur vide.
 *
 * @example
 * const container = createContainer()
 *   .register('config', () => loadConfig())
 *   .register('logger', (c) => createLogger(c.get('config')))
 *
 * const logger = container.get('logger')
 * //    ^ Logger, sans annotation
 *
 * container.get('mailer')
 * //            ^ erreur de compilation : la cle n'existe pas
 */
export function createContainer(): Container {
  return build({
    entries: new Map(),
    instances: new Map(),
    building: [],
    parent: undefined,
  })
}

/** Le type des services d'un conteneur, pour annoter ce qui le reçoit. */
export type ServicesOf<C> = C extends Container<infer Services> ? Services : never
