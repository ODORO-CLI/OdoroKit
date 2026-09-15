import gsap from 'gsap'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  ensurePlugin,
  ensurePlugins,
  isPluginRegistered,
  loadScrollTrigger,
  loadSplitText,
  registeredPlugins,
  resetPluginRegistry,
} from './setup.js'

afterEach(() => {
  resetPluginRegistry()
})

describe('registration', () => {
  it('loads and registers a plugin', async () => {
    expect(isPluginRegistered('ScrollTrigger')).toBe(false)

    await expect(ensurePlugin('ScrollTrigger')).resolves.toBe(true)

    expect(isPluginRegistered('ScrollTrigger')).toBe(true)
    expect(registeredPlugins()).toContain('ScrollTrigger')
  })

  it('registers only once despite repeated calls', async () => {
    // React strict mode runs every effect twice on mount: a naive registration
    // would produce duplicate triggers, which refresh twice and leave half of
    // them orphaned.
    const register = vi.spyOn(gsap, 'registerPlugin')

    await ensurePlugin('ScrollTrigger')
    await ensurePlugin('ScrollTrigger')
    await ensurePlugin('ScrollTrigger')

    expect(register).toHaveBeenCalledTimes(1)
  })

  it('shares the same promise between concurrent requests', async () => {
    const register = vi.spyOn(gsap, 'registerPlugin')

    const [a, b, c] = await Promise.all([
      ensurePlugin('SplitText'),
      ensurePlugin('SplitText'),
      ensurePlugin('SplitText'),
    ])

    expect([a, b, c]).toEqual([true, true, true])
    expect(register).toHaveBeenCalledTimes(1)
  })

  it('loads several plugins in parallel', async () => {
    await expect(ensurePlugins(['ScrollTrigger', 'SplitText'])).resolves.toBe(true)
    expect(isPluginRegistered('ScrollTrigger')).toBe(true)
    expect(isPluginRegistered('SplitText')).toBe(true)
  })

  it('reports nothing as registered before a request', () => {
    expect(isPluginRegistered('Observer')).toBe(false)
    expect(registeredPlugins()).toEqual([])
  })
})

describe('typed accessors', () => {
  it('returns the value of the scroll trigger', async () => {
    const ScrollTriggerClass = await loadScrollTrigger()
    expect(ScrollTriggerClass).not.toBeNull()
    expect(typeof ScrollTriggerClass?.create).toBe('function')
    expect(typeof ScrollTriggerClass?.refresh).toBe('function')
  })

  it('returns the value of the text splitter', async () => {
    const SplitTextClass = await loadSplitText()
    expect(SplitTextClass).not.toBeNull()
    expect(typeof SplitTextClass).toBe('function')
  })

  it('returns the same value on every call', async () => {
    const first = await loadScrollTrigger()
    const second = await loadScrollTrigger()
    expect(second).toBe(first)
  })
})
