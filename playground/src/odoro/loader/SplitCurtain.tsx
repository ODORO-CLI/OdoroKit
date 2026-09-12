/**
 * Rideau en deux pans qui s'ecartent depuis la couture centrale.
 *
 * ## Deux pans, parce qu'un rideau se tire
 *
 * `curtain-wipe` perce sa plaque, `counter-gate` la souleve d'un bloc. Ici le
 * plan est coupe en deux des le depart, et la couture se voit : un filet d'un
 * pixel au milieu de l'ecran annonce ou l'ouverture va se produire. Le geste
 * est donc lisible **avant** de commencer, ce qui est exactement ce qu'un
 * rideau de theatre fait.
 *
 * Les deux pans sortent par des cotes opposes. Rien ne les traverse, rien ne
 * se fond : la page apparait dans l'ecart qui grandit entre eux.
 *
 * ## Un demi-pour-cent de recouvrement
 *
 * Chaque pan mesure `50.5 %`, pas `50 %`. Sur une largeur impaire, deux moities
 * arrondies laissent un lisere d'un pixel au milieu par lequel la page
 * transparait avant l'heure. Le recouvrement coute un demi-pour-cent de
 * translation supplementaire et supprime le defaut.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand les pans **commencent** a s'ecarter, jamais a leur
 * arrivee. Le contenu doit entrer a travers l'ouverture pendant qu'elle se
 * fait : attendre la fin donnerait deux gestes qui se suivent — un rideau qui
 * s'ecarte, un temps mort, puis une page qui s'anime — la ou l'on en voulait
 * un seul qui se deploie.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed` et couvre la fenetre ; il verrouille alors
 * le defilement du document, puisque rien de ce qui est dessous n'est
 * atteignable. Avec `contained`, il devient `absolute` et se resout contre le
 * premier ancetre positionne — une maquette, une carte — et ne touche plus au
 * defilement : ce serait verrouiller la page pour un cadre de trois cents
 * pixels.
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
export interface SplitCurtainOwnProps {
  /** Le fond des pans. @defaultValue le fond du theme */
  background?: string
  /** L'encre du rideau : couture et libelle. @defaultValue l'encre du theme */
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
  /** Sens de l'ecartement. @defaultValue 'horizontal' */
  axis?: 'horizontal' | 'vertical'
  /** Combien de temps le rideau reste ferme, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree de l'ecartement, en millisecondes. @defaultValue 900 */
  exitMs?: number
  /**
   * Etat controle : le rideau couvre tant que c'est `true`, et sort au premier
   * `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type SplitCurtainProps = Customisable<SplitCurtainOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-split-curtain'

/** Pose les regles des deux pans, une fois par document. */
function ensureSplitCurtainRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-splc]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-splc-ink);',
    '}',
    '[data-o-splc][data-o-splc-contained]{position:absolute}',
    // Pendant la sortie le rideau ne doit plus rien intercepter : la page est
    // deja la, et un clic dans l'ecart doit l'atteindre.
    '[data-o-splc][data-o-splc-out]{pointer-events:none}',
    '[data-o-splc-pan]{',
    'position:absolute;background:var(--o-splc-bg);',
    'transition:transform var(--o-splc-exit) cubic-bezier(0.76,0,0.24,1);',
    '}',
    '[data-o-splc-axis="h"] [data-o-splc-pan]{top:0;bottom:0;width:50.5%}',
    '[data-o-splc-axis="h"] [data-o-splc-pan="a"]{left:0}',
    '[data-o-splc-axis="h"] [data-o-splc-pan="b"]{right:0}',
    '[data-o-splc-axis="h"][data-o-splc-out] [data-o-splc-pan="a"]{transform:translateX(-101%)}',
    '[data-o-splc-axis="h"][data-o-splc-out] [data-o-splc-pan="b"]{transform:translateX(101%)}',
    '[data-o-splc-axis="v"] [data-o-splc-pan]{left:0;right:0;height:50.5%}',
    '[data-o-splc-axis="v"] [data-o-splc-pan="a"]{top:0}',
    '[data-o-splc-axis="v"] [data-o-splc-pan="b"]{bottom:0}',
    '[data-o-splc-axis="v"][data-o-splc-out] [data-o-splc-pan="a"]{transform:translateY(-101%)}',
    '[data-o-splc-axis="v"][data-o-splc-out] [data-o-splc-pan="b"]{transform:translateY(101%)}',
    '[data-o-splc-seam]{position:absolute;background:currentColor;opacity:0.18;transition:opacity 240ms ease}',
    '[data-o-splc-axis="h"] [data-o-splc-seam]{top:0;bottom:0;left:50%;width:1px}',
    '[data-o-splc-axis="v"] [data-o-splc-seam]{left:0;right:0;top:50%;height:1px}',
    '[data-o-splc-out] [data-o-splc-seam]{opacity:0}',
    '[data-o-splc-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 260ms ease;',
    '}',
    '[data-o-splc-out] [data-o-splc-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page de deux pans, puis les ecarte.
 *
 * @example
 * <SplitCurtain label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Controle par l'appelant : les pans partent quand la scene est dessinee.
 * <SplitCurtain open={!sceneDessinee} axis="vertical" onDone={ouvrir} />
 */
export function SplitCurtain({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  axis = 'horizontal',
  holdMs = 1200,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: SplitCurtainProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureSplitCurtainRule()

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Ce que le rideau apportait
    // etait le geste ; ce qu'il couterait ici serait une attente sans
    // contrepartie.
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

  // Le retrait du DOM, une fois le geste fini. Un minuteur plutot que
  // `transitionend` : l'evenement remonte depuis n'importe quel enfant, et
  // celui du libelle — plus court que la translation — arriverait le premier.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(() => {
      setParti(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs])

  // Le verrou de defilement, seulement quand le rideau couvre la fenetre. Dans
  // un cadre, il n'y a rien a verrouiller : la page autour reste utilisable.
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

  const styleRideau = {
    ...style,
    '--o-splc-bg': background,
    '--o-splc-ink': ink,
    '--o-splc-exit': `${String(exitMs)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleRideau}
      data-o-splc=""
      data-o-splc-axis={axis === 'vertical' ? 'v' : 'h'}
      {...(sortant ? { 'data-o-splc-out': '' } : {})}
      {...(contained ? { 'data-o-splc-contained': '' } : {})}
    >
      {/* Le decor n'est pas du contenu : il ne doit pas etre lu. */}
      <div aria-hidden="true">
        <div data-o-splc-pan="a" />
        <div data-o-splc-pan="b" />
        <div data-o-splc-seam="" />
      </div>

      <div data-o-splc-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
