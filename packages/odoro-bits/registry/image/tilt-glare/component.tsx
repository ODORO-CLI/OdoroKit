/**
 * Tilt and glare: an image card that pivots towards the pointer, with a glare
 * that moves the opposite way.
 *
 * ## The perspective is on the parent, the rotation on the child
 *
 * Both on the same element would give a flat tilt — the transform would apply
 * with no vanishing point, and the image would look sheared rather than
 * turned. The parent sets the depth, the child turns inside it.
 *
 * ## The glare goes opposite the pointer
 *
 * That is what makes it read as a light and not as a cursor: when the right
 * edge sinks, the light slides to the left, as on a varnished surface being
 * tilted. It is painted as the background of a pseudo-element — never a layer
 * that would intercept the pointer — and its colour comes from a token, not
 * from a hard-coded white that would ignore the theme.
 *
 * ## Damping, not direct tracking
 *
 * An image stuck to the pointer has no mass. The lag comes from an exponential
 * damping independent of the refresh rate: `k = 1 - exp(-speed x dt)`. Angles
 * and position of the glare are written into the style from the loop, with no
 * React render at all.
 *
 * ## What remains without motion, and under a finger
 *
 * A flat image. The tilt carried no information. On a touch screen there is no
 * hover: the component does not even subscribe.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-tilt-glare'

/** Sets the card rules, once per document. */
function ensureTiltGlareRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tilt-glare]{perspective:900px}',
    '[data-o-tg-inner]{',
    'position:relative;height:100%;overflow:hidden;border-radius:inherit;',
    'transform-style:preserve-3d;will-change:transform;',
    // The transition only serves the return to rest: during the hover, it is
    // the loop that writes on every frame.
    'transition:transform 420ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-tilt-glare-active] [data-o-tg-inner]{transition:none}',
    // The glare: a background, hence above the image but out of reach of the
    // pointer and of assistive technologies.
    '[data-o-tg-inner]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;',
    'background:radial-gradient(circle at var(--o-tg-gx) var(--o-tg-gy),',
    'color-mix(in oklch,var(--o-palette-zinc-50) var(--o-tg-glare),transparent),',
    'transparent 60%);',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-tilt-glare-active] [data-o-tg-inner]::after{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface TiltGlareOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /**
   * Maximum tilt, in degrees.
   *
   * Beyond fifteen or so, the image stops looking settled and starts to pitch.
   *
   * @defaultValue 10
   */
  tilt?: number
  /** Intensity of the glare, from 0 to 1. Zero removes it. @defaultValue 0.25 */
  glare?: number
}

/** All properties: its own, plus those of an image. */
export type TiltGlareProps = Customisable<TiltGlareOwnProps, 'img'>

/**
 * Tilts an image towards the pointer, glare on the opposite side.
 *
 * @example
 * <TiltGlare src="/photo.jpg" alt="View of the workshop" className="o-rounded-xl" />
 *
 * @example
 * // More pronounced, with no glare.
 * <TiltGlare src="/photo.jpg" alt="" tilt={14} glare={0} />
 */
export function TiltGlare({
  src,
  alt,
  ratio = 1.777,
  tilt = 10,
  glare = 0.25,
  ...rest
}: TiltGlareProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)

  ensureTiltGlareRule()

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const frame = host.current
    const card = inner.current
    if (frame === null || card === null) return

    // Aimed and current: the gap between the two is the whole effect.
    let aimX = 0
    let aimY = 0
    let x = 0
    let y = 0
    let inside = false
    let handle = 0
    let last = performance.now()

    const onMove = (event: PointerEvent): void => {
      const box = frame.getBoundingClientRect()

      // Brought back to [-1, 1] from the centre: the tilt does not depend on
      // the size of the card.
      const nx = ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1
      const ny = ((event.clientY - box.top) / Math.max(box.height, 1)) * 2 - 1

      aimX = nx
      aimY = ny

      if (!inside) {
        inside = true
        frame.setAttribute('data-o-tilt-glare-active', '')
      }
    }

    const onLeave = (): void => {
      inside = false
      aimX = 0
      aimY = 0
      frame.removeAttribute('data-o-tilt-glare-active')
      card.style.transform = ''
    }

    const step = (now: number): void => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      if (inside) {
        // Damping independent of the refresh rate: see the module header.
        const k = 1 - Math.exp(-10 * dt)
        x += (aimX - x) * k
        y += (aimY - y) * k

        // The sign of X is flipped: pointing to the right must pivot the right
        // edge backwards, not forwards.
        card.style.transform = `rotateX(${String(-y * tilt)}deg) rotateY(${String(x * tilt)}deg)`

        // The glare is placed opposite the damped position: the light slides
        // towards the edge that rises.
        card.style.setProperty('--o-tg-gx', `${String((0.5 - x / 2) * 100)}%`)
        card.style.setProperty('--o-tg-gy', `${String((0.5 - y / 2) * 100)}%`)
      }

      handle = requestAnimationFrame(step)
    }

    frame.addEventListener('pointermove', onMove, { passive: true })
    frame.addEventListener('pointerleave', onLeave, { passive: true })
    handle = requestAnimationFrame(step)

    return () => {
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(handle)
      onLeave()
    }
  }, [reduced, tilt])

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    '--o-tg-glare': `${String(Math.min(1, Math.max(0, glare)) * 100)}%`,
    '--o-tg-gx': '50%',
    '--o-tg-gy': '50%',
  } as CSSProperties

  return (
    <div ref={host} className={className} style={hostStyle} data-o-tilt-glare="">
      <div ref={inner} data-o-tg-inner="">
        <img {...rest} src={src} alt={alt} className="o-size-full o-object-cover" />
      </div>
    </div>
  )
}
