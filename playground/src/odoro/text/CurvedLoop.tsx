/**
 * Boucle courbe : une phrase defile sans fin le long d'un arc.
 *
 * ## Pourquoi `startOffset` et rien d'autre
 *
 * Le texte est pose sur un chemin par `textPath` : c'est le navigateur qui
 * calcule la position et l'inclinaison de chaque glyphe. Le faire defiler
 * revient alors a deplacer une seule valeur, `startOffset`, le long de ce
 * chemin. Aucune transformation, aucune mesure de glyphe, aucun rendu React :
 * un attribut ecrit par image.
 *
 * Une translation ferait autre chose — elle glisserait le bloc de texte a
 * cote de la courbe au lieu de le faire courir dessus.
 *
 * ## Le motif est mesure, pas devine
 *
 * Pour qu'une boucle soit invisible, le decalage doit revenir a zero apres
 * exactement une repetition. Cette largeur depend de la police reellement
 * chargee : elle est donc lue une fois, sur une copie du motif hors champ,
 * puis le nombre de repetitions necessaires pour couvrir le chemin en est
 * deduit. Une repetition de plus est ajoutee, celle qui entre par le bord.
 *
 * ## Distinction
 *
 * `circular-text` enroule une phrase sur un anneau ferme et fait tourner
 * l'anneau : la phrase ne bouge pas par rapport a son support. Ici le support
 * est ouvert et immobile, et c'est le texte qui court dessus, en continu.
 *
 * ## Accessibilite
 *
 * Le motif est repete autant de fois qu'il faut pour couvrir l'arc : lu tel
 * quel, il annoncerait la phrase cinq fois. Le dessin est donc retire de
 * l'arbre d'accessibilite, et la phrase y figure une fois, entiere.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
} from 'react'

/** Sens de defilement. */
export type CurvedLoopSens = 'gauche' | 'droite'

/** Proprietes propres au composant. */
export interface CurvedLoopOwnProps {
  /** Phrase qui defile. */
  children: string
  /** Balise rendue. @defaultValue 'div' */
  as?: ElementType
  /** Separateur insere entre deux repetitions. @defaultValue ' — ' */
  separateur?: string
  /** Creux de la courbe, de 0 (droite) a 1. @defaultValue 0.5 */
  courbure?: number
  /** Corps du texte, en unites du dessin (hauteur totale : 200). @defaultValue 96 */
  taille?: number
  /** Vitesse, en unites du dessin par seconde. @defaultValue 60 */
  speed?: number
  /** Sens de defilement. @defaultValue 'gauche' */
  sens?: CurvedLoopSens
}

/** Toutes les proprietes. */
export type CurvedLoopProps = Customisable<CurvedLoopOwnProps>

/** Largeur du dessin, en unites internes. */
const VUE_LARGEUR = 1000

/** Hauteur du dessin, en unites internes. */
const VUE_HAUTEUR = 200

/** Repetitions rendues avant la premiere mesure. */
const REPETITIONS_INITIALES = 4

/** Plafond de repetitions : une police tres etroite en demanderait mille. */
const REPETITIONS_MAX = 40

/**
 * Fait courir une phrase le long d'un arc, sans fin.
 *
 * @example
 * <CurvedLoop className="o-w-full">Odoro, un registre de composants animes</CurvedLoop>
 *
 * @example
 * // Un arc creux, lent, qui part vers la droite.
 * <CurvedLoop courbure={0.9} speed={28} sens="droite">Atelier</CurvedLoop>
 */
export function CurvedLoop({
  children,
  as: Tag = 'div',
  separateur = ' — ',
  courbure = 0.5,
  taille = 96,
  speed = 60,
  sens = 'gauche',
  ...rest
}: CurvedLoopProps): ReactElement {
  const { reduced } = useMotionState()

  const brut = useId()
  // Un identifiant de React contient des deux-points ; place dans une
  // reference de fragment, il devient fragile. On ne garde que ce qui est sur.
  const cheminId = `o-curved-loop-${brut.replace(/[^a-zA-Z0-9_-]/g, '')}`

  const refChemin = useRef<SVGPathElement | null>(null)
  const refMotif = useRef<SVGTextElement | null>(null)
  const refTexte = useRef<SVGTextPathElement | null>(null)

  const [repetitions, setRepetitions] = useState(REPETITIONS_INITIALES)

  const motif = `${children}${separateur}`

  // Le creux : a zero la courbe est une droite, et le composant se comporte
  // comme un bandeau defilant ordinaire.
  const creux = Math.max(0, Math.min(1, courbure)) * 70
  const chemin = `M 0 ${String(VUE_HAUTEUR / 2 + creux)} Q ${String(VUE_LARGEUR / 2)} ${String(VUE_HAUTEUR / 2 - creux * 1.8)} ${String(VUE_LARGEUR)} ${String(VUE_HAUTEUR / 2 + creux)}`

  useEffect(() => {
    const arc = refChemin.current
    const gabarit = refMotif.current
    const texte = refTexte.current
    if (arc === null || gabarit === null || texte === null) return

    // Sans ces deux mesures — un environnement sans mise en page SVG — la
    // boucle serait fausse. Le texte reste alors pose, immobile : lisible.
    if (
      typeof arc.getTotalLength !== 'function' ||
      typeof gabarit.getComputedTextLength !== 'function'
    ) {
      return
    }

    const largeurMotif = gabarit.getComputedTextLength()
    if (largeurMotif <= 0) return

    const longueur = arc.getTotalLength()
    const voulues = Math.min(
      REPETITIONS_MAX,
      Math.ceil((longueur + largeurMotif) / largeurMotif) + 1,
    )
    if (voulues !== repetitions) setRepetitions(voulues)

    // Mouvement reduit : le motif est pose au depart du chemin et n'en bouge
    // plus. L'arc, le texte et sa forme sont tous la — seul le defilement
    // manque, et c'est exactement ce qui a ete demande.
    if (reduced) {
      texte.setAttribute('startOffset', '0')
      return
    }

    const signe = sens === 'gauche' ? -1 : 1
    const depart = performance.now()

    const abonnement = clock.subscribe(
      () => {
        const parcouru = ((performance.now() - depart) / 1000) * speed
        const cycle = (((parcouru * signe) % largeurMotif) + largeurMotif) % largeurMotif
        // Le motif commence une repetition avant l'arc : celle qui sort par un
        // bord n'est jamais rendue, et celle qui entre par l'autre est deja la.
        texte.setAttribute('startOffset', (cycle - largeurMotif).toFixed(2))
      },
      { name: 'boucle courbe', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      abonnement.unsubscribe()
    }
  }, [motif, chemin, taille, speed, sens, reduced, repetitions])

  const { className, style } = mergePresentation({ className: 'o-block' }, rest)

  return (
    <Tag {...rest} className={className} style={style}>
      {/* La phrase, une fois, entiere, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>

      <svg
        aria-hidden="true"
        viewBox={`0 0 ${String(VUE_LARGEUR)} ${String(VUE_HAUTEUR)}`}
        className="o-block o-w-full"
        fill="currentColor"
      >
        <defs>
          <path id={cheminId} ref={refChemin} d={chemin} fill="none" />
        </defs>

        {/*
          Le gabarit de mesure : une seule repetition, hors de la vue, dont on
          lit la largeur reelle une fois la police chargee.
        */}
        <text ref={refMotif} x={0} y={-VUE_HAUTEUR} fontSize={taille} visibility="hidden">
          {motif}
        </text>

        <text fontSize={taille}>
          <textPath ref={refTexte} href={`#${cheminId}`} startOffset="0">
            {motif.repeat(repetitions)}
          </textPath>
        </text>
      </svg>
    </Tag>
  )
}
