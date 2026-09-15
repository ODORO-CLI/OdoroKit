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

/** Retrieves the options of the last animation started on an element. */
function lastTiming(element: Element): KeyframeAnimationOptions {
  const spy = element.animate as unknown as ReturnType<typeof vi.fn>
  const call = spy.mock.calls.at(-1)
  return (call?.[1] ?? {}) as KeyframeAnimationOptions
}

describe('motion tokens', () => {
  it('converts the design token durations into milliseconds', () => {
    expect(motionDuration.instant).toBe(0)
    expect(motionDuration.base).toBe(200)
    expect(motionDuration.slow).toBe(320)
  })

  it('resolves a named or numeric duration', () => {
    expect(resolveDuration('slow')).toBe(320)
    expect(resolveDuration(450)).toBe(450)
  })

  it('resolves a named curve and lets a CSS value through', () => {
    expect(resolveEasing('entrance')).toBe(motionEasing.entrance)
    expect(resolveEasing('steps(4, end)')).toBe('steps(4, end)')
  })
})

describe('style manipulation', () => {
  it('applies then removes inline properties', () => {
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

  it('starts an animation with the requested duration and curve', async () => {
    render(<Box />)
    const box = screen.getByTestId('box')
    vi.spyOn(box, 'animate')

    box.click()

    await waitFor(() => expect(box.animate).toHaveBeenCalledTimes(1))
    expect(lastTiming(box).duration).toBe(motionDuration.fast)
    expect(lastTiming(box).fill).toBe('both')
  })

  it('brings the duration down to zero under prefers-reduced-motion', async () => {
    setReducedMotion(true)
    render(<Box />)
    const box = screen.getByTestId('box')
    vi.spyOn(box, 'animate')

    box.click()

    await waitFor(() => expect(box.animate).toHaveBeenCalled())
    // The animation is neutralized, but it does take place: the final state is
    // applied.
    expect(lastTiming(box).duration).toBe(0)
  })

  it('resolves the promise even when the animation is cancelled', async () => {
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

  it('does nothing if the ref is not attached', async () => {
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
  it('renders the content visible before any intersection', () => {
    render(<Reveal>Contenu</Reveal>)
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('applies the starting state in the layout layer', () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    expect(screen.getByTestId('cible').style.opacity).toBe('0')
  })

  it('animates on entry into the viewport', async () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    const target = screen.getByTestId('cible')
    vi.spyOn(target, 'animate')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(target.animate).toHaveBeenCalledTimes(1))
    expect(lastTiming(target).delay).toBe(0)
  })

  it('removes the starting style once the animation is over', async () => {
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    const target = screen.getByTestId('cible')

    act(() => triggerIntersection(true))

    await waitFor(() => expect(target.style.opacity).toBe(''))
  })

  it('applies no starting state under prefers-reduced-motion', () => {
    setReducedMotion(true)
    render(<Reveal data-testid="cible">Contenu</Reveal>)
    expect(screen.getByTestId('cible').style.opacity).toBe('')
  })

  it('applies no starting state when it is disabled', () => {
    render(
      <Reveal data-testid="cible" disabled>
        Contenu
      </Reveal>,
    )
    expect(screen.getByTestId('cible').style.opacity).toBe('')
  })

  it('renders the requested element and passes the attributes on', () => {
    render(
      <Reveal as="section" className="o-p-4" aria-label="bloc">
        Contenu
      </Reveal>,
    )
    const section = screen.getByLabelText('bloc')
    expect(section.tagName).toBe('SECTION')
    expect(section.className).toBe('o-p-4')
  })

  it('replays the animation on every entry when once is false', async () => {
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
  it('offsets the delay of each child', async () => {
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

  it('caps the cumulated delay', async () => {
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

  it('renders all its children', () => {
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

  it('renders the element present from the start, without entrance animation', () => {
    const { rerender } = render(<Panel open />)
    expect(screen.getByTestId('panneau').dataset['status']).toBe('entered')
    rerender(<Panel open />)
    expect(screen.getByTestId('panneau')).toBeDefined()
  })

  it('renders nothing when the element is absent', () => {
    render(<Panel open={false} />)
    expect(screen.queryByTestId('panneau')).toBeNull()
  })

  it('keeps the element mounted during its exit, then unmounts it', async () => {
    const { rerender } = render(<Panel open />)
    expect(screen.getByTestId('panneau')).toBeDefined()

    rerender(<Panel open={false} />)
    expect(screen.getByTestId('panneau').dataset['status']).toBe('exiting')

    await waitFor(() => expect(screen.queryByTestId('panneau')).toBeNull())
  })

  it('animates the entrance when the element appears', async () => {
    const { rerender } = render(<Panel open={false} />)
    rerender(<Panel open />)

    const panel = screen.getByTestId('panneau')
    expect(panel.dataset['status']).toBe('entering')
    await waitFor(() => expect(panel.dataset['status']).toBe('entered'))
  })

  it('unmounts immediately under prefers-reduced-motion', () => {
    setReducedMotion(true)
    const { rerender } = render(<Panel open />)
    rerender(<Panel open={false} />)
    expect(screen.queryByTestId('panneau')).toBeNull()
  })

  it('plays the entrance animation on the first render if initial is true', () => {
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
  it('plays an animation on mount from from and to', async () => {
    // The animation starts on mount: the stub must be set on the
    // prototype, before the element exists.
    const animate = vi.spyOn(Element.prototype, 'animate')

    render(<Animate from={{ opacity: 0 }} data-testid="cible" duration="fast" />)

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1))
    const [keyframes, options] = animate.mock.calls[0] ?? []
    expect(keyframes).toEqual([{ opacity: 0 }, { opacity: 1, transform: 'none' }])
    expect((options as KeyframeAnimationOptions).duration).toBe(motionDuration.fast)
  })

  it('plays nothing without keyframes nor from', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    render(<Animate data-testid="cible" />)
    await waitFor(() => expect(screen.getByTestId('cible')).toBeDefined())
    expect(animate).not.toHaveBeenCalled()
  })

  it('favors keyframes over from and to', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    const keyframes = [{ transform: 'rotate(0deg)' }, { transform: 'rotate(360deg)' }]

    render(<Animate keyframes={keyframes} from={{ opacity: 0 }} data-testid="cible" />)

    await waitFor(() => expect(animate).toHaveBeenCalledTimes(1))
    expect(animate.mock.calls[0]?.[0]).toBe(keyframes)
  })

  it('replays the animation on trigger change', async () => {
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

  it('respects the play property', async () => {
    const animate = vi.spyOn(Element.prototype, 'animate')
    render(<Animate from={{ opacity: 0 }} play={false} data-testid="cible" />)
    await waitFor(() => expect(screen.getByTestId('cible')).toBeDefined())
    expect(animate).not.toHaveBeenCalled()
  })
})
