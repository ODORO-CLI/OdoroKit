/**
 * Image in characters: the photograph is sampled into a canvas outside the
 * document, then rendered as monospace text over it.
 *
 * ## What sets it apart from the ASCII field
 *
 * The ASCII field is noise computed by a shader: it has no subject. Here the
 * subject is a real image, and the rendering in characters is a **reading** of
 * that image. That is also why nothing is computed per frame: the conversion
 * happens once, on load, and its result is text.
 *
 * ## The real image stays underneath
 *
 * The `pre` is decorative and opaque; the `img` element it covers carries the
 * alternative text and remains the source of truth for assistive technologies.
 * On hover, the `pre` fades out and gives back the photograph: it is also the
 * natural fallback when the conversion fails.
 *
 * ## Why the conversion can fail, and what happens then
 *
 * Reading the pixels of an image that comes from another domain without an
 * authorisation header taints the canvas, and the read throws. The component
 * does not ignore this: it renders an empty `pre`, hence invisible, and the
 * photograph stays displayed. A missing character image is better than an
 * empty frame.
 *
 * ## The ink follows the theme
 *
 * In a light theme, the ink is dark on a light ground: a bright pixel must
 * therefore receive **fewer** characters. In a dark theme, it is the reverse.
 * The ramp is thus walked one way or the other depending on the theme; without
 * that, the image appears as a negative half the time.
 *
 * ## Under reduced motion
 *
 * Nothing changes: the rendering in characters is a state, not a movement.
 * Only the transition towards the photograph disappears — the passage becomes
 * instantaneous.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ascii-image'

/**
 * Ink ramp, from empty to full.
 *
 * It is the classic ramp of image-to-text converters: ten levels, which is
 * what the eye tells apart without hesitation at glyph size.
 */
const RAMP = ' .:-=+*#%@'

/**
 * Width to height ratio of a monospace text cell.
 *
 * It is roughly three fifths in every fixed-width font. Without it, the image
 * would come out stretched in height: a cell is not a square.
 */
const CELL = 0.6

/** Sets the rendering rules, once per document. */
function ensureAsciiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The glyph size is expressed as a percentage of the width of the frame:
    // the drawing keeps its proportions in any column.
    '[data-o-ascii]{container-type:inline-size}',
    '[data-o-ai-art]{font-size:calc(var(--o-ai-glyph) * 1cqw);line-height:1}',
    '[data-o-ascii-hover]:hover [data-o-ai-art],',
    '[data-o-ascii-hover]:focus-within [data-o-ai-art]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface AsciiImageOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /**
   * Number of characters across the width.
   *
   * Capped at two hundred: beyond that, the glyphs are smaller than a pixel
   * and the conversion costs for nothing.
   *
   * @defaultValue 90
   */
  columns?: number
  /** Contrast applied before the character is chosen. @defaultValue 1.3 */
  contrast?: number
  /** Flips the ramp: the image comes out as a negative. @defaultValue false */
  invert?: boolean
  /** Give back the photograph on hover and on focus. @defaultValue true */
  hover?: boolean
}

/** All properties: its own, plus those of an image. */
export type AsciiImageProps = Customisable<AsciiImageOwnProps, 'img'>

/**
 * Renders an image in characters.
 *
 * @example
 * <AsciiImage src="/portrait.jpg" alt="Portrait of the team" />
 *
 * @example
 * // Coarser, as a negative, with no return to the photograph.
 * <AsciiImage src="/portrait.jpg" alt="" columns={48} invert hover={false} />
 */
export function AsciiImage({
  src,
  alt,
  ratio = 1.777,
  columns = 90,
  contrast = 1.3,
  invert = false,
  hover = true,
  ...rest
}: AsciiImageProps): ReactElement {
  const { reduced, theme } = useMotionState()
  const [art, setArt] = useState('')
  ensureAsciiRule()

  const cols = Math.round(Math.min(200, Math.max(16, columns)))
  // A cell is taller than it is wide: without this ratio, the drawing would
  // come out stretched by a good third.
  const rows = Math.max(2, Math.round((cols * CELL) / Math.max(ratio, 0.1)))

  useEffect(() => {
    if (typeof document === 'undefined') return

    let cancelled = false
    const source = new Image()
    // Without this attribute, an image from another domain taints the canvas
    // and the read throws; with it, it is refused at load time when the server
    // does not allow it. In both cases the photograph stays displayed.
    source.crossOrigin = 'anonymous'
    source.decoding = 'async'

    const convert = (): void => {
      if (cancelled) return

      let drawing = ''
      try {
        const canvas = document.createElement('canvas')
        canvas.width = cols
        canvas.height = rows
        const context = canvas.getContext('2d')
        if (context === null) return

        // The canvas is exactly the size of the grid: the browser averages the
        // pixels for us, and it does it better than a loop.
        context.drawImage(source, 0, 0, cols, rows)
        const pixels = context.getImageData(0, 0, cols, rows).data

        const last = RAMP.length - 1
        // In a dark theme the ink is light: a bright pixel calls for more ink,
        // not less. See the header.
        const dense = theme === 'dark' ? !invert : invert

        const out: string[] = []
        for (let y = 0; y < rows; y += 1) {
          let line = ''
          for (let x = 0; x < cols; x += 1) {
            const index = (y * cols + x) * 4
            const r = pixels[index] ?? 0
            const g = pixels[index + 1] ?? 0
            const b = pixels[index + 2] ?? 0
            const alpha = (pixels[index + 3] ?? 255) / 255

            // Perceptual luminance, not an average: green weighs more than
            // blue in what the eye calls "light".
            const luma = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * alpha
            const pushed = Math.min(1, Math.max(0, (luma - 0.5) * contrast + 0.5))
            const level = dense ? pushed : 1 - pushed
            line += RAMP[Math.min(last, Math.max(0, Math.round(level * last)))] ?? ' '
          }
          out.push(line)
        }
        drawing = out.join('\n')
      } catch {
        // Tainted canvas: the photograph stays, the drawing will not happen.
        drawing = ''
      }

      if (!cancelled) setArt(drawing)
    }

    source.addEventListener('load', convert)
    source.src = src
    if (source.complete && source.naturalWidth > 0) convert()

    return () => {
      cancelled = true
      source.removeEventListener('load', convert)
    }
  }, [src, cols, rows, contrast, invert, theme])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // The total width equals the number of columns times the advance width of
    // a glyph: it is that equality that gives the font size.
    '--o-ai-glyph': (100 / (cols * CELL)).toFixed(4),
  } as CSSProperties

  const artStyle: CSSProperties = {
    color: 'var(--o-theme-fg)',
    backgroundColor: 'var(--o-theme-bg)',
    transition: reduced
      ? undefined
      : 'opacity var(--o-duration-slow) var(--o-ease-standard)',
  }

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-ascii=""
      data-o-ascii-hover={hover ? '' : undefined}
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* The drawing is decorative: everything it says, the image already
          says. As long as it does not exist — image still loading, tainted
          canvas — the layer is not rendered at all: opaque and empty, it would
          hide the photograph it is supposed to represent. */}
      {art === '' ? null : (
        <pre
          aria-hidden
          data-o-ai-art=""
          className="o-absolute o-inset-0 o-m-0 o-flex o-items-center o-justify-center o-overflow-hidden o-whitespace-pre o-font-mono o-select-none"
          style={artStyle}
        >
          {art}
        </pre>
      )}
    </div>
  )
}
