/**
 * Champ de vent : des traits courts orientes par le vent, que des rafales
 * traversent.
 *
 * ## Le principe
 *
 * Une grille de cellules, un trait par cellule : sa direction est celle du
 * vent, sa longueur la force du vent. Le vent est un cap dominant devie par
 * un bruit lent, et des rafales — des bandes qui avancent dans le sens du
 * cap — allongent les traits et changent leur teinte au passage. C'est le
 * releve d'une station meteo, mis en mouvement.
 *
 * Ce qui distingue cette entree de `flow-field` : la-bas des particules
 * courent le long du champ ; ici rien ne se deplace, les traits restent a
 * leur place et ne font que tourner et s'allonger.
 *
 * ## Ce que ce composant delegue
 *
 * Il ne porte que ce qui le distingue : son shader, ses reglages et son repli.
 * La lecture des tokens, leur conversion en flottants et leur relecture au
 * changement de theme viennent du moteur.
 *
 * Le repli est affiche pendant le chargement du backend, quand WebGL manque,
 * quand l'arbitre refuse la surface et sous mouvement reduit.
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

import { WIND_FIELD_FRAGMENT } from './wind-field.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WindFieldControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface WindFieldOwnProps {
  /** Nombre de cellules par hauteur de cadre. @defaultValue 22 */
  cells?: number
  /** Frequence du bruit, donc la taille des tourbillons. @defaultValue 1.6 */
  scale?: number
  /** Vitesse d'evolution du vent et de passage des rafales. @defaultValue 1 */
  speed?: number
  /** Force des rafales. @defaultValue 0.7 */
  gusts?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WindFieldControls>
}

/** Toutes les proprietes. */
export type WindFieldProps = Customisable<WindFieldOwnProps>

/** Tokens employes par defaut : le fond, les traits au calme, la rafale. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-emerald-400',
] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Champ de vent.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <WindField className="o-absolute o-inset-0" gusts={1} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function WindField({
  cells = 22,
  scale = 1.6,
  speed = 1,
  gusts = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WindFieldProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: WIND_FIELD_FRAGMENT,
    colors,
    uniforms: { uCells: cells, uScale: scale, uSpeed: speed, uGusts: gusts },
    name: 'wind-field',
    // Neuf cellules par pixel quel que soit le reglage : ce n'est pas la
    // boucle qui pese mais les traits fins, qui scintillent a densite de
    // pixels reduite. En qualite basse, les cellules s'elargissent.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 14) : cells,
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
