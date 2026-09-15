/**
 * The decorative background of the page.
 *
 * ## Why it is not in `App.tsx`
 *
 * It is the only piece of the page that depends on what was ticked at
 * creation: with the engine, this file is replaced by a version that opens an
 * animated WebGL surface; without it, it is the gradient below.
 *
 * Keeping it apart avoids having two `App.tsx` files to maintain — one per
 * case — which would diverge at the first change of wording. `App.tsx` places
 * `<Background />` and asks for nothing more.
 *
 * ## Why the sizes are inline styles
 *
 * The style system **emits no arbitrary-value class**: `o-h-[42rem]` produces
 * no rule at all, and a missing class paints nothing. The container ended up
 * zero pixels tall, so did both glows, and the background was nowhere to be
 * seen — with nothing to report it.
 *
 * The utilities cover the values on the scale; anything off the scale is
 * written as a style, where it is safe.
 *
 * @module
 */

import type { ReactElement } from 'react'

/** Two brand glows, heavily diluted, behind the top of the page. */
export function Background(): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-x-0 o-top-0 o-overflow-hidden"
      style={{ height: '42rem' }}
    >
      <div
        className="o-absolute o-rounded-full"
        style={{
          left: '50%',
          top: '-18rem',
          width: '46rem',
          height: '46rem',
          transform: 'translateX(-50%)',
          filter: 'blur(64px)',
          opacity: 0.3,
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-500), transparent)',
        }}
      />
      <div
        className="o-absolute o-rounded-full"
        style={{
          right: '-10rem',
          top: '6rem',
          width: '30rem',
          height: '30rem',
          filter: 'blur(64px)',
          opacity: 0.18,
          background:
            'radial-gradient(closest-side, var(--o-palette-brand-400), transparent)',
        }}
      />
    </div>
  )
}
