/**
 * Background video: the counterpart of `image/frame`, for a video.
 *
 * ## What a decorative video must respect
 *
 * It is muted, it loops, and it does not start on its own on a page that has
 * not yet been reached: a video decoding off screen burns processor and
 * battery for nothing. Playback therefore waits for the entry into the
 * viewport, and stops on leaving it.
 *
 * Under **reduced motion**, it does not start at all and the poster stays. It
 * is the only case where a still image is the final rendering rather than a
 * wait — an ambient video brings nothing other than its movement.
 *
 * ## The poster is not optional
 *
 * Between the first render and the first decoded frame, far more time passes
 * than for an image. Without a poster, the frame is black for all that time —
 * in the most visible place on the page, since it is generally a hero
 * background.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Properties specific to the component. */
export interface VideoOwnProps {
  /** Source of the video. */
  src: string
  /** Image displayed before the first frame. */
  poster?: string
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
  /** Fit inside the frame. @defaultValue 'cover' */
  fit?: 'cover' | 'contain'
  /**
   * What the video shows, for whoever does not see it.
   *
   * A decorative video has no textual equivalent — it is then removed from the
   * accessibility tree. As soon as it carries meaning, this description
   * becomes mandatory.
   */
  description?: string
}

/** All properties: its own, plus those of a video. */
export type VideoProps = Customisable<VideoOwnProps, 'video'>

/**
 * Displays an ambient video.
 *
 * @example
 * <Video
 *   src="/workshop.mp4"
 *   poster="/workshop.jpg"
 *   className="o-absolute o-inset-0"
 * />
 */
export function Video({
  src,
  poster,
  ratio = 1.777,
  fit = 'cover',
  description,
  ...rest
}: VideoProps): ReactElement {
  const { reduced } = useMotionState()
  const [node, setNode] = useState<HTMLVideoElement | null>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    if (node === null || reduced) return

    // Decoding waits for the entry into the viewport: a video running off
    // screen burns processor and battery without anybody seeing it.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) void node.play().catch(() => undefined)
          else node.pause()
        }
      },
      { threshold: 0.1 },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [node, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const surface: CSSProperties = {
    objectFit: fit,
    opacity: playing ? 1 : 0,
    transition: reduced
      ? undefined
      : 'opacity var(--o-duration-slow) var(--o-ease-entrance)',
  }

  return (
    <div className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      {/*
        The poster stays under the video and is never removed: it covers the
        decoding, and becomes the final rendering under reduced motion.
      */}
      {poster === undefined ? null : (
        <img
          src={poster}
          alt={description ?? ''}
          aria-hidden={description === undefined}
          className="o-absolute o-inset-0 o-size-full"
          style={{ objectFit: fit }}
        />
      )}

      <video
        {...rest}
        ref={setNode}
        src={reduced ? undefined : src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        aria-hidden={description === undefined}
        aria-label={description}
        className="o-absolute o-inset-0 o-size-full"
        style={surface}
      />
    </div>
  )
}
