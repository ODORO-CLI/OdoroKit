import type { RegistryMeta } from 'odoro/registry'
import { describe, expect, it } from 'vitest'

import { checkContract, stripComments, usedTokens } from './contract.js'

/** Entree validee minimale, a deriver dans chaque test. */
function meta(overrides: Partial<RegistryMeta> = {}): RegistryMeta & { id: string } {
  return {
    id: 'text/demo',
    name: 'demo',
    category: 'text',
    title: 'Demo',
    description: 'Une entree.',
    engine: { gsap: [], gl: false },
    files: [{ path: 'component.tsx', target: 'text/Demo.tsx' }],
    dependencies: [],
    registryDependencies: [],
    tokens: [],
    props: [],
    perf: { tier: 'light', backend: false },
    ...overrides,
  }
}

/** Source d'un composant conforme, a deriver. */
const CONFORME = `
export function Demo({ className, ...rest }: Props) {
  return <div {...rest} className={className} style={{ color: 'var(--o-fg)' }} />
}
`

describe('lecture des tokens', () => {
  it('releve un token consomme directement', () => {
    expect([...usedTokens('color: var(--o-fg-muted)')]).toEqual(['--o-fg-muted'])
  })

  it('accepte une valeur de repli', () => {
    expect([...usedTokens('var( --o-ease-entrance , ease-out)')]).toEqual([
      '--o-ease-entrance',
    ])
  })

  it('releve un token lu depuis JavaScript', () => {
    // Un shader a besoin de trois flottants : il lit le token par son nom,
    // pas par une declaration CSS. La premiere version de la regle refusait
    // pourtant ce cas.
    expect([...usedTokens("readTokenColour('--o-palette-brand-600', host)")]).toEqual([
      '--o-palette-brand-600',
    ])
  })

  it('accepte les trois sortes de guillemets', () => {
    expect(usedTokens('a("--o-a") b(`--o-b`)').size).toBe(2)
  })

  it('ne compte pas deux fois le meme token', () => {
    expect(usedTokens("var(--o-fg) '--o-fg'").size).toBe(1)
  })
})

describe('retrait des commentaires', () => {
  it('retire une ligne de commentaire', () => {
    expect(stripComments('const a = 1 // var(--o-fg)')).not.toMatch(/--o-fg/)
  })

  it('retire un bloc de documentation', () => {
    expect(stripComments('/** exemple : --o-accent */ const a = 1')).not.toMatch(
      /--o-accent/,
    )
  })

  it('laisse les chaines intactes', () => {
    // Une lecture de token vit dans une chaine, un shader dans un gabarit :
    // les traverser reviendrait a ne plus rien voir.
    expect(stripComments("read('--o-fg')")).toBe("read('--o-fg')")
    expect(stripComments('const s = `var(--o-bg)`')).toMatch(/--o-bg/)
  })

  it('ne prend pas une barre oblique de chaine pour un commentaire', () => {
    expect(stripComments("const u = 'https://exemple.fr'")).toBe(
      "const u = 'https://exemple.fr'",
    )
  })

  it('respecte un guillemet echappe', () => {
    // Sans la prise en compte de l'echappement, la chaine paraitrait fermee
    // trop tot et la suite de la ligne serait lue comme du code.
    const source = String.raw`const s = 'a\'b' // x`
    expect(stripComments(source)).toBe(String.raw`const s = 'a\'b' `)
  })
})

describe('regle 1 — coherence des tokens', () => {
  it('accepte une declaration qui correspond au code', () => {
    const problems = checkContract(meta({ tokens: ['--o-fg'] }), {
      'component.tsx': CONFORME,
    })
    expect(problems).toEqual([])
  })

  it('refuse un token declare mais jamais employe', () => {
    // L'ecart est invisible a la relecture — il faut avoir les deux fichiers
    // sous les yeux — et il trompe qui cherche quelle variable regler.
    const problems = checkContract(meta({ tokens: ['--o-fg', '--o-duration-slow'] }), {
      'component.tsx': CONFORME,
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]?.message).toMatch(/--o-duration-slow est declare/)
  })

  it('ne compte pas un token cite dans un exemple', () => {
    // Un exemple montre autre chose que le defaut : c'est son interet. Le
    // premier jet de cette regle butait exactement la-dessus.
    const problems = checkContract(meta({ tokens: ['--o-fg'] }), {
      'component.tsx': `/**
 * @example
 * <Fond colors={['--o-palette-red-600', '--o-bg-subtle']} />
 */
${CONFORME}`,
    })
    expect(problems).toEqual([])
  })

  it('refuse un token employe mais non declare', () => {
    const problems = checkContract(meta(), { 'component.tsx': CONFORME })
    expect(problems[0]?.message).toMatch(/--o-fg est employe/)
  })

  it('regarde tous les fichiers de l entree', () => {
    const problems = checkContract(meta({ tokens: ['--o-accent'] }), {
      'component.tsx': CONFORME.replace('var(--o-fg)', 'var(--o-fg)'),
      'styles.ts': 'export const s = { background: "var(--o-accent)" }',
    })
    expect(problems.map((p) => p.message).join()).not.toMatch(/--o-accent/)
  })
})

describe('regle 2 — le passe-plat', () => {
  it('refuse un composant qui ne mentionne pas className', () => {
    const problems = checkContract(meta(), {
      'component.tsx': 'export function Demo() { return <div /> }',
    })
    expect(problems[0]?.message).toMatch(/className/)
  })

  it('n exige rien d un hook', () => {
    // Un hook ne rend aucun element : lui demander className n aurait aucun
    // sens.
    const problems = checkContract(meta({ category: 'hooks', name: 'use-base' }), {
      'hook.ts': 'export const useBase = () => null',
    })
    expect(problems).toEqual([])
  })

  it('accepte un composant qui l accepte', () => {
    const problems = checkContract(meta({ tokens: ['--o-fg'] }), {
      'component.tsx': CONFORME,
    })
    expect(problems).toEqual([])
  })
})

describe('regle 3 — aucune couleur en dur', () => {
  it('refuse une couleur hexadecimale', () => {
    // Elle echappe aux tokens : changer le theme ne la touchera pas.
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = { color: '#1a2b3c', className: '' }",
    })
    expect(problems[0]?.message).toMatch(/#1a2b3c/)
  })

  it('refuse une couleur fonctionnelle', () => {
    const problems = checkContract(meta(), {
      'component.tsx':
        "const s = { background: 'rgba(0,0,0,.5)' }; const c = 'className'",
    })
    expect(problems[0]?.message).toMatch(/rgba\(/)
  })

  it('ne confond pas une directive de shader avec une couleur', () => {
    // `#version` et `#ifdef` contiennent des lettres hors de l alphabet
    // hexadecimal : la limite de mot empeche une correspondance partielle.
    const problems = checkContract(meta({ category: 'hooks', name: 'use-x' }), {
      'shader.ts': 'export const S = `#version 300 es\\n#ifdef HAUT\\n#endif`',
    })
    expect(problems).toEqual([])
  })

  it('ne cite que les premieres occurrences', () => {
    const problems = checkContract(meta({ category: 'hooks', name: 'use-x' }), {
      'a.ts': "'#111' '#222' '#333' '#444' '#555'",
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]?.message).toMatch(/#111, #222, #333/)
    expect(problems[0]?.message).not.toMatch(/#444/)
  })
})

describe('cumul', () => {
  it('rassemble tous les manquements d une meme entree', () => {
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = '#fff'",
    })
    // Pas de className, et une couleur en dur.
    expect(problems).toHaveLength(2)
  })

  it('prefixe chaque message de l identifiant', () => {
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = '#fff'",
    })
    for (const problem of problems) expect(problem.message).toMatch(/^text\/demo : /)
  })
})
