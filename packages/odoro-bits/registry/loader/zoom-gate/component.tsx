/**
 * Rideau qui s'eloigne : la marque avance, la plaque recule.
 *
 * ## Deux mouvements opposes, dans la meme profondeur
 *
 * Le rideau ne s'efface pas et ne glisse pas : il **recule**, dans une
 * perspective. Au meme instant la marque vient vers l'oeil. Les deux gestes
 * partent ensemble et vont dans des sens contraires, et c'est cette opposition
 * qui fait le tout : la marque grandit, se detache, sort du cadre ; la plaque
 * qui la portait s'enfonce derriere elle et devient un rectangle lointain.
 *
 * L'effet ne coute rien de plus qu'une translation : `translateZ` est une
 * transformee comme une autre, et la perspective vit sur le conteneur.
 *
 * ## Pourquoi l'opacite arrive en retard
 *
 * Une plaque qui recule ne disparait jamais tout a fait : elle finit en petit
 * rectangle au centre, et un petit rectangle qui reste est plus genant qu'un
 * grand qui s'en va. On la fait donc s'effacer, mais **seulement sur la fin** —
 * le fondu part a la moitie de la course. Fondre des le debut ferait
 * transparaitre la page a travers le rideau et trahirait le montage : on
 * verrait qu'il n'y avait qu'un voile la ou l'on voulait un objet.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand la plaque **commence** a reculer. Le contenu entre
 * pendant que le rideau s'eloigne, ce qui est precisement ce que la profondeur
 * raconte : la page etait derriere. Attendre la fin donnerait deux gestes qui
 * se suivent la ou l'on en voulait un seul.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, il devient `absolute`, se resout
 * contre le premier ancetre positionne et ne touche plus au defilement.
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
export interface ZoomGateOwnProps {
  /** Le fond de la plaque. @defaultValue le fond du theme */
  background?: string
  /** L'encre de la marque. @defaultValue l'encre du theme */
  ink?: string
  /** La marque qui avance vers l'oeil : un nom, un logo. */
  label?: ReactNode
  /**
   * Ce que les lecteurs d'ecran annoncent. Chaine vide pour n'annoncer que le
   * libelle.
   *
   * @defaultValue 'Chargement'
   */
  status?: string
  /** De combien la marque grandit en partant. @defaultValue 3.2 */
  punch?: number
  /** Profondeur de recul de la plaque, en pixels. @defaultValue 900 */
  depth?: number
  /** Combien de temps la plaque reste en place, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree du recul, en millisecondes. @defaultValue 900 */
  exitMs?: number
  /**
   * Etat controle : la plaque couvre tant que c'est `true`, et recule au
   * premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type ZoomGateProps = Customisable<ZoomGateOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-zoom-gate'

/** Pose les regles de la profondeur, une fois par document. */
function ensureZoomGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La perspective vit ici, sur la scene : c'est ce qui donne un point de
    // fuite commun a la plaque et a la marque, donc la sensation qu'elles
    // partagent le meme espace.
    '[data-o-zoomg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'perspective:1000px;color:var(--o-zoomg-ink);',
    '}',
    '[data-o-zoomg][data-o-zoomg-contained]{position:absolute}',
    '[data-o-zoomg][data-o-zoomg-out]{pointer-events:none}',
    '[data-o-zoomg-plate]{',
    'position:absolute;inset:0;background:var(--o-zoomg-bg);',
    'transform:translateZ(0);',
    'transition:transform var(--o-zoomg-exit) cubic-bezier(0.5,0,0.2,1),',
    // Le fondu part a la moitie de la course, et ne dure que la moitie.
    // Voir l'en-tete.
    'opacity calc(var(--o-zoomg-exit) / 2) linear calc(var(--o-zoomg-exit) / 2);',
    '}',
    '[data-o-zoomg-out] [data-o-zoomg-plate]{',
    'transform:translateZ(calc(-1 * var(--o-zoomg-depth)));opacity:0;',
    '}',
    '[data-o-zoomg-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transform:scale(1);',
    'transition:transform var(--o-zoomg-exit) cubic-bezier(0.5,0,0.75,0),',
    'opacity calc(var(--o-zoomg-exit) * 0.7) ease-in calc(var(--o-zoomg-exit) * 0.3);',
    '}',
    '[data-o-zoomg-out] [data-o-zoomg-status]{transform:scale(var(--o-zoomg-punch));opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'une plaque, puis l'eloigne pendant que la marque avance.
 *
 * @example
 * <ZoomGate label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Un depart plus violent, et une plaque qui part tres loin.
 * <ZoomGate punch={5} depth={1400} exitMs={1100} onDone={ouvrir} />
 */
export function ZoomGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  punch = 3.2,
  depth = 900,
  holdMs = 1200,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: ZoomGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureZoomGateRule()

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Un zoom est exactement le
    // genre de mouvement que la preference vise, et le retirer ne coute rien
    // ici puisque le rideau n'apportait que lui.
    if (reduced) {
      annoncer()
      setParti(true)
      return
    }

    if (open !== undefined) {
      if (!open) {
        setSortant(true)
        annoncer()
      }
      return
    }

    const minuteur = window.setTimeout(() => {
      setSortant(true)
      annoncer()
    }, holdMs)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [reduced, open, holdMs])

  // Un minuteur plutot que `transitionend` : quatre transitions partent
  // ensemble, sur deux elements, et la plus courte remonterait ici la premiere.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(() => {
      setParti(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs])

  // Le verrou de defilement, seulement quand la plaque couvre la fenetre.
  useEffect(() => {
    if (contained || parti || reduced) return

    // Un verrou COMPTE, et non memorise. Deux rideaux peuvent se chevaucher
    // — rechargement a chaud, navigation, rendu concurrent — et le second
    // memoriserait alors la valeur posee par le premier, « hidden », pour la
    // restaurer en sortant : la page resterait bloquee sans erreur ni trace.
    const racine = document.documentElement
    const verrous = Number(racine.dataset['oPorteVerrous'] ?? '0')
    if (verrous === 0) racine.dataset['oPorteAvant'] = racine.style.overflow
    racine.dataset['oPorteVerrous'] = String(verrous + 1)
    racine.style.overflow = 'hidden'

    let rendu = false
    const rendreLaMain = (): void => {
      if (rendu) return
      rendu = true
      const reste = Number(racine.dataset['oPorteVerrous'] ?? '1') - 1
      if (reste > 0) {
        racine.dataset['oPorteVerrous'] = String(reste)
        return
      }
      racine.style.overflow = racine.dataset['oPorteAvant'] ?? ''
      delete racine.dataset['oPorteVerrous']
      delete racine.dataset['oPorteAvant']
    }

    // Le garde-fou. Plus long que le plafond de n importe quel rideau, donc
    // invisible en marche normale : il n existe que pour qu un retard ne
    // puisse jamais laisser la page sans defilement.
    const secours = window.setTimeout(rendreLaMain, 8000)

    return () => {
      window.clearTimeout(secours)
      rendreLaMain()
    }
  }, [contained, parti, reduced])

  if (parti) return null

  const { className, style } = mergePresentation({}, rest)

  const styleScene = {
    ...style,
    '--o-zoomg-bg': background,
    '--o-zoomg-ink': ink,
    '--o-zoomg-exit': `${String(exitMs)}ms`,
    '--o-zoomg-depth': `${String(depth)}px`,
    '--o-zoomg-punch': String(punch),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleScene}
      data-o-zoomg=""
      {...(sortant ? { 'data-o-zoomg-out': '' } : {})}
      {...(contained ? { 'data-o-zoomg-contained': '' } : {})}
    >
      {/* La plaque est du decor : elle ne doit pas etre lue. */}
      <div data-o-zoomg-plate="" aria-hidden="true" />

      <div data-o-zoomg-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
