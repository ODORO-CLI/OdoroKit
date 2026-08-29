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

describe('enregistrement', () => {
  it('charge et enregistre un plugin', async () => {
    expect(isPluginRegistered('ScrollTrigger')).toBe(false)

    await expect(ensurePlugin('ScrollTrigger')).resolves.toBe(true)

    expect(isPluginRegistered('ScrollTrigger')).toBe(true)
    expect(registeredPlugins()).toContain('ScrollTrigger')
  })

  it('n enregistre qu une seule fois malgre des appels repetes', async () => {
    // Le mode strict de React execute chaque effet deux fois au montage : un
    // enregistrement naif produirait des declencheurs en double, qui se
    // rafraichissent deux fois et laissent la moitie d'entre eux orphelins.
    const register = vi.spyOn(gsap, 'registerPlugin')

    await ensurePlugin('ScrollTrigger')
    await ensurePlugin('ScrollTrigger')
    await ensurePlugin('ScrollTrigger')

    expect(register).toHaveBeenCalledTimes(1)
  })

  it('partage la meme promesse entre demandes concurrentes', async () => {
    const register = vi.spyOn(gsap, 'registerPlugin')

    const [a, b, c] = await Promise.all([
      ensurePlugin('SplitText'),
      ensurePlugin('SplitText'),
      ensurePlugin('SplitText'),
    ])

    expect([a, b, c]).toEqual([true, true, true])
    expect(register).toHaveBeenCalledTimes(1)
  })

  it('charge plusieurs plugins en parallele', async () => {
    await expect(ensurePlugins(['ScrollTrigger', 'SplitText'])).resolves.toBe(true)
    expect(isPluginRegistered('ScrollTrigger')).toBe(true)
    expect(isPluginRegistered('SplitText')).toBe(true)
  })

  it('ne signale rien comme enregistre avant demande', () => {
    expect(isPluginRegistered('Observer')).toBe(false)
    expect(registeredPlugins()).toEqual([])
  })
})

describe('accesseurs typés', () => {
  it('rend la valeur du declencheur de defilement', async () => {
    const ScrollTriggerClass = await loadScrollTrigger()
    expect(ScrollTriggerClass).not.toBeNull()
    expect(typeof ScrollTriggerClass?.create).toBe('function')
    expect(typeof ScrollTriggerClass?.refresh).toBe('function')
  })

  it('rend la valeur du decoupeur de texte', async () => {
    const SplitTextClass = await loadSplitText()
    expect(SplitTextClass).not.toBeNull()
    expect(typeof SplitTextClass).toBe('function')
  })

  it('rend la meme valeur a chaque appel', async () => {
    const first = await loadScrollTrigger()
    const second = await loadScrollTrigger()
    expect(second).toBe(first)
  })
})
