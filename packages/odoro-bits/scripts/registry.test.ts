import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { RegistryIndex, RegistryMetaInput } from 'odoro/registry'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buildRegistry } from './build-registry.js'
import { collectRegistry } from './collect.js'
import { validateRegistry } from './validate.js'

/** Racine du vrai registre, depuis la racine du paquet. */
const REAL_ROOT = 'registry'

let root = ''
/**
 * Sortie de compilation, volontairement hors du registre : la placer dedans
 * ferait relire les artefacts comme s'ils etaient des composants.
 */
let out = ''

beforeEach(async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'odoro-registre-'))
  root = join(temporary, 'registry')
  out = join(temporary, 'dist')
  await mkdir(root, { recursive: true })
})

afterEach(async () => {
  await rm(join(root, '..'), { recursive: true, force: true })
})

/**
 * Source d'un composant conforme au contrat de personnalisation.
 *
 * Elle accepte `className` : la validation l'exige de toute entree qui rend un
 * element, et une fixture qui ne le ferait pas testerait un cas que le
 * registre refuse.
 */
const SOURCE = 'export const Demo = ({ className }) => <div className={className} />\n'

/** Entree minimale valide, a deriver dans chaque test. */
function meta(overrides: Partial<RegistryMetaInput> = {}): RegistryMetaInput {
  return {
    name: 'demo',
    category: 'text',
    title: 'Demo',
    description: 'Une entree de test.',
    files: [{ path: 'component.tsx', target: 'text/Demo.tsx' }],
    perf: { tier: 'light' },
    ...overrides,
  }
}

/** Ecrit un dossier de composant complet dans le registre temporaire. */
async function writeEntry(
  category: string,
  name: string,
  value: unknown,
  files: Record<string, string> = { 'component.tsx': SOURCE },
): Promise<void> {
  const directory = join(root, category, name)
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, 'meta.json'), JSON.stringify(value, null, 2), 'utf8')
  for (const [path, content] of Object.entries(files)) {
    await writeFile(join(directory, path), content, 'utf8')
  }
}

describe('lecture du registre', () => {
  it('lit une entree et inline son source', async () => {
    await writeEntry('text', 'demo', meta())

    const result = await collectRegistry(root)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.entries).toHaveLength(1)
    expect(result.entries[0]?.id).toBe('text/demo')
    expect(result.entries[0]?.sources['component.tsx']).toContain('export const Demo')
  })

  it('accepte un registre vide', async () => {
    const result = await collectRegistry(root)
    expect(result.ok).toBe(true)
  })

  it('signale une racine inexistante plutot que de lever', async () => {
    const result = await collectRegistry(join(root, 'absent'))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/introuvable/)
  })

  it('signale un dossier sans meta.json', async () => {
    await mkdir(join(root, 'text', 'oubli'), { recursive: true })

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/aucun meta\.json/)
  })

  it('signale un JSON illisible sans faire tomber la lecture', async () => {
    await mkdir(join(root, 'text', 'casse'), { recursive: true })
    await writeFile(join(root, 'text', 'casse', 'meta.json'), '{ oups', 'utf8')

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/JSON illisible/)
  })

  it('rassemble les problemes de toutes les entrees', async () => {
    // S'arreter a la premiere erreur imposerait un aller-retour par probleme.
    await writeEntry('text', 'un', meta({ name: 'un', title: '' }))
    await writeEntry('text', 'deux', meta({ name: 'deux', description: '' }))

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems).toHaveLength(2)
  })
})

describe('ce que le schema ne peut pas voir', () => {
  it('signale un fichier declare mais absent', async () => {
    await writeEntry('text', 'demo', meta(), {})

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/"component\.tsx" est introuvable/)
  })

  it('signale un nom qui ne correspond pas au dossier', async () => {
    // Le dossier est l'identifiant reel : un ecart rendrait l'entree
    // introuvable a l'adresse ou tout le monde la cherche.
    await writeEntry('text', 'demo', meta({ name: 'autre-chose' }))

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/ne correspond pas au dossier/)
  })

  it('signale une categorie qui ne correspond pas au dossier', async () => {
    await writeEntry('effect', 'demo', meta())

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/categorie declaree/)
  })
})

describe('validation complete', () => {
  it('ne signale rien sur un registre sain', async () => {
    await writeEntry('hooks', 'use-base', meta({ name: 'use-base', category: 'hooks' }))
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/use-base'] }))

    const report = await validateRegistry(root)
    expect(report.problems).toEqual([])
    expect(report.count).toBe(2)
  })

  it('echoue sur une dependance de registre qui pointe dans le vide', async () => {
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/absent'] }))

    const report = await validateRegistry(root)
    expect(report.problems).toHaveLength(1)
    expect(report.problems[0]).toMatch(/Entree introuvable : hooks\/absent/)
  })

  it('echoue sur un cycle et en donne le chemin', async () => {
    await writeEntry(
      'text',
      'un',
      meta({ name: 'un', registryDependencies: ['text/deux'] }),
    )
    await writeEntry(
      'text',
      'deux',
      meta({ name: 'deux', registryDependencies: ['text/un'] }),
    )

    const report = await validateRegistry(root)
    expect(report.problems[0]).toMatch(/Cycle de dependances : text\/(un|deux) →/)
  })

  it('echoue sur un composant couteux sans repli', async () => {
    await writeEntry(
      'hero',
      'demo',
      meta({
        category: 'hero',
        engine: { gl: 'three' },
        perf: { tier: 'heavy', backend: 'three' },
      }),
    )

    const report = await validateRegistry(root)
    expect(report.problems.join()).toMatch(/repli visuel/)
    expect(report.count).toBe(0)
  })

  it('ne resout pas le graphe quand la lecture a echoue', async () => {
    // Sinon la dependance de l'entree illisible serait signalee comme
    // introuvable — un second message qui n'est que l'echo du premier.
    await writeEntry(
      'text',
      'un',
      meta({ name: 'un', registryDependencies: ['text/deux'] }),
    )
    await writeEntry('text', 'deux', meta({ name: 'deux', title: '' }))

    const report = await validateRegistry(root)
    expect(report.problems).toHaveLength(1)
  })
})

/** Le catalogue que le site lit : une compilation d'essai ne doit pas y toucher. */
const CATALOGUE_DU_SITE = join(
  '..',
  '..',
  'playground',
  'src',
  'docs',
  'catalogue.generated.ts',
)

describe('compilation des artefacts', () => {
  it('ecrit un fichier par entree et un index', async () => {
    await writeEntry('hooks', 'use-base', meta({ name: 'use-base', category: 'hooks' }))
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/use-base'] }))

    const result = await buildRegistry(root, out, {
      now: new Date('2026-01-01T00:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.report.written).toEqual([
      'hooks/use-base.json',
      'text/demo.json',
      'index.json',
    ])
  })

  it('n ecrit rien hors du dossier de sortie sans qu on le demande', async () => {
    await writeEntry('text', 'demo', meta())

    // La depose dans le playground emprunte des chemins relatifs au dossier
    // courant. Declenchee depuis un test, elle a deja ecrase le catalogue du
    // site avec le contenu d'un registre d'essai — sans qu'aucun test
    // n'echoue, puisque le registre compile, lui, etait correct.
    const avant = await readFile(CATALOGUE_DU_SITE, 'utf8')

    await buildRegistry(root, out)

    expect(await readFile(CATALOGUE_DU_SITE, 'utf8')).toBe(avant)
  })

  it('inline le source dans le fichier de l entree', async () => {
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out)

    const published: unknown = JSON.parse(
      await readFile(join(out, 'text', 'demo.json'), 'utf8'),
    )
    expect(published).toMatchObject({
      id: 'text/demo',
      sources: { 'component.tsx': SOURCE },
    })
  })

  it('ne laisse pas de detail de mise en depot dans l artefact', async () => {
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out)

    const published = JSON.parse(
      await readFile(join(out, 'text', 'demo.json'), 'utf8'),
    ) as Record<string, unknown>
    expect(published['directory']).toBeUndefined()
  })

  it('laisse l index sans code source', async () => {
    // L'index est consulte souvent ; y inliner le code ferait grossir une
    // reponse qui n'en a pas l'usage.
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out, { now: new Date('2026-01-01T00:00:00.000Z') })

    const index = JSON.parse(
      await readFile(join(out, 'index.json'), 'utf8'),
    ) as RegistryIndex
    expect(index.version).toBe(1)
    expect(index.generatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(index.entries).toEqual([
      {
        id: 'text/demo',
        name: 'demo',
        category: 'text',
        title: 'Demo',
        description: 'Une entree de test.',
        tier: 'light',
        backend: false,
        registryDependencies: [],
      },
    ])
  })

  it('efface une entree retiree du depot', async () => {
    // Sans cela, elle resterait servie indefiniment.
    await writeEntry('text', 'demo', meta())
    await buildRegistry(root, out)

    await rm(join(root, 'text', 'demo'), { recursive: true })
    await buildRegistry(root, out)

    await expect(readFile(join(out, 'text', 'demo.json'), 'utf8')).rejects.toThrow()
  })

  it('refuse de compiler un registre invalide', async () => {
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/absent'] }))

    const result = await buildRegistry(root, out)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/introuvable/)
  })
})

describe('le registre reel', () => {
  it('est valide', async () => {
    const report = await validateRegistry(REAL_ROOT)
    expect(report.problems).toEqual([])
    expect(report.count).toBeGreaterThan(0)
  })
})
