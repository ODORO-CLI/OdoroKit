/**
 * Depth carousel: a stack of posters filed along Z, the front one facing us,
 * the others receding at three quarters.
 *
 * ## The position comes from the rank, not from a measurement
 *
 * Every poster knows its offset to the current step — minus two, minus one,
 * zero, one, two — and derives from it its lateral shift, its setback and its
 * angle. There is nothing to measure: neither the width of the frame, nor the
 * room taken by the neighbours. Changing step renumbers the offsets, and the
 * compositor transition makes the trip. A single React render per step.
 *
 * ## The drag writes only one transform
 *
 * During the gesture, it is the whole deck that follows the finger — one
 * transform, a single one, written straight on the element. Moving every
 * poster during the drag would mean writing as many as there are, for a motion
 * the eye reads as one block. On release, if the gesture has crossed the
 * threshold, the step changes and the deck goes back in place.
 *
 * ## This is neither the carousel nor the circular gallery
 *
 * The carousel is a flat rail that scrolls past. The circular gallery is a
 * continuous ribbon one pushes, with no step and no button. Here there is a
 * front poster, a single one, and two buttons to change it: this is an object
 * to leaf through, not a ribbon to travel along.
 *
 * ## What a screen reader sees
 *
 * The posters all stay in the document — a screen reader must be able to go
 * through the collection without having to spin it. Only the front poster
 * carries `aria-current`, and the two buttons say where they lead rather than
 * "previous" and "next" into the void.
 *
 * ## Reduced motion
 *
 * No transition: the chosen poster is in place, at its final state. The
 * buttons, the arrow keys and the drag stay the same.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** A poster of the carousel. */
export interface DepthCarouselItem {
  /** Source of the image. */
  readonly src: string
  /** Alternative text, mandatory: this is the content, not a decoration. */
  readonly alt: string
  /** Caption shown under the front poster. */
  readonly caption?: string
}

/** Properties specific to the component. */
export interface DepthCarouselOwnProps {
  /** The posters, in order. */
  items: readonly DepthCarouselItem[]
  /** Name of the carousel, announced to assistive technologies. */
  label: string
  /** Front poster, in controlled mode. */
  index?: number
  /** Front poster on mount, in uncontrolled mode. @defaultValue 0 */
  defaultIndex?: number
  /** Called when the front poster changes. */
  onIndexChange?: (index: number) => void
  /** Width of the front poster, in pixels. @defaultValue 300 */
  width?: number
  /** Lateral shift per step of offset, in pixels. @defaultValue 110 */
  spread?: number
  /** Setback per step of offset, in pixels. @defaultValue 140 */
  depth?: number
  /** Three quarter angle of the side posters, in degrees. @defaultValue 32 */
  tilt?: number
  /** Posters visible on each side. @defaultValue 3 */
  visible?: number
}

/** All the properties. */
export type DepthCarouselProps = Customisable<DepthCarouselOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-depth-carousel'

/** Drag distance, in pixels, beyond which the step changes. */
const THRESHOLD = 60

/** Places the deck, the posters and the controls, once per document. */
function ensureDepthRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-depth]{display:flex;flex-direction:column;align-items:center;gap:1rem}',
    '[data-o-depth-scene]{',
    'position:relative;width:100%;min-height:var(--o-depth-height);',
    'perspective:1100px;touch-action:pan-y;cursor:grab;',
    '}',
    '[data-o-depth-scene][data-o-depth-tire]{cursor:grabbing}',
    '[data-o-depth-scene]:focus-visible{outline:2px solid var(--o-depth-accent);outline-offset:4px;border-radius:1rem}',
    '[data-o-depth-plateau]{position:absolute;inset:0;transform-style:preserve-3d}',
    '[data-o-depth-affiche]{',
    'position:absolute;top:50%;left:50%;margin:0;width:var(--o-depth-width);',
    'transform-origin:50% 50%;backface-visibility:hidden;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-depth-affiche] img{',
    'display:block;width:100%;aspect-ratio:3 / 4;object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line),0 24px 48px -28px currentColor;',
    '}',
    '[data-o-depth-legende]{margin:0;font-size:0.875em;color:var(--o-theme-muted);text-align:center;min-height:1.4em}',
    '[data-o-depth-barre]{display:flex;align-items:center;gap:0.75rem}',
    '[data-o-depth-barre] button{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:2.25rem;height:2.25rem;border-radius:999px;cursor:pointer;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font:inherit;color:inherit;',
    '}',
    '[data-o-depth-barre] button:is(:hover,:focus-visible){border-color:var(--o-depth-accent)}',
    '[data-o-depth-barre] button:focus-visible{outline:2px solid var(--o-depth-accent);outline-offset:2px}',
    '[data-o-depth-barre] button:disabled{opacity:0.35;cursor:default}',
    '[data-o-depth-row]{font-variant-numeric:tabular-nums;font-size:0.8125em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-depth-affiche]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Stack of posters leafed through by button, by arrow key or by drag.
 *
 * @example
 * <DepthCarousel
 *   label="Festival posters"
 *   items={[
 *     { src: '/posters/1998.jpg', alt: '1998 poster, blue typography', caption: '1998 edition' },
 *     { src: '/posters/2004.jpg', alt: '2004 poster, night photograph', caption: '2004 edition' },
 *   ]}
 * />
 *
 * @example
 * // A tight stack, almost facing us.
 * <DepthCarousel label="Sleeves" items={sleeves} spread={40} tilt={12} visible={2} />
 */
export function DepthCarousel({
  items,
  label,
  index,
  defaultIndex = 0,
  onIndexChange,
  width = 300,
  spread = 110,
  depth = 140,
  tilt = 32,
  visible = 3,
  ...rest
}: DepthCarouselProps): ReactElement {
  const deck = useRef<HTMLDivElement | null>(null)
  const drag = useRef<{ x: number; id: number } | null>(null)
  const [internal, setInternal] = useState(defaultIndex)
  ensureDepthRules()

  const last = Math.max(0, items.length - 1)
  const current = Math.min(last, Math.max(0, index ?? internal))
  const front = items[current]

  const goTo = (next: number): void => {
    const bounded = Math.min(last, Math.max(0, next))
    if (bounded === current) return
    if (index === undefined) setInternal(bounded)
    onIndexChange?.(bounded)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const targets: Readonly<Record<string, number | undefined>> = {
      ArrowRight: current + 1,
      ArrowLeft: current - 1,
      Home: 0,
      End: last,
    }
    const target = targets[event.key]
    if (target === undefined) return
    event.preventDefault()
    goTo(target)
  }

  /** Writes the shift of the deck without going through the state. */
  const slide = (dx: number): void => {
    const target = deck.current
    if (target === null) return
    target.style.transform = dx === 0 ? '' : `translateX(${dx.toFixed(1)}px)`
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    drag.current = { x: event.clientX, id: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-o-depth-tire', '')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = drag.current
    if (start === null || start.id !== event.pointerId) return
    // The one third resistance is a reminder that the deck does not follow
    // forever: the gesture is there to cross a threshold, not to scroll.
    slide((event.clientX - start.x) / 3)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const start = drag.current
    drag.current = null
    event.currentTarget.removeAttribute('data-o-depth-tire')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    slide(0)
    if (start === null) return
    const dx = event.clientX - start.x
    if (Math.abs(dx) >= THRESHOLD) goTo(current + (dx < 0 ? 1 : -1))
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-depth=""
      className={className}
      style={
        {
          '--o-depth-accent': 'var(--o-palette-brand-500)',
          '--o-depth-width': `${String(width)}px`,
          '--o-depth-height': `${String(Math.round((width * 4) / 3))}px`,
          ...style,
        } as CSSProperties
      }
    >
      <div
        data-o-depth-scene=""
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={deck} data-o-depth-plateau="">
          {items.map((item, rank) => {
            const offset = rank - current
            const distance = Math.abs(offset)
            const side = Math.sign(offset)

            return (
              <figure
                key={item.src}
                data-o-depth-affiche=""
                aria-current={offset === 0 ? 'true' : undefined}
                style={{
                  transform: [
                    `translate(-50%,-50%)`,
                    `translateX(${String(offset * spread)}px)`,
                    `translateZ(${String(-distance * depth)}px)`,
                    `rotateY(${String(-side * tilt)}deg)`,
                  ].join(' '),
                  opacity: Math.max(0, 1 - distance * 0.22),
                  zIndex: items.length - distance,
                  // Beyond the visible posters, nothing is painted any more:
                  // no pixel, no pointer target. The content stays in the
                  // document for screen readers.
                  visibility: distance > visible ? 'hidden' : undefined,
                }}
              >
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              </figure>
            )
          })}
        </div>
      </div>

      <p data-o-depth-legende="">{front?.caption ?? ''}</p>

      <div data-o-depth-barre="">
        <button
          type="button"
          aria-label="Previous poster"
          disabled={current === 0}
          onClick={() => {
            goTo(current - 1)
          }}
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <span data-o-depth-row="">
          {current + 1} / {items.length}
        </span>
        <button
          type="button"
          aria-label="Next poster"
          disabled={current >= last}
          onClick={() => {
            goTo(current + 1)
          }}
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  )
}
