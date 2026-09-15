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

describe('level 3 — the pass-through', () => {
  it('concatenates the classes rather than replacing them', () => {
    // A component that overwrote its own classes would lose its formatting as
    // soon as you only wanted to shift it by one notch.
    const merged = mergePresentation(
      { className: 'o-relative o-overflow-hidden' },
      { className: 'o-mt-8' },
    )
    expect(merged.className).toBe('o-relative o-overflow-hidden o-mt-8')
  })

  it('lets the caller styles win', () => {
    const merged = mergePresentation(
      { style: { opacity: 1, color: 'red' } },
      { style: { opacity: 0.5 } },
    )
    expect(merged.style).toEqual({ opacity: 0.5, color: 'red' })
  })

  it('returns no style when nobody gives one', () => {
    // An empty object would set a useless style attribute on every element.
    expect(mergePresentation({}, {}).style).toBeUndefined()
  })

  it('returns no class when nobody gives one', () => {
    expect(mergePresentation({}, {}).className).toBeUndefined()
  })

  it('ignores an empty class', () => {
    expect(
      mergePresentation({ className: 'o-flex' }, { className: '  ' }).className,
    ).toBe('o-flex')
  })

  it('passes the DOM attributes through the type', () => {
    interface OwnProps {
      speed?: number
    }

    function Aurora({ speed = 1, ...rest }: Customisable<OwnProps>): ReactElement {
      const { className, style } = mergePresentation({ className: 'aurora' }, rest)
      return <div {...rest} className={className} style={style} data-speed={speed} />
    }

    render(
      <Aurora
        speed={2}
        className="placed"
        style={{ opacity: 0.5 }}
        data-testid="host"
        aria-label="animated background"
      />,
    )

    const element = screen.getByTestId('host')
    expect(element.className).toBe('aurora placed')
    expect(element.style.opacity).toBe('0.5')
    expect(element.getAttribute('aria-label')).toBe('animated background')
    expect(element.dataset['speed']).toBe('2')
  })
})

describe('level 4 — the render slot', () => {
  interface SlotArgs {
    progress: number
  }

  function Bar({ children }: { children?: Slot<SlotArgs> }): ReactElement {
    return (
      <div>
        {fromSlot(children, { progress: 0.42 }, () => (
          <span>default</span>
        ))}
      </div>
    )
  }

  it('renders the default markup when no slot is supplied', () => {
    render(<Bar />)
    expect(screen.getByText('default')).toBeDefined()
  })

  it('renders the slot and passes it what was computed', () => {
    render(<Bar>{({ progress }) => <span>{progress}</span>}</Bar>)
    expect(screen.getByText('0.42')).toBeDefined()
  })

  it('does not compute the default when a slot is supplied', () => {
    // The default often contains whole elements: building it only to throw it
    // away would be wasted work on every render.
    const fallback = vi.fn(() => null)
    fromSlot(() => null, {}, fallback)
    expect(fallback).not.toHaveBeenCalled()
  })
})

describe('level 5 — the escape hatch', () => {
  /** Minimal component exposing `onReady`, as a real entry would. */
  function Piece({
    onReady,
    weight = 1,
  }: {
    onReady?: ReadyCallback<{ name: string }>
    weight?: number
  }): ReactElement {
    const [element, setElement] = useState<HTMLElement | null>(null)
    const [handle] = useState(() => ({ name: 'timeline' }))

    useOnReady(onReady, handle, element)
    return <div ref={setElement} data-testid="piece" data-weight={weight} />
  }

  it('calls the callback once the object and the element are available', () => {
    const onReady = vi.fn()
    render(<Piece onReady={onReady} />)

    expect(onReady).toHaveBeenCalledTimes(1)
    expect(onReady.mock.calls[0]?.[0]).toMatchObject({ handle: { name: 'timeline' } })
    expect(onReady.mock.calls[0]?.[0].element).toBeInstanceOf(HTMLElement)
  })

  it('does not replay the callback when the parent re-renders', () => {
    // The case that justifies the ref: the caller writes an inline function,
    // so a fresh value on every render. An effect that depended on it would
    // replay the escape hatch for a hover elsewhere on the page.
    const calls = vi.fn()

    function Parent(): ReactElement {
      const [n, setN] = useState(0)
      return (
        <>
          <button type="button" onClick={() => setN(n + 1)}>
            re-render
          </button>
          <Piece weight={n} onReady={(context) => calls(context.handle.name)} />
        </>
      )
    }

    render(<Parent />)
    expect(calls).toHaveBeenCalledTimes(1)

    act(() => screen.getByText('re-render').click())
    act(() => screen.getByText('re-render').click())

    expect(screen.getByTestId('piece').dataset['weight']).toBe('2')
    expect(calls).toHaveBeenCalledTimes(1)
  })

  it('calls the cleanup returned by the callback', () => {
    // An escape hatch that sets a subscription without being able to remove it
    // would be a leak offered by the API itself.
    const cleanup = vi.fn()
    const { unmount } = render(<Piece onReady={() => cleanup} />)

    expect(cleanup).not.toHaveBeenCalled()
    unmount()
    expect(cleanup).toHaveBeenCalledTimes(1)
  })

  it('does nothing without a callback', () => {
    expect(() => render(<Piece />)).not.toThrow()
  })

  it('passes the motion state', () => {
    // The escape hatch bypasses the component's API, not the user's
    // preference: the callback must be able to consult it.
    motionPolicy.configure({ reducedMotion: 'force' })

    const onReady = vi.fn()
    render(<Piece onReady={onReady} />)

    expect(onReady.mock.calls[0]?.[0].motion.reduced).toBe(true)
  })
})
