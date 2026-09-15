/**
 * Pixel card: on hover, the edge fills with squares that gain ground towards
 * the inside, then pull back when the pointer leaves.
 *
 * ## A canvas, not a grid of elements
 *
 * A card of ordinary size counts several hundred cells in its edge band. That
 * many document elements, each with its own transition, would make the card
 * the heaviest piece of the page. A canvas draws them all in a single pass,
 * and costs nothing as long as nothing moves.
 *
 * ## Every cell has its threshold
 *
 * The progress goes from zero to one at the configured speed. A cell lights up
 * when the progress passes its threshold, which comes from its distance to the
 * edge — the closest ones first — plus a share of randomness drawn once.
 * Without the randomness, the edge would advance as a straight front; without
 * the distance, it would flicker with no direction. The mix gives a
 * pixelation that gnaws.
 *
 * ## The color comes from the document
 *
 * A canvas does not read CSS variables. The color is therefore applied on the
 * canvas element itself, as a text color, then read back computed: a palette
 * token becomes a value the canvas understands, and follows the theme if the
 * token depends on it.
 *
 * ## What is left on touch and under reduced motion
 *
 * Nothing: the edge is an ornament of hover, with no final state to preserve.
 * The card keeps its surface and its hairline, the canvas stays empty.
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

/** Props specific to the component. */
export interface PixelCardOwnProps {
  /** Content of the card. */
  children: ReactNode
  /** Side of a cell, in pixels. @defaultValue 8 */
  size?: number
  /** Depth of the pixelated band from the edge, in pixels. @defaultValue 56 */
  depth?: number
  /** Duration to cover the whole band, in milliseconds. @defaultValue 600 */
  duration?: number
  /** Color of the cells. @defaultValue brand hue */
  color?: string
}

/** All props. */
export type PixelCardProps = Customisable<PixelCardOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pixel-card'

/** A cell of the band: position and appearance threshold. */
interface Cell {
  readonly x: number
  readonly y: number
  readonly threshold: number
}

/** Applies the surface and the canvas, once per document. */
function ensurePixelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pixel]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    // The canvas takes the rounding of the card: the browser clips what
    // overflows, the corners stay clean.
    '[data-o-pixel-canvas]{',
    'position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'width:100%;height:100%;border-radius:inherit;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Computes the cells of the edge band for a given size.
 *
 * Only the cells less than `depth` away from the edge exist: the center of the
 * card is never walked.
 */
function buildCells(width: number, height: number, size: number, depth: number): Cell[] {
  const cells: Cell[] = []
  const columns = Math.ceil(width / size)
  const rows = Math.ceil(height / size)

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const x = column * size
      const y = row * size
      const centerX = x + size / 2
      const centerY = y + size / 2
      const edge = Math.min(centerX, centerY, width - centerX, height - centerY)
      if (edge > depth) continue

      // The cells of the edge start first; the randomness breaks the front.
      const threshold = (edge / depth) * 0.7 + Math.random() * 0.3
      cells.push({ x, y, threshold })
    }
  }

  return cells
}

/**
 * Pixelates the edge of a card on hover.
 *
 * @example
 * <PixelCard className="o-rounded-xl o-p-6">
 *   <h3>A card</h3>
 * </PixelCard>
 *
 * @example
 * // Large pixels, a narrow band, in another hue.
 * <PixelCard size={14} depth={36} color="var(--o-palette-emerald-500)">
 *   Content
 * </PixelCard>
 */
export function PixelCard({
  children,
  size = 8,
  depth = 56,
  duration = 600,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: PixelCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const canvas = useRef<HTMLCanvasElement | null>(null)
  ensurePixelRules()

  useEffect(() => {
    const surface = canvas.current
    if (host === null || surface === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    const context = surface.getContext('2d')
    if (context === null) return

    let cells: Cell[] = []
    let width = 0
    let height = 0
    let progress = 0
    let target = 0
    let fill = ''

    const measure = (): void => {
      const box = host.getBoundingClientRect()
      const ratio = window.devicePixelRatio || 1
      width = Math.max(1, Math.round(box.width))
      height = Math.max(1, Math.round(box.height))
      surface.width = Math.round(width * ratio)
      surface.height = Math.round(height * ratio)
      context.setTransform(ratio, 0, 0, ratio, 0, 0)
      cells = buildCells(width, height, Math.max(2, size), Math.max(size, depth))
    }

    const draw = (): void => {
      context.clearRect(0, 0, width, height)
      if (progress <= 0) return
      context.fillStyle = fill
      for (const cell of cells) {
        const alpha = (progress - cell.threshold) / 0.12
        if (alpha <= 0) continue
        context.globalAlpha = Math.min(1, alpha)
        context.fillRect(cell.x, cell.y, size, size)
      }
      context.globalAlpha = 1
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * (1000 / Math.max(duration, 1))
        progress =
          target > progress
            ? Math.min(target, progress + step)
            : Math.max(target, progress - step)
        draw()
        // Once at rest, the loop has nothing left to draw: it suspends itself,
        // and resumes on the next hover.
        if (progress === target) subscription.setActive(false)
      },
      { priority: CLOCK_PRIORITY.render, name: 'pixel card' },
    )
    subscription.setActive(false)

    const onEnter = (): void => {
      // The color is read again on every entry: the theme may have changed.
      fill = window.getComputedStyle(surface).color
      target = 1
      subscription.setActive(true)
    }
    const onLeave = (): void => {
      target = 0
      subscription.setActive(true)
    }

    const observer = new ResizeObserver(() => {
      measure()
      draw()
    })
    observer.observe(host)
    measure()

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      observer.disconnect()
      subscription.unsubscribe()
      context.clearRect(0, 0, width, height)
    }
  }, [host, reduced, size, depth, duration])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} ref={setHost} className={className} style={style} data-o-pixel="">
      <canvas
        ref={canvas}
        data-o-pixel-canvas=""
        aria-hidden="true"
        style={{ color } as CSSProperties}
      />
      {children}
    </div>
  )
}
