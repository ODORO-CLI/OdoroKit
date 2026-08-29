/**
 * Le conteneur, et surtout ses promesses de typage.
 *
 * Les assertions de valeur ne disent pas grand-chose d'un conteneur : ce qui
 * compte est ce que TypeScript en sait. Les cas de typage sont donc verifies
 * a la compilation, par des expressions qui ne compileraient pas si
 * l'inference etait perdue — `tsc --noEmit` fait echouer la suite avant meme
 * qu'elle s'execute.
 *
 * @module
 */

import { describe, expect, it, vi } from 'vitest'

import { createContainer } from './container.js'

describe('resolution', () => {
  it('rend le service enregistre', () => {
    const c = createContainer().register('nombre', () => 42)
    expect(c.get('nombre')).toBe(42)
  })

  it('infere le type sans annotation', () => {
    const c = createContainer()
      .register('nom', () => 'odoro')
      .register('taille', (c) => c.get('nom').length)

    // `.length` n'existerait pas si `get('nom')` rendait `unknown` : la ligne
    // ci-dessus est elle-meme l'assertion de typage.
    expect(c.get('taille')).toBe(5)

    const nom: string = c.get('nom')
    expect(nom).toBe('odoro')
  })

  it('laisse une fabrique lire les services deja enregistres', () => {
    const c = createContainer()
      .register('base', () => ({ url: 'postgres://' }))
      .register('client', (c) => ({ cible: c.get('base').url }))

    expect(c.get('client')).toEqual({ cible: 'postgres://' })
  })

  it('refuse une cle inconnue a l execution aussi', () => {
    const c = createContainer().register('a', () => 1)
    // La cle est interdite par le type ; ce chemin reste atteignable depuis du
    // JavaScript, et le message doit nommer ce qui existe.
    expect(() => (c as { get: (k: string) => unknown }).get('b')).toThrow(
      /Service inconnu/,
    )
  })

  it('refuse un double enregistrement', () => {
    const c = createContainer().register('a', () => 1)
    expect(() =>
      (c as { register: (k: string, f: () => unknown) => unknown }).register(
        'a',
        () => 2,
      ),
    ).toThrow(/deja enregistre/)
  })
})

describe('portees', () => {
  it('ne construit un singleton qu une fois', () => {
    const fabrique = vi.fn(() => ({ id: Math.random() }))
    const c = createContainer().register('service', fabrique)

    expect(c.get('service')).toBe(c.get('service'))
    expect(fabrique).toHaveBeenCalledTimes(1)
  })

  it('partage le singleton avec les enfants', () => {
    const c = createContainer().register('service', () => ({}))
    const requete = c.scope()

    expect(requete.get('service')).toBe(c.get('service'))
  })

  it('reconstruit un service de requete dans chaque enfant', () => {
    const c = createContainer().register('trace', () => ({}), 'request')

    const a = c.scope()
    const b = c.scope()

    expect(a.get('trace')).not.toBe(b.get('trace'))
    expect(a.get('trace')).toBe(a.get('trace'))
  })

  it('refuse qu un singleton capture un service de requete', () => {
    // Le defaut que cette regle previent : le singleton, construit pendant la
    // premiere requete, garderait la trace de cette requete-la pour toutes les
    // suivantes. Rien n'echouerait — le journal ecrirait simplement sous le
    // mauvais identifiant, et cela ne se verrait qu'en relisant des traces qui
    // n'ont pas de sens.
    const c = createContainer()
      .register('trace', () => ({ id: Math.random() }), 'request')
      .register('journal', (c) => ({ lire: () => c.get('trace') }))

    // La lecture est differee dans une fermeture : elle a lieu bien apres la
    // construction du singleton. C'est le cas courant, et celui qu'une
    // surveillance de la pile de construction laisserait passer.
    expect(() => c.scope().get('journal').lire()).toThrow(/Dependance captive/)
  })

  it('refuse aussi la capture immediate', () => {
    const c = createContainer()
      .register('trace', () => ({}), 'request')
      .register('journal', (c) => ({ trace: c.get('trace') }))

    expect(() => c.scope().get('journal')).toThrow(/Dependance captive/)
  })

  it('nomme les deux services dans le refus', () => {
    const c = createContainer()
      .register('trace', () => ({}), 'request')
      .register('journal', (c) => c.get('trace'))

    expect(() => c.scope().get('journal')).toThrow(/"journal".*"trace"/s)
  })

  it('laisse un service de requete en lire un autre', () => {
    const c = createContainer()
      .register('trace', () => ({ id: 1 }), 'request')
      .register('journal', (c) => ({ lire: () => c.get('trace') }), 'request')

    const a = c.scope()
    const b = c.scope()

    expect(a.get('journal').lire()).toBe(a.get('trace'))
    expect(b.get('journal').lire()).toBe(b.get('trace'))
    expect(a.get('journal').lire()).not.toBe(b.get('journal').lire())
  })
})

describe('cycles', () => {
  it('nomme le cycle plutot que de deborder la pile', () => {
    const c = createContainer().register('a', () => 1)

    // Le type interdit d'ecrire un cycle : une fabrique ne voit que les cles
    // deja enregistrees. Il reste constructible en contournant le type, et le
    // message doit alors montrer le chemin.
    const brut = c as unknown as {
      register: (k: string, f: (r: { get: (k: string) => unknown }) => unknown) => void
      get: (k: string) => unknown
    }
    brut.register('b', (r) => r.get('c'))
    brut.register('c', (r) => r.get('b'))

    expect(() => brut.get('b')).toThrow(/Cycle de dependances.*b -> c -> b/s)
  })
})

describe('liberation', () => {
  it('libere les services qui le declarent, en ordre inverse', async () => {
    const ordre: string[] = []
    const c = createContainer()
      .register('base', () => ({ dispose: () => void ordre.push('base') }))
      .register('cache', () => ({ dispose: () => void ordre.push('cache') }))

    c.get('base')
    c.get('cache')
    await c.dispose()

    // `cache` a ete construit apres `base` : il est libere avant.
    expect(ordre).toEqual(['cache', 'base'])
  })

  it('ignore les services sans dispose', async () => {
    const c = createContainer().register('simple', () => ({ valeur: 1 }))
    c.get('simple')
    await expect(c.dispose()).resolves.toBeUndefined()
  })

  it('attend les liberations asynchrones', async () => {
    let ferme = false
    const c = createContainer().register('pool', () => ({
      dispose: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        ferme = true
      },
    }))

    c.get('pool')
    await c.dispose()
    expect(ferme).toBe(true)
  })

  it('ne libere que sa portee, pas celle du parent', async () => {
    const ordre: string[] = []
    const c = createContainer()
      .register('global', () => ({ dispose: () => void ordre.push('global') }))
      .register(
        'parRequete',
        () => ({ dispose: () => void ordre.push('requete') }),
        'request',
      )

    const requete = c.scope()
    requete.get('global')
    requete.get('parRequete')

    await requete.dispose()
    expect(ordre).toEqual(['requete'])

    await c.dispose()
    expect(ordre).toEqual(['requete', 'global'])
  })
})

describe('inventaire', () => {
  it('liste les cles visibles, parent compris', () => {
    const c = createContainer()
      .register('a', () => 1)
      .register('b', () => 2)

    expect([...c.keys()].sort()).toEqual(['a', 'b'])
    expect([...c.scope().keys()].sort()).toEqual(['a', 'b'])
  })
})
