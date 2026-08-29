/**
 * Fond anime : bruit fractal a deplacement de domaine.
 *
 * ## Les couleurs viennent de la palette
 *
 * C'est la difference entre un fond qui appartient au projet et un fond qui
 * lui est juxtapose. Un fond dont les couleurs sont ecrites en dur reste seul
 * de son espece le jour ou la charte change, et il faut alors rouvrir le
 * shader pour y corriger trois vecteurs.
 *
 * La conversion n'est pas gratuite : la palette est en OKLCH, un shader veut
 * trois flottants, et aucune API du navigateur ne fait le pont. Le moteur s'en
 * charge — c'est ce que `readTokenColour` existe pour faire.
 *
 * Les couleurs sont relues quand le theme change. Un fond fige en clair au
 * milieu d'une page passee en sombre serait le meme defaut, un cran plus loin.
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
  AURORA_FRAGMENT,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  useShaderSurface,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from 'odoro-engine'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

/** Ce que l'echappatoire recoit. */
export interface AuroraControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface AuroraOwnProps {
  /** Vitesse de derive du motif. @defaultValue 0.12 */
  speed?: number
  /** Echelle du bruit. Plus haut, plus fin. @defaultValue 2.4 */
  scale?: number
  /** Nombre d'octaves. @defaultValue 4 */
  octaves?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly [string, string, string]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<AuroraControls>
}

/** Toutes les proprietes. */
export type AuroraProps = Customisable<AuroraOwnProps>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-fuchsia-600',
  '--o-palette-zinc-50',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400'

/**
 * Nombre d'octaves en qualite basse.
 *
 * Chaque octave est une evaluation de bruit de plus par pixel. En diviser le
 * nombre par deux est le reglage le plus rentable : le motif reste reconnaissable
 * la ou la cadence, elle, double.
 */
const LOW_OCTAVES = 2

/**
 * Fond anime plein cadre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Aurora className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 *
 * @example
 * // Les couleurs suivent la palette : trois tokens, pas trois valeurs.
 * <Aurora colors={['--o-palette-red-600', '--o-palette-amber-600', '--o-palette-zinc-900']} />
 */
export function Aurora({
  speed = 0.12,
  scale = 2.4,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AuroraProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  // Les couleurs sont relues quand l'hote change, quand les tokens demandes
  // changent, et quand le theme bascule — ce dernier cas passe par la
  // politique de mouvement, qui se renouvelle a chaque changement d'etat.
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  useEffect(() => {
    if (host === null) return
    setColours(colors.map((token) => readTokenColour(token, host)))
  }, [host, colors, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = colours
    if (a === undefined || b === undefined || c === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorC: c,
      uSpeed: speed,
      uScale: scale,
      uOctaves: quality === 'low' ? LOW_OCTAVES : octaves,
    }
  }, [colours, speed, scale, octaves, quality])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    // Le shader n'est monte qu'une fois les couleurs lues : le construire avec
    // des uniformes vides afficherait une image noire avant la premiere
    // correction, ce que le repli couvre deja mieux.
    uniforms: uniforms ?? {},
    name: 'aurore',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

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
      {showFallback ? <div className={`o-absolute o-inset-0 ${fallback}`} /> : null}
    </div>
  )
}
