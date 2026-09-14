/**
 * Encre : chaque clic etend un disque de la couleur suivante sur tout le cadre.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — sur le cadre : un disque de la couleur suivante
 * s'etend depuis le point exact de l'appui jusqu'a recouvrir le cadre, bord
 * adouci, le plus recent par-dessus. Le fond change ainsi de couleur par
 * vagues, en cyclant sur les trois couleurs. Le deplacement du pointeur, lui,
 * ne change rien.
 *
 * ## Le pont clic → shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de seize
 * flottants (quatre fois x, y, temps de depart, index de couleur), mute en
 * place a chaque clic. La surface relit ses uniforms a chaque image — la
 * mutation suffit.
 *
 * Le temps ecrit dans le tampon est celui de l'horloge du moteur, memorise par
 * une souscription en priorite d'entree : c'est le meme temps que `uTime` du
 * shader, sans quoi le rayon des disques serait faux.
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

import { INK_FRAGMENT } from './ink.shader.js'

/** Ce que l'echappatoire recoit. */
export interface InkControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface InkOwnProps {
  /** Vitesse d'extension des disques. @defaultValue 0.7 */
  speed?: number
  /** Largeur du bord adouci. @defaultValue 0.12 */
  feather?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<InkControls>
}

/** Toutes les proprietes. */
export type InkProps = Customisable<InkOwnProps>

/** Tokens employes par defaut : les trois encres, en cycle. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-fuchsia-500',
  '--o-palette-cyan-400',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-fuchsia-950'

/** Nombre de vagues vivantes a la fois. */
const SLOTS = 4

/**
 * Encre.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ink className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ink({
  speed = 0.7,
  feather = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: InkProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : quatre fois (x, y, temps de depart, index
  // de couleur). Un depart a -1000 est ecarte d'office par le shader.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 4 }, () => -1000)).current

  // La prochaine encre du cycle : chaque clic prend la couleur suivante.
  const nextColour = useRef(1)

  // Le temps de l'horloge du moteur — le meme que uTime du shader.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'ink : horloge' },
    )
    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const bounds = host.getBoundingClientRect()
      const x = (event.clientX - bounds.left) / Math.max(bounds.width, 1)
      // vUv a son origine en bas : l'axe vertical de l'ecran est inverse.
      const y = 1 - (event.clientY - bounds.top) / Math.max(bounds.height, 1)

      // Tampon circulaire : tout se decale d'un cran, le nouveau clic en tete.
      for (let i = SLOTS - 1; i > 0; i -= 1) {
        uClicks[i * 4] = uClicks[(i - 1) * 4] ?? -1000
        uClicks[i * 4 + 1] = uClicks[(i - 1) * 4 + 1] ?? -1000
        uClicks[i * 4 + 2] = uClicks[(i - 1) * 4 + 2] ?? -1000
        uClicks[i * 4 + 3] = uClicks[(i - 1) * 4 + 3] ?? -1000
      }
      uClicks[0] = x
      uClicks[1] = y
      uClicks[2] = lastTime.current
      uClicks[3] = nextColour.current

      nextColour.current = (nextColour.current + 1) % 3
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host, uClicks])

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: INK_FRAGMENT,
    colors,
    uniforms: { uClicks, uSpeed: speed, uFeather: feather },
    name: 'ink',
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
