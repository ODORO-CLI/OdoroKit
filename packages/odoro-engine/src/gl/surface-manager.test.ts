import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { registry } from '../core/registry.js'
import { surfaceManager } from './surface-manager.js'

/**
 * Installe un contexte WebGL factice.
 *
 * jsdom n'implemente aucun contexte graphique : sans cette doublure, l'arbitre
 * refuserait toute allocation et l'on ne testerait que son chemin d'echec.
 */
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

let host: HTMLElement

beforeEach(() => {
  installWebGl(true)
  host = document.createElement('div')
  document.body.appendChild(host)
})

afterEach(() => {
  surfaceManager.reset()
  registry.disposeAll()
  host.remove()
})

describe('allocation', () => {
  it('alloue une surface et insere son canevas', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.surface.backend).toBe('ogl')
    expect(result.surface.alive).toBe(true)
    expect(host.querySelector('canvas')).toBe(result.surface.canvas)
    expect(result.surface.canvas.dataset['odoroSurface']).toBe('ogl')
  })

  it('inscrit la surface a l inventaire', () => {
    surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    expect(registry.count('surface')).toBe(1)
    expect(registry.list('surface')[0]?.detail).toMatchObject({ backend: 'ogl' })
  })

  it('donne un canevas distinct a chaque backend', () => {
    // Deux bibliotheques supposent chacune etre seule maitresse de la machine
    // a etats : partager un contexte produit des defauts non deterministes.
    const ogl = surfaceManager.acquire({ backend: 'ogl', name: 'fond', host })
    const three = surfaceManager.acquire({ backend: 'three', name: 'hero', host })

    expect(ogl.ok && three.ok).toBe(true)
    if (!ogl.ok || !three.ok) return
    expect(ogl.surface.canvas).not.toBe(three.surface.canvas)
  })
})

describe('plafonds', () => {
  it('refuse une seconde surface de la meme bibliotheque', () => {
    surfaceManager.acquire({ backend: 'ogl', name: 'premiere', host })
    const second = surfaceManager.acquire({ backend: 'ogl', name: 'seconde', host })

    expect(second.ok).toBe(false)
    if (second.ok) return
    expect(second.reason).toBe('plafond-backend')
    // Un refus est une reponse exploitable : l'appelant affiche son repli.
    expect(second.message).toMatch(/une seule/i)
  })

  it('refuse au-dela du plafond global', () => {
    surfaceManager.configure({ max: 1, maxPerBackend: 1 })
    surfaceManager.acquire({ backend: 'ogl', name: 'premiere', host })

    const second = surfaceManager.acquire({ backend: 'three', name: 'seconde', host })

    expect(second.ok).toBe(false)
    if (second.ok) return
    expect(second.reason).toBe('plafond-global')
  })

  it('libere une place au relachement', () => {
    const first = surfaceManager.acquire({ backend: 'ogl', name: 'premiere', host })
    expect(first.ok).toBe(true)
    if (!first.ok) return

    first.surface.release()

    const second = surfaceManager.acquire({ backend: 'ogl', name: 'seconde', host })
    expect(second.ok).toBe(true)
  })

  it('accepte un plafond eleve', () => {
    surfaceManager.configure({ max: 4, maxPerBackend: 2 })
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'a', host }).ok).toBe(true)
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'b', host }).ok).toBe(true)
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'c', host }).ok).toBe(false)
  })

  it('expose sa capacite', () => {
    surfaceManager.configure({ max: 3, maxPerBackend: 2 })
    expect(surfaceManager.capacity).toEqual({ max: 3, maxPerBackend: 2 })
  })

  it('ne descend jamais sous une surface', () => {
    surfaceManager.configure({ max: 0, maxPerBackend: 0 })
    expect(surfaceManager.capacity).toEqual({ max: 1, maxPerBackend: 1 })
  })
})

describe('absence de WebGL', () => {
  it('refuse proprement plutot que d echouer', () => {
    installWebGl(false)
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('webgl-indisponible')
    // Aucun canevas mort ne doit rester dans le document.
    expect(host.querySelector('canvas')).toBeNull()
  })
})

describe('perte de contexte', () => {
  it('signale la perte et empeche le comportement par defaut', () => {
    const onLost = vi.fn()
    const result = surfaceManager.acquire({
      backend: 'ogl',
      name: 'aurora',
      host,
      onLost,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const event = new Event('webglcontextlost', { cancelable: true })
    result.surface.canvas.dispatchEvent(event)

    // Sans `preventDefault`, le navigateur n'emettra jamais la restauration.
    expect(event.defaultPrevented).toBe(true)
    expect(onLost).toHaveBeenCalledTimes(1)
    expect(result.surface.alive).toBe(false)
  })

  it('signale la restauration', () => {
    const onRestored = vi.fn()
    const result = surfaceManager.acquire({
      backend: 'ogl',
      name: 'aurora',
      host,
      onRestored,
    })
    if (!result.ok) return

    result.surface.canvas.dispatchEvent(
      new Event('webglcontextlost', { cancelable: true }),
    )
    result.surface.canvas.dispatchEvent(new Event('webglcontextrestored'))

    expect(onRestored).toHaveBeenCalledTimes(1)
    expect(result.surface.alive).toBe(true)
  })

  it('reflete l etat dans l inventaire', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.canvas.dispatchEvent(
      new Event('webglcontextlost', { cancelable: true }),
    )
    expect(registry.list('surface')[0]?.detail).toMatchObject({ etat: 'perdu' })
  })
})

describe('liberation', () => {
  it('retire le canevas et l entree d inventaire', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.release()

    expect(host.querySelector('canvas')).toBeNull()
    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
  })

  it('tolere une liberation repetee', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.release()
    expect(() => result.surface.release()).not.toThrow()
    expect(surfaceManager.count()).toBe(0)
  })

  it('libere tout et rend le compte', () => {
    surfaceManager.configure({ max: 4, maxPerBackend: 2 })
    surfaceManager.acquire({ backend: 'ogl', name: 'a', host })
    surfaceManager.acquire({ backend: 'three', name: 'b', host })

    expect(surfaceManager.releaseAll()).toBe(2)
    expect(surfaceManager.count()).toBe(0)
    expect(host.querySelectorAll('canvas').length).toBe(0)
  })

  it('ne laisse aucune surface apres cent cycles', () => {
    // Un emplacement de contexte non rendu est perdu pour la page entiere :
    // c'est la fuite la plus couteuse de toutes.
    for (let i = 0; i < 100; i += 1) {
      const result = surfaceManager.acquire({ backend: 'ogl', name: `cycle-${i}`, host })
      expect(result.ok).toBe(true)
      if (result.ok) result.surface.release()
    }

    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
    expect(document.querySelectorAll('canvas').length).toBe(0)
  })
})
