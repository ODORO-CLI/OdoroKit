import { render, screen, waitFor } from '@testing-library/react'
import { type ReactElement } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { clock } from './clock.js'
import { OdoroEngine, useEngine, useMotionState } from './context.jsx'
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

/** Affiche l'etat du moteur, pour observer ce qu'un composant en recoit. */
function Sonde(): ReactElement {
  const engine = useEngine('Sonde')
  const state = useMotionState()
  return (
    <div>
      <span data-testid="fourni">{String(engine.provided)}</span>
      <span data-testid="surfaces">{engine.maxSurfaces}</span>
      <span data-testid="qualite">{state.quality}</span>
      <span data-testid="reduit">{String(state.reduced)}</span>
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

describe('hors fournisseur', () => {
  it('fonctionne avec les reglages par defaut', () => {
    // Un composant copie depuis le registre atterrit dans un projet qui n'a
    // peut-etre pas encore monte le fournisseur : le faire echouer ferait
    // croire que le composant est casse.
    const avertissement = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(<Sonde />)

    expect(screen.getByTestId('fourni').textContent).toBe('false')
    expect(screen.getByTestId('surfaces').textContent).toBe('2')
    expect(avertissement).toHaveBeenCalled()
  })

  it('n avertit qu une fois par appelant', () => {
    const avertissement = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    function Repete(): ReactElement {
      useEngine('MemeAppelant')
      return <span>ok</span>
    }

    render(
      <>
        <Repete />
        <Repete />
        <Repete />
      </>,
    )

    expect(avertissement).toHaveBeenCalledTimes(1)
  })

  it('cite l appelant dans l avertissement', () => {
    const avertissement = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    function Aurora(): ReactElement {
      useEngine('Aurora')
      return <span>ok</span>
    }
    render(<Aurora />)

    expect(String(avertissement.mock.calls[0]?.[0])).toContain('Aurora')
  })
})

describe('sous fournisseur', () => {
  it('signale sa presence et applique les reglages', async () => {
    render(
      <OdoroEngine quality="low" maxSurfaces={3}>
        <Sonde />
      </OdoroEngine>,
    )

    expect(screen.getByTestId('fourni').textContent).toBe('true')
    expect(screen.getByTestId('surfaces').textContent).toBe('3')
    await waitFor(() => expect(screen.getByTestId('qualite').textContent).toBe('low'))
  })

  it('n emet aucun avertissement', () => {
    const avertissement = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    render(
      <OdoroEngine>
        <Sonde />
      </OdoroEngine>,
    )

    expect(avertissement).not.toHaveBeenCalled()
  })

  it('impose la neutralisation demandee', async () => {
    render(
      <OdoroEngine reducedMotion="force">
        <Sonde />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('reduit').textContent).toBe('true'))
  })

  it('passe outre la preference systeme sur demande', async () => {
    setSystemReduced(true)

    render(
      <OdoroEngine reducedMotion="ignore">
        <Sonde />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('reduit').textContent).toBe('false'))
  })

  it('partage la meme horloge que hors fournisseur', () => {
    // L'unicite de la boucle est la garantie centrale du moteur : deux
    // fournisseurs imbriques ne doivent pas produire deux boucles.
    function Comparateur(): ReactElement {
      const inner = useEngine()
      return <span data-testid="meme">{String(inner.clock === clock)}</span>
    }

    render(
      <OdoroEngine>
        <OdoroEngine>
          <Comparateur />
        </OdoroEngine>
      </OdoroEngine>,
    )

    expect(screen.getByTestId('meme').textContent).toBe('true')
  })
})

describe('useMotionState', () => {
  it('se re-rend au changement de politique', async () => {
    render(
      <OdoroEngine quality="high">
        <Sonde />
      </OdoroEngine>,
    )

    await waitFor(() => expect(screen.getByTestId('qualite').textContent).toBe('high'))

    motionPolicy.configure({ quality: 'low' })

    await waitFor(() => expect(screen.getByTestId('qualite').textContent).toBe('low'))
  })

  it('ne boucle pas sur un instantane instable', () => {
    // Un instantane reconstruit a chaque lecture ferait boucler React sans
    // fin : le rendu doit simplement aboutir.
    expect(() =>
      render(
        <OdoroEngine>
          <Sonde />
        </OdoroEngine>,
      ),
    ).not.toThrow()
  })
})
