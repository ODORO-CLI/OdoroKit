/**
 * Tilt card: it pivots towards the pointer, with a glare that follows it.
 *
 * ## The perspective is on the parent, the rotation on the child
 *
 * Both on the same element would give a flat tilt — the transform would apply
 * with no vanishing point, and the card would look sheared rather than turned.
 * The parent sets the depth, the child turns inside it.
 *
 * ## Damping, not direct following
 *
 * A card glued to the pointer gives an object with no mass: it arrives before
 * the gesture is finished. The lag — a tenth of a second — is what makes it
 * heavy.
 *
 *     k = 1 - exp(-speed * dt)
 *
 * Independent of the frame rate: a fixed coefficient would make the card twice
 * as brisk on a 120 Hz screen, and the same component would not have the same
 * weight from one machine to the next.
 *
 * ## The glare is a background, not an element
 *
 * A stacked layer would call for a stacking context and would intercept the
 * pointer. A radial gradient whose centre is moved costs only one variable,
 * paints under the content, and never receives a click.
 *
 * ## It never re-renders
 *
 * The angles and the position of the glare are written into the style from the
 * loop. Going through React state would restart a render of the card and of
 * everything it holds on every pixel travelled.
 *
 * ## What is left without motion, and for touch
 *
 * A card. The tilt carried no information — it was only an answer to the
 * gesture — so removing it removes nothing. On a touch screen there is no
 * hover: the component does not even subscribe.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface TiltCardOwnProps {
  /** The content of the card. */
  children: ReactNode
  /**
   * Maximum tilt, in degrees.
   *
   * Beyond ten or so, the card stops looking settled and starts to sway.
   *
   * @defaultValue 8
   */
  tilt?: number
  /**
   * Depth of the perspective, in pixels.
   *
   * The smaller it is, the more pronounced the deformation.
   *
   * @defaultValue 900
   */
  perspective?: number
  /**
   * Speed at which the card reaches the target angle.
   *
   * @defaultValue 10
   */
  speed?: number
  /**
   * Strength of the glare, from 0 to 1. Zero removes it.
   *
   * @defaultValue 0.18
   */
  glare?: number
  /**
   * Colour of the glare.
   *
   * A value, not a hard-coded colour: written out in the clear it would escape
   * the theme, and a dark card would keep the white glare of a light one.
   *
   * @defaultValue the lightest of the neutral scale
   */
  glareColour?: string
}

/** All properties. */
export type TiltCardProps = Customisable<TiltCardOwnProps, 'div'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-tilt-card'

/** Applies the rules of the card, once per document. */
function ensureTiltRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tilt]{perspective:var(--o-tilt-depth)}',
    '[data-o-tilt-inner]{',
    'position:relative;height:100%;',
    'transform-style:preserve-3d;will-change:transform;',
    // The transition only serves the return to rest: during hover, the loop is
    // what writes on every frame.
    'transition:transform 420ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-tilt-active] [data-o-tilt-inner]{transition:none}',
    // The glare: a background, therefore under the content and out of the
    // pointer's reach.
    '[data-o-tilt-inner]::before{',
    'content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;',
    'background:radial-gradient(circle at var(--o-tilt-gx) var(--o-tilt-gy),',
    'color-mix(in oklch,var(--o-tilt-glare-colour) var(--o-tilt-glare),transparent),',
    'transparent 60%);',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-tilt-active] [data-o-tilt-inner]::before{opacity:1}',
  ].join('')
  document.head.append(style)
}

/**
 * A card that tilts towards the pointer.
 *
 * @example
 * <TiltCard className="o-rounded-xl o-border-w-1 o-p-6">
 *   <h3>A title</h3>
 *   <p>And its text.</p>
 * </TiltCard>
 *
 * @example
 * // More pronounced, with no glare.
 * <TiltCard tilt={14} perspective={600} glare={0}>…</TiltCard>
 */
export function TiltCard({
  children,
  tilt = 8,
  perspective = 900,
  speed = 10,
  glare = 0.18,
  glareColour = 'var(--o-palette-zinc-50)',
  ...rest
}: TiltCardProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  const card = useRef<HTMLDivElement | null>(null)

  ensureTiltRule()

  useEffect(() => {
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const frame = host.current
    const inner = card.current
    if (frame === null || inner === null) return

    // Target and current: the gap between the two is the whole effect.
    let targetX = 0
    let targetY = 0
    let x = 0
    let y = 0
    let inside = false
    let raf = 0
    let last = performance.now()

    const onMove = (event: PointerEvent) => {
      const box = frame.getBoundingClientRect()

      // Brought back to [-1, 1] from the centre: that is what makes the tilt
      // independent of the size of the card.
      const nx = ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1
      const ny = ((event.clientY - box.top) / Math.max(box.height, 1)) * 2 - 1

      targetX = nx
      targetY = ny

      inner.style.setProperty('--o-tilt-gx', `${String(((nx + 1) / 2) * 100)}%`)
      inner.style.setProperty('--o-tilt-gy', `${String(((ny + 1) / 2) * 100)}%`)

      if (!inside) {
        inside = true
        frame.setAttribute('data-o-tilt-active', '')
      }
    }

    const onLeave = () => {
      inside = false
      targetX = 0
      targetY = 0
      frame.removeAttribute('data-o-tilt-active')
      inner.style.transform = ''
    }

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1)
      last = now

      if (inside) {
        // Frame-rate independent damping: see the header.
        const k = 1 - Math.exp(-speed * dt)
        x += (targetX - x) * k
        y += (targetY - y) * k

        // The sign of X is flipped: pointing to the right must pivot the right
        // edge backwards, not forwards.
        inner.style.transform = `rotateX(${String(-y * tilt)}deg) rotateY(${String(x * tilt)}deg)`
      }

      raf = requestAnimationFrame(step)
    }

    frame.addEventListener('pointermove', onMove, { passive: true })
    frame.addEventListener('pointerleave', onLeave, { passive: true })
    raf = requestAnimationFrame(step)

    return () => {
      frame.removeEventListener('pointermove', onMove)
      frame.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(raf)
      onLeave()
    }
  }, [reduced, tilt, speed])

  const { className, style } = mergePresentation({}, rest)

  const frameStyle = {
    ...style,
    '--o-tilt-depth': `${String(perspective)}px`,
    '--o-tilt-glare': `${String(glare * 100)}%`,
    '--o-tilt-glare-colour': glareColour,
    '--o-tilt-gx': '50%',
    '--o-tilt-gy': '50%',
  } as CSSProperties

  return (
    <div {...rest} ref={host} className={className} style={frameStyle} data-o-tilt="">
      <div ref={card} data-o-tilt-inner="">
        {children}
      </div>
    </div>
  )
}
