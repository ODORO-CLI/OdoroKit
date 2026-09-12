/**
 * Texte qui suit : les lettres courent apres le pointeur, en chaine.
 *
 * ## Une chaine, pas un bloc qui se deplace
 *
 * `echo-text` fabrique des copies du texte et les fait trainer derriere le
 * pointeur ; l'original, lui, ne bouge pas. Ici il n'y a pas de copie : c'est
 * le texte lui-meme qui part. La premiere lettre vise le pointeur, la
 * deuxieme vise la premiere, la troisieme la deuxieme — chaque lettre ne
 * connait que celle qui la precede.
 *
 * De cette regle tres simple sort un comportement que personne n'a ecrit : le
 * mot se courbe en fouet dans les virages, s'etire quand le pointeur file, et
 * se remet en ligne tout seul des qu'il s'arrete. Aucune trajectoire n'est
 * calculee, aucune courbe n'est posee.
 *
 * ## La chaine se remonte par la queue
 *
 * Les lettres sont parcourues de la derniere a la premiere. Chacune lit donc
 * la position que sa voisine avait a l'image d'avant, et non celle qu'elle
 * vient de prendre : c'est ce retard d'une image par maillon qui fait la
 * traine. Dans l'autre sens, l'information remonterait la chaine entiere dans
 * la meme image et le mot se deplacerait d'un bloc.
 *
 * ## Rien n'est ecrit quand rien ne bouge
 *
 * Tant que le deplacement total d'une image reste sous un seuil, la boucle ne
 * touche a aucun style. Un titre laisse tranquille ne coute donc que la
 * comparaison, pas les ecritures.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les lettres sont
 * retirees de l'arbre d'accessibilite.
 *
 * ## Mouvement reduit
 *
 * Le suivi du pointeur est un agrement, pas un contenu : le texte est rendu
 * tel quel, en ligne, sans decoupage.
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
import { useRef, useEffect, type ElementType, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface TextCursorOwnProps {
  /** Texte a faire suivre. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Course maximale d'une lettre, en pixels. @defaultValue 26 */
  amplitude?: number
  /** Raideur de la chaine. Plus haut, plus le mot reste groupe. @defaultValue 9 */
  raideur?: number
  /** Inclinaison prise dans les virages, en degres par pixel d'ecart. @defaultValue 0.4 */
  inclinaison?: number
  /** Vitesse de rattrapage du pointeur. Plus haut, plus sec. @defaultValue 4 */
  speed?: number
}

/** Toutes les proprietes. */
export type TextCursorProps = Customisable<TextCursorOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = ' '

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-text-cursor'

/**
 * Deplacement total d'une image en deca duquel plus rien n'est ecrit.
 *
 * Un dixieme de pixel cumule sur le mot entier ne se voit pas ; le mesurer
 * coute une soustraction, l'ecrire coute une chaine de caracteres et une
 * invalidation par lettre.
 */
const SEUIL = 0.1

/** Une position dans le plan. */
interface Point {
  x: number
  y: number
}

/** Pose les regles de la chaine, une fois par document. */
function ensureCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-text-cursor]{display:inline-block}',
    '[data-o-text-cursor-letter]{display:inline-block;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait courir les lettres d'un texte derriere le pointeur.
 *
 * @example
 * <TextCursor as="h1" className="o-text-5xl o-font-bold">
 *   Attrape-moi
 * </TextCursor>
 *
 * @example
 * // Chaine molle et longue traine, sans inclinaison.
 * <TextCursor amplitude={48} raideur={3} inclinaison={0}>Elastique</TextCursor>
 */
export function TextCursor({
  children,
  as: Tag = 'span',
  amplitude = 26,
  raideur = 9,
  inclinaison = 0.4,
  speed = 4,
  ...rest
}: TextCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  // La fenetre entiere, pas le titre : un mot qui ne repondrait qu'au-dessus
  // de lui-meme ne serait jamais vu bouger.
  const pointeur = usePointerDamped({ speed, name: 'texte qui suit' })

  ensureCursorRule()

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    const lettres = [
      ...element.querySelectorAll<HTMLElement>('[data-o-text-cursor-letter]'),
    ]
    if (lettres.length === 0) return

    // Les positions vivent ici, jamais dans un etat React : elles changent a
    // chaque image et React ne dessine rien de tout cela.
    const places: Point[] = lettres.map(() => ({ x: 0, y: 0 }))

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const cibleX = pointeur.current.x * amplitude
        const cibleY = pointeur.current.y * amplitude

        // Amortissement independant de la cadence : voir usePointerDamped.
        const facteur = 1 - Math.exp(-raideur * delta)
        let course = 0

        // De la queue vers la tete : chaque maillon lit la position que son
        // voisin avait a l'image d'avant. Voir l'en-tete du module.
        for (let index = places.length - 1; index >= 0; index -= 1) {
          const place = places[index]
          const devant = index === 0 ? null : (places[index - 1] ?? null)
          if (place === undefined) continue

          const viseX = devant === null ? cibleX : devant.x
          const viseY = devant === null ? cibleY : devant.y

          const pasX = (viseX - place.x) * facteur
          const pasY = (viseY - place.y) * facteur
          place.x += pasX
          place.y += pasY
          course += Math.abs(pasX) + Math.abs(pasY)
        }

        if (course < SEUIL) return

        for (let index = 0; index < places.length; index += 1) {
          const place = places[index]
          const lettre = lettres[index]
          if (place === undefined || lettre === undefined) continue

          const devant = index === 0 ? null : (places[index - 1] ?? null)
          // L'ecart avec le maillon de devant dit dans quel sens la chaine
          // tire : la lettre se couche dans le virage.
          const ecart = (devant === null ? cibleX : devant.x) - place.x

          lettre.style.transform = `translate(${place.x.toFixed(2)}px, ${place.y.toFixed(2)}px) rotate(${(ecart * inclinaison).toFixed(2)}deg)`
        }
      },
      { name: 'texte qui suit', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      abonnement.unsubscribe()
      for (const lettre of lettres) lettre.style.removeProperty('transform')
    }
  }, [reduced, pointeur, children, amplitude, raideur, inclinaison])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, en ligne, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const lettres = [...children]

  return (
    <Tag {...rest} ref={hote} className={className} style={style} data-o-text-cursor="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {lettres.map((lettre, index) => (
          <span key={`${lettre}-${String(index)}`} data-o-text-cursor-letter="">
            {/* Une espace ordinaire s'ecrase dans un bloc en ligne :
                l'insecable garde sa largeur. */}
            {lettre === ' ' ? NBSP : lettre}
          </span>
        ))}
      </span>
    </Tag>
  )
}
