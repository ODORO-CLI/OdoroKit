/**
 * Glowing halo: a diffuse light that follows the pointer, and stretches when it flies.
 *
 * ## A light, not an outline
 *
 * The halo cursor draws a ring: an object, with an edge. This one has no edge
 * at all — it is a radial gradient that dies out before reaching its bounds,
 * hence a light laid over the page. It does not read as a replacement cursor
 * but as lighting, and that is why it never hides the system cursor.
 *
 * ## The stretch comes from the speed, not from one more spring
 *
 * The position is damped; the **speed** of that damped position is the only
 * extra datum. It gives an angle and a length: the glow lengthens along the
 * direction of travel and thins across it, at constant volume. A second body
 * that trailed would have given a two-element comet; a single transform is
 * enough, and it composites.
 *
 * The stretch is capped. Without a cap, a brusque back and forth produces a
 * bar of light crossing the screen — a second of inattention becomes an
 * artefact.
 *
 * ## What the loop writes
 *
 * One transform, and nothing else. The size, the colour and the opacity are
 * applied once: they depend only on the properties.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no element is created. Nor under reduced motion: a
 * glow that follows is a continuous embellishment, with no final state to
 * apply.
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

/** Properties specific to the component. */
export interface GlowCursorOwnProps {
  /**
   * Lit area.
   *
   * Provided, the glow listens only to it and is clipped to it. Absent, it
   * takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Diameter of the glow at rest, in pixels. @defaultValue 320 */
  size?: number
  /** Catch-up speed. The lower, the more the glow trails. @defaultValue 6 */
  speed?: number
  /** Strength of the glow, from zero to one. @defaultValue 0.55 */
  intensity?: number
  /** Stretch along the direction of travel, from zero to one. @defaultValue 0.5 */
  trail?: number
  /** Colour of the glow. A value, not a role. */
  color?: string
}

/** All properties. */
export type GlowCursorProps = Customisable<GlowCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-glow-cursor'

/** Default hue of the glow: the brand colour. */
const DEFAULT_COLOR = 'var(--o-palette-brand-500)'

/** Maximum lengthening, as a fraction of the diameter. See the header. */
const MAX_STRETCH = 0.8

/** Sets the glow rules, once per document. */
function ensureGlowCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-glow-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-glow-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-glow-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 260ms linear;',
    '}',
    '[data-o-glow]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Lays a glow that follows the pointer.
 *
 * @example
 * // Over the whole page.
 * <GlowCursor />
 *
 * @example
 * // On a dark hero: wide, lazy, heavily stretched.
 * <GlowCursor size={480} speed={3} trail={0.9}>
 *   <section className="o-p-16">…</section>
 * </GlowCursor>
 */
export function GlowCursor({
  children,
  size = 320,
  speed = 6,
  intensity = 0.55,
  trail = 0.5,
  color = DEFAULT_COLOR,
  ...rest
}: GlowCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureGlowCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: nothing to light, nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const away = -size

    const layer = document.createElement('div')
    layer.setAttribute('data-o-glow-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const glow = document.createElement('span')
    glow.setAttribute('data-o-glow', '')
    glow.style.width = `${String(size)}px`
    glow.style.height = `${String(size)}px`
    glow.style.margin = `${String(-size / 2)}px`
    glow.style.opacity = Math.min(1, Math.max(0, intensity)).toFixed(3)
    // The glow dies out before its edge: that is what makes it read as a
    // light and not as a blurred disc.
    glow.style.background = `radial-gradient(circle, ${color} 0%, color-mix(in oklab, ${color} 35%, transparent) 40%, transparent 72%)`
    layer.append(glow)

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = away
    let targetY = away
    let x = away
    let y = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        x = targetX
        y = targetY
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        const stepX = (targetX - x) * factor
        const stepY = (targetY - y) * factor
        x += stepX
        y += stepY

        // The speed of the frame, brought back to the diameter: a movement of
        // half a diameter in one frame gives the maximum stretch.
        const travelled = Math.hypot(stepX, stepY)
        const stretch = Math.min(MAX_STRETCH, (travelled / (size * 0.5)) * trail)
        const angle = (Math.atan2(stepY, stepX) * 180) / Math.PI

        glow.style.transform = [
          `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`,
          `rotate(${angle.toFixed(1)}deg)`,
          // Roughly constant volume: what it gains lengthwise, it loses
          // crosswise.
          `scale(${(1 + stretch).toFixed(3)},${(1 - stretch * 0.45).toFixed(3)})`,
        ].join(' ')
      },
      { name: 'glow-cursor : glow', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, size, speed, intensity, trail, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-glow-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
