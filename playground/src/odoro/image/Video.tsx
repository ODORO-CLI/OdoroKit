/**
 * Video de fond : le pendant de `image/frame`, pour une video.
 *
 * ## Ce qu'une video decorative doit respecter
 *
 * Elle est muette, elle boucle, et elle ne demarre pas toute seule sur une
 * page qu'on n'a pas encore atteinte : une video qui se decode hors de l'ecran
 * consomme du processeur et de la batterie pour rien. La lecture attend donc
 * l'entree dans le champ, et s'arrete a la sortie.
 *
 * Sous **mouvement reduit**, elle ne demarre pas du tout et l'affiche reste.
 * C'est le seul cas ou une image fixe est le rendu final plutot qu'une
 * attente — une video d'ambiance n'apporte rien d'autre que son mouvement.
 *
 * ## L'affiche n'est pas optionnelle
 *
 * Entre le premier rendu et la premiere trame decodee, il s'ecoule bien plus
 * de temps que pour une image. Sans affiche, le cadre est noir pendant tout ce
 * temps — a l'endroit le plus visible de la page, puisque c'est generalement
 * un fond de heros.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from 'odoro-engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface VideoOwnProps {
  /** Source de la video. */
  src: string
  /** Image affichee avant la premiere trame. */
  poster?: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Ajustement dans le cadre. @defaultValue 'cover' */
  fit?: 'cover' | 'contain'
  /**
   * Ce que la video montre, pour qui ne la voit pas.
   *
   * Une video decorative n'a pas d'equivalent textuel — elle est alors retiree
   * de l'arbre d'accessibilite. Des qu'elle porte du sens, cette description
   * devient obligatoire.
   */
  description?: string
}

/** Toutes les proprietes : les siennes, plus celles d'une video. */
export type VideoProps = Customisable<VideoOwnProps, 'video'>

/**
 * Affiche une video d'ambiance.
 *
 * @example
 * <Video
 *   src="/atelier.mp4"
 *   poster="/atelier.jpg"
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

    // Le decodage attend l'entree dans le champ : une video qui tourne hors de
    // l'ecran consomme processeur et batterie sans que personne ne la voie.
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
        L'affiche reste sous la video et n'est jamais retiree : elle couvre le
        decodage, et devient le rendu final sous mouvement reduit.
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
