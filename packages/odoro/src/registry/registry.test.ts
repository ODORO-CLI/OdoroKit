import { describe, expect, it } from 'vitest'

import {
  describeProblem,
  resolveGraph,
  toCatalogue,
  validateCatalogue,
  type ResolvableEntry,
} from './resolve.js'
import { entryId, parseMeta, type RegistryMetaInput } from './schema.js'

/** Entree minimale valide, a deriver dans chaque test. */
function meta(overrides: Partial<RegistryMetaInput> = {}): RegistryMetaInput {
  return {
    name: 'split-reveal',
    category: 'text',
    title: 'Split Reveal',
    description: 'Revele un texte caractere par caractere.',
    files: [{ path: 'component.tsx', target: 'text/SplitReveal.tsx' }],
    perf: { tier: 'light' },
    ...overrides,
  }
}

/** Construit un catalogue a partir de couples identifiant / dependances. */
function catalogue(entries: Record<string, string[]>): Map<string, ResolvableEntry> {
  return new Map(
    Object.entries(entries).map(([id, deps]) => [id, { id, registryDependencies: deps }]),
  )
}

describe('validation du format', () => {
  it('accepte une entree minimale et applique les valeurs par defaut', () => {
    const result = parseMeta(meta(), 'text/split-reveal')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.meta.dependencies).toEqual([])
    expect(result.meta.registryDependencies).toEqual([])
    expect(result.meta.engine).toEqual({ gsap: [], gl: false })
    expect(result.meta.perf.backend).toBe(false)
    expect(entryId(result.meta)).toBe('text/split-reveal')
  })

  it('refuse un nom qui n est pas en minuscules a tirets', () => {
    const result = parseMeta(meta({ name: 'SplitReveal' }), 'text/x')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/minuscules/)
  })

  it('refuse une categorie inconnue', () => {
    const result = parseMeta(
      meta({ category: 'inexistante' as RegistryMetaInput['category'] }),
      'x/y',
    )
    expect(result.ok).toBe(false)
  })

  it('exige au moins un fichier', () => {
    const result = parseMeta(meta({ files: [] }), 'text/x')
    expect(result.ok).toBe(false)
  })

  it('cite le chemin du champ fautif', () => {
    // Un message qui dit seulement « invalide » oblige a chercher.
    const result = parseMeta(meta({ perf: { tier: 'inconnu' } as never }), 'text/x')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toContain('text/x → perf.tier')
  })
})

describe('destinations d ecriture', () => {
  it('refuse une destination absolue', () => {
    // La CLI ecrit chez l'utilisateur : un chemin non borne y serait une porte
    // ouverte.
    const result = parseMeta(
      meta({ files: [{ path: 'a.tsx', target: '/etc/passwd' }] }),
      'text/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/relative/)
  })

  it('refuse une remontee dans l arborescence', () => {
    const result = parseMeta(
      meta({ files: [{ path: 'a.tsx', target: '../../ailleurs.tsx' }] }),
      'text/x',
    )
    expect(result.ok).toBe(false)
  })

  it('refuse deux fichiers vers la meme destination', () => {
    // Le second effacerait le premier sans que rien ne le signale.
    const result = parseMeta(
      meta({
        files: [
          { path: 'a.tsx', target: 'text/Meme.tsx' },
          { path: 'b.tsx', target: 'text/Meme.tsx' },
        ],
      }),
      'text/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/meme destination/)
  })
})

describe('coherence du cout', () => {
  it('exige un repli pour un composant couteux', () => {
    // Sans repli, l'ecran reste vide pendant le chargement, sur les appareils
    // lents et en mouvement reduit.
    const result = parseMeta(
      meta({ engine: { gl: 'three' }, perf: { tier: 'heavy', backend: 'three' } }),
      'hero/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/repli visuel/)
  })

  it('accepte un composant couteux qui declare son repli', () => {
    const result = parseMeta(
      meta({
        category: 'hero',
        engine: { gl: 'three' },
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      'hero/x',
    )
    expect(result.ok).toBe(true)
  })

  it('refuse un backend declare de deux facons differentes', () => {
    const result = parseMeta(
      meta({
        engine: { gl: 'ogl' },
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      'background/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/ne correspond pas/)
  })

  it('refuse une scene 3D classee autrement que couteuse', () => {
    // La classer legere desactiverait les garde-fous de la CLI et de l'arbitre
    // de surfaces.
    const result = parseMeta(
      meta({
        engine: { gl: 'three' },
        perf: { tier: 'light', backend: 'three', fallback: 'poster' },
      }),
      'hero/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/cout eleve/)
  })
})

describe('resolution du graphe', () => {
  it('installe les dependances avant ce qui les reclame', () => {
    const result = resolveGraph(
      ['text/split-reveal'],
      catalogue({ 'text/split-reveal': ['hooks/use-in-view'], 'hooks/use-in-view': [] }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual(['hooks/use-in-view', 'text/split-reveal'])
  })

  it('signale ce qui a ete ajoute sans avoir ete demande', () => {
    const result = resolveGraph(
      ['text/split-reveal'],
      catalogue({ 'text/split-reveal': ['hooks/use-in-view'], 'hooks/use-in-view': [] }),
    )
    if (!result.ok) return
    expect(result.graph.implied).toEqual(['hooks/use-in-view'])
  })

  it('resout un graphe profond sans doublon', () => {
    const result = resolveGraph(
      ['a/un', 'a/deux'],
      catalogue({
        'a/un': ['b/commun'],
        'a/deux': ['b/commun'],
        'b/commun': ['c/base'],
        'c/base': [],
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual(['c/base', 'b/commun', 'a/un', 'a/deux'])
  })

  it('signale une entree introuvable et qui la reclamait', () => {
    const result = resolveGraph(['a/un'], catalogue({ 'a/un': ['b/absent'] }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toEqual({
      kind: 'introuvable',
      id: 'b/absent',
      requiredBy: 'a/un',
    })
  })

  it('detecte un cycle et en donne le chemin', () => {
    // Une erreur qui dit seulement « cycle detecte » oblige a le chercher a la
    // main dans tout le registre.
    const result = resolveGraph(
      ['a/un'],
      catalogue({ 'a/un': ['b/deux'], 'b/deux': ['c/trois'], 'c/trois': ['a/un'] }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatchObject({ kind: 'cycle' })
    expect(describeProblem(result.problems[0]!)).toBe(
      'Cycle de dependances : a/un → b/deux → c/trois → a/un',
    )
  })

  it('detecte un cycle direct', () => {
    const result = resolveGraph(['a/un'], catalogue({ 'a/un': ['a/un'] }))
    expect(result.ok).toBe(false)
  })

  it('ne boucle pas indefiniment sur un cycle', () => {
    const result = resolveGraph(
      ['a/un'],
      catalogue({ 'a/un': ['b/deux'], 'b/deux': ['a/un'] }),
    )
    expect(result.ok).toBe(false)
  })

  it('accepte une demande vide', () => {
    const result = resolveGraph([], catalogue({}))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual([])
  })
})

describe('integrite d un catalogue entier', () => {
  it('ne signale rien sur un catalogue sain', () => {
    expect(validateCatalogue(catalogue({ 'a/un': ['b/deux'], 'b/deux': [] }))).toEqual([])
  })

  it('signale une dependance pointant dans le vide', () => {
    const problems = validateCatalogue(catalogue({ 'a/un': ['b/absent'] }))
    expect(problems).toHaveLength(1)
    expect(describeProblem(problems[0]!)).toMatch(/introuvable/)
  })

  it('construit un catalogue depuis des entrees completes', () => {
    const parsed = parseMeta(meta({ registryDependencies: ['hooks/use-in-view'] }), 'x')
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const built = toCatalogue([{ ...parsed.meta, id: entryId(parsed.meta) }])
    expect(built.get('text/split-reveal')?.registryDependencies).toEqual([
      'hooks/use-in-view',
    ])
  })
})
