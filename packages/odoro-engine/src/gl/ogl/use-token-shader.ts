/**
 * Un fond en shader dont les couleurs viennent de la palette.
 *
 * ## Ce que ce hook mutualise
 *
 * Tous les fonds animes font la meme chose : lire deux ou trois tokens, les
 * convertir en flottants, les joindre aux reglages du composant, et relire le
 * tout quand le theme bascule. Ecrite dans chaque composant, cette sequence
 * serait recopiee autant de fois qu'il y a de fonds — et chaque copie
 * derivrait a son rythme.
 *
 * Elle vit donc ici. Un composant de fond se reduit alors a son shader, ses
 * proprietes et son repli, c'est-a-dire a ce qui le distingue.
 *
 * ## Pourquoi les couleurs sont relues
 *
 * Un fond fige dans les teintes du theme clair, au milieu d'une page passee en
 * sombre, est le meme defaut qu'une couleur ecrite en dur — un cran plus loin,
 * parce qu'il a l'air correct au premier chargement.
 *
 * @module
 */

import { useEffect, useMemo, useState } from 'react'

import { useMotionState } from '../../core/context.jsx'
import type { QualityLevel } from '../../core/motion-policy.js'
import { readTokenColour, type ShaderColour } from '../colour.js'
import {
  useShaderSurface,
  type ShaderSurfaceHandle,
  type UniformValue,
} from './use-shader-surface.js'

/** Options de {@link useTokenShader}. */
export interface TokenShaderOptions {
  /** Source du shader de fragment. */
  fragment: string
  /**
   * Tokens dont les couleurs alimentent `uColorA`, `uColorB`, `uColorC`, dans
   * cet ordre. Deux suffisent quand le shader n'en emploie que deux.
   */
  colors: readonly string[]
  /** Uniformes propres au composant. */
  uniforms?: Readonly<Record<string, UniformValue>>
  /** Nom affiche dans le panneau de diagnostic. */
  name: string
  /**
   * Ajuste les uniformes selon la qualite retenue. Sert a retrograder ce qui
   * coute — un nombre d'octaves, une densite — sans toucher au shader.
   */
  degrade?: (quality: QualityLevel) => Readonly<Record<string, UniformValue>>
}

/** Ce que rend {@link useTokenShader}. */
export interface TokenShaderHandle<T extends HTMLElement> extends ShaderSurfaceHandle<T> {
  /** Element hote, a poser sur le conteneur. */
  readonly setHost: (element: T | null) => void
  /** Couleurs effectivement lues, pour l'echappatoire. */
  readonly colours: readonly ShaderColour[]
}

/** Noms des uniformes de couleur, dans l'ordre. */
const COLOUR_UNIFORMS = ['uColorA', 'uColorB', 'uColorC'] as const

/**
 * Monte un fond en shader colore par la palette.
 *
 * @example
 * const { ref, setHost, ready, refused } = useTokenShader<HTMLDivElement>({
 *   fragment: WAVES_FRAGMENT,
 *   colors: ['--o-palette-zinc-950', '--o-palette-brand-500'],
 *   uniforms: { uSpeed: 0.2, uScale: 5, uAmplitude: 0.12 },
 *   name: 'ondes',
 * })
 */
export function useTokenShader<T extends HTMLElement = HTMLDivElement>(
  options: TokenShaderOptions,
): TokenShaderHandle<T> {
  const { fragment, colors, uniforms, name, degrade } = options
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<T | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  useEffect(() => {
    if (host === null) return
    setColours(colors.map((token) => readTokenColour(token, host)))
    // Le theme bascule par la politique de mouvement, qui renouvelle son etat :
    // c'est ce qui declenche la relecture.
  }, [host, colors, reduced, quality])

  const merged = useMemo(() => {
    if (colours.length < colors.length) return undefined

    const values: Record<string, UniformValue> = { ...uniforms, ...degrade?.(quality) }
    for (const [index, colour] of colours.entries()) {
      const key = COLOUR_UNIFORMS[index]
      if (key !== undefined) values[key] = colour
    }
    return values
  }, [colours, colors.length, uniforms, degrade, quality])

  const surface = useShaderSurface<T>({
    fragment,
    // Tant que les couleurs ne sont pas lues, le shader recevrait des vecteurs
    // absents et peindrait du noir. Le repli couvre mieux cet instant.
    uniforms: merged ?? {},
    name,
  })

  return {
    ...surface,
    ready: surface.ready && merged !== undefined,
    setHost,
    colours,
  }
}
