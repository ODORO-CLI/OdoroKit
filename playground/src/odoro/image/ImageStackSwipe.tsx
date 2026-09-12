/**
 * Pile a balayer : des images empilees, celle du dessus se chasse au glisser
 * ou au clavier et repasse en dessous.
 *
 * ## Le geste s'ecrit dans le style, pas dans l'etat
 *
 * Pendant le glisser, la carte du dessus est deplacee en ecrivant sa
 * transformation sur l'element : un rendu React par pixel parcouru ferait
 * trainer la carte derriere le doigt. React ne rend qu'une fois par carte
 * chassee — au moment ou la pile change d'ordre — et c'est alors lui qui
 * reprend la main sur les transformations, apres que le geste a efface les
 * siennes.
 *
 * ## Pourquoi le clavier, et pas seulement le glisser
 *
 * Un carrousel qui ne repond qu'au glisser n'existe pas pour qui navigue au
 * clavier ou au lecteur d'ecran. La pile est donc un groupe atteignable par
 * tabulation, les fleches gauche et droite chassent la carte, et une region
 * vivante annonce l'image arrivee. Le glisser n'est qu'un raccourci du meme
 * geste, pas le seul chemin.
 *
 * ## Ce que les cartes du dessous montrent
 *
 * Seules quelques cartes sont dessinees derriere celle du dessus, decalees et
 * reduites : la pile doit se lire comme une epaisseur, pas comme une galerie.
 * Les cartes cachees sont retirees aux technologies d'assistance — leur texte
 * de remplacement redevient lisible des qu'elles arrivent sur le dessus.
 *
 * ## Sous mouvement reduit
 *
 * La carte ne s'envole pas : la pile change d'ordre immediatement, et
 * l'etat final — l'image suivante sur le dessus — est atteint sans trajet.
 * Le glisser et le clavier fonctionnent toujours.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-image-stack-swipe'

/** Duree de la sortie d'une carte chassee, en millisecondes. */
const EXIT = 380

/** Pose la regle de focus, une fois par document. */
function ensureStackRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  // Le contour de focus ne peut pas etre un style en ligne : il n'existe que
  // pendant la navigation au clavier, et c'est le navigateur qui le sait.
  style.textContent = [
    '[data-o-stack]:focus-visible{',
    'outline:2px solid var(--o-palette-brand-500);outline-offset:3px;',
    '}',
  ].join('')
  document.head.append(style)
}

/** Une image de la pile. */
export interface StackImage {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  readonly alt: string
}

/** Proprietes propres au composant. */
export interface ImageStackSwipeOwnProps {
  /** Les images empilees, de la premiere a la derniere. */
  images: readonly StackImage[]
  /** Rapport largeur sur hauteur des cartes. @defaultValue 1.4 */
  ratio?: number
  /** Distance a franchir pour chasser la carte, en pixels. @defaultValue 90 */
  threshold?: number
  /** Nombre de cartes visibles derriere celle du dessus. @defaultValue 2 */
  depth?: number
  /** Decalage entre deux cartes de la pile, en pixels. @defaultValue 16 */
  offset?: number
  /** Libelle du groupe, annonce avant la pile. @defaultValue 'Pile d images' */
  label?: string
}

/** Toutes les proprietes. */
export type ImageStackSwipeProps = Customisable<ImageStackSwipeOwnProps>

/**
 * Empile des images et les chasse une a une.
 *
 * @example
 * <ImageStackSwipe
 *   images={[
 *     { src: '/un.jpg', alt: 'Premiere planche' },
 *     { src: '/deux.jpg', alt: 'Deuxieme planche' },
 *     { src: '/trois.jpg', alt: 'Troisieme planche' },
 *   ]}
 * />
 *
 * @example
 * // Pile plus epaisse, moins sensible au geste.
 * <ImageStackSwipe images={planches} depth={3} threshold={140} />
 */
export function ImageStackSwipe({
  images,
  ratio = 1.4,
  threshold = 90,
  depth = 2,
  offset = 16,
  label = 'Pile d images',
  ...rest
}: ImageStackSwipeProps): ReactElement {
  const { reduced } = useMotionState()
  const [front, setFront] = useState(0)
  const card = useRef<HTMLDivElement | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const drag = useRef<{ x: number; y: number; dx: number; dy: number } | null>(null)

  ensureStackRule()

  const total = images.length
  const visible = Math.max(0, Math.min(4, Math.round(depth)))

  // Le compte a rebours de la sortie survit a un demontage : sans ce nettoyage,
  // il ecrirait dans un composant qui n'est plus la.
  useEffect(() => () => clearTimeout(timer.current), [])

  /** Rend la main a React apres un geste. */
  const relacher = (element: HTMLDivElement): void => {
    element.style.transition = ''
    element.style.transform = ''
    element.style.opacity = ''
  }

  /** Fait passer la carte du dessus en dessous. */
  const avancer = (): void => {
    setFront((value) => (total === 0 ? 0 : (value + 1) % total))
  }

  /** Chasse la carte du dessus vers un bord. */
  const chasser = (direction: -1 | 1, lift = 0): void => {
    const element = card.current
    if (element === null || total < 2) {
      if (element !== null) relacher(element)
      return
    }

    if (reduced) {
      // L'etat final, sans trajet : voir l'en-tete.
      relacher(element)
      avancer()
      return
    }

    const width = element.getBoundingClientRect().width || 320
    element.style.transition = `transform ${String(EXIT)}ms var(--o-ease-exit), opacity ${String(EXIT)}ms linear`
    element.style.transform = `translate3d(${String(direction * width * 1.2)}px, ${String(lift)}px, 0) rotate(${String(direction * 16)}deg)`
    element.style.opacity = '0'

    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      relacher(element)
      avancer()
    }, EXIT)
  }

  /** Debut du glisser : la carte quitte ses transitions et suit le geste. */
  const prendre = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (total < 2) return
    const element = event.currentTarget
    element.setPointerCapture(event.pointerId)
    element.style.transition = 'none'
    drag.current = { x: event.clientX, y: event.clientY, dx: 0, dy: 0 }
  }

  /** Suite du glisser : une transformation ecrite, aucun rendu React. */
  const suivre = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = drag.current
    if (state === null) return

    state.dx = event.clientX - state.x
    state.dy = event.clientY - state.y

    // La rotation vient de la distance parcourue : c'est elle qui donne a la
    // carte l'air d'un carton qu'on ecarte, plutot que d'un rectangle qui
    // coulisse.
    event.currentTarget.style.transform = `translate3d(${String(state.dx)}px, ${String(state.dy * 0.35)}px, 0) rotate(${(state.dx / 18).toFixed(2)}deg)`
  }

  /** Fin du glisser : au-dela du seuil la carte part, sinon elle revient. */
  const lacher = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const state = drag.current
    drag.current = null
    if (state === null) return

    const element = event.currentTarget
    if (Math.abs(state.dx) > Math.max(20, threshold)) {
      chasser(state.dx > 0 ? 1 : -1, state.dy * 0.35)
      return
    }

    // Sous le seuil, la carte reprend sa place : le retour est anime meme
    // quand la sortie ne l'est pas, parce qu'un saut ici se lit comme un rate.
    element.style.transition = reduced
      ? 'none'
      : `transform ${String(EXIT)}ms var(--o-ease-standard)`
    element.style.transform = ''
  }

  const { className, style } = mergePresentation(
    { className: 'o-relative o-select-none' },
    rest,
  )

  const courante = total === 0 ? undefined : images[front % total]

  return (
    <div
      {...rest}
      data-o-stack=""
      role="group"
      aria-label={label}
      tabIndex={0}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      onKeyDown={(event) => {
        if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
        // La page ne doit pas defiler pendant qu'on feuillette la pile.
        event.preventDefault()
        chasser(event.key === 'ArrowRight' ? 1 : -1)
      }}
    >
      {images.map((image, index) => {
        const rank = total === 0 ? 0 : (index - front + total) % total
        const shown = rank <= visible
        const top = rank === 0

        const cardStyle: CSSProperties = {
          borderRadius: 'inherit',
          backgroundColor: 'var(--o-theme-surface)',
          boxShadow: 'var(--o-shadow-lg)',
          zIndex: total - rank,
          opacity: shown ? 1 : 0,
          transform: `translate3d(0, ${String(rank * offset)}px, 0) scale(${String(1 - rank * 0.05)})`,
          transition: reduced
            ? undefined
            : `transform ${String(EXIT)}ms var(--o-ease-standard), opacity ${String(EXIT)}ms linear`,
          pointerEvents: top ? 'auto' : 'none',
          touchAction: 'none',
        }

        return (
          <div
            key={`${image.src}-${String(index)}`}
            ref={top ? card : undefined}
            aria-hidden={!top}
            className="o-absolute o-inset-0 o-overflow-hidden"
            style={cardStyle}
            onPointerDown={top ? prendre : undefined}
            onPointerMove={top ? suivre : undefined}
            onPointerUp={top ? lacher : undefined}
            onPointerCancel={top ? lacher : undefined}
          >
            <img
              loading="lazy"
              decoding="async"
              src={image.src}
              alt={image.alt}
              draggable={false}
              className="o-size-full o-object-cover"
            />
          </div>
        )
      })}

      {/* Ce que le geste change doit s'entendre autant qu'il se voit. */}
      <p role="status" className="o-sr-only">
        {courante === undefined
          ? ''
          : `Image ${String((front % Math.max(total, 1)) + 1)} sur ${String(total)}. ${courante.alt}`}
      </p>
    </div>
  )
}
