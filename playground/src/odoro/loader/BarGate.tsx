/**
 * Rideau a barre segmentee, qui se resorbe dans la ligne qui l'a mesure.
 *
 * ## Une barre qui mesure le temps, et le dit
 *
 * `counter-gate` affiche un pourcentage, et prend donc sur lui de ne jamais
 * mentir : son compteur suit une disponibilite reelle. Cette barre-ci ne
 * pretend rien de tel — elle n'affiche **aucun chiffre**, et c'est delibere :
 * ce qu'elle remplit est une duree, pas un chargement.
 *
 * La distinction n'est pas cosmetique. Un pourcentage est une affirmation
 * verifiable ; une barre sans chiffre est un signe de patience. Retirer les
 * chiffres est la facon honnete d'avoir une barre quand on n'a rien a mesurer,
 * et c'est le cas de la plupart des rideaux d'entree.
 *
 * Les segments disent la meme chose : une barre continue se lit comme une
 * mesure fine, une barre en vingt cases se lit comme un decompte. Le dernier
 * segment s'allume progressivement — l'opacite d'une case vaut sa part remplie
 * — ce qui evite le sursaut d'une case qui apparait d'un coup.
 *
 * ## L'horloge du moteur, pas un `setInterval`
 *
 * L'avancement vient de la boucle unique du moteur. Un intervalle bat contre la
 * cadence de l'ecran et produit une barre qui avance par a-coups ; et deux
 * boucles concurrentes dans une page rendent dans un ordre indetermine.
 *
 * La valeur est ecrite dans une variable CSS du noeud, pas dans l'etat React :
 * une barre a soixante images par seconde ferait soixante rendus par seconde
 * pour une valeur dont React n'a aucun besoin.
 *
 * ## Un plafond, quand l'appelant controle
 *
 * En mode controle, la barre se **gare** sous un plafond au lieu de le
 * franchir, et y reste tant que `open` est vrai. Une barre qui arriverait au
 * bout puis attendrait dirait que c'est fini alors que ca ne l'est pas. Une
 * fois liberee, elle finit sa course a la meme vitesse : la derniere fraction
 * prend le temps qu'elle aurait pris.
 *
 * ## La sortie : le rideau rentre dans sa propre ligne
 *
 * La plaque ne glisse pas et ne s'efface pas : elle **s'aplatit sur la barre**,
 * en s'ecrasant vers la ligne mediane. Le rideau disparait dans l'objet qui l'a
 * mesure ; la barre s'efface en dernier, une fois qu'il n'y a plus rien autour
 * d'elle.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele au moment ou la plaque **commence** a s'aplatir. Le
 * contenu entre pendant l'ecrasement ; attendre la fin donnerait deux gestes
 * qui se suivent la ou l'on en voulait un seul.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, il devient `absolute`, se resout
 * contre le premier ancetre positionne et ne touche plus au defilement.
 *
 * @module
 */

import {
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface BarGateOwnProps {
  /** Le fond de la plaque. @defaultValue le fond du theme */
  background?: string
  /** L'encre : la barre et le libelle. @defaultValue l'encre du theme */
  ink?: string
  /** Ce qui s'affiche au-dessus de la barre : un nom, une marque. */
  label?: ReactNode
  /**
   * Ce que les lecteurs d'ecran annoncent. Chaine vide pour n'annoncer que le
   * libelle.
   *
   * @defaultValue 'Chargement'
   */
  status?: string
  /** Nombre de segments de la barre. @defaultValue 20 */
  segments?: number
  /** Duree du remplissage, en millisecondes. @defaultValue 1600 */
  holdMs?: number
  /** Duree de l'ecrasement, en millisecondes. @defaultValue 850 */
  exitMs?: number
  /**
   * Ou la barre se gare en mode controle, en pourcentage. Sans effet quand
   * `open` n'est pas renseigne.
   *
   * @defaultValue 92
   */
  ceiling?: number
  /**
   * Etat controle : le rideau couvre tant que c'est `true`, et sort au premier
   * `false`. Renseigne, la barre se gare sous `ceiling` en attendant.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type BarGateProps = Customisable<BarGateOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bar-gate'

/** Pose les regles de la barre et de la plaque, une fois par document. */
function ensureBarGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-barg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-barg-ink);',
    '}',
    '[data-o-barg][data-o-barg-contained]{position:absolute}',
    '[data-o-barg][data-o-barg-out]{pointer-events:none}',
    // La plaque s'ecrase vers sa ligne mediane, la ou se trouve la barre.
    '[data-o-barg-plate]{',
    'position:absolute;inset:0;background:var(--o-barg-bg);',
    'transform-origin:50% 50%;transform:scaleY(1);',
    'transition:transform var(--o-barg-exit) cubic-bezier(0.7,0,0.3,1);',
    '}',
    '[data-o-barg-out] [data-o-barg-plate]{transform:scaleY(0)}',
    '[data-o-barg-bar]{',
    'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);',
    'display:flex;gap:2px;width:min(20rem,62%);',
    'transition:opacity calc(var(--o-barg-exit) * 0.45) ease calc(var(--o-barg-exit) * 0.55);',
    '}',
    '[data-o-barg-out] [data-o-barg-bar]{opacity:0}',
    // La part remplie d'un segment devient son opacite : la case en cours
    // s'allume au lieu d'apparaitre.
    '[data-o-barg-seg]{',
    'flex:1;height:3px;background:currentColor;',
    'opacity:clamp(0.12,calc(var(--o-barg-p) * var(--o-barg-n) - var(--o-barg-i)),1);',
    '}',
    // A la sortie, la barre est pleine par regle et non par variable : le
    // rendu de React qui accompagne le passage en sortie reecrit le style en
    // ligne du noeud, et remettrait la variable a sa valeur initiale.
    '[data-o-barg-out] [data-o-barg-seg]{opacity:1}',
    '[data-o-barg-mark]{',
    'position:absolute;left:0;right:0;bottom:calc(50% + 2.2rem);text-align:center;',
    'transition:opacity 220ms ease;',
    '}',
    '[data-o-barg-out] [data-o-barg-mark]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page, remplit une barre, puis s'ecrase dedans.
 *
 * @example
 * <BarGate label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Controle : la barre se gare a 92 % tant que la scene n'est pas dessinee.
 * <BarGate open={!sceneDessinee} segments={32} onDone={ouvrir} />
 */
export function BarGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  segments = 20,
  holdMs = 1600,
  exitMs = 850,
  ceiling = 92,
  open,
  contained = false,
  onDone,
  ...rest
}: BarGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)
  const hote = useRef<HTMLDivElement>(null)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  // `open` vit dans une ref parce que la boucle le lit a chaque image. Le
  // mettre en dependance de l'effet remonterait la barre a zero chaque fois
  // que l'appelant change d'avis.
  const ouvert = useRef(open)
  ouvert.current = open

  ensureBarGateRule()

  const cases = Math.max(4, Math.round(segments))

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Une barre qui se remplit est
    // precisement le mouvement que la preference demande d'omettre, et sans
    // elle le rideau n'a plus rien a dire.
    if (reduced) {
      annoncer()
      setParti(true)
      return
    }

    const noeud = hote.current
    let ecoule = 0

    const abonnement = clock.subscribe(
      ({ delta }) => {
        // Le plafond ne s'applique qu'en mode controle : sans `open`, la barre
        // mesure une duree et va jusqu'au bout.
        const libre = ouvert.current !== true
        const plafond = libre ? 1 : Math.min(0.99, ceiling / 100)

        // On borne l'ecoule, pas seulement la part affichee : sinon la barre
        // garee accumulerait du temps en silence et sauterait a cent des
        // qu'on la libere.
        ecoule = Math.min(ecoule + delta * 1000, plafond * holdMs)
        const part = holdMs > 0 ? Math.min(1, ecoule / holdMs) : 1

        noeud?.style.setProperty('--o-barg-p', part.toFixed(4))

        if (part < 1) return

        abonnement.unsubscribe()
        setSortant(true)
        annoncer()
      },
      { name: 'bar-gate' },
    )

    return () => {
      abonnement.unsubscribe()
    }
  }, [reduced, holdMs, ceiling])

  // Un minuteur plutot que `transitionend` : trois transitions de durees
  // differentes partent ensemble, et la plus courte remonterait ici en
  // premier.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(() => {
      setParti(true)
    }, exitMs + 40)

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs])

  // Le verrou de defilement, seulement quand le rideau couvre la fenetre.
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
    '--o-barg-bg': background,
    '--o-barg-ink': ink,
    '--o-barg-exit': `${String(exitMs)}ms`,
    '--o-barg-n': String(cases),
    '--o-barg-p': '0',
  } as CSSProperties

  return (
    <div
      {...rest}
      ref={hote}
      className={className}
      style={styleRideau}
      data-o-barg=""
      {...(sortant ? { 'data-o-barg-out': '' } : {})}
      {...(contained ? { 'data-o-barg-contained': '' } : {})}
    >
      {/* La plaque et la barre sont du decor : l'etat est dit par la region de
          statut, et une barre lue segment par segment ne dirait rien. */}
      <div data-o-barg-plate="" aria-hidden="true" />
      <div data-o-barg-bar="" aria-hidden="true">
        {Array.from({ length: cases }, (_, index) => (
          <div
            key={index}
            data-o-barg-seg=""
            style={{ '--o-barg-i': String(index) } as CSSProperties}
          />
        ))}
      </div>

      <div data-o-barg-mark="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
