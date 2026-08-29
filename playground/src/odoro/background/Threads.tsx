/**
 * Fils : un faisceau de courbes fines, d epaisseur constante sur toute leur longueur.
 *
 * ## Le principe
 *
 * Chaque fil est un y = f(x) ; le fragment compare son propre y a celui du fil. Aucun trace n existe.
 *
 * La division par la pente n est pas un detail : sans elle, le fil parait epais la ou il est plat et fin la ou il monte.
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
  THREADS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface ThreadsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ThreadsOwnProps {
  /** Vitesse de l ondulation. @defaultValue 0.3 */
  speed?: number
  /** Nombre de fils. Borne a douze par le shader. @defaultValue 7 */
  count?: number
  /** Epaisseur des fils. @defaultValue 0.004 */
  thickness?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ThreadsControls>
}

/** Toutes les proprietes. */
export type ThreadsProps = Customisable<ThreadsOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-emerald-300',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-950'

/**
 * Fils.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Threads className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Threads({
  speed = 0.3,
  count = 7,
  thickness = 0.004,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ThreadsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: THREADS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: count, uThickness: thickness },
    name: 'threads',
    // En qualite basse, le reglage qui pese est borne : le motif reste
    // reconnaissable une fois reduit.
    degrade: (quality) => ({
      uScale:
        quality === 'low' ? Math.min(count, 4) : count,
    }),
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
