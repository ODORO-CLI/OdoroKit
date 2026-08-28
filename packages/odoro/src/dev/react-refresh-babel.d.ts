/**
 * Declaration minimale de la transformation de rechargement.
 *
 * Le paquet est distribue sans types : on declare la seule forme dont on a
 * besoin, celle d'une fabrique de plugin telle que le compilateur l'attend.
 *
 * @module
 */

declare module 'react-refresh/babel' {
  import type { PluginObj, PluginPass } from '@babel/core'

  /** Options reconnues par la transformation. */
  interface ReactRefreshOptions {
    /**
     * Desactive la verification de l'environnement. Le point d'application du
     * moteur garantit deja que la transformation n'a lieu qu'en developpement.
     */
    skipEnvCheck?: boolean
  }

  const plugin: (
    api: unknown,
    options?: ReactRefreshOptions,
    dirname?: string,
  ) => PluginObj<PluginPass>

  export default plugin
}
