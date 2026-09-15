/**
 * Hero whose media opens along the scroll.
 *
 * ## The media does not change width : it changes window
 *
 * The obvious version animates `width`, and that is the one to rule out. A
 * width is a layout property : the browser recalculates the position of
 * everything that follows, on every frame, for the whole scroll. On a long
 * page, it is felt even before profiling.
 *
 * The media therefore keeps its size, and it is the **window** through which
 * one sees it that opens — a `clip-path` in `inset`, which the browser handles
 * at paint and not at layout. The result is the same to the eye, and nothing
 * moves around it.
 *
 * ## Progress is read in the loop, not rendered
 *
 * A value that changes on every frame has no place in a React state : it would
 * cause a full render per frame, in order to write a number into a CSS
 * variable. It is therefore read at the measure priority, rounded to the
 * hundredth, and written only when it really changes.
 *
 * ## The view is not always the window
 *
 * Placed in an overflowing panel — a preview, a drawer — the hero measures
 * itself against that panel. The scrolling container is looked up once on
 * mount : `getComputedStyle` per frame would cost more than all the rest of
 * the component.
 *
 * ## What reduced motion gives
 *
 * The arrival state : the media fully open, the caption visible. A hero
 * frozen at its starting state would show a cropped media and a missing
 * caption, that is to say incomplete content — which is not what the
 * preference asks for.
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
export interface HeroScrollMorphOwnProps {
  /** Title of the hero. */
  title: ReactNode
  /** The media : image, video, screenshot, scene. */
  children: ReactNode
  /** Sentence under the title. */
  subtitle?: ReactNode
  /** Caption under the media, which appears as the window opens. */
  caption?: ReactNode
  /**
   * Visible width of the media at rest, as a percentage of its full width.
   *
   * @defaultValue 62
   */
  startWidth?: number
  /**
   * Share of the height of the section over which the transform completes.
   *
   * `0.6` ends it before the section leaves the view, which lets the open media
   * be seen. A value of 1 makes it finish at the moment one no longer looks at
   * it.
   *
   * @defaultValue 0.6
   */
  travel?: number
  /** Name of the section, announced to assistive technologies. */
  label?: string
}

/** All the properties. */
export type HeroScrollMorphProps = Customisable<HeroScrollMorphOwnProps, 'section'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hero-scroll-morph'

/** Sets the rules of the hero, once per document. */
function ensureMorphRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hsm]{--o-hsm-reste:1}',
    // Everything is expressed as "what is left to travel" : on arrival the
    // value is zero, and every calculation reads as "nothing more".
    '[data-o-hsm-media]{',
    'clip-path:inset(',
    'calc(var(--o-hsm-marge-y) * var(--o-hsm-reste))',
    'calc(var(--o-hsm-marge-x) * var(--o-hsm-reste))',
    'round calc(var(--o-radius-3xl) * var(--o-hsm-reste)));',
    'transform:scale(calc(1 - 0.05 * var(--o-hsm-reste)));',
    'will-change:clip-path,transform}',

    '[data-o-hsm-legende]{opacity:calc(1 - var(--o-hsm-reste))}',

    // The arrival state, and not the starting state : a cropped media would be
    // incomplete content, not a neutralised animation.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hsm]{--o-hsm-reste:0}',
    '[data-o-hsm-media]{will-change:auto}}',
  ].join('')
  document.head.append(style)
}

/**
 * Finds the scrolling container around an element.
 *
 * Called once only, on mount : `getComputedStyle` forces a style calculation,
 * and repeating it per frame would undo the care taken elsewhere.
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
 * Hero whose media opens on scroll.
 *
 * @example
 * <HeroScrollMorph
 *   title="The registry, in plain words"
 *   subtitle="Components copied to your side, not linked."
 *   caption="Screenshot of the install command"
 * >
 *   <img src="/preview.png" alt="" className="o-size-full o-object-cover" />
 * </HeroScrollMorph>
 */
export function HeroScrollMorph({
  title,
  children,
  subtitle,
  caption,
  startWidth = 62,
  travel = 0.6,
  label,
  ...rest
}: HeroScrollMorphProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const last = useRef(-1)

  ensureMorphRules()

  useEffect(() => {
    if (host === null || reduced) return

    const container = scrollingContainer(host)
    const run = Math.max(0.05, travel)

    const subscription = clock.subscribe(
      () => {
        const box = host.getBoundingClientRect()
        if (box.height === 0) return

        const topOfView = container === null ? 0 : container.getBoundingClientRect().top

        // "How much of me has already passed above the view", related to the
        // wanted run. On arrival on the page, the value is zero : the hero
        // therefore starts closed, which is the only start that makes sense.
        const p = Math.min(1, Math.max(0, (topOfView - box.top) / (box.height * run)))

        const hundredth = Math.round(p * 100)
        if (hundredth === last.current) return
        last.current = hundredth
        host.style.setProperty('--o-hsm-reste', (1 - hundredth / 100).toFixed(2))
      },
      { name: 'hero on scroll', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [host, reduced, travel])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-items-center o-gap-8 o-py-16' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={setHost}
      aria-label={label}
      data-o-hsm=""
      className={className}
      style={
        {
          ...style,
          // The starting margin is deduced from the wanted width : a window at
          // 62 % leaves 19 % on each side.
          '--o-hsm-marge-x': `${((100 - startWidth) / 2).toFixed(2)}%`,
          '--o-hsm-marge-y': `${((100 - startWidth) / 4).toFixed(2)}%`,
        } as CSSProperties
      }
    >
      <div className="o-flex o-max-w-2xl o-flex-col o-gap-4 o-px-6 o-text-center">
        <h1
          className="o-text-4xl o-font-bold o-tracking-tight o-text-balance"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h1>
        {subtitle !== undefined && (
          <p
            className="o-text-base o-leading-relaxed"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <figure className="o-m-0 o-w-full">
        <div data-o-hsm-media="" className="o-w-full">
          {children}
        </div>
        {caption !== undefined && (
          <figcaption
            data-o-hsm-legende=""
            className="o-mt-3 o-text-center o-text-xs"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}
