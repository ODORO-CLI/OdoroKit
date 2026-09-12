/**
 * Glitch : un texte traverse par des rafales de decoupage et d'aberration.
 *
 * ## Des rafales, pas un tremblement continu
 *
 * Un glitch permanent fatigue l'oeil et perd son sens : ce qui casse tout le
 * temps n'est plus une casse, c'est une texture. L'effet vit donc en rafales
 * courtes, espacees d'un intervalle legerement irregulier — un minuteur, pas
 * la boucle : entre deux rafales il ne se passe rien, et une boucle qui tourne
 * pour ne rien faire serait exactement ce que le moteur interdit.
 *
 * ## Deux copies, un original intact
 *
 * L'original reste en place, net. Deux copies posees dessus portent chacune un
 * decalage et une ombre coloree — rouge d'un cote, cyan de l'autre, comme les
 * canaux d'un signal mal synchronise — et un `clip-path` anime qui n'en montre
 * que des tranches changeantes. Les copies sont `aria-hidden` : pour un
 * lecteur d'ecran, il n'y a qu'un texte, jamais trois.
 *
 * Sous mouvement reduit, les copies ne sont pas rendues du tout : le texte
 * est simplement la.
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

/** Proprietes propres au composant. */
export interface GlitchTextOwnProps {
  /** Texte a casser. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Amplitude du decalage des copies, en pixels. @defaultValue 3 */
  intensity?: number
  /**
   * Temps moyen entre deux rafales, en millisecondes. L'intervalle reel varie
   * autour de cette valeur, pour que la casse ne devienne pas un metronome.
   *
   * @defaultValue 2600
   */
  interval?: number
  /** Couleur du premier canal. @defaultValue rouge de la palette */
  channelA?: string
  /** Couleur du second canal. @defaultValue cyan de la palette */
  channelB?: string
}

/** Toutes les proprietes. */
export type GlitchTextProps = Customisable<GlitchTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glitch-text'

/** Duree d'une rafale, en millisecondes. */
const BURST_MS = 380

/**
 * Pose les regles du glitch, une fois par document.
 *
 * Les copies n'existent visuellement que pendant une rafale : au repos elles
 * sont en opacite nulle, et le compositeur n'a rien a peindre.
 */
function ensureGlitchRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-glitch]{position:relative;display:inline-block}',
    '[data-o-glitch-copy]{',
    'position:absolute;inset:0;opacity:0;pointer-events:none;user-select:none;',
    '}',
    // Les tranches montrees par le clip-path changent par paliers : un glitch
    // qui glisse en douceur n'est pas un glitch, c'est un rideau.
    '@keyframes o-glitch-a{',
    '0%{clip-path:inset(12% 0 61% 0)}25%{clip-path:inset(48% 0 20% 0)}',
    '50%{clip-path:inset(80% 0 4% 0)}75%{clip-path:inset(4% 0 78% 0)}',
    '100%{clip-path:inset(38% 0 42% 0)}',
    '}',
    '@keyframes o-glitch-b{',
    '0%{clip-path:inset(68% 0 8% 0)}25%{clip-path:inset(8% 0 72% 0)}',
    '50%{clip-path:inset(32% 0 48% 0)}75%{clip-path:inset(58% 0 16% 0)}',
    '100%{clip-path:inset(16% 0 60% 0)}',
    '}',
    '[data-o-glitch-on] [data-o-glitch-copy="a"]{',
    'opacity:1;',
    'transform:translate(calc(var(--o-glitch-shift) * -1),0);',
    'text-shadow:calc(var(--o-glitch-shift) * -0.6) 0 var(--o-glitch-a);',
    `animation:o-glitch-a ${String(BURST_MS)}ms steps(5,jump-none) both;`,
    '}',
    '[data-o-glitch-on] [data-o-glitch-copy="b"]{',
    'opacity:1;',
    'transform:translate(var(--o-glitch-shift),0);',
    'text-shadow:calc(var(--o-glitch-shift) * 0.6) 0 var(--o-glitch-b);',
    `animation:o-glitch-b ${String(BURST_MS)}ms steps(5,jump-none) both;`,
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Casse un texte par rafales, entre lesquelles il reste parfaitement net.
 *
 * @example
 * <GlitchText as="h1" className="o-text-5xl o-font-extrabold">
 *   SIGNAL PERDU
 * </GlitchText>
 *
 * @example
 * // Rafales plus rares et plus discretes.
 * <GlitchText intensity={2} interval={5000}>Odoro</GlitchText>
 */
export function GlitchText({
  children,
  as: Tag = 'span',
  intensity = 3,
  interval = 2600,
  channelA = 'var(--o-palette-red-500)',
  channelB = 'var(--o-palette-cyan-400)',
  ...rest
}: GlitchTextProps): ReactElement {
  const { reduced } = useMotionState()
  const [burst, setBurst] = useState(false)
  ensureGlitchRule()

  useEffect(() => {
    if (reduced) return

    let timer: ReturnType<typeof setTimeout>

    const schedule = (): void => {
      // L'intervalle varie de moitie autour de la consigne : assez pour que
      // l'oreille interne n'y trouve pas de rythme, pas assez pour que deux
      // rafales se collent.
      const wait = interval * (0.75 + Math.random() * 0.5)
      timer = setTimeout(() => {
        setBurst(true)
        timer = setTimeout(() => {
          setBurst(false)
          schedule()
        }, BURST_MS)
      }, wait)
    }

    schedule()
    return () => clearTimeout(timer)
  }, [reduced, interval])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte, rien d'autre. Les copies n'apportaient que
  // le geste, et le geste est ce qu'on nous demande d'omettre.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const glitchStyle = {
    ...style,
    '--o-glitch-shift': `${String(intensity)}px`,
    '--o-glitch-a': channelA,
    '--o-glitch-b': channelB,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={glitchStyle}
      data-o-glitch=""
      {...(burst ? { 'data-o-glitch-on': '' } : {})}
    >
      {children}
      <span aria-hidden data-o-glitch-copy="a">
        {children}
      </span>
      <span aria-hidden data-o-glitch-copy="b">
        {children}
      </span>
    </Tag>
  )
}
