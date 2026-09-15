/**
 * The navigation hook point.
 *
 * What these tests protect: the animation engine must be able to release
 * what belongs to the page that is leaving, **before** it leaves, and measure
 * the new one **after** it has rendered. A single event, or an event at the
 * wrong moment, produces scroll triggers pinned to the positions of the old
 * page — a defect that disappears on reload, and that is therefore never
 * attributed to the navigation.
 *
 * @module
 */

import { render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Link, Route, Router, Routes } from './index.js'
import { createMemoryHistory } from './history.js'
import { emitNavigation, onNavigation, resetNavigationListeners } from './navigation.js'

afterEach(() => {
  resetNavigationListeners()
  vi.restoreAllMocks()
})

/** An application with two pages. */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Link to="/suite">aller</Link>} />
      <Route path="/suite" element={<p>page suite</p>} />
    </Routes>
  )
}

describe('subscription', () => {
  it('returns what is needed to unsubscribe', () => {
    const seen: string[] = []
    const off = onNavigation((event) => seen.push(event.phase))

    emitNavigation({ phase: 'before', from: '/a', to: '/b' })
    off()
    emitNavigation({ phase: 'after', from: '/a', to: '/b' })

    expect(seen).toEqual(['before'])
  })

  it('notifies every subscriber even when one of them fails', () => {
    // A subscriber that breaks must neither interrupt the navigation, nor
    // deprive the others of the event: the engine and a log may listen to the
    // same one.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const survivor = vi.fn()

    onNavigation(() => {
      throw new Error('faulty subscriber')
    })
    onNavigation(survivor)

    expect(() => emitNavigation({ phase: 'after', from: '/a', to: '/b' })).not.toThrow()
    expect(survivor).toHaveBeenCalledTimes(1)
  })
})

describe('emission by the router', () => {
  it('announces both moments, in order', async () => {
    const events: string[] = []
    onNavigation((event) => events.push(`${event.phase} ${event.from} -> ${event.to}`))

    const history = createMemoryHistory(['/'])
    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    history.push('/suite')

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    await waitFor(() => expect(events).toHaveLength(2))

    expect(events).toEqual(['before / -> /suite', 'after / -> /suite'])
  })

  it('announces nothing on the first render', async () => {
    // Mounting is not a navigation: announcing an `after` would refresh
    // positions that nobody has measured yet.
    const listener = vi.fn()
    onNavigation(listener)

    render(
      <Router history={createMemoryHistory(['/'])}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('aller')).toBeDefined())
    expect(listener).not.toHaveBeenCalled()
  })

  it('announces nothing when only the fragment changes', async () => {
    // Going to `/suite#section` from `/suite` replaces no page: the scroll
    // triggers stay valid, and destroying them would cut a running animation
    // for nothing.
    const listener = vi.fn()
    const history = createMemoryHistory(['/suite'])

    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    onNavigation(listener)
    history.push('/suite#section')

    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(listener).not.toHaveBeenCalled()
  })

  it('announces a browser back too', async () => {
    // The browser back never goes through `navigate`: that is why the
    // subscription goes through the history and not through the render.
    const events: string[] = []
    const history = createMemoryHistory(['/', '/suite'])

    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    onNavigation((event) => events.push(event.phase))
    history.go(-1)

    await waitFor(() => expect(events).toEqual(['before', 'after']))
  })
})
