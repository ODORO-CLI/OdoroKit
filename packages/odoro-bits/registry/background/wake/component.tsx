/**
 * Sillage : le curseur laisse une trainee lumineuse qui s'eteint.
 *
 * ## A quoi ce fond reagit
 *
 * Au deplacement du pointeur : la boucle du moteur echantillonne sa position
 * — une toutes les 40 ms environ, et seulement s'il a bouge d'un seuil — dans
 * un tampon circulaire de seize depots dates. Chaque depot est un halo qui
 * s'eteint avec l'age : la trainee suit le geste et s'efface derriere lui.
 *
 * L'amortissement du pointeur est volontairement sec (vitesse 9) : trop
 * amorti, le sillage tracerait la version lissee du geste, pas le geste.
 *
 * ## Le pont pointeur → shader
 *
 * Aucun rendu React par image : le tampon est un tableau stable de quarante-
 * huit flottants (seize fois x, y, temps de depot), mute en place dans la
 * souscription d'horloge. La surface relit ses uniforms a chaque image — la
 * mutation suffit. Les depots sont dates avec le temps de l'horloge du moteur,
 * le meme que `uTime` du shader.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import { WAKE_FRAGMENT } from './wake.shader.js'

/** Ce que l'echappatoire recoit. */
export interface WakeControls {
  /** Couleurs effectivement transmises au shader. */
  readonly colours: readonly ShaderColour[]
  /** Motif du refus, s'il y en a un. */
  readonly refused: string | undefined
}

/** Proprietes propres au composant. */
export interface WakeOwnProps {
  /** Duree de vie d'un depot, en secondes. @defaultValue 1.2 */
  life?: number
  /** Rayon des halos de la trainee. @defaultValue 0.08 */
  size?: number
  /** Tokens dont les couleurs sont lues. */
  colors?: readonly string[]
  /** Classes du repli. */
  fallback?: string
  /** Echappatoire. */
  onReady?: ReadyCallback<WakeControls>
}

/** Toutes les proprietes. */
export type WakeProps = Customisable<WakeOwnProps>

/** Tokens employes par defaut : le fond, la trainee, son coeur frais. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-emerald-200',
] as const

/** Repli par defaut : un degrade fige, dans les memes tons. */
const DEFAULT_FALLBACK = 'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-950'

/** Nombre de depots vivants a la fois. */
const SLOTS = 16

/** Intervalle minimal entre deux depots, en secondes. */
const DEPOSIT_EVERY = 0.04

/** Deplacement minimal entre deux depots, en coordonnees de texture. */
const DEPOSIT_THRESHOLD = 0.012

/**
 * Sillage.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Wake className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Wake({
  life = 1.2,
  size = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: WakeProps): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // Tampon stable, mute en place : seize fois (x, y, temps de depot). Un
  // depot a -1000 donne un age enorme, donc un halo inerte d'office.
  const uTrail = useRef<number[]>(Array.from({ length: SLOTS * 3 }, () => -1000)).current

  // Vitesse 9 : presque le pointeur brut. Un amortissement lent tracerait la
  // version lissee du geste, et le sillage ne suivrait pas vraiment.
  const pointer = usePointerDamped({ host, speed: 9, name: 'wake : pointeur' })

  useEffect(() => {
    let lastDeposit = -1000
    let lastX = 0.5
    let lastY = 0.5

    const subscription = clock.subscribe(
      ({ time }) => {
        const x = (pointer.current.x + 1) / 2
        const y = 1 - (pointer.current.y + 1) / 2

        // Un depot par intervalle, et seulement si le pointeur a bouge : au
        // repos, la trainee s'eteint au lieu de s'entasser sur place.
        if (time - lastDeposit < DEPOSIT_EVERY) return
        const moved = Math.hypot(x - lastX, y - lastY)
        if (moved < DEPOSIT_THRESHOLD) return

        for (let i = SLOTS - 1; i > 0; i -= 1) {
          uTrail[i * 3] = uTrail[(i - 1) * 3] ?? -1000
          uTrail[i * 3 + 1] = uTrail[(i - 1) * 3 + 1] ?? -1000
          uTrail[i * 3 + 2] = uTrail[(i - 1) * 3 + 2] ?? -1000
        }
        uTrail[0] = x
        uTrail[1] = y
        uTrail[2] = time

        lastDeposit = time
        lastX = x
        lastY = y
      },
      { priority: CLOCK_PRIORITY.input, name: 'wake : depots' },
    )
    return () => subscription.unsubscribe()
  }, [pointer, uTrail])

  const { ref, setHost: setShaderHost, ready, refused, colours } =
    useTokenShader<HTMLDivElement>({
      fragment: WAKE_FRAGMENT,
      colors,
      uniforms: { uTrail, uLife: life, uSize: size },
      name: 'wake',
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
