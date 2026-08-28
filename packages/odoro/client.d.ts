/**
 * Types ambiants pour le code client d'un projet Odoro.
 *
 * A referencer une fois dans le projet :
 *
 * ```ts
 * /// <reference types="odoro/client" />
 * ```
 *
 * @module
 */

/** Variables d'environnement exposees au navigateur. */
interface OdoroEnv {
  /** Mode de compilation. */
  readonly MODE: 'development' | 'production'
  /** Vrai en developpement. */
  readonly DEV: boolean
  /** Vrai en production. */
  readonly PROD: boolean
  /** Prefixe des URL publiques. */
  readonly BASE_URL: string
  /** Variables du projet portant le prefixe configure. */
  readonly [key: string]: string | boolean | undefined
}

/** API de rechargement a chaud exposee a chaque module. */
interface OdoroHot {
  /** Donnees conservees d'une version de module a la suivante. */
  readonly data: Record<string, unknown>
  /** Declare que ce module sait se remplacer a chaud. */
  accept(callback?: (module: unknown) => void): void
  /** Enregistre un nettoyage a executer avant le remplacement. */
  dispose(callback: (data: Record<string, unknown>) => void): void
  /** Renonce au remplacement a chaud et recharge la page. */
  invalidate(): void
}

interface ImportMeta {
  /** Variables d'environnement du projet. */
  readonly env: OdoroEnv
  /** Present uniquement en developpement. */
  hot?: OdoroHot
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
