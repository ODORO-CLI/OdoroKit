/**
 * Rideau sans compteur : une plaque qui s'ouvre par un trou qui grandit.
 *
 * ## Ne rien compter est souvent le meilleur choix
 *
 * `counter-gate` mesure une disponibilite reelle. Quand il n'y a rien a
 * mesurer — une page dont tout le poids est deja la, un site qui veut
 * simplement une entree — un pourcentage n'aurait rien a dire, et un
 * pourcentage qui n'a rien a dire ment.
 *
 * Alors on ne compte pas. Une marque, une plaque, une duree assumee. C'est le
 * rideau le plus cher a l'oeil et le plus honnete des deux, parce qu'il ne
 * promet aucune information.
 *
 * ## L'ouverture est une forme, pas une disparition
 *
 * Le plan ne s'efface pas : il se **perce**. Un disque grandit depuis le centre
 * jusqu'a deborder l'ecran, et la page apparait dedans.
 *
 * C'est fait avec `clip-path`, donc par le compositeur : aucune mise en page
 * n'est recalculee pendant l'ouverture. Une opacite qui tombe laisserait la
 * page transparaitre a travers le rideau et trahirait qu'il n'y a jamais eu
 * qu'un voile. Un trou dit qu'il y avait une plaque.
 *
 * ## `onDone` part au debut de l'ouverture
 *
 * Comme pour l'autre rideau, et pour la meme raison : le contenu doit entrer
 * pendant que le trou s'agrandit. Attendre la fin donne deux gestes qui se
 * suivent au lieu d'un seul qui se deploie.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface CurtainWipeOwnProps {
  /**
   * Le fond du rideau.
   *
   * Une valeur, pas un jeton de role : le systeme n'en a pas. Il ship des
   * echelles brutes, et c'est au composant de dire laquelle il prend.
   *
   * @defaultValue le plus sombre de l'echelle neutre
   */
  background?: string
  /** L'encre du rideau. @defaultValue le plus clair de l'echelle neutre */
  ink?: string
  /** Ce qui s'affiche au centre pendant l'attente. */
  label?: ReactNode
  /**
   * Combien de temps la plaque reste pleine, en millisecondes.
   *
   * @defaultValue 1200
   */
  holdMs?: number
  /**
   * Duree de l'ouverture, en millisecondes.
   *
   * @defaultValue 1000
   */
  wipeMs?: number
  /**
   * D'ou part le trou, en pourcentage de la largeur et de la hauteur.
   *
   * @defaultValue [50, 50]
   */
  origin?: readonly [number, number]
  /** Appele au **debut** de l'ouverture. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type CurtainWipeProps = Customisable<CurtainWipeOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-curtain-wipe'

/** Pose les regles de la plaque, une fois par document. */
function ensureCurtainRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-curtain]{',
    'position:fixed;inset:0;z-index:9999;',
    'display:flex;align-items:center;justify-content:center;',
    'background:var(--o-curtain-bg);color:var(--o-curtain-ink);',
    // Le trou est ferme au repos. `circle(0)` plutot que `circle(0%)` : la
    // forme se ferme sur un rayon nul, pas sur une fraction d'une reference
    // qui changerait avec le format de l'ecran.
    'clip-path:circle(140% at var(--o-curtain-x) var(--o-curtain-y));',
    'transition:clip-path var(--o-curtain-wipe) cubic-bezier(0.83,0,0.17,1);',
    '}',
    // L'ouverture inverse le decoupage : c'est le rideau qu'on perce, donc son
    // rayon *diminue* jusqu'a ne plus rien couvrir.
    '[data-o-curtain-open]{clip-path:circle(0% at var(--o-curtain-x) var(--o-curtain-y))}',
    '[data-o-curtain-label]{transition:opacity 420ms ease}',
    '[data-o-curtain-open] [data-o-curtain-label]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'une plaque, puis la perce.
 *
 * @example
 * <CurtainWipe label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Le trou part du coin superieur gauche, la ou se trouve le logo.
 * <CurtainWipe origin={[12, 18]} holdMs={800} onDone={ouvrir} />
 */
export function CurtainWipe({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  holdMs = 1200,
  wipeMs = 1000,
  origin = [50, 50],
  onDone,
  ...rest
}: CurtainWipeProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [ouvert, setOuvert] = useState(false)
  const [parti, setParti] = useState(false)

  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureCurtainRule()

  useEffect(() => {
    // Mouvement reduit : la plaque n'apparait pas. Elle n'apportait qu'un
    // geste, et le geste est precisement ce qu'on nous demande d'omettre.
    if (reduced) {
      if (!annonce.current) {
        annonce.current = true
        rappel.current?.()
      }
      setParti(true)
      return
    }

    const minuteur = setTimeout(() => {
      setOuvert(true)

      // Ici, pas a la fin de la transition : le contenu entre pendant que le
      // trou s'agrandit.
      if (!annonce.current) {
        annonce.current = true
        rappel.current?.()
      }
    }, holdMs)

    return () => {
      clearTimeout(minuteur)
    }
  }, [reduced, holdMs])

  if (parti) return null

  const { className, style } = mergePresentation({}, rest)

  const stylePlaque = {
    ...style,
    '--o-curtain-x': `${String(origin[0])}%`,
    '--o-curtain-y': `${String(origin[1])}%`,
    '--o-curtain-wipe': `${String(wipeMs)}ms`,
    '--o-curtain-bg': background,
    '--o-curtain-ink': ink,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={stylePlaque}
      data-o-curtain=""
      {...(ouvert ? { 'data-o-curtain-open': '' } : {})}
      aria-hidden="true"
      onTransitionEnd={() => {
        if (ouvert) setParti(true)
      }}
    >
      {label !== undefined && <div data-o-curtain-label="">{label}</div>}
    </div>
  )
}
