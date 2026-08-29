/**
 * Point d'entree principal d'`@odoro-cli/libs`.
 *
 * Il reexporte le systeme de style, qui n'embarque aucun composant. Le
 * routeur, le moteur d'animation et les composants d'interface vivent derriere
 * des sous-chemins dedies, pour qu'une application qui n'utilise que les
 * tokens n'embarque pas React :
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
