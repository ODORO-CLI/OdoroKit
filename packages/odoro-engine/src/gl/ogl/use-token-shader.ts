/**
 * A shader background whose colours come from the palette.
 *
 * ## What this hook shares
 *
 * Every animated background does the same thing: read two or three tokens,
 * convert them into floats, join them to the settings of the component, and
 * read the whole lot again when the theme switches. Written in each component,
 * this sequence would be copied as many times as there are backgrounds — and
 * each copy would drift at its own pace.
 *
 * It therefore lives here. A background component then reduces to its shader,
 * its properties and its fallback, that is to say to what distinguishes it.
 *
 * ## Why the colours are read again
 *
 * A background frozen in the hues of the light theme, in the middle of a page
 * switched to dark, is the same flaw as a hard-coded colour — one notch
 * further, because it looks correct on first load.
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

/** Options of {@link useTokenShader}. */
export interface TokenShaderOptions {
  /** Source of the fragment shader. */
  fragment: string
  /**
   * Tokens whose colours feed `uColorA`, `uColorB`, `uColorC`, in that order.
   * Two are enough when the shader only uses two.
   */
  colors: readonly string[]
  /** Uniforms of the component itself. */
  uniforms?: Readonly<Record<string, UniformValue>>
  /** Name shown in the diagnostics panel. */
  name: string
  /**
   * Adjusts the uniforms according to the selected quality. Serves to
   * downgrade what costs — a number of octaves, a density — without touching
   * the shader.
   */
  degrade?: (quality: QualityLevel) => Readonly<Record<string, UniformValue>>
}

/** What {@link useTokenShader} returns. */
export interface TokenShaderHandle<T extends HTMLElement> extends ShaderSurfaceHandle<T> {
  /** Host element, to set on the container. */
  readonly setHost: (element: T | null) => void
  /** Colours actually read, for the escape hatch. */
  readonly colours: readonly ShaderColour[]
}

/** Names of the colour uniforms, in order. */
const COLOUR_UNIFORMS = ['uColorA', 'uColorB', 'uColorC'] as const

/**
 * Mounts a shader background coloured by the palette.
 *
 * @example
 * const { ref, setHost, ready, refused } = useTokenShader<HTMLDivElement>({
 *   fragment: WAVES_FRAGMENT,
 *   colors: ['--o-palette-zinc-950', '--o-palette-brand-500'],
 *   uniforms: { uSpeed: 0.2, uScale: 5, uAmplitude: 0.12 },
 *   name: 'waves',
 * })
 */
export function useTokenShader<T extends HTMLElement = HTMLDivElement>(
  options: TokenShaderOptions,
): TokenShaderHandle<T> {
  const { fragment, colors, uniforms, name, degrade } = options
  const { quality, reduced, theme } = useMotionState()
  const [host, setHost] = useState<T | null>(null)
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  useEffect(() => {
    if (host === null) return
    setColours(colors.map((token) => readTokenColour(token, host)))
    // The motion policy follows `data-theme` and the system preference: its
    // toggle is what triggers the re-reading of the tokens.
  }, [host, colors, reduced, quality, theme])

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
    // As long as the colours are not read, the shader would receive missing
    // vectors and would paint black. The fallback covers that moment better.
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
