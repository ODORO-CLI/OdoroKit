import { existsSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { scaffold } from './scaffold.js'
import {
  availableTemplates,
  detectPackageManager,
  inspectTarget,
  installCommand,
  runCommand,
  targetFileName,
  templatesRoot,
  toPackageName,
  validatePackageName,
} from './utils.js'

describe('detectPackageManager', () => {
  it.each([
    ['pnpm/10.28.2 npm/? node/v22.14.0 win32 x64', 'pnpm'],
    ['npm/10.9.0 node/v22.14.0 win32 x64', 'npm'],
    ['yarn/4.5.0 npm/? node/v22.14.0', 'yarn'],
    ['bun/1.1.30 npm/? node/v22.14.0', 'bun'],
  ])('reconnait %j', (agent, expected) => {
    expect(detectPackageManager(agent)).toBe(expected)
  })

  it('retombe sur npm face a un agent inconnu', () => {
    expect(detectPackageManager('gestionnaire-inconnu/1.0.0')).toBe('npm')
    expect(detectPackageManager('')).toBe('npm')
  })

  it('retombe sur npm quand l environnement ne dit rien', () => {
    // La valeur par defaut lit `npm_config_user_agent` : le test doit donc
    // maitriser l'environnement, sans quoi il mesure le gestionnaire qui a
    // lance la suite plutot que le comportement de la fonction.
    const previous = process.env['npm_config_user_agent']
    delete process.env['npm_config_user_agent']
    try {
      expect(detectPackageManager()).toBe('npm')
    } finally {
      if (previous !== undefined) process.env['npm_config_user_agent'] = previous
    }
  })
})

describe('commandes des gestionnaires', () => {
  it('produit la commande d installation', () => {
    expect(installCommand('pnpm')).toBe('pnpm install')
    expect(installCommand('yarn')).toBe('yarn')
  })

  it('produit la commande d execution de script', () => {
    expect(runCommand('npm', 'dev')).toBe('npm run dev')
    expect(runCommand('pnpm', 'dev')).toBe('pnpm dev')
  })
})

describe('toPackageName', () => {
  it.each([
    ['Mon Super Site !', 'mon-super-site'],
    ['  Espaces  ', 'espaces'],
    ['_prive', 'prive'],
    ['deja-valide', 'deja-valide'],
    ['---', 'odoro-app'],
  ])('transforme %j en %j', (input, expected) => {
    expect(toPackageName(input)).toBe(expected)
  })
})

describe('validatePackageName', () => {
  it('accepte un nom valide', () => {
    expect(validatePackageName('mon-site')).toBeUndefined()
  })

  it.each([
    ['', /vide/],
    ['Mon Site', /minuscules/],
    ['.cache', /commencer/],
    ['_prive', /commencer/],
  ])('refuse %j', (input, pattern) => {
    expect(validatePackageName(input)).toMatch(pattern)
  })

  it('refuse un nom trop long', () => {
    expect(validatePackageName('a'.repeat(215))).toMatch(/214/)
  })
})

describe('targetFileName', () => {
  it('restitue les fichiers pointes', () => {
    // npm renomme `.gitignore` en `.npmignore` a la publication : le fichier
    // est stocke sous `_gitignore` et restitue a la copie.
    expect(targetFileName('_gitignore')).toBe('.gitignore')
    expect(targetFileName('_env.example')).toBe('.env.example')
  })

  it('laisse les autres noms intacts', () => {
    expect(targetFileName('package.json')).toBe('package.json')
  })
})

describe('templatesRoot', () => {
  it('resout les templates depuis l emplacement du module, pas le dossier courant', () => {
    const root = templatesRoot()
    expect(existsSync(root)).toBe(true)
    expect(availableTemplates(root).length).toBeGreaterThan(0)
  })

  it('echoue clairement si les templates sont introuvables', () => {
    expect(() => templatesRoot(join(tmpdir(), 'nulle-part', 'module.js'))).toThrow(
      /introuvable/,
    )
  })
})

describe('echafaudage', () => {
  let workspace: string
  let templates: string
  let target: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-scaffold-'))
    templates = join(workspace, 'templates')
    target = join(workspace, 'projet')

    await mkdir(join(templates, 'demo', 'src'), { recursive: true })
    await writeFile(
      join(templates, 'demo', 'package.json'),
      JSON.stringify({ name: 'odoro-app', version: '0.0.0', private: true }, null, 2),
      'utf8',
    )
    await writeFile(join(templates, 'demo', '_gitignore'), 'node_modules/\n', 'utf8')
    await writeFile(join(templates, 'demo', 'src', 'main.ts'), 'export {}\n', 'utf8')
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('copie l arborescence du template', async () => {
    const { files } = await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      root: templates,
    })

    expect([...files].sort()).toEqual(['.gitignore', 'package.json', 'src/main.ts'])
    expect(existsSync(join(target, 'src', 'main.ts'))).toBe(true)
  })

  it('restitue le nom des fichiers pointes', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    expect(existsSync(join(target, '.gitignore'))).toBe(true)
    expect(existsSync(join(target, '_gitignore'))).toBe(false)
  })

  it('reecrit le nom du paquet', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as {
      name: string
      private: boolean
    }
    expect(manifest.name).toBe('mon-site')
    // Le reste du manifeste est preserve.
    expect(manifest.private).toBe(true)
  })

  it('echoue sur un template inconnu', async () => {
    await expect(
      scaffold({ target, template: 'absent', packageName: 'x', root: templates }),
    ).rejects.toThrow(/Template inconnu/)
  })

  it('fusionne dans un dossier occupe', async () => {
    await mkdir(target, { recursive: true })
    await writeFile(join(target, 'NOTES.md'), 'a conserver\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'fusionner',
      root: templates,
    })

    expect(existsSync(join(target, 'NOTES.md'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })

  it('vide le dossier avant de copier, en conservant le depot git', async () => {
    await mkdir(join(target, '.git'), { recursive: true })
    await writeFile(join(target, 'ancien.txt'), 'a supprimer\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'ecraser',
      root: templates,
    })

    expect(existsSync(join(target, 'ancien.txt'))).toBe(false)
    expect(existsSync(join(target, '.git'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })
})

describe('inspectTarget', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-target-'))
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('signale un dossier absent', () => {
    expect(inspectTarget(join(workspace, 'nulle-part'))).toBe('absent')
  })

  it('signale un dossier vide', () => {
    expect(inspectTarget(workspace)).toBe('vide')
  })

  it('considere un dossier ne contenant qu un depot git comme vide', async () => {
    await mkdir(join(workspace, '.git'), { recursive: true })
    expect(inspectTarget(workspace)).toBe('vide')
  })

  it('signale un dossier occupe', async () => {
    await writeFile(join(workspace, 'fichier.txt'), 'x', 'utf8')
    expect(inspectTarget(workspace)).toBe('occupe')
  })
})

describe('les versions Odoro du manifeste', () => {
  it('suivent la version de la CLI, et non celle du gabarit', async () => {
    // Les gabarits portaient `^0.0.0`, la version d'avant la premiere
    // publication. Un caret sur `0.0.x` est le plus etroit de tous : `^0.0.0`
    // ne correspond qu'a `0.0.0`. Chaque projet echafaude echouait donc a
    // l'installation, sur une erreur de resolution que personne n'aurait
    // rattachee au gabarit.
    const cible = await mkdtemp(join(tmpdir(), 'odoro-versions-'))

    try {
      await scaffold({
        target: cible,
        template: 'react-ts',
        packageName: 'essai',
        version: '1.2.3',
      })

      const manifeste = JSON.parse(
        await readFile(join(cible, 'package.json'), 'utf8'),
      ) as {
        dependencies: Record<string, string>
        devDependencies: Record<string, string>
      }

      expect(manifeste.dependencies['@odoro-cli/libs']).toBe('^1.2.3')
      expect(manifeste.devDependencies['odoro']).toBe('^1.2.3')

      // Ce qui n'est pas de la famille ne bouge pas.
      expect(manifeste.dependencies['react']).not.toContain('1.2.3')
    } finally {
      await rm(cible, { recursive: true, force: true })
    }
  })
})
