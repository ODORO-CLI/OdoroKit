import { render, screen, waitFor } from '@testing-library/react'
import { type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clock } from './clock.js'
import { OdoroEngine, useEngine, useMotionState } from './context.jsx'
import { motionPolicy } from './motion-policy.js'

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

/** Displays the engine state, to observe what a component receives from it. */
function Probe(): ReactElement {
  const engine = useEngine('Probe')
  const state = useMotionState()
  return (
    <div>
      <span data-testid="provided">{String(engine.provided)}</span>
      <span data-testid="surfaces">{engine.maxSurfaces}</span>
      <span data-testid="quality">{state.quality}</span>
      <span data-testid="reduced">{String(state.reduced)}</span>
    </div>
  )
}

beforeEach(() => {
  setSystemReduced(false)
})

afterEach(() => {
  motionPolicy.dispose()
  clock.dispose()
})

describe('outside a provider', () => {
  it('works with the default settings', () => {
    // A component copied from the registry lands in a project that may not
    // have mounted the provider yet: making it fail would suggest that the
    // component is broken.
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(<Probe />)

    expect(screen.getByTestId('provided').textContent).toBe('false')
    expect(screen.getByTestId('surfaces').textContent).toBe('2')
    expect(warning).toHaveBeenCalled()
  })

  it('warns only once per caller', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    function Repeated(): ReactElement {
      useEngine('SameCaller')
      return <span>ok</span>
    }

    render(
      <>
        <Repeated />
        <Repeated />
        <Repeated />
      </>,
    )

    expect(warning).toHaveBeenCalledTimes(1)
  })

  it('quotes the caller in the warning', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    function Aurora(): ReactElement {
      useEngine('Aurora')
      return <span>ok</span>
    }
    render(<Aurora />)

    expect(String(warning.mock.calls[0]?.[0])).toContain('Aurora')
  })
})

describe('under a provider', () => {
  it('reports its presence and applies the settings', async () => {
    render(
      <OdoroEngine quality="low" maxSurfaces={3}>
        <Probe />
      </OdoroEngine>,
    )

    expect(screen.getByTestId('provided').textContent).toBe('true')
    expect(screen.getByTestId('surfaces').textContent).toBe('3')
    await waitFor(() => expect(screen.getByTestId('quality').textContent).toBe('low'))
  })

  it('emits no warning', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(
      <OdoroEngine>
        <Probe />
      </OdoroEngine>,
    )

    expect(warning).not.toHaveBeenCalled()
  })

  it('forces the requested neutralisation', async () => {
    render(
      <OdoroEngine reducedMotion="force">
        <Probe />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('reduced').textContent).toBe('true'))
  })

  it('overrides the system preference on request', async () => {
    setSystemReduced(true)

    render(
      <OdoroEngine reducedMotion="ignore">
        <Probe />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('reduced').textContent).toBe('false'))
  })

  it('shares the same clock as outside a provider', () => {
    // The uniqueness of the loop is the central guarantee of the engine: two
    // nested providers must not produce two loops.
    function Comparator(): ReactElement {
      const inner = useEngine()
      return <span data-testid="same">{String(inner.clock === clock)}</span>
    }

    render(
      <OdoroEngine>
        <OdoroEngine>
          <Comparator />
        </OdoroEngine>
      </OdoroEngine>,
    )

    expect(screen.getByTestId('same').textContent).toBe('true')
  })
})

describe('useMotionState', () => {
  it('re-renders on a policy change', async () => {
    render(
      <OdoroEngine quality="high">
        <Probe />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('quality').textContent).toBe('high'))

    motionPolicy.configure({ quality: 'low' })

    await waitFor(() => expect(screen.getByTestId('quality').textContent).toBe('low'))
  })

  it('does not loop on an unstable snapshot', () => {
    // A snapshot rebuilt on every read would make React loop endlessly: the
    // render must simply succeed.
    expect(() =>
      render(
        <OdoroEngine>
          <Probe />
        </OdoroEngine>,
      ),
    ).not.toThrow()
  })
})
