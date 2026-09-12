/**
 * Rideau en stores horizontaux qui basculent sur leur axe.
 *
 * ## Basculer, pas glisser
 *
 * Tous les autres rideaux du registre translatent, percent ou effacent. Celui-ci
 * **pivote** : chaque lame tourne d'un quart de tour autour de son axe median,
 * et disparait en se mettant de chant. C'est le seul geste du lot qui donne une
 * epaisseur a la plaque — on comprend que le rideau etait un objet, pas une
 * couche de couleur.
 *
 * La rotation vit dans une perspective posee sur le conteneur, pas sur chaque
 * lame : une perspective par lame donnerait a chacune son propre point de fuite,
 * et les lames du haut ne s'inclineraient pas dans le meme sens que celles du
 * bas. Un seul point de fuite, donc, et un store qui a l'air d'un store.
 *
 * ## Le decalage fait la lecture
 *
 * Les lames ne partent pas ensemble. Un decalage constant, de haut en bas,
 * transforme dix rotations simultanees — illisibles — en une vague qui descend.
 * C'est ce decalage qui coute : la sortie dure `exitMs` **plus** le decalage
 * total, et le composant en tient compte pour se retirer du DOM.
 *
 * ## Un pixel de recouvrement
 *
 * Chaque lame mesure un pixel de plus que sa part exacte. Sur une hauteur qui
 * ne se divise pas en un compte entier de pixels, des raies de fond
 * apparaitraient entre les lames avant meme le debut du geste.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand la premiere lame **commence** a basculer. Le contenu
 * entre entre les lames pendant qu'elles s'ouvrent ; attendre la fin donnerait
 * un store, un temps mort, puis une page.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, il devient `absolute`, se resout
 * contre le premier ancetre positionne et laisse le defilement tranquille.
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
export interface BlindsOwnProps {
  /** Le fond des lames. @defaultValue le fond du theme */
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
  /** Nombre de lames. @defaultValue 10 */
  slats?: number
  /** Decalage entre deux lames, en millisecondes. @defaultValue 55 */
  stagger?: number
  /** Combien de temps le store reste ferme, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree de la bascule d'une lame, en millisecondes. @defaultValue 700 */
  exitMs?: number
  /**
   * Etat controle : le store couvre tant que c'est `true`, et s'ouvre au
   * premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type BlindsProps = Customisable<BlindsOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-blinds'

/** Pose les regles du store, une fois par document. */
function ensureBlindsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-blind]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-blind-ink);',
    '}',
    '[data-o-blind][data-o-blind-contained]{position:absolute}',
    '[data-o-blind][data-o-blind-out]{pointer-events:none}',
    // Une seule perspective, sur le rack : un point de fuite commun a toutes
    // les lames. Voir l'en-tete.
    '[data-o-blind-rack]{position:absolute;inset:0;perspective:1400px}',
    '[data-o-blind-slat]{',
    'position:absolute;left:0;right:0;',
    'top:calc(var(--o-blind-i) * 100% / var(--o-blind-n));',
    'height:calc(100% / var(--o-blind-n) + 1px);',
    'background:var(--o-blind-bg);',
    'transform-origin:50% 50%;transform:rotateX(0deg);',
    'transition:transform var(--o-blind-exit) cubic-bezier(0.65,0,0.35,1) var(--o-blind-d),',
    // De chant, une lame ne fait pourtant pas zero pixel de haut : l'arrondi
    // du rendu lui laisse une raie. Elle s'efface donc sur le dernier tiers de
    // sa rotation, quand elle n'est deja plus qu'un trait.
    'opacity calc(var(--o-blind-exit) * 0.3) linear',
    'calc(var(--o-blind-d) + var(--o-blind-exit) * 0.7);',
    '}',
    '[data-o-blind-out] [data-o-blind-slat]{transform:rotateX(-90deg);opacity:0}',
    '[data-o-blind-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-blind-out] [data-o-blind-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'un store, puis en fait basculer les lames.
 *
 * @example
 * <Blinds label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Beaucoup de lames fines, une vague rapide.
 * <Blinds slats={18} stagger={30} exitMs={520} onDone={ouvrir} />
 */
export function Blinds({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  slats = 10,
  stagger = 55,
  holdMs = 1200,
  exitMs = 700,
  open,
  contained = false,
  onDone,
  ...rest
}: BlindsProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureBlindsRule()

  const nombre = Math.max(2, Math.round(slats))

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Le store n'apportait qu'un
    // geste, et le geste est ce qu'on nous demande d'omettre.
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

  // Le retrait du DOM. Un minuteur, et non `transitionend` : dix lames decalees
  // emettent dix evenements, et le premier arrive quand neuf lames couvrent
  // encore l'ecran.
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

  // Le verrou de defilement, seulement quand le store couvre la fenetre.
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

  const styleStore = {
    ...style,
    '--o-blind-bg': background,
    '--o-blind-ink': ink,
    '--o-blind-exit': `${String(exitMs)}ms`,
    '--o-blind-n': String(nombre),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleStore}
      data-o-blind=""
      {...(sortant ? { 'data-o-blind-out': '' } : {})}
      {...(contained ? { 'data-o-blind-contained': '' } : {})}
    >
      {/* Les lames sont du decor : elles ne doivent pas etre lues. */}
      <div data-o-blind-rack="" aria-hidden="true">
        {Array.from({ length: nombre }, (_, index) => (
          <div
            key={index}
            data-o-blind-slat=""
            style={
              {
                '--o-blind-i': String(index),
                '--o-blind-d': `${String(index * stagger)}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-blind-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
