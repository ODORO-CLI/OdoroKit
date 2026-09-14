/**
 * Sismographe : des traces horizontales sur un papier qui defile, qui tressaillent au clic.
 *
 * ## A quoi ce fond reagit
 *
 * Au clic — ou au toucher — sur le cadre : chaque appui pose un stylet a son
 * abscisse et date une secousse dans un tampon circulaire de huit
 * emplacements. La secousse s'ecrit sur le papier au passage du stylet et
 * s'eloigne avec lui vers la gauche, plus forte sur les traces a la hauteur
 * du clic. Le deplacement du pointeur, lui, ne change rien.
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
 * shader, sans quoi la position de la secousse sur le papier serait fausse.
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

import { SEISMOGRAPH_FRAGMENT } from './seismograph.shader.js'

/** Ce que l'echappatoire recoit. */
export interface SeismographControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface SeismographOwnProps {
  /** Nombre de traces. Borne a huit par le shader. @defaultValue 5 */
  traces?: number
  /** Vitesse du papier, en largeurs de cadre par seconde. @defaultValue 0.12 */
  scroll?: number
  /** Vitesse d'amortissement des secousses. @defaultValue 1.5 */
  decay?: number
  /** Force des secousses. @defaultValue 1 */
  amplitude?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<SeismographControls>
}

/** Toutes les proprietes. */
export type SeismographProps = Customisable<SeismographOwnProps>

/** Tokens employes par defaut : le papier, l'encre, l'encre fraiche. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Repli par defaut : une teinte figee, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/** Nombre de secousses vivantes a la fois. */
const SLOTS = 8

/**
 * Nombre de traces en qualite basse.
 *
 * Chaque fragment evalue trois fois sa trace — la pente vient d'une
 * difference finie — et chaque evaluation parcourt les huit clics. Le nombre
 * de traces ne change rien a ce compte ; mais des traces serrees, a densite
 * de pixels reduite, scintillent. Moins de traces, plus d'espace.
 */
const LOW_TRACES = 3

/**
 * Sismographe.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Seismograph className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Seismograph({
  traces = 5,
  scroll = 0.12,
  decay = 1.5,
  amplitude = 1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: SeismographProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : huit fois (x, y, temps de depart). Un
  // depart a -1000 donne un age enorme, donc une secousse eteinte d'office.
  const uClicks = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Le temps de l'horloge du moteur — le meme que uTime du shader. C'est lui
  // qui date les clics ; performance.now() donnerait une autre origine.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'seismograph : horloge' },
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

  const {
    ref,
    setHost: setShaderHost,
    ready,
    refused,
    colours,
  } = useTokenShader<HTMLDivElement>({
    fragment: SEISMOGRAPH_FRAGMENT,
    colors,
    uniforms: {
      uClicks,
      uTraces: traces,
      uScroll: scroll,
      uDecay: decay,
      uAmplitude: amplitude,
    },
    name: 'seismograph',
    degrade: (quality) => ({
      uTraces: quality === 'low' ? Math.min(traces, LOW_TRACES) : traces,
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
