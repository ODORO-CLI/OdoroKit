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
 * Ce que ces tests couvrent, et ce qu'ils ne couvrent pas.
 *
 * jsdom n'a pas de contexte graphique : le rendu lui-meme ne peut pas etre
 * verifie ici. Ce qui est verifiable — et qui constitue le contrat vis-a-vis
 * de l'appelant — c'est le chemin de refus, l'arbitrage des surfaces et la
 * liberation. Le rendu est verifie dans un vrai navigateur, ailleurs.
 */

/** Installe un contexte graphique factice. */
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

/** Force la reponse du systeme pour `prefers-reduced-motion`. */
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

function Fond({ name = 'aurora' }): ReactElement {
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
  it('alloue une surface au montage', () => {
    render(<Fond />)
    expect(surfaceManager.count('ogl')).toBe(1)
  })

  it('libere la surface au demontage', () => {
    const { unmount } = render(<Fond />)
    expect(surfaceManager.count('ogl')).toBe(1)
    unmount()
    expect(surfaceManager.count('ogl')).toBe(0)
  })

  it('ne laisse aucune surface apres cinquante cycles', async () => {
    // Un emplacement de contexte non rendu est perdu pour la page entiere.
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Fond name={`cycle-${i}`} />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
    expect(document.querySelectorAll('canvas').length).toBe(0)
  })
})

describe('refus', () => {
  it('refuse une seconde surface et le signale a l appelant', async () => {
    const { getByTestId } = render(
      <>
        <Fond name="premier" />
        <Fond name="second" />
      </>,
    )

    await waitFor(() =>
      expect(getByTestId('second').dataset['refused']).toBe('plafond-backend'),
    )
    // Un refus est une reponse exploitable : l'appelant affiche son repli.
    expect(surfaceManager.count('ogl')).toBe(1)
  })

  it('refuse sans WebGL', async () => {
    installWebGl(false)
    const { getByTestId } = render(<Fond />)

    await waitFor(() =>
      expect(getByTestId('aurora').dataset['refused']).toBe('webgl-indisponible'),
    )
  })

  it('refuse sous mouvement reduit, sans allouer', async () => {
    // Un fond anime n'a pas d'etat final a preserver : il n'apporte rien
    // d'autre que son mouvement.
    motionPolicy.dispose()
    setSystemReduced(true)
    motionPolicy.configure({ reducedMotion: 'respect' })

    const { getByTestId } = render(<Fond />)

    await waitFor(() =>
      expect(getByTestId('aurora').dataset['refused']).toBe('mouvement-reduit'),
    )
    expect(surfaceManager.count()).toBe(0)
  })
})

describe('shaders', () => {
  it('declarent les uniforms qu ils utilisent', () => {
    for (const uniform of ['uTime', 'uResolution', 'uColorA', 'uSpeed', 'uScale']) {
      expect(AURORA_FRAGMENT).toContain(`uniform`)
      expect(AURORA_FRAGMENT).toContain(uniform)
    }
  })

  it('bornent la boucle d octaves', () => {
    // Une boucle non bornee ne compile pas sur les plateformes qui exigent un
    // nombre d'iterations connu a la compilation.
    expect(AURORA_FRAGMENT).toMatch(/for \(int i = 0; i < \d+; i\+\+\)/)
  })
})
