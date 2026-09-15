/**
 * Image inside text: the word is filled by the photograph, the rest of the
 * frame is veiled, and a halo opens the veil where the pointer passes.
 *
 * ## Three layers, and a single image downloaded
 *
 * The real image is at the bottom, with its alternative text: it is the one
 * assistive technologies read, and the one that remains if clipping by the
 * text is not supported. Above it, a veil in the background colour of the
 * theme holds it back. Above that again, the word — real text in the document
 * — carries the same source as a background and holds it inside its letters
 * through `background-clip: text`.
 *
 * The browser downloads the source only once: the background of the text and
 * the image share the same cache entry.
 *
 * ## Why a halo rather than a uniform veil
 *
 * A solid veil gives a logotype: pretty, but dead. The halo is a radial
 * gradient whose centre is written into two CSS variables from the pointer
 * event — no React render — and it gives back to the photograph a disc around
 * the gesture. The word stays readable everywhere, the photograph is sensed
 * around it.
 *
 * ## What the fallback guarantees
 *
 * Without `background-clip: text`, transparent text would be absent text. A
 * `@supports` rule then gives the word back the ink of the theme and removes
 * its background: the composition loses its effect, never its content.
 *
 * ## Under reduced motion
 *
 * The halo is closed and the frame subscribes to nothing: what remains is the
 * image, its veil and the word filled by the photograph — the final state of
 * the composition, not its waiting state.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-image-mask-text'

/**
 * Sets the rules of the composition, once per document.
 *
 * They cannot be inline styles: the prefixed clipping and the `@supports` rule
 * do not exist inside the `style` attribute.
 */
function ensureMaskTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The size of the word is expressed as a percentage of the width of the
    // frame: laid inside a narrow column, the composition keeps its
    // proportions.
    '[data-o-mask-text]{container-type:inline-size}',
    '[data-o-mt-ink]{',
    'background-image:var(--o-mt-src);background-size:cover;',
    'background-position:center;',
    'font-size:calc(var(--o-mt-size) * 1cqw);line-height:1;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;',
    '}',
    // See the header: transparent text with no clipping is absent text. The
    // fallback gives it back the ink of the theme.
    '@supports not ((-webkit-background-clip:text) or (background-clip:text)){',
    '[data-o-mt-ink]{background-image:none;color:var(--o-theme-fg)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ImageMaskTextOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text of the image. */
  alt: string
  /** The word filled by the image. */
  text: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /**
   * Size of the word, as a percentage of the width of the frame.
   *
   * Not in pixels: the composition must fit inside its column whatever its
   * width.
   *
   * @defaultValue 18
   */
  size?: number
  /** Opacity of the veil laid over the image, from 0 to 1. @defaultValue 0.92 */
  veil?: number
  /** Radius of the halo that opens the veil, in pixels. Zero removes it. @defaultValue 190 */
  halo?: number
}

/** All properties: its own, plus those of an image. */
export type ImageMaskTextProps = Customisable<ImageMaskTextOwnProps, 'img'>

/**
 * Fills a word with an image, under a veil pierced by the pointer.
 *
 * @example
 * <ImageMaskText src="/workshop.jpg" alt="View of the workshop" text="ODORO" />
 *
 * @example
 * // Lighter veil, no halo: a title laid over the photograph.
 * <ImageMaskText src="/workshop.jpg" alt="" text="2026" veil={0.6} halo={0} />
 */
export function ImageMaskText({
  src,
  alt,
  text,
  ratio = 1.777,
  size = 18,
  veil = 0.92,
  halo = 190,
  ...rest
}: ImageMaskTextProps): ReactElement {
  const { reduced } = useMotionState()
  ensureMaskTextRule()

  const cover = Math.min(1, Math.max(0, veil))
  // The halo makes no sense without a pointer to walk it around: under reduced
  // motion, the veil becomes uniform again.
  const radius = reduced ? 0 : Math.max(0, halo)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // The quotes of the source are neutralised: a double quote in a file name
    // would close the `url` function and take the whole declaration with it.
    '--o-mt-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-mt-size': String(Math.max(1, size)),
    '--o-mt-x': '50%',
    '--o-mt-y': '50%',
  } as CSSProperties

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-mask-text=""
      onPointerMove={
        radius === 0
          ? undefined
          : (event) => {
              // The centre of the halo as a percentage of the frame: two
              // variable writes, no React render during the gesture.
              const box = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 100
              const y = ((event.clientY - box.top) / Math.max(box.height, 1)) * 100
              event.currentTarget.style.setProperty('--o-mt-x', `${x.toFixed(1)}%`)
              event.currentTarget.style.setProperty('--o-mt-y', `${y.toFixed(1)}%`)
            }
      }
      onPointerLeave={
        radius === 0
          ? undefined
          : (event) => {
              event.currentTarget.style.setProperty('--o-mt-x', '50%')
              event.currentTarget.style.setProperty('--o-mt-y', '50%')
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* The veil: decorative, out of reach of the pointer, pierced by the
          halo when there is one. */}
      <div
        aria-hidden
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={{
          opacity: cover,
          background:
            radius === 0
              ? 'var(--o-theme-bg)'
              : `radial-gradient(${String(radius)}px circle at var(--o-mt-x) var(--o-mt-y), transparent, var(--o-theme-bg) 100%)`,
        }}
      />

      {/* The word: real text, readable by assistive technologies as well as by
          the browser's own search. */}
      <span
        data-o-mt-ink=""
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-text-center o-font-black o-tracking-tighter o-select-none"
      >
        {text}
      </span>
    </div>
  )
}
