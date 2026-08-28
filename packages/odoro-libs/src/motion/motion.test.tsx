import { act, render, screen, waitFor } from '@testing-library/react'
import { type ReactElement, useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import { setReducedMotion, triggerIntersection } from '../../test/setup.js'
import { Animate } from './Animate.jsx'
import { Reveal } from './Reveal.jsx'
import { Stagger } from './Stagger.jsx'
import { applyStyles, clearStyles } from './keyframes.js'
import { motionDuration, motionEasing, resolveDuration, resolveEasing } from './tokens.js'
import { useAnimate } from './useAnimate.js'
import { usePresence } from './usePresence.js'

/** Recupere les options de la derniere animation lancee sur un element. */
function lastTiming(element: Element): KeyframeAnimationOptions {
  const spy = element.animate as unknown as ReturnType<typeof vi.fn>
  const call = spy.mock.calls.at(-1)
  return (call?.[1] ?? {}) as KeyframeAnimationOptions
}

describe('tokens de mouvement', () => {
  it('convertit les durees des design tokens en millisecondes', () => {
    expect(motionDuration.instant).toBe(0)
    expect(motionDuration.base).toBe(200)
    expect(motionDuration.slow).toBe(320)
  })

  it('resout une duree nommee ou numerique', () => {
    expect(resolveDuration('slow')).toBe(320)
    expect(resolveDuration(450)).toBe(450)
  })

  it('resout une courbe nommee et laisse passer une valeur CSS', () => {
    expect(resolveEasing('entrance')).toBe(motionEasing.entrance)
    expect(resolveEasing('steps(4, end)')).toBe('steps(4, end)')
  })
})

describe('manipulation des styles', () => {
  it('applique puis retire des proprietes inline', () => {
    const element = document.createElement('div')
    applyStyles(element, { opacity: 0, backgroundColor: 'red' })
    expect(element.style.opacity).toBe('0')
    expect(element.style.backgroundColor).toBe('red')

    clearStyles(element, { opacity: 0, backgroundColor: 'red' })
    expect(element.style.opacity).toBe('')
    expect(element.style.backgroundColor).toBe('')
  })
})

describe('useAnimate', () => {
  function Box({ duration = 'fast' as const }): ReactElement {
    const [ref, controls] = useAnimate<HTMLDivElement>()
    return (
      <div
        ref={ref}
        data-testid="box"
        onClick={() => void controls.play([{ opacity: 0 }, { opacity: 1 }], { duration })}
      />
    )
  }

  it('lance une animation avec la duree et la courbe demandees', async () => {
    render(<Box />)
    const box = screen.getByTestId('box')
    vi.spyOn(box, 'animate')

    box.click()

    await waitFor(() => expect(box.animate).toHaveBeenCalledTimes(1))
    expect(lastTiming(box).duration).toBe(motionDuration.fast)
    expect(lastTiming(box).fill).toBe('both')
  })

  it('ramene la duree a zero sous prefers-reduced-motion', async () => {
    setReducedMotion(true)
    render(<Box />)
    const box = screen.getByTestId('box')
    vi.spyOn(box, 'animate')

    box.click()

    await waitFor(() => expect(box.animate).toHaveBeenCalled())
    // L'animation est neutralisee, mais elle a bien lieu : l'etat final est
    // applique.
    expect(lastTiming(box).duration).toBe(0)
  })

  it('resout la promesse meme lorsque l animation est annulee', async () => {
    function Cancelling(): ReactElement {
      const [ref, controls] = useAnimate<HTMLDivElement>()
      const [done, setDone] = useState(false)
      return (
        <div
          ref={ref}
          data-testid="box"
          onClick={() => {
            void controls
              .play([{ opacity: 0 }, { opacity: 1 }], { duration: 300 })
              .then(() => {
                setDone(true)
              })
            controls.cancel()
          }}
        >
          {done ? 'resolue' : 'en cours'}
        </div>
      )
    }

    render(<Cancelling />)
    screen.getByTestId('box').click()
    await waitFor(() => expect(screen.getByText('resolue')).toBeDefined())
  })

  it('ne fait rien si la ref n est pas attachee', async () => {
    function Detached(): ReactElement {
      const [, controls] = useAnimate<HTMLDivElement>()
      const [done, setDone] = useState(false)
      return (
        <button
          onClick={() => {
            void controls.play([{ opacity: 1 }]).then(() => setDone(true))
          }}
        >
          {done ? 'resolue' : 'inerte'}
        </button>
      )
    }

    render(<Detached />)
    screen.getByRole('button').click()
    await waitFor(() => expect(screen.getByText('resolue')).toBeDefined())
  })
})

describe('Reveal', () => {
  it('rend le contenu visible avant toute intersection', () => {
    render(<Reveal>Contenu</Reveal>)
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('applique l etat de depart en couche layout', () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    expect(screen.getByTestId('cible').style.opacity).toBe('0')
  })

  it('anime a l entree dans le viewport', async () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    const target = screen.getByTestId('cible')
    vi.spyOn(target, 'animate')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(target.animate).toHaveBeenCalledTimes(1))
    expect(lastTiming(target).delay).toBe(0)
  })

  it('retire le style de depart une fois l animation terminee', async () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    const target = screen.getByTestId('cible')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(target.style.opacity).toBe(''))
  })

  it('n applique aucun etat de depart sous prefers-reduced-motion', () => {
    setReducedMotion(true)
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    expect(screen.getByTestId('cible').style.opacity).toBe('')
  })

  it('n applique aucun etat de depart quand elle est desactivee', () => {
    render(
      <Reveal data-testid="cible" disabled>
        Contenu
      </Reveal>,
    )
    expect(screen.getByTestId('cible').style.opacity).toBe('')
  })

  it('rend l element demande et transmet les attributs', () => {
    render(
      <Reveal as="section" className="o-p-4" aria-label="bloc">
        Contenu
      </Reveal>,
    )
    const section = screen.getByLabelText('bloc')
    expect(section.tagName).toBe('SECTION')
    expect(section.className).toBe('o-p-4')
  })

  it('rejoue l animation a chaque entree quand once vaut false', async () => {
    render(
      <Reveal data-testid="cible" once={false}>
        Contenu
      </Reveal>,
    )
    const target = screen.getByTestId('cible')
    vi.spyOn(target, 'animate')

    act(() => triggerIntersection(true))
    await waitFor(() => expect(target.animate).toHaveBeenCalledTimes(1))

    act(() => triggerIntersection(false))
    act(() => triggerIntersection(true))
    await waitFor(() => expect(target.animate).toHaveBeenCalledTimes(2))
  })
})

describe('Stagger', () => {
  it('decale le retard de chaque enfant', async () => {
    render(
      <Stagger step={50} data-testid="liste">
        <span>un</span>
        <span>deux</span>
        <span>trois</span>
      </Stagger>,
    )

    const items = [...screen.getByTestId('liste').children] as HTMLElement[]
    expect(items).toHaveLength(3)
    for (const item of items) vi.spyOn(item, 'animate')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(items[0]?.animate).toHaveBeenCalled())
    expect(items.map((item) => lastTiming(item).delay)).toEqual([0, 50, 100])
  })

  it('plafonne le retard cumule', async () => {
    render(
      <Stagger step={100} maxDelay={150} data-testid="liste">
        <span>un</span>
        <span>deux</span>
        <span>trois</span>
      </Stagger>,
    )

    const items = [...screen.getByTestId('liste').children] as HTMLElement[]
    for (const item of items) vi.spyOn(item, 'animate')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(items[2]?.animate).toHaveBeenCalled())
    expect(items.map((item) => lastTiming(item).delay)).toEqual([0, 100, 150])
  })

  it('rend tous ses enfants', () => {
    render(
      <Stagger>
        <span>un</span>
        <span>deux</span>
      </Stagger>,
    )
    expect(screen.getByText('un')).toBeDefined()
    expect(screen.getByText('deux')).toBeDefined()
  })
})

describe('usePresence', () => {
  function Panel({ open }: { open: boolean }): ReactElement | null {
    const { ref, isMounted, status } = usePresence<HTMLDivElement>(open, {
      duration: 'fastest',
    })
    if (!isMounted) return null
    return (
      <div ref={ref} data-testid="panneau" data-status={status}>
        Panneau
      </div>
    )
  }

  it('rend l element present des le depart, sans animation d entree', () => {
    const { rerender } = render(<Panel open />)
    expect(screen.getByTestId('panneau').dataset['status']).toBe('entered')
    rerender(<Panel open />)
    expect(screen.getByTestId('panneau')).toBeDefined()
  })

  it('ne rend rien quand l element est absent', () => {
    render(<Panel open={false} />)
    expect(screen.queryByTestId('panneau')).toBeNull()
  })

  it('maintient l element monte pendant sa sortie, puis le demonte', async () => {
    const { rerender } = render(<Panel open />)
    expect(screen.getByTestId('panneau')).toBeDefined()

    rerender(<Panel open={false} />)
    expect(screen.getByTestId('panneau').dataset['status']).toBe('exiting')

    await waitFor(() => expect(screen.queryByTestId('panneau')).toBeNull())
  })

  it('anime l entree quand l element apparait', async () => {
    const { rerender } = render(<Panel open={false} />)
    rerender(<Panel open />)

    const panel = screen.getByTestId('panneau')
    expect(panel.dataset['status']).toBe('entering')
    await waitFor(() => expect(panel.dataset['status']).toBe('entered'))
  })

  it('demonte immediatement sous prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Panel open />)
    rerender(<Panel open={false} />)
    expect(screen.queryByTestId('panneau')).toBeNull()
  })

  it('joue l animation d entree au premier rendu si initial vaut true', () => {
    function Eager(): ReactElement | null {
      const { ref, isMounted, status } = usePresence<HTMLDivElement>(true, {
        initial: true,
      })
      if (!isMounted) return null
      return <div ref={ref} data-testid="eager" data-status={status} />
    }
    render(<Eager />)
    expect(screen.getByTestId('eager').dataset['status']).toBe('entering')
  })
})

describe('Animate', () => {
  it('joue une animation au montage a partir de from et to', async () => {
    // L'animation part au montage : la doublure doit etre posee sur le
    // prototype, avant que l'element n'existe.
    const animate = vi.spyOn(Element.prototype, 'animate')

    render(<Animate from={{ opacity: 0 }} data-testid="cible" duration="fast" />)

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1))
    const [keyframes, options] = animate.mock.calls[0] ?? []
    expect(keyframes).toEqual([{ opacity: 0 }, { opacity: 1, transform: 'none' }])
    expect((options as KeyframeAnimationOptions).duration).toBe(motionDuration.fast)
  })

  it('ne joue rien sans keyframes ni from', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    render(<Animate data-testid="cible" />)
    await waitFor(() => expect(screen.getByTestId('cible')).toBeDefined())
    expect(animate).not.toHaveBeenCalled()
  })

  it('privilegie keyframes sur from et to', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    const keyframes = [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }]

    render(<Animate keyframes={keyframes} from={{ opacity: 0 }} data-testid="cible" />)

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1))
    expect(animate.mock.calls[0]?.[0]).toBe(keyframes)
  })

  it('rejoue l animation au changement de trigger', async () => {
    function Host(): ReactElement {
      const [count, setCount] = useState(0)
      return (
        <div>
          <button onClick={() => setCount((value) => value + 1)}>rejouer</button>
          <Animate from={{ opacity: 0 }} trigger={count} data-testid="cible" />
        </div>
      )
    }

    render(<Host />)
    const target = screen.getByTestId('cible')
    vi.spyOn(target, 'animate')

    screen.getByRole('button').click()

    await waitFor(() => expect(target.animate).toHaveBeenCalledTimes(1))
  })

  it('respecte la propriete play', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    render(<Animate from={{ opacity: 0 }} play={false} data-testid="cible" />)
    await waitFor(() => expect(screen.getByTestId('cible')).toBeDefined())
    expect(animate).not.toHaveBeenCalled()
  })
})
