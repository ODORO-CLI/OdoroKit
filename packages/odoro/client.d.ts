/**
 * Ambient types for the client code of an Odoro project.
 *
 * To be referenced once in the project:
 *
 * ```ts
 * /// <reference types="odoro/client" />
 * ```
 *
 * @module
 */

/** Environment variables exposed to the browser. */
interface OdoroEnv {
  /**
   * Build mode.
   *
   * `development` and `production` are the two default modes, but a project can
   * name others — `staging`, `demo` — and each reads its own `.env.<mode>`
   * files.
   */
  readonly MODE: string
  /** True in development. */
  readonly DEV: boolean
  /** True in production. */
  readonly PROD: boolean
  /** True during prerendering, absent in the browser. */
  readonly SSR?: boolean
  /** Prefix of the public URLs. */
  readonly BASE_URL: string
  /** Project variables carrying the configured prefix. */
  readonly [key: string]: string | boolean | undefined
}

/** Hot reloading API exposed to every module. */
interface OdoroHot {
  /** Data kept from one module version to the next. */
  readonly data: Record<string, unknown>
  /** Declares that this module knows how to replace itself hot. */
  accept(callback?: (module: unknown) => void): void
  /** Registers a cleanup to run before the replacement. */
  dispose(callback: (data: Record<string, unknown>) => void): void
  /** Gives up hot replacement and reloads the page. */
  invalidate(): void
}

interface ImportMeta {
  /** Environment variables of the project. */
  readonly env: OdoroEnv
  /** Present in development only. */
  hot?: OdoroHot

  /**
   * Imports every module matched by a pattern.
   *
   * The pattern is resolved at build time: what comes out of it is a table of
   * static imports, whose keys are the paths as they were written.
   *
   * @example
   * const pages = import.meta.glob('./pages/*.tsx')
   * const module = await pages['./pages/home.tsx']?.()
   */
  glob<T = Record<string, unknown>>(
    pattern: string | readonly string[],
    options?: { eager?: false; import?: string },
  ): Record<string, () => Promise<T>>

  /**
   * The same thing, but everything is loaded right away.
   *
   * @example
   * const titles = import.meta.glob('./pages/*.tsx', { eager: true, import: 'title' })
   */
  glob<T = Record<string, unknown>>(
    pattern: string | readonly string[],
    options: { eager: true; import?: string },
  ): Record<string, T>
}

/**
 * The content of a file, as a string.
 *
 * @example
 * import charter from './CHARTER.md?raw'
 */
declare module '*?raw' {
  const content: string
  export default content
}

/**
 * The public address of a file, without loading it.
 *
 * @example
 * import logo from './logo.svg?url'
 */
declare module '*?url' {
  const address: string
  export default address
}

/**
 * A module to run in a separate worker.
 *
 * The class is constructed like any other `Worker`; the file is built apart and
 * loaded as a module.
 *
 * @example
 * import Compute from './compute.ts?worker'
 * const worker = new Compute()
 * worker.postMessage(21)
 */
declare module '*?worker' {
  const Worker_: {
    new (options?: WorkerOptions): Worker
  }
  export default Worker_
}

declare module '*.css' {
  const content: string
  export default content
}

declare module '*.svg' {
  const source: string
  export default source
}

declare module '*.png' {
  const source: string
  export default source
}

declare module '*.jpg' {
  const source: string
  export default source
}

declare module '*.jpeg' {
  const source: string
  export default source
}

declare module '*.webp' {
  const source: string
  export default source
}

declare module '*.avif' {
  const source: string
  export default source
}

declare module '*.woff2' {
  const source: string
  export default source
}
