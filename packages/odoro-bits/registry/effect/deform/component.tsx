/**
 * Deformation: a displacement filter laid over any content.
 *
 * ## Why an SVG filter and not a texture
 *
 * The obvious way to deform content would be to render it into a texture, then
 * to twist it in a shader. That is what WebGL demos do, and it is a dead end
 * as soon as the content is DOM: capturing HTML as an image requires a
 * third-party library, fails on remote fonts, ignores part of the
 * pseudo-elements, and breaks completely as soon as an image comes from
 * another origin.
 *
 * A displacement filter does the same work, natively. The browser rasterises
 * the element — which it does anyway — then offsets each pixel according to a
 * noise field. No capture, no dependency, and it applies indifferently to a
 * background, to text or to an image.
 *
 * ## The edges, and why they are glued back by default
 *
 * A displacement fetches each pixel from somewhere else. At the edge of the
 * element, that somewhere else is outside: the filter finds emptiness there,
 * and the silhouette falls into tatters. It is correct as far as the
 * computation goes, and unreadable to the eye — it looks like a display fault,
 * not like an effect.
 *
 * The result is therefore re-clipped on the original opacity: the shape stays
 * exactly what it was, and only the inside ripples. That is what
 * `edges: 'clean'` does, and it is the default.
 *
 * `edges: 'organic'` lets the silhouette deform. It is the right choice for a
 * blob of colour or a background, where there is no shape to respect — and the
 * wrong one for a card, whose right angles are precisely what gets noticed.
 *
 * ## What this choice costs
 *
 * Three limits, better known before laying the component down.
 *
 * Text is **rasterised**. At low amplitude it does not show; beyond a dozen
 * pixels, the letters lose their crispness. It is inherent: a filter works on
 * pixels, not on glyphs.
 *
 * A filter creates a **stacking context** and a containing block. A child in
 * `position: fixed` inside it will position itself relative to the deformed
 * container, not relative to the window.
 *
 * And the turbulence is **computed once**, not on every frame. Animating its
 * frequency would force the browser to recompute it entirely, which collapses
 * the frame rate. The movement therefore comes from the displacement of the
 * field, not from its regeneration — less rich, and a hundred times cheaper.
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
import { useEffect, useId, useRef, type ReactElement, type ReactNode } from 'react'

/** Properties specific to the component. */
export interface DeformOwnProps {
  /** Deformed content: container, text, image, anything. */
  children: ReactNode
  /** Amplitude of the displacement, in pixels. @defaultValue 12 */
  amount?: number
  /** Fineness of the noise. The higher, the tighter. @defaultValue 0.012 */
  frequency?: number
  /** Drift speed of the field. Zero to freeze it. @defaultValue 0.15 */
  speed?: number
  /**
   * Number of octaves of the noise. A single one gives a smooth ripple; beyond
   * that, the fine detail chops the displacement up.
   *
   * @defaultValue 1
   */
  octaves?: number
  /**
   * Handling of the edges.
   *
   * - `clean` re-clips the result on the original shape: it is preserved, only
   *   the inside ripples.
   * - `organic` lets the silhouette deform.
   *
   * @defaultValue 'clean'
   */
  edges?: 'clean' | 'organic'
  /** Amplifies the deformation on hover. @defaultValue false */
  onHover?: boolean
}

/** All properties. */
export type DeformProps = Customisable<DeformOwnProps>

/**
 * Deforms its content.
 *
 * @example
 * // An ordinary container, background and text included.
 * <Deform amount={8}>
 *   <section className="o-rounded-xl o-bg-brand-600 o-p-8">
 *     <h2>A heading</h2>
 *   </section>
 * </Deform>
 *
 * @example
 * // An image, deformed on hover only.
 * <Deform amount={0} onHover className="o-rounded-lg o-overflow-hidden">
 *   <img src="/photo.jpg" alt="" />
 * </Deform>
 */
export function Deform({
  children,
  amount = 12,
  frequency = 0.012,
  speed = 0.15,
  octaves = 1,
  edges = 'clean',
  onHover = false,
  ...rest
}: DeformProps): ReactElement {
  const { reduced, quality } = useMotionState()
  const id = useId().replace(/:/g, '')
  const displacement = useRef<SVGFEDisplacementMapElement | null>(null)
  const offset = useRef<SVGFEOffsetElement | null>(null)
  const hovering = useRef(false)

  // On low quality, a single octave: it is the setting that weighs, and the
  // deformation stays readable with less detail.
  const grade = quality === 'low' ? 1 : octaves

  useEffect(() => {
    if (reduced || speed === 0) return

    const subscription = clock.subscribe(
      ({ time }) => {
        // The field is translated, never regenerated: animating the frequency
        // of the turbulence would force the browser to recompute it on every
        // frame.
        const shift = time * speed * 60
        offset.current?.setAttribute('dx', (Math.sin(shift * 0.017) * 30).toFixed(1))
        offset.current?.setAttribute('dy', (Math.cos(shift * 0.013) * 30).toFixed(1))

        if (onHover) {
          const target = hovering.current ? amount : 0
          const current = Number(displacement.current?.getAttribute('scale') ?? 0)
          displacement.current?.setAttribute(
            'scale',
            (current + (target - current) * 0.12).toFixed(2),
          )
        }
      },
      { name: 'deform', priority: CLOCK_PRIORITY.render },
    )

    return () => subscription.unsubscribe()
  }, [reduced, speed, onHover, amount])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <div
      {...rest}
      className={className}
      style={{ ...style, filter: reduced ? undefined : `url(#${id})` }}
      onPointerEnter={() => (hovering.current = true)}
      onPointerLeave={() => (hovering.current = false)}
    >
      {/*
        The filter lives in the document, not in a stylesheet: it carries
        values that change, and an attribute updates where a CSS rule would
        have to be rewritten.
      */}
      <svg aria-hidden className="o-absolute o-size-0" focusable="false">
        <filter id={id} colorInterpolationFilters="sRGB">
          <feTurbulence
            type="fractalNoise"
            baseFrequency={frequency}
            numOctaves={grade}
            seed={7}
            result="noise"
          />
          <feOffset ref={offset} in="noise" dx="0" dy="0" result="field" />
          <feDisplacementMap
            ref={displacement}
            in="SourceGraphic"
            in2="field"
            scale={onHover ? 0 : amount}
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          {edges === 'clean' ? (
            // The result is re-clipped on the original opacity: the shape
            // stays intact, only its inside ripples.
            <feComposite in="displaced" in2="SourceAlpha" operator="in" />
          ) : null}
        </filter>
      </svg>

      {children}
    </div>
  )
}
