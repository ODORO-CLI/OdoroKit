/**
 * Swipeable stack: stacked images, the top one is dismissed by dragging or
 * from the keyboard and goes back underneath.
 *
 * ## The gesture is written into the style, not into state
 *
 * During the drag, the top card is moved by writing its transform onto the
 * element: one React render per pixel travelled would make the card trail
 * behind the finger. React renders only once per dismissed card — at the
 * moment the stack changes order — and it is then React that takes back
 * control of the transforms, after the gesture has cleared its own.
 *
 * ## Why the keyboard, and not only the drag
 *
 * A carousel that answers only to dragging does not exist for anyone
 * navigating by keyboard or screen reader. The stack is therefore a group
 * reachable by tabbing, the left and right arrows dismiss the card, and a live
 * region announces the image that has arrived. Dragging is only a shortcut for
 * the same gesture, not the only path.
 *
 * ## What the cards underneath show
 *
 * Only a few cards are drawn behind the top one, offset and scaled down: the
 * stack must read as a thickness, not as a gallery. The hidden cards are
 * removed from assistive technologies — their alternative text becomes
 * readable again as soon as they reach the top.
 *
 * ## Under reduced motion
 *
 * The card does not fly off: the stack changes order immediately, and the
 * final state — the next image on top — is reached with no journey. Dragging
 * and the keyboard still work.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-image-stack-swipe'

/** Duration of the exit of a dismissed card, in milliseconds. */
const EXIT = 380

/** Sets the focus rule, once per document. */
function ensureStackRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  // The focus outline cannot be an inline style: it exists only during
  // keyboard navigation, and it is the browser that knows about it.
  style.textContent = [
    '[data-o-stack]:focus-visible{',
    'outline:2px solid var(--o-palette-brand-500);outline-offset:3px;',
    '}',
  ].join('')
  document.head.append(style)
}

/** One image of the stack. */
export interface StackImage {
  /** Source of the image. */
  readonly src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  readonly alt: string
}

/** Properties specific to the component. */
export interface ImageStackSwipeOwnProps {
  /** The stacked images, from the first to the last. */
  images: readonly StackImage[]
  /** Width to height ratio of the cards. @defaultValue 1.4 */
  ratio?: number
  /** Distance to cover to dismiss the card, in pixels. @defaultValue 90 */
  threshold?: number
  /** Number of cards visible behind the top one. @defaultValue 2 */
  depth?: number
  /** Offset between two cards of the stack, in pixels. @defaultValue 16 */
  offset?: number
  /** Label of the group, announced before the stack. @defaultValue 'Image stack' */
  label?: string
}

/** All properties. */
export type ImageStackSwipeProps = Customisable<ImageStackSwipeOwnProps>

/**
 * Stacks images and dismisses them one by one.
 *
 * @example
 * <ImageStackSwipe
 *   images={[
 *     { src: '/one.jpg', alt: 'First plate' },
 *     { src: '/two.jpg', alt: 'Second plate' },
 *     { src: '/three.jpg', alt: 'Third plate' },
 *   ]}
 * />
 *
 * @example
 * // Thicker stack, less sensitive to the gesture.
 * <ImageStackSwipe images={plates} depth={3} threshold={140} />
 */
export function ImageStackSwipe({
  images,
  ratio = 1.4,
  threshold = 90,
  depth = 2,
  offset = 16,
  label = 'Image stack',
  ...rest
}: ImageStackSwipeProps): ReactElement {
  const { reduced } = useMotionState()
  const [front, setFront] = useState(0)
  const card = useRef<HTMLDivElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null)

  ensureStackRule()

  const total = images.length
  const visible = Math.max(0, Math.min(4, Math.round(depth)))

  // The exit countdown outlives an unmount: without this cleanup, it would
  // write into a component that is no longer there.
  useEffect(() => () => clearTimeout(timer.current), [])

  /** Hands control back to React after a gesture. */
  const release = (element: HTMLDivElement): void => {
    element.style.transition = ''
    element.style.transform = ''
    element.style.opacity = ''
  }

  /** Sends the top card underneath. */
  const advance = (): void => {
    setFront((value) => (total === 0 ? 0 : (value + 1) % total))
  }

  /** Dismisses the top card towards an edge. */
  const dismiss = (direction: -1 | 1, lift = 0): void => {
    const element = card.current
    if (element === null || total < 2) {
      if (element !== null) release(element)
      return
    }

    if (reduced) {
      // The final state, with no journey: see the header.
      release(element)
      advance()
      return
    }

    const width = element.getBoundingClientRect().width || 320
    element.style.transition = `transform ${String(EXIT)}ms var(--o-ease-exit), opacity ${String(EXIT)}ms linear`
    element.style.transform = `translate3d(${String(direction * width * 1.2)}px, ${String(lift)}px, 0) rotate(${String(direction * 16)}deg)`
    element.style.opacity = '0'

    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      release(element)
      advance()
    }, EXIT)
  }

  /** Start of the drag: the card drops its transitions and follows the gesture. */
  const grab = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (total < 2) return
    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)
    element.style.transition = 'none'
    drag.current = { x: event.clientX, y: event.clientY, dx: 0, dy: 0 }
  }

  /** Continuation of the drag: one transform written, no React render. */
  const follow = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = drag.current
    if (state === null) return

    state.dx = event.clientX - state.x
    state.dy = event.clientY - state.y

    // The rotation comes from the distance travelled: it is what gives the
    // card the look of a piece of card being pushed aside, rather than of a
    // rectangle sliding.
    event.currentTarget.style.transform = `translate3d(${String(state.dx)}px, ${String(state.dy * 0.35)}px, 0) rotate(${(state.dx / 18).toFixed(2)}deg)`
  }

  /** End of the drag: past the threshold the card leaves, otherwise it comes back. */
  const drop = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = drag.current
    drag.current = null
    if (state === null) return

    const element = event.currentTarget
    if (Math.abs(state.dx) > Math.max(20, threshold)) {
      dismiss(state.dx > 0 ? 1 : -1, state.dy * 0.35)
      return
    }

    // Below the threshold, the card takes its place back: the return is
    // animated even when the exit is not, because a jump here reads as a
    // misfire.
    element.style.transition = reduced
      ? 'none'
      : `transform ${String(EXIT)}ms var(--o-ease-standard)`
    element.style.transform = ''
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-select-none' },
    rest,
  )

  const current = total === 0 ? undefined : images[front % total]

  return (
    <div
      {...rest}
      data-o-stack=""
      role="group"
      aria-label={label}
      tabIndex={0}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
        // The page must not scroll while the stack is being leafed through.
        event.preventDefault()
        dismiss(event.key === 'ArrowRight' ? 1 : -1)
      }}
    >
      {images.map((image, index) => {
        const rank = total === 0 ? 0 : (index - front + total) % total
        const shown = rank <= visible
        const top = rank === 0

        const cardStyle: CSSProperties = {
          borderRadius: 'inherit',
          backgroundColor: 'var(--o-theme-surface)',
          boxShadow: 'var(--o-shadow-lg)',
          zIndex: total - rank,
          opacity: shown ? 1 : 0,
          transform: `translate3d(0, ${String(rank * offset)}px, 0) scale(${String(1 - rank * 0.05)})`,
          transition: reduced
            ? undefined
            : `transform ${String(EXIT)}ms var(--o-ease-standard), opacity ${String(EXIT)}ms linear`,
          pointerEvents: top ? 'auto' : 'none',
          touchAction: 'none',
        }

        return (
          <div
            key={`${image.src}-${String(index)}`}
            ref={top ? card : undefined}
            aria-hidden={!top}
            className="o-absolute o-inset-0 o-overflow-hidden"
            style={cardStyle}
            onPointerDown={top ? grab : undefined}
            onPointerMove={top ? follow : undefined}
            onPointerUp={top ? drop : undefined}
            onPointerCancel={top ? drop : undefined}
          >
            <img
              loading="lazy"
              decoding="async"
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="o-size-full o-object-cover"
            />
          </div>
        )
      })}

      {/* What the gesture changes must be heard as much as it is seen. */}
      <p role="status" className="o-sr-only">
        {current === undefined
          ? ''
          : `Image ${String((front % Math.max(total, 1)) + 1)} of ${String(total)}. ${current.alt}`}
      </p>
    </div>
  )
}
