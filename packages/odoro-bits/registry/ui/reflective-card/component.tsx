/**
 * Reflective card: a metallic reflection turns around the card following the
 * pointer, on the hairline as much as on the surface.
 *
 * ## An angle, not a position
 *
 * The glow and the spotlight place a light **on** the card. A metal does not
 * do that: it returns a light that comes **from a direction**. The whole
 * effect therefore holds in a single number, the angle between the centre of
 * the card and the pointer, which orients three gradients: a conic ring on the
 * hairline, a band of reflection on the surface, and a fine brushing that
 * turns along with it. The brushing is what makes the material read as metal
 * and not as glass: without it, the ring would be a plain gradient turning.
 *
 * ## The light comes from the top left at rest
 *
 * The angle is that of the vector going from a reference point to the pointer,
 * and that point is offset towards the bottom and the right, not at the exact
 * centre. At rest the damped pointer returns to the centre, and the angle from
 * the centre would be undefined; from the offset point, the vector points to
 * the top left — the default lighting of any interface. The card thus has a
 * plausible reflection even before the first gesture.
 *
 * The angle is expressed in the convention of CSS gradients: zero towards the
 * top, clockwise. The conic gradient starts from that angle with a highlight,
 * the band of reflection is pushed towards the lit side, and the brushing is
 * perpendicular to it.
 *
 * ## Two tints drawn from the ink, not from a hard-coded grey
 *
 * The highlight of the metal is the current ink mixed with transparent, the
 * dark one is the hairline of the theme. In light, the ink is dark and the
 * metal reads as tin; in dark, it is light and the metal reads as chrome. The
 * same card, legible in both, without a single colour written down.
 *
 * ## What remains on touch and under reduced motion
 *
 * The reflection keeps its rest angle, frozen: the card stays metallic, it no
 * longer turns. This is the final state, not the empty state.
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
export interface ReflectiveCardOwnProps {
  /** Content of the card. */
  children: ReactNode
  /** Speed at which the reflection catches up with the pointer. @defaultValue 6 */
  speed?: number
  /** Intensity of the reflection on the surface, from zero to one. @defaultValue 0.12 */
  shine?: number
  /** Intensity of the brushing, from zero to one. Zero removes it. @defaultValue 0.06 */
  brush?: number
}

/** All properties. */
export type ReflectiveCardProps = Customisable<ReflectiveCardOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-reflective-card'

/** Rest angle, in degrees, CSS convention: a lamp at the top left. */
const REST_ANGLE = -45

/** Offset of the reference point towards the bottom and the right, in normalised units. */
const REFERENCE = 0.5

/** Applies the surface, the ring and the reflection, once per document. */
function ensureReflectiveRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // No hidden overflow: it would clip the ring, which lives on the border.
    '[data-o-reflect]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid transparent;',
    '--o-reflect-hi:color-mix(in oklab,currentColor 70%,transparent);',
    '--o-reflect-lo:var(--o-theme-line);',
    '}',
    // The surface: a band of reflection pushed towards the lit side, and a
    // fine brushing perpendicular to the light, both under the content.
    '[data-o-reflect]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;',
    'background:',
    'linear-gradient(var(--o-reflect-angle),',
    'transparent 40%,',
    'color-mix(in oklab,currentColor var(--o-reflect-shine),transparent) 72%,',
    'transparent 100%),',
    'repeating-linear-gradient(calc(var(--o-reflect-angle) + 90deg),',
    'transparent 0 2px,',
    'color-mix(in oklab,currentColor var(--o-reflect-brush),transparent) 2px 3px);',
    '}',
    // The ring: a conic gradient starting from the angle of the light, held on
    // the hairline by a mask. Two opposite highlights, two darks between them:
    // the reflection off an edge of metal.
    '[data-o-reflect]::after{',
    'content:"";position:absolute;inset:-1px;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'background:conic-gradient(from var(--o-reflect-angle),',
    'var(--o-reflect-hi) 0deg,var(--o-reflect-lo) 70deg,var(--o-reflect-lo) 110deg,',
    'var(--o-reflect-hi) 180deg,var(--o-reflect-lo) 250deg,var(--o-reflect-lo) 290deg,',
    'var(--o-reflect-hi) 360deg);',
    '-webkit-mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    'mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * A card with a metallic reflection that follows the pointer.
 *
 * @example
 * <ReflectiveCard className="o-rounded-xl o-p-6">
 *   <h3>A card</h3>
 * </ReflectiveCard>
 *
 * @example
 * // A sharper reflection, without brushing.
 * <ReflectiveCard shine={0.25} brush={0}>Content</ReflectiveCard>
 */
export function ReflectiveCard({
  children,
  speed = 6,
  shine = 0.12,
  brush = 0.06,
  ...rest
}: ReflectiveCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'reflection: pointer' })
  ensureReflectiveRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    let last = REST_ANGLE

    const subscription = clock.subscribe(
      () => {
        // Vector from the reference point, offset to the bottom right, towards
        // the pointer; then in CSS convention, zero upwards, clockwise.
        const { x, y } = pointer.current
        const angle = (Math.atan2(x - REFERENCE, -(y - REFERENCE)) * 180) / Math.PI

        if (Math.abs(angle - last) < 0.05) return
        last = angle
        host.style.setProperty('--o-reflect-angle', `${angle.toFixed(2)}deg`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'reflection' },
    )

    return () => {
      subscription.unsubscribe()
      host.style.removeProperty('--o-reflect-angle')
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
          '--o-reflect-angle': `${String(REST_ANGLE)}deg`,
          '--o-reflect-shine': `${String(shine * 100)}%`,
          '--o-reflect-brush': `${String(brush * 100)}%`,
        } as CSSProperties
      }
      data-o-reflect=""
    >
      {children}
    </div>
  )
}
