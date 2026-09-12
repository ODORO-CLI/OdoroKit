/**
 * Rideau en lamelles verticales qui partent alternativement en haut et en bas.
 *
 * ## L'alternance est tout le sujet
 *
 * Des lamelles qui montent toutes ensemble donnent un rideau qui se leve —
 * `counter-gate` le fait deja, en un seul bloc et pour moins cher. Ce qui
 * justifie de decouper la plaque, c'est que les lamelles partent en **sens
 * contraire** : une sur deux vers le haut, l'autre vers le bas. La page
 * apparait alors par un peigne qui s'ecarte, et non par une frontiere qui
 * remonte.
 *
 * C'est aussi ce qui rend le geste lisible sur un cadre large : deux
 * directions opposees se voient meme quand chaque lamelle est etroite, la ou
 * une translation commune se lit comme un simple fondu vers le haut.
 *
 * ## Un decalage court, depuis le bord
 *
 * Les lamelles ne partent pas ensemble. Le decalage est volontairement plus
 * court que celui des stores : ici il n'y a pas de vague a raconter, seulement
 * a eviter que douze lamelles se mettent en mouvement dans la meme image, ce
 * qui se lit comme un unique bloc mal decoupe.
 *
 * ## Un pixel de recouvrement
 *
 * Chaque lamelle mesure un pixel de plus que sa part exacte. Sur une largeur
 * qui ne se divise pas en un compte entier de pixels, des raies de fond
 * apparaitraient entre elles avant meme le debut du geste.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand la premiere lamelle **commence** a partir. Le
 * contenu entre par le peigne pendant qu'il s'ouvre ; attendre la fin donnerait
 * deux gestes qui se suivent la ou l'on en voulait un seul.
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
export interface ShutterOwnProps {
  /** Le fond des lamelles. @defaultValue le fond du theme */
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
  /** Nombre de lamelles. @defaultValue 12 */
  blades?: number
  /** Decalage entre deux lamelles, en millisecondes. @defaultValue 32 */
  stagger?: number
  /** Combien de temps l'obturateur reste ferme, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree du depart d'une lamelle, en millisecondes. @defaultValue 750 */
  exitMs?: number
  /**
   * Etat controle : l'obturateur couvre tant que c'est `true`, et s'ouvre au
   * premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type ShutterProps = Customisable<ShutterOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shutter'

/** Pose les regles de l'obturateur, une fois par document. */
function ensureShutterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shut]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-shut-ink);',
    '}',
    '[data-o-shut][data-o-shut-contained]{position:absolute}',
    '[data-o-shut][data-o-shut-out]{pointer-events:none}',
    '[data-o-shut-blade]{',
    'position:absolute;top:0;bottom:0;',
    'left:calc(var(--o-shut-i) * 100% / var(--o-shut-n));',
    'width:calc(100% / var(--o-shut-n) + 1px);',
    'background:var(--o-shut-bg);',
    'transition:transform var(--o-shut-exit) cubic-bezier(0.76,0,0.24,1) var(--o-shut-d);',
    '}',
    // Le sens est porte par un attribut plutot que par une variable : deux
    // regles fixes valent mieux qu'un calcul de signe dans chaque transformee.
    '[data-o-shut-out] [data-o-shut-blade="up"]{transform:translateY(-101%)}',
    '[data-o-shut-out] [data-o-shut-blade="down"]{transform:translateY(101%)}',
    '[data-o-shut-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 200ms ease;',
    '}',
    '[data-o-shut-out] [data-o-shut-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'un obturateur, puis en ecarte les lamelles.
 *
 * @example
 * <Shutter label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Peu de lamelles, larges, et un depart presque simultane.
 * <Shutter blades={6} stagger={12} onDone={ouvrir} />
 */
export function Shutter({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  blades = 12,
  stagger = 32,
  holdMs = 1200,
  exitMs = 750,
  open,
  contained = false,
  onDone,
  ...rest
}: ShutterProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureShutterRule()

  const nombre = Math.max(2, Math.round(blades))

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate.
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

  // Un minuteur, et non `transitionend` : douze lamelles decalees emettent
  // douze evenements, et le premier arrive quand onze couvrent encore l'ecran.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(
      () => {
        setParti(true)
      },
      exitMs + (nombre - 1) * stagger + 40,
    )

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs, nombre, stagger])

  // Le verrou de defilement, seulement quand l'obturateur couvre la fenetre.
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

  const styleObturateur = {
    ...style,
    '--o-shut-bg': background,
    '--o-shut-ink': ink,
    '--o-shut-exit': `${String(exitMs)}ms`,
    '--o-shut-n': String(nombre),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleObturateur}
      data-o-shut=""
      {...(sortant ? { 'data-o-shut-out': '' } : {})}
      {...(contained ? { 'data-o-shut-contained': '' } : {})}
    >
      {/* Les lamelles sont du decor : elles ne doivent pas etre lues. */}
      <div aria-hidden="true">
        {Array.from({ length: nombre }, (_, index) => (
          <div
            key={index}
            data-o-shut-blade={index % 2 === 0 ? 'up' : 'down'}
            style={
              {
                '--o-shut-i': String(index),
                '--o-shut-d': `${String(index * stagger)}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-shut-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
