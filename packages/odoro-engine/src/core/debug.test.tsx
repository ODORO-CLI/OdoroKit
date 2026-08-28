import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { CLOCK_PRIORITY, clock } from './clock.js'
import { OdoroEngine } from './context.jsx'
import { OdoroDebugPanel, isDebugRequested, readDebugSnapshot } from './debug.jsx'
import { motionPolicy } from './motion-policy.js'
import { registry } from './registry.js'

afterEach(() => {
  registry.disposeAll()
  motionPolicy.dispose()
  clock.dispose()
})

describe('isDebugRequested', () => {
  it('reconnait le parametre', () => {
    expect(isDebugRequested('https://site.fr/?odoro-debug')).toBe(true)
    expect(isDebugRequested('https://site.fr/?a=1&odoro-debug=1')).toBe(true)
  })

  it('reste discret sans le parametre', () => {
    expect(isDebugRequested('https://site.fr/')).toBe(false)
    expect(isDebugRequested('https://site.fr/?autre=1')).toBe(false)
  })

  it('absorbe une URL invalide', () => {
    expect(isDebugRequested('pas une url')).toBe(false)
  })
})

describe('releve', () => {
  it('rapporte les abonnes et les ressources', () => {
    clock.subscribe(() => undefined, { name: 'aurora', priority: CLOCK_PRIORITY.render })
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })

    const snapshot = readDebugSnapshot()

    expect(snapshot.subscribers.map((entry) => entry.name)).toEqual(['aurora'])
    expect(snapshot.resources.map((entry) => entry.name)).toEqual(['aurora'])
  })
})

describe('panneau', () => {
  it('ne rend rien sans demande explicite', () => {
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel />
      </OdoroEngine>,
    )
    expect(container.querySelector('[data-odoro-debug]')).toBeNull()
  })

  it('affiche l etat quand il est force', () => {
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })

    render(
      <OdoroEngine maxSurfaces={2}>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )

    expect(screen.getByText('images par seconde')).toBeDefined()
    expect(screen.getByText('1 / 2')).toBeDefined()
    expect(screen.getAllByText('aurora').length).toBeGreaterThan(0)
  })

  it('reste hors de l arbre d accessibilite', () => {
    // C'est un instrument de mesure : il n'a rien a annoncer a un lecteur
    // d'ecran, et son bruit masquerait le contenu reel.
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )
    const panel = container.querySelector('[data-odoro-debug]')
    expect(panel?.getAttribute('aria-hidden')).toBe('true')
  })

  it('n intercepte aucun clic', () => {
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )
    const panel = container.querySelector('[data-odoro-debug]') as HTMLElement
    expect(panel.style.pointerEvents).toBe('none')
  })
})
