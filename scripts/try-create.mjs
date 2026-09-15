/**
 * Creates a real project from the packages of the repository, without
 * publishing anything.
 *
 * The packages are not on npm yet: a scaffolded project therefore cannot
 * resolve `odoro` nor `@odoro-cli/libs`. This script takes the full detour —
 * build, packing, scaffolding, rewriting of the dependencies towards the local
 * archives, install — so that a real trial fits in one command.
 *
 * Usage:
 *
 *   node scripts/try-create.mjs <folder> [--template react-ts|react-ts-server]
 *
 * Example:
 *
 *   node scripts/try-create.mjs ../essai-odoro --template react-ts-server
 */

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')

const args = process.argv.slice(2)
const target = resolve(
  process.cwd(),
  args.find((arg) => !arg.startsWith('--')) ?? 'essai-odoro',
)

const templateIndex = args.indexOf('--template')
const template = templateIndex >= 0 ? (args[templateIndex + 1] ?? 'react-ts') : 'react-ts'

/** Runs a command, leaving its output visible. */
function run(command, commandArgs, cwd) {
  execFileSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

/** Prints a step. */
function step(message) {
  process.stdout.write(`\n[35m→[0m ${message}\n`)
}

const version = JSON.parse(
  readFileSync(join(ROOT, 'packages', 'odoro', 'package.json'), 'utf8'),
).version

const archives = join(ROOT, 'node_modules', '.odoro-archives')
mkdirSync(archives, { recursive: true })

/**
 * The packages to pack, by template.
 *
 * The published name and the folder differ since the move to the scope: `npm
 * pack` names the archive after the first — `@odoro-cli/libs` gives
 * `odoro-libs-0.0.0.tgz` — but the folder itself has not moved.
 */
const PACKAGES = [
  { name: '@odoro-cli/libs', folder: 'odoro-libs', field: 'dependencies' },
  { name: 'odoro', folder: 'odoro', field: 'devDependencies' },
  ...(template === 'react-ts-server'
    ? [{ name: '@odoro-cli/server', folder: 'odoro-server', field: 'dependencies' }]
    : []),
]

step('Building the packages')
for (const pkg of PACKAGES) run('pnpm', ['--filter', pkg.name, 'run', 'build'], ROOT)

step('Packing, as at publication time')
for (const pkg of PACKAGES) {
  run('npm', ['pack', '--pack-destination', archives], join(ROOT, 'packages', pkg.folder))
}

step(`Scaffolding the "${template}" template into ${target}`)
mkdirSync(dirname(target), { recursive: true })
run(
  'node',
  [
    join(ROOT, 'packages', 'odoro', 'dist', 'cli.js'),
    'create',
    basename(target),
    '--template',
    template,
    '--yes',
    '--no-install',
    '--no-git',
    '--overwrite',
  ],
  dirname(target),
)

step('Substituting the dependencies with the local archives')
const manifestPath = join(target, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
for (const pkg of PACKAGES) {
  // `npm pack` names the archive after the published name: the at sign drops
  // and the slash becomes a dash.
  const archive = `${pkg.name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
  manifest[pkg.field][pkg.name] = `file:${join(archives, archive)}`
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

step('Install')
// npm rather than pnpm: local archives are copied there, not linked, which
// faithfully reproduces what an end user will receive.
run('npm', ['install', '--no-audit', '--no-fund'], target)

const scripts = existsSync(join(target, 'scripts', 'dev.mjs'))
  ? ['npm run dev', '  client on http://localhost:5180, server on http://localhost:3001']
  : ['npm run dev', '  http://localhost:5180']

process.stdout.write(
  [
    '',
    '[32mProject ready.[0m',
    '',
    `  cd ${target}`,
    `  ${scripts[0]}`,
    `  ${scripts[1]}`,
    '',
    '  npm run build && npm run preview   to check the build',
    '',
  ].join('\n'),
)
