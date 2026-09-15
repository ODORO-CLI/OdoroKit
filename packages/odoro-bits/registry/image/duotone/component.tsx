/**
 * Duotone: the image is rendered in two tones, and comes back in colour on
 * hover.
 *
 * ## Two tint layers over a desaturated image
 *
 * The image first goes to greyscale, with slightly raised contrast — a duotone
 * over a flat image gives two grey tones. Above it, two solid colour layers do
 * the work:
 *
 * - a **shadow** layer in `mix-blend-mode: screen` lifts the blacks towards
 *   the chosen dark tone — lightening only acts on the dark areas;
 * - a **light** layer in `mix-blend-mode: multiply` pulls the whites towards
 *   the light tone — darkening only acts on the light areas.
 *
 * No image processing, no copy: two solid `div`s and the compositor.
 *
 * ## The return to colour is a transition, not a replacement
 *
 * On hover or on focus, the filter on the image drops and the layers go out —
 * two animatable properties, `filter` and `opacity`, where a `mix-blend-mode`
 * does not animate. The `hover` switch disables that return for a permanent
 * duotone.
 *
 * ## Under reduced motion
 *
 * The duotone and its return to colour remain: this is a change of state, not
 * a movement. Only the transition disappears — the passage is instantaneous.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-duotone'

/**
 * Sets the return-to-colour rules, once per document.
 *
 * They cannot be inline styles: they depend on the hover of the frame, not on
 * that of the layers.
 */
function ensureDuotoneRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-duotone]:hover img,[data-o-duotone]:focus-within img{filter:none}',
    '[data-o-duotone]:hover [data-o-duotone-tint],',
    '[data-o-duotone]:focus-within [data-o-duotone-tint]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface DuotoneOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Strength of the duotone, from 0 to 1. @defaultValue 1 */
  strength?: number
  /** Come back to colour on hover and on focus. @defaultValue true */
  hover?: boolean
  /**
   * Tone of the shadows.
   *
   * A value, not a hard-coded colour: written in the clear it would escape the
   * theme.
   *
   * @defaultValue the darkest of the indigos
   */
  shadow?: string
  /** Tone of the highlights. @defaultValue a light amber */
  light?: string
}

/** All properties: its own, plus those of an image. */
export type DuotoneProps = Customisable<DuotoneOwnProps, 'img'>

/**
 * Renders an image in two tones.
 *
 * @example
 * <Duotone src="/photo.jpg" alt="View of the workshop" />
 *
 * @example
 * // Permanent duotone in the brand hue.
 * <Duotone
 *   src="/photo.jpg"
 *   alt=""
 *   hover={false}
 *   shadow="var(--o-palette-brand-950)"
 *   light="var(--o-palette-brand-200)"
 * />
 */
export function Duotone({
  src,
  alt,
  ratio = 1.777,
  strength = 1,
  hover = true,
  shadow = 'var(--o-palette-indigo-950)',
  light = 'var(--o-palette-amber-200)',
  ...rest
}: DuotoneProps): ReactElement {
  const { reduced } = useMotionState()
  ensureDuotoneRule()

  const amount = Math.min(1, Math.max(0, strength))

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // Under reduced motion the passage is instantaneous; the duotone itself
  // stays — it is a state, not a movement.
  const transition = reduced
    ? undefined
    : 'filter var(--o-duration-slow) var(--o-ease-standard), opacity var(--o-duration-slow) var(--o-ease-standard)'

  const image: CSSProperties = {
    filter: `grayscale(${String(amount)}) contrast(${String(1 + 0.15 * amount)})`,
    transition,
  }

  const tint = (colour: string, blend: 'screen' | 'multiply'): CSSProperties => ({
    background: colour,
    mixBlendMode: blend,
    opacity: amount,
    transition,
  })

  return (
    <div
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      data-o-duotone={hover ? '' : undefined}
    >
      <img
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
        style={image}
      />

      {/* The layers are decorative and out of reach of the pointer: the hover
          belongs to the frame. */}
      <div
        aria-hidden
        data-o-duotone-tint=""
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={tint(shadow, 'screen')}
      />
      <div
        aria-hidden
        data-o-duotone-tint=""
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={tint(light, 'multiply')}
      />
    </div>
  )
}
