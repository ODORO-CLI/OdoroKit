/**
 * The decorative background of the page.
 *
 * Two glows in the brand colour, heavily diluted. Nothing moves: it is a
 * gradient, not an animation.
 *
 * If the engine was picked, this file is replaced by a version that opens an
 * animated WebGL surface. `App.tsx` places `<Background />` and asks for
 * nothing more.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Two brand glows behind the top of the page. */
export function Background(): ReactElement {
  return (
    <div className="background" aria-hidden="true">
      <div className="background-glow background-glow-top" />
      <div className="background-glow background-glow-right" />
    </div>
  )
}
