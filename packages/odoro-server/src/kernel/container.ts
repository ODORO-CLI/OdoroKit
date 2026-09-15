/**
 * Typed service container.
 *
 * ## The promise, and how it is kept
 *
 * `c.get('mailer')` must give the exact type of what was registered under
 * that key, without annotation. An unknown key must be a compilation
 * error, not an `undefined` value discovered in production.
 *
 * A classic container — a `Map<string, unknown>` with a generic
 * `get<T>()` — keeps neither promise: the type is supplied by
 * the caller, so it lies as soon as he gets it wrong, and any string
 * goes through.
 *
 * The technique used here is **type accumulation through the return**.
 * Each `register` gives a container whose type parameter holds one
 * key more, tied to the return type of the factory. The type is therefore built
 * as the registrations are written, and TypeScript infers it
 * on its own.
 *
 * ```ts
 * const c = createContainer()
 *   .register('logger', () => createLogger())
 *   .register('mailer', (c) => createMailer(c.get('logger')))
 * // c : Container<{ logger: Logger; mailer: Mailer }>
 * ```
 *
 * The consequence is a writing constraint: **the order matters**. A
 * factory can only read keys already registered, since those that
 * come after do not exist in the type yet. It is a real nuisance, and
 * it is also what makes cycles impossible to write — a cycle of
 * dependencies becomes a compilation error rather than a stack
 * overflow at startup.
 *
 * ## The captive dependency, and why it is forbidden
 *
 * A singleton that would read a per-request service would capture the one of the
 * **first** request, and would keep it for all the following ones. The
 * program keeps working, writes in the wrong log, under the
 * wrong correlation identifier, with the wrong transaction. No
 * error comes up, and the flaw is only seen by reading traces that make
 * no sense.
 *
 * The container therefore refuses that read, naming both services. The
 * restriction bears on the **resolver** handed to the factory, and not on a
 * moment of the construction: a first version watched the stack of the
 * constructions in progress, and therefore only saw the immediate capture. Yet
 * the common case is deferred — `() => c.get('trace')` in a closure is evaluated
 * well after the factory has handed back control, when the stack is empty.
 *
 * A restricted resolver catches both, since it stays restricted as
 * long as the closure holds it.
 *
 * What to do instead: pass the value as a call parameter, or
 * make it travel through `AsyncLocalStorage` — that is already how the
 * transactional client travels.
 *
 * ## Why no decorator
 *
 * Injection through decorators and reflection metadata asks for
 * `emitDecoratorMetadata`, does not work on structural types, and
 * resolves by class name at runtime. The first silent rename
 * breaks the resolution without anything compiling to an error. Here, everything that
 * ties a service to another is an ordinary expression the editor knows how to
 * follow.
 *
 * @module
 */

/** What a factory receives: the container as it is at that instant. */
export interface Resolver<Services> {
  /** Gives the service registered under this key. */
  get: <Key extends keyof Services>(key: Key) => Services[Key]
}

/** Builds a service from those already registered. */
export type Factory<Services, Value> = (resolver: Resolver<Services>) => Value

/** Scope of a service. */
export type Scope = 'singleton' | 'request'

/**
 * Container immutable in type, mutable in value.
 *
 * `register` gives a container of widened type. The underlying object is the
 * same: it is the types that accumulate, not the allocations.
 */
export interface Container<Services = Record<never, never>> extends Resolver<Services> {
  /**
   * Registers a service.
   *
   * @param key Key, literal, which becomes a property of the type.
   * @param factory Factory, called at most once in singleton scope.
   * @param scope `singleton` by default; `request` rebuilds the service on
   *   each request, in the child container it opens.
   */
  register: <Key extends string, Value>(
    key: Key extends keyof Services ? never : Key,
    factory: Factory<Services, Value>,
    scope?: Scope,
  ) => Container<Services & { readonly [K in Key]: Value }>

  /**
   * Opens a child container, for the length of a request.
   *
   * The `singleton` services are shared with the parent — that is what
   * "singleton" means. The `request` services are rebuilt, and
   * only exist for the lifetime of the child.
   */
  scope: () => Container<Services>

  /** The registered keys, for the diagnostics and the CLI. */
  keys: () => readonly string[]

  /**
   * Releases the services of this scope that declared a `dispose`.
   *
   * Called at the end of a request for a child container, and at the shutdown of the
   * process for the root.
   */
  dispose: () => Promise<void>
}

/** What a service can expose to be released cleanly. */
interface Disposable {
  dispose: () => void | Promise<void>
}

/** Is a service releasable? */
function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === 'object' &&
    value !== null &&
    'dispose' in value &&
    typeof (value as Disposable).dispose === 'function'
  )
}

/** Internal registration. */
interface Entry {
  readonly factory: Factory<Record<string, unknown>, unknown>
  readonly scope: Scope
}

/** A construction in progress, for the diagnostics of the cycles and of the captives. */
interface Building {
  readonly key: string
  readonly scope: Scope
}

/** State shared between a container and its children. */
interface State {
  readonly entries: Map<string, Entry>
  readonly instances: Map<string, unknown>
  /**
   * Stack of the constructions in progress, held by the root alone.
   *
   * It crosses the scopes: that is what makes it possible to see that a singleton in
   * the course of construction asks for a per-request service.
   */
  readonly building: Building[]
  readonly parent: State | undefined
}

/** The root of a chain of scopes. */
function rootOf(state: State): State {
  let current = state
  while (current.parent !== undefined) current = current.parent
  return current
}

/**
 * Finds the registration of a key, walking up towards the root.
 *
 * A child redeclares nothing: it inherits the table of the parent and only differs
 * by its instances.
 */
function lookup(state: State, key: string): Entry | undefined {
  return state.entries.get(key) ?? (state.parent && lookup(state.parent, key))
}

/**
 * The container where an instance must live.
 *
 * A singleton resolved from a child is built **in the root**: without
 * that, each request would get a copy of it, which is no longer a
 * singleton but a per-request service bearing the wrong name.
 */
function home(state: State, scope: Scope): State {
  return scope === 'request' ? state : rootOf(state)
}

/** Builds the container around a state. */
function build<Services>(state: State): Container<Services> {
  /**
   * The resolver handed to a factory.
   *
   * A singleton receives a restricted one, which refuses the per-request services —
   * for good, and not only during its construction. That is what
   * catches the deferred capture: the closure keeps that very resolver.
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
            `Captive dependency: the singleton "${ownerKey}" asks for "${name}", ` +
              `which lives for the length of one request. It would capture the first ` +
              `request and keep it for all the following ones. Pass the ` +
              `value as a call parameter, or make it travel through ` +
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
      // The type already forbids this case; it stays reachable from
      // untyped JavaScript, and a clear message is worth more than `undefined`.
      throw new Error(
        `Unknown service: "${key}". Registered: ${[...allKeys(state)].join(', ')}`,
      )
    }

    const owner = home(state, entry.scope)
    const cached = owner.instances.get(key)
    if (cached !== undefined) return cached

    // The stack lives in the root: it must cross the scopes to see
    // that a singleton asks for a per-request service.
    const stack = rootOf(state).building

    if (stack.some((frame) => frame.key === key)) {
      throw new Error(
        `Dependency cycle on "${key}": ${[...stack.map((f) => f.key), key].join(' -> ')}`,
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
        throw new Error(`Service already registered: "${name}"`)
      }
      state.entries.set(name, {
        factory: factory as Factory<Record<string, unknown>, unknown>,
        scope,
      })
      // The same object, widened in type only: `register` copies nothing.
      return container as never
    },

    scope: () =>
      build<Services>({
        entries: new Map(),
        instances: new Map(),
        // The construction stack is the one of the root; this array is
        // never read, it satisfies the shape of the state.
        building: [],
        parent: state,
      }),

    keys: () => [...allKeys(state)],

    dispose: async () => {
      // Reverse order of construction: a service releases its dependencies
      // after it, never before.
      const values = [...state.instances.values()].reverse()
      state.instances.clear()
      for (const value of values) {
        if (isDisposable(value)) await value.dispose()
      }
    },
  }

  return container
}

/** Every key visible from a state, the root included. */
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
 * Opens an empty container.
 *
 * @example
 * const container = createContainer()
 *   .register('config', () => loadConfig())
 *   .register('logger', (c) => createLogger(c.get('config')))
 *
 * const logger = container.get('logger')
 * //    ^ Logger, without annotation
 *
 * container.get('mailer')
 * //            ^ compilation error: the key does not exist
 */
export function createContainer(): Container {
  return build({
    entries: new Map(),
    instances: new Map(),
    building: [],
    parent: undefined,
  })
}

/** The type of the services of a container, to annotate what receives it. */
export type ServicesOf<C> = C extends Container<infer Services> ? Services : never
