/**
 * Integration test of the whole chain.
 *
 * It simulates nothing: it really packs both packages, scaffolds a project in a
 * temporary directory, installs its dependencies from the archives, then
 * builds. It is the only level of test able to catch an error in a `files`
 * field, in `exports` or in resolution — precisely the errors that are
 * otherwise only discovered after publication.
 *
 * It is skipped by default: it installs a full dependency tree and takes
 * several dozen seconds. To run it:
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
// The directory, not the published name: moving to a scope displaced no file.
const LIBS = resolve(ENGINE, '..', 'odoro-libs')

/** Runs a command, failing loudly when it exits with an error. */
function exec(command: string, args: readonly string[], cwd: string): string {
  return execFileSync(command, [...args], {
    cwd,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: process.platform === 'win32',
  })
}

describe.runIf(ENABLED)('whole chain: packing, scaffolding, building', () => {
  let workspace: string
  let project: string

  beforeAll(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-integration-'))

    // Both packages are built then packed as they would be at publication: the
    // `files` field is therefore really put to the test.
    exec('pnpm', ['run', 'build'], LIBS)
    exec('pnpm', ['run', 'build'], ENGINE)
    exec('npm', ['pack', '--pack-destination', workspace], LIBS)
    exec('npm', ['pack', '--pack-destination', workspace], ENGINE)

    /**
     * The name and the version come **from the manifest of each package**.
     *
     * Assuming them identical worked as long as a single version circulated. A
     * fix published on the CLI alone separated them, and the test looked for a
     * `libs` archive carrying the CLI number — which does not exist, and has no
     * reason to exist.
     */
    const archiveOf = (root: string): string => {
      const { name, version } = JSON.parse(
        readFileSync(join(root, 'package.json'), 'utf8'),
      ) as { name: string; version: string }
      // `npm pack` names the archive after the published name: the at sign is
      // dropped and the slash becomes a dash.
      return `file:../${name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
    }

    exec(
      'node',
      [
        join(ENGINE, 'dist', 'cli.js'),
        'create',
        'tested-project',
        '--template',
        'react-ts',
        '--yes',
        '--no-install',
        '--no-git',
      ],
      workspace,
    )

    project = join(workspace, 'tested-project')

    // The local archives replace the published versions.
    const manifestPath = join(project, 'package.json')
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }
    manifest.dependencies['@odoro-cli/libs'] = archiveOf(LIBS)
    manifest.devDependencies['odoro'] = archiveOf(ENGINE)
    writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

    exec('npm', ['install', '--no-audit', '--no-fund'], project)
  }, 300_000)

  afterAll(async () => {
    if (workspace !== undefined) await rm(workspace, { recursive: true, force: true })
  })

  it('scaffolds a complete project', () => {
    for (const file of [
      'index.html',
      'package.json',
      'src/main.tsx',
      'odoro.config.ts',
    ]) {
      expect(existsSync(join(project, file))).toBe(true)
    }
  })

  it('restores the .gitignore file', () => {
    // npm would rename `.gitignore` to `.npmignore` at publication: the
    // template stores it as `_gitignore`. This test checks the detour.
    expect(existsSync(join(project, '.gitignore'))).toBe(true)
    expect(existsSync(join(project, '_gitignore'))).toBe(false)
  })

  it('passes the type check', () => {
    expect(() => exec('npx', ['tsc', '--noEmit'], project)).not.toThrow()
  }, 120_000)

  it('builds for production', () => {
    exec('npx', ['odoro', 'build'], project)

    const html = readFileSync(join(project, 'dist', 'index.html'), 'utf8')
    expect(html).toMatch(
      /<script type="module" crossorigin src="\/assets\/main-\w+\.js">/,
    )
    expect(html).toMatch(/<link rel="stylesheet" href="\/assets\/main-\w+\.css">/)
    // The files of the public directory are copied as they are.
    expect(existsSync(join(project, 'dist', 'favicon.svg'))).toBe(true)
  }, 120_000)
})
