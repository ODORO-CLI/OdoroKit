/**
 * A container that straightens up and grows as it enters the view.
 *
 * ## What the tilt says
 *
 * The frame arrives tilted, seen from above, like an object laid on a table ;
 * it straightens up as it rises, until it faces us. It is a way of saying
 * "here is the thing" without writing it, and it holds on one condition only :
 * the tilt must **end**. A frame that stays askew is a decoration ; a frame
 * that straightens up is a presentation.
 *
 * ## A perspective on the parent, never on the element
 *
 * `perspective` set on the transformed element itself does not produce the same
 * thing as on its parent : the vanishing point then follows the element instead
 * of staying the one of the scene, and the tilt warps when the element moves.
 * This is the most frequent cause of a tilt that "slides" without anyone
 * knowing why.
 *
 * ## Nothing is rendered during the run
 *
 * Progress is read in the single loop, at the measure priority, and
 * written to a CSS variable. Rotation and scale are transforms : the
 * compositor applies them alone, with no layout recalculation and no
 * React render.
 *
 * ## What reduced motion gives
 *
 * The frame flat, at its full size — the arrival state. Frozen tilted, it would
 * hide part of its content through the perspective, which would be a defect and
 * not a preference honoured.
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
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface ContainerScrollOwnProps {
  /** What the frame contains. */
  children: ReactNode
  /** Title displayed above the frame. */
  title?: ReactNode
  /** Sentence under the title. */
  subtitle?: ReactNode
  /** Starting tilt, in degrees. @defaultValue 22 */
  rotation?: number
  /** Starting scale, from 0 to 1. @defaultValue 0.86 */
  scale?: number
  /** Name of the section, announced to assistive technologies. */
  label?: string
}

/** All the properties. */
export type ContainerScrollProps = Customisable<ContainerScrollOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-container-scroll'

/** Sets the rules of the frame, once per document. */
function ensureContainerRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cscroll]{--o-cscroll-reste:1}',
    // The perspective belongs to the scene, not to the object : set on the
    // transformed element, the vanishing point would follow it.
    '[data-o-cscroll-scene]{perspective:1000px}',
    '[data-o-cscroll-cadre]{',
    'transform:rotateX(calc(var(--o-cscroll-angle) * var(--o-cscroll-reste)))',
    ' scale(calc(1 - (1 - var(--o-cscroll-echelle)) * var(--o-cscroll-reste)));',
    'transform-origin:center top;will-change:transform}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cscroll]{--o-cscroll-reste:0}',
    '[data-o-cscroll-cadre]{will-change:auto}}',
  ].join('')
  document.head.append(style)
}

/**
 * Finds the scrolling container around an element.
 *
 * Looks once only, on mount : `getComputedStyle` forces a style calculation,
 * and repeating it per frame would cost more than the tilt itself.
 */
function scrollingContainer(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent !== null) {
    const overflow = getComputedStyle(parent).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * A frame that straightens up on scroll.
 *
 * @example
 * <ContainerScroll title="The workshop" subtitle="Every setting is a prop.">
 *   <img src="/workshop.png" alt="" className="o-size-full o-object-cover" />
 * </ContainerScroll>
 */
export function ContainerScroll({
  children,
  title,
  subtitle,
  rotation = 22,
  scale = 0.86,
  label,
  ...rest
}: ContainerScrollProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const last = useRef(-1)

  ensureContainerRules()

  useEffect(() => {
    if (host === null || reduced) return

    const container = scrollingContainer(host)

    const subscription = clock.subscribe(
      () => {
        const box = host.getBoundingClientRect()
        if (box.height === 0) return

        const view =
          container === null
            ? { top: 0, height: window.innerHeight }
            : {
                top: container.getBoundingClientRect().top,
                height: container.clientHeight,
              }

        // Zero when the top of the section reaches the bottom of the view, one
        // when the section has entered it whole : the tilt therefore ends at
        // the moment one looks at the frame, and not after.
        const p = Math.min(
          1,
          Math.max(0, (view.top + view.height - box.top) / box.height),
        )

        const hundredth = Math.round(p * 100)
        if (hundredth === last.current) return
        last.current = hundredth
        host.style.setProperty('--o-cscroll-reste', (1 - hundredth / 100).toFixed(2))
      },
      { name: 'frame on scroll', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [host, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8 o-py-12' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-cscroll=""
      className={className}
      style={
        {
          ...style,
          '--o-cscroll-angle': `${String(rotation)}deg`,
          '--o-cscroll-echelle': String(scale),
        } as CSSProperties
      }
    >
      {(title !== undefined || subtitle !== undefined) && (
        <div className="o-mx-auto o-flex o-max-w-2xl o-flex-col o-gap-3 o-px-6 o-text-center">
          {title !== undefined && (
            <h2
              className="o-text-3xl o-font-bold o-tracking-tight o-text-balance"
              style={{ color: 'var(--o-theme-fg)' }}
            >
              {title}
            </h2>
          )}
          {subtitle !== undefined && (
            <p className="o-text-sm" style={{ color: 'var(--o-theme-muted)' }}>
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div data-o-cscroll-scene="">
        <div
          data-o-cscroll-cadre=""
          className="o-overflow-hidden o-rounded-2xl o-p-2 o-shadow-xl"
          style={{
            backgroundColor: 'var(--o-theme-surface)',
            border: '1px solid var(--o-theme-line)',
          }}
        >
          {children}
        </div>
      </div>
    </section>
  )
}
