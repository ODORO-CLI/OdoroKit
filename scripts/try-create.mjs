/**
 * Cree un vrai projet a partir des paquets du depot, sans rien publier.
 *
 * Les paquets ne sont pas encore sur npm : un projet echafaude ne peut donc
 * pas resoudre `odoro` ni `@odoro/libs`. Ce script fait le detour complet —
 * compilation, empaquetage, echafaudage, reecriture des dependances vers les
 * archives locales, installation — pour qu'un essai reel tienne en une
 * commande.
 *
 * Usage :
 *
 *   node scripts/try-create.mjs <dossier> [--template react-ts|react-ts-server]
 *
 * Exemple :
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

/** Execute une commande en laissant sa sortie visible. */
function run(command, commandArgs, cwd) {
  execFileSync(command, commandArgs, {
    cwd,
    stdio: 'inherit',
    shell: process.platform === 'win32',
  })
}

/** Affiche une etape. */
function step(message) {
  process.stdout.write(`\n\u001b[35m→\u001b[0m ${message}\n`)
}

const version = JSON.parse(
  readFileSync(join(ROOT, 'packages', 'odoro', 'package.json'), 'utf8'),
).version

const archives = join(ROOT, 'node_modules', '.odoro-archives')
mkdirSync(archives, { recursive: true })

/**
 * Les paquets a empaqueter, par template.
 *
 * Le nom publie et le dossier different depuis le passage au scope : `npm pack`
 * nomme l'archive d'apres le premier — `@odoro/libs` donne
 * `odoro-libs-0.0.0.tgz` — mais le dossier, lui, n'a pas bouge.
 */
const PACKAGES = [
  { name: '@odoro/libs', folder: 'odoro-libs', field: 'dependencies' },
  { name: 'odoro', folder: 'odoro', field: 'devDependencies' },
  ...(template === 'react-ts-server'
    ? [{ name: '@odoro/server', folder: 'odoro-server', field: 'dependencies' }]
    : []),
]

step('Compilation des paquets')
for (const pkg of PACKAGES) run('pnpm', ['--filter', pkg.name, 'run', 'build'], ROOT)

step('Empaquetage, comme a la publication')
for (const pkg of PACKAGES) {
  run('npm', ['pack', '--pack-destination', archives], join(ROOT, 'packages', pkg.folder))
}

step(`Echafaudage du template "${template}" dans ${target}`)
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

step('Substitution des dependances par les archives locales')
const manifestPath = join(target, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
for (const pkg of PACKAGES) {
  // `npm pack` nomme l'archive d'apres le nom publie : l'arobase tombe et le
  // slash devient un tiret.
  const archive = `${pkg.name.replace(/^@/, '').replace('/', '-')}-${version}.tgz`
  manifest[pkg.field][pkg.name] = `file:${join(archives, archive)}`
}
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

step('Installation')
// npm plutot que pnpm : les archives locales y sont copiees, pas liees, ce qui
// reproduit fidelement ce que recevra un utilisateur final.
run('npm', ['install', '--no-audit', '--no-fund'], target)

const scripts = existsSync(join(target, 'scripts', 'dev.mjs'))
  ? [
      'npm run dev',
      '  client sur http://localhost:5180, serveur sur http://localhost:3001',
    ]
  : ['npm run dev', '  http://localhost:5180']

process.stdout.write(
  [
    '',
    '\u001b[32mProjet pret.\u001b[0m',
    '',
    `  cd ${target}`,
    `  ${scripts[0]}`,
    `  ${scripts[1]}`,
    '',
    '  npm run build && npm run preview   pour verifier la compilation',
    '',
  ].join('\n'),
)
