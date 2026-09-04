/**
 * @vitest-environment jsdom
 *
 * Ce que ces composants laissent derriere eux quand on les demonte.
 *
 * ## Pourquoi cette famille-la merite un essai a part
 *
 * Les entrees `text` de cette tranche ne rendent rien en WebGL : il n'y a ni
 * geometrie, ni texture, ni materiau a liberer. Mais chacune ouvre autre chose,
 * et chacune ouvre une chose differente : un observateur d'intersection, un
 * observateur de redimensionnement, une boucle d'images, un intervalle, des
 * animations. Cinq facons de fuir, cinq nettoyages a ecrire — et rien dans le
 * typage ne dit qu'on les a ecrits.
 *
 * Une fuite de cette famille ne casse rien tout de suite. Elle se voit sur une
 * page de documentation qu'on parcourt dix minutes, quand cent observateurs
 * detaches de leur element continuent de recevoir des evenements.
 *
 * ## Les doublures sont l'instrument de mesure
 *
 * `jsdom` n'implemente ni `IntersectionObserver`, ni `ResizeObserver`, ni
 * l'API d'animation. Il faut donc les fournir — et c'est une aubaine : en les
 * fournissant, on compte. Chaque `observe` et chaque `disconnect` passe par
 * nous, et le solde se lit a la fin.
 *
 * @module
 */

import { act, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { CountUp } from '../registry/text/count-up/component.js'
import { HighlightSweep } from '../registry/text/highlight-sweep/component.js'
import { RotatingWords } from '../registry/text/rotating-words/component.js'
import { SplitLines } from '../registry/text/split-lines/component.js'

/** Combien de cycles montage/demontage. */
const CYCLES = 100

/** Ce que les doublures comptent. */
interface Compteurs {
  observes: number
  detaches: number
  animations: number
  annulees: number
  intervalles: number
  images: number
}

let compteurs: Compteurs

beforeEach(() => {
  compteurs = {
    observes: 0,
    detaches: 0,
    animations: 0,
    annulees: 0,
    intervalles: 0,
    images: 0,
  }

  class ObservateurDouble {
    observe(): void {
      compteurs.observes += 1
    }
    unobserve(): void {
      /* rien : c'est `disconnect` que les composants emploient */
    }
    disconnect(): void {
      compteurs.detaches += 1
    }
    takeRecords(): readonly unknown[] {
      return []
    }
    readonly root = null
    readonly rootMargin = ''
    readonly thresholds: readonly number[] = []
  }

  globalThis.IntersectionObserver =
    ObservateurDouble as unknown as typeof IntersectionObserver
  globalThis.ResizeObserver = ObservateurDouble as unknown as typeof ResizeObserver

  // L'API d'animation : une doublure qui ne joue rien mais qui se souvient
  // d'avoir ete annulee.
  Element.prototype.animate = function animer(): Animation {
    compteurs.animations += 1
    return {
      cancel: () => {
        compteurs.annulees += 1
      },
      finish: () => undefined,
      play: () => undefined,
      pause: () => undefined,
    } as unknown as Animation
  }
})

afterEach(() => {
  compteurs.intervalles = 0
})

/** Monte, puis demonte, un nombre de fois. */
function cycler(element: () => ReactElement, cycles = CYCLES): void {
  for (let i = 0; i < cycles; i += 1) {
    const hote = document.createElement('div')
    document.body.append(hote)
    const racine = createRoot(hote)

    act(() => {
      racine.render(element())
    })

    act(() => {
      racine.unmount()
    })

    hote.remove()
  }
}

describe('ce qui est ouvert est referme', () => {
  it('detache autant d observateurs qu il en ouvre — split-lines', () => {
    // Deux par cycle : celui de l'entree dans le champ, celui de la mise en
    // page. Le second est le plus facile a oublier, parce qu'il est cree dans
    // le meme effet que la construction du calque.
    cycler(() => (
      <SplitLines>Une ligne n existe pas dans le DOM, elle se mesure.</SplitLines>
    ))

    expect(compteurs.observes).toBeGreaterThan(0)
    expect(compteurs.detaches).toBe(compteurs.observes)
  })

  it('annule toutes les animations qu il lance — split-lines', () => {
    cycler(() => (
      <SplitLines declenchement="montage">Une phrase de demonstration.</SplitLines>
    ))

    // Toutes, pas la plupart : une animation qui survit a son element garde une
    // reference sur lui, et l'element ne peut plus etre recycle.
    expect(compteurs.annulees).toBeGreaterThanOrEqual(compteurs.animations)
  })

  it('detache son observateur — count-up', () => {
    cycler(() => <CountUp value={12480} />)

    expect(compteurs.observes).toBeGreaterThan(0)
    expect(compteurs.detaches).toBe(compteurs.observes)
  })

  it('detache son observateur — highlight-sweep', () => {
    cycler(() => <HighlightSweep>mis en valeur</HighlightSweep>)

    expect(compteurs.observes).toBeGreaterThan(0)
    expect(compteurs.detaches).toBe(compteurs.observes)
  })

  it('detache son observateur — rotating-words', () => {
    cycler(() => <RotatingWords words={['vite', 'sur', 'ensemble']} />)

    expect(compteurs.observes).toBeGreaterThan(0)
    expect(compteurs.detaches).toBe(compteurs.observes)
  })

  it('ne cree aucun observateur quand le declenchement est au montage', () => {
    // Un observateur pose pour repondre a une question deja tranchee serait du
    // travail pur : le crochet court-circuite, et cet essai le tient.
    cycler(() => <CountUp value={7} declenchement="montage" />, 10)

    expect(compteurs.observes).toBe(0)
  })
})

describe('les minuteurs ne survivent pas au demontage', () => {
  it('rotating-words ne laisse aucun intervalle en cours', () => {
    const ouverts = new Set<unknown>()
    const vraiSet = globalThis.setInterval
    const vraiClear = globalThis.clearInterval

    globalThis.setInterval = ((...args: Parameters<typeof setInterval>) => {
      const id = vraiSet(...args)
      ouverts.add(id)
      return id
    }) as typeof setInterval

    globalThis.clearInterval = ((id?: Parameters<typeof clearInterval>[0]) => {
      ouverts.delete(id)
      vraiClear(id)
    }) as typeof clearInterval

    try {
      cycler(() => <RotatingWords words={['a', 'b']} />, 20)
    } finally {
      globalThis.setInterval = vraiSet
      globalThis.clearInterval = vraiClear
      for (const id of ouverts) vraiClear(id as Parameters<typeof clearInterval>[0])
    }

    // Un intervalle qui survit continue de reveiller le processeur pour un
    // composant qui n'est plus a l'ecran — et il en reste un par cycle.
    expect(ouverts.size).toBe(0)
  })

  it('count-up ne laisse aucune image en attente', () => {
    const ouvertes = new Set<number>()
    const vraiRaf = globalThis.requestAnimationFrame
    const vraiCancel = globalThis.cancelAnimationFrame

    globalThis.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      const id = vraiRaf(cb)
      ouvertes.add(id)
      return id
    }) as typeof requestAnimationFrame

    globalThis.cancelAnimationFrame = ((id: number) => {
      ouvertes.delete(id)
      vraiCancel(id)
    }) as typeof cancelAnimationFrame

    try {
      cycler(() => <CountUp value={999} declenchement="montage" />, 20)
    } finally {
      globalThis.requestAnimationFrame = vraiRaf
      globalThis.cancelAnimationFrame = vraiCancel
      for (const id of ouvertes) vraiCancel(id)
    }

    expect(ouvertes.size).toBe(0)
  })
})

describe('le texte reste lisible quoi qu il arrive', () => {
  it('split-lines garde le texte d origine dans le DOM', () => {
    const hote = document.createElement('div')
    document.body.append(hote)
    const racine = createRoot(hote)

    act(() => {
      racine.render(<SplitLines declenchement="montage">Bonjour le monde</SplitLines>)
    })

    // Le calque est `aria-hidden` ; ce qui reste lisible doit etre le noeud
    // d'origine, entier, et non une suite de fragments.
    const calque = hote.querySelector('[aria-hidden="true"]')
    calque?.remove()

    expect(hote.textContent).toBe('Bonjour le monde')

    act(() => {
      racine.unmount()
    })
    hote.remove()
  })

  it('count-up annonce la valeur finale, jamais les intermediaires', () => {
    const hote = document.createElement('div')
    document.body.append(hote)
    const racine = createRoot(hote)

    act(() => {
      racine.render(<CountUp value={1234} locale="fr-FR" declenchement="montage" />)
    })

    const calque = hote.querySelector('[aria-hidden="true"]')
    calque?.remove()

    // La valeur finale, formatee — et non « 0 », qui serait ce qu'un lecteur
    // d'ecran annoncerait si le calque etait le seul texte present.
    expect(hote.textContent).toContain('234')

    act(() => {
      racine.unmount()
    })
    hote.remove()
  })
})
