/**
 * Glow card: the border lights up where the pointer passes.
 *
 * ## Two variables, not a render
 *
 * As for the pointer halo, the position of the glow is written as CSS
 * variables directly on the element: React renders only once, at mount, and
 * the gradient follows the pointer without a single render being triggered.
 * The glow is **on** the path of the pointer, so it follows the event
 * directly — a damping would read as a lag.
 *
 * ## Only the border lights up
 *
 * The gradient is painted on a one pixel ring obtained by a mask: two layers
 * whose intersection is subtracted, only the outline is left. That is what
 * distinguishes this card from the halo: the light does not spread over the
 * background, it runs along the edge.
 *
 * ## Inert where there is no fine pointer
 *
 * By finger, there is no hover: the glow would only appear at the moment of
 * the touch, like a miss. The effect is only installed if the device has a
 * fine pointer capable of hovering — elsewhere, the card is a card.
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

/** Properties owned by the component. */
export interface GlowCardOwnProps {
  /** Content of the card. */
  children: ReactNode
  /** Radius of the glow, in pixels. @defaultValue 200 */
  radius?: number
  /** Intensity of the glow, from zero to one. @defaultValue 0.8 */
  strength?: number
  /** First color of the glow. @defaultValue brand hue */
  from?: string
  /** Second color, toward which the glow dies out. @defaultValue fuchsia */
  to?: string
}

/** All the properties. */
export type GlowCardProps = Customisable<GlowCardOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glow-card'

/** Sets the ring and its mask, once per document. */
function ensureGlowRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glow]{position:relative}',
    '[data-o-glow]::before{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'opacity:0;transition:opacity 240ms linear;',
    'background:radial-gradient(var(--o-glow-radius) circle at var(--o-glow-x) var(--o-glow-y),',
    'var(--o-glow-from),var(--o-glow-to) 55%,transparent 80%);',
    // The mask subtracts the inside: the gradient only paints the ring.
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    '}',
    '[data-o-glow][data-o-glow-on]::before{opacity:var(--o-glow-strength)}',
  ].join('')
  document.head.append(style)
}

/**
 * Runs a glow along the border, under the pointer.
 *
 * @example
 * <GlowCard className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>A card</h3>
 * </GlowCard>
 *
 * @example
 * // A wide and quiet glow.
 * <GlowCard radius={320} strength={0.5} className="o-rounded-2xl o-p-8">
 *   Content
 * </GlowCard>
 */
export function GlowCard({
  children,
  radius = 200,
  strength = 0.8,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-fuchsia-500)',
  ...rest
}: GlowCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureGlowRule()

  useEffect(() => {
    if (host === null || reduced) return

    // No fine pointer, no hover: the effect is not installed.
    // See the module header.
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      host.style.setProperty('--o-glow-x', `${String(event.clientX - box.left)}px`)
      host.style.setProperty('--o-glow-y', `${String(event.clientY - box.top)}px`)
      host.setAttribute('data-o-glow-on', '')
    }

    const onLeave = (): void => host.removeAttribute('data-o-glow-on')

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
          '--o-glow-radius': `${String(radius)}px`,
          '--o-glow-strength': String(strength),
          '--o-glow-from': from,
          '--o-glow-to': to,
        } as CSSProperties
      }
      data-o-glow=""
    >
      {children}
    </div>
  )
}
