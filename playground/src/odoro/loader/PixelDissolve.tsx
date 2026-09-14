/**
 * Rideau qui se dissout en carreaux, dans un desordre reproductible.
 *
 * ## Le desordre est calcule, pas tire au sort
 *
 * L'ordre de disparition vient d'un melange deterministe de l'indice, pas de
 * `Math.random`. Deux raisons, et la seconde est la vraie.
 *
 * La premiere : un rendu serveur et le rendu client doivent produire le meme
 * document. Un delai tire au sort a la construction differerait entre les deux,
 * et React signalerait une divergence d'hydratation.
 *
 * La seconde : un vrai hasard fait des paquets. Sur deux cents carreaux, il
 * laisse regulierement des zones entieres qui partent en meme temps et d'autres
 * qui restent, et la dissolution se lit alors comme une panne. Le melange
 * employe ici — un pas d'or module par le nombre de carreaux — repartit les
 * indices voisins loin les uns des autres : le resultat parait plus aleatoire
 * que l'aleatoire, parce qu'il n'a pas de grumeaux.
 *
 * ## Un pixel de recouvrement
 *
 * Chaque carreau mesure un pixel de plus que sa part exacte, dans les deux
 * sens. Sans cela, une grille de vingt colonnes sur une largeur qui ne se
 * divise pas en vingt donne un quadrillage de raies claires visible avant meme
 * que le geste commence.
 *
 * ## Ce que coute la grille
 *
 * Vingt colonnes sur douze rangees font deux cent quarante elements. C'est le
 * seul rideau du lot dont le cout depend d'un reglage, et le seul ou monter les
 * valeurs a une limite : au-dela de six cents carreaux, la seule composition de
 * la couche devient sensible sur une machine modeste. Les bornes du meta
 * tiennent compte de ce plafond.
 *
 * ## La sortie part au DEBUT, pas apres
 *
 * `onDone` est appele quand les premiers carreaux **commencent** a partir. Le
 * contenu se decouvre a travers la grille pendant qu'elle se troue ; attendre
 * la fin donnerait deux gestes successifs la ou l'on en voulait un.
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
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface PixelDissolveOwnProps {
  /** Le fond des carreaux. @defaultValue le fond du theme */
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
  /** Nombre de colonnes. @defaultValue 20 */
  columns?: number
  /** Nombre de rangees. @defaultValue 12 */
  rows?: number
  /** Etalement des departs, en millisecondes. @defaultValue 700 */
  spreadMs?: number
  /** Combien de temps la grille reste pleine, en millisecondes. @defaultValue 1200 */
  holdMs?: number
  /** Duree de disparition d'un carreau, en millisecondes. @defaultValue 420 */
  exitMs?: number
  /**
   * Etat controle : la grille couvre tant que c'est `true`, et se dissout au
   * premier `false`. Renseigne, il remplace `holdMs`.
   */
  open?: boolean
  /** Couvre le parent positionne plutot que la fenetre. @defaultValue false */
  contained?: boolean
  /** Appele au **debut** de la sortie. Voir l'en-tete du module. */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type PixelDissolveProps = Customisable<PixelDissolveOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pixel-dissolve'

/**
 * Pas d'or, en fraction du tour.
 *
 * Multiplie modulo le nombre de carreaux, il envoie deux indices voisins aux
 * deux bouts de la grille : c'est la suite la plus uniformement repartie qui
 * existe, et la raison pour laquelle elle bat un tirage au sort. Voir l'en-tete.
 */
const GOLDEN = 0.618_033_988_75

/** Pose les regles de la grille, une fois par document. */
function ensurePixelDissolveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pxd]{',
    'position:fixed;inset:0;z-index:9999;overflow:hidden;',
    'color:var(--o-pxd-ink);',
    '}',
    '[data-o-pxd][data-o-pxd-contained]{position:absolute}',
    '[data-o-pxd][data-o-pxd-out]{pointer-events:none}',
    '[data-o-pxd-cell]{',
    'position:absolute;',
    'left:calc(var(--o-pxd-x) * 100% / var(--o-pxd-cols));',
    'top:calc(var(--o-pxd-y) * 100% / var(--o-pxd-rows));',
    'width:calc(100% / var(--o-pxd-cols) + 1px);',
    'height:calc(100% / var(--o-pxd-rows) + 1px);',
    'background:var(--o-pxd-bg);',
    'transition:opacity var(--o-pxd-exit) linear var(--o-pxd-d),',
    'transform var(--o-pxd-exit) cubic-bezier(0.4,0,1,1) var(--o-pxd-d);',
    '}',
    // Le carreau ne fait pas que s'effacer : il se retracte legerement. Une
    // opacite seule se lit comme un fondu du plan entier ; un retrait dit que
    // chaque carreau est une piece.
    '[data-o-pxd-out] [data-o-pxd-cell]{opacity:0;transform:scale(0.55)}',
    '[data-o-pxd-status]{',
    'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;',
    'transition:opacity 240ms ease;',
    '}',
    '[data-o-pxd-out] [data-o-pxd-status]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page d'une grille, puis la dissout carreau par carreau.
 *
 * @example
 * <PixelDissolve label="Odoro" onDone={ouvrir} />
 *
 * @example
 * // Gros carreaux, dissolution serree.
 * <PixelDissolve columns={10} rows={6} spreadMs={400} onDone={ouvrir} />
 */
export function PixelDissolve({
  background = 'var(--o-theme-bg)',
  ink = 'var(--o-theme-fg)',
  label,
  status = 'Chargement',
  columns = 20,
  rows = 12,
  spreadMs = 700,
  holdMs = 1200,
  exitMs = 420,
  open,
  contained = false,
  onDone,
  ...rest
}: PixelDissolveProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne s'annonce qu'une fois, et un rendu de plus ne
  // doit pas rejouer le rappel.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensurePixelDissolveRule()

  const cols = Math.max(2, Math.round(columns))
  const lignes = Math.max(2, Math.round(rows))

  // La grille est memorisee : elle ne depend que des reglages, et la
  // reconstruire a chaque rendu recreerait deux cents objets pour rien.
  const carreaux = useMemo(() => {
    const total = cols * lignes
    return Array.from({ length: total }, (_, index) => ({
      x: index % cols,
      y: Math.floor(index / cols),
      delai: ((index * GOLDEN) % 1) * spreadMs,
    }))
  }, [cols, lignes, spreadMs])

  useEffect(() => {
    const annoncer = (): void => {
      if (annonce.current) return
      annonce.current = true
      rappel.current?.()
    }

    // Mouvement reduit : la sortie est immediate. La grille n'apportait qu'un
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

  // Un minuteur, et non `transitionend` : deux cent quarante carreaux emettent
  // autant d'evenements, et le premier arrive quand la grille est encore
  // presque pleine.
  useEffect(() => {
    if (!sortant) return

    const minuteur = window.setTimeout(
      () => {
        setParti(true)
      },
      exitMs + spreadMs + 40,
    )

    return () => {
      window.clearTimeout(minuteur)
    }
  }, [sortant, exitMs, spreadMs])

  // Le verrou de defilement, seulement quand la grille couvre la fenetre.
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

  const styleGrille = {
    ...style,
    '--o-pxd-bg': background,
    '--o-pxd-ink': ink,
    '--o-pxd-exit': `${String(exitMs)}ms`,
    '--o-pxd-cols': String(cols),
    '--o-pxd-rows': String(lignes),
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleGrille}
      data-o-pxd=""
      {...(sortant ? { 'data-o-pxd-out': '' } : {})}
      {...(contained ? { 'data-o-pxd-contained': '' } : {})}
    >
      {/* La grille est du decor : elle ne doit pas etre lue. */}
      <div aria-hidden="true">
        {carreaux.map((carreau, index) => (
          <div
            key={index}
            data-o-pxd-cell=""
            style={
              {
                '--o-pxd-x': String(carreau.x),
                '--o-pxd-y': String(carreau.y),
                '--o-pxd-d': `${String(Math.round(carreau.delai))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>

      <div data-o-pxd-status="" role="status">
        {status.length > 0 && <span className="o-sr-only">{status}</span>}
        {label}
      </div>
    </div>
  )
}
