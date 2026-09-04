/**
 * Mot tournant : un seul mot change dans une phrase qui, elle, ne bouge pas.
 *
 * ## Ce n'est pas la machine a ecrire
 *
 * `typewriter` frappe puis efface des phrases entieres, caractere par
 * caractere : le regard suit le curseur. Ici la phrase est fixe et lisible du
 * debut a la fin, seul un mot se substitue. C'est ce qu'on veut pour un titre
 * de page — « Construisez plus **vite** / plus **sur** / **ensemble** » — la ou
 * une phrase qui s'efface obligerait a relire a chaque tour.
 *
 * ## La largeur ne saute pas, et sans mesurer quoi que ce soit
 *
 * Le probleme classique : « vite » est plus court qu'« ensemble », donc la fin
 * de la phrase se deplace a chaque tour. La reponse habituelle consiste a
 * mesurer chaque mot en JavaScript pour reserver la largeur du plus long — ce
 * qui suppose que les polices soient chargees, se refait a chaque
 * redimensionnement, et se trompe entre-temps.
 *
 * Une grille en ligne le fait toute seule. Tous les mots occupent la **meme
 * cellule** ; la cellule prend la largeur du plus large, et l'on n'a rien
 * mesure. Le navigateur sait faire cela depuis toujours, et il le refait tout
 * seul quand la police change.
 *
 * ## Le premier mot est le mot lu
 *
 * Un lecteur d'ecran ne doit pas entendre huit variantes a la suite. La phrase
 * porte donc un mot, un seul, dans le flux normal ; la pile qui tourne est
 * `aria-hidden`. Ce que l'on entend est une phrase complete et sensee, ce que
 * l'on voit est la meme phrase qui respire.
 *
 * ## Elle ne tourne que sous les yeux
 *
 * L'intervalle s'arrete des que le composant sort du champ. Une page qui garde
 * trois titres en train de tourner dans des sections qu'on ne regarde pas
 * reveille le processeur pour rien, et cela se sent sur la batterie.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Proprietes propres au composant. */
export interface RotatingWordsOwnProps {
  /** Les mots qui se succedent. Le premier est celui que l'on lit. */
  words: readonly string[]
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Temps d'affichage d'un mot, en millisecondes. @defaultValue 2200 */
  interval?: number
  /** Duree de la substitution, en millisecondes. @defaultValue 420 */
  duration?: number
  /**
   * Sens du mouvement.
   *
   * @defaultValue 'haut'
   */
  sens?: 'haut' | 'bas'
}

/** Toutes les proprietes. */
export type RotatingWordsProps = Customisable<RotatingWordsOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-rotating-words'

/** Pose les regles de la pile, une fois par document. */
function ensureRotatingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La grille en ligne donne la largeur du plus long mot, sans mesure.
    '[data-o-rotating]{display:inline-grid;vertical-align:bottom;overflow:hidden;text-align:left}',
    '[data-o-rotating]>*{grid-area:1/1}',
    '[data-o-rotating-stack]{display:inline-grid}',
    '[data-o-rotating-stack]>*{grid-area:1/1}',
    '[data-o-rotating-word]{',
    'opacity:0;',
    'transform:translateY(var(--o-rotating-depart));',
    'transition:opacity var(--o-rotating-duration) ease,transform var(--o-rotating-duration) cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-rotating-word][data-actif]{opacity:1;transform:translateY(0)}',
    // Le mot qui vient de partir s'en va dans le sens du mouvement, plutot que
    // de revenir sur ses pas : sans cela, l'entrant et le sortant se croisent.
    '[data-o-rotating-word][data-sortant]{opacity:0;transform:translateY(var(--o-rotating-sortie))}',
    '[data-o-rotating-hidden]{color:transparent}',
    '@media (prefers-reduced-motion:reduce){[data-o-rotating-word]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait tourner un mot dans une phrase fixe.
 *
 * @example
 * <p className="o-text-4xl">
 *   Construisez plus{' '}
 *   <RotatingWords words={['vite', 'sur', 'ensemble']} className="o-text-brand-600" />
 * </p>
 *
 * @example
 * // Vers le bas, et plus lentement.
 * <RotatingWords words={['hier', 'aujourd hui', 'demain']} sens="bas" interval={3200} />
 */
export function RotatingWords({
  words,
  as: Tag = 'span',
  interval = 2200,
  duration = 420,
  sens = 'haut',
  ...rest
}: RotatingWordsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: refVue, vu } = useInView<HTMLElement>({ once: false })
  const [index, setIndex] = useState(0)
  const [precedent, setPrecedent] = useState<number | undefined>(undefined)

  ensureRotatingRule()

  useEffect(() => {
    // En mouvement reduit, le premier mot reste. La phrase garde son sens, et
    // c'est tout ce que la rotation apportait.
    if (reduced || !vu || words.length < 2) return

    const minuteur = setInterval(() => {
      setIndex((courant) => {
        setPrecedent(courant)
        return (courant + 1) % words.length
      })
    }, Math.max(duration, interval))

    return () => {
      clearInterval(minuteur)
    }
  }, [vu, reduced, words.length, interval, duration])

  const { className, style } = mergePresentation({}, rest)

  // Le sens decide d'ou vient l'entrant et ou va le sortant. Les deux vont
  // dans la meme direction : c'est ce qui donne l'impression d'un rouleau.
  const depart = sens === 'haut' ? '0.9em' : '-0.9em'
  const sortie = sens === 'haut' ? '-0.9em' : '0.9em'

  const styleRotation = {
    ...style,
    '--o-rotating-duration': `${String(duration)}ms`,
    '--o-rotating-depart': depart,
    '--o-rotating-sortie': sortie,
  } as CSSProperties

  const anime = !reduced && words.length > 1
  const lu = words[0] ?? ''

  return (
    <Tag
      {...rest}
      ref={refVue}
      className={className}
      style={styleRotation}
      data-o-rotating=""
    >
      {/* Le mot lu, dans le flux : c'est lui qui est annonce et copie. */}
      <span {...(anime ? { 'data-o-rotating-hidden': '' } : {})}>{lu}</span>

      {anime && (
        <span aria-hidden="true" data-o-rotating-stack="">
          {words.map((mot, i) => (
            <span
              key={mot}
              data-o-rotating-word=""
              {...(i === index ? { 'data-actif': '' } : {})}
              {...(i === precedent && i !== index ? { 'data-sortant': '' } : {})}
            >
              {mot}
            </span>
          ))}
        </span>
      )}
    </Tag>
  )
}
