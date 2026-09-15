/**
 * Registration of the animation plugins.
 *
 * ## Idempotent, and why that matters
 *
 * Registering the same plugin twice is a classic bug in React strict mode:
 * every effect there runs twice on mount, and a naive registration then
 * produces duplicate scroll triggers — which fire twice, refresh twice, and
 * leave half of them orphaned on unmount. The symptom only shows in
 * development, never in production, which makes it an excellent trap.
 *
 * Each plugin is therefore loaded and registered **only once**, and concurrent
 * requests share the same promise.
 *
 * ## Never on the server
 *
 * The plugins touch the document on registration. On a server render, the
 * request is simply ignored: it will be honoured on mount.
 *
 * ## Loaded on demand
 *
 * A project that only animates text does not download the scroll trigger. This
 * is a design constraint, not a later optimisation: the imports are dynamic
 * and the code splitting follows from it.
 *
 * @module
 */

import gsap from 'gsap'

/** Plugins the engine knows how to load. */
export type PluginName = 'ScrollTrigger' | 'SplitText' | 'Observer' | 'ScrollSmoother'

/** Loading in progress or finished, per plugin. */
const loading = new Map<PluginName, Promise<boolean>>()

/** Plugins actually registered. */
const registered = new Set<PluginName>()

/**
 * Values of the resolved plugins.
 *
 * The types of these plugins are declared globally by the library, but their
 * **value** only exists after the dynamic load: it is therefore kept here, and
 * read by the typed accessors below.
 */
const values = new Map<PluginName, unknown>()

/** Tells whether the environment can host a plugin. */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined'
}

/**
 * Loads the module of a plugin.
 *
 * The `switch` is deliberately explicit rather than a computed import: a
 * dynamically built path prevents any build tool from splitting the code, and
 * the promise of on-demand loading would be empty.
 */
async function importPlugin(name: PluginName): Promise<unknown> {
  switch (name) {
    case 'ScrollTrigger':
      return (await import('gsap/ScrollTrigger')).ScrollTrigger
    case 'SplitText':
      return (await import('gsap/SplitText')).SplitText
    case 'Observer':
      return (await import('gsap/Observer')).Observer
    case 'ScrollSmoother':
      return (await import('gsap/ScrollSmoother')).ScrollSmoother
  }
}

/**
 * Guarantees that a plugin is loaded and registered.
 *
 * @returns `true` if the plugin is usable, `false` outside a browser or if the
 *   load failed. A failure is never fatal: the caller falls back on a
 *   behaviour without animation.
 *
 * @example
 * if (await ensurePlugin('ScrollTrigger')) {
 *   ScrollTrigger.create({ ... })
 * }
 */
export function ensurePlugin(name: PluginName): Promise<boolean> {
  if (!isBrowser()) return Promise.resolve(false)

  const existing = loading.get(name)
  if (existing !== undefined) return existing

  const pending = importPlugin(name)
    .then((plugin) => {
      // `registerPlugin` is itself tolerant of duplicates, but relying on it
      // would leave the count of registered plugins wrong for the diagnostics.
      if (!registered.has(name)) {
        gsap.registerPlugin(plugin as Parameters<typeof gsap.registerPlugin>[0])
        registered.add(name)
      }
      values.set(name, plugin)
      return true
    })
    .catch((cause: unknown) => {
      console.error(`[odoro] could not load the plugin "${name}"`, cause)
      // The removal allows a new attempt: a one-off network failure must not
      // condemn the plugin for the duration of the session.
      loading.delete(name)
      return false
    })

  loading.set(name, pending)
  return pending
}

/**
 * Loads several plugins in parallel.
 *
 * @returns `true` if **all** of them are usable.
 *
 * @example
 * await ensurePlugins(['ScrollTrigger', 'SplitText'])
 */
export async function ensurePlugins(names: readonly PluginName[]): Promise<boolean> {
  const results = await Promise.all(names.map((name) => ensurePlugin(name)))
  return results.every(Boolean)
}

/**
 * Tells whether a plugin is already registered, without triggering anything.
 *
 * @example
 * isPluginRegistered('ScrollTrigger')
 */
export function isPluginRegistered(name: PluginName): boolean {
  return registered.has(name)
}

/** Registered plugins, for the diagnostics panel. */
export function registeredPlugins(): readonly PluginName[] {
  return [...registered]
}

/**
 * Loads the scroll trigger and returns its value.
 *
 * @returns The class, or `null` outside a browser or if the load fails.
 *
 * @example
 * const ScrollTriggerClass = await loadScrollTrigger()
 * ScrollTriggerClass?.create({ trigger: element })
 */
export async function loadScrollTrigger(): Promise<typeof ScrollTrigger | null> {
  const ready = await ensurePlugin('ScrollTrigger')
  if (!ready) return null
  return (values.get('ScrollTrigger') as typeof ScrollTrigger | undefined) ?? null
}

/**
 * Loads the text splitter and returns its value.
 *
 * @returns The class, or `null` outside a browser or if the load fails.
 *
 * @example
 * const SplitTextClass = await loadSplitText()
 */
export async function loadSplitText(): Promise<typeof SplitText | null> {
  const ready = await ensurePlugin('SplitText')
  if (!ready) return null
  return (values.get('SplitText') as typeof SplitText | undefined) ?? null
}

/**
 * Forgets the registrations. Reserved for the tests: the plugins stay
 * registered with the library, only the tracking is reset.
 *
 * @internal
 */
export function resetPluginRegistry(): void {
  loading.clear()
  registered.clear()
  values.clear()
}
