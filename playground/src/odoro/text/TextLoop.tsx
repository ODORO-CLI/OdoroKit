/**
 * Boucle de phrases : chacune s'efface vers le haut, la suivante monte.
 *
 * ## Trois etats, pas deux
 *
 * Une phrase n'est pas seulement « affichee » ou « cachee » : elle est **deja
 * passee** ou **pas encore venue**. Avec deux etats, la sortante et l'entrante
 * partiraient du meme cote, et le mouvement se lirait comme un rebond au lieu
 * d'un defilement.
 *
 * La position relative se calcule modulo le nombre de phrases : celle qui
 * precede la phrase courante est « avant », toutes les autres sont « apres ».
 * Le tour de boucle ne fait donc pas exception — la derniere phrase sort par
 * le haut comme les autres.
 *
 * ## Tout est declaratif
 *
 * Aucun style n'est ecrit a la main, aucune animation n'est programmee : un
 * attribut change, et le navigateur interpole. Le seul travail de JavaScript
 * est d'avancer un compteur toutes les quelques secondes.
 *
 * Les phrases « apres » n'ont pas de transition : elles sont invisibles, et
 * les faire glisser du haut vers le bas au moment ou elles quittent l'etat
 * « avant » serait du travail de compositeur pour un mouvement que personne
 * ne voit.
 *
 * ## Pourquoi un minuteur plutot que la boucle
 *
 * La phrase change toutes les deux ou trois secondes, soit une fois toutes
 * les cent cinquante images. S'abonner a la boucle du moteur reviendrait a la
 * reveiller cent quarante-neuf fois pour ne rien faire. Cet effet ne possede
 * pas la frame, il possede une horloge.
 *
 * ## L'espace reserve
 *
 * Les phrases sont empilees dans la meme cellule de grille : la boite prend
 * la taille de la plus longue, rendue en reserve, invisible. Sans elle, la
 * mise en page sauterait a chaque changement.
 *
 * ## Mouvement reduit
 *
 * La premiere phrase, immobile. Une boucle n'a pas d'etat d'arrivee : son
 * repos, c'est son point de depart.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface TextLoopOwnProps {
  /** Phrases jouees en boucle. */
  phrases: readonly string[]
  /** Temps pendant lequel une phrase reste lisible, en millisecondes. @defaultValue 2400 */
  hold?: number
  /** Duree du fondu d'une phrase a l'autre, en millisecondes. @defaultValue 600 */
  fade?: number
  /** Course verticale d'une phrase qui entre ou qui sort, en pixels. @defaultValue 14 */
  lift?: number
}

/** Toutes les proprietes. */
export type TextLoopProps = Customisable<TextLoopOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-text-loop'

/** Pose les trois etats d'une phrase, une fois par document. */
function ensureLoopRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-loop-phrase]{',
    'grid-area:1/1;',
    'transition:opacity var(--o-loop-fade) ease,transform var(--o-loop-fade) ease;',
    '}',
    '[data-o-loop-phrase="actif"]{opacity:1;transform:translateY(0)}',
    '[data-o-loop-phrase="avant"]{',
    'opacity:0;transform:translateY(calc(var(--o-loop-lift) * -1));',
    '}',
    // Pas encore venue : elle attend en bas, et y arrive sans transition.
    '[data-o-loop-phrase="apres"]{',
    'opacity:0;transform:translateY(var(--o-loop-lift));transition:none;',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-loop-phrase]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait defiler une suite de phrases dans une boite qui ne bouge pas.
 *
 * @example
 * <TextLoop
 *   phrases={['des interfaces vivantes', 'sans dependance externe']}
 *   className="o-text-3xl o-font-bold"
 * />
 *
 * @example
 * // Fondu long, sans deplacement vertical.
 * <TextLoop phrases={['ici', 'la', 'ailleurs']} fade={1200} lift={0} />
 */
export function TextLoop({
  phrases,
  hold = 2400,
  fade = 600,
  lift = 14,
  ...rest
}: TextLoopProps): ReactElement {
  const { reduced } = useMotionState()
  const [index, setIndex] = useState(0)

  ensureLoopRule()

  const total = phrases.length

  useEffect(() => {
    if (reduced || total < 2) return

    // Le retard compte le temps de lecture **plus** le fondu : `hold` est
    // donc bien la duree pendant laquelle la phrase est entierement lisible,
    // pas la periode du cycle.
    const minuteur = setTimeout(() => {
      setIndex((precedent) => (precedent + 1) % total)
    }, hold + fade)

    return () => clearTimeout(minuteur)
  }, [reduced, total, index, hold, fade])

  const { className, style } = mergePresentation({ className: 'o-inline-grid' }, rest)

  const styleRacine = {
    ...style,
    '--o-loop-fade': `${String(fade)}ms`,
    '--o-loop-lift': `${String(lift)}px`,
  } as CSSProperties

  // La plus longue fixe la boite. La mesure est faite sur le nombre de
  // caracteres : elle se trompe de peu sur une police proportionnelle, et
  // c'est le meme compromis que la machine a ecrire.
  const reserve = phrases.reduce(
    (meilleure, phrase) => (phrase.length > meilleure.length ? phrase : meilleure),
    '',
  )

  const courant = total === 0 ? 0 : index % total

  return (
    <span {...rest} className={className} style={styleRacine}>
      {/* Reserve de place : sans elle, ce qui entoure la boucle se decale a
          chaque phrase. */}
      <span aria-hidden className="o-invisible o-col-start-1 o-row-start-1">
        {reserve}
      </span>

      {phrases.map((phrase, position) => {
        const rang = total === 0 ? 0 : (position - courant + total) % total
        // Mouvement reduit : la premiere phrase, et elle seule.
        const etat = reduced
          ? position === 0
            ? 'actif'
            : 'apres'
          : rang === 0
            ? 'actif'
            : rang === total - 1
              ? 'avant'
              : 'apres'

        return (
          <span
            key={`${phrase}-${String(position)}`}
            data-o-loop-phrase={etat}
            aria-hidden={etat !== 'actif'}
          >
            {phrase}
          </span>
        )
      })}
    </span>
  )
}
