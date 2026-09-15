/**
 * Minimal declaration of the refresh transformation.
 *
 * The package is distributed without types: we declare the only shape we need,
 * that of a plugin factory as the compiler expects it.
 *
 * @module
 */

declare module 'react-refresh/babel' {
  import type { PluginObj, PluginPass } from '@babel/core'

  /** Options recognised by the transformation. */
  interface ReactRefreshOptions {
    /**
     * Disables the environment check. The point of application in the engine
     * already guarantees that the transformation only happens in development.
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
