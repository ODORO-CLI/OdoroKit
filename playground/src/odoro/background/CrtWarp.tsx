/**
 * Courbure cathodique : un tube bombe, son verre qui decompose la lumiere,
 * sa grille d'ouverture et sa vignette qui respire.
 *
 * ## Le principe
 *
 * Le bombement se lit a l'envers, par une seule formule : les coordonnees
 * centrees, etirees avec le carre de leur distance au centre. Les coins de
 * l'image sortent du cadre et la silhouette devient un coussin. Pres des
 * bords, les deux teintes du signal sont lues a deux positions ecartees.
 *
 * Ce qui distingue cette entree de `scanlines` : pas de lignes
 * horizontales, pas de barre qui roule, pas de grain — une geometrie de
 * tube, une grille verticale et un verre. La vignette ramene vers le fond,
 * jamais vers le noir : un tube eteint est de la couleur du theme.
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

import { CRT_WARP_FRAGMENT } from './crt-warp.shader.js'

/** Ce que l'echappatoire recoit. */
export interface CrtWarpControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface CrtWarpOwnProps {
  /** Bombement du tube. Zero le rend plat. @defaultValue 0.25 */
  curve?: number
  /** Nombre de colonnes de la grille d'ouverture sur la largeur. @defaultValue 160 */
  lines?: number
  /** Ecart des teintes pres des bords. @defaultValue 0.6 */
  aberration?: number
  /** Vitesse du signal. @defaultValue 0.5 */
  speed?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<CrtWarpControls>
}

/** Toutes les proprietes. */
export type CrtWarpProps = Customisable<CrtWarpOwnProps>

/** Tokens employes par defaut : le tube eteint, les deux teintes du signal. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-500',
  '--o-palette-orange-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-teal-100 dark:o-via-teal-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Courbure cathodique.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <CrtWarp className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function CrtWarp({
  curve = 0.25,
  lines = 160,
  aberration = 0.6,
  speed = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: CrtWarpProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: CRT_WARP_FRAGMENT,
    colors,
    uniforms: { uCurve: curve, uLines: lines, uAberration: aberration, uSpeed: speed },
    name: 'crt-warp',
    // Une grille serree scintille a densite de pixels reduite, et l'ecart
    // des teintes y devient un simple flou : en qualite basse, la grille
    // s'espace et l'ecart se coupe.
    degrade: (quality) => ({
      uLines: quality === 'low' ? Math.min(lines, 80) : lines,
      uAberration: quality === 'low' ? 0 : aberration,
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
