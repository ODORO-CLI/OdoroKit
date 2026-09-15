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
  it('recognises the parameter', () => {
    expect(isDebugRequested('https://site.fr/?odoro-debug')).toBe(true)
    expect(isDebugRequested('https://site.fr/?a=1&odoro-debug=1')).toBe(true)
  })

  it('stays quiet without the parameter', () => {
    expect(isDebugRequested('https://site.fr/')).toBe(false)
    expect(isDebugRequested('https://site.fr/?other=1')).toBe(false)
  })

  it('absorbs an invalid URL', () => {
    expect(isDebugRequested('not a url')).toBe(false)
  })
})

describe('reading', () => {
  it('reports the subscribers and the resources', () => {
    clock.subscribe(() => undefined, { name: 'aurora', priority: CLOCK_PRIORITY.render })
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })

    const snapshot = readDebugSnapshot()

    expect(snapshot.subscribers.map((entry) => entry.name)).toEqual(['aurora'])
    expect(snapshot.resources.map((entry) => entry.name)).toEqual(['aurora'])
  })
})

describe('panel', () => {
  it('renders nothing without an explicit request', () => {
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel />
      </OdoroEngine>,
    )
    expect(container.querySelector('[data-odoro-debug]')).toBeNull()
  })

  it('displays the state when it is forced', () => {
    registry.register({ kind: 'surface', name: 'aurora', dispose: vi.fn() })

    render(
      <OdoroEngine maxSurfaces={2}>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )

    expect(screen.getByText('frames per second')).toBeDefined()
    expect(screen.getByText('1 / 2')).toBeDefined()
    expect(screen.getAllByText('aurora').length).toBeGreaterThan(0)
  })

  it('stays out of the accessibility tree', () => {
    // This is a measuring instrument: it has nothing to announce to a screen
    // reader, and its noise would mask the real content.
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )
    const panel = container.querySelector('[data-odoro-debug]')
    expect(panel?.getAttribute('aria-hidden')).toBe('true')
  })

  it('intercepts no click', () => {
    const { container } = render(
      <OdoroEngine>
        <OdoroDebugPanel force />
      </OdoroEngine>,
    )
    const panel = container.querySelector('[data-odoro-debug]') as HTMLElement
    expect(panel.style.pointerEvents).toBe('none')
  })
})
