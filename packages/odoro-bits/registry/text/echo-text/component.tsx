/**
 * Echoes: faded copies of the text follow the pointer, each with a longer and
 * longer lag. The original does not move.
 *
 * ## The lag is a transition duration, not a loop
 *
 * All the copies aim at the same target — two CSS variables that the pointer
 * writes. What tells them apart is the time they take to reach it: the first
 * is quick, the last drags. During a movement, each is therefore at a
 * different point along the path, and the text leaves a trail — without a
 * single frame computed in JavaScript, without a single React render per
 * event.
 *
 * ## The original stays crisp, and stays the only text
 *
 * The echoes are ornaments: decreasing opacity, increasing blur, and
 * `aria-hidden` — for a screen reader there is only one text. Under reduced
 * motion, the copies are not rendered at all.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface EchoTextOwnProps {
  /** Text to repeat. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Number of copies. @defaultValue 3 */
  copies?: number
  /** Lag of the first copy, in milliseconds; each following copy doubles it. @defaultValue 220 */
  lag?: number
  /** Blur added to each copy, in pixels. @defaultValue 1 */
  spread?: number
}

/** All properties. */
export type EchoTextProps = Customisable<EchoTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-echo-text'

/** Share of the path towards the pointer that the echoes travel. */
const FOLLOW = 0.3

/** Sets the echo rules, once per document. */
function ensureEchoRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-echo]{position:relative;display:inline-block}',
    '[data-o-echo-copy]{',
    'position:absolute;inset:0;pointer-events:none;user-select:none;',
    'transform:translate(var(--o-echo-x),var(--o-echo-y));',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Has echoes of the text follow the pointer, the original staying crisp.
 *
 * @example
 * <EchoText as="h1" className="o-text-5xl o-font-extrabold">
 *   Afterglow
 * </EchoText>
 *
 * @example
 * // Two echoes only, heavily trailing.
 * <EchoText copies={2} lag={400}>Slow</EchoText>
 */
export function EchoText({
  children,
  as: Tag = 'span',
  copies = 3,
  lag = 220,
  spread = 1,
  ...rest
}: EchoTextProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)
  ensureEchoRule()

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const bounds = element.getBoundingClientRect()
      const x = (event.clientX - bounds.left - bounds.width / 2) * FOLLOW
      const y = (event.clientY - bounds.top - bounds.height / 2) * FOLLOW
      element.style.setProperty('--o-echo-x', `${String(x)}px`)
      element.style.setProperty('--o-echo-y', `${String(y)}px`)
    }
    const onLeave = (): void => {
      // Back to rest: the echoes line up under the original, each at its own
      // pace — it is the same transition that brings them back.
      element.style.setProperty('--o-echo-x', '0px')
      element.style.setProperty('--o-echo-y', '0px')
    }

    element.addEventListener('pointermove', onMove, { passive: true })
    element.addEventListener('pointerleave', onLeave)
    return () => {
      element.removeEventListener('pointermove', onMove)
      element.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced])

  const { className, style } = mergePresentation({}, rest)

  // Reduced motion: the original, alone.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const echoStyle = {
    ...style,
    '--o-echo-x': '0px',
    '--o-echo-y': '0px',
  } as CSSProperties

  const count = Math.max(2, Math.min(4, Math.round(copies)))

  return (
    <Tag {...rest} ref={host} className={className} style={echoStyle} data-o-echo="">
      {children}
      {Array.from({ length: count }, (_, index) => {
        const rank = index + 1
        return (
          <span
            key={rank}
            aria-hidden
            data-o-echo-copy=""
            style={{
              // The further the echo, the slower, paler and blurrier it is.
              transition: `transform ${String(lag * rank)}ms ease-out`,
              opacity: 0.3 * Math.pow(0.65, index),
              filter: `blur(${String(rank * spread)}px)`,
            }}
          >
            {children}
          </span>
        )
      })}
    </Tag>
  )
}
