import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { motionPolicy } from './motion-policy.js'

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

beforeEach(() => {
  setSystemReduced(false)
})

afterEach(() => {
  motionPolicy.dispose()
})

describe('preference systeme', () => {
  it('respecte la preference par defaut', () => {
    setSystemReduced(true)
    motionPolicy.configure({})
    expect(motionPolicy.state.reduced).toBe(true)
  })

  it('n annonce rien de reduit quand le systeme ne demande rien', () => {
    motionPolicy.configure({})
    expect(motionPolicy.state.reduced).toBe(false)
  })

  it('neutralise en toutes circonstances avec force', () => {
    motionPolicy.configure({ reducedMotion: 'force' })
    expect(motionPolicy.state.reduced).toBe(true)
  })

  it('passe outre la preference avec ignore', () => {
    setSystemReduced(true)
    motionPolicy.configure({ reducedMotion: 'ignore' })
    expect(motionPolicy.state.reduced).toBe(false)
  })

  it('ramene la qualite au plus bas quand le mouvement est reduit', () => {
    // L'animation est neutralisee ; il serait absurde de continuer a rendre au
    // niveau de detail le plus couteux.
    motionPolicy.configure({ quality: 'high', reducedMotion: 'force' })
    expect(motionPolicy.state.quality).toBe('low')
  })
})

describe('qualite imposee', () => {
  it('retient le niveau demande', () => {
    motionPolicy.configure({ quality: 'low' })
    expect(motionPolicy.state.quality).toBe('low')
    expect(motionPolicy.state.reason).toBe('qualite imposee')

    motionPolicy.configure({ quality: 'high' })
    expect(motionPolicy.state.quality).toBe('high')
  })

  it('part du niveau le plus eleve en automatique', () => {
    motionPolicy.configure({ quality: 'auto' })
    expect(motionPolicy.state.quality).toBe('high')
  })
})

describe('instantane', () => {
  it('conserve la meme reference tant que rien ne change', () => {
    // `useSyncExternalStore` compare les instantanes par identite : en
    // reconstruire un a chaque lecture provoquerait une boucle de rendu.
    motionPolicy.configure({})
    expect(motionPolicy.state).toBe(motionPolicy.state)
  })

  it('change de reference a un changement reel', () => {
    motionPolicy.configure({ quality: 'high' })
    const before = motionPolicy.state
    motionPolicy.configure({ quality: 'low' })
    expect(motionPolicy.state).not.toBe(before)
  })
})

describe('abonnement', () => {
  it('notifie a un changement d etat', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'high' })
    motionPolicy.subscribe(listener)

    motionPolicy.configure({ quality: 'low' })

    expect(listener).toHaveBeenCalledTimes(1)
    expect(listener.mock.calls[0]?.[0]).toMatchObject({ quality: 'low' })
  })

  it('ne notifie pas quand rien ne change', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'low' })
    motionPolicy.subscribe(listener)

    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })

  it('cesse de notifier apres desabonnement', () => {
    const listener = vi.fn()
    motionPolicy.configure({ quality: 'high' })
    const unsubscribe = motionPolicy.subscribe(listener)

    unsubscribe()
    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })
})

describe('visibilite de l onglet', () => {
  it('suit l etat du document', () => {
    motionPolicy.configure({})
    expect(motionPolicy.state.visible).toBe(true)

    const listener = vi.fn()
    motionPolicy.subscribe(listener)

    Object.defineProperty(document, 'visibilityState', {
      value: 'hidden',
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))

    expect(motionPolicy.state.visible).toBe(false)
    expect(listener).toHaveBeenCalled()

    Object.defineProperty(document, 'visibilityState', {
      value: 'visible',
      configurable: true,
    })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(motionPolicy.state.visible).toBe(true)
  })
})

describe('liberation', () => {
  it('revient aux reglages initiaux', () => {
    motionPolicy.configure({ quality: 'low', reducedMotion: 'force' })
    motionPolicy.dispose()

    expect(motionPolicy.state.reduced).toBe(false)
    expect(motionPolicy.state.quality).toBe('high')
  })

  it('retire les ecouteurs', () => {
    const listener = vi.fn()
    motionPolicy.configure({})
    motionPolicy.subscribe(listener)

    motionPolicy.dispose()
    motionPolicy.configure({ quality: 'low' })

    expect(listener).not.toHaveBeenCalled()
  })
})
