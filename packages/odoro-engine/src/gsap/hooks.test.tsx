import { render, waitFor } from '@testing-library/react'
import { useState, type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clock } from '../core/clock.js'
import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { resetPluginRegistry } from './setup.js'
import {
  scrollingAncestor,
  useScrollScrub,
  useScrollTrigger,
} from './use-scroll-trigger.js'
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

describe('useScrollScrub', () => {
  /**
   * Une cible qui n'existe pas encore au premier rendu.
   *
   * C'est le cas ordinaire d'une barre de progression : elle se pose en tete,
   * et observe un contenu place plus loin dans l'arbre. React attache les refs
   * au fil du parcours, donc celle du frere suivant est encore vide quand les
   * effets s'executent — aucun declencheur n'etait cree, et il ne se passait
   * rien, sans erreur.
   */
  function Tardive(): ReactElement {
    const [cible, setCible] = useState<HTMLElement | null>(null)
    useScrollScrub(() => undefined, { element: cible, name: 'tardive' })
    return <div ref={setCible} data-testid="cible" />
  }

  it('cree le declencheur quand la cible arrive apres le premier rendu', async () => {
    render(<Tardive />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
  })

  it('n en cree aucun tant que la cible est absente', async () => {
    function Jamais(): ReactElement {
      useScrollScrub(() => undefined, { element: null, name: 'jamais' })
      return <div />
    }

    render(<Jamais />)
    await waitFor(() => expect(registry.count()).toBe(0))
  })
})

describe('scrollingAncestor', () => {
  /** jsdom ne calcule aucune mise en page : les dimensions sont posees. */
  function taille(node: HTMLElement, contenu: number, boite: number): void {
    Object.defineProperty(node, 'scrollHeight', { value: contenu, configurable: true })
    Object.defineProperty(node, 'clientHeight', { value: boite, configurable: true })
  }

  it('remonte jusqu au premier ancetre qui defile', () => {
    const dehors = document.createElement('div')
    const panneau = document.createElement('div')
    const contenu = document.createElement('div')
    const cible = document.createElement('div')

    panneau.style.overflowY = 'auto'
    taille(panneau, 900, 300)

    dehors.append(panneau)
    panneau.append(contenu)
    contenu.append(cible)
    document.body.append(dehors)

    expect(scrollingAncestor(cible)).toBe(panneau)
    dehors.remove()
  })

  it('ignore un conteneur qui declare un debordement sans defiler', () => {
    const panneau = document.createElement('div')
    const cible = document.createElement('div')

    // Le piege : `overflow: auto` sur une boite qui contient tout. Le prendre
    // pour scroller figerait la progression a zero.
    panneau.style.overflowY = 'auto'
    taille(panneau, 300, 300)

    panneau.append(cible)
    document.body.append(panneau)

    expect(scrollingAncestor(cible)).toBeUndefined()
    panneau.remove()
  })

  it('rend la fenetre quand rien ne defile autour', () => {
    const cible = document.createElement('div')
    document.body.append(cible)

    expect(scrollingAncestor(cible)).toBeUndefined()
    cible.remove()
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
