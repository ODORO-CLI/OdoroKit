/**
 * Test d'integration de la chaine complete.
 *
 * Il ne simule rien : il empaquette reellement les deux paquets, echafaude un
 * projet dans un dossier temporaire, installe ses dependances depuis les
 * archives, puis compile. C'est le seul niveau de test capable d'attraper une
 * erreur de champ `files`, d'`exports` ou de resolution — precisement les
 * erreurs qu'on ne decouvre autrement qu'apres publication.
 *
 * Il est ignore par defaut : il installe un arbre de dependances complet et
 * prend plusieurs dizaines de secondes. Pour le lancer :
 *
 * ```bash
 * ODORO_INTEGRATION=1 pnpm --filter odoro test
 * ```
 *
 * @module
 */

import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { afterAll, beforeAll, describe, expect, it } from 'vitest'

const ENABLED = process.env['ODORO_INTEGRATION'] === '1'

const HERE = dirname(fileURLToPath(import.meta.url))
const ENGINE = resolve(HERE, '..')
const LIBS = resolve(ENGINE, '..', 'odoro-libs')

/** Execute une commande en echouant bruyamment si elle sort en erreur. */
function exec(command: string, args: readonly string[], cwd: string): string {
  return execFileSync(command, [...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
}

describe.runIf(ENABLED)('chaine complete : empaquetage, echafaudage, compilation', () => {
  let workspace: string
  let project: string

  beforeAll(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-integration-'))

    // Les deux paquets sont compiles puis empaquetes comme ils le seraient a
    // la publication : le champ `files` est donc reellement mis a l'epreuve.
    exec('pnpm', ['run', 'build'], LIBS)
    exec('pnpm', ['run', 'build'], ENGINE)
    exec('npm', ['pack', '--pack-destination', workspace], LIBS)
    exec('npm', ['pack', '--pack-destination', workspace], ENGINE)

    const version = (
      JSON.parse(readFileSync(join(ENGINE, 'package.json'), 'utf8')) as {
        version: string
      }
    ).version

    exec(
      'node',
      [
        join(ENGINE, 'dist', 'cli.js'),
        'create',
        'projet-teste',
        '--template',
        'react-ts',
        '--yes',
        '--no-install',
        '--no-git',
      ],
      workspace,
    )

    project = join(workspace, 'projet-teste')

    // Les archives locales remplacent les versions publiees.
    const manifestPath = join(project, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }
    manifest.dependencies['odoro-libs'] = `file:../odoro-libs-${version}.tgz`
    manifest.devDependencies['odoro'] = `file:../odoro-${version}.tgz`
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    exec('npm', ['install', '--no-audit', '--no-fund'], project)
  }, 300_000)

  afterAll(async () => {
    if (workspace !== undefined) await rm(workspace, { recursive: true, force: true })
  })

  it('echafaude un projet complet', () => {
    for (const file of [
      'index.html',
      'package.json',
      'src/main.tsx',
      'odoro.config.ts',
    ]) {
      expect(existsSync(join(project, file))).toBe(true)
    }
  })

  it('restitue le fichier .gitignore', () => {
    // npm renommerait `.gitignore` en `.npmignore` a la publication : le
    // template le stocke sous `_gitignore`. Ce test verifie le detour.
    expect(existsSync(join(project, '.gitignore'))).toBe(true)
    expect(existsSync(join(project, '_gitignore'))).toBe(false)
  })

  it('passe la verification de types', () => {
    expect(() => exec('npx', ['tsc', '--noEmit'], project)).not.toThrow()
  }, 120_000)

  it('compile pour la production', () => {
    exec('npx', ['odoro', 'build'], project)

    const html = readFileSync(join(project, 'dist', 'index.html'), 'utf8')
    expect(html).toMatch(
      /<script type="module" crossorigin src="\/assets\/main-\w+\.js">/,
    )
    expect(html).toMatch(/<link rel="stylesheet" href="\/assets\/main-\w+\.css">/)
    // Les fichiers du dossier public sont copies tels quels.
    expect(existsSync(join(project, 'dist', 'favicon.svg'))).toBe(true)
  }, 120_000)
})
