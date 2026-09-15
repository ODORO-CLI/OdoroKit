/**
 * Video hero: scrolling walks the video forward, frame by frame.
 *
 * ## The page lock was removed, and that is the important point
 *
 * The original implementation set `position: fixed` on `document.body` and
 * captured the wheel to divert it towards `video.currentTime`. Its own comment
 * owned up to it: "no escape valve in either direction".
 *
 * That produces a dead end. A page locked that way cannot be left by keyboard
 * — neither `Page Down`, nor `End`, nor `Tab` do anything at all, since the
 * page no longer scrolls. A screen reader has no document left to walk. A
 * tablet without a wheel only has the touch gesture, which is captured too.
 * And the scrollbar disappears, so nothing indicates that anything is
 * happening.
 *
 * The same output is obtained without locking anything: a wrapper several
 * window heights tall, a sticky scene inside it, and the scroll progress — the
 * real one — driving the video. Keyboard scrolling works, the bar shows where
 * one is at, and leaving the section consists in carrying on scrolling.
 *
 * ## The seek queue
 *
 * `currentTime` cannot be set on every frame: a seek in flight ignores the
 * following ones, and the requests pile up until the video runs backwards. The
 * last requested value is therefore held, and applied on the next `seeked` —
 * one seek at a time, always towards the most recent position. It is the only
 * way to get smooth scrubbing, and it comes from the original implementation.
 *
 * ## What the video has to be
 *
 * An ordinary video cannot be walked frame by frame: without closely spaced
 * keyframes, every seek decodes from the previous one, and the output stutters.
 * An encoding at a short interval — a keyframe every ten to fifteen frames — is
 * what makes the difference between the effect and its failure.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** Props of the component itself. */
export interface ScrollVideoOwnProps {
  /** Source of the video. Required: the registry ships none. */
  src: string
  /** Image displayed as long as the video is not decodable. */
  poster?: string
  /** Title, faded out as the video advances. */
  title?: ReactNode
  /** Sentence revealed at the end of the run. */
  tagline?: ReactNode
  /** Invitation to scroll, faded out on the first movement. @defaultValue 'Scroll' */
  hint?: ReactNode
  /**
   * Length of the run, in window heights. Three means it takes three screens
   * of scrolling to walk through the whole video.
   *
   * @defaultValue 3
   */
  range?: number
  /**
   * Catch-up speed towards the aimed position. Higher is sharper.
   *
   * @defaultValue 6
   */
  ease?: number
  /** Replacement text for the video, for whatever cannot play it. */
  description?: string
}

/** All the props. */
export type ScrollVideoProps = Customisable<ScrollVideoOwnProps, 'section'>

/** Clamps a value between zero and one. */
function unit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * Gap below which a seek has no reason to happen, in seconds.
 *
 * A sixtieth of a second is the length of a frame: asking for less than that
 * changes no pixel, and costs a decoding round trip.
 */
const SEEK_EPSILON = 1 / 60

/** `HTMLMediaElement.HAVE_CURRENT_DATA`: the current frame is decoded. */
const HAVE_CURRENT_DATA = 2

/**
 * Hero whose video advances with the scrolling.
 *
 * @example
 * <ScrollVideo
 *   src="/videos/ville.mp4"
 *   poster="/videos/ville.jpg"
 *   title="La ville s ouvre"
 *   tagline="Every door is already open."
 * />
 *
 * @example
 * // A longer run leaves more scrolling for the same video.
 * <ScrollVideo src="/videos/atelier.mp4" range={5} />
 */
export function ScrollVideo({
  src,
  poster,
  title,
  tagline,
  hint = 'Scroll',
  range = 3,
  ease = 6,
  description,
  ...rest
}: ScrollVideoProps): ReactElement {
  const { reduced } = useMotionState()
  const video = useRef<HTMLVideoElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const taglineRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const [loaded, setLoaded] = useState(false)

  /** Aimed position, written by the scrolling, read by the loop. */
  const target = useRef(0)
  /** Displayed position, brought closer to the target on every frame. */
  const shown = useRef(0)

  const { ref } = useScrollScrub<HTMLDivElement>(
    (progress) => {
      target.current = progress
      // Under reduced motion, the progress arrives once, at one: there is no
      // loop to pick it up, so it is applied right here.
      if (reduced) {
        shown.current = progress
        paint(progress)
      }
    },
    { start: 'top top', end: 'bottom bottom', name: 'video-defilee' },
  )

  /**
   * Applies a progress value to everything that depends on it.
   *
   * Declared as a function of the component rather than memoised: it only reads
   * refs, and so closes over no value that would go stale.
   */
  function paint(progress: number): void {
    const element = video.current
    if (element !== null) {
      element.style.transform = `scale(${String(1 + progress * 0.06)})`
    }

    const heading = titleRef.current
    if (heading !== null) {
      const t = 1 - unit(progress / 0.35)
      heading.style.opacity = t.toFixed(3)
      heading.style.transform = `translate3d(0,${String((1 - t) * -24)}px,0)`
    }

    const end = taglineRef.current
    if (end !== null) {
      const t = unit((progress - 0.82) / 0.18)
      end.style.opacity = t.toFixed(3)
      end.style.transform = `translate3d(0,${String((1 - t) * 20)}px,0)`
    }

    const invitation = hintRef.current
    if (invitation !== null) {
      invitation.style.opacity = progress > 0.01 ? '0' : '1'
    }

    const bar = barRef.current
    if (bar !== null) bar.style.transform = `scaleX(${progress.toFixed(4)})`
  }

  // The seeking, and the loop that feeds it.
  useEffect(() => {
    const element = video.current
    if (element === null) return

    let seeking = false
    let waiting: number | null = null

    /**
     * Requests a position. One seek at a time; the last one requested while
     * another is running is applied as soon as it ends.
     */
    const seek = (time: number): void => {
      // Requesting the current position again does not fire `seeked`
      // everywhere: the flag would stay raised, the queue would never drain,
      // and the scrubbing would freeze for good. So we only ask for what really
      // moves. The case happens as soon as the video is still, that is to say
      // as soon as the user stops scrolling — so every time.
      if (Math.abs(element.currentTime - time) < SEEK_EPSILON) return

      if (seeking) {
        waiting = time
        return
      }
      seeking = true
      element.currentTime = time
    }

    const onSeeked = (): void => {
      seeking = false
      if (waiting === null) return
      const next = waiting
      waiting = null
      seek(next)
    }

    const onLoaded = (): void => {
      setLoaded(true)
      // The duration was not known when the first progress value arrived: we
      // replay it, otherwise the video would stay on its starting frame.
      if (reduced) seek((element.duration || 0) * 0.92)
      paint(shown.current)
    }

    element.addEventListener('seeked', onSeeked)
    element.addEventListener('loadeddata', onLoaded)

    // The video may already be decodable: cached, or remounted after a prop
    // change. The event has then passed before the listener, and without this
    // catch-up it will never come back — the video would stay at zero opacity,
    // on a page that looks empty.
    if (element.readyState >= HAVE_CURRENT_DATA) onLoaded()

    if (reduced) {
      return () => {
        element.removeEventListener('seeked', onSeeked)
        element.removeEventListener('loadeddata', onLoaded)
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        // Exponential catch-up expressed as a function of the elapsed time: a
        // constant fraction would go twice as fast on a screen at a hundred and
        // twenty frames per second.
        const factor = 1 - Math.exp(-ease * delta)
        shown.current += (target.current - shown.current) * factor

        const duration = element.duration
        if (Number.isFinite(duration) && duration > 0) {
          seek(shown.current * duration)
        }
        paint(shown.current)
      },
      { name: 'video-defilee', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      element.removeEventListener('seeked', onSeeked)
      element.removeEventListener('loadeddata', onLoaded)
    }
    // `paint` does not appear in the dependencies: it only reads refs, and so
    // closes over no value that would go stale between two renders.
  }, [ease, reduced])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <section
      {...rest}
      ref={ref}
      className={className}
      // The height of the wrapper **is** the length of the run: it is what the
      // trigger measures, and it alone.
      style={{ height: `${String(Math.max(1, range + 1) * 100)}vh`, ...style }}
    >
      <div className="o-sticky o-top-0 o-h-screen o-w-full o-overflow-hidden o-bg-zinc-50 dark:o-bg-zinc-950">
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          // Without a description, the video carries no information the title
          // does not already carry: announcing it as an anonymous media adds
          // noise without teaching anything. With a description, it becomes
          // content in its own right and stays in the accessibility tree.
          aria-label={description}
          aria-hidden={description === undefined}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover o-will-change-transform"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity var(--o-duration-slower) var(--o-ease-entrance)',
          }}
        />

        <div
          aria-hidden
          className="o-pointer-events-none o-absolute o-inset-0 o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-transparent o-to-zinc-50 dark:o-to-zinc-950"
        />

        {title === undefined ? null : (
          <div
            ref={titleRef}
            className="o-pointer-events-none o-absolute o-inset-0 o-flex o-items-center o-justify-center o-px-8 o-text-center"
          >
            <h1 className="o-text-5xl o-font-bold o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50 md:o-text-8xl">
              {title}
            </h1>
          </div>
        )}

        {tagline === undefined ? null : (
          <div
            ref={taglineRef}
            style={{ opacity: 0 }}
            className="o-pointer-events-none o-absolute o-inset-0 o-flex o-items-center o-justify-center o-px-10 o-text-center"
          >
            <p className="o-text-2xl o-font-medium o-text-zinc-900 dark:o-text-zinc-50 md:o-text-4xl">
              {tagline}
            </p>
          </div>
        )}

        <div
          ref={hintRef}
          aria-hidden
          className="o-pointer-events-none o-absolute o-bottom-10 o-left-1/2 o-flex o-flex-col o-items-center o-gap-2 o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-300"
          style={{
            transform: 'translateX(-50%)',
            transition: 'opacity var(--o-duration-slow) var(--o-ease-exit)',
          }}
        >
          <span>{hint}</span>
          <svg
            viewBox="0 0 14 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="o-h-4 o-w-4"
          >
            <path d="M7 1v16M2 12l5 5 5-5" />
          </svg>
        </div>

        {/* The progress thread: the only indication of how far one is into the
            video, since the browser bar measures the page and not the run. */}
        <div
          aria-hidden
          className="o-absolute o-bottom-0 o-h-0.5 o-w-full o-bg-zinc-200 dark:o-bg-zinc-800"
        >
          <div
            ref={barRef}
            className="o-h-full o-w-full o-bg-zinc-50"
            style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
          />
        </div>
      </div>
    </section>
  )
}
