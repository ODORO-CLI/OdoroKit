/**
 * Comparaison avant / apres.
 *
 * ## C'est un curseur, pas une image cliquable
 *
 * La plupart des comparateurs se pilotent au pointeur et nulle part ailleurs :
 * au clavier, ils sont muets, et un lecteur d'ecran n'annonce que deux images
 * superposees sans dire ce qu'elles font la.
 *
 * Le role est donc celui d'un curseur, avec ses valeurs et son nom. Les
 * fleches le deplacent, `Origine` et `Fin` le poussent aux extremites, et la
 * position est annoncee en pourcentage. Cela ne coute que des attributs.
 *
 * ## La position ne passe pas par React
 *
 * Elle change a chaque mouvement du pointeur. La porter dans l'etat
 * provoquerait un rendu par evenement pendant tout le glissement, pour
 * deplacer un decoupage que le compositeur sait animer seul. Une variable CSS
 * suffit ; l'etat React ne sert qu'a l'annonce accessible, mise a jour au
 * relachement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Une des deux images comparees. */
export interface CompareImage {
  /** Source. */
  readonly src: string
  /** Texte de remplacement. */
  readonly alt: string
}

/** Proprietes propres au composant. */
export interface CompareOwnProps {
  /** Image revelee a gauche de la poignee. */
  before: CompareImage
  /** Image revelee a droite de la poignee. */
  after: CompareImage
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Position initiale de la poignee, en pourcentage. @defaultValue 50 */
  start?: number
  /** Nom du curseur, annonce aux technologies d'assistance. */
  label: string
}

/** Toutes les proprietes. */
export type CompareProps = Customisable<CompareOwnProps>

/** Pas du deplacement au clavier, en pourcentage. */
const STEP = 2

/**
 * Compare deux images.
 *
 * @example
 * <Compare
 *   label="Avant et apres retouche"
 *   before={{ src: '/avant.jpg', alt: 'Avant retouche' }}
 *   after={{ src: '/apres.jpg', alt: 'Apres retouche' }}
 * />
 */
export function Compare({
  before,
  after,
  ratio = 1.777,
  start = 50,
  label,
  ...rest
}: CompareProps): ReactElement {
  const host = useRef<HTMLDivElement | null>(null)
  const [announced, setAnnounced] = useState(start)
  const position = useRef(start)

  const place = useCallback((percent: number) => {
    const clamped = Math.min(100, Math.max(0, percent))
    position.current = clamped
    host.current?.style.setProperty('--o-compare', `${clamped.toFixed(1)}%`)
  }, [])

  const fromPointer = useCallback(
    (clientX: number) => {
      const box = host.current?.getBoundingClientRect()
      if (box === undefined) return
      place(((clientX - box.left) / Math.max(box.width, 1)) * 100)
    },
    [place],
  )

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-select-none' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={host}
      className={className}
      style={
        {
          ...style,
          aspectRatio: String(ratio),
          '--o-compare': `${String(start)}%`,
        } as CSSProperties
      }
      onPointerDown={(event) => {
        event.currentTarget.setPointerCapture(event.pointerId)
        fromPointer(event.clientX)
      }}
      onPointerMove={(event) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          fromPointer(event.clientX)
        }
      }}
      onPointerUp={() => setAnnounced(Math.round(position.current))}
    >
      <img
        src={after.src}
        alt={after.alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
      />

      {/*
        L'image de gauche est decoupee par un `clip-path` plutot que par une
        largeur : redimensionner l'element deformerait l'image, alors qu'un
        decoupage laisse les deux exactement superposees.
      */}
      <img
        src={before.src}
        alt={before.alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
        style={{ clipPath: 'inset(0 calc(100% - var(--o-compare)) 0 0)' }}
      />

      <div
        role="slider"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={announced}
        aria-valuetext={`${String(announced)} pour cent`}
        tabIndex={0}
        onKeyDown={(event) => {
          const delta =
            event.key === 'ArrowLeft' ? -STEP : event.key === 'ArrowRight' ? STEP : 0
          const target =
            event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? 100
                : delta === 0
                  ? null
                  : position.current + delta

          if (target === null) return
          event.preventDefault()
          place(target)
          setAnnounced(Math.round(position.current))
        }}
        className="o-absolute o-inset-y-0 o-w-1 o-cursor-ew-resize o-bg-white focus:o-ring"
        style={{ left: 'var(--o-compare)', transform: 'translateX(-50%)' }}
      >
        <span
          aria-hidden
          className="o-absolute o-top-1/2 o-left-1/2 o-size-8 o-rounded-full o-border-w-1 o-border-white o-bg-black-45"
          style={{ transform: 'translate(-50%, -50%)' }}
        />
      </div>
    </div>
  )
}
