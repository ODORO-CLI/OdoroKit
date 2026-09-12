/**
 * Rideau a lames pivotantes, comme le diaphragme d'un objectif.
 *
 * ## Pourquoi des lames, alors qu'un `clip-path` suffirait
 *
 * `curtain-wipe` ouvre un disque parfait avec une seule forme animee. C'est le
 * choix economique, et c'est le bon quand on veut un trou. Ce n'est pas le bon
 * quand on veut un **mecanisme** : un vrai diaphragme n'a pas d'ouverture
 * ronde, il a un polygone a n cotes, et ce polygone tourne en s'ouvrant parce
 * que chaque lame pivote autour de son axe.
 *
 * On garde donc les lames. Chacune est une plaque ancree par son coin au
 * centre et tournee de sa part du tour ; leur recouvrement ferme l'ecran.
 * A la sortie, elles glissent vers l'exterieur pendant que l'ensemble tourne :
 * l'ouverture est un polygone qui grandit **en tournant**. Aucun `clip-path`
 * n'aurait donne cela sans recalculer ses sommets a chaque image.
 *
 * ## La lame est carree, et sa taille est mesuree
 *
 * Une lame dimensionnee en pourcentages du cadre n'est carree que sur un cadre
 * carre. Ailleurs, sa course en `translate` — elle aussi en pourcentages —
 * avance beaucoup dans un sens et peu dans l'autre : sur une banniere large,
 * l'ouverture est finie au tiers de la duree dans une direction et pas
 * commencee dans l'autre.
 *
 * On mesure donc le cadre une fois, au montage, et on en tire un rayon : la
 * lame est un carre de trois rayons de cote, sa course vaut un rayon sur chaque
 * axe local. La geometrie devient exacte quel que soit le format, et
 * l'ouverture occupe toute la duree annoncee. Un `ResizeObserver` refait le
 * calcul si le cadre change de taille — une lecture de mise en page par
 * redimensionnement, jamais par image.
 *
 * ## Quatre lames au minimum
 *
 * Une plaque ancree par son coin couvre un quart de tour. En dessous de quatre
 * lames, leur somme ne ferme plus le cercle et des coins de page apparaissent
 * avant l'ouverture. La borne n'est donc pas une preference : c'est la
 * condition pour que le rideau couvre.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele au moment ou les lames **commencent** a s'ecarter. Le
 * contenu entre par l'ouverture pendant qu'elle grandit ; attendre la fin
 * donnerait un diaphragme, un temps mort, puis une page — trois temps la ou
 * l'on en voulait un.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, il devient `absolute`, se resout
 * contre le premier ancetre positionne et laisse le defilement tranquille :
 * un cadre de maquette n'a aucune raison de figer la page qui l'entoure.
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
export interface IrisOpenOwnProps {
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
  /** Nombre de lames. Quatre au minimum, voir l'en-tete. @defaultValue 6 */
  blades?: number
  /** Rotation de l'ensemble pendant l'ouverture, en degres. @defaultValue 26 */
  turn?: number
  /** Combien de temps le diaphragme reste ferme, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree de l'ouverture, en millisecondes. @defaultValue 1000 */
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
export type IrisOpenProps = Customisable<IrisOpenOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-iris-open'

/** En dessous, les lames ne ferment plus le cercle. Voir l'en-tete. */
const MIN_BLADES = 4

/** Pose les regles du diaphragme, une fois par document. */
function ensureIrisOpenRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-iris]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-iris-ink);',
    '}',
    '[data-o-iris][data-o-iris-contained]{position:absolute}',
    '[data-o-iris][data-o-iris-out]{pointer-events:none}',
    // Le moyeu porte la rotation d'ensemble ; les lames portent leur propre
    // glissement. Separer les deux evite de recomposer une matrice par lame a
    // chaque image.
    '[data-o-iris-hub]{',
    'position:absolute;inset:0;',
    'transition:transform var(--o-iris-exit) cubic-bezier(0.65,0,0.35,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-hub]{transform:rotate(var(--o-iris-turn))}',
    // La lame est ancree par son coin au centre exact : c'est ce qui lui fait
    // couvrir un quart de tour, et ce qui rend la borne de quatre necessaire.
    '[data-o-iris-blade]{',
    'position:absolute;left:50%;top:50%;',
    'width:var(--o-iris-size);height:var(--o-iris-size);',
    'background:var(--o-iris-bg);transform-origin:0 0;',
    'transform:rotate(var(--o-iris-a)) translate(0,0);',
    'transition:transform var(--o-iris-exit) cubic-bezier(0.65,0,0.35,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-blade]{',
    'transform:rotate(var(--o-iris-a)) translate(var(--o-iris-travel),var(--o-iris-travel));',
    '}',
    '[data-o-iris-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 240ms ease,transform 480ms cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-iris-out] [data-o-iris-status]{opacity:0;transform:scale(1.06)}',
  ].join('')
  document.head.append(style)
}

/**
 * Ferme la page derriere un diaphragme, puis l'ouvre en tournant.
 *
 * @example
 * <IrisOpen label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Huit lames et une rotation franche : le mecanisme se voit davantage.
 * <IrisOpen blades={8} turn={45} exitMs={1200} onDone={ouvrir} />
 */
export function IrisOpen({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  blades = 6,
  turn = 26,
  holdMs = 1200,
  exitMs = 1000,
  open,
  contained = false,
  onDone,
  ...rest
}: IrisOpenProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)
  const hote = useRef<HTMLDivElement>(null)

  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureIrisOpenRule()

  // La mesure. Elle est ecrite dans les variables du noeud plutot que dans
  // l'etat : rien du cote de React ne depend de sa valeur, et un rendu par
  // redimensionnement serait du travail pour rien.
  useEffect(() => {
    const noeud = hote.current
    if (noeud === null) return

    const mesurer = (): void => {
      const rayon = Math.hypot(noeud.clientWidth, noeud.clientHeight) / 2
      noeud.style.setProperty('--o-iris-size', `${String(rayon * 3)}px`)
      noeud.style.setProperty('--o-iris-travel', `${String(rayon)}px`)
    }

    mesurer()

    const observateur = new ResizeObserver(mesurer)
    observateur.observe(noeud)

    return () => {
      observateur.disconnect()
    }
  }, [])

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Le diaphragme n'apportait
    // qu'un geste, et le geste est ce qu'on nous demande d'omettre.
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
  // n'importe laquelle des lames, et celui du libelle arriverait avant elles.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(() => {
      setParti(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs])

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
  const nombre = Math.max(MIN_BLADES, Math.round(blades))
  const pas = 360 / nombre

  const styleRideau = {
    ...style,
    '--o-iris-bg': background,
    '--o-iris-ink': ink,
    '--o-iris-exit': `${String(exitMs)}ms`,
    '--o-iris-turn': `${String(turn)}deg`,
    // Le repli d'avant la mesure : assez grand pour couvrir n'importe quel
    // cadre a l'image ou le rideau apparait, avant que l'effet ne mesure.
    '--o-iris-size': '200vmax',
    '--o-iris-travel': '100vmax',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={hote}
      className={className}
      style={styleRideau}
      data-o-iris=""
      {...(sortant ? { 'data-o-iris-out': '' } : {})}
      {...(contained ? { 'data-o-iris-contained': '' } : {})}
    >
      {/* Les lames sont du decor : elles ne doivent pas etre lues. */}
      <div data-o-iris-hub="" aria-hidden="true">
        {Array.from({ length: nombre }, (_, index) => (
          <div
            key={index}
            data-o-iris-blade=""
            style={{ '--o-iris-a': `${String(index * pas)}deg` } as CSSProperties}
          />
        ))}
      </div>

      <div data-o-iris-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
