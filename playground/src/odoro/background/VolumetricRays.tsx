/**
 * Rayons volumetriques : des rais de lumiere integres a travers une brume.
 *
 * ## Le principe
 *
 * Le masque des rais est un bruit de l'angle autour du foyer, mais la lumiere
 * qui atteint un fragment est integree le long du rai par une marche vers le
 * foyer, a travers une brume qui derive. Un banc epais eteint le rai, la
 * brume locale le diffuse. Distinct des rayons plats : les rais ont un volume
 * et se coupent derriere la brume.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli n'est pas une precaution : il est affiche pendant le chargement du
 * backend, quand WebGL manque, quand l'arbitre refuse la surface et sous
 * mouvement reduit.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { VOLUMETRIC_RAYS_FRAGMENT } from './volumetric-rays.shader.js'

/** Ce que l'echappatoire recoit. */
export interface VolumetricRaysControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface VolumetricRaysOwnProps {
  /** Position horizontale du foyer, en fraction du cadre. @defaultValue 0.5 */
  x?: number
  /** Position verticale du foyer, en fraction du cadre. @defaultValue 1 */
  y?: number
  /** Nombre de rais sur le tour. @defaultValue 10 */
  count?: number
  /** Intensite de la lumiere. @defaultValue 1 */
  strength?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<VolumetricRaysControls>
}

/** Toutes les proprietes. */
export type VolumetricRaysProps = Customisable<VolumetricRaysOwnProps>

/** Tokens employes par defaut : le fond, la lumiere, la brume. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-300',
  '--o-palette-orange-500',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-amber-100 dark:o-from-amber-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Pas de la marche hors qualite basse.
 *
 * Chaque pas lit la brume une fois : c'est le seul levier de cout du shader.
 * Douze pas suffisent a integrer sans bandes ; en dessous de cinq, les bancs
 * de brume se hachent.
 */
const SAMPLES = 12

/** Pas de la marche en qualite basse. */
const LOW_SAMPLES = 5

/**
 * Rayons volumetriques.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <VolumetricRays className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function VolumetricRays({
  x = 0.5,
  y = 1,
  count = 10,
  strength = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: VolumetricRaysProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: VOLUMETRIC_RAYS_FRAGMENT,
    colors,
    uniforms: { uX: x, uY: y, uCount: count, uStrength: strength, uSamples: SAMPLES },
    name: 'volumetric-rays',
    degrade: (quality) => ({
      uSamples: quality === 'low' ? LOW_SAMPLES : SAMPLES,
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
