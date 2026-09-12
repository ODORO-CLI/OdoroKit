/**
 * Voile qui se dissipe apres un delai.
 *
 * ## Le seul rideau du lot qui a le droit d'etre un voile
 *
 * Les autres rideaux du registre refusent l'opacite, et pour une bonne raison :
 * une plaque qui se fond laisse voir la page a travers elle, ce qui trahit
 * qu'il n'y avait jamais eu de plaque. Ils prennent donc des formes — un trou,
 * deux pans, des lames — pour rester des objets jusqu'au bout.
 *
 * Celui-ci assume l'inverse. Il ne pretend pas etre un objet : c'est un voile,
 * il se comporte comme un voile, et c'est exactement ce qu'on veut quand
 * l'entree ne doit rien raconter — un tableau de bord, un outil, une page ou le
 * rideau est une politesse et non une mise en scene. La franchise vaut ici
 * mieux que la forme.
 *
 * C'est aussi le moins cher du lot : un element, une propriete animee, celle
 * que le compositeur traite le mieux.
 *
 * ## Le flou est facultatif, et il se paye
 *
 * Avec `blurPx`, le voile devient depoli : le fond est rendu partiellement
 * transparent et le filtre d'arriere-plan floute la page en dessous, puis se
 * detend jusqu'a zero. La mise au point qui se fait est un beau geste, et il
 * coute : `backdrop-filter` fait recomposer la couche a chaque image, ce que
 * l'opacite seule ne fait pas. Il reste donc a zero par defaut, et le filtre
 * n'est meme pas declare tant qu'on ne le demande pas.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand le voile **commence** a se dissiper. Le contenu
 * entre pendant qu'il s'eclaircit ; attendre la fin donnerait un voile, un
 * temps mort, puis une page qui s'anime.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le voile est `fixed`, couvre la fenetre et verrouille le
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
export interface FadeGateOwnProps {
  /** Le fond du voile. @defaultValue le fond du theme */
  background?: string
  /** L'encre du libelle. @defaultValue l'encre du theme */
  ink?: string
  /** Ce qui s'affiche au centre pendant l'attente : un nom, une marque. */
  label?: ReactNode
  /**
   * Ce que les lecteurs d'ecran annoncent. Chaine vide pour n'annoncer que le
   * libelle.
   *
   * @defaultValue 'Chargement'
   */
  status?: string
  /**
   * Flou d'arriere-plan, en pixels. Zero laisse un voile opaque et gratuit ;
   * au-dela, le voile devient depoli et se paye. Voir l'en-tete.
   *
   * @defaultValue 0
   */
  blurPx?: number
  /** Combien de temps le voile reste plein, en millisecondes. @defaultValue 1000 */
  holdMs?: number
  /** Duree de la dissipation, en millisecondes. @defaultValue 700 */
  exitMs?: number
  /**
   * Etat controle : le voile couvre tant que c'est `true`, et se dissipe au
   * premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type FadeGateProps = Customisable<FadeGateOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-fade-gate'

/** Pose les regles du voile, une fois par document. */
function ensureFadeGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fadeg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-fadeg-ink);',
    'opacity:1;transition:opacity var(--o-fadeg-exit) ease;',
    '}',
    '[data-o-fadeg][data-o-fadeg-contained]{position:absolute}',
    '[data-o-fadeg][data-o-fadeg-out]{opacity:0;pointer-events:none}',
    '[data-o-fadeg-veil]{position:absolute;inset:0;background:var(--o-fadeg-bg)}',
    // Le depoli n'existe que si on l'a demande : sans l'attribut, aucune
    // couche de filtre n'est creee.
    '[data-o-fadeg-frost] [data-o-fadeg-veil]{',
    'background:color-mix(in oklab,var(--o-fadeg-bg) 76%,transparent);',
    'backdrop-filter:blur(var(--o-fadeg-blur));',
    'transition:backdrop-filter var(--o-fadeg-exit) ease;',
    '}',
    '[data-o-fadeg-frost][data-o-fadeg-out] [data-o-fadeg-veil]{backdrop-filter:blur(0px)}',
    '[data-o-fadeg-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'un voile, puis le dissipe.
 *
 * @example
 * <FadeGate label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Depoli : la page se met au point derriere le voile.
 * <FadeGate blurPx={14} exitMs={900} onDone={ouvrir} />
 */
export function FadeGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  blurPx = 0,
  holdMs = 1000,
  exitMs = 700,
  open,
  contained = false,
  onDone,
  ...rest
}: FadeGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureFadeGateRule()

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Un voile de courtoisie sans
    // le geste n'est plus qu'une attente.
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

  // Un minuteur plutot que `transitionend` : le voile depoli anime deux
  // proprietes, et le meme code doit valoir dans les deux cas.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(() => {
      setParti(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs])

  // Le verrou de defilement, seulement quand le voile couvre la fenetre.
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
  const depoli = blurPx > 0

  const styleVoile = {
    ...style,
    '--o-fadeg-bg': background,
    '--o-fadeg-ink': ink,
    '--o-fadeg-exit': `${String(exitMs)}ms`,
    '--o-fadeg-blur': `${String(blurPx)}px`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleVoile}
      data-o-fadeg=""
      {...(sortant ? { 'data-o-fadeg-out': '' } : {})}
      {...(contained ? { 'data-o-fadeg-contained': '' } : {})}
      {...(depoli ? { 'data-o-fadeg-frost': '' } : {})}
    >
      {/* Le voile est du decor : il ne doit pas etre lu. */}
      <div data-o-fadeg-veil="" aria-hidden="true" />

      <div data-o-fadeg-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
