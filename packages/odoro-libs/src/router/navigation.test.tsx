/**
 * Le point d'accroche de navigation.
 *
 * Ce que ces tests protegent : le moteur d'animation doit pouvoir liberer ce
 * qui appartient a la page qui part, **avant** qu'elle parte, et mesurer la
 * nouvelle **apres** qu'elle a rendu. Un seul evenement, ou un evenement au
 * mauvais moment, produit des declencheurs de defilement cales sur les
 * positions de l'ancienne page — un defaut qui disparait au rechargement, donc
 * qu'on n'attribue jamais a la navigation.
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

/** Une application a deux pages. */
function App() {
  return (
    <Routes>
      <Route path="/" element={<Link to="/suite">aller</Link>} />
      <Route path="/suite" element={<p>page suite</p>} />
    </Routes>
  )
}

describe('abonnement', () => {
  it('rend de quoi se desabonner', () => {
    const vu: string[] = []
    const off = onNavigation((event) => vu.push(event.phase))

    emitNavigation({ phase: 'before', from: '/a', to: '/b' })
    off()
    emitNavigation({ phase: 'after', from: '/a', to: '/b' })

    expect(vu).toEqual(['before'])
  })

  it('previent tous les abonnes meme si l un echoue', () => {
    // Un abonne qui casse ne doit ni interrompre la navigation, ni priver les
    // autres de l'evenement : le moteur et un journal peuvent ecouter le meme.
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const survivant = vi.fn()

    onNavigation(() => {
      throw new Error('abonne fautif')
    })
    onNavigation(survivant)

    expect(() => emitNavigation({ phase: 'after', from: '/a', to: '/b' })).not.toThrow()
    expect(survivant).toHaveBeenCalledTimes(1)
  })
})

describe('emission par le router', () => {
  it('annonce les deux moments, dans l ordre', async () => {
    const evenements: string[] = []
    onNavigation((event) =>
      evenements.push(`${event.phase} ${event.from} -> ${event.to}`),
    )

    const history = createMemoryHistory(['/'])
    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    history.push('/suite')

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    await waitFor(() => expect(evenements).toHaveLength(2))

    expect(evenements).toEqual(['before / -> /suite', 'after / -> /suite'])
  })

  it('n annonce rien au premier rendu', async () => {
    // Le montage n'est pas une navigation : annoncer un `after` ferait
    // rafraichir des positions que personne n'a encore mesurees.
    const ecoute = vi.fn()
    onNavigation(ecoute)

    render(
      <Router history={createMemoryHistory(['/'])}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('aller')).toBeDefined())
    expect(ecoute).not.toHaveBeenCalled()
  })

  it('n annonce rien quand seul le fragment change', async () => {
    // Aller a `/suite#section` depuis `/suite` ne remplace aucune page : les
    // declencheurs de defilement restent valides, et les detruire couperait
    // une animation en cours pour rien.
    const ecoute = vi.fn()
    const history = createMemoryHistory(['/suite'])

    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    onNavigation(ecoute)
    history.push('/suite#section')

    await new Promise((resolve) => setTimeout(resolve, 30))
    expect(ecoute).not.toHaveBeenCalled()
  })

  it('annonce aussi un retour arriere', async () => {
    // Le retour du navigateur ne traverse jamais `navigate` : c'est pour cela
    // que l'abonnement passe par l'historique et non par le rendu.
    const evenements: string[] = []
    const history = createMemoryHistory(['/', '/suite'])

    render(
      <Router history={history}>
        <App />
      </Router>,
    )

    await waitFor(() => expect(screen.getByText('page suite')).toBeDefined())
    onNavigation((event) => evenements.push(event.phase))
    history.go(-1)

    await waitFor(() => expect(evenements).toEqual(['before', 'after']))
  })
})
