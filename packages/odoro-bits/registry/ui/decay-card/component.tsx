/**
 * Decay card: the image warps and washes out when the pointer crosses it, all
 * the more as it moves fast, then repairs itself when the pointer stops.
 *
 * ## An SVG filter driven by speed, not by position
 *
 * A distortion that follows the pointer position is a magnifying glass. What
 * makes a **decay** read as one is that it follows the gesture itself: a slow
 * pass brushes the image, a sharp pass tears it. The measured quantity is
 * therefore the pointer speed, and nothing else.
 *
 * The filter is a turbulence noise that displaces the pixels of the image
 * (`feDisplacementMap`). Its amplitude is the only attribute written per
 * frame, straight on the filter node: neither React nor the style is gone
 * through. A second node desaturates the image as it warps — an image that
 * decays also loses its colors.
 *
 * ## Two dampings
 *
 * The measured speed falls back on its own when the events stop — without
 * that the image would stay warped at the last gesture, the pointer standing
 * still on it. And the displayed amplitude catches up with that target with a
 * lag independent of the frame rate, so that the repair has a duration and not
 * a jump.
 *
 * ## The image overflows its window a little
 *
 * A pixel displacement pulls transparency in from the edges. The image is
 * therefore rendered a little larger than its window, which crops it: the
 * warped edges stay covered.
 *
 * ## What is left on touch and under reduced motion
 *
 * The intact image, with its caption. Decay is transient by nature; its final
 * state is a repaired image.
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
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface DecayCardOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the image. @defaultValue 1.5 */
  ratio?: number
  /** Maximum pixel displacement, in pixels. @defaultValue 48 */
  strength?: number
  /** Repair speed. The higher, the faster the image repairs itself. @defaultValue 5 */
  speed?: number
  /** Fineness of the noise. The lower, the wider the waves. @defaultValue 0.012 */
  grain?: number
  /** Caption or content below the image. */
  children?: ReactNode
}

/** All the properties. */
export type DecayCardProps = Customisable<DecayCardOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-decay-card'

/** Places the card and its image window, once per document. */
function ensureDecayRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-decay]{',
    'position:relative;overflow:hidden;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-decay-window]{',
    'position:relative;overflow:hidden;aspect-ratio:var(--o-decay-ratio);',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    // A little larger than its window: the warped edges stay covered.
    '[data-o-decay-window] img{',
    'display:block;width:100%;height:100%;object-fit:cover;',
    'transform:scale(1.08);',
    '}',
    '[data-o-decay-filter]{position:absolute;width:0;height:0;overflow:hidden}',
  ].join('')
  document.head.append(style)
}

/**
 * A card whose image decays under a fast pointer.
 *
 * @example
 * <DecayCard src="/photo.jpg" alt="View of the workshop" className="o-rounded-xl">
 *   <p className="o-p-4">A caption</p>
 * </DecayCard>
 *
 * @example
 * // Harsher, wider waves.
 * <DecayCard src="/photo.jpg" alt="" strength={90} grain={0.006} />
 */
export function DecayCard({
  src,
  alt,
  ratio = 1.5,
  strength = 48,
  speed = 5,
  grain = 0.012,
  children,
  ...rest
}: DecayCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const displacement = useRef<SVGFEDisplacementMapElement | null>(null)
  const saturation = useRef<SVGFEColorMatrixElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)
  // The colons of the React identifier do not go through `url(#...)`.
  const filterId = `o-decay-${useId().replace(/:/g, '')}`
  ensureDecayRules()

  useEffect(() => {
    const map = displacement.current
    const matrix = saturation.current
    const picture = image.current
    if (host === null || map === null || matrix === null || picture === null || reduced)
      return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    let lastX = 0
    let lastY = 0
    let lastTime = 0
    let target = 0
    let current = 0
    let applied = false

    const onMove = (event: PointerEvent): void => {
      const now = event.timeStamp
      if (lastTime !== 0) {
        const dt = Math.max(now - lastTime, 1)
        const velocity = Math.hypot(event.clientX - lastX, event.clientY - lastY) / dt
        // One pixel per millisecond is a sharp gesture: it is worth the whole
        // amplitude. The maximum holds the target until the writing catches up.
        target = Math.max(target, Math.min(strength, velocity * strength))
      }
      lastX = event.clientX
      lastY = event.clientY
      lastTime = now
    }

    const onLeave = (): void => {
      lastTime = 0
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        // The target falls back on its own: see the header.
        target *= Math.exp(-4 * delta)
        current += (target - current) * (1 - Math.exp(-speed * delta))

        if (current < 0.2) {
          if (applied) {
            applied = false
            picture.style.filter = ''
          }
          return
        }

        if (!applied) {
          applied = true
          picture.style.filter = `url(#${filterId})`
        }
        map.setAttribute('scale', current.toFixed(1))
        matrix.setAttribute(
          'values',
          (1 - Math.min(1, current / strength) * 0.8).toFixed(3),
        )
      },
      { priority: CLOCK_PRIORITY.render, name: 'decay' },
    )

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      picture.style.filter = ''
    }
  }, [host, reduced, strength, speed, filterId])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ ...style, '--o-decay-ratio': String(ratio) } as CSSProperties}
      data-o-decay=""
    >
      <svg data-o-decay-filter="" aria-hidden="true" focusable="false">
        <filter id={filterId} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={String(grain)}
            numOctaves={2}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="noise"
            scale={0}
            xChannelSelector="R"
            yChannelSelector="G"
            result="warped"
          />
          <feColorMatrix ref={saturation} in="warped" type="saturate" values="1" />
        </filter>
      </svg>
      <div data-o-decay-window="">
        <img ref={image} src={src} alt={alt} draggable={false} />
      </div>
      {children}
    </div>
  )
}
