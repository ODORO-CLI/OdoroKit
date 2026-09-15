/**
 * ASCII: the heading is redrawn in characters, and the pattern undulates.
 *
 * ## The canvas is only used to measure
 *
 * Nothing is painted to the screen by the canvas. It is used once, outside the
 * document, to rasterise the text into a grid of the wanted size — a few dozen
 * columns by a few rows — and it is the alpha channel that is read: where a
 * letter covers, the cell is full; elsewhere, empty.
 *
 * No colour is set on the context, and that is deliberate: the hue of the fill
 * enters no computation, only its coverage counts.
 *
 * ## What undulates is the lookup, not the grid
 *
 * The coverage is measured only once. On every frame, a sine wave crossing the
 * width modulates the level read from that coverage, and the character chosen
 * in the ramp changes. The pattern therefore never moves: it is the characters
 * that thicken and thin in a wave, which avoids any layout recomputation.
 *
 * ## The real text stays underneath
 *
 * It is rendered in the flow, it is what gives the component its box, and it
 * is only made transparent **once the pattern is built**: with no JavaScript,
 * with no canvas, or if the measurement fails, the heading is simply there.
 * The pattern lives in an `aria-hidden` layer laid over it.
 *
 * ## Distinction
 *
 * `decode-text` replaces characters with other characters, at the same scale:
 * one still reads a word. Here the word disappears as a word and reappears as
 * a picture, at a resolution far coarser than its own.
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
  type ElementType,
  type ReactElement,
} from 'react'

/** Properties specific to the component. */
export interface AsciiTextOwnProps {
  /** Text to redraw. A string: it is the one that gets rasterised. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Number of rows in the pattern. The lower, the coarser. @defaultValue 8 */
  rows?: number
  /** Duration of one pass of the wave, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Number of waves visible across the width. @defaultValue 1.5 */
  waves?: number
}

/** All properties. */
export type AsciiTextProps = Customisable<AsciiTextOwnProps, 'span'>

/**
 * Density ramp, from empty to full.
 *
 * It avoids the hash sign: the registry contract check hunts for hard-coded
 * colours, and a hash followed by three hexadecimal signs would be one. Empty
 * is a space, which makes the pattern readable as it is in the document.
 */
const RAMP = ' .,:-=+*%@'

/** Full turn, in radians. */
const TAU = Math.PI * 2

/** Ceiling on cells per frame: beyond it, the built string costs too much. */
const MAX_CELLS = 6000

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ascii-text'

/** A measured pattern: its size, and the coverage of each cell. */
interface Pattern {
  readonly cols: number
  readonly rows: number
  readonly alpha: Float32Array
}

/** Sets the layer rules, once per document. */
function ensureAsciiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ascii]{position:relative;display:inline-block}',
    '[data-o-ascii-source]{display:inline-block}',
    // The original only becomes transparent when the pattern exists.
    '[data-o-ascii-hidden]{color:transparent}',
    '[data-o-ascii-layer]{',
    'position:absolute;inset:0;margin:0;overflow:hidden;',
    'pointer-events:none;text-align:left;white-space:pre;line-height:1;',
    'font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Redraws a text in characters, and undulates the pattern.
 *
 * @example
 * <AsciiText as="h1" className="o-text-5xl o-font-bold">
 *   Odoro
 * </AsciiText>
 *
 * @example
 * // A finer pattern, and a slow swell.
 * <AsciiText rows={14} speed={5200} waves={0.8}>Workshop</AsciiText>
 */
export function AsciiText({
  children,
  as: Tag = 'span',
  rows = 8,
  speed = 2600,
  waves = 1.5,
  ...rest
}: AsciiTextProps): ReactElement {
  const { reduced } = useMotionState()

  const sourceRef = useRef<HTMLSpanElement | null>(null)
  const layerRef = useRef<HTMLPreElement | null>(null)
  const patternRef = useRef<Pattern | null>(null)
  const [built, setBuilt] = useState(false)

  ensureAsciiRule()

  useEffect(() => {
    const source = sourceRef.current
    const layer = layerRef.current
    if (source === null || layer === null) return

    /** Writes the read pattern, modulated by the wave, into the layer. */
    const paint = (phase: number): void => {
      const pattern = patternRef.current
      if (pattern === null) return

      const last = RAMP.length - 1
      let output = ''

      for (let y = 0; y < pattern.rows; y += 1) {
        for (let x = 0; x < pattern.cols; x += 1) {
          const coverage = pattern.alpha[y * pattern.cols + x] ?? 0
          // The wave moves nothing: it thickens and thins the stroke.
          const ripple = 0.58 + 0.42 * Math.sin((x / pattern.cols) * TAU * waves - phase)
          const level = Math.min(1, coverage * ripple * 1.4)
          output += RAMP[Math.round(level * last)] ?? ' '
        }
        if (y < pattern.rows - 1) output += '\n'
      }

      layer.textContent = output
    }

    /** Measures the coverage of the text and tunes the layer to the source box. */
    const measure = (): boolean => {
      const box = source.getBoundingClientRect()
      if (box.width < 4 || box.height < 4) return false

      const lines = Math.max(2, Math.round(rows))
      const cell = box.height / lines
      const columns = Math.max(
        2,
        Math.min(Math.round(box.width / cell), Math.floor(MAX_CELLS / lines)),
      )

      const canvas = document.createElement('canvas')
      canvas.width = columns
      canvas.height = lines
      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx === null) return false

      const dressing = getComputedStyle(source)
      // No colour is set: only the alpha channel is read afterwards.
      ctx.textBaseline = 'middle'
      ctx.font = `${dressing.fontStyle} ${dressing.fontWeight} ${String(lines * 0.78)}px ${dressing.fontFamily}`

      const textWidth = ctx.measureText(children).width
      if (textWidth <= 0) return false

      // The text is stretched to occupy the whole width of the pattern: it is
      // the rendered box that commands, not the advance width of the font.
      ctx.setTransform(columns / textWidth, 0, 0, 1, 0, 0)
      ctx.fillText(children, 0, lines / 2)
      ctx.setTransform(1, 0, 0, 1, 0, 0)

      const pixels = ctx.getImageData(0, 0, columns, lines).data
      const alpha = new Float32Array(columns * lines)
      for (let index = 0; index < alpha.length; index += 1) {
        alpha[index] = (pixels[index * 4 + 3] ?? 0) / 255
      }

      // The advance width of the layer's monospace, measured in the very font
      // it will render in: without that the spacing would be guessed.
      const mono = getComputedStyle(layer).fontFamily
      ctx.font = `${String(cell)}px ${mono}`
      const advance = ctx.measureText('M').width

      layer.style.fontSize = `${String(cell)}px`
      layer.style.lineHeight = `${String(cell)}px`
      layer.style.letterSpacing = `${String(box.width / columns - advance)}px`

      patternRef.current = { cols: columns, rows: lines, alpha }
      return true
    }

    let subscription: { unsubscribe(): void } | null = null

    const build = (): void => {
      subscription?.unsubscribe()
      subscription = null

      if (!measure()) {
        setBuilt(false)
        return
      }

      setBuilt(true)

      // Reduced motion: the pattern is painted once, with no wave. That is the
      // arrival state of the effect, not its starting state.
      if (reduced) {
        paint(Math.PI / 2)
        return
      }

      subscription = clock.subscribe(
        () => {
          paint((performance.now() / Math.max(speed, 1)) * TAU)
        },
        { name: 'ASCII text', priority: CLOCK_PRIORITY.default },
      )
    }

    build()

    // A font that finishes loading, a width that changes: the pattern is
    // measured again, otherwise it would stay tuned to a box that no longer
    // exists.
    const observer = new ResizeObserver(() => {
      build()
    })
    observer.observe(source)

    let alive = true
    if (typeof document.fonts !== 'undefined') {
      void document.fonts.ready.then(() => {
        if (alive) build()
      })
    }

    return () => {
      alive = false
      observer.disconnect()
      subscription?.unsubscribe()
      patternRef.current = null
      layer.textContent = ''
      setBuilt(false)
    }
  }, [children, rows, speed, waves, reduced])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag {...rest} className={className} style={style as CSSProperties} data-o-ascii="">
      <span
        ref={sourceRef}
        data-o-ascii-source=""
        {...(built ? { 'data-o-ascii-hidden': '' } : {})}
      >
        {children}
      </span>
      <pre ref={layerRef} aria-hidden="true" data-o-ascii-layer="" />
    </Tag>
  )
}
