import { describe, expect, it, vi } from 'vitest'

import { createBrowserHistory, createMemoryHistory } from './history.js'

describe('createMemoryHistory', () => {
  it('starts on the last entry supplied', () => {
    const history = createMemoryHistory(['/a', '/b'])
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('falls back on the root when the stack is empty', () => {
    expect(createMemoryHistory([]).getSnapshot().location.pathname).toBe('/')
  })

  it('pushes an entry with push', () => {
    const history = createMemoryHistory()
    history.push('/about')
    expect(history.getSnapshot().location.pathname).toBe('/about')
    expect(history.getSnapshot().navigationType).toBe('PUSH')
  })

  it('replaces the current entry with replace', () => {
    const history = createMemoryHistory(['/a'])
    history.replace('/b')
    history.go(-1)
    // The /a entry has been replaced: there is nothing left behind.
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('resolves a relative target against the current path', () => {
    const history = createMemoryHistory(['/users/42/profile'])
    history.push('../settings')
    expect(history.getSnapshot().location.pathname).toBe('/users/42/settings')
  })

  it('accepts a target in object form', () => {
    const history = createMemoryHistory()
    history.push({ pathname: '/blog', search: '?page=2', hash: '#top' })
    const { location } = history.getSnapshot()
    expect([location.pathname, location.search, location.hash]).toEqual([
      '/blog',
      '?page=2',
      '#top',
    ])
  })

  it('attaches a state to the entry', () => {
    const history = createMemoryHistory()
    history.push('/a', { state: { from: 'test' } })
    expect(history.getSnapshot().location.state).toEqual({ from: 'test' })
  })

  it('truncates the following entries on a push after a back', () => {
    const history = createMemoryHistory(['/a', '/b', '/c'])
    history.go(-2)
    history.push('/d')
    history.go(1)
    expect(history.getSnapshot().location.pathname).toBe('/d')
  })

  it('bounds go to the ends of the stack', () => {
    const history = createMemoryHistory(['/a', '/b'])
    history.go(-10)
    expect(history.getSnapshot().location.pathname).toBe('/a')
    history.go(10)
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('does not notify when go does not move the cursor', () => {
    const history = createMemoryHistory(['/a'])
    const listener = vi.fn()
    history.subscribe(listener)
    history.go(-1)
    expect(listener).not.toHaveBeenCalled()
  })

  it('notifies then stops notifying after unsubscribing', () => {
    const history = createMemoryHistory()
    const listener = vi.fn()
    const unsubscribe = history.subscribe(listener)
    history.push('/a')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    history.push('/b')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps a stable snapshot reference between two navigations', () => {
    const history = createMemoryHistory()
    const first = history.getSnapshot()
    expect(history.getSnapshot()).toBe(first)
    history.push('/a')
    expect(history.getSnapshot()).not.toBe(first)
  })

  it('assigns a distinct key to each entry', () => {
    const history = createMemoryHistory()
    const first = history.getSnapshot().location.key
    history.push('/a')
    expect(history.getSnapshot().location.key).not.toBe(first)
  })

  it('stores the scroll positions by key', () => {
    const history = createMemoryHistory()
    expect(history.getScroll('absente')).toBeUndefined()
    history.setScroll('k', 420)
    expect(history.getScroll('k')).toBe(420)
  })

  it('builds an absolute href from a relative target', () => {
    const history = createMemoryHistory(['/users/42'])
    expect(history.createHref('../list')).toBe('/users/list')
  })
})

describe('createBrowserHistory', () => {
  it('reads the initial location of the browser', () => {
    window.history.replaceState(null, '', '/depart?x=1')
    const history = createBrowserHistory()
    expect(history.getSnapshot().location.pathname).toBe('/depart')
    expect(history.getSnapshot().location.search).toBe('?x=1')
  })

  it('disables the scroll restoration when the browser supports it', () => {
    // jsdom does not implement `scrollRestoration`: we check that the guard
    // lets it through without error, and the setting itself when it exists.
    expect(() => createBrowserHistory()).not.toThrow()

    Object.defineProperty(window.history, 'scrollRestoration', {
      value: 'auto',
      writable: true,
      configurable: true,
    })
    createBrowserHistory()
    expect(window.history.scrollRestoration).toBe('manual')
  })

  it('updates the URL of the browser on push', () => {
    window.history.replaceState(null, '', '/')
    const history = createBrowserHistory()
    history.push('/about')
    expect(window.location.pathname).toBe('/about')
    expect(history.getSnapshot().location.pathname).toBe('/about')
  })

  it('stores the scroll position of the entry being left', () => {
    window.history.replaceState(null, '', '/')
    const history = createBrowserHistory()
    const departure = history.getSnapshot().location.key
    Object.defineProperty(window, 'scrollY', { value: 320, configurable: true })

    history.push('/suivant')

    expect(history.getScroll(departure)).toBe(320)
  })

  it('responds to popstate', () => {
    window.history.replaceState(null, '', '/')
    const history = createBrowserHistory()
    history.push('/about')

    window.history.replaceState({ usr: null, key: 'retour' }, '', '/')
    window.dispatchEvent(
      new PopStateEvent('popstate', { state: { usr: null, key: 'retour' } }),
    )

    expect(history.getSnapshot().location.pathname).toBe('/')
    expect(history.getSnapshot().navigationType).toBe('POP')
  })
})
