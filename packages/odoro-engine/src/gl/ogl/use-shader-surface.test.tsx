import { render, waitFor } from '@testing-library/react'
import { type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clock } from '../../core/clock.js'
import { motionPolicy } from '../../core/motion-policy.js'
import { registry } from '../../core/registry.js'
import { surfaceManager } from '../surface-manager.js'
import { AURORA_FRAGMENT } from './shaders.js'
import { useShaderSurface } from './use-shader-surface.js'

/**
 * What these tests cover, and what they do not.
 *
 * jsdom has no graphics context: the rendering itself cannot be checked here.
 * What is checkable — and what constitutes the contract towards the caller —
 * is the refusal path, the arbitration of surfaces and the release. The
 * rendering is checked in a real browser, elsewhere.
 */

/** Installs a fake graphics context. */
function installWebGl(available = true): void {
  HTMLCanvasElement.prototype.getContext = vi.fn(function (
    this: HTMLCanvasElement,
    type: string,
  ) {
    if (!available) return null
    if (type !== 'webgl2' && type !== 'webgl') return null
    return {
      canvas: this,
      getExtension: () => ({ loseContext: () => undefined }),
    } as unknown as WebGLRenderingContext
  }) as unknown as HTMLCanvasElement['getContext']
}

/** Forces the system answer for `prefers-reduced-motion`. */
function setSystemReduced(reduced: boolean): void {
  window.matchMedia = ((query: string) => ({
    matches: query.includes('prefers-reduced-motion') ? reduced : false,
    media: query,
    onchange: null,
    addEventListener: () => undefined,
    removeEventListener: () => undefined,
    addListener: () => undefined,
    removeListener: () => undefined,
    dispatchEvent: () => false,
  })) as typeof window.matchMedia
}

function Background({ name = 'aurora' }): ReactElement {
  const { ref, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    uniforms: { uSpeed: 0.4, uScale: 3, uOctaves: 4 },
    name,
  })
  return <div ref={ref} data-testid={name} data-refused={refused ?? ''} />
}

beforeEach(() => {
  installWebGl(true)
  setSystemReduced(false)
  motionPolicy.configure({ reducedMotion: 'respect' })
})

afterEach(() => {
  surfaceManager.reset()
  registry.disposeAll()
  motionPolicy.dispose()
  clock.dispose()
})

describe('allocation', () => {
  it('allocates a surface on mount', () => {
    render(<Background />)
    expect(surfaceManager.count('ogl')).toBe(1)
  })

  it('releases the surface on unmount', () => {
    const { unmount } = render(<Background />)
    expect(surfaceManager.count('ogl')).toBe(1)
    unmount()
    expect(surfaceManager.count('ogl')).toBe(0)
  })

  it('leaves no surface after fifty cycles', async () => {
    // A context slot that is not given back is lost for the whole page.
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Background name={`cycle-${i}`} />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
    expect(document.querySelectorAll('canvas').length).toBe(0)
  })
})

describe('refusal', () => {
  it('refuses a second surface and reports it to the caller', async () => {
    const { getByTestId } = render(
      <>
        <Background name="first" />
        <Background name="second" />
      </>,
    )

    await waitFor(() =>
      expect(getByTestId('second').dataset['refused']).toBe('max-per-backend'),
    )
    // A refusal is an actionable answer: the caller displays its fallback.
    expect(surfaceManager.count('ogl')).toBe(1)
  })

  it('refuses without WebGL', async () => {
    installWebGl(false)
    const { getByTestId } = render(<Background />)

    await waitFor(() =>
      expect(getByTestId('aurora').dataset['refused']).toBe('webgl-unavailable'),
    )
  })

  it('refuses under reduced motion, without allocating', async () => {
    // An animated background has no final state to preserve: it brings nothing
    // other than its motion.
    motionPolicy.dispose()
    setSystemReduced(true)
    motionPolicy.configure({ reducedMotion: 'respect' })

    const { getByTestId } = render(<Background />)

    await waitFor(() =>
      expect(getByTestId('aurora').dataset['refused']).toBe('reduced-motion'),
    )
    expect(surfaceManager.count()).toBe(0)
  })
})

describe('shaders', () => {
  it('declare the uniforms they use', () => {
    for (const uniform of ['uTime', 'uResolution', 'uColorA', 'uSpeed', 'uScale']) {
      expect(AURORA_FRAGMENT).toContain(`uniform`)
      expect(AURORA_FRAGMENT).toContain(uniform)
    }
  })

  it('bound the octave loop', () => {
    // An unbounded loop does not compile on the platforms that require a number
    // of iterations known at compile time.
    expect(AURORA_FRAGMENT).toMatch(/for \(int i = 0; i < \d+; i\+\+\)/)
  })
})
