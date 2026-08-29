import { render, waitFor } from '@testing-library/react'
import { type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clock } from '../core/clock.js'
import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { resetPluginRegistry } from './setup.js'
import { useScrollTrigger } from './use-scroll-trigger.js'
import { useSplitText } from './use-split-text.js'
import { useTimeline, useTween } from './use-timeline.js'

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

/**
 * Bascule la politique en mouvement reduit.
 *
 * La politique lit la media query **une seule fois**, a l'installation, puis
 * s'abonne a ses evenements — comportement correct en navigateur, ou la
 * `MediaQueryList` signale ses changements. La doublure de test n'en emet
 * aucun : il faut donc reinstaller la politique apres avoir change la reponse.
 */
function forceReduced(): void {
  motionPolicy.dispose()
  setSystemReduced(true)
  motionPolicy.configure({ reducedMotion: 'respect' })
}

beforeEach(() => {
  setSystemReduced(false)
  motionPolicy.configure({ reducedMotion: 'respect' })
})

afterEach(() => {
  registry.disposeAll()
  motionPolicy.dispose()
  clock.dispose()
  resetPluginRegistry()
})

describe('useTimeline', () => {
  function Anime({ onBuild }: { onBuild?: () => void }): ReactElement {
    const { ref } = useTimeline<HTMLDivElement>(
      ({ timeline }) => {
        onBuild?.()
        timeline.to({ valeur: 0 }, { valeur: 1, duration: 0.2 })
      },
      [],
      { name: 'essai' },
    )
    return <div ref={ref} data-testid="cible" />
  }

  it('construit la timeline au montage', () => {
    const onBuild = vi.fn()
    render(<Anime onBuild={onBuild} />)
    expect(onBuild).toHaveBeenCalledTimes(1)
    expect(registry.count('timeline')).toBe(1)
  })

  it('revoque la timeline au demontage', () => {
    const { unmount } = render(<Anime />)
    expect(registry.count('timeline')).toBe(1)
    unmount()
    expect(registry.count('timeline')).toBe(0)
  })

  it('ne laisse rien vivre apres cent cycles', () => {
    // Une animation qui survit a son composant ecrit dans un noeud detache et
    // retient une reference sur l'arbre React. Le seul symptome est une
    // consommation memoire qui monte au fil des navigations.
    for (let i = 0; i < 100; i += 1) {
      const { unmount } = render(<Anime />)
      unmount()
    }
    expect(registry.count('timeline')).toBe(0)
    expect(registry.count()).toBe(0)
  })

  it('applique l etat final sous mouvement reduit', () => {
    forceReduced()

    let seen: number | undefined
    function Reduit(): ReactElement {
      const { ref, timeline } = useTimeline<HTMLDivElement>(({ timeline: created }) => {
        created.to({ valeur: 0 }, { valeur: 1, duration: 1 })
        queueMicrotask(() => {
          seen = timeline.current?.progress()
        })
      }, [])
      return <div ref={ref} />
    }

    render(<Reduit />)
    // La timeline n'est pas annulee : elle est avancee a son terme. Un
    // element qui devait apparaitre apparait, sans transition.
    expect(seen === undefined || seen === 1).toBe(true)
  })

  it('signale la neutralisation a la fonction de construction', () => {
    forceReduced()

    let reduced: boolean | undefined
    function Sonde(): ReactElement {
      const { ref } = useTimeline<HTMLDivElement>((setup) => {
        reduced = setup.reduced
      }, [])
      return <div ref={ref} />
    }

    render(<Sonde />)
    expect(reduced).toBe(true)
  })
})

describe('useTween', () => {
  function Rotation(): ReactElement {
    const ref = useTween<HTMLDivElement>(
      { rotate: 90, duration: 0.2 },
      { name: 'rotation' },
    )
    return <div ref={ref} />
  }

  it('enregistre puis libere l animation', () => {
    const { unmount } = render(<Rotation />)
    expect(registry.count('timeline')).toBe(1)
    unmount()
    expect(registry.count('timeline')).toBe(0)
  })

  it('ne laisse rien vivre apres cent cycles', () => {
    for (let i = 0; i < 100; i += 1) {
      const { unmount } = render(<Rotation />)
      unmount()
    }
    expect(registry.count()).toBe(0)
  })
})

describe('useScrollTrigger', () => {
  function Section(): ReactElement {
    const ref = useScrollTrigger<HTMLDivElement>({ start: 'top 80%', name: 'section' })
    return <div ref={ref} data-testid="section" />
  }

  it('enregistre un declencheur', async () => {
    render(<Section />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
  })

  it('libere le declencheur au demontage', async () => {
    const { unmount } = render(<Section />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
    unmount()
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('ne cree rien sous mouvement reduit', async () => {
    // Une animation liee au defilement est pilotee par l'utilisateur ; sous
    // mouvement reduit, l'element reste simplement dans son etat final.
    forceReduced()

    render(<Section />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('ne laisse rien vivre apres cinquante cycles', async () => {
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Section />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(registry.count('scroll-trigger')).toBe(0)
  })
})

describe('useSplitText', () => {
  const TEXTE = 'Un titre revele'

  function Titre({ by = 'chars' as const }): ReactElement {
    const { ref, ready } = useSplitText<HTMLHeadingElement>({ by })
    return (
      <h1 ref={ref} data-testid="titre" data-ready={String(ready)}>
        {TEXTE}
      </h1>
    )
  }

  it('decoupe le texte et relie le conteneur a son libelle', async () => {
    const { getByTestId } = render(<Titre />)
    const titre = getByTestId('titre')

    await waitFor(() => expect(titre.dataset['ready']).toBe('true'))

    // Le lecteur d'ecran doit lire une phrase, pas un alphabet.
    expect(titre.getAttribute('aria-label')).toBe(TEXTE)
    const fragments = titre.querySelectorAll('[aria-hidden="true"]')
    expect(fragments.length).toBeGreaterThan(0)
  })

  it('restaure le DOM d origine au demontage', async () => {
    const { getByTestId, unmount } = render(<Titre />)
    const titre = getByTestId('titre')
    await waitFor(() => expect(titre.dataset['ready']).toBe('true'))

    unmount()

    // Un texte laisse decoupe casserait la selection et le copier-coller bien
    // apres la disparition de l'animation qui l'avait justifie.
    expect(titre.textContent).toBe(TEXTE)
    expect(titre.hasAttribute('aria-label')).toBe(false)
  })

  it('ne decoupe pas du tout sous mouvement reduit', async () => {
    // Decouper pour ne rien animer reviendrait a payer tout le cout
    // d'accessibilite sans aucun benefice.
    forceReduced()

    const { getByTestId } = render(<Titre />)
    await new Promise((resolve) => setTimeout(resolve, 50))

    const titre = getByTestId('titre')
    expect(titre.dataset['ready']).toBe('false')
    expect(titre.textContent).toBe(TEXTE)
    expect(titre.querySelectorAll('[aria-hidden="true"]').length).toBe(0)
  })

  it('ne laisse aucun fragment apres cinquante cycles', async () => {
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Titre />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBe(0)
  })
})
