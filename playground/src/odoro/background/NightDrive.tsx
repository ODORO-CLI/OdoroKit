/**
 * Route de nuit : deux lignes qui convergent vers l'horizon, un axe en
 * tirets qui defile, et des lampadaires qui approchent et passent.
 *
 * ## Le principe
 *
 * Le sol est projete sans camera : la profondeur vaut l'inverse de la
 * distance a l'horizon. Les lampadaires sont une file bornee dont chaque
 * membre avance le long de la route ; leur halo, leur mat et leur flaque au
 * sol sont projetes de la meme maniere. Les lampes sont melangees vers leur
 * couleur, jamais additionnees : elles restent visibles sur un fond clair.
 *
 * Ce qui distingue cette entree de `tunnel` et de `hyperspace` : on ne fuit
 * pas vers un point, on roule sur un sol, avec un horizon et un ciel.
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
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { NIGHT_DRIVE_FRAGMENT } from './night-drive.shader.js'

/** Ce que l'echappatoire recoit. */
export interface NightDriveControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface NightDriveOwnProps {
  /** Vitesse de la route. @defaultValue 1 */
  speed?: number
  /** Demi-largeur de la route, en unites du monde. @defaultValue 1 */
  width?: number
  /** Nombre de lampadaires par cote. Borne a douze par le shader. @defaultValue 8 */
  lamps?: number
  /** Hauteur des lampadaires, en unites du monde. @defaultValue 0.8 */
  height?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<NightDriveControls>
}

/** Toutes les proprietes. */
export type NightDriveProps = Customisable<NightDriveOwnProps>

/** Tokens employes par defaut : le fond, les lignes et les mats, les lampes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-amber-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-amber-100 dark:o-to-amber-950'

/** Lampadaires par cote en qualite basse : la file est le seul cout qui compte. */
const LOW_LAMPS = 5

/**
 * Route de nuit.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <NightDrive className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function NightDrive({
  speed = 1,
  width = 1,
  lamps = 8,
  height = 0.8,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: NightDriveProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: NIGHT_DRIVE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uWidth: width, uLamps: lamps, uHeight: height },
    name: 'night-drive',
    // Chaque lampadaire coute deux halos et une flaque par fragment : la
    // file est le seul levier, et elle se raccourcit en qualite basse.
    degrade: (quality) => ({
      uLamps: quality === 'low' ? Math.min(lamps, LOW_LAMPS) : lamps,
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
