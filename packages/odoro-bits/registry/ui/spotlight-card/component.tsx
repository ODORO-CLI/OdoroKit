/**
 * Spotlight card: a damped glow follows the pointer on the surface, and the
 * border lights up where it passes.
 *
 * ## What sets it apart from the glow card
 *
 * The glow card paints only the ring, and sticks to the pointer. Here the
 * light spreads **on the surface** — a spotlight placed above the card — and
 * the ring is only the edge of that beam, where it touches the hairline. And
 * the glow is damped: it arrives slightly after the gesture, like a lamp being
 * aimed. It is that lag which gives it a mass; a glow stuck to the pointer
 * reads as a cursor, not as a light.
 *
 * ## Two layers, two variables
 *
 * The glow is a `::before` under the content, the ring an `::after` obtained
 * by the same mask as the glow card. Both read the same position, written in
 * two variables from the loop of the engine: React only renders on mount,
 * whatever the number of pixels travelled.
 *
 * ## Why the position comes from the loop and not from the event
 *
 * The damping is computed by the pointer hook, on each frame, in a ref.
 * Writing the position from the pointer event would make it jump at the
 * irregular rate at which the system delivers it; reading it in the loop gives
 * a continuous travel, and lets us stop writing as soon as the glow is there.
 *
 * ## Inert where there is no fine pointer, and under reduced motion
 *
 * On a finger there is no hover: the glow would only appear on touch, like a
 * misfire. Under reduced motion, a glow that follows the gesture is precisely
 * what is asked to be removed. In both cases the card is a card, with its
 * surface and its hairline.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Properties specific to the component. */
export interface SpotlightCardOwnProps {
  /** Content of the card. */
  children: ReactNode
  /** Radius of the glow, in pixels. @defaultValue 260 */
  radius?: number
  /** Intensity of the glow on the surface, from zero to one. @defaultValue 0.35 */
  strength?: number
  /** Speed at which the glow catches up with the pointer. Higher, sharper. @defaultValue 8 */
  speed?: number
  /** Colour of the spotlight. @defaultValue brand hue */
  color?: string
}

/** All properties. */
export type SpotlightCardProps = Customisable<SpotlightCardOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-spotlight-card'

/** Applies the surface, the glow and the ring, once per document. */
function ensureSpotlightRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // No hidden overflow: it would clip the ring, which lives on the border.
    // Both layers take the rounding by themselves.
    '[data-o-spot]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    // The glow: under the content thanks to the isolated stacking context, but
    // above the background of the card.
    '[data-o-spot]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;',
    'background:radial-gradient(var(--o-spot-radius) circle at var(--o-spot-x) var(--o-spot-y),',
    'color-mix(in oklab,var(--o-spot-color) var(--o-spot-strength),transparent),',
    'transparent 70%);',
    'opacity:0;transition:opacity 320ms ease;',
    '}',
    // The ring: the same gradient, held on the hairline by a mask.
    '[data-o-spot]::after{',
    'content:"";position:absolute;inset:-1px;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'background:radial-gradient(var(--o-spot-radius) circle at var(--o-spot-x) var(--o-spot-y),',
    'var(--o-spot-color),transparent 65%);',
    '-webkit-mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    'mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    'opacity:0;transition:opacity 320ms ease;',
    '}',
    '[data-o-spot][data-o-spot-on]::before,[data-o-spot][data-o-spot-on]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * Places a damped spotlight on a card.
 *
 * @example
 * <SpotlightCard className="o-rounded-xl o-p-6">
 *   <h3>A card</h3>
 * </SpotlightCard>
 *
 * @example
 * // A narrow, vivid beam, in another hue.
 * <SpotlightCard radius={160} strength={0.6} color="var(--o-palette-sky-500)">
 *   Content
 * </SpotlightCard>
 */
export function SpotlightCard({
  children,
  radius = 260,
  strength = 0.35,
  speed = 8,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: SpotlightCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'spotlight: pointer' })
  ensureSpotlightRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    let lastX = -1
    let lastY = -1

    const onEnter = (): void => host.setAttribute('data-o-spot-on', '')
    const onLeave = (): void => host.removeAttribute('data-o-spot-on')

    const subscription = clock.subscribe(
      () => {
        const x = ((pointer.current.x + 1) / 2) * 100
        const y = ((pointer.current.y + 1) / 2) * 100

        // Once the glow has arrived, or gone out and returned to the centre,
        // there is nothing left to write: the style stays as it is.
        if (Math.abs(x - lastX) < 0.02 && Math.abs(y - lastY) < 0.02) return

        lastX = x
        lastY = y
        host.style.setProperty('--o-spot-x', `${x.toFixed(2)}%`)
        host.style.setProperty('--o-spot-y', `${y.toFixed(2)}%`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'spotlight' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      onLeave()
    }
  }, [host, reduced, pointer])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-spot-radius': `${String(radius)}px`,
          '--o-spot-strength': `${String(strength * 100)}%`,
          '--o-spot-color': color,
          '--o-spot-x': '50%',
          '--o-spot-y': '50%',
        } as CSSProperties
      }
      data-o-spot=""
    >
      {children}
    </div>
  )
}
