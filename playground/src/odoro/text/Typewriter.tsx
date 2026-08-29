/**
 * Machine a ecrire : des phrases frappees puis effacees, en boucle.
 *
 * ## Pourquoi un minuteur plutot que la boucle
 *
 * La frappe avance d'un caractere toutes les cinquante millisecondes. Sur un
 * ecran a soixante images par seconde, cela fait un changement toutes les trois
 * images ; sur un ecran a cent vingt, un toutes les six. La cadence de
 * l'affichage n'a donc aucune influence sur le resultat, et s'abonner a la
 * boucle reviendrait a la reveiller cinquante-neuf fois sur soixante pour ne
 * rien faire.
 *
 * C'est la contre-epreuve du critere du moteur : cet effet ne possede pas la
 * frame, il possede une horloge.
 *
 * ## L'espace reserve
 *
 * La ligne change de longueur a chaque caractere. Sans precaution, ce qui suit
 * se decale en permanence — et si la machine a ecrire est dans un titre, c'est
 * toute la page qui respire. La phrase la plus longue est donc rendue en
 * reserve, invisible et sans hauteur, pour figer la largeur.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface TypewriterOwnProps {
  /** Phrases jouees en boucle. */
  phrases: readonly string[]
  /** Delai entre deux caracteres frappes, en millisecondes. @defaultValue 55 */
  typeSpeed?: number
  /** Delai entre deux caracteres effaces, en millisecondes. @defaultValue 28 */
  deleteSpeed?: number
  /** Attente une fois la phrase complete, en millisecondes. @defaultValue 1400 */
  hold?: number
  /** Caractere du curseur. Chaine vide pour l'enlever. @defaultValue '|' */
  cursor?: string
}

/** Toutes les proprietes. */
export type TypewriterProps = Customisable<TypewriterOwnProps, 'span'>

/**
 * Frappe une suite de phrases, en boucle.
 *
 * @example
 * <Typewriter
 *   phrases={['des interfaces vivantes', 'sans dependance externe']}
 *   className="o-text-brand-500"
 * />
 */
export function Typewriter({
  phrases,
  typeSpeed = 55,
  deleteSpeed = 28,
  hold = 1400,
  cursor = '|',
  ...rest
}: TypewriterProps): ReactElement {
  const { reduced } = useMotionState()
  const [index, setIndex] = useState(0)
  const [length, setLength] = useState(0)
  const [erasing, setErasing] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const phrase = phrases[index % Math.max(phrases.length, 1)] ?? ''
  const longest = phrases.reduce(
    (best, item) => (item.length > best.length ? item : best),
    '',
  )

  useEffect(() => {
    if (reduced || phrases.length === 0) return

    const step = (): void => {
      if (!erasing) {
        if (length < phrase.length) {
          setLength(length + 1)
          return
        }
        // Une seule phrase : l'effacer pour la reecrire a l'identique serait
        // du mouvement pour rien.
        if (phrases.length > 1) setErasing(true)
        return
      }

      if (length > 0) {
        setLength(length - 1)
        return
      }
      setErasing(false)
      setIndex(index + 1)
    }

    const delay = erasing ? deleteSpeed : length === phrase.length ? hold : typeSpeed

    timer.current = setTimeout(step, delay)
    return () => clearTimeout(timer.current)
  }, [reduced, phrases, phrase, length, erasing, index, typeSpeed, deleteSpeed, hold])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-inline-grid' },
    rest,
  )

  // Sous mouvement reduit, la premiere phrase est simplement la.
  const shown = reduced ? (phrases[0] ?? '') : phrase.slice(0, length)

  return (
    <span {...rest} className={className} style={style}>
      {/*
        Reserve de largeur : la phrase la plus longue occupe la meme cellule de
        grille, invisible. Sans elle, la ligne se decale a chaque caractere.
      */}
      <span aria-hidden className="o-invisible o-col-start-1 o-row-start-1">
        {longest}
        {cursor}
      </span>

      <span className="o-col-start-1 o-row-start-1" aria-live="polite">
        {shown}
        {cursor === '' || reduced ? null : (
          <span aria-hidden className="o-animate-caret-blink">
            {cursor}
          </span>
        )}
      </span>
    </span>
  )
}
