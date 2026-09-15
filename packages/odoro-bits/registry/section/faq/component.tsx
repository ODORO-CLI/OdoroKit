/**
 * Frequently asked questions.
 *
 * ## The folding is native, and that is not a shortcut
 *
 * `<details>` gives for free what a JavaScript version has to
 * rebuild : opening from the keyboard, the state announced to assistive
 * technologies, and — the point that almost everyone misses — **find in
 * page**. A browser opens a closed `<details>` when the searched text is
 * inside it. An answer hidden behind a `useState` stays impossible to
 * find.
 *
 * ## Opening one at a time takes no state
 *
 * A shared `name` attribute is enough : the browser then closes the others by
 * itself, exactly like radio buttons. It is recent, and the degradation is
 * gentle — where it is not understood, several answers stay open, which has
 * never stopped anyone from reading.
 *
 * ## The height animation
 *
 * It goes through `interpolate-size`, which allows animating towards `auto`.
 * Where it is missing, the folding is instant — and that is quite fine :
 * measuring the height by hand to animate it needs an observer, an extra render
 * and a resynchronisation on every content change.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type ReactElement, type ReactNode } from 'react'

/** A question and its answer. */
export interface FaqItem {
  /** Question asked. */
  readonly question: string
  /** Answer. */
  readonly answer: ReactNode
}

/** Properties specific to the component. */
export interface FaqOwnProps {
  /** The questions, in display order. */
  items: readonly FaqItem[]
  /** Opens only one question at a time. @defaultValue false */
  single?: boolean
  /** Name of the section. */
  title?: ReactNode
}

/** All the properties. */
export type FaqProps = Customisable<FaqOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-faq'

/** Sets the height animation, once per document. */
function ensureFaqRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `interpolate-size` allows the animation towards `auto`. Without it, the
    // rule simply has no effect and the folding is instant.
    '@supports (interpolate-size: allow-keywords){',
    '[data-o-faq]{interpolate-size:allow-keywords}',
    '[data-o-faq] details::details-content{',
    'block-size:0;overflow:hidden;',
    'transition:block-size var(--o-duration-fast) var(--o-ease-standard),',
    'content-visibility var(--o-duration-fast) allow-discrete}',
    '[data-o-faq] details[open]::details-content{block-size:auto}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-faq] details::details-content{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * List of foldable questions.
 *
 * @example
 * <Faq
 *   title="Frequently asked questions"
 *   single
 *   items={[
 *     { question: 'Why copy rather than depend ?', answer: <p>Because…</p> },
 *   ]}
 * />
 */
export function Faq({ items, single = false, title, ...rest }: FaqProps): ReactElement {
  const group = useId().replace(/[^a-zA-Z0-9]/g, '')
  ensureFaqRule()

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style} data-o-faq="">
      {title === undefined ? null : (
        <h2 className="o-text-2xl o-font-semibold o-tracking-tight">{title}</h2>
      )}

      <div className="o-flex o-flex-col">
        {items.map((item) => (
          <details
            key={item.question}
            // A shared `name` is enough to open only one of them : the browser
            // closes the others, with no state held anywhere.
            name={single ? group : undefined}
            className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
          >
            <summary className="o-flex o-cursor-pointer o-items-center o-justify-between o-gap-4 o-py-4 o-text-left o-font-medium focus:o-ring">
              {item.question}
              <span
                aria-hidden
                className="o-shrink-0 o-text-zinc-400 dark:o-text-zinc-500"
              >
                +
              </span>
            </summary>
            <div className="o-pb-4 o-text-zinc-500 dark:o-text-zinc-400">
              {item.answer}
            </div>
          </details>
        ))}
      </div>
    </section>
  )
}
