/**
 * Metaballs : des boules de gel qui fusionnent, dont une suit le pointeur.
 *
 * ## Le principe
 *
 * Une somme de champs en r2/d2, seuillee : deux boules qui s'approchent se
 * rejoignent par un col avant de fusionner. Ce qui fait le gel plutot que
 * l'aplat, c'est le gradient du champ pris pour normale — un diffus, un
 * reflet, une lisiere claire la ou la surface se couche.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur, avec amortissement : une boule supplementaire
 * le suit et fusionne avec celles qu'elle croise. A la sortie du cadre, le
 * hook ramene la cible au centre — la boule y revient d'elle-meme.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le composant mute en place un tableau stable
 * passe en uniform, et la surface relit ses uniforms a chaque image. La
 * recopie se fait dans la boucle du moteur, en priorite d'entree.
 *
 * ## Sous mouvement reduit
 *
 * La surface est refusee par le moteur et le repli statique s'affiche.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

import { METABALLS_FRAGMENT } from './metaballs.shader.js'

/** Ce que l'echappatoire recoit. */
export interface MetaballsControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface MetaballsOwnProps {
  /** Vitesse de derive des boules. @defaultValue 0.3 */
  speed?: number
  /** Nombre de boules libres. @defaultValue 7 */
  count?: number
  /** Seuil du champ. Plus bas, plus de matiere. @defaultValue 1 */
  threshold?: number
  /** Force du reflet. @defaultValue 0.7 */
  gloss?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<MetaballsControls>
}

/** Toutes les proprietes. */
export type MetaballsProps = Customisable<MetaballsOwnProps>

/** Tokens employes par defaut : le fond, le gel, le reflet. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-500', '--o-theme-fg'] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-200 dark:o-via-brand-900 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Nombre de boules en qualite basse.
 *
 * Chaque boule se paie trois fois — une somme pour la matiere, deux pour la
 * normale. C'est le seul levier de cout du shader.
 */
const LOW_COUNT = 4

/**
 * Metaballs.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Metaballs className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Metaballs({
  speed = 0.3,
  count = 7,
  threshold = 1,
  gloss = 0.7,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MetaballsProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tableau stable, mute en place : la surface relit les uniforms a chaque
  // image, l'identite ne change pas, la mutation suffit — aucun setState.
  const uPointer = useRef<number[]>([0.5, 0.5]).current

  const pointer = usePointerDamped({ host, speed: 3, name: 'metaballs : pointeur' })

  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        // Du repere du hook (centre, y vers le bas) vers celui de la texture
        // (coin bas-gauche, y vers le haut).
        uPointer[0] = (pointer.current.x + 1) / 2
        uPointer[1] = 1 - (pointer.current.y + 1) / 2
      },
      { priority: CLOCK_PRIORITY.input, name: 'metaballs : pont' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uPointer])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: METABALLS_FRAGMENT,
    colors,
    uniforms: {
      uPointer,
      uSpeed: speed,
      uCount: count,
      uThreshold: threshold,
      uGloss: gloss,
    },
    name: 'metaballs',
    // Le nombre de boules est le seul reglage qui pese : c'est le seul borne.
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, LOW_COUNT) : count,
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
        setShaderHost(element)
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
