import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { PublishedEntry, RegistryIndex } from '../registry/index.js'
import { defaultAliases, guessAlias, stripJsonComments } from './aliases.js'
import { inspectEntry, previewChanges } from './inspect.js'
import { planInstall, prepareInstall, recordInstall, suggest } from './install.js'
import { fingerprint, loadProject, saveProject, type ProjectConfig } from './project.js'
import { rewriteImports, usedTokens } from './rewrite.js'
import { openRegistry } from './source.js'
import { requiredPackages, weighEntries } from './weight.js'
import { applyPlan, planWrite } from './writer.js'

let root = ''
let registryDir = ''

beforeEach(async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'odoro-add-'))
  root = join(temporary, 'projet')
  registryDir = join(temporary, 'registre')
  await mkdir(root, { recursive: true })
})

afterEach(async () => {
  await rm(join(root, '..'), { recursive: true, force: true })
})

/** Une entree publiee, a deriver dans chaque test. */
function entry(overrides: Partial<PublishedEntry> = {}): PublishedEntry {
  const base: PublishedEntry = {
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
    sources: { 'component.tsx': 'export const Demo = () => null\n' },
  }
  return { ...base, ...overrides }
}

/** Ecrit un registre local complet, comme `registry:build` le produirait. */
async function publish(entries: readonly PublishedEntry[]): Promise<void> {
  await mkdir(registryDir, { recursive: true })

  const index: RegistryIndex = {
    version: 1,
    generatedAt: '2026-01-01T00:00:00.000Z',
    entries: entries.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      title: item.title,
      description: item.description,
      tier: item.perf.tier,
      backend: item.perf.backend,
      registryDependencies: item.registryDependencies,
    })),
  }
  await writeFile(join(registryDir, 'index.json'), JSON.stringify(index), 'utf8')

  for (const item of entries) {
    await mkdir(join(registryDir, item.category), { recursive: true })
    await writeFile(join(registryDir, `${item.id}.json`), JSON.stringify(item), 'utf8')
  }
}

/** Configuration de projet minimale. */
function config(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    version: 1,
    registry: registryDir,
    aliases: { import: '@/odoro', directory: 'src/odoro' },
    installed: {},
    ...overrides,
  }
}

describe('lecture du tsconfig', () => {
  it('retire les commentaires de ligne et de bloc', () => {
    const cleaned = stripJsonComments('{ // un\n "a": 1, /* deux */ "b": 2 }')
    expect(JSON.parse(cleaned)).toEqual({ a: 1, b: 2 })
  })

  it('ne touche pas a une barre oblique dans une chaine', () => {
    // Une expression reguliere naive couperait l'URL en deux.
    const cleaned = stripJsonComments('{ "url": "https://exemple.fr" }')
    expect(JSON.parse(cleaned)).toEqual({ url: 'https://exemple.fr' })
  })

  it('accepte une virgule finale', () => {
    expect(JSON.parse(stripJsonComments('{ "a": 1, }'))).toEqual({ a: 1 })
  })

  it('deduit le prefixe et le dossier', async () => {
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
      'utf8',
    )
    expect(await guessAlias(root)).toEqual({ prefix: '@', directory: 'src' })
  })

  it('retient l alias le moins profond quand il y en a plusieurs', async () => {
    // Un projet qui declare aussi `@ui/*` veut `@/*` comme prefixe general.
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "@ui/*": ["./src/components/ui/*"], "@/*": ["./src/*"] } } }',
      'utf8',
    )
    expect((await guessAlias(root))?.prefix).toBe('@')
  })

  it('ignore une redirection de paquet', async () => {
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "react": ["./vendor/react"] } } }',
      'utf8',
    )
    expect(await guessAlias(root)).toBeNull()
  })

  it('rend null quand le projet n a pas de tsconfig', async () => {
    expect(await guessAlias(root)).toBeNull()
  })

  it('propose un emplacement meme sans alias', () => {
    expect(defaultAliases(null)).toEqual({ import: 'src/odoro', directory: 'src/odoro' })
  })
})

describe('reecriture des imports', () => {
  it('remplace le jeton par le prefixe du projet', () => {
    expect(rewriteImports("from '@registre/hooks/usePoster'", '@/odoro')).toBe(
      "from '@/odoro/hooks/usePoster'",
    )
  })

  it('ne touche pas aux vrais paquets', () => {
    const source = "import { clock } from 'odoro-engine'\nimport gsap from 'gsap'"
    expect(rewriteImports(source, '@/odoro')).toBe(source)
  })

  it('liste ce qu une source importe du registre', () => {
    expect(usedTokens("a '@registre/hooks/usePoster' b '@registre/gl/Surface'")).toEqual([
      'gl/Surface',
      'hooks/usePoster',
    ])
  })
})

describe('ecriture transactionnelle', () => {
  it('ecrit ce qui est prevu', async () => {
    const plan = [await planWrite(root, 'src/a.ts', 'un', 'x/a')]
    const report = await applyPlan(root, plan)

    expect(report.written).toEqual(['src/a.ts'])
    expect(await readFile(join(root, 'src/a.ts'), 'utf8')).toBe('un')
  })

  it('ne reecrit pas un fichier identique', async () => {
    // Le reecrire changerait sa date de modification, que les outils de
    // compilation surveillent, pour un resultat identique.
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'un', 'utf8')

    const plan = [await planWrite(root, 'src/a.ts', 'un', 'x/a')]
    expect(plan[0]?.action).toBe('inchange')

    const report = await applyPlan(root, plan)
    expect(report.written).toEqual([])
    expect(report.skipped).toEqual(['src/a.ts'])
  })

  it('distingue une creation d un remplacement', async () => {
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'ancien', 'utf8')

    expect((await planWrite(root, 'src/a.ts', 'nouveau', 'x/a')).action).toBe(
      'remplacement',
    )
    expect((await planWrite(root, 'src/b.ts', 'nouveau', 'x/b')).action).toBe('creation')
  })

  it('ne laisse rien derriere quand une ecriture echoue', async () => {
    // Le cas qui justifie tout le module : un plan de trois fichiers dont le
    // troisieme est impossible a ecrire.
    await mkdir(join(root, 'src', 'bloque'), { recursive: true })
    // Un dossier la ou un fichier doit aller : l'ecriture echouera.
    await mkdir(join(root, 'src', 'bloque', 'c.ts'), { recursive: true })

    const plan = [
      await planWrite(root, 'src/a.ts', 'un', 'x/a'),
      await planWrite(root, 'src/b.ts', 'deux', 'x/b'),
      await planWrite(root, 'src/bloque/c.ts', 'trois', 'x/c'),
    ]

    await expect(applyPlan(root, plan)).rejects.toThrow()

    // Ni les fichiers precedents, ni les temporaires.
    await expect(readFile(join(root, 'src/a.ts'), 'utf8')).rejects.toThrow()
    await expect(readFile(join(root, 'src/b.ts'), 'utf8')).rejects.toThrow()
    await expect(
      readFile(join(root, 'src/a.ts.odoro-en-cours'), 'utf8'),
    ).rejects.toThrow()
  })

  it('rend son contenu precedent a un fichier remplace', async () => {
    await mkdir(join(root, 'src', 'bloque', 'c.ts'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'ancien', 'utf8')

    const plan = [
      await planWrite(root, 'src/a.ts', 'nouveau', 'x/a'),
      await planWrite(root, 'src/bloque/c.ts', 'trois', 'x/c'),
    ]

    await expect(applyPlan(root, plan)).rejects.toThrow()
    expect(await readFile(join(root, 'src/a.ts'), 'utf8')).toBe('ancien')
  })
})

describe('preparation d une installation', () => {
  it('installe les dependances de registre avec l entree', async () => {
    await publish([
      entry({
        id: 'text/demo',
        registryDependencies: ['hooks/use-base'],
      }),
      entry({
        id: 'hooks/use-base',
        name: 'use-base',
        category: 'hooks',
        files: [{ path: 'hook.ts', target: 'hooks/useBase.ts' }],
        sources: { 'hook.ts': 'export const useBase = () => null\n' },
      }),
    ])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['text/demo'])
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return

    expect(prepared.entries.map((item) => item.id)).toEqual([
      'hooks/use-base',
      'text/demo',
    ])
    expect(prepared.implied).toEqual(['hooks/use-base'])
  })

  it('accepte un nom sans categorie', async () => {
    await publish([entry()])
    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(true)
  })

  it('refuse un nom ambigu plutot que de choisir', async () => {
    await publish([
      entry({ id: 'text/demo' }),
      entry({ id: 'hero/demo', category: 'hero' }),
    ])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/ambigu/)
  })

  it('propose les noms proches d une entree inconnue', async () => {
    await publish([entry({ id: 'hero/molten', name: 'molten', category: 'hero' })])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['molte'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/hero\/molten/)
  })

  it('signale un registre injoignable', async () => {
    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
  })

  it('refuse une entree dont le code source manque', async () => {
    // Une reponse a moitie ecrite ne doit pas produire un fichier a moitie ecrit.
    await publish([entry()])
    await writeFile(
      join(registryDir, 'text/demo.json'),
      JSON.stringify({ ...entry(), sources: {} }),
      'utf8',
    )

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['text/demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/absent de la reponse/)
  })

  it('refuse un index d une version qu elle ne sait pas lire', async () => {
    await publish([entry()])
    await writeFile(
      join(registryDir, 'index.json'),
      JSON.stringify({ version: 2, generatedAt: '', entries: [] }),
      'utf8',
    )

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/Mettez la CLI a jour/)
  })

  it('suggere par la fin du nom', () => {
    expect(suggest('poster', ['hooks/use-poster', 'text/split'])).toEqual([
      'hooks/use-poster',
    ])
  })
})

describe('plan et journal', () => {
  it('ecrit sous le dossier configure, imports reecrits', async () => {
    const source = "import { usePoster } from '@registre/hooks/usePoster'\n"
    const plan = await planInstall(root, config(), [
      entry({ sources: { 'component.tsx': source } }),
    ])

    expect(plan[0]?.path).toBe('src/odoro/text/Demo.tsx')
    expect(plan[0]?.content).toContain("'@/odoro/hooks/usePoster'")
  })

  it('note l empreinte de ce qui a ete livre', async () => {
    const item = entry()
    const plan = await planInstall(root, config(), [item])
    const installed = recordInstall({}, [item], plan, new Date('2026-01-01'))

    expect(installed['text/demo']?.files).toEqual([
      {
        path: 'src/odoro/text/Demo.tsx',
        hash: fingerprint(item.sources['component.tsx'] ?? ''),
      },
    ])
  })

  it('donne la meme empreinte quelles que soient les fins de ligne', () => {
    // Sinon git signalerait une modification qui n'a pas eu lieu.
    expect(fingerprint('a\r\nb')).toBe(fingerprint('a\nb'))
  })
})

describe('poids annonce', () => {
  it('ne compte un backend qu une fois', () => {
    // Il n'est charge qu'une fois : le compter cinq fois serait un mensonge, et
    // un avertissement qu'on apprend a ignorer ne sert plus a rien.
    const warnings = weighEntries([
      entry({
        id: 'hero/a',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])

    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.entries).toEqual(['hero/a', 'hero/b'])
  })

  it('annonce le plus lourd en premier', () => {
    const warnings = weighEntries([
      entry({ id: 'bg/a', perf: { tier: 'medium', backend: 'ogl' } }),
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])
    expect(warnings.map((w) => w.backend)).toEqual(['three', 'ogl'])
  })

  it('mentionne l alternative legere quand une scene 3D arrive', () => {
    const warnings = weighEntries([
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])
    expect(warnings[0]?.message).toMatch(/backend leger/)
  })

  it('ne dit rien quand rien ne coute', () => {
    expect(weighEntries([entry()])).toEqual([])
  })

  it('reclame le backend et gsap en plus des dependances declarees', () => {
    const packages = requiredPackages([
      entry({ engine: { gsap: ['ScrollTrigger'], gl: 'three' }, dependencies: ['clsx'] }),
    ])
    expect(packages).toEqual(['clsx', 'gsap', 'three'])
  })
})

describe('comparaison des trois versions', () => {
  /** Installe reellement une entree, puis rend la configuration a jour. */
  async function install(item: PublishedEntry): Promise<ProjectConfig> {
    const base = config()
    const plan = await planInstall(root, base, [item])
    await applyPlan(root, plan)
    return { ...base, installed: recordInstall({}, [item], plan, new Date()) }
  }

  it('ne signale rien quand rien n a bouge', async () => {
    const item = entry()
    const report = await inspectEntry(root, await install(item), item.id, item)
    expect(report.files[0]?.state).toBe('a-jour')
  })

  it('reconnait une retouche locale', async () => {
    const item = entry()
    const updated = await install(item)
    await writeFile(join(root, 'src/odoro/text/Demo.tsx'), 'retouche\n', 'utf8')

    const report = await inspectEntry(root, updated, item.id, item)
    expect(report.files[0]?.state).toBe('retouche')
  })

  it('reconnait une mise a jour amont', async () => {
    const item = entry()
    const updated = await install(item)
    const newer = entry({
      sources: { 'component.tsx': 'export const Demo = () => <b/>\n' },
    })

    const report = await inspectEntry(root, updated, item.id, newer)
    expect(report.files[0]?.state).toBe('mise-a-jour')
  })

  it('reconnait une divergence — le seul cas qui demande un arbitrage', async () => {
    const item = entry()
    const updated = await install(item)
    await writeFile(join(root, 'src/odoro/text/Demo.tsx'), 'retouche\n', 'utf8')
    const newer = entry({ sources: { 'component.tsx': 'amont\n' } })

    const report = await inspectEntry(root, updated, item.id, newer)
    expect(report.files[0]?.state).toBe('divergence')
  })

  it('signale un fichier note comme installe mais efface', async () => {
    const item = entry()
    const updated = await install(item)
    await rm(join(root, 'src/odoro/text/Demo.tsx'))

    const report = await inspectEntry(root, updated, item.id, item)
    expect(report.files[0]?.state).toBe('absent')
  })

  it('signale une entree que le registre ne sert plus', async () => {
    const item = entry()
    const report = await inspectEntry(root, await install(item), item.id, null)
    expect(report.orphan).toBe(true)
  })

  it('apercoit les lignes ajoutees et retirees', () => {
    const changes = previewChanges('un\ndeux\n', 'un\ntrois\n')
    expect(changes.added).toEqual(['trois'])
    expect(changes.removed).toEqual(['deux'])
  })
})

describe('fichier odoro.json', () => {
  it('distingue un fichier absent d un fichier corrompu', async () => {
    const absent = await loadProject(root)
    expect(absent.ok).toBe(false)
    if (absent.ok) return
    expect(absent.reason).toBe('absent')

    await writeFile(join(root, 'odoro.json'), '{ casse', 'utf8')
    const broken = await loadProject(root)
    expect(broken.ok).toBe(false)
    if (broken.ok) return
    expect(broken.reason).toBe('invalide')
  })

  it('relit ce qu il a ecrit', async () => {
    await saveProject(
      root,
      config({ installed: { 'text/demo': { installedAt: 'x', files: [] } } }),
    )

    const loaded = await loadProject(root)
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(Object.keys(loaded.config.installed)).toEqual(['text/demo'])
  })

  it('trie les entrees installees', async () => {
    // Sans cela, chaque `odoro add` produirait un diff illisible.
    await saveProject(
      root,
      config({
        installed: {
          'text/zebre': { installedAt: 'x', files: [] },
          'hooks/alpha': { installedAt: 'x', files: [] },
        },
      }),
    )

    const raw = await readFile(join(root, 'odoro.json'), 'utf8')
    expect(raw.indexOf('hooks/alpha')).toBeLessThan(raw.indexOf('text/zebre'))
  })

  it('refuse une configuration sans emplacement', async () => {
    await writeFile(join(root, 'odoro.json'), JSON.stringify({ registry: 'x' }), 'utf8')
    const loaded = await loadProject(root)
    expect(loaded.ok).toBe(false)
  })
})

// Le mode strict de Node interdit de retirer le droit d'ecriture a soi-meme
// sous Windows : le test qui en dependrait serait vert sans rien prouver.
describe.skipIf(process.platform === 'win32')('permissions', () => {
  it('ne laisse rien derriere sur un dossier en lecture seule', async () => {
    await mkdir(join(root, 'verrou'), { recursive: true })
    await chmod(join(root, 'verrou'), 0o500)

    const plan = [await planWrite(root, 'verrou/a.ts', 'un', 'x/a')]
    await expect(applyPlan(root, plan)).rejects.toThrow()

    await chmod(join(root, 'verrou'), 0o700)
  })
})
