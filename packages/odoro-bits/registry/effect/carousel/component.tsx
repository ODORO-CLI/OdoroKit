/**
 * Carousel: a rail of slides.
 *
 * ## Native scrolling does the work
 *
 * A carousel driven by hand — transforms computed, gestures captured, inertia
 * simulated — amounts to several hundred lines, and it is always worse than
 * the browser's. It does not know the inertia of the system, ignores the
 * horizontal scroll of a trackpad, and behaves differently on every device.
 *
 * The rail is therefore a scroll container, with snapping. The browser brings
 * the gesture, the inertia, the wheel, the keyboard, and the respect of system
 * settings, all for free.
 *
 * ## What is left to us
 *
 * Accessibility, which no scrolling provides: a group role, a name, numbered
 * slides, and controls that say where they lead. Which is precisely what most
 * carousels forget.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface CarouselOwnProps {
  /** The slides. */
  children: ReactNode
  /** Name of the carousel, announced to assistive technologies. */
  label: string
  /** Slides visible at once. @defaultValue 1 */
  perView?: number
  /** Gap between two slides, in pixels. @defaultValue 16 */
  gap?: number
  /** Comes back to the start after the last one. @defaultValue false */
  loop?: boolean
}

/** All properties. */
export type CarouselProps = Customisable<CarouselOwnProps>

/** A control button, placed outside the rail. */
function Control({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="o-inline-flex o-size-9 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-current o-bg-transparent o-cursor-pointer disabled:o-opacity-30 disabled:o-cursor-default o-transition-opacity"
    >
      {children}
    </button>
  )
}

/**
 * Rail of slides, by gesture as well as by keyboard.
 *
 * @example
 * <Carousel label="Our work" perView={3}>
 *   {projects.map((project) => (
 *     <article key={project.id}>…</article>
 *   ))}
 * </Carousel>
 */
export function Carousel({
  children,
  label,
  perView = 1,
  gap = 16,
  loop = false,
  ...rest
}: CarouselProps): ReactElement {
  const slides = Children.toArray(children)
  const [rail, setRail] = useState<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)

  const pages = Math.max(1, slides.length - perView + 1)

  useEffect(() => {
    if (rail === null) return

    // The index follows the real scroll rather than the other way round: the
    // browser is the authority, including when the user drags the rail by
    // hand.
    const onScroll = (): void => {
      const step = rail.scrollWidth / Math.max(slides.length, 1)
      setIndex(Math.round(rail.scrollLeft / Math.max(step, 1)))
    }

    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [rail, slides.length])

  const goTo = useCallback(
    (next: number) => {
      if (rail === null) return
      const wrapped = loop
        ? (next + pages) % pages
        : Math.min(Math.max(next, 0), pages - 1)
      const step = rail.scrollWidth / Math.max(slides.length, 1)
      rail.scrollTo({ left: wrapped * step, behavior: 'smooth' })
    },
    [rail, loop, pages, slides.length],
  )

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-3' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style}>
      <div
        ref={setRail}
        role="group"
        aria-roledescription="carousel"
        aria-label={label}
        tabIndex={0}
        className="o-flex o-snap-x o-snap-mandatory o-overflow-x-auto o-scroll-smooth"
        style={{ gap: `${String(gap)}px`, scrollbarWidth: 'none' } as CSSProperties}
      >
        {slides.map((slide, position) => (
          <div
            key={position}
            role="group"
            aria-roledescription="slide"
            aria-label={`${String(position + 1)} of ${String(slides.length)}`}
            className="o-snap-start o-shrink-0"
            style={{
              width: `calc((100% - ${String(gap * (perView - 1))}px) / ${String(perView)})`,
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="o-flex o-items-center o-gap-2">
        <Control
          label="Previous slide"
          disabled={!loop && index === 0}
          onClick={() => goTo(index - 1)}
        >
          <span aria-hidden>&#8249;</span>
        </Control>
        <Control
          label="Next slide"
          disabled={!loop && index >= pages - 1}
          onClick={() => goTo(index + 1)}
        >
          <span aria-hidden>&#8250;</span>
        </Control>
        <span className="o-ml-1 o-font-mono o-text-xs o-tabular-nums o-opacity-70">
          {Math.min(index + 1, pages)} / {pages}
        </span>
      </div>
    </div>
  )
}
