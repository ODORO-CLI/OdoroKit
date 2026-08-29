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
 *   node scripts/try-create.mjs <dossier> [--template react-ts|react-ts-express]
 *
 * Exemple :
 *
 *   node scripts/try-create.mjs ../essai-odoro --template react-ts-express
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

step('Compilation des paquets')
run('pnpm', ['--filter', '@odoro/libs', 'run', 'build'], ROOT)
run('pnpm', ['--filter', 'odoro', 'run', 'build'], ROOT)

step('Empaquetage, comme a la publication')
run('npm', ['pack', '--pack-destination', archives], join(ROOT, 'packages', 'odoro-libs'))
run('npm', ['pack', '--pack-destination', archives], join(ROOT, 'packages', 'odoro'))

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
manifest.dependencies['@odoro/libs'] =
  `file:${join(archives, `odoro-libs-${version}.tgz`)}`
manifest.devDependencies['odoro'] = `file:${join(archives, `odoro-${version}.tgz`)}`
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
