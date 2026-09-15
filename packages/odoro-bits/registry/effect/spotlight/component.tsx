/**
 * Pointer halo on a card.
 *
 * ## Two variables, not a render
 *
 * The position of the halo changes on every movement of the pointer. Carrying
 * it in React state would mean one render per event — several dozen per second
 * over the whole hover — to move a gradient that the compositor knows how to
 * move on its own.
 *
 * Two CSS variables are therefore written on the element, and the gradient
 * follows them. React renders once only, at mount.
 *
 * ## No loop either
 *
 * Unlike the attraction, this halo needs no damping: it is **under** the
 * pointer, and any lag would show as an offset. It therefore follows the event
 * directly — the only case where that is the right answer.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface SpotlightOwnProps {
  /** Content of the card. */
  children: ReactNode
  /** Diameter of the halo, in pixels. @defaultValue 320 */
  size?: number
  /** Colour of the halo. A value, not a role. */
  color?: string
  /** Also lights the border. @defaultValue true */
  border?: boolean
}

/** All properties. */
export type SpotlightProps = Customisable<SpotlightOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-spotlight'

/** Sets the halo rules, once per document. */
function ensureSpotlightRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-spotlight]{position:relative;isolation:isolate}',
    '[data-o-spotlight]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;opacity:0;transition:opacity 200ms linear;',
    'background:radial-gradient(var(--o-spot-size) circle at var(--o-spot-x) var(--o-spot-y),var(--o-spot-color),transparent 70%)',
    '}',
    '[data-o-spotlight][data-o-spotlight-on]::before{opacity:1}',
    // The lit border uses a mask: a gradient paints the outline without
    // needing a second element superimposed.
    '[data-o-spotlight-border]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'border-radius:inherit;padding:1px;opacity:0;transition:opacity 200ms linear;',
    'background:radial-gradient(var(--o-spot-size) circle at var(--o-spot-x) var(--o-spot-y),var(--o-spot-color),transparent 60%);',
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude',
    '}',
    '[data-o-spotlight-border][data-o-spotlight-on]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Lights a card under the pointer.
 *
 * @example
 * <Spotlight className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>A card</h3>
 * </Spotlight>
 */
export function Spotlight({
  children,
  size = 320,
  color = 'oklch(100% 0 0 / 0.12)',
  border = true,
  ...rest
}: SpotlightOwnProps & SpotlightProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureSpotlightRule()

  useEffect(() => {
    if (host === null || reduced) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      host.style.setProperty('--o-spot-x', `${String(event.clientX - box.left)}px`)
      host.style.setProperty('--o-spot-y', `${String(event.clientY - box.top)}px`)
      host.setAttribute('data-o-spotlight-on', '')
    }

    const onLeave = (): void => host.removeAttribute('data-o-spotlight-on')

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, reduced])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-spot-size': `${String(size)}px`,
          '--o-spot-color': color,
        } as CSSProperties
      }
      data-o-spotlight={reduced ? undefined : ''}
      data-o-spotlight-border={border && !reduced ? '' : undefined}
    >
      {children}
    </div>
  )
}
