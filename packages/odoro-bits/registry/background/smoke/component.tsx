/**
 * Fumee : des volutes advectees par un rotationnel approche, qui montent.
 *
 * ## Le principe
 *
 * Le gradient du bruit, obtenu par lectures decalees, est tourne d un quart de tour : le champ qui en resulte tourbillonne sans jamais se compresser.
 *
 * Le temps n entre que dans le deplacement, jamais dans la couleur : la fumee se deforme au lieu de clignoter.
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

import { SMOKE_FRAGMENT } from './smoke.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SmokeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SmokeOwnProps {
  /** Vitesse du tourbillon. @defaultValue 0.15 */
  speed?: number
  /** Echelle du motif. Plus haut, plus fin. @defaultValue 2 */
  scale?: number
  /** Vitesse de la montee. @defaultValue 0.35 */
  lift?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SmokeControls>
}

/** Toutes les proprietes. */
export type SmokeProps = Customisable<SmokeOwnProps>

/** Tokens employes par defaut : le fond, le corps de la fumee, ses cretes. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-muted', '--o-theme-fg'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Detail du bruit hors qualite basse.
 *
 * Le rotationnel demande quatre lectures du bruit, plus une pour la matiere :
 * chaque octave se paie donc cinq fois. C'est le seul levier de cout du
 * shader, et il n'a pas besoin d'etre une prop pour etre retrograde.
 */
const OCTAVES = 4

/** Detail du bruit en qualite basse. */
const LOW_OCTAVES = 2

/**
 * Fumee.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Smoke className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Smoke({
  speed = 0.15,
  scale = 2,
  lift = 0.35,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SmokeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SMOKE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: scale, uLift: lift, uOctaves: OCTAVES },
    name: 'smoke',
    // Les octaves sont le reglage qui pese — chaque octave se paie cinq fois,
    // quatre pour le rotationnel et une pour la matiere — donc le seul borne.
    degrade: (quality) => ({
      uOctaves: quality === 'low' ? LOW_OCTAVES : OCTAVES,
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
