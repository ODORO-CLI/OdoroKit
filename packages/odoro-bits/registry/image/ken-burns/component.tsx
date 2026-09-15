/**
 * Drifting slideshow: two or three images cross-fading, each animated by a
 * slow zoom and drift while it is on screen.
 *
 * ## A timer, not a loop
 *
 * The only JavaScript that runs is a `setInterval` at the rhythm of the
 * slideshow — one React render every few seconds, to change the active image.
 * The rest belongs to the compositor: the fade is an opacity transition, the
 * drift a CSS animation declared once, twice as long as the interval so that
 * it never reaches its visible end.
 *
 * ## The drift restarts with the image
 *
 * The animation is only set on the active image: when the attribute drops, the
 * animation is removed and resets. Each turn therefore starts again from the
 * beginning of its drift, whose direction alternates from one image to the
 * next — two images drifting the same way give a single long tracking shot,
 * not a slideshow.
 *
 * ## Under reduced motion
 *
 * The first image, still, with no cycle: neither timer nor animation. A
 * slideshow that changes on its own is exactly the movement the preference
 * asks to switch off.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ken-burns'

/** Sets the drift, once per document. */
function ensureKenBurnsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-ken-burns-drift{',
    'from{transform:scale(1) translate3d(0,0,0)}',
    'to{transform:scale(var(--o-kb-zoom)) translate3d(var(--o-kb-dx),var(--o-kb-dy),0)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** One image of the slideshow. */
export interface KenBurnsImage {
  /** Source. */
  readonly src: string
  /** Alternative text. */
  readonly alt: string
}

/** Drift directions, alternated from one image to the next. */
const DRIFTS: readonly (readonly [string, string])[] = [
  ['2%', '-1.5%'],
  ['-2%', '1%'],
  ['1.5%', '2%'],
]

/** Properties specific to the component. */
export interface KenBurnsOwnProps {
  /** The images of the slideshow, two or three. */
  images: readonly KenBurnsImage[]
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Time each image is shown, in milliseconds. @defaultValue 6000 */
  interval?: number
  /** Scale reached at the end of the drift. @defaultValue 1.12 */
  zoom?: number
}

/** All properties. */
export type KenBurnsProps = Customisable<KenBurnsOwnProps>

/** Duration of the cross-fade, in milliseconds. */
const FADE_MS = 1200

/**
 * Chains images with a cross-fade, each in a slow drift.
 *
 * @example
 * <KenBurns
 *   images={[
 *     { src: '/dawn.jpg', alt: 'The workshop at dawn' },
 *     { src: '/noon.jpg', alt: 'The workshop at noon' },
 *     { src: '/dusk.jpg', alt: 'The workshop at dusk' },
 *   ]}
 * />
 */
export function KenBurns({
  images,
  ratio = 1.777,
  interval = 6000,
  zoom = 1.12,
  ...rest
}: KenBurnsProps): ReactElement {
  const { reduced } = useMotionState()
  const [active, setActive] = useState(0)
  ensureKenBurnsRule()

  const cycling = !reduced && images.length > 1

  useEffect(() => {
    if (!cycling) return

    const timer = setInterval(() => {
      setActive((index) => (index + 1) % images.length)
    }, interval)

    return () => clearInterval(timer)
  }, [cycling, interval, images.length])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // Under reduced motion: the first image, still, and nothing else.
  const shown = reduced ? images.slice(0, 1) : images

  return (
    <div {...rest} className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      {shown.map((image, index) => {
        const isActive = index === active || reduced
        const drift = DRIFTS[index % DRIFTS.length] ?? ['0%', '0%']

        const layer: CSSProperties = {
          opacity: isActive ? 1 : 0,
          transition: reduced ? undefined : `opacity ${String(FADE_MS)}ms ease-in-out`,
          '--o-kb-zoom': String(zoom),
          '--o-kb-dx': drift[0],
          '--o-kb-dy': drift[1],
          // The drift lasts two intervals: the image is gone before its
          // movement stops, and the stop is never seen.
          animation:
            isActive && !reduced
              ? `o-ken-burns-drift ${String(interval * 2)}ms linear forwards`
              : undefined,
        } as CSSProperties

        return (
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            aria-hidden={isActive ? undefined : true}
            className="o-absolute o-inset-0 o-size-full o-object-cover o-will-change-transform"
            style={layer}
          />
        )
      })}
    </div>
  )
}
