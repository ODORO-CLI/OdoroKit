/**
 * Decodage : le texte se stabilise depuis un brouillage.
 *
 * ## Le texte reste lisible pendant tout l'effet
 *
 * Un brouillage remplace les caracteres affiches par des symboles aleatoires.
 * Rendu tel quel, c'est du bruit : un lecteur d'ecran annonce des suites de
 * signes, et une recherche dans la page ne trouve rien pendant toute la duree
 * de l'animation.
 *
 * Le texte veritable est donc porte par l'element, en `aria-label`, et le
 * brouillage n'existe que dans ce qui est peint. L'effet ne coute alors rien a
 * personne d'autre qu'a l'oeil.
 *
 * ## Pourquoi la boucle du moteur
 *
 * Le brouillage doit changer a la cadence de l'ecran, sans quoi il saccade. Un
 * minuteur a intervalle fixe donnerait un rythme different du rafraichissement
 * et produirait un battement visible. C'est le cas d'ecole d'un effet qui
 * possede la frame.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  useOnReady,
  type Customisable,
  type ReadyCallback,
} from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ElementType,
  type ReactElement,
} from 'react'

/** Ce que l'echappatoire recoit. */
export interface DecodeControls {
  /** Rejoue la sequence depuis le debut. */
  replay(): void
}

/** Ce qui declenche la sequence. */
export type DecodeTrigger = 'mount' | 'view' | 'hover'

/** Proprietes propres au composant. */
export interface DecodeTextOwnProps {
  /** Texte a decoder. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Duree totale de la stabilisation, en millisecondes. @defaultValue 1200 */
  duration?: number
  /** Caracteres employes pour le brouillage. */
  alphabet?: string
  /** Ce qui declenche la sequence. @defaultValue 'view' */
  trigger?: DecodeTrigger
  /** Echappatoire. */
  onReady?: ReadyCallback<DecodeControls>
}

/** Toutes les proprietes. */
export type DecodeTextProps = Customisable<DecodeTextOwnProps, 'span'>

/**
 * Alphabet par defaut.
 *
 * Volontairement sans lettres accentuees ni signes larges : un caractere plus
 * large que celui qu'il remplace ferait respirer la ligne a chaque image, et
 * le texte tremblerait au lieu de se stabiliser.
 */
const DEFAULT_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$?!/\\|<>*+='

/**
 * Revele un texte en le decodant.
 *
 * @example
 * <DecodeText as="h2" className="o-text-4xl o-font-bold">
 *   Odoro
 * </DecodeText>
 *
 * @example
 * // Niveau 5 : rejouer la sequence depuis l exterieur.
 * const rejouer = useRef<(() => void) | null>(null)
 * <DecodeText onReady={({ handle }) => { rejouer.current = handle.replay }}>
 *   Odoro
 * </DecodeText>
 */
export function DecodeText({
  children,
  as: Tag = 'span',
  duration = 1200,
  alphabet = DEFAULT_ALPHABET,
  trigger = 'view',
  onReady,
  ...rest
}: DecodeTextProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const output = useRef<HTMLSpanElement | null>(null)

  const run = useCallback(() => {
    const target = output.current
    if (target === null) return

    // Sous mouvement reduit, le texte est simplement la. L'animation est
    // neutralisee, jamais l'etat final.
    if (reduced) {
      target.textContent = children
      return
    }

    const started = performance.now()
    const letters = [...children]

    const subscription = clock.subscribe(
      () => {
        const ratio = Math.min(1, (performance.now() - started) / duration)
        // Chaque lettre se fige a son tour, de la premiere a la derniere : la
        // progression avance dans le mot, elle ne le stabilise pas d'un bloc.
        const settled = ratio * letters.length

        target.textContent = letters
          .map((letter, index) => {
            if (index < settled) return letter
            if (letter === ' ') return ' '
            return alphabet[Math.floor(Math.random() * alphabet.length)] ?? letter
          })
          .join('')

        if (ratio >= 1) subscription.unsubscribe()
      },
      { name: 'decodage de texte', priority: CLOCK_PRIORITY.default },
    )

    return () => subscription.unsubscribe()
  }, [children, duration, alphabet, reduced])

  useEffect(() => {
    if (host === null) return

    if (trigger === 'mount') return run()

    if (trigger === 'view') {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            run()
            observer.disconnect()
          }
        },
        { threshold: 0.4 },
      )
      observer.observe(host)
      return () => observer.disconnect()
    }

    const onEnter = (): void => void run()
    host.addEventListener('pointerenter', onEnter)
    return () => host.removeEventListener('pointerenter', onEnter)
  }, [host, trigger, run])

  // La poignee est stable : `useOnReady` ne depend que d'elle et de l'element,
  // et un objet neuf a chaque rendu rejouerait l'echappatoire en boucle. Elle
  // lit `run` dans une reference pour rester juste apres un changement de
  // reglage.
  const runRef = useRef(run)
  runRef.current = run
  const controls = useRef<DecodeControls>({ replay: () => void runRef.current() })
  useOnReady(onReady, controls.current, host)

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={setHost}
      className={className}
      style={style}
      // Le brouillage n'existe que pour l'oeil : le texte veritable reste
      // annonce, cherchable et copiable.
      aria-label={children}
    >
      <span ref={output} aria-hidden>
        {children}
      </span>
    </Tag>
  )
}
