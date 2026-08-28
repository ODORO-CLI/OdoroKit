/**
 * Point d'entree principal d'`odoro-libs`.
 *
 * Il reexporte le systeme de style, qui n'embarque aucun composant. Le
 * routeur, le moteur d'animation et les composants d'interface vivent derriere
 * des sous-chemins dedies, pour qu'une application qui n'utilise que les
 * tokens n'embarque pas React :
 *
 * ```ts
 * import { cx, tokens } from 'odoro-libs'
 * import { Router, Route } from 'odoro-libs/router'
 * import { Reveal } from 'odoro-libs/motion'
 * import { Button } from 'odoro-libs/ui'
 * import 'odoro-libs/styles.css'
 * ```
 *
 * @module
 */

export * from './styles/index.js'
