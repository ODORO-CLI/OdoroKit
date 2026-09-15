/**
 * Odoro style system: tokens, class composition and variants.
 *
 * The package ships a **base**, to be imported once at the root of the
 * application:
 *
 * ```ts
 * import '@odoro-cli/libs/styles.css'
 * ```
 *
 * Variables, preflight, keyframes: thirty kilobytes, and no utility at all.
 * Those are produced at build time, for the sole classes actually used.
 *
 * This requires the `odoro` engine 0.1.5 or newer. Without it, the application
 * gets the variables without the utilities and comes up unstyled — with no
 * error to report it, since missing CSS breaks nothing, it just paints
 * nothing.
 *
 * @module
 */

// Only the types are exposed: the class name arrays weigh 195 Ko and serve
// only the generator and the test suite. Autocompletion, for its part, costs
// nothing at runtime.
export type { OdoroClassName, OdoroCoreClassName } from './generated/classNames.js'
export * from './cx.js'
export * from './fonts.js'
export * from './tokens.js'
