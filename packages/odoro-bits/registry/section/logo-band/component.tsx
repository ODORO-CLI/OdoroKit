/**
 * Logo band.
 *
 * ## What this section adds, and why it is little
 *
 * The endless scrolling comes from `effect/marquee`. This section
 * brings only a layout and a heading — and that is deliberately all
 * that it does.
 *
 * A section that reimplemented the scrolling would have two versions of the
 * same mechanism to maintain, which would diverge at the first fix. The
 * registry resolves the dependency and installs both : that is exactly what
 * the graph exists to do.
 *
 * ## The heading is a real title
 *
 * A row of logos with no heading says nothing to whoever does not see the
 * images. The title therefore carries the meaning — "trusted by", "available
 * integrations" — and the row is described as a list.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Children, type ReactElement, type ReactNode } from 'react'

import { Marquee } from '@registre/effect/Marquee'

/** Properties specific to the component. */
export interface LogoBandOwnProps {
  /** The logos. */
  children: ReactNode
  /** Heading displayed above. */
  title?: ReactNode
  /** Speed of the scrolling. @defaultValue 40 */
  speed?: number
}

/** All the properties. */
export type LogoBandProps = Customisable<LogoBandOwnProps, 'section'>

/**
 * Scrolls a row of logos.
 *
 * @example
 * <LogoBand title="Trusted by" speed={30}>
 *   {clients.map((client) => (
 *     <img key={client.name} src={client.logo} alt={client.name} className="o-h-8" />
 *   ))}
 * </LogoBand>
 */
export function LogoBand({
  children,
  title,
  speed = 40,
  ...rest
}: LogoBandProps): ReactElement {
  const logos = Children.toArray(children)

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6 o-py-10' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      {title === undefined ? null : (
        <h2 className="o-text-center o-text-sm o-font-medium o-tracking-wide o-text-zinc-500 dark:o-text-zinc-400">
          {title}
        </h2>
      )}

      <Marquee speed={speed} className="o-w-full">
        <ul className="o-flex o-items-center">
          {logos.map((logo, index) => (
            <li key={index} className="o-flex o-shrink-0 o-items-center o-px-8">
              {logo}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}
