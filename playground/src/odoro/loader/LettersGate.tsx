/**
 * Rideau dont le mot s'assemble lettre a lettre, puis se rabat comme un
 * couvercle.
 *
 * ## Le mot est l'attente
 *
 * Les autres rideaux occupent le temps par une forme ou par une barre. Celui-ci
 * l'occupe par un **mot** : chaque caractere arrive a son tour, et la duree du
 * rideau se lit dans le nom qui se construit. C'est le seul du lot ou l'objet
 * regarde pendant l'attente est le contenu lui-meme, pas un decor pose devant.
 *
 * Cela a une consequence de conception : la longueur du mot **est** un reglage
 * de duree. Un nom de cinq lettres et un de douze ne tiennent pas l'ecran le
 * meme temps, et c'est voulu — il vaut mieux une entree qui epouse la marque
 * qu'une duree fixe dans laquelle on l'aurait fait entrer de force.
 *
 * ## L'horloge du moteur, pas un `setInterval`
 *
 * Les lettres avancent sur la boucle unique du moteur. Un intervalle bat contre
 * la cadence de l'ecran : les caracteres arriveraient a des instants qui ne
 * tombent pas sur les images, et l'un sur trois paraitrait en retard d'une
 * frame. Et deux boucles concurrentes dans une page rendent dans un ordre
 * indetermine, ce qui est le defaut que l'horloge unique existe pour empecher.
 *
 * Rien n'est ecrit dans l'etat React : la boucle pose un attribut sur le
 * caractere qui vient d'arriver, c'est-a-dire une ecriture par lettre, et non
 * un rendu par image.
 *
 * ## Le texte reel, et ce que les lecteurs d'ecran entendent
 *
 * Les caracteres sont des elements separes, ce qui est necessaire pour les
 * animer un par un — et illisible pour un lecteur d'ecran, qui epellerait. Le
 * mot est donc aussi present d'un seul tenant dans la region de statut, hors
 * de l'ecran, et la version decoupee est marquee comme decorative. Le texte est
 * bien dans le document, une fois pour l'oeil, une fois pour l'oreille.
 *
 * ## La sortie : un couvercle, pas une translation
 *
 * La plaque bascule autour de son bord superieur et se rabat vers l'arriere,
 * dans une perspective. Les lettres, elles, partent vers le haut en ordre
 * decale, un peu avant la plaque : elles quittent la scene par ou la plaque va
 * s'ouvrir, ce qui donne un seul mouvement au lieu de deux.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand la plaque **commence** a basculer. Le contenu entre
 * pendant l'ouverture du couvercle ; attendre la fin donnerait un rideau, un
 * temps mort, puis une page.
 *
 * ## Contenu ou plein ecran
 *
 * Par defaut le rideau est `fixed`, couvre la fenetre et verrouille le
 * defilement du document. Avec `contained`, il devient `absolute`, se resout
 * contre le premier ancetre positionne et ne touche plus au defilement.
 *
 * @module
 */

import { clock, mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface LettersGateOwnProps {
  /** Le fond de la plaque. @defaultValue le fond du theme */
  background?: string
  /** L'encre du mot. @defaultValue l'encre du theme */
  ink?: string
  /** Le mot qui s'assemble. @defaultValue 'ODORO' */
  word?: string
  /**
   * Ce que les lecteurs d'ecran annoncent avant le mot. Chaine vide pour
   * n'annoncer que le mot.
   *
   * @defaultValue 'Chargement'
   */
  status?: string
  /** Temps entre deux caracteres, en millisecondes. @defaultValue 130 */
  letterMs?: number
  /** Pause apres le dernier caractere, en millisecondes. @defaultValue 650 */
  holdMs?: number
  /** Duree du rabattement, en millisecondes. @defaultValue 900 */
  exitMs?: number
  /**
   * Etat controle : le rideau attend tant que c'est `true`, meme le mot
   * assemble, et sort au premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type LettersGateProps = Customisable<LettersGateOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-letters-gate'

/** Decalage entre deux lettres au depart, en millisecondes. */
const EXIT_STAGGER = 45

/** Pose les regles du mot et du couvercle, une fois par document. */
function ensureLettersGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La perspective vit sur la scene : c'est elle qui fait du rabattement une
    // rotation dans l'espace plutot qu'un ecrasement.
    '[data-o-letg]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'perspective:1600px;color:var(--o-letg-ink);',
    '}',
    '[data-o-letg][data-o-letg-contained]{position:absolute}',
    '[data-o-letg][data-o-letg-out]{pointer-events:none}',
    '[data-o-letg-plate]{',
    'position:absolute;inset:0;',
    'display:flex;align-items:center;justify-content:center;',
    'transform-origin:50% 0%;transform:rotateX(0deg);',
    'transition:transform var(--o-letg-exit) cubic-bezier(0.6,0,0.3,1);',
    '}',
    '[data-o-letg-out] [data-o-letg-plate]{transform:rotateX(-104deg)}',
    '[data-o-letg-face]{position:absolute;inset:0;background:var(--o-letg-bg)}',
    '[data-o-letg-word]{',
    'position:relative;display:inline-flex;',
    'font-size:clamp(1.6rem,6vw,3.2rem);font-weight:600;letter-spacing:0.02em;line-height:1;',
    '}',
    '[data-o-letg-ch]{',
    'display:inline-block;white-space:pre;',
    'opacity:0;transform:translateY(0.42em);',
    'transition:opacity 260ms ease,transform 260ms cubic-bezier(0.2,0,0,1);',
    '}',
    '[data-o-letg-ch][data-o-letg-on]{opacity:1;transform:none}',
    // A la sortie, les lettres remontent en ordre decale : elles quittent la
    // scene par ou le couvercle va s'ouvrir.
    '[data-o-letg-out] [data-o-letg-ch]{',
    'opacity:0;transform:translateY(-0.5em);',
    'transition:opacity 220ms ease var(--o-letg-d),',
    'transform 320ms cubic-bezier(0.6,0,0.8,0) var(--o-letg-d);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Assemble un mot, puis rabat la plaque qui le portait.
 *
 * @example
 * <LettersGate word="ODORO" onDone={ouvrir} />
 *
 * @example
 * // Controle : le mot reste affiche jusqu'a ce que la scene soit dessinee.
 * <LettersGate word="ATELIER" open={!sceneDessinee} onDone={ouvrir} />
 */
export function LettersGate({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  word = 'ODORO',
  status = 'Chargement',
  letterMs = 130,
  holdMs = 650,
  exitMs = 900,
  open,
  contained = false,
  onDone,
  ...rest
}: LettersGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)
  const caracteres = useRef<(HTMLSpanElement | null)[]>([])

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  // `open` vit dans une ref parce que la boucle le lit a chaque image. Le
  // mettre en dependance de l'effet relancerait l'assemblage du mot chaque
  // fois que l'appelant change d'avis.
  const ouvert = useRef(open)
  ouvert.current = open

  ensureLettersGateRule()

  const lettres = [...word]
  const nbLettres = lettres.length

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. Un mot qui s'assemble est
    // exactement le mouvement que la preference demande d'omettre, et le
    // rideau n'apportait que lui.
    if (reduced) {
      annoncer()
      setParti(true)
      return
    }

    const total = nbLettres
    let ecoule = 0
    let poses = 0

    const abonnement = clock.subscribe(
      ({ delta }) => {
        ecoule += delta * 1000

        // Une ecriture par lettre, pas une par image : on n'entre dans la
        // boucle d'ecriture que lorsque le compte a change.
        const attendus = Math.min(total, Math.floor(ecoule / Math.max(1, letterMs)))
        while (poses < attendus) {
          caracteres.current[poses]?.setAttribute('data-o-letg-on', '')
          poses += 1
        }

        if (poses < total) return

        // Le mot est assemble. Sans `open`, la pause decide ; avec, c'est
        // l'appelant, et le mot reste affiche aussi longtemps qu'il le faut.
        const fini =
          ouvert.current === undefined
            ? ecoule >= total * letterMs + holdMs
            : ouvert.current === false

        if (!fini) return

        abonnement.unsubscribe()
        setSortant(true)
        annoncer()
      },
      { name: 'letters-gate' },
    )

    return () => {
      abonnement.unsubscribe()
    }
  }, [reduced, letterMs, holdMs, nbLettres])

  // Un minuteur plutot que `transitionend` : les lettres partent en ordre
  // decale, et le premier evenement arrive quand la plaque n'a pas bouge.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(
      () => {
        setParti(true)
      },
      exitMs + nbLettres * EXIT_STAGGER + 40,
    )

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs, nbLettres])

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

  const styleScene = {
    ...style,
    '--o-letg-bg': background,
    '--o-letg-ink': ink,
    '--o-letg-exit': `${String(exitMs)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleScene}
      data-o-letg=""
      {...(sortant ? { 'data-o-letg-out': '' } : {})}
      {...(contained ? { 'data-o-letg-contained': '' } : {})}
    >
      <div data-o-letg-plate="">
        {/* Le fond est du decor : il ne doit pas etre lu. */}
        <div data-o-letg-face="" aria-hidden="true" />

        <div role="status">
          <span className="o-sr-only">{status.length > 0 ? `${status} ${word}` : word}</span>

          {/* Le mot decoupe est decoratif : lu tel quel, il serait epele. */}
          <span data-o-letg-word="" aria-hidden="true">
            {lettres.map((caractere, index) => (
              <span
                key={index}
                ref={(noeud) => {
                  caracteres.current[index] = noeud
                }}
                data-o-letg-ch=""
                style={{ '--o-letg-d': `${String(index * EXIT_STAGGER)}ms` } as CSSProperties}
              >
                {caractere}
              </span>
            ))}
          </span>
        </div>
      </div>
    </div>
  )
}
