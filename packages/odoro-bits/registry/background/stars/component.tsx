/**
 * Etoiles : un semis a trois profondeurs, qui derive en parallaxe.
 *
 * ## Le principe
 *
 * Une etoile par cellule d une grille, sa position tiree de l identifiant de la cellule : aucune liste n est parcourue.
 *
 * Le scintillement est un sinus de phase propre a chaque etoile, jamais un tirage par image — ce dernier ne produirait que du bruit.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur — les recopier ici en ferait autant
 * de versions a maintenir qu'il y a de fonds.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface — il n'en
 * accorde qu'une par backend — et sous mouvement reduit.
 *
 * @module
 */

import {
  STARS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface StarsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface StarsOwnProps {
  /** Vitesse de la derive. @defaultValue 0.5 */
  speed?: number
  /** Densite du semis. @defaultValue 24 */
  density?: number
  /** Force du scintillement. @defaultValue 0.6 */
  twinkle?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<StarsControls>
}

/** Toutes les proprietes. */
export type StarsProps = Customisable<StarsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = ['--o-palette-zinc-950', '--o-palette-zinc-100'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Etoiles.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Stars className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Stars({
  speed = 0.5,
  density = 24,
  twinkle = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: StarsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: STARS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uTwinkle: twinkle },
    name: 'stars',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, ref.current)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {ready && refused === undefined ? null : (
        <div className={`o-absolute o-inset-0 ${fallback}`} />
      )}
    </div>
  )
}
