/**
 * Champ ASCII : un champ de bruit rendu en caracteres, par densite d'encre.
 *
 * ## Le principe
 *
 * Le champ est echantillonne au centre de chaque cellule, quantifie en dix
 * niveaux, et chaque niveau choisit un caractere de la rampe classique des
 * convertisseurs d'images en texte. De loin un degrade, de pres du texte.
 * Les glyphes sont des masques de bits sur cinq par sept dessines par le
 * shader : aucune police, aucune texture.
 *
 * Ce qui distingue cette entree de `dither` : la densite est portee par
 * des caracteres, pas par une trame ; et de `code-rain` : rien ne tombe,
 * c'est un champ continu qui derive.
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

import { ASCII_FIELD_FRAGMENT } from './ascii-field.shader.js'

/** Ce que l'echappatoire recoit. */
export interface AsciiFieldControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface AsciiFieldOwnProps {
  /** Nombre de caracteres sur la largeur. Borne a deux cents par le shader. @defaultValue 80 */
  cells?: number
  /** Vitesse de derive du champ. @defaultValue 0.25 */
  speed?: number
  /** Echelle du champ. Plus haut, plus de details. @defaultValue 3 */
  scale?: number
  /** Contraste du champ avant quantification. @defaultValue 1.4 */
  contrast?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<AsciiFieldControls>
}

/** Toutes les proprietes. */
export type AsciiFieldProps = Customisable<AsciiFieldOwnProps>

/** Tokens employes par defaut : le fond, l'encre, l'encre des hauts niveaux. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Champ ASCII.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AsciiField className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AsciiField({
  cells = 80,
  speed = 0.25,
  scale = 3,
  contrast = 1.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AsciiFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ASCII_FIELD_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uSpeed: speed, uScale: scale, uContrast: contrast },
    name: 'ascii-field',
    // Des glyphes de cinq pixels de large scintillent a densite de pixels
    // reduite : en qualite basse, les cellules s'elargissent.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 48) : cells,
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
