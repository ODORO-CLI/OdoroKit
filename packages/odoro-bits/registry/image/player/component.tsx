/**
 * Video player.
 *
 * ## Why redo what the browser gives
 *
 * The native controls work perfectly — and there is no reason to replace them
 * if the default appearance suits. This player exists for a single reason:
 * they cannot be styled. Neither colour, nor shape, nor radius, nor position;
 * each browser imposes its own.
 *
 * What belongs to the native stays native: the decoding, the buffering, the
 * subtitle tracks, full screen, picture in picture. The player adds nothing
 * but buttons and a subscription to the events of the media.
 *
 * ## The state comes from the media, never the other way round
 *
 * A player holding its own playback state would fall out of sync on the first
 * outside event — a media key on the keyboard, a pause forced by the system, a
 * network cut. The element is therefore the only source of truth: the controls
 * ask it, and the display follows what it announces.
 *
 * ## The controls are icons, not characters
 *
 * The triangles and bars of the Unicode repertoire give a player that works
 * with nothing installed. They also give a different player on every platform
 * — the volume emoji is in colour on one, a stroke on another — which follows
 * neither the colour of the text nor its size, and which no class can rescue.
 *
 * The player therefore uses six icons from the outline pack. Pruning keeps
 * only those: the cost is a few hundred bytes, for controls that take colour
 * and size like the rest.
 *
 * ## The progress bar is a slider
 *
 * Not a clickable bar. It carries its role, its bounds and its value in
 * seconds, the arrows move it by five seconds, `Home` and `End` jump to the
 * ends. That is what separates a player from a decoration.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Icon, type IconData } from '@odoro-cli/icons'
import { Maximize, Pause, Play, Volume_2, VolumeX } from '@odoro-cli/icons/outline'
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'

/** One subtitle track. */
export interface PlayerTrack {
  /** WebVTT file. */
  readonly src: string
  /** Language code. */
  readonly srcLang: string
  /** Wording shown in the browser menu. */
  readonly label: string
}

/** Properties specific to the component. */
export interface PlayerOwnProps {
  /** Source of the video. */
  src: string
  /** Image displayed before playback. */
  poster?: string
  /** Title of the video, announced to assistive technologies. */
  label: string
  /** Subtitle tracks. */
  tracks?: readonly PlayerTrack[]
  /** Width to height ratio. @defaultValue 1.777 */
  ratio?: number
}

/** All properties. */
export type PlayerProps = Customisable<PlayerOwnProps>

/** Keyboard movement step, in seconds. */
const STEP = 5

/** Formats a duration as minutes and seconds. */
function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${String(minutes)}:${String(rest).padStart(2, '0')}`
}

/** A control button. */
function Control({
  label,
  icon,
  onClick,
}: {
  label: string
  icon: IconData
  onClick: () => void
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="o-inline-flex o-size-9 o-shrink-0 o-items-center o-justify-center o-rounded-full o-text-white hover:o-bg-white-20 focus:o-ring o-cursor-pointer o-transition-colors"
    >
      <Icon icon={icon} size={18} />
    </button>
  )
}

/**
 * Styleable video player.
 *
 * @example
 * <Player
 *   src="/presentation.mp4"
 *   poster="/presentation.jpg"
 *   label="Product presentation"
 *   tracks={[{ src: '/en.vtt', srcLang: 'en', label: 'English' }]}
 * />
 */
export function Player({
  src,
  poster,
  label,
  tracks = [],
  ratio = 1.777,
  ...rest
}: PlayerProps): ReactElement {
  const video = useRef<HTMLVideoElement | null>(null)
  const shell = useRef<HTMLDivElement | null>(null)

  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(Number.NaN)

  // The state follows the media: a source of truth elsewhere would fall out of
  // sync on the first outside event.
  useEffect(() => {
    const node = video.current
    if (node === null) return

    const sync = (): void => {
      setPlaying(!node.paused && !node.ended)
      setMuted(node.muted)
      setTime(node.currentTime)
      setDuration(node.duration)
    }

    for (const event of [
      'play',
      'pause',
      'timeupdate',
      'loadedmetadata',
      'volumechange',
    ]) {
      node.addEventListener(event, sync)
    }
    sync()

    return () => {
      for (const event of [
        'play',
        'pause',
        'timeupdate',
        'loadedmetadata',
        'volumechange',
      ]) {
        node.removeEventListener(event, sync)
      }
    }
  }, [])

  const seek = useCallback((seconds: number) => {
    const node = video.current
    if (node === null || !Number.isFinite(node.duration)) return
    node.currentTime = Math.min(node.duration, Math.max(0, seconds))
  }, [])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-bg-black' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={shell}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        playsInline
        aria-label={label}
        onClick={() => (playing ? video.current?.pause() : void video.current?.play())}
        className="o-size-full o-cursor-pointer"
      >
        {tracks.map((track) => (
          <track
            key={track.srcLang}
            kind="subtitles"
            src={track.src}
            srcLang={track.srcLang}
            label={track.label}
          />
        ))}
      </video>

      <div className="o-absolute o-inset-x-0 o-bottom-0 o-flex o-flex-col o-gap-1 o-bg-black-60 o-px-3 o-py-2">
        <div
          role="slider"
          aria-label={`Position in ${label}`}
          aria-valuemin={0}
          aria-valuemax={Number.isFinite(duration) ? Math.round(duration) : 0}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} of ${clock(duration)}`}
          tabIndex={0}
          onKeyDown={(event) => {
            const delta =
              event.key === 'ArrowLeft' ? -STEP : event.key === 'ArrowRight' ? STEP : 0
            if (event.key === 'Home') return void (event.preventDefault(), seek(0))
            if (event.key === 'End') return void (event.preventDefault(), seek(duration))
            if (delta === 0) return
            event.preventDefault()
            seek(time + delta)
          }}
          onPointerDown={(event) => {
            const box = event.currentTarget.getBoundingClientRect()
            seek(((event.clientX - box.left) / Math.max(box.width, 1)) * duration)
          }}
          className="o-h-4 o-flex o-cursor-pointer o-items-center focus:o-ring"
        >
          <span className="o-h-1 o-w-full o-rounded-full o-bg-white-30">
            <span
              className="o-block o-h-full o-rounded-full o-bg-white"
              style={{
                width: Number.isFinite(duration)
                  ? `${String((time / Math.max(duration, 1)) * 100)}%`
                  : '0%',
              }}
            />
          </span>
        </div>

        <div className="o-flex o-items-center o-gap-1">
          <Control
            label={playing ? 'Pause' : 'Play'}
            icon={playing ? Pause : Play}
            onClick={() =>
              playing ? video.current?.pause() : void video.current?.play()
            }
          />

          <Control
            label={muted ? 'Unmute' : 'Mute'}
            icon={muted ? VolumeX : Volume_2}
            onClick={() => {
              const node = video.current
              if (node !== null) node.muted = !node.muted
            }}
          />

          <span className="o-ml-1 o-font-mono o-text-xs o-tabular-nums o-text-white">
            {clock(time)} / {clock(duration)}
          </span>

          <span className="o-flex-1" />

          {/*
            Full screen is requested on the container, not on the video:
            requesting the video would show the native controls over ours.
          */}
          <Control
            label="Full screen"
            icon={Maximize}
            onClick={() => void shell.current?.requestFullscreen().catch(() => undefined)}
          />
        </div>
      </div>
    </div>
  )
}
