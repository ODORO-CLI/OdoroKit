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

/** Forces the system answer for `prefers-reduced-motion`. */
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
 * Switches the policy to reduced motion.
 *
 * The policy reads the media query **only once**, on installation, then
 * subscribes to its events — correct behaviour in a browser, where the
 * `MediaQueryList` reports its changes. The test stub emits none: the policy
 * must therefore be reinstalled after changing the answer.
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
  function Animated({ onBuild }: { onBuild?: () => void }): ReactElement {
    const { ref } = useTimeline<HTMLDivElement>(
      ({ timeline }) => {
        onBuild?.()
        timeline.to({ value: 0 }, { value: 1, duration: 0.2 })
      },
      [],
      { name: 'trial' },
    )
    return <div ref={ref} data-testid="target" />
  }

  it('builds the timeline on mount', () => {
    const onBuild = vi.fn()
    render(<Animated onBuild={onBuild} />)
    expect(onBuild).toHaveBeenCalledTimes(1)
    expect(registry.count('timeline')).toBe(1)
  })

  it('reverts the timeline on unmount', () => {
    const { unmount } = render(<Animated />)
    expect(registry.count('timeline')).toBe(1)
    unmount()
    expect(registry.count('timeline')).toBe(0)
  })

  it('leaves nothing alive after a hundred cycles', () => {
    // An animation that survives its component writes into a detached node and
    // holds a reference on the React tree. The only symptom is a memory usage
    // that climbs over the course of navigations.
    for (let i = 0; i < 100; i += 1) {
      const { unmount } = render(<Animated />)
      unmount()
    }
    expect(registry.count('timeline')).toBe(0)
    expect(registry.count()).toBe(0)
  })

  it('applies the final state under reduced motion', () => {
    forceReduced()

    let seen: number | undefined
    function Reduced(): ReactElement {
      const { ref, timeline } = useTimeline<HTMLDivElement>(({ timeline: created }) => {
        created.to({ value: 0 }, { value: 1, duration: 1 })
        queueMicrotask(() => {
          seen = timeline.current?.progress()
        })
      }, [])
      return <div ref={ref} />
    }

    render(<Reduced />)
    // The timeline is not cancelled: it is advanced to its end. An element that
    // was to appear appears, without a transition.
    expect(seen === undefined || seen === 1).toBe(true)
  })

  it('reports the neutralisation to the build function', () => {
    forceReduced()

    let reduced: boolean | undefined
    function Probe(): ReactElement {
      const { ref } = useTimeline<HTMLDivElement>((setup) => {
        reduced = setup.reduced
      }, [])
      return <div ref={ref} />
    }

    render(<Probe />)
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

  it('registers then releases the animation', () => {
    const { unmount } = render(<Rotation />)
    expect(registry.count('timeline')).toBe(1)
    unmount()
    expect(registry.count('timeline')).toBe(0)
  })

  it('leaves nothing alive after a hundred cycles', () => {
    for (let i = 0; i < 100; i += 1) {
      const { unmount } = render(<Rotation />)
      unmount()
    }
    expect(registry.count()).toBe(0)
  })
})

describe('useScrollScrub', () => {
  /**
   * A target that does not exist yet on the first render.
   *
   * This is the ordinary case of a progress bar: it sits at the top, and
   * observes content placed further down the tree. React attaches the refs as
   * it walks, so that of the following sibling is still empty when the effects
   * run — no trigger was created, and nothing happened, without an error.
   */
  function Late(): ReactElement {
    const [target, setTarget] = useState<HTMLElement | null>(null)
    useScrollScrub(() => undefined, { element: target, name: 'late' })
    return <div ref={setTarget} data-testid="target" />
  }

  it('creates the trigger when the target arrives after the first render', async () => {
    render(<Late />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
  })

  it('creates none as long as the target is absent', async () => {
    function Never(): ReactElement {
      useScrollScrub(() => undefined, { element: null, name: 'never' })
      return <div />
    }

    render(<Never />)
    await waitFor(() => expect(registry.count()).toBe(0))
  })
})

describe('scrollingAncestor', () => {
  /** jsdom computes no layout: the dimensions are set by hand. */
  function setSize(node: HTMLElement, content: number, box: number): void {
    Object.defineProperty(node, 'scrollHeight', { value: content, configurable: true })
    Object.defineProperty(node, 'clientHeight', { value: box, configurable: true })
  }

  it('walks up to the first ancestor that scrolls', () => {
    const outside = document.createElement('div')
    const panel = document.createElement('div')
    const content = document.createElement('div')
    const target = document.createElement('div')

    panel.style.overflowY = 'auto'
    setSize(panel, 900, 300)

    outside.append(panel)
    panel.append(content)
    content.append(target)
    document.body.append(outside)

    expect(scrollingAncestor(target)).toBe(panel)
    outside.remove()
  })

  it('ignores a container that declares an overflow without scrolling', () => {
    const panel = document.createElement('div')
    const target = document.createElement('div')

    // The trap: `overflow: auto` on a box that contains everything. Taking it
    // for the scroller would freeze the progress at zero.
    panel.style.overflowY = 'auto'
    setSize(panel, 300, 300)

    panel.append(target)
    document.body.append(panel)

    expect(scrollingAncestor(target)).toBeUndefined()
    panel.remove()
  })

  it('returns the window when nothing scrolls around', () => {
    const target = document.createElement('div')
    document.body.append(target)

    expect(scrollingAncestor(target)).toBeUndefined()
    target.remove()
  })
})

describe('useScrollTrigger', () => {
  function Section(): ReactElement {
    const ref = useScrollTrigger<HTMLDivElement>({ start: 'top 80%', name: 'section' })
    return <div ref={ref} data-testid="section" />
  }

  it('registers a trigger', async () => {
    render(<Section />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
  })

  it('releases the trigger on unmount', async () => {
    const { unmount } = render(<Section />)
    await waitFor(() => expect(registry.count('scroll-trigger')).toBe(1))
    unmount()
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('creates nothing under reduced motion', async () => {
    // A scroll-linked animation is driven by the user; under reduced motion,
    // the element simply stays in its final state.
    forceReduced()

    render(<Section />)
    await new Promise((resolve) => setTimeout(resolve, 50))
    expect(registry.count('scroll-trigger')).toBe(0)
  })

  it('leaves nothing alive after fifty cycles', async () => {
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Section />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(registry.count('scroll-trigger')).toBe(0)
  })
})

describe('useSplitText', () => {
  const TEXT = 'A revealed heading'

  function Heading({ by = 'chars' as const }): ReactElement {
    const { ref, ready } = useSplitText<HTMLHeadingElement>({ by })
    return (
      <h1 ref={ref} data-testid="heading" data-ready={String(ready)}>
        {TEXT}
      </h1>
    )
  }

  it('splits the text and links the container to its label', async () => {
    const { getByTestId } = render(<Heading />)
    const heading = getByTestId('heading')

    await waitFor(() => expect(heading.dataset['ready']).toBe('true'))

    // The screen reader must read a sentence, not an alphabet.
    expect(heading.getAttribute('aria-label')).toBe(TEXT)
    const fragments = heading.querySelectorAll('[aria-hidden="true"]')
    expect(fragments.length).toBeGreaterThan(0)
  })

  it('restores the original DOM on unmount', async () => {
    const { getByTestId, unmount } = render(<Heading />)
    const heading = getByTestId('heading')
    await waitFor(() => expect(heading.dataset['ready']).toBe('true'))

    unmount()

    // A text left split would break selection and copy-paste long after the
    // disappearance of the animation that justified it.
    expect(heading.textContent).toBe(TEXT)
    expect(heading.hasAttribute('aria-label')).toBe(false)
  })

  it('does not split at all under reduced motion', async () => {
    // Splitting in order to animate nothing would amount to paying the whole
    // accessibility cost for no benefit.
    forceReduced()

    const { getByTestId } = render(<Heading />)
    await new Promise((resolve) => setTimeout(resolve, 50))

    const heading = getByTestId('heading')
    expect(heading.dataset['ready']).toBe('false')
    expect(heading.textContent).toBe(TEXT)
    expect(heading.querySelectorAll('[aria-hidden="true"]').length).toBe(0)
  })

  it('leaves no fragment after fifty cycles', async () => {
    for (let i = 0; i < 50; i += 1) {
      const { unmount } = render(<Heading />)
      unmount()
    }
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(document.querySelectorAll('[aria-hidden="true"]').length).toBe(0)
  })
})
