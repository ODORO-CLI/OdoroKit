/**
 * Odometre : chaque chiffre est une colonne qui roule jusqu'a sa position.
 *
 * ## Rouler, pas interpoler
 *
 * Le compteur `count-up` traverse les valeurs intermediaires — il interpole
 * le nombre. L'odometre, lui, ne calcule rien : chaque colonne est une pile
 * de 0 a 9, et rejoindre le chiffre cible est une seule translation CSS, avec
 * un delai qui croit depuis la droite comme sur un compteur mecanique. Le
 * navigateur compose tout ; aucun JavaScript ne tourne pendant l'animation.
 *
 * ## Une valeur, pas dix chiffres
 *
 * Des piles de chiffres tronquees par un `overflow` sont illisibles a un
 * lecteur d'ecran — il y trouverait dix chiffres par colonne. Elles sont donc
 * `aria-hidden`, et la valeur finale, formatee, vit dans un element
 * visuellement masque, annonce poliment quand elle change.
 *
 * ## Le formatage passe par `Intl`
 *
 * Separer les milliers a la main donne « 1,234 » a un lecteur francais, qui y
 * lit un nombre a virgule. `Intl.NumberFormat` connait la convention de
 * chaque langue.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useMemo,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Proprietes propres au composant. */
export interface CounterRollOwnProps {
  /** Valeur affichee. */
  value: number
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree du roulement d'une colonne, en millisecondes. @defaultValue 900 */
  duration?: number
  /** Delai entre deux colonnes, depuis la droite, en millisecondes. @defaultValue 80 */
  step?: number
  /**
   * Langue du formatage.
   *
   * Par defaut, celle du navigateur — et non `fr-FR` en dur : un compteur qui
   * affiche des espaces insecables a un lecteur anglophone a l'air casse.
   */
  locale?: string
}

/** Toutes les proprietes. */
export type CounterRollProps = Customisable<CounterRollOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-counter-roll'

/** La pile complete, celle que chaque colonne fait defiler. */
const DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'] as const

/**
 * Pose les regles des colonnes, une fois par document.
 *
 * La hauteur d'une case est exactement `1em`, et la pile se deplace en `em` :
 * l'odometre suit la taille de police sans une seule mesure.
 */
function ensureCounterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-roll]{font-variant-numeric:tabular-nums}',
    '[data-o-roll-col]{',
    'display:inline-block;overflow:hidden;height:1em;line-height:1;',
    'vertical-align:-0.15em;',
    '}',
    '[data-o-roll-col] span{display:block;height:1em;line-height:1}',
    '[data-o-roll-sep]{display:inline-block;line-height:1;vertical-align:-0.15em}',
  ].join('')
  document.head.append(style)
}

/**
 * Affiche un nombre en colonnes de chiffres qui roulent jusqu'a leur position.
 *
 * @example
 * <CounterRoll value={12480} className="o-text-4xl o-font-extrabold" />
 *
 * @example
 * // Roulement plus lent, colonnes plus espacees.
 * <CounterRoll value={2026} duration={1400} step={140} />
 */
export function CounterRoll({
  value,
  as: Tag = 'span',
  duration = 900,
  step = 80,
  locale,
  ...rest
}: CounterRollProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>()
  ensureCounterRule()

  const formateur = useMemo(() => new Intl.NumberFormat(locale), [locale])
  const final = formateur.format(value)

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : la valeur est la, formatee, sans une seule pile.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {final}
      </Tag>
    )
  }

  const chars = [...final]
  const digitCount = chars.filter((char) => char >= '0' && char <= '9').length
  let digitIndex = 0

  return (
    <Tag {...rest} ref={ref} className={className} style={style} data-o-roll="">
      {/* La valeur finale, annoncee poliment quand elle change. */}
      <span className="o-sr-only" aria-live="polite">
        {final}
      </span>
      <span aria-hidden>
        {chars.map((char, index) => {
          if (char < '0' || char > '9') {
            return (
              <span key={`sep-${String(index)}`} data-o-roll-sep="">
                {char}
              </span>
            )
          }

          // Le delai croit depuis la droite : la colonne des unites part la
          // premiere, comme sur un compteur mecanique.
          const delay = (digitCount - 1 - digitIndex) * step
          digitIndex += 1

          return (
            <span key={`col-${String(index)}`} data-o-roll-col="">
              <span
                style={
                  {
                    transform: `translateY(${String(vu ? -Number(char) : 0)}em)`,
                    transition: `transform ${String(duration)}ms cubic-bezier(0.2, 0, 0, 1) ${String(delay)}ms`,
                  } as CSSProperties
                }
              >
                {DIGITS.map((digit) => (
                  <span key={digit}>{digit}</span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
