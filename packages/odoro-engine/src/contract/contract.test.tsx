import { render, screen } from '@testing-library/react'
import { act, useState, type ReactElement } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { motionPolicy } from '../core/motion-policy.js'
import { mergePresentation, type Customisable } from './customisation.js'
import { useOnReady, type ReadyCallback } from './ready.js'
import { fromSlot, type Slot } from './slot.js'

afterEach(() => {
  motionPolicy.configure({ quality: 'auto', reducedMotion: 'respect' })
})

describe('niveau 3 — le passe-plat', () => {
  it('concatene les classes plutot que de les remplacer', () => {
    // Un composant qui ecraserait ses propres classes perdrait sa mise en
    // forme des qu'on veut seulement le decaler d'un cran.
    const merged = mergePresentation(
      { className: 'o-relative o-overflow-hidden' },
      { className: 'o-mt-8' },
    )
    expect(merged.className).toBe('o-relative o-overflow-hidden o-mt-8')
  })

  it('laisse les styles de l appelant l emporter', () => {
    const merged = mergePresentation(
      { style: { opacity: 1, color: 'red' } },
      { style: { opacity: 0.5 } },
    )
    expect(merged.style).toEqual({ opacity: 0.5, color: 'red' })
  })

  it('ne rend aucun style quand personne n en donne', () => {
    // Un objet vide poserait un attribut style inutile sur chaque element.
    expect(mergePresentation({}, {}).style).toBeUndefined()
  })

  it('ne rend aucune classe quand personne n en donne', () => {
    expect(mergePresentation({}, {}).className).toBeUndefined()
  })

  it('ignore une classe vide', () => {
    expect(
      mergePresentation({ className: 'o-flex' }, { className: '  ' }).className,
    ).toBe('o-flex')
  })

  it('transmet les attributs DOM au travers du type', () => {
    interface OwnProps {
      vitesse?: number
    }

    function Aurore({ vitesse = 1, ...rest }: Customisable<OwnProps>): ReactElement {
      const { className, style } = mergePresentation({ className: 'aurore' }, rest)
      return <div {...rest} className={className} style={style} data-vitesse={vitesse} />
    }

    render(
      <Aurore
        vitesse={2}
        className="pose"
        style={{ opacity: 0.5 }}
        data-testid="hote"
        aria-label="fond anime"
      />,
    )

    const element = screen.getByTestId('hote')
    expect(element.className).toBe('aurore pose')
    expect(element.style.opacity).toBe('0.5')
    expect(element.getAttribute('aria-label')).toBe('fond anime')
    expect(element.dataset['vitesse']).toBe('2')
  })
})

describe('niveau 4 — le slot de rendu', () => {
  interface SlotArgs {
    progress: number
  }

  function Barre({ children }: { children?: Slot<SlotArgs> }): ReactElement {
    return (
      <div>
        {fromSlot(children, { progress: 0.42 }, () => (
          <span>par defaut</span>
        ))}
      </div>
    )
  }

  it('rend le balisage par defaut quand aucun slot n est fourni', () => {
    render(<Barre />)
    expect(screen.getByText('par defaut')).toBeDefined()
  })

  it('rend le slot et lui transmet ce qui a ete calcule', () => {
    render(<Barre>{({ progress }) => <span>{progress}</span>}</Barre>)
    expect(screen.getByText('0.42')).toBeDefined()
  })

  it('ne calcule pas le defaut quand un slot est fourni', () => {
    // Le defaut contient souvent des elements entiers : le construire pour le
    // jeter aussitot serait du travail perdu a chaque rendu.
    const fallback = vi.fn(() => null)
    fromSlot(() => null, {}, fallback)
    expect(fallback).not.toHaveBeenCalled()
  })
})

describe('niveau 5 — l echappatoire', () => {
  /** Composant minimal exposant `onReady`, comme le ferait une entree reelle. */
  function Piece({
    onReady,
    poids = 1,
  }: {
    onReady?: ReadyCallback<{ nom: string }>
    poids?: number
  }): ReactElement {
    const [element, setElement] = useState<HTMLElement | null>(null)
    const [handle] = useState(() => ({ nom: 'timeline' }))

    useOnReady(onReady, handle, element)
    return <div ref={setElement} data-testid="piece" data-poids={poids} />
  }

  it('appelle le rappel une fois l objet et l element disponibles', () => {
    const onReady = vi.fn()
    render(<Piece onReady={onReady} />)

    expect(onReady).toHaveBeenCalledTimes(1)
    expect(onReady.mock.calls[0]?.[0]).toMatchObject({ handle: { nom: 'timeline' } })
    expect(onReady.mock.calls[0]?.[0].element).toBeInstanceOf(HTMLElement)
  })

  it('ne rejoue pas le rappel quand le parent se rerend', () => {
    // Le cas qui justifie la reference : l'appelant ecrit une fonction en
    // ligne, donc une valeur neuve a chaque rendu. Un effet qui en dependrait
    // rejouerait l'echappatoire pour un survol ailleurs dans la page.
    const appels = vi.fn()

    function Parent(): ReactElement {
      const [n, setN] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setN(n + 1)}>
            rerendre
          </button>
          <Piece poids={n} onReady={(context) => appels(context.handle.nom)} />
        </>
      )
    }

    render(<Parent />)
    expect(appels).toHaveBeenCalledTimes(1)

    act(() => screen.getByText('rerendre').click())
    act(() => screen.getByText('rerendre').click())

    expect(screen.getByTestId('piece').dataset['poids']).toBe('2')
    expect(appels).toHaveBeenCalledTimes(1)
  })

  it('appelle le nettoyage rendu par le rappel', () => {
    // Une echappatoire qui pose un abonnement sans pouvoir le retirer serait
    // une fuite offerte par l'API elle-meme.
    const nettoyage = vi.fn()
    const { unmount } = render(<Piece onReady={() => nettoyage} />)

    expect(nettoyage).not.toHaveBeenCalled()
    unmount()
    expect(nettoyage).toHaveBeenCalledTimes(1)
  })

  it('ne fait rien sans rappel', () => {
    expect(() => render(<Piece />)).not.toThrow()
  })

  it('transmet l etat du mouvement', () => {
    // L'echappatoire contourne l'API du composant, pas la preference de
    // l'utilisateur : le rappel doit pouvoir la consulter.
    motionPolicy.configure({ reducedMotion: 'force' })

    const onReady = vi.fn()
    render(<Piece onReady={onReady} />)

    expect(onReady.mock.calls[0]?.[0].motion.reduced).toBe(true)
  })
})
