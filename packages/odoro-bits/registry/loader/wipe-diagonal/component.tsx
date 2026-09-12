/**
 * Rideau balaye par une arete oblique.
 *
 * ## Une arete, pas une forme
 *
 * `curtain-wipe` perce sa plaque, `counter-gate` la souleve d'un bloc. Ici il
 * n'y a qu'une **ligne** : la plaque quitte l'ecran d'un seul mouvement, et ce
 * qu'on lit est son bord de fuite, incline. C'est le geste le plus court a
 * comprendre du lot, et celui qui donne une direction a la page qui arrive —
 * le regard suit l'arete et se pose la ou elle finit.
 *
 * L'inclinaison vient d'un `skewX`, pas d'une rotation : une rotation
 * inclinerait aussi les bords haut et bas, qu'il faudrait alors surdimensionner
 * dans les deux sens. Un cisaillement ne penche que la verticale, ce qui est
 * exactement l'arete qu'on veut incliner.
 *
 * ## La course est mesuree, pas devinee
 *
 * Une arete inclinee deborde lateralement de `tan(angle) x hauteur / 2`. Cette
 * quantite depend du **format** du cadre : sur une banniere large elle est
 * negligeable, sur un telephone elle vaut le quart de la largeur. Un
 * surdimensionnement fixe en pourcentage doit donc etre calcule pour le pire
 * cas — et alors, sur tous les autres formats, la plaque passe le premier tiers
 * de sa duree hors de l'ecran : le balayage semble commencer en retard.
 *
 * On mesure donc le cadre une fois, au montage, et on ecrit le debord et la
 * course en pixels. Un `ResizeObserver` refait le calcul si le cadre change de
 * taille. C'est une lecture de mise en page par redimensionnement, jamais par
 * image — et elle achete un balayage qui occupe exactement la duree annoncee.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand la plaque **commence** a partir, jamais a son
 * arrivee. La page entre derriere l'arete pendant qu'elle balaye ; attendre la
 * fin ferait deux gestes successifs la ou l'on en voulait un seul.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut la plaque est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, elle devient `absolute`, se resout
 * contre le premier ancetre positionne et ne touche plus au defilement : un
 * cadre de maquette n'a aucune raison de figer la page qui l'entoure.
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
export interface WipeDiagonalOwnProps {
  /** Le fond de la plaque. @defaultValue le fond du theme */
  background?: string
  /** L'encre : le filet de l'arete et le libelle. @defaultValue l'encre du theme */
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
  /** Cote par lequel la plaque s'en va. @defaultValue 'left' */
  direction?: 'left' | 'right'
  /** Inclinaison de l'arete, en degres. @defaultValue 14 */
  slant?: number
  /** Combien de temps la plaque reste en place, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree du balayage, en millisecondes. @defaultValue 800 */
  exitMs?: number
  /**
   * Etat controle : la plaque couvre tant que c'est `true`, et part au premier
   * `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type WipeDiagonalProps = Customisable<WipeDiagonalOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-wipe-diagonal'

/** Marge de securite ajoutee au debord mesure, en pixels. */
const SAFETY = 4

/** Pose les regles de la plaque, une fois par document. */
function ensureWipeDiagonalRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wipd]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-wipd-ink);',
    '}',
    '[data-o-wipd][data-o-wipd-contained]{position:absolute}',
    // Pendant le balayage le rideau ne doit plus rien intercepter : la page
    // est deja la derriere l'arete.
    '[data-o-wipd][data-o-wipd-out]{pointer-events:none}',
    '[data-o-wipd-plate]{',
    'position:absolute;top:0;bottom:0;',
    'background:var(--o-wipd-bg);',
    'transform:skewX(var(--o-wipd-slant)) translateX(0);',
    'transition:transform var(--o-wipd-exit) cubic-bezier(0.72,0,0.28,1);',
    '}',
    // Le debord du cote de la sortie est large — la plaque doit y disparaitre
    // entierement ; celui du cote de l'arete vaut exactement ce que le
    // cisaillement a mesure.
    '[data-o-wipd-dir="l"] [data-o-wipd-plate]{',
    'left:calc(-200% - 4 * var(--o-wipd-lead));right:calc(-1 * var(--o-wipd-lead));',
    '}',
    '[data-o-wipd-dir="r"] [data-o-wipd-plate]{',
    'right:calc(-200% - 4 * var(--o-wipd-lead));left:calc(-1 * var(--o-wipd-lead));',
    '}',
    '[data-o-wipd-dir="l"][data-o-wipd-out] [data-o-wipd-plate]{',
    'transform:skewX(var(--o-wipd-slant)) translateX(calc(-1 * var(--o-wipd-travel)));',
    '}',
    '[data-o-wipd-dir="r"][data-o-wipd-out] [data-o-wipd-plate]{',
    'transform:skewX(var(--o-wipd-slant)) translateX(var(--o-wipd-travel));',
    '}',
    // Le filet de l'arete : c'est lui qui rend la direction lisible, plus
    // encore que la plaque elle-meme.
    '[data-o-wipd-plate]::after{',
    'content:"";position:absolute;top:0;bottom:0;width:2px;background:currentColor;opacity:0.45;',
    '}',
    '[data-o-wipd-dir="l"] [data-o-wipd-plate]::after{right:0}',
    '[data-o-wipd-dir="r"] [data-o-wipd-plate]::after{left:0}',
    '[data-o-wipd-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-wipd-out] [data-o-wipd-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'une plaque, puis la balaye de biais.
 *
 * @example
 * <WipeDiagonal label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Vers la droite, franchement inclinee.
 * <WipeDiagonal direction="right" slant={22} exitMs={700} onDone={ouvrir} />
 */
export function WipeDiagonal({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  direction = 'left',
  slant = 14,
  holdMs = 1200,
  exitMs = 800,
  open,
  contained = false,
  onDone,
  ...rest
}: WipeDiagonalProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)
  const hote = useRef<HTMLDivElement>(null)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureWipeDiagonalRule()

  // La mesure. Elle est ecrite dans les variables du noeud plutot que dans
  // l'etat : rien a l'ecran ne depend de sa valeur du cote de React, et un
  // rendu par redimensionnement serait du travail pour rien.
  useEffect(() => {
    const noeud = hote.current
    if (noeud === null) return

    const mesurer = (): void => {
      const debord = Math.abs(Math.tan((slant * Math.PI) / 180)) * (noeud.clientHeight / 2)
      noeud.style.setProperty('--o-wipd-lead', `${String(debord + SAFETY)}px`)
      noeud.style.setProperty(
        '--o-wipd-travel',
        `${String(noeud.clientWidth + 2 * (debord + SAFETY))}px`,
      )
    }

    mesurer()

    const observateur = new ResizeObserver(mesurer)
    observateur.observe(noeud)

    return () => {
      observateur.disconnect()
    }
  }, [slant])

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Ce que la plaque apportait
    // etait le geste, et le geste est ce qu'on nous demande d'omettre.
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

  // Un minuteur plutot que `transitionend` : l'evenement remonte depuis
  // n'importe quel enfant, et celui du libelle — bien plus court que le
  // balayage — retirerait la plaque en pleine course.
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

  // Le cisaillement penche du cote ou la plaque s'en va : l'arete precede le
  // mouvement au lieu de le suivre.
  const penche = direction === 'right' ? slant : -slant

  const stylePlaque = {
    ...style,
    '--o-wipd-bg': background,
    '--o-wipd-ink': ink,
    '--o-wipd-exit': `${String(exitMs)}ms`,
    '--o-wipd-slant': `${String(penche)}deg`,
    '--o-wipd-lead': '0px',
    '--o-wipd-travel': '200%',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={hote}
      className={className}
      style={stylePlaque}
      data-o-wipd=""
      data-o-wipd-dir={direction === 'right' ? 'r' : 'l'}
      {...(sortant ? { 'data-o-wipd-out': '' } : {})}
      {...(contained ? { 'data-o-wipd-contained': '' } : {})}
    >
      {/* La plaque est du decor : elle ne doit pas etre lue. */}
      <div data-o-wipd-plate="" aria-hidden="true" />

      <div data-o-wipd-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
