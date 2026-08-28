import { describe, expect, it, vi } from 'vitest'

import { createBrowserHistory, createMemoryHistory } from './history.js'

describe('createMemoryHistory', () => {
  it('demarre sur la derniere entree fournie', () => {
    const history = createMemoryHistory(['/a', '/b'])
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('retombe sur la racine si la pile est vide', () => {
    expect(createMemoryHistory([]).getSnapshot().location.pathname).toBe('/')
  })

  it('empile une entree avec push', () => {
    const history = createMemoryHistory()
    history.push('/about')
    expect(history.getSnapshot().location.pathname).toBe('/about')
    expect(history.getSnapshot().navigationType).toBe('PUSH')
  })

  it('remplace l entree courante avec replace', () => {
    const history = createMemoryHistory(['/a'])
    history.replace('/b')
    history.go(-1)
    // L'entree /a a ete remplacee : il n'y a plus rien derriere.
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('resout une cible relative contre le chemin courant', () => {
    const history = createMemoryHistory(['/users/42/profile'])
    history.push('../settings')
    expect(history.getSnapshot().location.pathname).toBe('/users/42/settings')
  })

  it('accepte une cible sous forme d objet', () => {
    const history = createMemoryHistory()
    history.push({ pathname: '/blog', search: '?page=2', hash: '#top' })
    const { location } = history.getSnapshot()
    expect([location.pathname, location.search, location.hash]).toEqual([
      '/blog',
      '?page=2',
      '#top',
    ])
  })

  it('attache un etat a l entree', () => {
    const history = createMemoryHistory()
    history.push('/a', { state: { from: 'test' } })
    expect(history.getSnapshot().location.state).toEqual({ from: 'test' })
  })

  it('tronque les entrees suivantes lors d un push apres un retour', () => {
    const history = createMemoryHistory(['/a', '/b', '/c'])
    history.go(-2)
    history.push('/d')
    history.go(1)
    expect(history.getSnapshot().location.pathname).toBe('/d')
  })

  it('borne go aux extremites de la pile', () => {
    const history = createMemoryHistory(['/a', '/b'])
    history.go(-10)
    expect(history.getSnapshot().location.pathname).toBe('/a')
    history.go(10)
    expect(history.getSnapshot().location.pathname).toBe('/b')
  })

  it('ne notifie pas si go ne deplace pas le curseur', () => {
    const history = createMemoryHistory(['/a'])
    const listener = vi.fn()
    history.subscribe(listener)
    history.go(-1)
    expect(listener).not.toHaveBeenCalled()
  })

  it('notifie puis cesse de notifier apres desabonnement', () => {
    const history = createMemoryHistory()
    const listener = vi.fn()
    const unsubscribe = history.subscribe(listener)
    history.push('/a')
    expect(listener).toHaveBeenCalledTimes(1)
    unsubscribe()
    history.push('/b')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('conserve une reference d instantane stable entre deux navigations', () => {
    const history = createMemoryHistory()
    const first = history.getSnapshot()
    expect(history.getSnapshot()).toBe(first)
    history.push('/a')
    expect(history.getSnapshot()).not.toBe(first)
  })

  it('attribue une cle distincte a chaque entree', () => {
    const history = createMemoryHistory()
    const first = history.getSnapshot().location.key
    history.push('/a')
    expect(history.getSnapshot().location.key).not.toBe(first)
  })

  it('memorise les positions de defilement par cle', () => {
    const history = createMemoryHistory()
    expect(history.getScroll('absente')).toBeUndefined()
    history.setScroll('k', 420)
    expect(history.getScroll('k')).toBe(420)
  })

  it('construit un href absolu depuis une cible relative', () => {
    const history = createMemoryHistory(['/users/42'])
    expect(history.createHref('../list')).toBe('/users/list')
  })
})

describe('createBrowserHistory', () => {
  it('lit l emplacement initial du navigateur', () => {
    window.history.replaceState(null, '', '/depart?x=1')
    const history = createBrowserHistory()
    expect(history.getSnapshot().location.pathname).toBe('/depart')
    expect(history.getSnapshot().location.search).toBe('?x=1')
  })

  it('desactive la restauration de defilement quand le navigateur la supporte', () => {
    // jsdom n'implemente pas `scrollRestoration` : on verifie que la garde
    // laisse passer sans erreur, et le reglage lui-meme quand il existe.
    expect(() => createBrowserHistory()).not.toThrow()

    Object.defineProperty(window.history, 'scrollRestoration', {
      value: 'auto',
      writable: true,
      configurable: true,
    })
    createBrowserHistory()
    expect(window.history.scrollRestoration).toBe('manual')
  })

  it('met a jour l URL du navigateur au push', () => {
    window.history.replaceState(null, '', '/')
    const history = createBrowserHistory()
    history.push('/about')
    expect(window.location.pathname).toBe('/about')
    expect(history.getSnapshot().location.pathname).toBe('/about')
  })

  it('memorise la position de defilement de l entree quittee', () => {
    window.history.replaceState(null, '', '/')
    const history = createBrowserHistory()
    const departure = history.getSnapshot().location.key
    Object.defineProperty(window, 'scrollY', { value: 320, configurable: true })

    history.push('/suivant')

    expect(history.getScroll(departure)).toBe(320)
  })

  it('repond a popstate', () => {
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
