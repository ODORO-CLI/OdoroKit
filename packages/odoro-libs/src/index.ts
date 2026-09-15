/**
 * Main entry point of `@odoro-cli/libs`.
 *
 * It reexports the style system, which ships no component. The router, the
 * animation engine and the interface components live behind dedicated
 * subpaths, so that an application using only the tokens does not pull React
 * in:
 *
 * ```ts
 * import { cx, tokens } from '@odoro-cli/libs'
 * import { Router, Route } from '@odoro-cli/libs/router'
 * import { Reveal } from '@odoro-cli/libs/motion'
 * import { Button } from '@odoro-cli/libs/ui'
 * import '@odoro-cli/libs/styles.css'
 * ```
 *
 * @module
 */

export * from './styles/index.js'
