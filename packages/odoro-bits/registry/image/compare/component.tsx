/**
 * Before / after comparison.
 *
 * ## It is a slider, not a clickable image
 *
 * Most comparators are driven by the pointer and nowhere else: on the
 * keyboard, they are mute, and a screen reader announces nothing but two
 * superimposed images without saying what they are doing there.
 *
 * The role is therefore that of a slider, with its values and its name. The
 * arrows move it, `Home` and `End` push it to the ends, and the position is
 * announced as a percentage. It costs nothing but attributes.
 *
 * ## The position does not go through React
 *
 * It changes on every movement of the pointer. Carrying it in state would
 * cause one render per event over the whole drag, to move a clip that the
 * compositor knows how to animate on its own. A CSS variable is enough; React
 * state serves only the accessible announcement, updated on release.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** One of the two compared images. */
export interface CompareImage {
  /** Source. */
  readonly src: string
  /** Alternative text. */
  readonly alt: string
}

/** Properties specific to the component. */
export interface CompareOwnProps {
  /** Image revealed to the left of the handle. */
  before: CompareImage
  /** Image revealed to the right of the handle. */
  after: CompareImage
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Initial position of the handle, as a percentage. @defaultValue 50 */
  start?: number
  /** Name of the slider, announced to assistive technologies. */
  label: string
}

/** All properties. */
export type CompareProps = Customisable<CompareOwnProps>

/** Keyboard movement step, as a percentage. */
const STEP = 2

/**
 * Compares two images.
 *
 * @example
 * <Compare
 *   label="Before and after retouching"
 *   before={{ src: '/before.jpg', alt: 'Before retouching' }}
 *   after={{ src: '/after.jpg', alt: 'After retouching' }}
 * />
 */
export function Compare({
  before,
  after,
  ratio = 1.777,
  start = 50,
  label,
  ...rest
}: CompareProps): ReactElement {
  const host = useRef<HTMLDivElement | null>(null)
  const [announced, setAnnounced] = useState(start)
  const position = useRef(start)

  const place = useCallback((percent: number) => {
    const clamped = Math.min(100, Math.max(0, percent))
    position.current = clamped
    host.current?.style.setProperty('--o-compare', `${clamped.toFixed(1)}%`)
  }, [])

  const fromPointer = useCallback(
    (clientX: number) => {
      const box = host.current?.getBoundingClientRect()
      if (box === undefined) return
      place(((clientX - box.left) / Math.max(box.width, 1)) * 100)
    },
    [place],
  )

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-select-none' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={host}
      className={className}
      style={
        {
          ...style,
          aspectRatio: String(ratio),
          '--o-compare': `${String(start)}%`,
        } as CSSProperties
      }
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        fromPointer(event.clientX)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          fromPointer(event.clientX)
        }
      }}
      onPointerUp={() => setAnnounced(Math.round(position.current))}
    >
      <img
        src={after.src}
        alt={after.alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
      />

      {/*
        The left image is clipped by a `clip-path` rather than by a width:
        resizing the element would distort the image, whereas a clip leaves
        both exactly superimposed.
      */}
      <img
        src={before.src}
        alt={before.alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
        style={{ clipPath: 'inset(0 calc(100% - var(--o-compare)) 0 0)' }}
      />

      <div
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={announced}
        aria-valuetext={`${String(announced)} percent`}
        tabIndex={0}
        onKeyDown={(event) => {
          const delta =
            event.key === 'ArrowLeft' ? -STEP : event.key === 'ArrowRight' ? STEP : 0
          const target =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? 100
                : delta === 0
                  ? null
                  : position.current + delta

          if (target === null) return
          event.preventDefault()
          place(target)
          setAnnounced(Math.round(position.current))
        }}
        className="o-absolute o-inset-y-0 o-w-1 o-cursor-ew-resize o-bg-white focus:o-ring"
        style={{ left: 'var(--o-compare)', transform: 'translateX(-50%)' }}
      >
        <span
          aria-hidden
          className="o-absolute o-top-1/2 o-left-1/2 o-size-8 o-rounded-full o-border-w-1 o-border-white o-bg-black-45"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}
