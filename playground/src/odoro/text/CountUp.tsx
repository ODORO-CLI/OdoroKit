/**
 * Compteur : un nombre monte jusqu'a sa valeur, quand il entre dans le champ.
 *
 * ## Le nombre final est toujours dans le DOM
 *
 * Un compteur qui n'ecrirait que sa valeur courante ferait lire « 0 » a un
 * lecteur d'ecran — puis « 12 », puis « 47 », a chaque image. Ce qui est
 * insupportable a l'oreille, et faux au moment ou l'on copie.
 *
 * Le nombre final est donc rendu tel quel, une fois pour toutes. C'est lui qui
 * est annonce, copie, indexe. Les valeurs intermediaires vivent dans un calque
 * `aria-hidden` pose par-dessus, qui n'existe que le temps de l'animation.
 *
 * ## Les chiffres ne doivent pas gigoter
 *
 * Dans la plupart des polices, un « 1 » est plus etroit qu'un « 8 ». Un
 * compteur qui traverse mille valeurs voit donc sa largeur changer a chaque
 * image, et pousse ce qui suit. `font-variant-numeric: tabular-nums` donne a
 * tous les chiffres la meme chasse — c'est exactement ce pour quoi cette
 * fonctionnalite existe.
 *
 * ## Le formatage passe par `Intl`
 *
 * Separer les milliers a la main donne « 1,234 » a un lecteur francais, qui y
 * lit un nombre a virgule. `Intl.NumberFormat` connait la convention de chaque
 * langue, y compris les espaces insecables etroits du francais.
 *
 * ## Une boucle qui s'arrete
 *
 * L'animation tourne sur `requestAnimationFrame` — une valeur en JavaScript
 * n'est pas une propriete CSS, le compositeur ne sait pas l'interpoler. Mais
 * elle dure une seconde et demie, puis s'arrete : ce n'est pas une boucle de
 * rendu, c'est une transition.
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
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Proprietes propres au composant. */
export interface CountUpOwnProps {
  /** Valeur d'arrivee. */
  value: number
  /** Valeur de depart. @defaultValue 0 */
  from?: number
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree de la montee, en millisecondes. @defaultValue 1500 */
  duration?: number
  /** Retard avant le depart, en millisecondes. @defaultValue 0 */
  delay?: number
  /**
   * Langue du formatage.
   *
   * Par defaut, celle du navigateur — et non `fr-FR` en dur : un compteur qui
   * affiche des espaces insecables a un lecteur anglophone a l'air casse.
   */
  locale?: string
  /** Nombre de decimales. @defaultValue 0 */
  decimals?: number
  /** Texte colle avant le nombre. */
  prefix?: string
  /** Texte colle apres le nombre. */
  suffix?: string
  /**
   * Quand partir.
   *
   * @defaultValue 'vue'
   */
  declenchement?: 'vue' | 'montage'
}

/** Toutes les proprietes. */
export type CountUpProps = Customisable<CountUpOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-count-up'

/** Pose les regles du calque, une fois par document. */
function ensureCountUpRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La chasse fixe s'applique aux deux : sans cela, le nombre final n'aurait
    // pas la meme largeur que les valeurs qui defilent au-dessus.
    '[data-o-count-up]{position:relative;font-variant-numeric:tabular-nums}',
    '[data-o-count-up-layer]{position:absolute;inset:0;pointer-events:none}',
    '[data-o-count-up-hidden]{color:transparent}',
  ].join('')
  document.head.append(style)
}

/**
 * Sortie exponentielle : vite, puis de plus en plus lentement.
 *
 * C'est le profil qui donne l'impression que le compteur « arrive » plutot
 * qu'il ne s'arrete. Une progression lineaire se termine sur un coup sec.
 */
function sortieExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)
}

/**
 * Fait monter un nombre jusqu'a sa valeur.
 *
 * @example
 * <CountUp value={12480} suffix=" projets" className="o-text-4xl o-font-bold" />
 *
 * @example
 * // Deux decimales, et un depart qui n'est pas zero.
 * <CountUp value={99.98} from={95} decimals={2} suffix=" %" />
 */
export function CountUp({
  value,
  from = 0,
  as: Tag = 'span',
  duration = 1500,
  delay = 0,
  locale,
  decimals = 0,
  prefix = '',
  suffix = '',
  declenchement = 'vue',
  ...rest
}: CountUpProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: refVue, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  const refCalque = useRef<HTMLSpanElement | null>(null)
  const [anime, setAnime] = useState(false)

  ensureCountUpRule()

  const formateur = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }),
    [locale, decimals],
  )

  const final = `${prefix}${formateur.format(value)}${suffix}`

  useEffect(() => {
    // En mouvement reduit, le nombre est simplement la. C'est d'ailleurs ce
    // qu'on voulait montrer ; l'animation n'etait que la maniere.
    if (reduced || !vu) return

    const calque = refCalque.current
    if (calque === null) return

    let image = 0
    let depart: number | undefined
    setAnime(true)

    const pas = (maintenant: number) => {
      depart ??= maintenant

      const ecoule = maintenant - depart - delay

      if (ecoule < 0) {
        calque.textContent = `${prefix}${formateur.format(from)}${suffix}`
        image = requestAnimationFrame(pas)
        return
      }

      const t = duration <= 0 ? 1 : Math.min(1, ecoule / duration)
      const courant = from + (value - from) * sortieExpo(t)

      calque.textContent = `${prefix}${formateur.format(courant)}${suffix}`

      if (t < 1) {
        image = requestAnimationFrame(pas)
        return
      }

      // Fini : on efface le calque et on rend la main au nombre d'origine,
      // plutot que de laisser une valeur arrondie qui pourrait differer d'une
      // unite peinte par-dessus lui.
      calque.textContent = ''
      setAnime(false)
    }

    image = requestAnimationFrame(pas)

    return () => {
      cancelAnimationFrame(image)
      calque.textContent = ''
      setAnime(false)
    }
  }, [vu, reduced, value, from, duration, delay, formateur, prefix, suffix])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={refVue}
      className={className}
      style={style as CSSProperties}
      data-o-count-up=""
    >
      <span {...(anime ? { 'data-o-count-up-hidden': '' } : {})}>{final}</span>
      {/* Toujours rendu, meme vide : le monter seulement pendant l'animation
          rendrait sa reference nulle au moment ou l'effet la lit, et le
          compteur ne partirait jamais. Un span vide ne coute rien. */}
      <span ref={refCalque} aria-hidden="true" data-o-count-up-layer="" />
    </Tag>
  )
}
