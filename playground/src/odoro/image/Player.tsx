/**
 * Lecteur video.
 *
 * ## Pourquoi refaire ce que le navigateur donne
 *
 * Les commandes natives fonctionnent parfaitement — et n'ont aucune raison
 * d'etre remplacees si l'apparence par defaut convient. Ce lecteur existe pour
 * une seule raison : elles ne sont pas habillables. Ni couleur, ni forme, ni
 * rayon, ni position ; chaque navigateur impose la sienne.
 *
 * Ce qui reste au natif reste au natif : le decodage, la mise en tampon, les
 * pistes de sous-titres, le plein ecran, l'image dans l'image. Le lecteur
 * n'ajoute que des boutons et un abonnement aux evenements du media.
 *
 * ## L'etat vient du media, jamais l'inverse
 *
 * Un lecteur qui tiendrait son propre etat de lecture se desynchroniserait au
 * premier evenement exterieur — une touche media du clavier, une mise en
 * pause par le systeme, une coupure reseau. L'element est donc la seule source
 * de verite : les commandes lui demandent, et l'affichage suit ce qu'il
 * annonce.
 *
 * ## Les commandes sont des icones, pas des caracteres
 *
 * Les triangles et les barres du repertoire Unicode donnent un lecteur qui
 * fonctionne sans rien installer. Ils donnent aussi un lecteur different sur
 * chaque plateforme — l'emoji de volume est en couleurs sur l'un, un trait sur
 * l'autre —, qui ne suit ni la couleur du texte ni sa taille, et qu'aucune
 * classe ne rattrape.
 *
 * Le lecteur emploie donc six icones du jeu filaire. L'elagage ne retient
 * qu'elles : le cout est de quelques centaines d'octets, pour des commandes
 * qui se colorent et se dimensionnent comme le reste.
 *
 * ## La barre de progression est un curseur
 *
 * Pas une barre cliquable. Elle porte son role, ses bornes et sa valeur en
 * secondes, les fleches la deplacent de cinq secondes, `Origine` et `Fin`
 * sautent aux extremites. C'est ce qui separe un lecteur d'une decoration.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro/engine'
import { Icon, type IconData } from '@odoro/icons'
import { Maximize, Pause, Play, Volume_2, VolumeX } from '@odoro/icons/filaire'
import { useCallback, useEffect, useRef, useState, type ReactElement } from 'react'

/** Une piste de sous-titres. */
export interface PlayerTrack {
  /** Fichier WebVTT. */
  readonly src: string
  /** Code de langue. */
  readonly srcLang: string
  /** Intitule affiche dans le menu du navigateur. */
  readonly label: string
}

/** Proprietes propres au composant. */
export interface PlayerOwnProps {
  /** Source de la video. */
  src: string
  /** Image affichee avant la lecture. */
  poster?: string
  /** Titre de la video, annonce aux technologies d'assistance. */
  label: string
  /** Pistes de sous-titres. */
  tracks?: readonly PlayerTrack[]
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
}

/** Toutes les proprietes. */
export type PlayerProps = Customisable<PlayerOwnProps>

/** Pas de deplacement au clavier, en secondes. */
const STEP = 5

/** Met une duree en minutes et secondes. */
function clock(seconds: number): string {
  if (!Number.isFinite(seconds)) return '--:--'
  const minutes = Math.floor(seconds / 60)
  const rest = Math.floor(seconds % 60)
  return `${String(minutes)}:${String(rest).padStart(2, '0')}`
}

/** Un bouton de commande. */
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
 * Lecteur video habillable.
 *
 * @example
 * <Player
 *   src="/presentation.mp4"
 *   poster="/presentation.jpg"
 *   label="Presentation du produit"
 *   tracks={[{ src: '/fr.vtt', srcLang: 'fr', label: 'Francais' }]}
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

  // L'etat suit le media : une source de verite ailleurs se
  // desynchroniserait au premier evenement exterieur.
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
          aria-label={`Position dans ${label}`}
          aria-valuemin={0}
          aria-valuemax={Number.isFinite(duration) ? Math.round(duration) : 0}
          aria-valuenow={Math.round(time)}
          aria-valuetext={`${clock(time)} sur ${clock(duration)}`}
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
            label={playing ? 'Mettre en pause' : 'Lire'}
            icon={playing ? Pause : Play}
            onClick={() =>
              playing ? video.current?.pause() : void video.current?.play()
            }
          />

          <Control
            label={muted ? 'Retablir le son' : 'Couper le son'}
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
            Le plein ecran est demande au conteneur, pas a la video : demander
            la video afficherait les commandes natives par-dessus les notres.
          */}
          <Control
            label="Plein ecran"
            icon={Maximize}
            onClick={() => void shell.current?.requestFullscreen().catch(() => undefined)}
          />
        </div>
      </div>
    </div>
  )
}
