/**
 * Nappe : trois taches de couleur qui derivent et se melangent.
 *
 * ## Ce que ce composant apporte, et ce qu'il delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur — les recopier ici en ferait autant
 * de versions a maintenir qu'il y a de fonds.
 *
 * ## Le repli n'est pas une precaution
 *
 * C'est la moitie du composant. Il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface — il n'en
 * accorde qu'une par backend — et sous mouvement reduit, ou un fond anime
 * n'apporte rien d'autre que son mouvement.
 *
 * @module
 */

import {
  MESH_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface MeshControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MeshOwnProps {
  /** Vitesse de derive des taches. @defaultValue 0.2 */
  speed?: number
  /** Etendue des taches. @defaultValue 0.55 */
  spread?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MeshControls>
}

/** Toutes les proprietes. */
export type MeshProps = Customisable<MeshOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-zinc-950',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-brand-800 o-via-fuchsia-800 o-to-zinc-950'

/**
 * Nappe : trois taches de couleur qui derivent et se melangent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Mesh className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Mesh({
  speed = 0.2,
  spread = 0.55,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MeshProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MESH_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: spread },
    name: 'nappe',
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
