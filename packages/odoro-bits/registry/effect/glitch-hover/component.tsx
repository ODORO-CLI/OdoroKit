/**
 * Glitch au survol : le contenu part en tranches decalees, brievement.
 *
 * ## Deux copies, animees hors de l'etat React
 *
 * Le contenu est rendu trois fois : l'original, intact, et deux copies
 * superposees, invisibles au repos et muettes aux lecteurs d'ecran. La rafale
 * est une animation Web Animations sur chaque copie : une suite de tranches
 * `clip-path` decalees en translation, chaque etape en `step-end` — le glitch
 * est fait de sauts, pas de glissements. Rien ne passe par un rendu React :
 * la rafale part, se termine, et les copies redeviennent invisibles
 * d'elles-memes puisque l'animation ne remplit pas.
 *
 * ## L'aberration coloree
 *
 * Chaque copie porte une ombre portee teintee d'un cote — l'une chaude,
 * l'autre froide, lues dans la palette. C'est l'ecart entre les deux qui
 * fabrique la frange chromatique des ecrans mal calibres, sans dedoubler le
 * contenu une troisieme fois.
 *
 * Le tirage des tranches a lieu au declenchement, cote client : chaque rafale
 * est differente, et aucun hasard ne traverse le rendu initial.
 *
 * Sous mouvement reduit, les copies ne sont pas rendues et rien n'ecoute le
 * survol : la zone est statique.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface GlitchHoverOwnProps {
  /** Contenu qui part en glitch. */
  children: ReactNode
  /** Amplitude du decalage des tranches, en pixels. @defaultValue 6 */
  intensity?: number
  /** Nombre de tranches par copie. @defaultValue 3 */
  slices?: number
}

/** Toutes les proprietes. */
export type GlitchHoverProps = Customisable<GlitchHoverOwnProps>

/** Duree d'une rafale : courte, c'est ce qui la rend credible. */
const BURST = 400

/** Style commun aux deux copies : posees sur l'original, muettes, invisibles. */
const COPY_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0,
}

/**
 * Fabrique la suite de tranches d'une copie.
 *
 * @param direction Cote du decalage, +1 ou -1 : les deux copies partent en
 * sens opposes, c'est leur croisement qui se lit comme un glitch.
 */
function makeBurst(direction: 1 | -1, intensity: number, slices: number): Keyframe[] {
  const frames: Keyframe[] = [
    { clipPath: 'inset(0 0 100% 0)', transform: 'translateX(0)', opacity: 0, easing: 'step-end' },
  ]

  const steps = Math.max(2, Math.round(slices)) * 2
  for (let index = 0; index < steps; index += 1) {
    const top = Math.random() * 82
    const height = 5 + Math.random() * 14
    const offset = direction * (0.4 + Math.random() * 0.6) * intensity
    frames.push({
      clipPath: `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - height).toFixed(1)}% 0)`,
      transform: `translateX(${offset.toFixed(1)}px)`,
      opacity: 0.9,
      easing: 'step-end',
    })
  }

  frames.push({ clipPath: 'inset(0 0 100% 0)', transform: 'translateX(0)', opacity: 0 })
  return frames
}

/**
 * Fait glitcher sa zone au survol et au focus.
 *
 * Poser les marges internes sur le contenu plutot que sur l'enveloppe : les
 * copies se calent sur la boite de l'enveloppe, et un padding sur celle-ci
 * les decalerait de l'original.
 *
 * @example
 * <GlitchHover className="o-inline-block">
 *   <div className="o-rounded-xl o-border-w-1 o-p-6">Vignette</div>
 * </GlitchHover>
 *
 * @example
 * // Une rafale plus violente, en six tranches.
 * <GlitchHover intensity={12} slices={6}>
 *   <img src={cover} alt="Pochette" />
 * </GlitchHover>
 */
export function GlitchHover({
  children,
  intensity = 6,
  slices = 3,
  ...rest
}: GlitchHoverProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const warm = useRef<HTMLDivElement | null>(null)
  const cold = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    let running = 0

    const trigger = (): void => {
      // Une rafale a la fois : relancer pendant le vol hacherait la fin de
      // la precedente sans rien ajouter.
      if (running > 0) return

      const copies: readonly [HTMLDivElement | null, 1 | -1][] = [
        [warm.current, 1],
        [cold.current, -1],
      ]
      for (const [copy, direction] of copies) {
        if (copy === null) continue
        running += 1
        const animation = copy.animate(makeBurst(direction, intensity, slices), {
          duration: BURST,
          fill: 'none',
        })
        animation.onfinish = () => {
          running -= 1
        }
        animation.oncancel = () => {
          running -= 1
        }
      }
    }

    // `focusin` remonte depuis les enfants focusables : un bouton dans la
    // zone declenche la rafale au clavier aussi.
    host.addEventListener('pointerenter', trigger)
    host.addEventListener('focusin', trigger)
    return () => {
      host.removeEventListener('pointerenter', trigger)
      host.removeEventListener('focusin', trigger)
    }
  }, [host, reduced, intensity, slices])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} ref={setHost} className={className} style={{ position: 'relative', ...style }}>
      {children}
      {/* Sous mouvement reduit, les copies n'existent pas : rien a animer,
          rien a superposer. */}
      {reduced ? null : (
        <>
          <div
            aria-hidden
            ref={warm}
            style={{
              ...COPY_STYLE,
              filter: 'drop-shadow(1px 0 0 var(--o-palette-red-400, currentColor))',
            }}
          >
            {children}
          </div>
          <div
            aria-hidden
            ref={cold}
            style={{
              ...COPY_STYLE,
              filter: 'drop-shadow(-1px 0 0 var(--o-palette-cyan-400, currentColor))',
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}
