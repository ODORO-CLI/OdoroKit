/**
 * Ondes de clic : chaque clic emet un anneau qui se propage et s'amortit.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — sur le cadre : chaque appui date une onde dans un
 * tampon circulaire de huit emplacements, et l'anneau se propage depuis le
 * point exact de l'appui. Le deplacement du pointeur, lui, ne change rien.
 *
 * ## Le pont clic → shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de vingt-
 * quatre flottants (huit fois x, y, temps de depart), mute en place a chaque
 * clic. La surface relit ses uniforms a chaque image, l'identite du tableau ne
 * change pas — la mutation suffit.
 *
 * Le temps ecrit dans le tampon est celui de l'horloge du moteur, memorise par
 * une souscription en priorite d'entree : c'est le meme temps que `uTime` du
 * shader, sans quoi l'age des clics serait faux.
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

import { CLICK_WAVES_FRAGMENT } from './click-waves.shader.js'

/** Ce que l'echappatoire recoit. */
export interface ClickWavesControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface ClickWavesOwnProps {
  /** Vitesse de propagation des anneaux. @defaultValue 0.45 */
  speed?: number
  /** Largeur d'onde des anneaux. @defaultValue 0.09 */
  width?: number
  /** Vitesse d'extinction des ondes. @defaultValue 1.2 */
  decay?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<ClickWavesControls>
}

/** Toutes les proprietes. */
export type ClickWavesProps = Customisable<ClickWavesOwnProps>

/** Tokens employes par defaut : le fond, la surface, l'eclat des cretes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-sky-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-sky-950 o-to-cyan-950'

/** Nombre de clics vivants a la fois. */
const SLOTS = 8

/**
 * Ondes de clic.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ClickWaves className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ClickWaves({
  speed = 0.45,
  width = 0.09,
  decay = 1.2,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ClickWavesProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : huit fois (x, y, temps de depart). Un
  // depart a -1000 donne un age enorme, donc une onde inerte d'office.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Le temps de l'horloge du moteur — le meme que uTime du shader. C'est lui
  // qui date les clics ; performance.now() donnerait une autre origine.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'click-waves : horloge' },
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
        uClicks[i * 3] = uClicks[(i - 1) * 3] ?? -1000
        uClicks[i * 3 + 1] = uClicks[(i - 1) * 3 + 1] ?? -1000
        uClicks[i * 3 + 2] = uClicks[(i - 1) * 3 + 2] ?? -1000
      }
      uClicks[0] = x
      uClicks[1] = y
      uClicks[2] = lastTime.current
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host, uClicks])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: CLICK_WAVES_FRAGMENT,
      colors,
      uniforms: { uClicks, uSpeed: speed, uWidth: width, uDecay: decay },
      name: 'click-waves',
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
