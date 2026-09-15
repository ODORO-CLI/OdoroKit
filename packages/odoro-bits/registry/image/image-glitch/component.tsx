/**
 * Glitched image: two tinted ghosts shift in slices over the photograph, like
 * a transmission losing lock.
 *
 * ## What sets it apart from the glitch on hover
 *
 * The generic effect wraps any content and fires a single burst when the
 * pointer enters. Here the entry knows its subject: it is an image, and the
 * separation of the channels is done with the image itself, tinted by
 * background blending. The dropout loops as long as the pointer stays, instead
 * of firing once — the continuous disorder is what makes one read a failing
 * signal rather than an accident.
 *
 * ## Two ghosts, no third copy
 *
 * Each ghost is a layer whose background is the same source as the `img`
 * element — so nothing more to download. Its colour is blended with the image
 * by `background-blend-mode: multiply`, then the layer is composited over the
 * photograph by `mix-blend-mode: screen`: exactly what a chromatic fringe
 * does, a channel separated and rendered again. White is never written: both
 * hues come from the palette.
 *
 * ## Why steps, and an animation already declared
 *
 * The dropout is made of jumps, not of slides: the timing function is a single
 * step, and each stage holds until the next. The animation is declared once
 * for the document and stays paused; the hover does nothing but set it running
 * again. Nothing is created at the moment of the gesture, and no React render
 * takes place.
 *
 * ## Under reduced motion
 *
 * The ghosts are not rendered at all and nothing listens: the photograph,
 * crisp, is the only state. A dropout has no final state to preserve.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-image-glitch'

/** Sets the rules and the two animations, once per document. */
function ensureGlitchRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** Closed slice: the ghost exists without showing anything. */
  const closed = 'opacity:0;clip-path:inset(0 0 100% 0);transform:none'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ig-copy]{',
    'position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'background-image:var(--o-ig-src);background-size:cover;background-position:center;',
    // The tinted background is blended with the image inside the layer, then
    // the layer is composited over the photograph: two blends, a single copy.
    'background-blend-mode:multiply;mix-blend-mode:screen;',
    'animation-duration:var(--o-ig-duration);animation-timing-function:steps(1,end);',
    'animation-iteration-count:infinite;animation-play-state:paused;',
    'opacity:0;',
    '}',
    '[data-o-ig-copy="a"]{animation-name:o-ig-a}',
    '[data-o-ig-copy="b"]{animation-name:o-ig-b}',
    // The hover creates nothing: it sets running again what was already
    // waiting.
    '[data-o-glitch-continuous] [data-o-ig-copy],',
    '[data-o-glitch-hover]:hover [data-o-ig-copy],',
    '[data-o-glitch-hover]:focus-within [data-o-ig-copy]{animation-play-state:running}',
    '@keyframes o-ig-a{',
    `0%,100%{${closed}}`,
    '6%{opacity:0.9;clip-path:inset(8% 0 74% 0);transform:translate3d(calc(var(--o-ig-shift) * -1),0,0)}',
    '12%{opacity:0.9;clip-path:inset(42% 0 38% 0);transform:translate3d(var(--o-ig-shift),0,0)}',
    `18%{${closed}}`,
    '54%{opacity:0.9;clip-path:inset(70% 0 12% 0);transform:translate3d(calc(var(--o-ig-shift) * -0.6),0,0)}',
    `60%{${closed}}`,
    '}',
    '@keyframes o-ig-b{',
    `0%,100%{${closed}}`,
    '8%{opacity:0.85;clip-path:inset(28% 0 52% 0);transform:translate3d(var(--o-ig-shift),0,0)}',
    '14%{opacity:0.85;clip-path:inset(60% 0 22% 0);transform:translate3d(calc(var(--o-ig-shift) * -1),0,0)}',
    `20%{${closed}}`,
    '62%{opacity:0.85;clip-path:inset(16% 0 66% 0);transform:translate3d(calc(var(--o-ig-shift) * 0.5),0,0)}',
    `68%{${closed}}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ImageGlitchOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /** Offset of the slices, in pixels. @defaultValue 10 */
  intensity?: number
  /** Duration of one dropout cycle, in milliseconds. @defaultValue 1400 */
  duration?: number
  /** Only drop out on hover and on focus. Otherwise, continuously. @defaultValue true */
  hover?: boolean
  /**
   * Hue of the first ghost.
   *
   * A value, not a hard-coded colour: written in the clear it would escape the
   * theme.
   *
   * @defaultValue a light cyan
   */
  cool?: string
  /** Hue of the second ghost. @defaultValue a vivid rose */
  warm?: string
}

/** All properties: its own, plus those of an image. */
export type ImageGlitchProps = Customisable<ImageGlitchOwnProps, 'img'>

/**
 * Makes an image drop out in tinted slices.
 *
 * @example
 * <ImageGlitch src="/photo.jpg" alt="View of the workshop" />
 *
 * @example
 * // Permanent dropout, wider and slower.
 * <ImageGlitch src="/photo.jpg" alt="" hover={false} intensity={18} duration={2200} />
 */
export function ImageGlitch({
  src,
  alt,
  ratio = 1.777,
  intensity = 10,
  duration = 1400,
  hover = true,
  cool = 'var(--o-palette-cyan-400)',
  warm = 'var(--o-palette-rose-500)',
  ...rest
}: ImageGlitchProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlitchRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-isolate' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // The quotes of the source are neutralised: a double quote in a file name
    // would close the `url` function.
    '--o-ig-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-ig-shift': `${String(Math.max(0, intensity))}px`,
    '--o-ig-duration': `${String(Math.max(200, duration))}ms`,
  } as CSSProperties

  /** The tinted background of the ghost, blended with the image in its own layer. */
  const ghost = (colour: string): CSSProperties => ({ backgroundColor: colour })

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-glitch-hover={hover ? '' : undefined}
      data-o-glitch-continuous={hover ? undefined : ''}
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* The ghosts are decorative: they show nothing the photograph does not
          already show, and are out of reach of the pointer. */}
      {reduced ? null : (
        <>
          <div aria-hidden data-o-ig-copy="a" style={ghost(cool)} />
          <div aria-hidden data-o-ig-copy="b" style={ghost(warm)} />
        </>
      )}
    </div>
  )
}
