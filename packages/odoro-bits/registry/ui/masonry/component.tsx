/**
 * Masonry: a gallery in columns of free heights, whose thumbnails rise into
 * place as one scrolls down.
 *
 * ## The columns are the browser's own
 *
 * A masonry written by hand measures every thumbnail, picks the shortest
 * column, and lays everything out absolutely — then starts over at every
 * resize, at every image loaded, and gets it wrong as long as an image has
 * no size yet. `columns` does the same sharing without a single measure,
 * and does it again on its own when the width changes.
 *
 * The price to pay is the reading order: the flow runs down column by
 * column, like a newspaper, and not row by row. That is acceptable for an
 * image gallery — the eye sweeps — and it is not for running text. The
 * documentation says so rather than hiding it.
 *
 * ## The rise is released by an attribute, not by a render
 *
 * A single observer watches every thumbnail and sets an attribute on the one
 * that enters. Passing through state would rerender the whole gallery at
 * every thumbnail crossed — on fifty images, fifty renders for a purely
 * visual effect.
 *
 * The delay comes from the rank of the thumbnail **within its row**, not
 * from its global rank: on a long gallery, a global delay would end up at
 * several seconds, and the last thumbnails would arrive after one has
 * passed them.
 *
 * ## A thumbnail is a target only if it leads somewhere
 *
 * Without `onSelect`, every thumbnail is a `figure`: nothing to activate,
 * nothing in the tab order, and the screen reader announces an image with
 * its alternative text. With `onSelect`, the same figure lives inside a
 * button. A button without an action is worse than an image: it promises a
 * follow-up that does not exist.
 *
 * ## Reduced motion
 *
 * The thumbnails are at their final place from the first render, and no
 * observer is created.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** An image of the gallery. */
export interface MasonryItem {
  /** Source of the image. */
  readonly src: string
  /** Alternative text, mandatory: this is the content, not a decoration. */
  readonly alt: string
  /** Caption shown under the image. */
  readonly caption?: string
}

/** Props specific to the component. */
export interface MasonryOwnProps {
  /** The images, in reading order. */
  items: readonly MasonryItem[]
  /** Name of the gallery for screen readers. */
  label: string
  /** Called on a click or on Enter on a thumbnail. */
  onSelect?: (src: string) => void
  /** Maximum number of columns. @defaultValue 3 */
  columns?: number
  /** Minimum width of a column, in pixels. @defaultValue 200 */
  minWidth?: number
  /** Gap between two thumbnails, in pixels. @defaultValue 16 */
  gap?: number
  /** Delay added from one column to the next, in milliseconds. @defaultValue 90 */
  stagger?: number
}

/** All the props. */
export type MasonryProps = Customisable<MasonryOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-masonry'

/** Sets the columns, the thumbnail and its rise, once per document. */
function ensureMasonryRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // `columns` takes a minimum width and a maximum number: the browser lays
    // out as many as fit, with no media query to write.
    '[data-o-masonry]{',
    'columns:var(--o-masonry-min) var(--o-masonry-count);',
    'column-gap:var(--o-masonry-gap);',
    '}',
    '[data-o-masonry]>[data-o-masonry-case]{',
    'break-inside:avoid;display:block;margin:0 0 var(--o-masonry-gap)',
    '}',
    '[data-o-masonry-tuile]{',
    'display:block;width:100%;margin:0;padding:0;border:0;',
    'font:inherit;color:inherit;text-align:start;',
    'background:var(--o-theme-surface);border-radius:0.8rem;overflow:hidden;',
    'box-shadow:0 0 0 1px var(--o-theme-line);',
    '}',
    'button[data-o-masonry-tuile]{cursor:pointer}',
    'button[data-o-masonry-tuile]:is(:hover,:focus-visible){',
    'box-shadow:0 0 0 2px var(--o-masonry-accent);',
    '}',
    'button[data-o-masonry-tuile]:focus-visible{outline:2px solid var(--o-masonry-accent);outline-offset:3px}',
    '[data-o-masonry-tuile] img{display:block;width:100%;height:auto}',
    '[data-o-masonry-tuile] figcaption{',
    'padding:0.5rem 0.7rem 0.6rem;font-size:0.8125em;line-height:1.35;color:var(--o-theme-muted);',
    '}',
    // Held back before the crossing, released by the attribute the observer sets.
    '[data-o-masonry][data-o-masonry-anime] [data-o-masonry-case]{',
    'opacity:0;translate:0 20px;',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'translate var(--o-duration-slower) var(--o-ease-entrance);',
    'transition-delay:calc(var(--o-masonry-row) * var(--o-masonry-stagger));',
    '}',
    '[data-o-masonry][data-o-masonry-anime] [data-o-masonry-case][data-o-masonry-seen]{',
    'opacity:1;translate:none;',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-masonry] [data-o-masonry-case]{opacity:1;translate:none;transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Masonry gallery, whose thumbnails rise on arrival.
 *
 * @example
 * <Masonry
 *   label="Report from Lisbon"
 *   items={[
 *     { src: '/photos/roofs.jpg', alt: 'Tiled roofs above the river' },
 *     { src: '/photos/tram.jpg', alt: 'Yellow tram in a sloping street' },
 *   ]}
 * />
 *
 * @example
 * // Four narrow columns, and a click that opens the viewer of the page.
 * <Masonry label="Archives" items={photos} columns={4} minWidth={160} onSelect={open} />
 */
export function Masonry({
  items,
  label,
  onSelect,
  columns = 3,
  minWidth = 200,
  gap = 16,
  stagger = 90,
  ...rest
}: MasonryProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureMasonryRules()

  useEffect(() => {
    // Under reduced motion, the thumbnails are already in place: observing
    // would amount to paying for an observer that triggers nothing.
    if (reduced) return
    const root = host.current
    if (root === null) return

    const cells = Array.from(root.querySelectorAll<HTMLElement>('[data-o-masonry-case]'))

    // Without an observer — old browser, test environment — we show. A gallery
    // that stays invisible is a visible defect; a gallery that arrives without
    // rising goes unnoticed.
    if (typeof IntersectionObserver === 'undefined') {
      for (const element of cells) element.setAttribute('data-o-masonry-seen', '')
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.setAttribute('data-o-masonry-seen', '')
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0.15 },
    )
    for (const element of cells) observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [reduced, items])

  const { className, style } = mergePresentation({}, rest)
  const perRow = Math.max(1, Math.round(columns))

  return (
    <div
      {...rest}
      ref={host}
      role="list"
      aria-label={label}
      data-o-masonry=""
      data-o-masonry-anime={reduced ? undefined : ''}
      className={className}
      style={
        {
          '--o-masonry-accent': 'var(--o-palette-brand-500)',
          '--o-masonry-count': perRow,
          '--o-masonry-min': `${String(minWidth)}px`,
          '--o-masonry-gap': `${String(gap)}px`,
          '--o-masonry-stagger': `${String(stagger)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => {
        const figure = (
          <>
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
            {item.caption === undefined ? null : <figcaption>{item.caption}</figcaption>}
          </>
        )

        return (
          <div
            key={item.src}
            role="listitem"
            data-o-masonry-case=""
            // The rank within the row, not the global rank: see the header.
            style={{ '--o-masonry-row': index % perRow } as CSSProperties}
          >
            {onSelect === undefined ? (
              <figure data-o-masonry-tuile="">{figure}</figure>
            ) : (
              <button
                type="button"
                data-o-masonry-tuile=""
                onClick={() => {
                  onSelect(item.src)
                }}
              >
                <figure style={{ margin: 0 }}>{figure}</figure>
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
