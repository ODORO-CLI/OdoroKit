/**
 * Reduced motion preference.
 *
 * ## This module is now only a redirection
 *
 * The decision has been extracted into `@odoro-cli/libs/motion-policy`, so that a single
 * place answers the question "should we animate?", whatever the system
 * that animates — the library, or the engine when it is present.
 *
 * This file stays because the whole library imports it: removing it
 * would make a twenty file diff for a move of two functions.
 *
 * @module
 */

export { prefersReducedMotion } from '../motion-policy/index.js'
export { usePrefersReducedMotion } from '../motion-policy/react.js'
